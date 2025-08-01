import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import type { Database } from '../types/db';

export type PropertyWithMediaAndAgent =
  Database['public']['Tables']['properties']['Row'] & {
    property_media: { url: string; type: string; ord: number | null }[];
    agent: {
      full_name: string | null;
      email: string | null;
      id: string;
    } | null;
  };

export async function fetchProperty(id: string) {
  const { data, error } = await supabase
    .from('properties')
    .select(
      `*, property_media!property_id(url, type, ord), agent:agent_id(full_name, email, id)`,
    )
    .eq('id', id)
    .single();
  if (error) throw new Error(error.message);
  return data as PropertyWithMediaAndAgent;
}

export function useProperty(id: string | null) {
  return useQuery<PropertyWithMediaAndAgent | null>({
    queryKey: ['property', id],
    queryFn: () => (id ? fetchProperty(id) : Promise.resolve(null)),
    enabled: !!id,
  });
}

export function usePriceHistory(id: string | null) {
  return useQuery<Database['public']['Tables']['price_history']['Row'][]>({
    queryKey: ['price-history', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('price_history')
        .select('*')
        .eq('property_id', id)
        .order('recorded_at');
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!id,
  });
}

export function useSendMessage() {
  return useMutation(
    async ({
      propertyId,
      senderId,
      receiverId,
      content,
    }: {
      propertyId: string;
      senderId: string;
      receiverId: string;
      content: string;
    }) => {
      const res = await fetch('/functions/v1/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId,
          senderId,
          receiverId,
          content,
        }),
      });
      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error ?? 'Failed to send message');
      }
    },
  );
}
