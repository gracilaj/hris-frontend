import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, setAuthToken } from '../api/client'
import CompanyWorkspaceLayout from '../components/CompanyWorkspaceLayout'

type CompanyModule = { code: string; name: string; active: boolean }
type Employee = { id: number; employee_no: string; first_name: string; last_name: string; email: string | null; status: string }
type CompanyUser = { id: number; email: string; status: string; role_code: string | null }
type Plan = { code: string; name: string; price_per_employee_monthly: number }
type Department = { id: number; name: string; supervisor_user_id: number | null; supervisor_email: string | null }

const TARGET_MODULES: Record<string, string> = {
  payroll: 'Payroll processing',
  taxes_compliance: 'Taxes and compliance',
  onboarding: 'Employee onboarding',
  training: 'Training and professional development',
  time_attendance: 'Time and attendance',
  performance: 'Performance evaluation and reviews',
  benefits: 'Benefits administration',
  employee_self_service: 'Employee self-service tools',
  scheduling: 'Scheduling',
  workforce_forecasting: 'Workforce forecasting',
}

const SAMPLE_UPLOAD = [
  { employee_no: 'EMP-0002', first_name: 'Juan', last_name: 'Dela Cruz', email: 'juan@demo.local', hire_date: '2026-04-01', employment_type: 'regular', status: 'active' },
  { employee_no: 'EMP-0003', first_name: 'Maria', last_name: 'Santos', email: 'maria@demo.local', hire_date: '2026-04-01', employment_type: 'regular', status: 'active' },
]

const CLIENT_SECTION_LINKS = [
  { id: 'sec-modules', label: 'Modules' },
  { id: 'sec-subscription', label: 'Subscription' },
  { id: 'sec-users', label: 'Users' },
  { id: 'sec-departments', label: 'Departments' },
  { id: 'sec-employees', label: 'Employees' },
]

export default function ClientDashboardPage() {
  const navigate = useNavigate()
  const role = localStorage.getItem('hris_user_role') || 'employee'
  const email = localStorage.getItem('hris_user_email') || 'user'
  const [modules, setModules] = useState<CompanyModule[]>([])
  const [loadingModules, setLoadingModules] = useState(true)
  const [moduleError, setModuleError] = useState<string | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [employeeError, setEmployeeError] = useState<string | null>(null)
  const [uploadMessage, setUploadMessage] = useState<string | null>(null)
  const [plans, setPlans] = useState<Plan[]>([])
  const [selectedPlan, setSelectedPlan] = useState('')
  const [subMsg, setSubMsg] = useState<string | null>(null)
  const [users, setUsers] = useState<CompanyUser[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number>(0)
  const [selectedSupervisorUserId, setSelectedSupervisorUserId] = useState<number>(0)
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [newUserRole, setNewUserRole] = useState('employee')
  const [userMsg, setUserMsg] = useState<string | null>(null)

  async function loadAll() {
    try {
      setLoadingModules(true)
      setModuleError(null)
      const meResponse = await api.get('/me')
      const companyId = Number(meResponse?.data?.data?.company_id)
      if (!companyId) {
        setModuleError('Unable to load company context.')
        return
      }

      const moduleResponse = await api.get(`/companies/${companyId}/modules`)
      const fromApi = (moduleResponse?.data?.data?.modules ?? []) as CompanyModule[]
      const byCode = new Map(fromApi.map((m) => [m.code, m]))
      const normalized: CompanyModule[] = Object.entries(TARGET_MODULES).map(([code, name]) => {
        const match = byCode.get(code)
        return { code, name: match?.name || name, active: Boolean(match?.active) }
      })
      setModules(normalized)

      const empRes = await api.get('/employees')
      setEmployees((empRes?.data?.data?.employees ?? []) as Employee[])

      const plansRes = await api.get('/plans')
      const fetchedPlans = (plansRes?.data?.data?.plans ?? []) as Plan[]
      setPlans(fetchedPlans)
      if (fetchedPlans.length > 0 && !selectedPlan) {
        setSelectedPlan(fetchedPlans[0].code)
      }

      const usersRes = await api.get('/company-users')
      const fetchedUsers = (usersRes?.data?.data?.users ?? []) as CompanyUser[]
      setUsers(fetchedUsers)

      const departmentsRes = await api.get('/departments')
      const fetchedDepartments = (departmentsRes?.data?.data?.departments ?? []) as Department[]
      setDepartments(fetchedDepartments)
      if (fetchedDepartments.length > 0 && selectedDepartmentId === 0) {
        setSelectedDepartmentId(fetchedDepartments[0].id)
      }
      const firstSupervisor = fetchedUsers.find((u) => u.role_code === 'supervisor')
      if (firstSupervisor && selectedSupervisorUserId === 0) {
        setSelectedSupervisorUserId(firstSupervisor.id)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load dashboard data'
      setModuleError(msg)
      setEmployeeError(msg)
    } finally {
      setLoadingModules(false)
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('hris_token')
    if (!token) {
      navigate('/login')
      return
    }
    setAuthToken(token)
    void loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate])

  const activeCount = useMemo(() => modules.filter((m) => m.active).length, [modules])

  async function uploadSampleEmployees() {
    try {
      setUploadMessage(null)
      setEmployeeError(null)
      const res = await api.post('/employees/upload', { employees: SAMPLE_UPLOAD })
      setUploadMessage(`Uploaded employees: ${res?.data?.data?.inserted ?? 0}`)
      const empRes = await api.get('/employees')
      setEmployees((empRes?.data?.data?.employees ?? []) as Employee[])
    } catch (err) {
      setEmployeeError(err instanceof Error ? err.message : 'Employee upload failed')
    }
  }

  async function changePlan() {
    try {
      setSubMsg(null)
      const res = await api.post('/subscriptions/select-plan', { plan_code: selectedPlan })
      setSubMsg(String(res?.data?.data?.message || 'Subscription updated'))
      await loadAll()
    } catch (err) {
      setSubMsg(err instanceof Error ? err.message : 'Failed to update subscription')
    }
  }

  async function createUser() {
    if (!newUserEmail.trim() || newUserPassword.length < 8) {
      setUserMsg('Enter email and password (min 8 chars).')
      return
    }
    try {
      setUserMsg(null)
      const res = await api.post('/company-users/create', {
        email: newUserEmail.trim(),
        password: newUserPassword,
        role_code: newUserRole,
      })
      setUserMsg(`Created ${res?.data?.data?.email} as ${res?.data?.data?.role_code}`)
      setNewUserEmail('')
      setNewUserPassword('')
      const usersRes = await api.get('/company-users')
      setUsers((usersRes?.data?.data?.users ?? []) as CompanyUser[])
    } catch (err) {
      setUserMsg(err instanceof Error ? err.message : 'Failed to create user')
    }
  }

  async function assignSupervisor() {
    if (selectedDepartmentId <= 0 || selectedSupervisorUserId <= 0) {
      setUserMsg('Select department and supervisor first.')
      return
    }
    try {
      await api.post('/departments/assign-supervisor', {
        department_id: selectedDepartmentId,
        supervisor_user_id: selectedSupervisorUserId,
      })
      setUserMsg('Supervisor mapped to department.')
      const departmentsRes = await api.get('/departments')
      setDepartments((departmentsRes?.data?.data?.departments ?? []) as Department[])
    } catch (err) {
      setUserMsg(err instanceof Error ? err.message : 'Failed to assign supervisor')
    }
  }

  return (
    <CompanyWorkspaceLayout
      kind="client"
      headerTitle="Company overview"
      headerSubtitle={`Signed in as ${email} · ${role}`}
      sectionLinks={CLIENT_SECTION_LINKS}
    >
      <div className="mx-auto max-w-6xl space-y-8">
        <p className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-600/15">
          Active modules: {activeCount} / {Object.keys(TARGET_MODULES).length}
        </p>

        {loadingModules && <p className="text-sm text-slate-600">Loading subscribed modules…</p>}
        {moduleError && <p className="rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-800">{moduleError}</p>}

        {!loadingModules && !moduleError && (
          <div id="sec-modules" className="scroll-mt-28 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {modules.map((module) => (
              <section key={module.code} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ring-1 ring-slate-900/5">
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-semibold text-slate-900">{module.name}</h2>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${module.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{module.active ? 'Active' : 'Not subscribed'}</span>
                </div>
                <p className="mt-2 text-xs text-slate-500">{module.code}</p>
              </section>
            ))}
          </div>
        )}

        <section id="sec-subscription" className="scroll-mt-28 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
          <h2 className="text-lg font-semibold text-slate-900">Subscription</h2>
          <p className="mt-2 text-sm text-slate-600">Company admins can change the active plan (subject to your business rules).</p>
          <div className="mt-3 flex items-center gap-2">
            <select value={selectedPlan} onChange={(e) => setSelectedPlan(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
              {plans.map((p) => (
                <option key={p.code} value={p.code}>{p.name} ({p.code})</option>
              ))}
            </select>
            <button onClick={changePlan} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Apply plan</button>
          </div>
          {subMsg && <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{subMsg}</p>}
        </section>

        <section id="sec-users" className="scroll-mt-28 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
          <h2 className="text-lg font-semibold text-slate-900">Company Users</h2>
          <p className="mt-2 text-sm text-slate-600">Create payroll officers, HR managers, supervisors, and employees.</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="new.user@company.com" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <input type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} placeholder="Temporary password" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option value="client_superadmin">Company Admin</option>
              <option value="hr_manager">HR Manager</option>
              <option value="payroll_officer">Payroll Officer</option>
              <option value="supervisor">Supervisor</option>
              <option value="employee">Employee</option>
            </select>
            <button onClick={createUser} className="rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">Create user</button>
          </div>
          {userMsg && <p className="mt-3 rounded-lg bg-slate-100 p-3 text-sm text-slate-800">{userMsg}</p>}

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Role</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100">
                    <td className="py-2 pr-4">{u.email}</td>
                    <td className="py-2 pr-4">{u.role_code || '-'}</td>
                    <td className="py-2 pr-4">{u.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="sec-departments" className="scroll-mt-28 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
          <h2 className="text-lg font-semibold text-slate-900">Supervisor Department Mapping</h2>
          <p className="mt-2 text-sm text-slate-600">Assign which department each supervisor can approve.</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select value={selectedDepartmentId} onChange={(e) => setSelectedDepartmentId(Number(e.target.value))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <select value={selectedSupervisorUserId} onChange={(e) => setSelectedSupervisorUserId(Number(e.target.value))} className="rounded-lg border border-slate-300 px-3 py-2 text-sm">
              {users.filter((u) => u.role_code === 'supervisor').map((u) => (
                <option key={u.id} value={u.id}>{u.email}</option>
              ))}
            </select>
            <button onClick={assignSupervisor} className="rounded-full bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700">Assign</button>
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {departments.map((d) => (
              <li key={d.id} className="rounded-lg bg-slate-50 px-3 py-2">
                {d.name}: {d.supervisor_email || 'Unassigned'}
              </li>
            ))}
          </ul>
        </section>

        <section id="sec-employees" className="scroll-mt-28 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Employee Upload</h2>
            <button onClick={uploadSampleEmployees} className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Upload sample employees</button>
          </div>
          <p className="mt-2 text-sm text-slate-600">Company admins upload employees after approval. This sends sample data to /employees/upload.</p>
          {uploadMessage && <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{uploadMessage}</p>}
          {employeeError && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">{employeeError}</p>}

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-slate-600">
                  <th className="py-2 pr-4">Employee No</th>
                  <th className="py-2 pr-4">Name</th>
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} className="border-b border-slate-100">
                    <td className="py-2 pr-4">{emp.employee_no}</td>
                    <td className="py-2 pr-4">{emp.first_name} {emp.last_name}</td>
                    <td className="py-2 pr-4">{emp.email || '-'}</td>
                    <td className="py-2 pr-4">{emp.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </CompanyWorkspaceLayout>
  )
}