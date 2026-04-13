import { useClientWorkspace } from './ClientWorkspaceContext'

export default function ClientDepartmentsPage() {
  const {
    departments, users, selectedDepartmentId, setSelectedDepartmentId,
    selectedSupervisorUserId, setSelectedSupervisorUserId, assignSupervisor, message,
  } = useClientWorkspace()

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
      <h2 className="text-lg font-semibold text-slate-900">Supervisor Department Mapping</h2>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <select value={selectedDepartmentId} onChange={(e) => setSelectedDepartmentId(Number(e.target.value))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select value={selectedSupervisorUserId} onChange={(e) => setSelectedSupervisorUserId(Number(e.target.value))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          {users.filter((u) => u.role_code === 'supervisor').map((u) => <option key={u.id} value={u.id}>{u.email}</option>)}
        </select>
        <button onClick={() => void assignSupervisor()} className="rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">Assign</button>
      </div>
      {message && <p className="mt-3 rounded-lg bg-slate-100 p-3 text-sm text-slate-800">{message}</p>}
      <ul className="mt-4 space-y-2 text-sm">{departments.map((d) => <li key={d.id} className="rounded-lg bg-slate-50 px-3 py-2">{d.name}: {d.supervisor_email || 'Unassigned'}</li>)}</ul>
    </section>
  )
}
