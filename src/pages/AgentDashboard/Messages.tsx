import { useAuth } from '../../hooks/useAuth';
import { useAgentMessages } from '../../hooks/useAgentMessages';

interface Message {
  id: string;
  content: string;
  created_at: string;
  property: { title: string } | null;
  sender: { full_name: string | null; email: string | null } | null;
}

/**
 * Displays messages received by the agent.  Messages are grouped by property
 * and ordered by creation date.  Reply functionality could be added later.
 */
export default function Messages() {
  const { user } = useAuth();
  const { data: messages, isLoading, error } = useAgentMessages();
  if (!user) {
    return <p>Please sign in as an agent to view messages.</p>;
  }
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Messages</h2>
      {isLoading && <p>Loading messages…</p>}
      {error && <p className="text-red-600">Error: {error.message}</p>}
      {messages && messages.length > 0 ? (
        <ul className="space-y-4">
          {(messages as Message[]).map((msg) => (
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
