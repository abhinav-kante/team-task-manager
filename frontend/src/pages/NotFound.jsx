import { Link } from 'react-router-dom'

function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: 16 }}>404</div>
        <h1 style={{ fontSize: '1.5rem', marginBottom: 8, color: 'var(--gray-900)' }}>Page not found</h1>
        <p style={{ color: 'var(--gray-500)', marginBottom: 24 }}>The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link to="/" className="btn btn-primary">Go Home</Link>
      </div>
    </div>
  )
}

export default NotFound
