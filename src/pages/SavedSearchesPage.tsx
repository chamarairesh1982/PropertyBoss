import { Link } from 'react-router-dom';
import {
  useSavedSearches,
  useDeleteSavedSearch,
} from '../hooks/useSavedSearches';
import { useAuth } from '../hooks/useAuth';

export default function SavedSearchesPage() {
  const { user } = useAuth();
  const { data: searches, isLoading, error } = useSavedSearches();
  const deleteSearch = useDeleteSavedSearch();

  if (!user) {
    return <p className="p-4">Please sign in to manage saved searches.</p>;
  }
  if (isLoading) return <p className="p-4">Loading…</p>;
  if (error)
    return (
      <p className="p-4 text-red-600">Error: {(error as Error).message}</p>
    );

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-2">Saved searches</h1>
      {searches && searches.length === 0 && <p>No saved searches.</p>}
      {searches?.map((s) => (
        <div key={s.id} className="border p-4 rounded flex justify-between">
          <pre className="whitespace-pre-wrap text-sm flex-1">
            {JSON.stringify(s.criteria, null, 2)}
          </pre>
          <div className="flex flex-col items-end gap-2 ml-4">
            <Link
              to="/"
              state={{ filters: s.criteria }}
              className="text-blue-600 underline text-sm"
            >
              Run search
            </Link>
            <button
              onClick={() => deleteSearch.mutate(s.id)}
              className="text-red-600 underline text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
