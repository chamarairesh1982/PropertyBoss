import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import PropertyList from '../components/PropertyList';

/**
 * Displays the list of properties favourited by the current user.  If no
 * user is logged in, a message prompts them to sign in.
 */
export default function FavoritesPage() {
  const { user } = useAuth();
  const {
    data: favProperties,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['favorite-properties', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('favorites')
        .select('property_id, property:properties(*)')
        .eq('user_id', user.id);
      if (error) throw new Error(error.message);
      return data?.map((row) => row.property) ?? [];
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="p-4">
        <p>
          Please sign in to view your favourites.
        </p>
      </div>
    );
  }
  if (isLoading) {
    return <p className="p-4">Loading favourites…</p>;
  }
  if (error) {
    return (
      <p className="p-4 text-red-600">Error: {error.message}</p>
    );
  }
  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your favourites</h1>
      <PropertyList properties={favProperties || []} />
    </div>
  );
}