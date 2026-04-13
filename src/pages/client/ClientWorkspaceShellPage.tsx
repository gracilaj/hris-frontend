import { Navigate, Outlet } from 'react-router-dom'
import CompanyWorkspaceLayout from '../../components/CompanyWorkspaceLayout'
import { ClientWorkspaceProvider, useClientWorkspace } from './ClientWorkspaceContext'

const NAV = [
  { to: '/app/client/modules', label: 'Modules' },
  { to: '/app/client/subscription', label: 'Subscription' },
  { to: '/app/client/users', label: 'Users' },
  { to: '/app/client/departments', label: 'Departments' },
  { to: '/app/client/employees', label: 'Employees' },
]

function Shell() {
  const { email, role } = useClientWorkspace()
  return (
    <CompanyWorkspaceLayout
      kind="client"
      headerTitle="Company workspace"
      headerSubtitle={`Signed in as ${email} · ${role}`}
      navLinks={NAV}
    >
      <Outlet />
    </CompanyWorkspaceLayout>
  )
}

export default function ClientWorkspaceShellPage() {
  const role = localStorage.getItem('hris_user_role') || ''
  if (role !== 'client_superadmin') return <Navigate to="/app/dashboard" replace />
  return (
    <ClientWorkspaceProvider>
      <Shell />
    </ClientWorkspaceProvider>
  )
}
