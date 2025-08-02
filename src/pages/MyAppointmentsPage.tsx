import AppointmentsCalendar from '../components/AppointmentsCalendar';
import { useUserAppointments } from '../hooks/useAppointments';

export default function MyAppointmentsPage() {
  const { data: appointments, isLoading, error } = useUserAppointments();
  return (
    <div className="p-md">
      <h2 className="text-xl font-bold mb-4">My appointments</h2>
      {isLoading && <p>Loading appointments…</p>}
      {error && <p className="text-red-600">Error: {error.message}</p>}
      {appointments && appointments.length > 0 ? (
        <AppointmentsCalendar appointments={appointments} />
      ) : (
        <p>No appointments.</p>
      )}
    </div>
  );
}
