export default function EditSubmissionLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-40 animate-pulse rounded bg-muted" />
      <div className="rounded-lg border p-6">
        <div className="space-y-6 max-w-2xl">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="h-4 w-10 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-10 w-full animate-pulse rounded bg-muted" />
            </div>
            <div>
              <div className="h-4 w-16 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-10 w-full animate-pulse rounded bg-muted" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="h-4 w-12 animate-pulse rounded bg-muted" />
              <div className="mt-2 h-10 w-full animate-pulse rounded bg-muted" />
            </div>
          </div>
          <div>
            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-24 w-full animate-pulse rounded bg-muted" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-24 animate-pulse rounded bg-muted" />
            <div className="h-10 w-20 animate-pulse rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
