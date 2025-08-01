import { ChangeEvent } from 'react';
import type { PropertyFilters } from '../hooks/useProperties';

interface Props {
  filters: PropertyFilters;
  onChange: (filters: PropertyFilters) => void;
}

/**
 * A form for filtering property listings.  Each input updates the parent
 * component's filter state via the `onChange` prop.  The form uses basic
 * Tailwind styles and is mobile friendly.
 */
export default function PropertyFilter({ filters, onChange }: Props) {
  function handleInput(
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = e.target;
    // Convert numeric fields to numbers.  Empty strings become undefined.
    let parsed: string | number | undefined = value;
    if (
      [
        'minPrice',
        'maxPrice',
        'bedrooms',
        'bathrooms',
        'addedSince',
        'minFloorArea',
        'maxFloorArea',
        'minAge',
        'maxAge',
        'radiusMiles',
      ].includes(name)
    ) {
      parsed = value === '' ? undefined : Number(value);
    }
    onChange({ ...filters, [name]: parsed });
  }

  return (
    <form className="space-y-4 p-4 bg-white shadow rounded-lg mb-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="city">
            Location / City
          </label>
          <input
            id="city"
            name="city"
            value={filters.city ?? ''}
            onChange={handleInput}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            placeholder="e.g. Sutton"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="minPrice">
            Min price (£)
          </label>
          <input
            type="number"
            id="minPrice"
            name="minPrice"
            value={filters.minPrice ?? ''}
            onChange={handleInput}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            placeholder="0"
            min={0}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="maxPrice">
            Max price (£)
          </label>
          <input
            type="number"
            id="maxPrice"
            name="maxPrice"
            value={filters.maxPrice ?? ''}
            onChange={handleInput}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            placeholder="any"
            min={0}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="bedrooms">
            Bedrooms
          </label>
          <input
            type="number"
            id="bedrooms"
            name="bedrooms"
            value={filters.bedrooms ?? ''}
            onChange={handleInput}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
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
            value={filters.bathrooms ?? ''}
            onChange={handleInput}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            min={0}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="propertyType">
            Property type
          </label>
          <select
            id="propertyType"
            name="propertyType"
            value={filters.propertyType ?? ''}
            onChange={handleInput}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          >
            <option value="">Any</option>
            <option value="house">House</option>
            <option value="apartment">Apartment</option>
            <option value="bungalow">Bungalow</option>
            <option value="studio">Studio</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="listingType">
            Listing type
          </label>
          <select
            id="listingType"
            name="listingType"
            value={filters.listingType ?? ''}
            onChange={handleInput}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          >
            <option value="">Any</option>
            <option value="sale">For Sale</option>
            <option value="rent">To Rent</option>
          </select>
        </div>
        <div className="flex items-center space-x-2 mt-6">
          <input
            type="checkbox"
            id="hasPhoto"
            name="hasPhoto"
            checked={filters.hasPhoto ?? false}
            onChange={(e) => onChange({ ...filters, hasPhoto: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="hasPhoto" className="text-sm text-gray-700">
            Has photo
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="keywords">
            Keywords
          </label>
          <input
            type="text"
            id="keywords"
            name="keywords"
            value={filters.keywords ?? ''}
            onChange={handleInput}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            placeholder="garden, parking..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="minFloorArea">
            Min floor area (m²)
          </label>
          <input
            type="number"
            id="minFloorArea"
            name="minFloorArea"
            value={filters.minFloorArea ?? ''}
            onChange={handleInput}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            min={0}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="maxFloorArea">
            Max floor area (m²)
          </label>
          <input
            type="number"
            id="maxFloorArea"
            name="maxFloorArea"
            value={filters.maxFloorArea ?? ''}
            onChange={handleInput}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            min={0}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="minAge">
            Min age (years)
          </label>
          <input
            type="number"
            id="minAge"
            name="minAge"
            value={filters.minAge ?? ''}
            onChange={handleInput}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            min={0}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="maxAge">
            Max age (years)
          </label>
          <input
            type="number"
            id="maxAge"
            name="maxAge"
            value={filters.maxAge ?? ''}
            onChange={handleInput}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            min={0}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="energyRating">
            Energy rating
          </label>
          <input
            type="text"
            id="energyRating"
            name="energyRating"
            value={filters.energyRating ?? ''}
            onChange={handleInput}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="tenure">
            Tenure
          </label>
          <select
            id="tenure"
            name="tenure"
            value={filters.tenure ?? ''}
            onChange={handleInput}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          >
            <option value="">Any</option>
            <option value="freehold">Freehold</option>
            <option value="leasehold">Leasehold</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="postcode">
            Postcode
          </label>
          <input
            type="text"
            id="postcode"
            name="postcode"
            value={filters.postcode ?? ''}
            onChange={handleInput}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="radiusMiles">
            Radius (miles)
          </label>
          <input
            type="number"
            id="radiusMiles"
            name="radiusMiles"
            value={filters.radiusMiles ?? ''}
            onChange={handleInput}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            min={0}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700" htmlFor="addedSince">
            Added since (days)
          </label>
          <input
            type="number"
            id="addedSince"
            name="addedSince"
            value={filters.addedSince ?? ''}
            onChange={handleInput}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            placeholder="7"
            min={0}
          />
        </div>
      </div>
    </form>
  );
}