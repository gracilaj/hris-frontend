import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, setAuthToken } from '../../api/client'
import type { CompanyModule, CompanyUser, Department, Employee, Plan } from './types'

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

type Ctx = {
  role: string
  email: string
  modules: CompanyModule[]
  employees: Employee[]
  plans: Plan[]
  users: CompanyUser[]
  departments: Department[]
  selectedPlan: string
  setSelectedPlan: (s: string) => void
  selectedDepartmentId: number
  setSelectedDepartmentId: (n: number) => void
  selectedSupervisorUserId: number
  setSelectedSupervisorUserId: (n: number) => void
  loading: boolean
  error: string | null
  message: string | null
  setMessage: (v: string | null) => void
  refresh: () => Promise<void>
  uploadSampleEmployees: () => Promise<void>
  changePlan: () => Promise<void>
  createUser: (email: string, password: string, role: string) => Promise<void>
  assignSupervisor: () => Promise<void>
}

const SAMPLE_UPLOAD = [
  { employee_no: 'EMP-0002', first_name: 'Juan', last_name: 'Dela Cruz', email: 'juan@demo.local', hire_date: '2026-04-01', employment_type: 'regular', status: 'active' },
  { employee_no: 'EMP-0003', first_name: 'Maria', last_name: 'Santos', email: 'maria@demo.local', hire_date: '2026-04-01', employment_type: 'regular', status: 'active' },
]

const ClientWorkspaceContext = createContext<Ctx | null>(null)

export function ClientWorkspaceProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const role = localStorage.getItem('hris_user_role') || 'employee'
  const email = localStorage.getItem('hris_user_email') || 'user'
  const [modules, setModules] = useState<CompanyModule[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [users, setUsers] = useState<CompanyUser[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [selectedPlan, setSelectedPlan] = useState('')
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(0)
  const [selectedSupervisorUserId, setSelectedSupervisorUserId] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function refresh() {
    try {
      setLoading(true)
      setError(null)
      const meResponse = await api.get('/me')
      const companyId = Number(meResponse?.data?.data?.company_id)
      if (!companyId) {
        setError('Unable to load company context.')
        return
      }

      const [moduleResponse, empRes, plansRes, usersRes, departmentsRes] = await Promise.all([
        api.get(`/companies/${companyId}/modules`),
        api.get('/employees'),
        api.get('/plans'),
        api.get('/company-users'),
        api.get('/departments'),
      ])

      const fromApi = (moduleResponse?.data?.data?.modules ?? []) as CompanyModule[]
      const byCode = new Map(fromApi.map((m) => [m.code, m]))
      setModules(Object.entries(TARGET_MODULES).map(([code, name]) => ({ code, name: byCode.get(code)?.name || name, active: Boolean(byCode.get(code)?.active) })))
      setEmployees((empRes?.data?.data?.employees ?? []) as Employee[])

      const fetchedPlans = (plansRes?.data?.data?.plans ?? []) as Plan[]
      setPlans(fetchedPlans)
      if (fetchedPlans.length > 0 && !selectedPlan) setSelectedPlan(fetchedPlans[0].code)

      const fetchedUsers = (usersRes?.data?.data?.users ?? []) as CompanyUser[]
      setUsers(fetchedUsers)

      const fetchedDepartments = (departmentsRes?.data?.data?.departments ?? []) as Department[]
      setDepartments(fetchedDepartments)
      if (fetchedDepartments.length > 0 && selectedDepartmentId === 0) setSelectedDepartmentId(fetchedDepartments[0].id)
      const firstSupervisor = fetchedUsers.find((u) => u.role_code === 'supervisor')
      if (firstSupervisor && selectedSupervisorUserId === 0) setSelectedSupervisorUserId(firstSupervisor.id)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
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
    void refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate])

  async function uploadSampleEmployees() {
    await api.post('/employees/upload', { employees: SAMPLE_UPLOAD })
    setMessage('Sample employees uploaded.')
    await refresh()
  }
  async function changePlan() {
    const res = await api.post('/subscriptions/select-plan', { plan_code: selectedPlan })
    setMessage(String(res?.data?.data?.message || 'Subscription updated'))
    await refresh()
  }
  async function createUser(userEmail: string, password: string, roleCode: string) {
    const res = await api.post('/company-users/create', { email: userEmail, password, role_code: roleCode })
    setMessage(`Created ${res?.data?.data?.email} as ${res?.data?.data?.role_code}`)
    await refresh()
  }
  async function assignSupervisor() {
    await api.post('/departments/assign-supervisor', { department_id: selectedDepartmentId, supervisor_user_id: selectedSupervisorUserId })
    setMessage('Supervisor mapped to department.')
    await refresh()
  }

  const value = useMemo(() => ({
    role, email, modules, employees, plans, users, departments, selectedPlan, setSelectedPlan,
    selectedDepartmentId, setSelectedDepartmentId, selectedSupervisorUserId, setSelectedSupervisorUserId,
    loading, error, message, setMessage, refresh, uploadSampleEmployees, changePlan, createUser, assignSupervisor,
  }), [role, email, modules, employees, plans, users, departments, selectedPlan, selectedDepartmentId, selectedSupervisorUserId, loading, error, message])

  return <ClientWorkspaceContext.Provider value={value}>{children}</ClientWorkspaceContext.Provider>
}

export function useClientWorkspace() {
  const ctx = useContext(ClientWorkspaceContext)
  if (!ctx) throw new Error('useClientWorkspace must be used inside ClientWorkspaceProvider')
  return ctx
}
