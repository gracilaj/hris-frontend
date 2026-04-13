import { useClientWorkspace } from './ClientWorkspaceContext'

export default function ClientEmployeesPage() {
  const { employees, uploadSampleEmployees, message } = useClientWorkspace()
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-900">Employee Upload</h2>
        <button onClick={() => void uploadSampleEmployees()} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Upload sample employees</button>
      </div>
      {message && <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm"><thead><tr className="border-b border-slate-200 text-left text-slate-600"><th className="py-2 pr-4">Employee No</th><th className="py-2 pr-4">Name</th><th className="py-2 pr-4">Email</th><th className="py-2 pr-4">Status</th></tr></thead>
          <tbody>{employees.map((emp) => <tr key={emp.id} className="border-b border-slate-100"><td className="py-2 pr-4">{emp.employee_no}</td><td className="py-2 pr-4">{emp.first_name} {emp.last_name}</td><td className="py-2 pr-4">{emp.email || '-'}</td><td className="py-2 pr-4">{emp.status}</td></tr>)}</tbody>
        </table>
      </div>
    </section>
  )
}
