import {
  useAgentAppointments,
  useUpdateAppointment,
} from '../../hooks/useAppointments';
import { useAuth } from '../../hooks/useAuth';
import AppointmentsCalendar from '../../components/AppointmentsCalendar';

export default function Appointments() {
  const { user } = useAuth();
  const { data: appointments, isLoading, error } = useAgentAppointments();
  const update = useUpdateAppointment();

  if (!user) {
    return <p>Please sign in as an agent to view appointments.</p>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Appointments</h2>
      {isLoading && <p>Loading appointments…</p>}
      {error && <p className="text-red-600">Error: {error.message}</p>}
      {appointments && appointments.length > 0 ? (
        <div className="space-y-md">
          <div>
            <h3 className="font-semibold mb-2">Pending requests</h3>
            {appointments.filter((a) => a.status === 'pending').length > 0 ? (
              <ul className="space-y-2">
                {appointments
                  .filter((a) => a.status === 'pending')
                  .map((a) => (
                    <li key={a.id} className="flex items-center justify-between">
                      <span>
                        {a.user?.full_name ?? 'User'} –{' '}
                        {new Date(a.starts_at).toLocaleString()} -
                        {new Date(a.ends_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <span className="space-x-2">
                        <button
                          onClick={() => update.mutate({ id: a.id, status: 'approved' })}
                          className="px-sm py-xs border rounded text-sm"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => update.mutate({ id: a.id, status: 'declined' })}
                          className="px-sm py-xs border rounded text-sm"
                        >
                          Decline
                        </button>
                      </span>
                    </li>
                  ))}
              </ul>
            ) : (
              <p>No pending requests.</p>
            )}
          </div>
          <AppointmentsCalendar appointments={appointments} />
        </div>
      ) : (
        <p>No appointments.</p>
      )}
    </div>
  );
}
