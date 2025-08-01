import { useComparison } from '../hooks/useComparison';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import type { Database } from '../types/db';

type PropertyRow = Database['public']['Tables']['properties']['Row'];

export default function ComparePage() {
  const { selected, clear } = useComparison();

  const { data, isLoading, error } = useQuery({
    queryKey: ['compare', selected],
    queryFn: async () => {
      if (selected.length === 0) return [] as PropertyRow[];
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .in('id', selected);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: selected.length > 0,
  });

  if (selected.length === 0) {
    return <p className="p-4">No properties selected for comparison.</p>;
  }
  if (isLoading) return <p className="p-4">Loading…</p>;
  if (error) return <p className="p-4 text-red-600">Error: {(error as Error).message}</p>;

  const rows: { label: string; get: (p: PropertyRow) => React.ReactNode }[] = [
    { label: 'Price', get: (p) => `£${p.price.toLocaleString()}` },
    { label: 'Bedrooms', get: (p) => p.bedrooms },
    { label: 'Bathrooms', get: (p) => p.bathrooms },
    { label: 'Type', get: (p) => p.property_type },
    { label: 'Listing', get: (p) => p.listing_type },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Comparison
        <button className="ml-4 text-sm text-blue-600 underline" onClick={clear}>
          Clear
        </button>
      </h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr>
              <th className="p-2 border" />
              {data!.map((p) => (
                <th key={p.id} className="p-2 border">
                  {p.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label}>
                <th className="p-2 border text-left font-medium">{row.label}</th>
                {data!.map((p) => (
                  <td key={p.id} className="p-2 border text-center">
                    {row.get(p)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
