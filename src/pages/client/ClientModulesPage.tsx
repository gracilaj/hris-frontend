import { useClientWorkspace } from './ClientWorkspaceContext'

export default function ClientModulesPage() {
  const { modules, loading, error } = useClientWorkspace()
  if (loading) return <p className="text-sm text-slate-600">Loading modules...</p>
  if (error) return <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {modules.map((m) => (
        <section key={m.code} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-semibold text-slate-900">{m.name}</h2>
            <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${m.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{m.active ? 'Active' : 'Not subscribed'}</span>
          </div>
          <p className="mt-2 text-xs text-slate-500">{m.code}</p>
        </section>
      ))}
    </div>
  )
}
