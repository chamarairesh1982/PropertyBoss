import { useState } from 'react';
import clsx from 'clsx';
import type { Appointment } from '../hooks/useAppointments';

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export default function AgentCalendar({
  appointments,
}: {
  appointments: Appointment[];
}) {
  const [month, setMonth] = useState(new Date());

  const monthStart = startOfMonth(month);
  const startWeekDay = monthStart.getDay() === 0 ? 7 : monthStart.getDay();
  const startDate = addDays(monthStart, -(startWeekDay - 1));

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    days.push(addDays(startDate, i));
  }

  function nextMonth() {
    setMonth(addDays(monthStart, 31));
  }
  function prevMonth() {
    setMonth(addDays(monthStart, -1));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-sm">
        <button onClick={prevMonth} className="px-sm py-xs border rounded">
          Prev
        </button>
        <div className="font-semibold">
          {month.toLocaleString(undefined, { month: 'long', year: 'numeric' })}
        </div>
        <button onClick={nextMonth} className="px-sm py-xs border rounded">
          Next
        </button>
      </div>
      <div className="grid grid-cols-7 text-center font-semibold mb-xs">
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
        <div>Sun</div>
      </div>
      <div className="grid grid-cols-7 border-t border-l">
        {days.map((day, idx) => {
          const items = appointments.filter((a) =>
            isSameDay(new Date(a.timeslot), day),
          );
          return (
            <div
              key={idx}
              className={clsx(
                'border-b border-r h-24 p-xs text-xs',
                !isSameMonth(day, month) && 'bg-surface text-secondary',
              )}
            >
              <div className="font-semibold">{day.getDate()}</div>
              {items.map((a) => (
                <div key={a.id} className="bg-primary/20 rounded mt-0.5 px-xs">
                  {new Date(a.timeslot).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
