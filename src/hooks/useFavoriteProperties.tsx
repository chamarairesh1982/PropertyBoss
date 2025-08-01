import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';
import type { Database } from '../types/db';

type Property = Database['public']['Tables']['properties']['Row'];

export function useFavoriteProperties() {
  const { user } = useAuth();
  return useQuery<Property[]>({
    queryKey: ['favorite-properties', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('favorites')
        .select('property:properties(*)')
        .eq('user_id', user.id);
      if (error) throw new Error(error.message);
      return (
        (data as { property: Property }[] | null)?.map((row) => row.property) ??
        []
      );
    },
    enabled: !!user,
  });
}
