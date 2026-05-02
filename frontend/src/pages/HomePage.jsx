import { Link } from 'react-router-dom'

function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ textAlign: 'center', color: 'white', maxWidth: 600 }}>
        <div style={{ fontSize: '4rem', marginBottom: 16 }}>📋</div>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: 16 }}>Team Task Manager</h1>
        <p style={{ fontSize: '1.125rem', marginBottom: 32, opacity: 0.9 }}>
          Collaborate on projects, manage tasks, and track your team&apos;s progress — all in one place.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/signup" className="btn btn-primary" style={{ padding: '12px 28px', fontSize: '1rem' }}>
            Get Started
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '12px 28px', fontSize: '1rem' }}>
            Sign In
          </Link>
        </div>
        <div style={{ marginTop: 48, display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['✅ JWT Auth', '👥 Team Management', '📊 Dashboard', '🔐 Role-Based Access'].map(feat => (
            <span key={feat} style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '6px 16px', fontSize: '0.875rem' }}>
              {feat}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HomePage
