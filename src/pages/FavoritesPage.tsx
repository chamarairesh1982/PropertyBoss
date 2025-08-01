import { useAuth } from '../hooks/useAuth';
import { useFavoriteProperties } from '../hooks/useFavoriteProperties';
import PropertyList from '../components/PropertyList';

/**
 * Displays the list of properties favourited by the current user.  If no
 * user is logged in, a message prompts them to sign in.
 */
export default function FavoritesPage() {
  const { user } = useAuth();
  const { data: favProperties, isLoading, error } = useFavoriteProperties();

  if (!user) {
    return (
      <div className="p-4">
        <p>Please sign in to view your favourites.</p>
      </div>
    );
  }
  if (isLoading) {
    return <p className="p-4">Loading favourites…</p>;
  }
  if (error) {
    return <p className="p-4 text-red-600">Error: {error.message}</p>;
  }
  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your favourites</h1>
      <PropertyList properties={favProperties || []} />
    </div>
  );
}
