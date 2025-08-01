import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import type { Database } from '../types/db';

export function useCompareProperties(ids: string[]) {
  return useQuery<Database['public']['Tables']['properties']['Row'][]>({
    queryKey: ['compare', ids],
    queryFn: async () => {
      if (ids.length === 0) return [];
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .in('id', ids);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: ids.length > 0,
  });
}
