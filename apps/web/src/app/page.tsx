import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl items-center justify-center px-6">
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-8 shadow-2xl shadow-slate-950/60">
        <h1 className="text-3xl font-semibold tracking-tight">Ops Hub</h1>
        <p className="mt-3 text-slate-300">Dashboard frontend is bootstrapped with Next.js + TypeScript + Tailwind.</p>
        <Link href="/dashboard" className="mt-6 inline-flex rounded-md bg-indigo-500 px-4 py-2 font-medium text-white transition hover:bg-indigo-400">
          Open dashboard
        </Link>
      </div>
    </main>
  );
}
