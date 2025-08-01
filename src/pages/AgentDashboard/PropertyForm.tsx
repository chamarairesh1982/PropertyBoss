import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabaseClient';

interface RouteParams {
  id?: string;
}

/**
 * Form for creating or editing a property listing.  When an `id` is present
 * in the route parameters the form loads the existing record and updates it on
 * submission.  Otherwise it creates a new record.  Only basic fields are
 * supported here; uploading images can be added later via the dashboard.
 */
export default function PropertyForm() {
  const { id } = useParams<RouteParams>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const editing = Boolean(id);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: 0,
    bedrooms: 0,
    bathrooms: 0,
    property_type: 'house',
    listing_type: 'sale',
    status: 'available',
    address: '',
    city: '',
    postcode: '',
    floor_area: 0,
    epc_rating: '',
    property_age: 0,
    tenure: 'freehold',
    amenities: '', // comma separated string
  });
  const [floorPlan, setFloorPlan] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);

  // Load existing property if editing
  useEffect(() => {
    if (editing && id) {
      setLoading(true);
      supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data, error }) => {
          setLoading(false);
          if (error) {
            setError(error.message);
          } else if (data) {
            setForm({
              title: data.title ?? '',
              description: data.description ?? '',
              price: data.price ?? 0,
              bedrooms: data.bedrooms ?? 0,
              bathrooms: data.bathrooms ?? 0,
              property_type: data.property_type ?? 'house',
              listing_type: data.listing_type ?? 'sale',
              status: data.status ?? 'available',
              address: data.address ?? '',
              city: data.city ?? '',
              postcode: data.postcode ?? '',
              floor_area: data.floor_area ?? 0,
              epc_rating: data.epc_rating ?? '',
              property_age: data.property_age ?? 0,
              tenure: data.tenure ?? 'freehold',
              amenities: (data.amenities || []).join(','),
            });
          }
        });
    }
  }, [editing, id]);

  if (!user || user.role !== 'agent') {
    return <p>You must be an agent to manage listings.</p>;
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === 'price' ||
        name === 'bedrooms' ||
        name === 'bathrooms' ||
        name === 'floor_area' ||
        name === 'property_age'
          ? Number(value)
          : value,
    }));
  }

  async function uploadMedia(propertyId: string) {
    const bucket = supabase.storage.from('property-media');
    for (const file of photos) {
      const path = `${propertyId}/photo-${Date.now()}-${file.name}`;
      const { error } = await bucket.upload(path, file);
      if (!error) {
        const url = bucket.getPublicUrl(path).data.publicUrl;
        await supabase.from('property_media').insert({
          property_id: propertyId,
          url,
          type: 'photo',
        });
      }
    }
    if (floorPlan) {
      const path = `${propertyId}/floor-${Date.now()}-${floorPlan.name}`;
      const { error } = await bucket.upload(path, floorPlan);
      if (!error) {
        const url = bucket.getPublicUrl(path).data.publicUrl;
        await supabase.from('property_media').insert({
          property_id: propertyId,
          url,
          type: 'floor_plan',
        });
      }
    }
    if (video) {
      const path = `${propertyId}/video-${Date.now()}-${video.name}`;
      const { error } = await bucket.upload(path, video);
      if (!error) {
        const url = bucket.getPublicUrl(path).data.publicUrl;
        await supabase.from('property_media').insert({
          property_id: propertyId,
          url,
          type: 'video',
        });
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const payload: Record<string, unknown> = {
      ...form,
      amenities: form.amenities
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };
    if (editing && id) {
      const { error } = await supabase
        .from('properties')
        .update(payload)
        .eq('id', id)
        .select('id')
        .single();
      if (error) {
        setLoading(false);
        setError(error.message);
        return;
      }
      await uploadMedia(id);
      setLoading(false);
      navigate('/agent');
    } else {
      const { data, error } = await supabase
        .from('properties')
        .insert({
          ...payload,
          agent_id: user.id,
        })
        .select('id')
        .single();
      if (error || !data) {
        setLoading(false);
        setError(error?.message || 'Failed to create');
        return;
      }
      await uploadMedia(data.id);
      setLoading(false);
      navigate('/agent');
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        {editing ? 'Edit property' : 'New property'}
      </h2>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      {loading && <p className="mb-2">Loading…</p>}
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="title">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
            rows={4}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="price">
              Price (£)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={form.price}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="listing_type">
              Listing type
            </label>
            <select
              id="listing_type"
              name="listing_type"
              value={form.listing_type}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
            >
              <option value="sale">Sale</option>
              <option value="rent">Rent</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
            >
              <option value="available">Available</option>
              <option value="sold">Sold</option>
              <option value="let">Let</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="bedrooms">
              Bedrooms
            </label>
            <input
              type="number"
              id="bedrooms"
              name="bedrooms"
              value={form.bedrooms}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
              min={0}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="bathrooms">
              Bathrooms
            </label>
            <input
              type="number"
              id="bathrooms"
              name="bathrooms"
              value={form.bathrooms}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
              min={0}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="property_type">
            Property type
          </label>
          <select
            id="property_type"
            name="property_type"
            value={form.property_type}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
          >
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="bungalow">Bungalow</option>
            <option value="studio">Studio</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="address">
            Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            value={form.address}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="city">
              City
            </label>
            <input
              type="text"
              id="city"
              name="city"
              value={form.city}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="postcode">
              Postcode
            </label>
            <input
              type="text"
              id="postcode"
              name="postcode"
              value={form.postcode}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="floor_area">
              Floor area (m²)
            </label>
            <input
              type="number"
              id="floor_area"
              name="floor_area"
              value={form.floor_area}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
              min={0}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="epc_rating">
              EPC rating
            </label>
            <input
              type="text"
              id="epc_rating"
              name="epc_rating"
              value={form.epc_rating}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="property_age">
              Property age (years)
            </label>
            <input
              type="number"
              id="property_age"
              name="property_age"
              value={form.property_age}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
              min={0}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700" htmlFor="tenure">
              Tenure
            </label>
            <select
              id="tenure"
              name="tenure"
              value={form.tenure}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
            >
              <option value="freehold">Freehold</option>
              <option value="leasehold">Leasehold</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="amenities">
            Amenities (comma separated)
          </label>
          <input
            type="text"
            id="amenities"
            name="amenities"
            value={form.amenities}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="photos">
            Property photos
          </label>
          <input
            type="file"
            id="photos"
            multiple
            onChange={(e) => setPhotos(Array.from(e.target.files ?? []))}
            className="mt-1 block w-full text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="floor_plan">
            Floor plan
          </label>
          <input
            type="file"
            id="floor_plan"
            onChange={(e) => setFloorPlan(e.target.files?.[0] || null)}
            className="mt-1 block w-full text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="video">
            Virtual tour video
          </label>
          <input
            type="file"
            id="video"
            onChange={(e) => setVideo(e.target.files?.[0] || null)}
            className="mt-1 block w-full text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving…' : 'Save'}
        </button>
      </form>
    </div>
  );
}