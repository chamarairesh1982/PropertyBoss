import { Link, Routes, Route } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import PropertyForm from './PropertyForm';
import Messages from './Messages';
import Appointments from './Appointments';
import Listings from './Listings';

/**
 * The agent dashboard allows estate agents to manage their listings and
 * communications.  It is protected so that only users with the `agent`
 * role can access it.  Within the dashboard, nested routes are used for
 * listing, creating and editing properties and for viewing messages.
 */
export default function AgentDashboard() {
  const { user } = useAuth();

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
        <Route path="/" element={<Listings />} />
        <Route path="new" element={<PropertyForm />} />
        <Route path="edit/:id" element={<PropertyForm />} />
        <Route path="messages" element={<Messages />} />
        <Route path="appointments" element={<Appointments />} />
      </Routes>
    </div>
  );
}

