import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import PropertyList from '../components/PropertyList';
import PropertyFilter from '../components/PropertyFilter';
import PropertyCardSkeleton from '../components/PropertyCardSkeleton';
import { useInfiniteProperties } from '../hooks/useProperties';
import type { PropertyFilters } from '../hooks/useProperties';
import { useSaveSearch } from '../hooks/useSavedSearches';
import { useAuth } from '../hooks/useAuth';

const MapView = lazy(() => import('../components/MapView'));

/**
 * Landing page for browsing and searching properties.  Maintains the current
 * set of filters in local state and invokes the `useProperties` hook to
 * retrieve matching records from the database.
 */
export default function HomePage() {
  const location = useLocation();
  const [filters, setFilters] = useState<PropertyFilters>(
    (location.state as { filters?: PropertyFilters } | null)?.filters || {},
  );
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
  const [view, setView] = useState<'list' | 'map'>('list');

  useEffect(() => {
    const s = (location.state as { filters?: PropertyFilters } | null)?.filters;
    if (s) setFilters(s);
  }, [location.state]);

  useEffect(() => {
    if (view !== 'list' || !loader.current) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });
    observer.observe(loader.current);
    return () => observer.disconnect();
  }, [view, loader, hasNextPage, fetchNextPage]);
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
        <div className="flex justify-end mb-4 gap-2">
          <button
            onClick={() => setView('list')}
            className={`px-3 py-1 rounded border ${
              view === 'list' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setView('map')}
            className={`px-3 py-1 rounded border ${
              view === 'map' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600'
            }`}
          >
            Map View
          </button>
        </div>
        {isLoading && (
          <div className="grid gap-6 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        )}
        {error && <p className="p-4 text-red-600">Error: {error.message}</p>}
        {!isLoading && !error && properties && (
          <>
            {view === 'list' ? (
              <>
                <PropertyList properties={properties} />
                <div ref={loader} className="h-10" />
                {isFetchingNextPage && <p className="p-4">Loading more…</p>}
              </>
            ) : (
              <Suspense fallback={<p className="p-4">Loading map…</p>}>
                <MapView properties={properties} />
              </Suspense>
            )}
          </>
        )}
      </div>
    </div>
  );
}
