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
      className="relative bg-background rounded-lg shadow hover:shadow-lg transform hover:scale-[1.02] transition overflow-hidden flex flex-col"
    >
      {firstImage ? (
        <div className="relative">
          <img
            src={firstImage.url}
            alt={property.title}
            className="h-48 w-full object-cover"
          />
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent text-background p-sm text-sm">
            <div className="font-semibold">
              {property.listing_type === 'rent'
                ? `£${property.price.toLocaleString()}/mo`
                : `£${property.price.toLocaleString()}`}
            </div>
            <div>
              {property.bedrooms} bd • {property.bathrooms} ba
            </div>
          </div>
        </div>
      ) : (
        <div className="h-48 w-full bg-surface flex items-center justify-center text-secondary">
          No image
        </div>
      )}
      <div className="p-md flex-1 flex flex-col">
        <h3 className="text-lg font-semibold mb-xs truncate">
          {property.title}
        </h3>
        <p className="text-sm text-secondary mb-sm truncate">
          {property.city || property.address || '—'}
        </p>
        <div className="mt-auto flex items-center justify-end">
          {user && (
            <div className="flex gap-sm">
              <button
                onClick={handleToggle}
                className="p-sm rounded-full hover:bg-surface"
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
                className="p-sm rounded-full hover:bg-surface"
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
