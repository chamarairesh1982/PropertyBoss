import { Link, Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';
import PropertyForm from './PropertyForm';
import Messages from './Messages';
import type { Database } from '../../types/supabase';

type Property = Database['public']['Tables']['properties']['Row'];

/**
 * The agent dashboard allows estate agents to manage their listings and
 * communications.  It is protected so that only users with the `agent`
 * role can access it.  Within the dashboard, nested routes are used for
 * listing, creating and editing properties and for viewing messages.
 */
export default function AgentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  // Only agents are allowed access
  if (!user || user.role !== 'agent') {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-2">Agent dashboard</h1>
        <p>You must be signed in as an agent to view this page.</p>
      </div>
    );
  }
  // Fetch properties owned by the current agent.
  const {
    data: properties,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['agent-properties', user.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('properties')
        .select('*, property_images!property_id(url, ord)')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw new Error(error.message);
      return data as Property[];
    },
  });

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Agent dashboard</h1>
      <nav className="mb-4 space-x-4">
        <Link to="" className="text-blue-600 underline">
          Listings
        </Link>
        <Link to="new" className="text-blue-600 underline">
          Add new
        </Link>
        <Link to="messages" className="text-blue-600 underline">
          Messages
        </Link>
      </nav>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              {isLoading && <p>Loading your properties…</p>}
              {error && (
                <p className="text-red-600">Error: {error.message}</p>
              )}
              {properties && properties.length > 0 ? (
                <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                  {properties.map((p) => (
                    <div
                      key={p.id}
                      className="bg-white rounded shadow p-4 flex flex-col"
                    >
                      <div className="font-semibold mb-2">{p.title}</div>
                      <div className="text-sm text-gray-600 mb-4">
                        £{p.price.toLocaleString()}{' '}
                        {p.listing_type === 'rent' ? '/mo' : ''}
                      </div>
                      <button
                        onClick={() => navigate(`edit/${p.id}`)}
                        className="mt-auto text-blue-600 underline text-sm"
                      >
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p>You haven't listed any properties yet.</p>
              )}
            </div>
          }
        />
        <Route path="new" element={<PropertyForm />} />
        <Route path="edit/:id" element={<PropertyForm />} />
        <Route path="messages" element={<Messages />} />
      </Routes>
    </div>
  );
}