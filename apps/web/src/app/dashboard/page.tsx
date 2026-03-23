export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <header className="mb-8">
        <p className="text-sm uppercase tracking-[0.16em] text-indigo-300">Ops Hub</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-100">Dashboard</h1>
        <p className="mt-3 text-slate-300">Base route is online. Widgets, queues, and run history can be layered in next.</p>
      </header>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {['Queue', 'Approvals', 'Latest Runs'].map((card) => (
          <article key={card} className="rounded-lg border border-slate-800 bg-slate-900 p-4">
            <h2 className="text-base font-medium text-slate-100">{card}</h2>
            <p className="mt-2 text-sm text-slate-400">Placeholder panel ready for integration.</p>
          </article>
        ))}
      </section>
    </main>
  );
}
