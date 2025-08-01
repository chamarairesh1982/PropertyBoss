import { useAgentAppointments } from '../../hooks/useAppointments';
import { useAuth } from '../../hooks/useAuth';

export default function Appointments() {
  const { user } = useAuth();
  const { data: appointments, isLoading, error } = useAgentAppointments();

  if (!user) {
    return <p>Please sign in as an agent to view appointments.</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Appointments</h2>
      {isLoading && <p>Loading appointments…</p>}
      {error && <p className="text-red-600">Error: {error.message}</p>}
      {appointments && appointments.length > 0 ? (
        <ul className="space-y-4">
          {appointments.map((a) => (
            <li key={a.id} className="border rounded p-4">
              <div className="font-semibold">{a.property?.title ?? 'Unknown property'}</div>
              <div className="text-sm text-gray-600">
                {new Date(a.timeslot).toLocaleString()} –{' '}
                {a.user?.full_name || 'Unknown'} (status: {a.status})
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No appointments.</p>
      )}
    </div>
  );
}
