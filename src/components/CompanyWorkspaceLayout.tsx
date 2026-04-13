import { Link, useNavigate } from 'react-router-dom'
import { ROLE_LABELS } from './DashboardHeader'

export type CompanyWorkspaceKind = 'client' | 'hr' | 'payroll' | 'supervisor'

const WORKSPACE_META: Record<
  CompanyWorkspaceKind,
  { navLabel: string; navHint: string }
> = {
  client: { navLabel: 'Company admin', navHint: 'Plans, users, org' },
  hr: { navLabel: 'HR', navHint: 'Employee records' },
  payroll: { navLabel: 'Payroll', navHint: 'Runs & payslips' },
  supervisor: { navLabel: 'Supervisor', navHint: 'Approvals' },
}

export type SectionLink = { id: string; label: string }

type CompanyWorkspaceLayoutProps = {
  kind: CompanyWorkspaceKind
  headerTitle: string
  headerSubtitle?: string
  /** Optional in-page anchors (e.g. company admin long page). */
  sectionLinks?: SectionLink[]
  children: React.ReactNode
}

export default function CompanyWorkspaceLayout({
  kind,
  headerTitle,
  headerSubtitle,
  sectionLinks,
  children,
}: CompanyWorkspaceLayoutProps) {
  const navigate = useNavigate()
  const role = localStorage.getItem('hris_user_role') || ''
  const email = localStorage.getItem('hris_user_email') || ''
  const companyName = localStorage.getItem('hris_company_name') || 'Company'
  const meta = WORKSPACE_META[kind]
  const roleLabel = ROLE_LABELS[role] ?? role

  function logout() {
    localStorage.clear()
    navigate('/login')
  }

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="flex w-56 shrink-0 flex-col border-r border-slate-800/50 bg-slate-900 text-slate-300 shadow-lg shadow-slate-900/15 lg:w-60">
        <div className="border-b border-slate-700/80 px-3 py-4 lg:px-4 lg:py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-xs font-bold text-emerald-300 ring-1 ring-emerald-500/30">
              {companyName.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-500">Workspace</p>
              <p className="truncate text-sm font-semibold text-white">{companyName}</p>
            </div>
          </div>
        </div>

        <div className="border-b border-slate-700/60 px-3 py-3 lg:px-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">This area</p>
          <p className="mt-1 text-sm font-semibold text-emerald-300/95">{meta.navLabel}</p>
          <p className="text-xs text-slate-500">{meta.navHint}</p>
        </div>

        {sectionLinks && sectionLinks.length > 0 && (
          <nav className="flex flex-col gap-0.5 border-b border-slate-700/60 p-2" aria-label="Page sections">
            <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">Jump to</p>
            {sectionLinks.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => scrollTo(s.id)}
                className="rounded-lg px-2 py-2 text-left text-xs font-medium text-slate-400 hover:bg-slate-800/90 hover:text-white"
              >
                {s.label}
              </button>
            ))}
          </nav>
        )}

        <div className="flex-1" />

        <div className="border-t border-slate-700/80 p-3 lg:p-4">
          <p className="truncate text-xs text-slate-500">{email}</p>
          <span className="mt-1.5 inline-flex rounded-md bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
            {roleLabel}
          </span>
          <div className="mt-3 flex flex-col gap-2">
            <Link
              to="/"
              className="rounded-lg border border-slate-600 px-2 py-2 text-center text-xs font-semibold text-slate-300 hover:bg-slate-800"
            >
              Home
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg bg-emerald-600 px-2 py-2 text-center text-xs font-semibold text-white hover:bg-emerald-500"
            >
              Log out
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col border-l border-emerald-600/20">
        <header className="sticky top-0 z-10 border-b border-slate-200/90 bg-white/95 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-8">
          <h1 className="text-lg font-bold tracking-tight text-slate-900">{headerTitle}</h1>
          {headerSubtitle ? <p className="mt-0.5 text-sm text-slate-500">{headerSubtitle}</p> : null}
        </header>
        <main className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  )
}
