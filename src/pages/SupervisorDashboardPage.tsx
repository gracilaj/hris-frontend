import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, setAuthToken } from '../api/client'
import CompanyWorkspaceLayout from '../components/CompanyWorkspaceLayout'

type RequestRow = { id: number; requester_email: string; request_type: string; status: string; reason: string }
type TrailRow = { id: number; action: string; notes: string | null; created_at: string; acted_by_email: string | null }

export default function SupervisorDashboardPage() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState<RequestRow[]>([])
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null)
  const [trail, setTrail] = useState<TrailRow[]>([])
  const [msg, setMsg] = useState<string | null>(null)

  async function load() {
    const res = await api.get('/requests')
    setRequests((res?.data?.data?.requests ?? []) as RequestRow[])
  }

  async function loadTrail(requestId: number) {
    const res = await api.get(`/requests/${requestId}/trail`)
    setTrail((res?.data?.data?.trail ?? []) as TrailRow[])
    setSelectedRequestId(requestId)
  }

  useEffect(() => {
    const token = localStorage.getItem('hris_token')
    if (!token) {
      navigate('/login')
      return
    }
    setAuthToken(token)
    void load()
  }, [navigate])

  async function decide(id: number, status: 'approved' | 'rejected') {
    await api.post(`/requests/${id}/decide`, { status })
    setMsg(`Request #${id} ${status}.`)
    await load()
    await loadTrail(id)
  }

  return (
    <CompanyWorkspaceLayout
      kind="supervisor"
      headerTitle="Supervisor"
      headerSubtitle="Approvals for your assigned departments."
    >
      <div className="mx-auto max-w-6xl space-y-6">
      {msg && <p className="rounded-xl border border-emerald-200 bg-emerald-50/90 px-4 py-3 text-sm text-emerald-900">{msg}</p>}

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
        <h2 className="font-semibold text-slate-900">Employee Requests</h2>
        <div className="mt-3 space-y-3">
          {requests.map((r) => (
            <div key={r.id} className="rounded-lg border border-slate-200 p-3">
              <p className="text-sm font-semibold text-slate-800">#{r.id} {r.request_type} - {r.requester_email}</p>
              <p className="text-xs text-slate-600">{r.reason || 'No reason provided'} | Status: {r.status}</p>
              <div className="mt-2 flex gap-2">
                {r.status === 'pending' && (
                  <>
                    <button onClick={() => void decide(r.id, 'approved')} className="rounded-md bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">Approve</button>
                    <button onClick={() => void decide(r.id, 'rejected')} className="rounded-md bg-rose-600 px-3 py-1 text-xs font-semibold text-white">Reject</button>
                  </>
                )}
                <button onClick={() => void loadTrail(r.id)} className="rounded-md bg-slate-700 px-3 py-1 text-xs font-semibold text-white">View trail</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
        <h2 className="font-semibold text-slate-900">Approval Trail {selectedRequestId ? `(Request #${selectedRequestId})` : ''}</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {trail.map((t) => (
            <li key={t.id} className="rounded-lg bg-slate-50 px-3 py-2">
              <span className="font-semibold">{t.action}</span> by {t.acted_by_email || 'system'} at {t.created_at}
              {t.notes ? ` - ${t.notes}` : ''}
            </li>
          ))}
          {trail.length === 0 && <li className="text-slate-500">Select a request to view history.</li>}
        </ul>
      </div>
      </div>
    </CompanyWorkspaceLayout>
  )
}