import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

export function useNearby(lat: number | null, lon: number | null) {
  return useQuery({
    queryKey: ['nearby', lat, lon],
    queryFn: async () => {
      if (lat == null || lon == null) return [] as string[];
      const { data, error } = await supabase.functions.invoke('nearby', {
        body: { lat, lon },
      });
      if (error) throw new Error(error.message);
      return (data as { results: string[] }).results;
    },
    enabled: lat != null && lon != null,
  });
}
