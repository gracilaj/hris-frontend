import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, setAuthToken } from '../api/client'
import CompanyWorkspaceLayout from '../components/CompanyWorkspaceLayout'

type Employee = { id: number; employee_no: string; first_name: string; last_name: string; status: string }

export default function HrManagerDashboardPage() {
  const navigate = useNavigate()
  const [employees, setEmployees] = useState<Employee[]>([])

  useEffect(() => {
    const token = localStorage.getItem('hris_token')
    if (!token) {
      navigate('/login')
      return
    }
    setAuthToken(token)
    void (async () => {
      const res = await api.get('/employees')
      setEmployees((res?.data?.data?.employees ?? []) as Employee[])
    })()
  }, [navigate])

  return (
    <CompanyWorkspaceLayout
      kind="hr"
      headerTitle="HR Manager"
      headerSubtitle="Employee records, onboarding, and people data."
    >
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
          <h2 className="font-semibold text-slate-900">Employees</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {employees.map((e) => (
              <li key={e.id} className="rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2.5 text-slate-800">
                {e.employee_no} — {e.first_name} {e.last_name}{' '}
                <span className="text-slate-500">({e.status})</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </CompanyWorkspaceLayout>
  )
}