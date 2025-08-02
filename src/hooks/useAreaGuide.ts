import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';

export interface AreaGuide {
  averagePrice: number | null;
  demographics: Record<string, unknown>;
  amenities: string[];
}

export function useAreaGuide(area: string | null) {
  return useQuery({
    queryKey: ['area-guide', area],
    queryFn: async () => {
      if (!area) return null;
      const { data, error } = await supabase.functions.invoke('area-guide', {
        body: { area },
      });
      if (error) throw new Error(error.message);
      return data as AreaGuide;
    },
    enabled: !!area,
  });
}
