export default function PropertyCardSkeleton() {
  return (
    <div className="animate-pulse bg-background rounded-lg shadow overflow-hidden">
      <div className="h-48 bg-surface" />
      <div className="p-md space-y-sm">
        <div className="h-4 bg-surface rounded w-3/4" />
        <div className="h-3 bg-surface rounded w-1/2" />
      </div>
    </div>
  );
}
