export default function CatalogoLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="h-9 w-72 bg-zinc-800 rounded-lg animate-pulse mb-2" />
        <div className="h-4 w-48 bg-zinc-800 rounded animate-pulse" />
      </div>
      {/* Filtri skeleton */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[120, 90, 110, 80, 100, 95].map((w, i) => (
          <div key={i} className="h-8 bg-zinc-800 rounded-full animate-pulse" style={{ width: w }} />
        ))}
      </div>
      {/* Grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden animate-pulse">
            <div className="h-36 bg-zinc-800" />
            <div className="p-3 space-y-2">
              <div className="h-3 w-16 bg-zinc-700 rounded" />
              <div className="h-4 w-28 bg-zinc-700 rounded" />
              <div className="h-3 w-12 bg-zinc-700 rounded" />
              <div className="h-5 w-20 bg-zinc-700 rounded mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
