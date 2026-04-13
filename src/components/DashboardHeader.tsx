import { Link, useNavigate } from 'react-router-dom'

/** Maps API role codes to short labels shown in the UI. */
export const ROLE_LABELS: Record<string, string> = {
  system_admin: 'Super Admin',
  admin: 'Platform Admin',
  client_superadmin: 'Company Admin',
  hr_manager: 'HR Manager',
  payroll_officer: 'Payroll Officer',
  supervisor: 'Supervisor',
  employee: 'Employee',
}

type DashboardHeaderProps = {
  /** Shown under the company / product name */
  pageTitle?: string
  /** Extra line under page title (e.g. scope description) */
  pageSubtitle?: string
}

export default function DashboardHeader({ pageTitle, pageSubtitle }: DashboardHeaderProps) {
  const navigate = useNavigate()
  const role = localStorage.getItem('hris_user_role') || 'employee'
  const email = localStorage.getItem('hris_user_email') || ''
  const companyName = localStorage.getItem('hris_company_name') || 'oneHRIS'
  const companyLogo = localStorage.getItem('hris_company_logo') || ''
  const roleLabel = ROLE_LABELS[role] ?? role

  function logout() {
    localStorage.clear()
    navigate('/login')
  }

  const isPlatform = role === 'system_admin' || role === 'admin'

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {companyLogo ? (
            <img src={companyLogo} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover" />
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-xs font-bold text-emerald-700">
              {isPlatform ? '1H' : 'Co'}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{isPlatform ? 'oneHRIS platform' : companyName}</p>
            {pageTitle && <p className="truncate text-xs text-slate-600">{pageTitle}</p>}
            {pageSubtitle && <p className="mt-0.5 truncate text-xs text-slate-500">{pageSubtitle}</p>}
            <p className="mt-1 truncate text-xs text-slate-500">
              <span className="font-medium text-slate-700">{email}</span>
              <span className="mx-1.5 text-slate-300">·</span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">{roleLabel}</span>
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link to="/" className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
            Home
          </Link>
          <button
            type="button"
            onClick={logout}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  )
}
