import { useDeleteReview, useReviews } from '../hooks/useReviews';
import { useAuth } from '../hooks/useAuth';

type Props = { propertyId: string };

export default function ReviewList({ propertyId }: Props) {
  const { user } = useAuth();
  const { data: reviews, isLoading } = useReviews(propertyId);
  const del = useDeleteReview(propertyId);

  if (isLoading) {
    return <p>Loading reviews…</p>;
  }
  if (!reviews || reviews.length === 0) {
    return <p className="text-gray-500">No reviews yet.</p>;
  }

  return (
    <ul className="space-y-4">
      {reviews.map((r) => (
        <li key={r.id} className="border-b pb-2">
          <div className="flex justify-between items-center">
            <p className="font-medium">
              {r.profiles?.full_name || 'Anon'} – {r.rating}/5
            </p>
            {user?.id === r.user_id && (
              <button
                onClick={() => del.mutate(r.id)}
                className="text-sm text-red-600"
              >
                Delete
              </button>
            )}
          </div>
          {r.comment && <p className="text-gray-700 text-sm">{r.comment}</p>}
        </li>
      ))}
    </ul>
  );
}
