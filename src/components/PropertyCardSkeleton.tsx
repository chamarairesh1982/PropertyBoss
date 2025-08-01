export default function PropertyCardSkeleton() {
  return (
    <div className="animate-pulse bg-white rounded-lg shadow overflow-hidden">
      <div className="h-48 bg-gray-200" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
      </div>
    </div>
  );
}
