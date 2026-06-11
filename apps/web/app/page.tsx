export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
        scaffold · phase 0
      </span>
      <h1 className="text-3xl font-bold">RAG Doc Q&amp;A</h1>
      <p className="max-w-md text-gray-600">
        Upload documents, ask questions, and get streamed answers with citations. The interface
        ships in a later phase — this is the scaffold.
      </p>
    </main>
  );
}
