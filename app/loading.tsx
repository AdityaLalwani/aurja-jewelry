export default function Loading() {
  return (
    <main
      aria-busy="true"
      className="mx-auto flex min-h-[50vh] w-full max-w-7xl flex-1 flex-col items-center justify-center px-5 py-16"
    >
      <p role="status" className="flex flex-col items-center">
        <span
          aria-hidden="true"
          className="h-8 w-8 animate-spin rounded-full border-2 border-amber-800/20 border-t-amber-800"
        />
        <span className="mt-4 text-xs uppercase tracking-[0.24em] text-stone-600">
          Loading AURJA
        </span>
      </p>
    </main>
  );
}
