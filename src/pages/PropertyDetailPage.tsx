import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { useProperties } from '../hooks/useProperties';
import { useNearby } from '../hooks/useNearby';
import PropertyList from '../components/PropertyList';
import LineChart from '../components/LineChart';

interface RouteParams {
  id: string;
}

/**
 * Detailed view of a single property.  Displays a gallery of images, full
 * description, amenities and a form for sending enquiries to the listing agent.
 * It also suggests similar listings based on city and property type.
 */
export default function PropertyDetailPage() {
  const { id } = useParams<RouteParams>();
  const { user } = useAuth();

  // Fetch property along with its images and agent profile.  We alias the
  // relationship to `agent` so that the returned object includes the agent's
  // full name and email.
  const {
    data: property,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select(
          `*, property_media!property_id(url, type, ord), agent:agent_id(full_name, email, id)`,
        )
        .eq('id', id)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
    enabled: !!id,
  });

  // Fetch price history for the property
  const { data: history } = useQuery({
    queryKey: ['price-history', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('price_history')
        .select('*')
        .eq('property_id', id)
        .order('recorded_at');
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!id,
  });

  // Prepare a query for similar properties once the current property is loaded.
  const { data: similar, isLoading: loadingSimilar } = useProperties(
    property
      ? {
        city: property.city ?? undefined,
        propertyType: property.property_type,
      }
      : {},
  );

  const { data: nearby } = useNearby(property?.latitude ?? null, property?.longitude ?? null);

  const [tab, setTab] = useState<'photos' | 'floor' | 'video'>('photos');

  // Mutation for sending a message to the agent.
  const sendMessage = useMutation(async (content: string) => {
    if (!user || !property) throw new Error('Must be signed in');
    await supabase.from('messages').insert({
      property_id: property.id,
      sender_id: user.id,
      receiver_id: property.agent?.id,
      content,
    });
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const content = formData.get('message')?.toString() ?? '';
    if (content.trim().length === 0) return;
    sendMessage.mutate(content);
    form.reset();
  }

  if (isLoading) {
    return <p className="p-4">Loading property…</p>;
  }
  if (error) {
    return (
      <p className="p-4 text-red-600">Failed to load property: {error.message}</p>
    );
  }
  if (!property) {
    return <p className="p-4">Property not found.</p>;
  }

  const media = property.property_media || [];
  const photos = media.filter((m) => m.type === 'photo');
  const floorPlans = media.filter((m) => m.type === 'floor_plan');
  const videos = media.filter((m) => m.type === 'video');
  const pricePerSqM = property.floor_area ? property.price / property.floor_area : null;

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-8">
      {/* Gallery */}
      <div>
        <div className="mb-2 space-x-4">
          <button
            className={tab === 'photos' ? 'font-semibold' : 'text-gray-600'}
            onClick={() => setTab('photos')}
          >
            Photos
          </button>
          {floorPlans.length > 0 && (
            <button
              className={tab === 'floor' ? 'font-semibold' : 'text-gray-600'}
              onClick={() => setTab('floor')}
            >
              Floor Plan
            </button>
          )}
          {videos.length > 0 && (
            <button
              className={tab === 'video' ? 'font-semibold' : 'text-gray-600'}
              onClick={() => setTab('video')}
            >
              Video
            </button>
          )}
        </div>
        {tab === 'photos' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {photos.length > 0 ? (
              photos.map((img) => (
                <img
                  key={img.url}
                  src={img.url}
                  alt={property.title}
                  className="w-full h-64 object-cover rounded"
                />
              ))
            ) : (
              <div className="col-span-full h-64 bg-gray-200 flex items-center justify-center rounded">
                No images available
              </div>
            )}
          </div>
        )}
        {tab === 'floor' && floorPlans[0] && (
          <img src={floorPlans[0].url} alt="Floor plan" className="w-full" />
        )}
        {tab === 'video' && videos[0] && (
          <video src={videos[0].url} controls className="w-full" />
        )}
      </div>
      {/* Main information */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{property.title}</h2>
        <p className="text-gray-600">
          {property.address}, {property.city} {property.postcode}
        </p>
        <div className="text-xl font-semibold text-blue-600">
          {property.listing_type === 'rent'
            ? `£${property.price.toLocaleString()}/mo`
            : `£${property.price.toLocaleString()}`}
        </div>
        <div className="text-gray-700">
          {property.bedrooms} bedrooms · {property.bathrooms} bathrooms ·{' '}
          {property.property_type}
        </div>
        {property.floor_area && (
          <div className="text-gray-700">Floor area: {property.floor_area} m²</div>
        )}
        {pricePerSqM && (
          <div className="text-gray-700">
            Price per m²: £{Math.round(pricePerSqM).toLocaleString()}
          </div>
        )}
        {property.epc_rating && (
          <div className="text-gray-700">EPC rating: {property.epc_rating}</div>
        )}
        {property.property_age != null && (
          <div className="text-gray-700">Age: {property.property_age} years</div>
        )}
        {property.tenure && (
          <div className="text-gray-700">Tenure: {property.tenure}</div>
        )}
        {property.amenities && property.amenities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {property.amenities.map((amenity) => (
              <span
                key={amenity}
                className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full"
              >
                {amenity}
              </span>
            ))}
          </div>
        )}
        {history && history.length > 0 && (
          <div>
            <h3 className="font-semibold mt-4">Price history</h3>
            <LineChart
              data={history.map((h) => ({ x: h.recorded_at!, y: h.price }))}
            />
          </div>
        )}
      </div>
      {/* Description */}
      {property.description && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Description</h3>
          <p className="whitespace-pre-line text-gray-800">
            {property.description}
          </p>
        </div>
      )}
      {nearby && nearby.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Nearby schools & amenities</h3>
          <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
            {nearby.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </div>
      )}
      {/* Contact form */}
      <div>
          <h3 className="text-lg font-semibold mb-2">Contact agent</h3>
          {user ? (
            <form onSubmit={handleSubmit} className="space-y-2 max-w-md">
              <textarea
                name="message"
                className="w-full h-32 border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Write a message to the agent..."
                required
              />
              <button
                type="submit"
                disabled={sendMessage.isLoading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {sendMessage.isLoading ? 'Sending…' : 'Send message'}
              </button>
              {sendMessage.isError && (
                <p className="text-red-600 text-sm">
                  {(sendMessage.error as Error).message}
                </p>
              )}
              {sendMessage.isSuccess && (
                <p className="text-green-700 text-sm">Message sent!</p>
              )}
            </form>
          ) : (
            <p>
              Please{' '}
              <Link to="/login" className="text-blue-600 underline">
                sign in
              </Link>{' '}
              to contact the agent.
            </p>
          )}
      </div>
      {/* Similar listings */}
      {similar && similar.length > 1 && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Similar listings</h3>
          {loadingSimilar ? (
            <p>Loading…</p>
          ) : (
            <PropertyList
              // filter out the current property from the similar list
              properties={similar.filter((p) => p.id !== property.id).slice(0, 4)}
            />
          )}
        </div>
      )}
    </div>
  );
}