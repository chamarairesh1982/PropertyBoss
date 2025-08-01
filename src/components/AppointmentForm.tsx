import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAddAppointment } from '../hooks/useAppointments';
import { useAuth } from '../hooks/useAuth';

const schema = z.object({
  timeslot: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

export default function AppointmentForm({ propertyId, agentId }: { propertyId: string; agentId: string }) {
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const add = useAddAppointment(propertyId, agentId);

  async function onSubmit(data: FormData) {
    await add.mutateAsync({ timeslot: new Date(data.timeslot) });
    reset();
  }

  if (!user) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 max-w-md">
      <div>
        <label htmlFor="timeslot" className="block text-sm font-medium text-gray-700">
          Select time
        </label>
        <input
          type="datetime-local"
          id="timeslot"
          className="border rounded w-full p-2"
          {...register('timeslot')}
        />
        {errors.timeslot && <p className="text-red-600 text-sm">Please choose a time</p>}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Requesting…' : 'Request viewing'}
      </button>
      {add.isError && <p className="text-red-600 text-sm">{(add.error as Error).message}</p>}
      {add.isSuccess && <p className="text-green-700 text-sm">Request sent!</p>}
    </form>
  );
}
