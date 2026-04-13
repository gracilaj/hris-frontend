import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, setAuthToken } from '../api/client'
import { ROLE_LABELS } from '../components/DashboardHeader'

type RequestRow = { id: number; request_type: string; status: string; reason: string; start_date: string | null; end_date: string | null }
type AttendanceLog = { id: number; log_type: 'IN' | 'OUT'; logged_at: string; source: string }
type DailyRow = { work_date: string; first_in: string | null; last_out: string | null; is_late: boolean; is_overtime: boolean; is_undertime: boolean }
type PayslipRow = { id: number; payslip_no: string; issued_at: string | null; period_code: string; run_no: number; basic_pay: number; gross_pay: number; total_deduct: number; net_pay: number }

type Summary = { present_days: number; late_days: number; overtime_days: number; undertime_days: number; absent_days: number }

type MenuKey = 'dashboard' | 'timekeeping-calendar' | 'timekeeping-list' | 'forms-filling' | 'forms-approval' | 'profile' | 'payslip'

const HOLIDAYS = ['2026-04-09 - Araw ng Kagitingan']
const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_OPTIONS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
]

export default function EmployeeDashboardPage() {
  const navigate = useNavigate()
  const [menu, setMenu] = useState<MenuKey>('dashboard')
  const [requests, setRequests] = useState<RequestRow[]>([])
  const [logs, setLogs] = useState<AttendanceLog[]>([])
  const [daily, setDaily] = useState<DailyRow[]>([])
  const [summary, setSummary] = useState<Summary>({ present_days: 0, late_days: 0, overtime_days: 0, undertime_days: 0, absent_days: 0 })
  const [payslips, setPayslips] = useState<PayslipRow[]>([])
  const [requestType, setRequestType] = useState('leave')
  const [reason, setReason] = useState('')
  const [msg, setMsg] = useState<string | null>(null)
  const [monthPart, setMonthPart] = useState('04')
  const [yearPart, setYearPart] = useState('2026')

  const profile = useMemo(() => {
    const code = localStorage.getItem('hris_user_role') || 'employee'
    return {
      email: localStorage.getItem('hris_user_email') || 'employee@company.local',
      companyName: localStorage.getItem('hris_company_name') || 'Company',
      role: ROLE_LABELS[code] ?? code,
    }
  }, [])
  const month = `${yearPart}-${monthPart}`

  function logout() {
    localStorage.clear()
    navigate('/login')
  }

  function menuButtonStyle(key: MenuKey): string {
    return menu === key
      ? 'w-full rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-left font-semibold text-indigo-700 shadow-sm'
      : 'w-full rounded-xl px-3 py-2.5 text-left text-slate-600 hover:bg-slate-100'
  }

  async function loadAll() {
    const [reqRes, logRes, sumRes, payslipRes] = await Promise.all([
      api.get('/requests'),
      api.get('/attendance/my-logs', { params: { month } }),
      api.get('/attendance/my-summary', { params: { month } }),
      api.get('/payroll/my-payslips'),
    ])
    setRequests((reqRes?.data?.data?.requests ?? []) as RequestRow[])
    setLogs((logRes?.data?.data?.logs ?? []) as AttendanceLog[])
    setDaily((sumRes?.data?.data?.daily ?? []) as DailyRow[])
    setSummary((sumRes?.data?.data?.summary ?? {}) as Summary)
    setPayslips((payslipRes?.data?.data?.payslips ?? []) as PayslipRow[])
  }

  useEffect(() => {
    const token = localStorage.getItem('hris_token')
    if (!token) {
      navigate('/login')
      return
    }
    setAuthToken(token)
    void loadAll()
  }, [navigate, month])

  async function timeAction(logType: 'IN' | 'OUT') {
    try {
      await api.post('/attendance/log', { qr_payload: 'DEMO-QR-LOBBY', log_type: logType })
      setMsg(`Time ${logType.toLowerCase()} successful.`)
      await loadAll()
    } catch (e) {
      setMsg(e instanceof Error ? e.message : `Time ${logType.toLowerCase()} failed.`)
    }
  }

  async function submitRequest(e: FormEvent) {
    e.preventDefault()
    await api.post('/requests', { request_type: requestType, reason })
    setMsg('Request submitted for supervisor approval.')
    setReason('')
    await loadAll()
  }

  const calendarCells = useMemo(() => {
    const map = new Map<string, DailyRow>()
    daily.forEach((d) => map.set(d.work_date, d))
    const firstDay = new Date(Number(yearPart), Number(monthPart) - 1, 1).getDay()
    const daysInMonth = new Date(Number(yearPart), Number(monthPart), 0).getDate()
    const days: Array<{ day: number; status: string; date: string }> = []
    for (let d = 1; d <= daysInMonth; d++) {
      const date = `${yearPart}-${monthPart}-${String(d).padStart(2, '0')}`
      const row = map.get(date)
      let status = 'Absent'
      if (row) {
        if (row.is_overtime) status = 'Overtime'
        else if (row.is_late) status = 'Late'
        else if (row.is_undertime) status = 'Undertime'
        else status = 'Present'
      }
      days.push({ day: d, status, date })
    }
    return { firstDay, days }
  }, [daily, monthPart, yearPart])

  const filedLeaves = useMemo(
    () => requests.filter((r) => r.request_type === 'leave' && (r.status === 'approved' || r.status === 'pending')).length,
    [requests],
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-indigo-50 to-cyan-50">
      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-6 md:px-6">
        <aside className="w-full max-w-xs rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-lg backdrop-blur">
          <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 p-4 text-white">
            <p className="text-sm font-semibold">Employee Portal</p>
            <p className="text-xs text-indigo-100">{profile.companyName}</p>
            <p className="mt-1 text-xs text-indigo-100">{profile.email}</p>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-indigo-200">{profile.role}</p>
          </div>
          <nav className="mt-4 space-y-2 text-sm">
            <button onClick={() => setMenu('dashboard')} className={menuButtonStyle('dashboard')}><span className="mr-2">🏠</span>Dashboard</button>
            <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Timekeeping</p>
            <button onClick={() => setMenu('timekeeping-calendar')} className={menuButtonStyle('timekeeping-calendar')}><span className="mr-2">🗓️</span>Attendance - Calendar</button>
            <button onClick={() => setMenu('timekeeping-list')} className={menuButtonStyle('timekeeping-list')}><span className="mr-2">🕒</span>Attendance - List</button>
            <p className="px-3 pt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Forms Management</p>
            <button onClick={() => setMenu('forms-filling')} className={menuButtonStyle('forms-filling')}><span className="mr-2">📝</span>Filling Form</button>
            <button onClick={() => setMenu('forms-approval')} className={menuButtonStyle('forms-approval')}><span className="mr-2">✅</span>Approval Form</button>
            <button onClick={() => setMenu('profile')} className={menuButtonStyle('profile')}><span className="mr-2">👤</span>Profile</button>
            <button onClick={() => setMenu('payslip')} className={menuButtonStyle('payslip')}><span className="mr-2">💳</span>Payslip</button>
          </nav>

          <button
            onClick={logout}
            className="mt-4 w-full rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm font-semibold text-rose-700 hover:bg-rose-100"
          >
            Sign out
          </button>
          <p className="mt-2 text-center text-xs text-slate-400">Simple modern palette: Indigo + Cyan + Slate</p>
        </aside>

        <main className="flex-1 space-y-6">
          {msg && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{msg}</p>}

          {menu === 'dashboard' && (
            <>
              <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="mt-1 text-sm text-slate-600">Time in/out, attendance summary, holidays, requests, payslips.</p>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => void timeAction('IN')} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Time In</button>
                  <button onClick={() => void timeAction('OUT')} className="rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-white">Time Out</button>
                </div>
              </section>

              <section className="grid gap-4 md:grid-cols-5">
                {[
                  ['Present', summary.present_days],
                  ['Late', summary.late_days],
                  ['Overtime', summary.overtime_days],
                  ['Undertime', summary.undertime_days],
                  ['Absent/AWOL', summary.absent_days],
                ].map(([label, val]) => (
                  <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                    <p className="mt-1 text-2xl font-bold text-slate-900">{val}</p>
                  </div>
                ))}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="font-semibold text-slate-900">Weekly Attendance Summary (Graph + Table)</h2>
                <div className="mt-3 grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    {[
                      ['Late', summary.late_days, 'bg-amber-400'],
                      ['Overtime', summary.overtime_days, 'bg-emerald-500'],
                      ['Undertime', summary.undertime_days, 'bg-rose-500'],
                    ].map(([name, value, cls]) => (
                      <div key={String(name)}>
                        <div className="mb-1 text-xs text-slate-600">{name}: {value}</div>
                        <div className="h-3 w-full rounded bg-slate-200">
                          <div className={`h-3 rounded ${cls}`} style={{ width: `${Math.min(100, Number(value) * 10)}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                  <table className="text-sm">
                    <thead><tr className="text-left text-slate-500"><th>Status</th><th>Count</th></tr></thead>
                    <tbody>
                      <tr><td>Late</td><td>{summary.late_days}</td></tr>
                      <tr><td>Overtime</td><td>{summary.overtime_days}</td></tr>
                      <tr><td>Undertime</td><td>{summary.undertime_days}</td></tr>
                      <tr><td>Absent/AWOL</td><td>{summary.absent_days}</td></tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="font-semibold text-slate-900">Holidays</h2>
                  <ul className="mt-3 space-y-2 text-sm">{HOLIDAYS.map((h) => <li key={h} className="rounded bg-slate-50 px-3 py-2">{h}</li>)}</ul>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h2 className="font-semibold text-slate-900">Recent Payslips</h2>
                  <ul className="mt-3 space-y-2 text-sm">
                    {payslips.slice(0, 3).map((p) => <li key={p.id} className="rounded bg-slate-50 px-3 py-2">{p.payslip_no} - Net {p.net_pay}</li>)}
                  </ul>
                </div>
              </section>
            </>
          )}

          {menu === 'timekeeping-calendar' && (
            <section className="grid gap-4 xl:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm xl:col-span-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="font-semibold text-slate-900">Attendance Calendar</h2>
                  <div className="flex items-center gap-2">
                    <select value={monthPart} onChange={(e) => setMonthPart(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
                      {MONTH_OPTIONS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                    </select>
                    <select value={yearPart} onChange={(e) => setYearPart(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
                      <option value="2025">2025</option>
                      <option value="2026">2026</option>
                      <option value="2027">2027</option>
                    </select>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-3 text-xs">
                  <span className="inline-flex items-center gap-1 text-slate-600"><span className="h-2 w-2 rounded-full bg-emerald-500" />Present</span>
                  <span className="inline-flex items-center gap-1 text-slate-600"><span className="h-2 w-2 rounded-full bg-amber-500" />Late</span>
                  <span className="inline-flex items-center gap-1 text-slate-600"><span className="h-2 w-2 rounded-full bg-sky-500" />Overtime</span>
                  <span className="inline-flex items-center gap-1 text-slate-600"><span className="h-2 w-2 rounded-full bg-rose-500" />Undertime</span>
                  <span className="inline-flex items-center gap-1 text-slate-600"><span className="h-2 w-2 rounded-full bg-slate-400" />Absent/AWOL</span>
                </div>

                <div className="mt-4 grid grid-cols-7 border border-slate-200 text-xs">
                  {WEEK_DAYS.map((d) => (
                    <div key={d} className="border-b border-r border-slate-200 bg-slate-50 px-2 py-2 font-semibold text-slate-600 last:border-r-0">{d}</div>
                  ))}
                  {Array.from({ length: calendarCells.firstDay }).map((_, i) => (
                    <div key={`blank-${i}`} className="min-h-20 border-r border-b border-slate-100 bg-slate-50/60 p-2 last:border-r-0" />
                  ))}
                  {calendarCells.days.map((c) => {
                    const badgeCls =
                      c.status === 'Present' ? 'bg-emerald-100 text-emerald-700' :
                      c.status === 'Late' ? 'bg-amber-100 text-amber-700' :
                      c.status === 'Overtime' ? 'bg-sky-100 text-sky-700' :
                      c.status === 'Undertime' ? 'bg-rose-100 text-rose-700' :
                      'bg-slate-200 text-slate-700'

                    return (
                      <div key={c.date} className="min-h-20 border-r border-b border-slate-100 p-2 last:border-r-0">
                        <p className="font-semibold text-slate-700">{c.day}</p>
                        <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${badgeCls}`}>{c.status}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="font-semibold text-slate-900">Current Month</p>
                  <div className="mt-3 rounded-lg border border-slate-200">
                    <div className="rounded-t-lg bg-indigo-700 px-3 py-2 text-xs font-semibold text-white">Filed Leaves</div>
                    <div className="px-3 py-3 text-sm text-slate-700">{filedLeaves > 0 ? `${filedLeaves} filed leave(s)` : 'No Filed Leaves'}</div>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="rounded-t-lg bg-indigo-700 px-3 py-2 text-xs font-semibold text-white">Holidays</div>
                  <ul className="space-y-1 px-3 py-2 text-xs text-slate-700">
                    {HOLIDAYS.map((h) => <li key={h}>{h}</li>)}
                  </ul>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="rounded-t-lg bg-indigo-700 px-3 py-2 text-xs font-semibold text-white">Workday Metrics</div>
                  <table className="w-full text-xs">
                    <thead className="text-slate-500"><tr><th className="py-2 text-left">AWOL</th><th className="py-2 text-left">Late</th><th className="py-2 text-left">Undertime</th></tr></thead>
                    <tbody><tr><td className="py-1">{summary.absent_days}</td><td className="py-1">{summary.late_days}</td><td className="py-1">{summary.undertime_days}</td></tr></tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {menu === 'timekeeping-list' && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900">Attendance List ({month})</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead><tr className="border-b border-slate-200 text-left text-slate-600"><th className="py-2 pr-4">DateTime</th><th className="py-2 pr-4">Type</th><th className="py-2 pr-4">Source</th></tr></thead>
                  <tbody>
                    {logs.map((l) => <tr key={l.id} className="border-b border-slate-100"><td className="py-2 pr-4">{l.logged_at}</td><td className="py-2 pr-4">{l.log_type}</td><td className="py-2 pr-4">{l.source}</td></tr>)}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {menu === 'forms-filling' && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900">Filling Form</h2>
              <form onSubmit={submitRequest} className="mt-3 flex flex-wrap gap-2">
                <select value={requestType} onChange={(e) => setRequestType(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
                  <option value="leave">Leave</option><option value="overtime">Overtime</option><option value="schedule_change">Schedule Change</option>
                </select>
                <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason" className="w-80 rounded-lg border border-slate-300 px-3 py-2 text-sm" />
                <button type="submit" className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Submit</button>
              </form>
            </section>
          )}

          {menu === 'forms-approval' && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900">Approval Form</h2>
              <p className="mt-2 text-sm text-slate-600">Track your submitted forms and their approval status.</p>
              <ul className="mt-3 space-y-2 text-sm">
                {requests.map((r) => <li key={r.id} className="rounded bg-slate-50 px-3 py-2">#{r.id} {r.request_type} - {r.status} ({r.reason || 'No reason'})</li>)}
              </ul>
            </section>
          )}

          {menu === 'profile' && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900">Profile</h2>
              <div className="mt-3 space-y-2 text-sm">
                <p><span className="font-semibold">Company:</span> {profile.companyName}</p>
                <p><span className="font-semibold">Email:</span> {profile.email}</p>
                <p><span className="font-semibold">Role:</span> {profile.role}</p>
              </div>
            </section>
          )}

          {menu === 'payslip' && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900">Payslip</h2>
              <div className="mt-3 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead><tr className="border-b border-slate-200 text-left text-slate-600"><th className="py-2 pr-4">Payslip No</th><th className="py-2 pr-4">Period</th><th className="py-2 pr-4">Gross</th><th className="py-2 pr-4">Deduction</th><th className="py-2 pr-4">Net</th></tr></thead>
                  <tbody>
                    {payslips.map((p) => <tr key={p.id} className="border-b border-slate-100"><td className="py-2 pr-4">{p.payslip_no}</td><td className="py-2 pr-4">{p.period_code} / #{p.run_no}</td><td className="py-2 pr-4">{p.gross_pay}</td><td className="py-2 pr-4">{p.total_deduct}</td><td className="py-2 pr-4">{p.net_pay}</td></tr>)}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}