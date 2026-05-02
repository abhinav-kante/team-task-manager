import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProjects, createProject, deleteProject } from '../features/project/projectSlice'

function Projects() {
  const dispatch = useDispatch()
  const { list, loading } = useSelector((state) => state.projects)
  const { user } = useSelector((state) => state.auth)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { dispatch(fetchProjects()) }, [dispatch])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const result = await dispatch(createProject(form))
    if (createProject.fulfilled.match(result)) {
      setShowModal(false)
      setForm({ name: '', description: '' })
    } else {
      setError(result.payload || 'Failed to create project')
    }
    setSubmitting(false)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Delete this project? This action cannot be undone.')) {
      dispatch(deleteProject(id))
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Projects</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>
      </div>

      {loading ? (
        <div className="loading">Loading projects...</div>
      ) : list.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <p>No projects yet. Create your first project!</p>
        </div>
      ) : (
        <div className="grid-3">
          {list.map(project => (
            <div key={project.id} className="card">
              <div className="card-header">
                <Link to={`/projects/${project.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <h3 className="card-title">{project.name}</h3>
                </Link>
              </div>
              <div className="card-body">
                {project.description && (
                  <p style={{ color: 'var(--gray-600)', fontSize: '0.875rem', marginBottom: 12 }}>
                    {project.description}
                  </p>
                )}
                <div style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: 16 }}>
                  <span>{project.members?.length || 0} members</span>
                  <span style={{ marginLeft: 12 }}>by {project.owner?.full_name || project.owner?.email}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link to={`/projects/${project.id}`} className="btn btn-secondary btn-sm">View</Link>
                  {project.owner_id === user?.id && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(project.id)}>Delete</button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">New Project</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                {error && <div className="alert alert-error">{error}</div>}
                <div className="form-group">
                  <label className="form-label">Project Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Projects
