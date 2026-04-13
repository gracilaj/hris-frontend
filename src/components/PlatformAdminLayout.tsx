import { Link, useNavigate } from 'react-router-dom'
import { ROLE_LABELS } from './DashboardHeader'

export type PlatformNavId = 'inquiries' | 'model'

type NavItem = {
  id: PlatformNavId
  label: string
  description: string
}

const NAV: NavItem[] = [
  { id: 'inquiries', label: 'Inquiries', description: 'Review & approve tenants' },
  { id: 'model', label: 'Roles & accounts', description: 'Model & demo sign-ins' },
]

type PlatformAdminLayoutProps = {
  active: PlatformNavId
  onNavigate: (id: PlatformNavId) => void
  children: React.ReactNode
}

export default function PlatformAdminLayout({ active, onNavigate, children }: PlatformAdminLayoutProps) {
  const navigate = useNavigate()
  const role = localStorage.getItem('hris_user_role') || ''
  const email = localStorage.getItem('hris_user_email') || ''
  const roleLabel = ROLE_LABELS[role] ?? role

  function logout() {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="flex w-64 shrink-0 flex-col border-r border-slate-800/60 bg-slate-900 text-slate-300 shadow-xl shadow-slate-900/20">
        <div className="border-b border-slate-700/80 px-4 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-sm font-bold tracking-tight text-white shadow-lg shadow-emerald-900/30">
              1H
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">oneHRIS</p>
              <p className="text-xs text-slate-500">Platform console</p>
            </div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-0.5 p-3" aria-label="Platform sections">
          {NAV.map((item) => {
            const isActive = active === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`rounded-xl px-3 py-2.5 text-left transition ${
                  isActive
                    ? 'bg-emerald-500/15 text-white ring-1 ring-emerald-500/40'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                }`}
              >
                <span className="block text-sm font-semibold">{item.label}</span>
                <span className="mt-0.5 block text-xs font-normal text-slate-500">{item.description}</span>
              </button>
            )
          })}
        </nav>

        <div className="border-t border-slate-700/80 p-4">
          <p className="truncate text-xs font-medium text-slate-400">{email}</p>
          <span className="mt-2 inline-flex rounded-lg bg-slate-800 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-300/90">
            {roleLabel}
          </span>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              to="/"
              className="rounded-lg border border-slate-600 px-3 py-2 text-center text-xs font-semibold text-slate-300 hover:border-slate-500 hover:bg-slate-800"
            >
              Home
            </Link>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg bg-emerald-600 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-emerald-500"
            >
              Log out
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white/90 px-6 py-4 backdrop-blur-md">
          <div className="mx-auto max-w-5xl">
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              {active === 'inquiries' ? 'Company inquiries' : 'Roles & demo accounts'}
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">
              {active === 'inquiries'
                ? 'Approve new tenants and provision company admin accounts.'
                : 'How access is modeled and seeded credentials for QA.'}
            </p>
          </div>
        </header>

        <main className="flex-1 overflow-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
