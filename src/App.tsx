import type { ReactElement } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import ClientWorkspaceShellPage from './pages/client/ClientWorkspaceShellPage'
import ClientModulesPage from './pages/client/ClientModulesPage'
import ClientSubscriptionPage from './pages/client/ClientSubscriptionPage'
import ClientUsersPage from './pages/client/ClientUsersPage'
import ClientDepartmentsPage from './pages/client/ClientDepartmentsPage'
import ClientEmployeesPage from './pages/client/ClientEmployeesPage'
import PayrollOfficerDashboardPage from './pages/PayrollOfficerDashboardPage'
import HrManagerDashboardPage from './pages/HrManagerDashboardPage'
import SupervisorDashboardPage from './pages/SupervisorDashboardPage'
import EmployeeDashboardPage from './pages/EmployeeDashboardPage'

function ProtectedRoute({ children }: { children: ReactElement }) {
  const token = localStorage.getItem('hris_token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

function DashboardRouter() {
  const role = localStorage.getItem('hris_user_role') || ''
  if (role === 'system_admin' || role === 'admin') return <Navigate to="/app/admin" replace />
  if (role === 'client_superadmin') return <Navigate to="/app/client" replace />
  if (role === 'payroll_officer') return <Navigate to="/app/payroll" replace />
  if (role === 'hr_manager') return <Navigate to="/app/hr" replace />
  if (role === 'supervisor') return <Navigate to="/app/supervisor" replace />
  return <Navigate to="/app/employee" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      <Route path="/app/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
      <Route path="/app/admin" element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
      <Route path="/app/client" element={<ProtectedRoute><ClientWorkspaceShellPage /></ProtectedRoute>}>
        <Route index element={<Navigate to="/app/client/modules" replace />} />
        <Route path="modules" element={<ClientModulesPage />} />
        <Route path="subscription" element={<ClientSubscriptionPage />} />
        <Route path="users" element={<ClientUsersPage />} />
        <Route path="departments" element={<ClientDepartmentsPage />} />
        <Route path="employees" element={<ClientEmployeesPage />} />
      </Route>
      <Route path="/app/payroll" element={<ProtectedRoute><PayrollOfficerDashboardPage /></ProtectedRoute>} />
      <Route path="/app/hr" element={<ProtectedRoute><HrManagerDashboardPage /></ProtectedRoute>} />
      <Route path="/app/supervisor" element={<ProtectedRoute><SupervisorDashboardPage /></ProtectedRoute>} />
      <Route path="/app/employee" element={<ProtectedRoute><EmployeeDashboardPage /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}