import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';
import type { Database } from '../types/db';

export type FavoriteList = Database['public']['Tables']['favorite_lists']['Row'];

export function useFavoriteLists() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['favorite_lists', user?.id],
    queryFn: async () => {
      if (!user) return [] as FavoriteList[];
      const { data, error } = await supabase
        .from('favorite_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at');
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!user,
  });
}

export function useCreateFavoriteList() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation(
    async (name: string) => {
      if (!user) throw new Error('Must be signed in');
      const { error } = await supabase
        .from('favorite_lists')
        .insert({ user_id: user.id, name });
      if (error) throw new Error(error.message);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['favorite_lists'] });
      },
    },
  );
}

export function useAddPropertyToList() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ listId, propertyId }: { listId: string; propertyId: string }) => {
      const { error } = await supabase
        .from('favorite_list_items')
        .insert({ list_id: listId, property_id: propertyId });
      if (error) throw new Error(error.message);
    },
    {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({
          queryKey: ['list_items', variables.listId],
        });
      },
    },
  );
}

export function useListItems(listId: string | null) {
  return useQuery({
    queryKey: ['list_items', listId],
    queryFn: async () => {
      if (!listId) return [] as Database['public']['Tables']['properties']['Row'][];
      const { data, error } = await supabase
        .from('favorite_list_items')
        .select('property:properties(*)')
        .eq('list_id', listId);
      if (error) throw new Error(error.message);
      return data?.map((d) => d.property) ?? [];
    },
    enabled: !!listId,
  });
}
