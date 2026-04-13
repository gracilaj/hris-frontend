import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, setAuthToken } from '../api/client'
import PlatformAdminLayout, { type PlatformNavId } from '../components/PlatformAdminLayout'

type Inquiry = {
  id: number
  company_name: string
  contact_name: string
  email: string
  requested_plan_code: string | null
  status: string
}

function statusBadge(status: string) {
  const s = status.toLowerCase()
  if (s === 'approved') {
    return 'bg-emerald-100 text-emerald-800 ring-emerald-600/20'
  }
  if (s === 'pending') {
    return 'bg-amber-100 text-amber-900 ring-amber-500/25'
  }
  if (s === 'rejected') {
    return 'bg-rose-100 text-rose-800 ring-rose-500/20'
  }
  return 'bg-slate-100 text-slate-700 ring-slate-500/15'
}

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const [tab, setTab] = useState<PlatformNavId>('inquiries')
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionMsg, setActionMsg] = useState<string | null>(null)

  async function loadInquiries() {
    try {
      setLoading(true)
      setError(null)
      const res = await api.get('/admin/inquiries')
      setInquiries((res?.data?.data?.inquiries ?? []) as Inquiry[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inquiries')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('hris_token')
    if (!token) {
      navigate('/login')
      return
    }
    setAuthToken(token)
    void loadInquiries()
  }, [navigate])

  async function approveInquiry(id: number, companyName: string) {
    try {
      setActionMsg(null)
      await api.post(`/admin/inquiries/${id}/approve`, {
        login_key: companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        admin_password: 'Welcome123!',
      })
      setActionMsg(`Inquiry #${id} approved and company account created.`)
      await loadInquiries()
    } catch (err) {
      setActionMsg(err instanceof Error ? err.message : 'Approval failed')
    }
  }

  return (
    <PlatformAdminLayout active={tab} onNavigate={setTab}>
      {tab === 'inquiries' && (
        <div className="space-y-6">
          {loading && <p className="text-sm text-slate-600">Loading inquiries…</p>}
          {error && <p className="rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-800">{error}</p>}
          {actionMsg && (
            <p className="rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-900">{actionMsg}</p>
          )}

          {!loading && !error && (
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-900/5">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/90 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3.5">ID</th>
                      <th className="px-4 py-3.5">Company</th>
                      <th className="px-4 py-3.5">Contact</th>
                      <th className="px-4 py-3.5">Email</th>
                      <th className="px-4 py-3.5">Plan</th>
                      <th className="px-4 py-3.5">Status</th>
                      <th className="px-4 py-3.5">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inquiries.map((inq) => (
                      <tr key={inq.id} className="bg-white transition hover:bg-slate-50/80">
                        <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-slate-500">{inq.id}</td>
                        <td className="px-4 py-3 font-medium text-slate-900">{inq.company_name}</td>
                        <td className="px-4 py-3 text-slate-700">{inq.contact_name}</td>
                        <td className="px-4 py-3 text-slate-600">{inq.email}</td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700">
                            {inq.requested_plan_code || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${statusBadge(inq.status)}`}
                          >
                            {inq.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {inq.status !== 'approved' ? (
                            <button
                              type="button"
                              onClick={() => void approveInquiry(inq.id, inq.company_name)}
                              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm shadow-emerald-900/10 hover:bg-emerald-500"
                            >
                              Approve
                            </button>
                          ) : (
                            <span className="text-xs font-medium text-slate-400">Done</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'model' && (
        <div className="space-y-8">
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/5 sm:p-8">
            <h2 className="text-base font-bold text-slate-900">How roles fit together</h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
              The product separates <strong className="font-medium text-slate-800">oneHRIS staff</strong> (who run the SaaS) from{' '}
              <strong className="font-medium text-slate-800">each customer company</strong> (who run HR for their own people). Role codes in the API are fixed; labels below match what you see after login.
            </p>
            <ul className="mt-5 max-w-3xl space-y-3 text-sm text-slate-700">
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                <span>
                  <span className="font-semibold text-slate-900">Super Admin</span> (
                  <code className="rounded bg-slate-100 px-1 text-xs">system_admin</code>): highest platform privileges.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                <span>
                  <span className="font-semibold text-slate-900">Platform Admin</span> (
                  <code className="rounded bg-slate-100 px-1 text-xs">admin</code>): inquiries, approvals, provisioning.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                <span>
                  <span className="font-semibold text-slate-900">Company Admin</span> (
                  <code className="rounded bg-slate-100 px-1 text-xs">client_superadmin</code>): tenant owner—plans, users, departments.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                <span>
                  <span className="font-semibold text-slate-900">HR, Payroll, Supervisor, Employee</span>: in-company roles with dedicated workspaces.
                </span>
              </li>
            </ul>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm ring-1 ring-slate-900/5">
            <div className="border-b border-slate-100 bg-slate-50/80 px-6 py-4">
              <h2 className="text-base font-bold text-slate-900">Demo sign-in matrix</h2>
              <p className="mt-1 text-sm text-slate-600">
                Password for every account: <code className="rounded-md bg-white px-1.5 py-0.5 font-mono text-xs ring-1 ring-slate-200">password123</code>
              </p>
            </div>
            <div className="overflow-x-auto p-2">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3">Login key</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Role (UI)</th>
                    <th className="px-4 py-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {[
                    ['onehris', 'owner@onehris.com', 'Super Admin', 'Platform company'],
                    ['onehris', 'admin@onehris.com', 'Platform Admin', 'Same platform tenant'],
                    ['onehris-client', 'client.superadmin@onehris.com', 'Company Admin', 'Internal client tenant'],
                    ['demo', 'admin@example.com', 'Company Admin', 'Main demo tenant (no employee / attendance)'],
                    ['demo', 'employee1@demo.local', 'Employee', 'Login account in users; role link in user_roles → roles.code=employee'],
                    ['demo', 'hr.manager@demo.local', 'HR Manager', ''],
                    ['demo', 'payroll.officer@demo.local', 'Payroll Officer', ''],
                    ['demo', 'supervisor@demo.local', 'Supervisor', 'Operations'],
                    ['demo', 'supervisor.payroll@demo.local', 'Supervisor', 'Payroll dept.'],
                    ['demo', 'ops.staff1@demo.local', 'Employee', 'No user_roles row'],
                    ['demo', 'ops.staff2@demo.local', 'Employee', ''],
                    ['demo', 'payroll.staff1@demo.local', 'Employee', ''],
                    ['demo', 'hr.associate@demo.local', 'Employee', ''],
                  ].map(([key, em, r, note], i) => (
                    <tr key={i} className="hover:bg-slate-50/80">
                      <td className="whitespace-nowrap px-4 py-2.5 font-mono text-xs">{key}</td>
                      <td className="px-4 py-2.5">{em}</td>
                      <td className="px-4 py-2.5">{r}</td>
                      <td className="px-4 py-2.5 text-slate-600">{note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </PlatformAdminLayout>
  )
}
