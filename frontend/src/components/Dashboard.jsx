import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { fetchDashboard } from '../features/dashboard/dashboardSlice'
import { STATUS_COLORS } from '../utils/constants'

function Dashboard() {
  const dispatch = useDispatch()
  const { data, loading } = useSelector((state) => state.dashboard)
  const { user } = useSelector((state) => state.auth)

  useEffect(() => { dispatch(fetchDashboard()) }, [dispatch])

  if (loading || !data) return <div className="loading">Loading dashboard...</div>

  const { stats, recent_tasks, recent_projects, overdue_tasks } = data

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Welcome, {user?.full_name || user?.email} 👋</h1>
        <Link to="/projects" className="btn btn-primary">View Projects</Link>
      </div>

      <div className="grid-4" style={{ marginBottom: 32 }}>
        <div className="stat-card">
          <div className="stat-value">{stats.total_tasks}</div>
          <div className="stat-label">Total Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#1d4ed8' }}>{stats.in_progress_count}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#065f46' }}>{stats.done_count}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#991b1b' }}>{stats.overdue_count}</div>
          <div className="stat-label">Overdue</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Tasks</h2>
          </div>
          <div className="card-body">
            {recent_tasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📝</div>
                <p>No tasks yet</p>
              </div>
            ) : recent_tasks.slice(0, 5).map(task => (
              <div key={task.id} className="task-item">
                <div className="task-item-header">
                  <span className="task-title">{task.title}</span>
                  <span className={`badge ${STATUS_COLORS[task.status]}`}>{task.status}</span>
                </div>
                <div className="task-meta">
                  {task.due_date && <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Recent Projects</h2>
          </div>
          <div className="card-body">
            {recent_projects.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">📁</div>
                <p>No projects yet</p>
              </div>
            ) : recent_projects.map(project => (
              <Link key={project.id} to={`/projects/${project.id}`} style={{ textDecoration: 'none' }}>
                <div className="task-item">
                  <div className="task-title">{project.name}</div>
                  <div className="task-meta">
                    <span>{project.members?.length || 0} members</span>
                    <span>by {project.owner?.full_name || project.owner?.email}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {overdue_tasks.length > 0 && (
        <div className="card" style={{ marginTop: 24 }}>
          <div className="card-header">
            <h2 className="card-title" style={{ color: '#991b1b' }}>⚠️ Overdue Tasks</h2>
          </div>
          <div className="card-body">
            {overdue_tasks.map(task => (
              <div key={task.id} className="task-item" style={{ borderColor: '#fca5a5' }}>
                <div className="task-item-header">
                  <span className="task-title">{task.title}</span>
                  <span className="badge badge-overdue">Overdue</span>
                </div>
                <div className="task-meta">
                  <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
