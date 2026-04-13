import { useState } from 'react'
import { useClientWorkspace } from './ClientWorkspaceContext'

export default function ClientUsersPage() {
  const { users, createUser, message } = useClientWorkspace()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('employee')

  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
      <h2 className="text-lg font-semibold text-slate-900">Company Users</h2>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="new.user@company.com" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Temporary password" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
        <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
          <option value="client_superadmin">Company Admin</option><option value="hr_manager">HR Manager</option><option value="payroll_officer">Payroll Officer</option><option value="supervisor">Supervisor</option><option value="employee">Employee</option>
        </select>
        <button onClick={() => void createUser(email, password, role)} className="rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">Create user</button>
      </div>
      {message && <p className="mt-3 rounded-lg bg-slate-100 p-3 text-sm text-slate-800">{message}</p>}
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full text-sm"><thead><tr className="border-b border-slate-200 text-left text-slate-600"><th className="py-2 pr-4">Email</th><th className="py-2 pr-4">Role</th><th className="py-2 pr-4">Status</th></tr></thead>
          <tbody>{users.map((u) => <tr key={u.id} className="border-b border-slate-100"><td className="py-2 pr-4">{u.email}</td><td className="py-2 pr-4">{u.role_code || '-'}</td><td className="py-2 pr-4">{u.status}</td></tr>)}</tbody>
        </table>
      </div>
    </section>
  )
}
