import { useState } from 'react';
import PropertyList from '../components/PropertyList';
import PropertyFilter from '../components/PropertyFilter';
import { useProperties } from '../hooks/useProperties';
import type { PropertyFilters } from '../hooks/useProperties';

/**
 * Landing page for browsing and searching properties.  Maintains the current
 * set of filters in local state and invokes the `useProperties` hook to
 * retrieve matching records from the database.
 */
export default function HomePage() {
  const [filters, setFilters] = useState<PropertyFilters>({});
  const { data: properties, isLoading, error } = useProperties(filters);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Find your next home</h1>
        <PropertyFilter filters={filters} onChange={setFilters} />
        {isLoading && <p className="p-4">Loading properties…</p>}
        {error && (
          <p className="p-4 text-red-600">Error: {error.message}</p>
        )}
        {!isLoading && !error && properties && (
          <PropertyList properties={properties} />
        )}
      </div>
    </div>
  );
}