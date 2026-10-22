export default function ProductsLoading() {
  return (
    <div
      role="status"
      aria-label="Loading the jewellery collection"
      className="mx-auto w-full max-w-[1500px] flex-1 px-4 pb-20 pt-8 sm:px-6 lg:px-10"
    >
      <div className="mb-7 animate-pulse">
        <div className="h-3 w-36 rounded bg-neutral-200" />
        <div className="mt-4 h-9 w-64 rounded bg-neutral-200" />
        <div className="mt-3 h-4 max-w-xl rounded bg-neutral-100" />
      </div>
      <div className="mb-5 h-14 animate-pulse border-y border-neutral-200 bg-neutral-50" />
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="animate-pulse">
            <div className="aspect-[4/5] rounded-2xl bg-neutral-100" />
            <div className="mt-4 h-5 w-3/4 rounded bg-neutral-100" />
            <div className="mt-3 h-4 w-1/2 rounded bg-neutral-100" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading pieces…</span>
    </div>
  );
}
