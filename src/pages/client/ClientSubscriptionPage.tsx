import { useClientWorkspace } from './ClientWorkspaceContext'

export default function ClientSubscriptionPage() {
  const { plans, selectedPlan, setSelectedPlan, changePlan, message } = useClientWorkspace()
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
      <h2 className="text-lg font-semibold text-slate-900">Subscription</h2>
      <div className="mt-3 flex items-center gap-2">
        <select value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          {plans.map((p) => <option key={p.code} value={p.code}>{p.name} ({p.code})</option>)}
        </select>
        <button onClick={() => void changePlan()} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Apply plan</button>
      </div>
      {message && <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
    </section>
  )
}
