import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAddReview } from '../hooks/useReviews';

const schema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(1),
});

type FormData = z.infer<typeof schema>;

export default function ReviewForm({ propertyId }: { propertyId: string }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });
  const addReview = useAddReview(propertyId);

  async function onSubmit(data: FormData) {
    await addReview.mutateAsync(data);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <div>
        <label className="block text-sm font-medium" htmlFor="rating">
          Rating
        </label>
        <select
          id="rating"
          className="border rounded w-full p-2"
          {...register('rating', { valueAsNumber: true })}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
        {errors.rating && (
          <p className="text-red-600 text-sm">Rating is required</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium" htmlFor="comment">
          Comment
        </label>
        <textarea
          id="comment"
          className="border rounded w-full p-2"
          {...register('comment')}
          rows={3}
        />
        {errors.comment && (
          <p className="text-red-600 text-sm">Comment is required</p>
        )}
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Saving…' : 'Submit Review'}
      </button>
      {addReview.isError && (
        <p className="text-red-600 text-sm">
          {(addReview.error as Error).message}
        </p>
      )}
    </form>
  );
}
