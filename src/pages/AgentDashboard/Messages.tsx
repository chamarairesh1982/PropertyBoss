import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabaseClient';

/**
 * Displays messages received by the agent.  Messages are grouped by property
 * and ordered by creation date.  Reply functionality could be added later.
 */
export default function Messages() {
  const { user } = useAuth();
  const {
    data: messages,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['agent-messages', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('messages')
        .select(
          `id, content, created_at, property:property_id(title), sender:sender_id(full_name, email)`
        )
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    enabled: !!user,
  });

  if (!user) {
    return <p>Please sign in as an agent to view messages.</p>;
  }
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Messages</h2>
      {isLoading && <p>Loading messages…</p>}
      {error && (
        <p className="text-red-600">Error: {error.message}</p>
      )}
      {messages && messages.length > 0 ? (
        <ul className="space-y-4">
          {messages.map((msg: any) => (
            <li key={msg.id} className="border rounded p-4">
              <div className="font-semibold text-sm text-gray-700">
                {msg.property?.title ?? 'Unknown property'}
              </div>
              <div className="text-sm text-gray-600 mb-1">
                From: {msg.sender?.full_name ?? msg.sender?.email ?? 'Unknown'}
              </div>
              <p className="text-gray-800 whitespace-pre-wrap">{msg.content}</p>
              <div className="text-xs text-gray-400 mt-1">
                {new Date(msg.created_at).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No messages received.</p>
      )}
    </div>
  );
}