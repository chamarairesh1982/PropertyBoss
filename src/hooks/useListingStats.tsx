import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';
import type { Database } from '../types/supabase';

type Stat = Database['public']['Tables']['listing_stats']['Row'] & {
  property?: { title: string | null };
};

export function useListingStats() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['listing-stats', user?.id],
    queryFn: async () => {
      if (!user) return [] as Stat[];
      const { data, error } = await supabase
        .from('listing_stats')
        .select('*, property:property_id!inner(title, agent_id)')
        .eq('property.agent_id', user.id);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!user,
  });
}
