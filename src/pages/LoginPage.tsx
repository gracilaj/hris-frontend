import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, setAuthToken } from '../api/client'

type CompanyPreview = {
  id: number
  name: string
  login_key: string
  approval_status: string
}

function routeForRole(role: string): string {
  switch (role) {
    case 'system_admin':
    case 'admin':
      return '/app/admin'
    case 'client_superadmin':
      return '/app/client'
    case 'payroll_officer':
      return '/app/payroll'
    case 'hr_manager':
      return '/app/hr'
    case 'supervisor':
      return '/app/supervisor'
    default:
      return '/app/employee'
  }
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [loginKey, setLoginKey] = useState('demo')
  const [companyPreview, setCompanyPreview] = useState<CompanyPreview | null>(null)
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('password123')
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function lookupCompany() {
    if (!loginKey.trim()) {
      setCompanyPreview(null)
      return
    }
    try {
      const { data } = await api.get(`/public/company/${encodeURIComponent(loginKey.trim())}`)
      setCompanyPreview((data?.data?.company ?? null) as CompanyPreview | null)
      setError(null)
    } catch {
      setCompanyPreview(null)
      setError('Company login key not found.')
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    try {
      const { data } = await api.post('/auth/login', { email, password, login_key: loginKey.trim() })

      if (data.status === 'success' && data.data?.token) {
        const token = String(data.data.token)
        const role = String(data.data?.user?.role ?? 'employee')
        const userEmail = String(data.data?.user?.email ?? email)
        const companyName = String(data.data?.company?.name ?? '')
        const companyLoginKey = data.data?.company?.login_key ? String(data.data.company.login_key) : loginKey.trim()
        const companyModules = Array.isArray(data.data?.enabled_modules)
          ? data.data.enabled_modules
          : Array.isArray(data.data?.modules)
            ? data.data.modules
            : []

        setAuthToken(token)
        localStorage.setItem('hris_token', token)
        localStorage.setItem('hris_user_role', role)
        localStorage.setItem('hris_user_email', userEmail)
        localStorage.setItem('hris_company_name', companyName)
        localStorage.removeItem('hris_company_logo')
        localStorage.setItem('hris_company_login_key', companyLoginKey)
        localStorage.setItem('hris_company_modules', JSON.stringify(companyModules))

        setMessage('Signed in. Redirecting to dashboard...')
        navigate(routeForRole(role), { replace: true })
        return
      }

      setError('Login failed')
    } catch (err: unknown) {
      let msg = 'Login failed'
      if (err && typeof err === 'object' && 'response' in err) {
        const data = (err as { response?: { data?: { message?: string } } }).response?.data
        msg = typeof data?.message === 'string' && data.message.trim() !== '' ? data.message : msg
      }
      setError(msg || 'Login failed — is the API URL correct and the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-4 py-4 md:px-6">
        <Link to="/" className="text-sm font-semibold text-emerald-700 hover:underline">Back to home</Link>
      </header>
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <h1 className="text-xl font-bold text-slate-900">Sign in</h1>
          <p className="mt-1 text-sm text-slate-500">Enter your company login key, then your account email and password.</p>

          <div className="mt-4 rounded-xl border border-slate-200 p-4">
            <label htmlFor="loginKey" className="block text-sm font-medium text-slate-700">Company login key</label>
            <div className="mt-2 flex gap-2">
              <input id="loginKey" value={loginKey} onChange={(e) => setLoginKey(e.target.value)} className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" placeholder="e.g. demo, onehris, onehris-client" />
              <button type="button" onClick={lookupCompany} className="rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-700">Verify</button>
            </div>
            {companyPreview && (
              <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-800">
                <p className="font-semibold text-slate-900">{companyPreview.name}</p>
                <p className="mt-1 text-xs text-slate-600">
                  Key <span className="font-mono">{companyPreview.login_key}</span>
                  {companyPreview.approval_status ? (
                    <span className="text-slate-500"> · {companyPreview.approval_status}</span>
                  ) : null}
                </p>
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">Email</label>
              <input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
              <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
            </div>
            <button type="submit" disabled={loading} className="w-full rounded-full bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60">{loading ? 'Signing in...' : 'Sign in'}</button>
          </form>

          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            Demo login keys: <span className="font-mono text-slate-700">onehris</span> (platform staff),{' '}
            <span className="font-mono text-slate-700">onehris-client</span> (sample company admin),{' '}
            <span className="font-mono text-slate-700">demo</span> (full company hierarchy). Password for seeded users:{' '}
            <span className="font-mono text-slate-700">password123</span>. Open <strong className="font-medium text-slate-700">Roles &amp; demo accounts</strong> on the platform hub after signing in as a platform user.
          </p>
          {message && <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">{message}</p>}
          {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        </div>
      </div>
    </div>
  )
}