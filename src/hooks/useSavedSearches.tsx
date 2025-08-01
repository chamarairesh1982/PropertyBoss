import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';
import type { PropertyFilters } from './useProperties';

export function useSavedSearches() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['saved_searches', user?.id],
      queryFn: async () => {
        if (!user) return [] as PropertyFilters[];
        const { data, error } = await supabase
          .from('saved_searches')
          .select('*')
          .eq('user_id', user.id);
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!user,
  });
}

export function useSaveSearch() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation(
    async (criteria: PropertyFilters) => {
      if (!user) throw new Error('Must be signed in');
      const { error } = await supabase
        .from('saved_searches')
        .insert({ user_id: user.id, criteria });
      if (error) throw new Error(error.message);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['saved_searches'] });
      },
    },
  );
}
