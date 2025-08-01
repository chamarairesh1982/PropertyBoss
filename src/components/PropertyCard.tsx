import { Link } from 'react-router-dom';
import { useFavorites, useToggleFavorite } from '../hooks/useFavorites';
import { useAuth } from '../hooks/useAuth';
import { useComparison } from '../hooks/useComparison';
import { useQueryClient } from '@tanstack/react-query';
import type { Database } from '../types/supabase';
import { fetchProperty } from '../hooks/useProperty';

type Property = Database['public']['Tables']['properties']['Row'] & {
  property_media?: { url: string; type: string; ord: number | null }[];
};

interface Props {
  property: Property;
}

/**
 * Renders a card summarising a single property.  Displays the first photo
 * (if available), price, basic details and a favourite toggle.  Clicking on
 * the card navigates to the property detail page.
 */
export default function PropertyCard({ property }: Props) {
  const { user } = useAuth();
  const { data: favourites } = useFavorites();
  const toggleFavourite = useToggleFavorite();
  const isFavourited = favourites?.includes(property.id);
  const { selected, toggle: toggleCompare } = useComparison();
  const inCompare = selected.includes(property.id);
  const queryClient = useQueryClient();

  function prefetch() {
    queryClient.prefetchQuery({
      queryKey: ['property', property.id],
      queryFn: () => fetchProperty(property.id),
    });
  }

  const firstImage =
    property.property_media?.find((m) => m.type === 'photo') || null;

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    if (!user) return;
    await toggleFavourite.mutateAsync(property.id);
  }

  function handleCompare(e: React.MouseEvent) {
    e.preventDefault();
    if (!user) return;
    toggleCompare(property.id);
  }

  return (
    <Link
      to={`/properties/${property.id}`}
      onMouseEnter={prefetch}
      onFocus={prefetch}
      className="bg-white rounded-lg shadow hover:shadow-md transition overflow-hidden flex flex-col"
    >
      {firstImage ? (
        <img
          src={firstImage.url}
          alt={property.title}
          className="h-48 w-full object-cover"
        />
      ) : (
        <div className="h-48 w-full bg-gray-200 flex items-center justify-center text-gray-400">
          No image
        </div>
      )}
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold mb-1 truncate">
          {property.title}
        </h3>
        <p className="text-sm text-gray-600 mb-2 truncate">
          {property.city || property.address || '—'}
        </p>
        <div className="mt-auto flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-blue-600">
              {property.listing_type === 'rent'
                ? `£${property.price.toLocaleString()}/mo`
                : `£${property.price.toLocaleString()}`}
            </span>
            <span className="text-sm text-gray-500 ml-2">
              {property.bedrooms} bd • {property.bathrooms} ba
            </span>
          </div>
          {user && (
            <div className="flex gap-2">
              <button
                onClick={handleToggle}
                className="p-2 rounded-full hover:bg-gray-100"
                title={
                  isFavourited ? 'Remove from favourites' : 'Save to favourites'
                }
              >
                {isFavourited ? (
                  <span role="img" aria-label="favourited">
                    ❤️
                  </span>
                ) : (
                  <span role="img" aria-label="not favourited">
                    🤍
                  </span>
                )}
              </button>
              <button
                onClick={handleCompare}
                className="p-2 rounded-full hover:bg-gray-100"
                title={
                  inCompare ? 'Remove from comparison' : 'Add to comparison'
                }
              >
                {inCompare ? '✓' : '≣'}
              </button>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
