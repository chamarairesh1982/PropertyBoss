import { useAgentAppointments } from '../../hooks/useAppointments';
import { useAuth } from '../../hooks/useAuth';
import AgentCalendar from '../../components/AgentCalendar';

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
        <AgentCalendar appointments={appointments} />
      ) : (
        <p>No appointments.</p>
      )}
    </div>
  );
}
