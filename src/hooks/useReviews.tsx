import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';
import type { Database } from '../types/supabase';

type Review = Database['public']['Tables']['reviews']['Row'] & {
  profiles?: { full_name: string | null; avatar_url: string | null };
};

export function useReviews(propertyId: string | null) {
  return useQuery({
    queryKey: ['reviews', propertyId],
    queryFn: async () => {
      if (!propertyId) return [] as Review[];
      const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles!inner(full_name, avatar_url)')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!propertyId,
  });
}

export function useAddReview(propertyId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation(
    async (payload: { rating: number; comment: string }) => {
      if (!user) throw new Error('Must be signed in');
      const { error } = await supabase.from('reviews').insert({
        property_id: propertyId,
        user_id: user.id,
        rating: payload.rating,
        comment: payload.comment,
      });
      if (error) throw new Error(error.message);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['reviews', propertyId] });
      },
    },
  );
}

export function useDeleteReview(propertyId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation(
    async (id: string) => {
      if (!user) throw new Error('Must be signed in');
      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw new Error(error.message);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['reviews', propertyId] });
      },
    },
  );
}
