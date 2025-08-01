import type { Database } from '../types/supabase';
import PropertyCard from './PropertyCard';

type PropertyWithImages = Database['public']['Tables']['properties']['Row'] & {
  property_images?: { url: string; ord: number | null }[];
};

interface Props {
  properties: PropertyWithImages[];
}

/**
 * Grid display of a list of properties.  Delegates individual item rendering
 * to the `PropertyCard` component.
 */
export default function PropertyList({ properties }: Props) {
  if (!properties || properties.length === 0) {
    return <p className="p-4 text-gray-500">No properties found.</p>;
  }
  return (
    <div className="grid gap-6 p-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {properties.map((p) => (
        <PropertyCard key={p.id} property={p} />
      ))}
    </div>
  );
}