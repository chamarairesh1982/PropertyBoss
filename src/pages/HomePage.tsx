import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import PropertyList from '../components/PropertyList';
import PropertyFilter from '../components/PropertyFilter';
import { useInfiniteProperties } from '../hooks/useProperties';
import type { PropertyFilters } from '../hooks/useProperties';
import { useSaveSearch } from '../hooks/useSavedSearches';
import { useAuth } from '../hooks/useAuth';

const PropertyMap = lazy(() => import('../components/PropertyMap'));

/**
 * Landing page for browsing and searching properties.  Maintains the current
 * set of filters in local state and invokes the `useProperties` hook to
 * retrieve matching records from the database.
 */
export default function HomePage() {
  const [filters, setFilters] = useState<PropertyFilters>({});
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteProperties(filters);
  const properties = data?.pages.flat() ?? [];
  const loader = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!loader.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });
    observer.observe(loader.current);
    return () => observer.disconnect();
  }, [loader, hasNextPage, fetchNextPage]);
  const { user } = useAuth();
  const saveSearch = useSaveSearch();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Find your next home</h1>
        <PropertyFilter filters={filters} onChange={setFilters} />
        {user && (
          <button
            onClick={() => saveSearch.mutate(filters)}
            className="mb-4 bg-blue-600 text-white px-3 py-1 rounded"
          >
            Save search
          </button>
        )}
        {isLoading && <p className="p-4">Loading properties…</p>}
        {error && <p className="p-4 text-red-600">Error: {error.message}</p>}
        {!isLoading && !error && properties && (
          <>
            <PropertyList properties={properties} />
            <div ref={loader} className="h-10" />
            {isFetchingNextPage && <p className="p-4">Loading more…</p>}
            <Suspense fallback={<p className="p-4">Loading map…</p>}>
              <PropertyMap properties={properties} />
            </Suspense>
          </>
        )}
      </div>
    </div>
  );
}
