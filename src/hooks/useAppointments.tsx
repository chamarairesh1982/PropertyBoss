import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';
import type { Database } from '../types/supabase';

export type Appointment =
  Database['public']['Tables']['appointments']['Row'] & {
    property?: { title: string | null };
    user?: { full_name: string | null };
  };

export function useAgentAppointments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('appointments-agent-' + user.id)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `agent_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ['appointments', user.id],
          });
        },
      )
      .subscribe();
    return () => {
      void channel.unsubscribe();
    };
  }, [user, queryClient]);
  return useQuery({
    queryKey: ['appointments', user?.id],
    queryFn: async () => {
      if (!user) return [] as Appointment[];
      const { data, error } = await supabase
        .from('appointments')
        .select(
          'id, property_id, user_id, agent_id, starts_at, ends_at, status, created_at, property:property_id(title), user:user_id(full_name)',
        )
        .eq('agent_id', user.id)
        .order('starts_at');
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!user,
  });
}

export function useUserAppointments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('appointments-user-' + user.id)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({
            queryKey: ['user-appointments', user.id],
          });
        },
      )
      .subscribe();
    return () => {
      void channel.unsubscribe();
    };
  }, [user, queryClient]);
  return useQuery({
    queryKey: ['user-appointments', user?.id],
    queryFn: async () => {
      if (!user) return [] as Appointment[];
      const { data, error } = await supabase
        .from('appointments')
        .select(
          'id, property_id, user_id, agent_id, starts_at, ends_at, status, created_at, property:property_id(title), user:user_id(full_name)',
        )
        .eq('user_id', user.id)
        .order('starts_at');
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
    async ({ starts_at, ends_at }: { starts_at: Date; ends_at: Date }) => {
      if (!user) throw new Error('Must be signed in');
      const { error } = await supabase.from('appointments').insert({
        property_id: propertyId,
        agent_id: agentId,
        user_id: user.id,
        starts_at: starts_at.toISOString(),
        ends_at: ends_at.toISOString(),
      });
      if (error) throw new Error(error.message);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['appointments', agentId] });
        queryClient.invalidateQueries({
          queryKey: ['user-appointments', user?.id],
        });
      },
    },
  );
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient();
  return useMutation(
    async ({
      id,
      status,
    }: {
      id: string;
      status: 'approved' | 'declined' | 'pending';
    }) => {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);
      if (error) throw new Error(error.message);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['appointments'] });
        queryClient.invalidateQueries({ queryKey: ['user-appointments'] });
      },
    },
  );
}
