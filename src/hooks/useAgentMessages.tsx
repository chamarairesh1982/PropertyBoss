import { useQuery } from '@tanstack/react-query';
import { useAuth } from './useAuth';
import { supabase } from '../lib/supabaseClient';
import type { Database } from '../types/db';

type Message = Database['public']['Tables']['messages']['Row'] & {
  property: { title: string } | null;
  sender: { full_name: string | null; email: string | null } | null;
};

export function useAgentMessages() {
  const { user } = useAuth();
  return useQuery<Message[]>({
    queryKey: ['agent-messages', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('messages')
        .select(
          `id, content, created_at, property:property_id(title), sender:sender_id(full_name, email)`,
        )
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return (data ?? []) as Message[];
    },
    enabled: !!user,
  });
}
