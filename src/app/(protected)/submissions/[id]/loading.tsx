export default function SubmissionDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-9 w-24 animate-pulse rounded bg-muted" />
        <div className="flex gap-2">
          <div className="h-9 w-20 animate-pulse rounded bg-muted" />
          <div className="h-9 w-20 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="rounded-lg border p-6">
        <div className="h-6 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-6 grid grid-cols-2 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="h-4 w-24 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-5 w-32 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
