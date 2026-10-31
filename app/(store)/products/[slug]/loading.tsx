export default function ProductLoading() {
  return (
    <div
      role="status"
      aria-label="Loading product details"
      className="mx-auto w-full max-w-[1500px] flex-1 px-4 pb-32 pt-8 sm:px-6 lg:px-10"
    >
      <div className="mb-7 h-3 w-72 animate-pulse rounded bg-neutral-200" />
      <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="grid grid-cols-2 gap-3">
          <div className="aspect-[5/6] animate-pulse bg-neutral-100" />
          <div className="aspect-[5/6] animate-pulse bg-neutral-100" />
        </div>
        <div className="animate-pulse pt-2">
          <div className="h-3 w-24 rounded bg-neutral-200" />
          <div className="mt-5 h-10 w-3/4 rounded bg-neutral-200" />
          <div className="mt-7 h-10 w-48 rounded bg-neutral-100" />
          <div className="mt-8 h-28 rounded-2xl bg-neutral-100" />
        </div>
      </div>
      <span className="sr-only">Loading product…</span>
    </div>
  );
}
