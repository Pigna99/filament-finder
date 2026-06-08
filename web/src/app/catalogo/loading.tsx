export default function CatalogoLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <div className="h-9 w-72 rounded-lg animate-pulse mb-2" style={{ backgroundColor: "var(--surface-2)" }} />
        <div className="h-4 w-48 rounded animate-pulse" style={{ backgroundColor: "var(--surface-2)" }} />
      </div>
      {/* Filtri skeleton */}
      <div className="flex flex-wrap gap-2 mb-6">
        {[120, 90, 110, 80, 100, 95].map((w, i) => (
          <div key={i} className="h-9 rounded-lg animate-pulse" style={{ width: w, backgroundColor: "var(--surface-2)" }} />
        ))}
      </div>
      {/* Grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl overflow-hidden animate-pulse border"
            style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--line)" }}
          >
            <div className="h-36" style={{ backgroundColor: "var(--surface-2)" }} />
            <div className="p-3 space-y-2">
              <div className="h-3 w-16 rounded" style={{ backgroundColor: "var(--surface-3)" }} />
              <div className="h-4 w-28 rounded" style={{ backgroundColor: "var(--surface-3)" }} />
              <div className="h-3 w-12 rounded" style={{ backgroundColor: "var(--surface-3)" }} />
              <div className="h-5 w-20 rounded mt-2" style={{ backgroundColor: "var(--surface-3)" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
