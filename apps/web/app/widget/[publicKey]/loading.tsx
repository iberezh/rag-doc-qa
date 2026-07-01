// Streamed as the widget iframe's first paint, so it opens straight into a spinner
// instead of a blank white plate while the page + bot config load.
export default function Loading() {
  return (
    <div
      className="flex h-screen items-center justify-center bg-white"
      role="status"
      aria-label="Loading chat"
    >
      <span className="h-7 w-7 animate-spin rounded-full border-2 border-black/10 border-t-black/40" />
    </div>
  );
}
