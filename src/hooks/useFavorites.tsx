import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';

/**
 * Fetch the list of property IDs the current user has favourited.  This hook
 * depends on the authenticated user.  If no user is logged in, an empty
 * array is returned.
 */
export function useFavorites() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['favorites', user?.id],
    queryFn: async () => {
      if (!user) return [] as string[];
      const { data, error } = await supabase
        .from('favorites')
        .select('property_id')
        .eq('user_id', user.id);
      if (error) throw new Error(error.message);
      return data?.map((f) => f.property_id) ?? [];
    },
    enabled: !!user,
  });
}

/**
 * Hook that returns a function to toggle a property as a favourite.  When
 * toggled, the favourites query cache is invalidated so that consuming
 * components update automatically.
 */
export function useToggleFavorite() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation(
    async (propertyId: string) => {
      if (!user) throw new Error('Must be signed in');
      // Check whether this property is already a favourite.
      const { data: existing, error: fetchError } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', user.id)
        .eq('property_id', propertyId)
        .single();
      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 indicates no rows returned; treat as no favourite.
        throw new Error(fetchError.message);
      }
      if (existing) {
        // Remove favourite
        const { error: deleteError } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', propertyId);
        if (deleteError) throw new Error(deleteError.message);
        return false;
      } else {
        // Add favourite
        const { error: insertError } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, property_id: propertyId });
        if (insertError) throw new Error(insertError.message);
        return true;
      }
    },
    {
      // After mutation, invalidate the favourites query so UI updates.
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['favorites'] });
      },
    },
  );
}