import {
  useFavoriteLists,
  useListItems,
  useCreateFavoriteList,
} from '../hooks/useFavoriteLists';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../hooks/useAuth';
import PropertyList from '../components/PropertyList';

const schema = z.object({ name: z.string().min(1) });
type FormData = z.infer<typeof schema>;

export default function FavoriteListsPage() {
  const { user } = useAuth();
  const { data: lists, isLoading, error } = useFavoriteLists();
  const createList = useCreateFavoriteList();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    await createList.mutateAsync(data.name);
    reset();
  }

  if (!user) return <p className="p-4">Please sign in to manage lists.</p>;
  if (isLoading) return <p className="p-4">Loading…</p>;
  if (error)
    return (
      <p className="p-4 text-red-600">Error: {(error as Error).message}</p>
    );

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Your lists</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex gap-2 max-w-md items-start"
      >
        <div className="flex-1">
          <label htmlFor="listName" className="sr-only">
            List name
          </label>
          <input
            id="listName"
            className="border p-2 w-full"
            placeholder="List name"
            {...register('name')}
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-3 py-2 rounded"
        >
          Add
        </button>
      </form>
      {errors.name && <p className="text-red-600 text-sm">Name is required</p>}
      {lists && lists.length === 0 && <p>No lists yet.</p>}
      {lists?.map((list) => (
        <ListSection key={list.id} listId={list.id} name={list.name} />
      ))}
    </div>
  );
}

function ListSection({ listId, name }: { listId: string; name: string }) {
  const { data: properties } = useListItems(listId);
  return (
    <div className="border p-4 rounded">
      <h2 className="font-semibold mb-2">{name}</h2>
      <PropertyList properties={properties || []} />
    </div>
  );
}
