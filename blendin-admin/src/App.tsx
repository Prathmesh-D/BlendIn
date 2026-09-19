import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import './App.css'

// Initialize Supabase (User must supply env vars)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'
const supabase = createClient(supabaseUrl, supabaseKey)

function App() {
  const [session, setSession] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const [packs, setPacks] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
  }, [])

  useEffect(() => {
    if (session) {
      loadDashboardData()
    }
  }, [session])

  const loadDashboardData = async () => {
    // Load packs pending review or hidden
    const { data: packsData } = await supabase
      .from('community_packs')
      .select('*, profiles!community_packs_creator_id_fkey(display_name)')
      .or('is_approved.eq.false,is_flagged.eq.true')
      .order('created_at', { ascending: false })

    setPacks(packsData || [])

    // Load active reports
    const { data: reportsData } = await supabase
      .from('pack_reports')
      .select('*, community_packs!pack_reports_word_pack_id_fkey(name), profiles!pack_reports_reporter_user_id_fkey(display_name)')
      .order('created_at', { ascending: false })

    setReports(reportsData || [])
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
    setLoading(false)
  }

  const handleApprove = async (packId: string) => {
    await supabase.from('community_packs').update({ is_approved: true, is_flagged: false }).eq('id', packId)
    await supabase.from('moderation_actions').insert({ word_pack_id: packId, action: 'approved', triggered_by: session?.user?.id, reason: 'Admin approved' })
    loadDashboardData()
  }

  const handleRemove = async (packId: string) => {
    await supabase.from('community_packs').delete().eq('id', packId)
    loadDashboardData()
  }

  if (!session) {
    return (
      <div className="login-container">
        <h2>BlendIn Admin Login</h2>
        {(supabaseUrl === 'https://placeholder.supabase.co') && (
          <div style={{ color: 'red', marginBottom: '1rem', maxWidth: 300, textAlign: 'center' }}>
            Warning: VITE_SUPABASE_URL is not set in your .env file. The dashboard will not work.
          </div>
        )}
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Admin Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
          <button type="submit" disabled={loading}>{loading ? 'Loading...' : 'Login'}</button>
        </form>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <header>
        <h1>BlendIn Moderation Dashboard</h1>
        <button onClick={() => supabase.auth.signOut()}>Sign Out</button>
      </header>

      <main>
        <section>
          <h2>Review Queue (Flagged or Unapproved)</h2>
          <table>
            <thead>
              <tr>
                <th>Pack Name</th>
                <th>Creator</th>
                <th>Words</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {packs.map(pack => (
                <tr key={pack.id}>
                  <td>{pack.name}</td>
                  <td>{pack.profiles?.display_name || 'Unknown'}</td>
                  <td>{pack.word_count}</td>
                  <td>
                    {pack.is_flagged ? <span className="badge red">Flagged</span> : <span className="badge yellow">Pending</span>}
                  </td>
                  <td>
                    <button onClick={() => handleApprove(pack.id)}>Approve</button>
                    <button onClick={() => handleRemove(pack.id)} className="danger">Remove</button>
                  </td>
                </tr>
              ))}
              {packs.length === 0 && <tr><td colSpan={5}>Queue is empty.</td></tr>}
            </tbody>
          </table>
        </section>

        <section>
          <h2>Recent Reports</h2>
          <table>
            <thead>
              <tr>
                <th>Pack</th>
                <th>Reporter</th>
                <th>Reason</th>
                <th>Weight</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(report => (
                <tr key={report.id}>
                  <td>{report.community_packs?.name || report.word_pack_id}</td>
                  <td>{report.profiles?.display_name || 'Unknown'}</td>
                  <td>{report.reason}</td>
                  <td>{report.reporter_graph_weight}</td>
                  <td>{report.notes || '-'}</td>
                </tr>
              ))}
              {reports.length === 0 && <tr><td colSpan={5}>No reports found.</td></tr>}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  )
}

export default App
