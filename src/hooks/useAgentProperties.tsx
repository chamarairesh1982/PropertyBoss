import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';
import type { Database } from '../types/db';

type Property = Database['public']['Tables']['properties']['Row'] & {
  property_media: { url: string; type: string; ord: number | null }[];
};

export function useAgentProperties() {
  const { user } = useAuth();
  return useQuery<Property[]>({
    queryKey: ['agent-properties', user?.id],
    queryFn: async () => {
      if (!user) return [] as Property[];
      const { data, error } = await supabase
        .from('properties')
        .select('*, property_media!property_id(url, type, ord)')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as Property[];
    },
    enabled: !!user && user.role === 'agent',
  });
}
