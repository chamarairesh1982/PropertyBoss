import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import {
  format,
  parse,
  startOfWeek,
  getDay,
} from 'date-fns';
import { enGB } from 'date-fns/locale';
import type { Appointment } from '../hooks/useAppointments';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'en-GB': enGB };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales,
});

export default function AppointmentsCalendar({
  appointments,
}: {
  appointments: Appointment[];
}) {
  const events = appointments.map((a) => ({
    title: a.property?.title ?? 'Viewing',
    start: new Date(a.starts_at),
    end: new Date(a.ends_at),
  }));
  return <Calendar localizer={localizer} events={events} style={{ height: 500 }} />;
}
