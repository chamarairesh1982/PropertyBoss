import { Link, Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import PropertyForm from './PropertyForm';
import Messages from './Messages';
import Appointments from './Appointments';
import { useListingStats } from '../../hooks/useListingStats';
import { useAgentProperties } from '../../hooks/useAgentProperties';

/**
 * The agent dashboard allows estate agents to manage their listings and
 * communications.  It is protected so that only users with the `agent`
 * role can access it.  Within the dashboard, nested routes are used for
 * listing, creating and editing properties and for viewing messages.
 */
export default function AgentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: stats } = useListingStats();
  const { data: properties, isLoading, error } = useAgentProperties();

  // Only agents are allowed access
  if (!user || user.role !== 'agent') {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold mb-2">Agent dashboard</h1>
        <p>You must be signed in as an agent to view this page.</p>
      </div>
    );
  }

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
        <Link to="appointments" className="text-blue-600 underline">
          Appointments
        </Link>
      </nav>
      <Routes>
        <Route
          path="/"
          element={
            <div>
              {isLoading && <p>Loading your properties…</p>}
              {error && <p className="text-red-600">Error: {error.message}</p>}
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
                      {stats && (
                        <div className="text-xs text-gray-500 mb-2">
                          views:{' '}
                          {stats.find((s) => s.property_id === p.id)?.views ??
                            0}
                          , enquiries:{' '}
                          {stats.find((s) => s.property_id === p.id)
                            ?.enquiries ?? 0}
                          , favs:{' '}
                          {stats.find((s) => s.property_id === p.id)
                            ?.favorites ?? 0}
                        </div>
                      )}
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
                <p>You haven&apos;t listed any properties yet.</p>
              )}
            </div>
          }
        />
        <Route path="new" element={<PropertyForm />} />
        <Route path="edit/:id" element={<PropertyForm />} />
        <Route path="messages" element={<Messages />} />
        <Route path="appointments" element={<Appointments />} />
      </Routes>
    </div>
  );
}
