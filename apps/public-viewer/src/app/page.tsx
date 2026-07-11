export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col items-center justify-center gap-4 p-6 text-center sm:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          Public Transparency Viewer
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          Escrow progress is public — no sign-in required.
        </p>
      </div>
    </main>
  );
}
