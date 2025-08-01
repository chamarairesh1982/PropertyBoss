import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';
import type { Database } from '../types/supabase';

type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  property?: { title: string | null };
  user?: { full_name: string | null };
};

export function useAgentAppointments() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['appointments', user?.id],
    queryFn: async () => {
      if (!user) return [] as Appointment[];
      const { data, error } = await supabase
        .from('appointments')
        .select('*, property:property_id(title), user:user_id(full_name)')
        .eq('agent_id', user.id)
        .order('timeslot');
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!user,
  });
}

export function useAddAppointment(propertyId: string, agentId: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return useMutation(
    async ({ timeslot }: { timeslot: Date }) => {
      if (!user) throw new Error('Must be signed in');
      const { error } = await supabase.from('appointments').insert({
        property_id: propertyId,
        agent_id: agentId,
        user_id: user.id,
        timeslot: timeslot.toISOString(),
      });
      if (error) throw new Error(error.message);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['appointments', agentId] });
      },
    },
  );
}
