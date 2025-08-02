import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAddAppointment } from '../hooks/useAppointments';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

const schema = z
  .object({
    starts_at: z.string().min(1),
    ends_at: z.string().min(1),
  })
  .refine((data) => new Date(data.ends_at) > new Date(data.starts_at), {
    message: 'End time must be after start time',
    path: ['ends_at'],
  });

type FormData = z.infer<typeof schema>;

export default function AppointmentForm({
  propertyId,
  agentId,
}: {
  propertyId: string;
  agentId: string;
}) {
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const add = useAddAppointment(propertyId, agentId);

  async function onSubmit(data: FormData) {
    await add.mutateAsync({
      starts_at: new Date(data.starts_at),
      ends_at: new Date(data.ends_at),
    });
    reset();
  }

  if (!user)
    return (
      <p>
        Please{' '}
        <Link to="/login" className="text-primary underline">
          sign in
        </Link>{' '}
        to request a viewing.
      </p>
    );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-sm max-w-md">
      <div>
        <label htmlFor="starts_at" className="block text-sm font-medium text-secondary">
          Start time
        </label>
        <input
          type="datetime-local"
          id="starts_at"
          className="border rounded w-full p-sm"
          {...register('starts_at')}
        />
        {errors.starts_at && (
          <p className="text-red-600 text-sm">Please choose a start time</p>
        )}
      </div>
      <div>
        <label htmlFor="ends_at" className="block text-sm font-medium text-secondary">
          End time
        </label>
        <input
          type="datetime-local"
          id="ends_at"
          className="border rounded w-full p-sm"
          {...register('ends_at')}
        />
        {errors.ends_at && (
          <p className="text-red-600 text-sm">{errors.ends_at.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-primary text-background px-md py-sm rounded hover:bg-primary/80 disabled:opacity-50"
      >
        {isSubmitting ? 'Requesting…' : 'Request viewing'}
      </button>
      {add.isError && <p className="text-red-600 text-sm">{(add.error as Error).message}</p>}
      {add.isSuccess && <p className="text-green-700 text-sm">Request sent!</p>}
    </form>
  );
}
