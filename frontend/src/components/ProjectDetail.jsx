import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchProject, updateProject, deleteProject } from '../features/project/projectSlice'
import { fetchTasks } from '../features/task/taskSlice'
import TaskList from './TaskList'
import TaskForm from './TaskForm'
import TeamManager from './TeamManager'

function ProjectDetail() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { current: project, loading } = useSelector((state) => state.projects)
  const { list: tasks } = useSelector((state) => state.tasks)
  const { user } = useSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState('tasks')
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({ name: '', description: '' })

  useEffect(() => {
    dispatch(fetchProject(parseInt(id)))
    dispatch(fetchTasks({ project_id: parseInt(id) }))
  }, [dispatch, id])

  useEffect(() => {
    if (project) setEditForm({ name: project.name, description: project.description || '' })
  }, [project])

  if (loading || !project) return <div className="loading">Loading project...</div>

  const currentMember = project.members?.find(m => m.user_id === user?.id)
  const isAdmin = project.owner_id === user?.id || currentMember?.role === 'Admin'
  const projectTasks = tasks.filter(t => t.project_id === parseInt(id))

  const taskStats = {
    todo: projectTasks.filter(t => t.status === 'To Do').length,
    inProgress: projectTasks.filter(t => t.status === 'In Progress').length,
    done: projectTasks.filter(t => t.status === 'Done').length,
  }

  const handleUpdateProject = async (e) => {
    e.preventDefault()
    await dispatch(updateProject({ id: project.id, data: editForm }))
    setEditMode(false)
  }

  const handleDeleteProject = async () => {
    if (window.confirm('Delete this project? This action cannot be undone.')) {
      await dispatch(deleteProject(project.id))
      navigate('/projects')
    }
  }

  return (
    <div className="page">
      <div style={{ marginBottom: 8 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/projects')}>
          ← Back to Projects
        </button>
      </div>

      {editMode ? (
        <form onSubmit={handleUpdateProject} style={{ marginBottom: 24 }}>
          <div className="form-group">
            <label className="form-label">Project Name</label>
            <input
              type="text"
              className="form-input"
              value={editForm.name}
              onChange={e => setEditForm({ ...editForm, name: e.target.value })}
              required
              style={{ maxWidth: 400 }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={editForm.description}
              onChange={e => setEditForm({ ...editForm, description: e.target.value })}
              style={{ maxWidth: 400 }}
            />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn btn-secondary" onClick={() => setEditMode(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <div className="page-header">
          <div>
            <h1 className="page-title">{project.name}</h1>
            {project.description && (
              <p style={{ color: 'var(--gray-600)', marginTop: 4 }}>{project.description}</p>
            )}
          </div>
          {isAdmin && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary" onClick={() => setEditMode(true)}>Edit</button>
              <button className="btn btn-danger" onClick={handleDeleteProject}>Delete</button>
            </div>
          )}
        </div>
      )}

      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-value">{taskStats.todo}</div>
          <div className="stat-label">To Do</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#1d4ed8' }}>{taskStats.inProgress}</div>
          <div className="stat-label">In Progress</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#065f46' }}>{taskStats.done}</div>
          <div className="stat-label">Done</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        <button
          className={`btn ${activeTab === 'tasks' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('tasks')}
        >Tasks ({projectTasks.length})</button>
        <button
          className={`btn ${activeTab === 'team' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('team')}
        >Team ({project.members?.length || 0})</button>
      </div>

      {activeTab === 'tasks' && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <button className="btn btn-primary" onClick={() => setShowTaskForm(true)}>+ New Task</button>
          </div>
          <TaskList
            tasks={projectTasks}
            projectId={parseInt(id)}
            members={project.members}
            isAdmin={isAdmin}
          />
        </div>
      )}

      {activeTab === 'team' && (
        <TeamManager project={project} isAdmin={isAdmin} />
      )}

      {showTaskForm && (
        <TaskForm
          projectId={parseInt(id)}
          members={project.members}
          onClose={() => setShowTaskForm(false)}
          onSuccess={() => dispatch(fetchTasks({ project_id: parseInt(id) }))}
        />
      )}
    </div>
  )
}

export default ProjectDetail
