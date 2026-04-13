import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, setAuthToken } from '../api/client'
import CompanyWorkspaceLayout from '../components/CompanyWorkspaceLayout'

type CompanyUser = { id: number; email: string; role_code: string | null; status: string }
type AttendanceRow = { employee_no: string; first_name: string; last_name: string; in_logs: number; out_logs: number; days_present: number }
type PayslipRow = { id: number; payslip_no: string; issued_at: string | null; period_code: string; run_no: number; employee_no: string; first_name: string; last_name: string; basic_pay: number; gross_pay: number; total_deduct: number; net_pay: number }

export default function PayrollOfficerDashboardPage() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<CompanyUser[]>([])
  const [attendanceRows, setAttendanceRows] = useState<AttendanceRow[]>([])
  const [payslips, setPayslips] = useState<PayslipRow[]>([])
  const [periodCode, setPeriodCode] = useState('2026-04-A')
  const [msg, setMsg] = useState<string | null>(null)

  async function loadUsers() {
    const res = await api.get('/company-users')
    setUsers((res?.data?.data?.users ?? []) as CompanyUser[])
  }

  async function loadAttendance() {
    const res = await api.get('/attendance/monitor', { params: { period_code: periodCode } })
    setAttendanceRows((res?.data?.data?.rows ?? []) as AttendanceRow[])
  }

  async function loadPayslips() {
    const res = await api.get('/payroll/payslips', { params: { period_code: periodCode } })
    setPayslips((res?.data?.data?.payslips ?? []) as PayslipRow[])
  }

  useEffect(() => {
    const token = localStorage.getItem('hris_token')
    if (!token) {
      navigate('/login')
      return
    }
    setAuthToken(token)
    void (async () => {
      await loadUsers()
      await loadAttendance()
      await loadPayslips()
    })()
  }, [navigate])

  async function runPayroll() {
    try {
      const res = await api.post('/payroll/run', { period_code: periodCode })
      const runId = res?.data?.data?.payroll_run_id
      const processed = res?.data?.data?.processed_employees ?? 0
      setMsg(`Payroll run #${runId} generated for ${processed} employee(s).`)
      await loadPayslips()
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Failed to run payroll')
    }
  }

  return (
    <CompanyWorkspaceLayout
      kind="payroll"
      headerTitle="Payroll Officer"
      headerSubtitle="Runs, attendance checks, and payslip history."
    >
      <div className="mx-auto max-w-6xl space-y-6">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
        <h2 className="font-semibold text-slate-900">Payroll Tasks</h2>
        <div className="mt-3 flex items-center gap-2">
          <input value={periodCode} onChange={(e) => setPeriodCode(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm" placeholder="e.g. 2026-04-A" />
          <button onClick={() => void loadAttendance()} className="rounded-full bg-slate-700 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-600">Refresh attendance</button>
          <button onClick={runPayroll} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Run payroll</button>
        </div>
        {msg && <p className="mt-3 text-sm text-emerald-700">{msg}</p>}
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
        <h2 className="font-semibold text-slate-900">Attendance Monitoring ({periodCode})</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-600">
                <th className="py-2 pr-4">Employee</th>
                <th className="py-2 pr-4">IN Logs</th>
                <th className="py-2 pr-4">OUT Logs</th>
                <th className="py-2 pr-4">Days Present</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRows.map((r) => (
                <tr key={r.employee_no} className="border-b border-slate-100">
                  <td className="py-2 pr-4">{r.employee_no} - {r.first_name} {r.last_name}</td>
                  <td className="py-2 pr-4">{r.in_logs}</td>
                  <td className="py-2 pr-4">{r.out_logs}</td>
                  <td className="py-2 pr-4">{r.days_present}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
        <h2 className="font-semibold text-slate-900">Payslip History ({periodCode})</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-600">
                <th className="py-2 pr-4">Payslip No</th>
                <th className="py-2 pr-4">Employee</th>
                <th className="py-2 pr-4">Gross</th>
                <th className="py-2 pr-4">Deduction</th>
                <th className="py-2 pr-4">Net</th>
                <th className="py-2 pr-4">Run</th>
              </tr>
            </thead>
            <tbody>
              {payslips.map((p) => (
                <tr key={p.id} className="border-b border-slate-100">
                  <td className="py-2 pr-4">{p.payslip_no}</td>
                  <td className="py-2 pr-4">{p.employee_no} - {p.first_name} {p.last_name}</td>
                  <td className="py-2 pr-4">{p.gross_pay}</td>
                  <td className="py-2 pr-4">{p.total_deduct}</td>
                  <td className="py-2 pr-4">{p.net_pay}</td>
                  <td className="py-2 pr-4">{p.period_code} / #{p.run_no}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
        <h2 className="font-semibold text-slate-900">Payroll Team Coverage</h2>
        <p className="mt-1 text-sm text-slate-600">Multiple payroll officers can handle tasks if others are absent.</p>
        <ul className="mt-3 space-y-2 text-sm">
          {users.filter((u) => u.role_code === 'payroll_officer').map((u) => (
            <li key={u.id} className="rounded-lg bg-slate-50 px-3 py-2">{u.email} ({u.status})</li>
          ))}
        </ul>
      </div>
      </div>
    </CompanyWorkspaceLayout>
  )
}