import { Link } from 'react-router-dom'

const MODULES = [
  'Payroll processing',
  'Taxes and compliance',
  'Employee onboarding',
  'Training and professional development',
  'Time and attendance',
  'Performance evaluation and reviews',
  'Benefits administration',
  'Employee self-service tools',
  'Scheduling',
  'Workforce forecasting',
]

const CHECKLIST = [
  'Payroll processing in minutes',
  'Built-in Philippine payroll compliance',
  'Employee self-service portal',
  'Attendance & timekeeping (web + QR mobile)',
  'Real-time payroll and HR reports',
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="bg-slate-900 py-2 text-center text-xs text-white">
        Open subscription: pick your modules · Annual billing discounts available
      </div>

      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-lg font-bold text-white">
              H
            </span>
            <span className="text-lg font-semibold tracking-tight">
              HRIS Subscription
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <a href="#modules" className="hover:text-emerald-700">
              Modules
            </a>
            <a href="#pricing" className="hover:text-emerald-700">
              Pricing
            </a>
            <a href="#how" className="hover:text-emerald-700">
              How it works
            </a>
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              to="/login"
              className="hidden text-sm font-medium text-slate-700 sm:inline hover:text-emerald-700"
            >
              Sign in
            </Link>
            <a
              href="#pricing"
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
            >
              Get free plan
            </a>
            <a
              href="#contact"
              className="hidden rounded-full border border-emerald-600 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50 md:inline"
            >
              Book a demo
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-slate-200 bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 text-white">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 md:items-center md:px-6 lg:py-20">
            <div>
              <p className="mb-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
                HR & payroll for Philippine businesses
              </p>
              <h1 className="mb-4 text-3xl font-extrabold leading-tight tracking-tight md:text-4xl lg:text-5xl">
                Payroll processing in{' '}
                <span className="text-sky-300">10 minutes</span>
              </h1>
              <p className="mb-6 max-w-xl text-sm text-emerald-100 md:text-base">
                Modular cloud HRIS: subscribe only to the modules you need—payroll,
                compliance, onboarding, time & attendance, and more—in one platform.
              </p>
              <ul className="mb-8 space-y-2 text-sm text-emerald-50">
                {CHECKLIST.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span
                      className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-xs"
                      aria-hidden
                    >
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-3">
                <a
                  href="#pricing"
                  className="rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-emerald-400"
                >
                  Get started
                </a>
                <a
                  href="#contact"
                  className="rounded-full border border-white/40 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Book a demo
                </a>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-md">
              <div className="overflow-hidden rounded-3xl bg-white p-1 shadow-2xl ring-1 ring-white/20">
                <div className="rounded-[1.35rem] bg-slate-100 p-4 text-slate-800">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase text-emerald-700">
                        Company workspace
                      </p>
                      <p className="text-xs text-slate-500">
                        Modules you enable appear here
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                      Multi-tenant SaaS
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="rounded-2xl bg-white p-3 shadow-sm">
                      <p className="font-semibold text-slate-800">Payroll run</p>
                      <p className="text-slate-500">7–10 min / cycle</p>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full w-4/5 rounded-full bg-emerald-500" />
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white p-3 shadow-sm">
                      <p className="font-semibold text-slate-800">QR attendance</p>
                      <p className="text-slate-500">Flutter app</p>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                        <div className="h-full w-3/4 rounded-full bg-sky-500" />
                      </div>
                    </div>
                    <div className="col-span-2 rounded-2xl bg-white p-3 shadow-sm">
                      <p className="font-semibold text-slate-800">Compliance</p>
                      <p className="text-slate-500">
                        BIR · SSS · PhilHealth · Pag-IBIG ready
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -left-2 top-6 max-w-[11rem] rounded-xl bg-rose-500 px-3 py-2 text-[11px] font-semibold text-white shadow-lg">
                7–10 min payroll done
              </div>
              <div className="absolute -right-1 bottom-10 max-w-[12rem] rounded-xl bg-amber-400 px-3 py-2 text-[11px] font-semibold text-amber-950 shadow-lg">
                10‑minute 13th month processing
              </div>
            </div>
          </div>
        </section>

        <section id="modules" className="bg-white py-14">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <h2 className="text-2xl font-bold text-slate-900 md:text-3xl">
              Only pay for the modules you need
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-slate-600 md:text-base">
              Each company chooses its subscription mix: core HR, payroll, taxes,
              time & attendance (with mobile QR), performance, benefits, and more.
            </p>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {MODULES.map((m) => (
                <div
                  key={m}
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm shadow-sm"
                >
                  <p className="font-semibold text-slate-800">{m}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Toggle on or off per subscription tier.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="bg-slate-900 py-16 text-slate-50">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <h2 className="text-2xl font-bold md:text-3xl">Plans that scale</h2>
            <p className="mt-2 text-sm text-slate-400 md:text-base">
              Per-employee pricing · module bundles · REST API on Enterprise
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              <article className="rounded-3xl border border-slate-700 bg-slate-800/80 p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Starter
                </p>
                <p className="mt-3 text-3xl font-bold">
                  ₱49{' '}
                  <span className="text-sm font-normal text-slate-400">
                    /emp/mo
                  </span>
                </p>
                <p className="mt-2 text-sm text-slate-300">
                  Core HR + time & attendance.
                </p>
                <ul className="mt-4 space-y-1.5 text-sm text-slate-300">
                  <li>• Employee records</li>
                  <li>• Time & attendance + QR (mobile)</li>
                  <li>• Basic reports</li>
                </ul>
                <Link
                  to="/login"
                  className="mt-6 block w-full rounded-full border border-slate-500 py-2.5 text-center text-sm font-semibold text-white hover:bg-slate-700"
                >
                  Choose plan
                </Link>
              </article>

              <article className="relative rounded-3xl border-2 border-emerald-500 bg-emerald-600/20 p-6 shadow-xl shadow-emerald-900/40">
                <span className="absolute right-4 top-4 rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  Most popular
                </span>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-200">
                  Growth
                </p>
                <p className="mt-3 text-3xl font-bold text-white">
                  ₱109{' '}
                  <span className="text-sm font-normal text-emerald-200">
                    /emp/mo
                  </span>
                </p>
                <p className="mt-2 text-sm text-emerald-100">
                  Payroll + PH compliance + ESS.
                </p>
                <ul className="mt-4 space-y-1.5 text-sm text-emerald-50">
                  <li>• Everything in Starter</li>
                  <li>• Payroll & tax tables</li>
                  <li>• Government remittance reports</li>
                  <li>• Employee self-service</li>
                </ul>
                <Link
                  to="/login"
                  className="mt-6 block w-full rounded-full bg-emerald-500 py-2.5 text-center text-sm font-semibold text-white hover:bg-emerald-400"
                >
                  Choose plan
                </Link>
              </article>

              <article className="rounded-3xl border border-slate-700 bg-slate-800/80 p-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Enterprise
                </p>
                <p className="mt-3 text-3xl font-bold">Custom</p>
                <p className="mt-2 text-sm text-slate-300">
                  All modules · forecasting · priority support.
                </p>
                <ul className="mt-4 space-y-1.5 text-sm text-slate-300">
                  <li>• Full module library</li>
                  <li>• Workforce forecasting & scheduling</li>
                  <li>• SLA & dedicated onboarding</li>
                </ul>
                <a
                  href="#contact"
                  className="mt-6 block w-full rounded-full border border-slate-500 py-2.5 text-center text-sm font-semibold text-white hover:bg-slate-700"
                >
                  Contact sales
                </a>
              </article>
            </div>
          </div>
        </section>

        <section id="how" className="bg-white py-14">
          <div className="mx-auto max-w-7xl px-4 md:px-6">
            <h2 className="text-2xl font-bold text-slate-900">How it works</h2>
            <div className="mt-8 grid gap-8 md:grid-cols-3">
              <div>
                <span className="text-sm font-bold text-emerald-600">1</span>
                <h3 className="mt-1 font-semibold text-slate-900">
                  Create your company
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Register, pick a plan, and select the HR modules to activate.
                </p>
              </div>
              <div>
                <span className="text-sm font-bold text-emerald-600">2</span>
                <h3 className="mt-1 font-semibold text-slate-900">
                  Import your people
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Add employees and locations; deploy QR codes for attendance.
                </p>
              </div>
              <div>
                <span className="text-sm font-bold text-emerald-600">3</span>
                <h3 className="mt-1 font-semibold text-slate-900">
                  Run payroll & compliance
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Process payroll in minutes with built-in Philippine rules.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer
        id="contact"
        className="border-t border-slate-200 bg-slate-100 py-8 text-sm text-slate-600"
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
          <span>© {new Date().getFullYear()} HRIS Subscription</span>
          <div className="flex gap-6">
            <span className="text-slate-500">API: CodeIgniter 4 · Web: React · Mobile: Flutter</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
