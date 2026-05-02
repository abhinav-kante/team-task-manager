import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { deleteTask, updateTask } from '../features/task/taskSlice'
import TaskForm from './TaskForm'
import { STATUS_COLORS, TASK_STATUSES } from '../utils/constants'

function TaskList({ tasks, projectId, members, isAdmin }) {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [editTask, setEditTask] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')

  const filtered = filterStatus === 'all' ? tasks : tasks.filter(t => t.status === filterStatus)

  const handleDelete = (task) => {
    if (window.confirm('Delete this task?')) dispatch(deleteTask(task.id))
  }

  const handleStatusChange = (task, newStatus) => {
    dispatch(updateTask({ id: task.id, data: { status: newStatus } }))
  }

  const isOverdue = (task) => {
    if (!task.due_date || task.status === 'Done' || task.status === 'Archived') return false
    return new Date(task.due_date) < new Date()
  }

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          className={`btn btn-sm ${filterStatus === 'all' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setFilterStatus('all')}
        >All ({tasks.length})</button>
        {TASK_STATUSES.map(s => (
          <button
            key={s}
            className={`btn btn-sm ${filterStatus === s ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilterStatus(s)}
          >
            {s} ({tasks.filter(t => t.status === s).length})
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✅</div>
          <p>No tasks found</p>
        </div>
      ) : (
        filtered.map(task => (
          <div key={task.id} className="task-item" style={isOverdue(task) ? { borderColor: '#fca5a5' } : {}}>
            <div className="task-item-header">
              <span className="task-title">
                {isOverdue(task) && <span style={{ color: '#ef4444', marginRight: 4 }}>⚠</span>}
                {task.title}
              </span>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <select
                  className="form-select"
                  style={{ padding: '2px 6px', fontSize: '0.75rem', width: 'auto' }}
                  value={task.status}
                  onChange={e => handleStatusChange(task, e.target.value)}
                >
                  {TASK_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className={`badge ${STATUS_COLORS[task.status]}`}>{task.status}</span>
              </div>
            </div>
            {task.description && (
              <p style={{ fontSize: '0.8rem', color: 'var(--gray-600)', marginBottom: 8 }}>{task.description}</p>
            )}
            <div className="task-meta">
              {task.assignee && <span>👤 {task.assignee.full_name || task.assignee.email}</span>}
              {task.due_date && (
                <span style={isOverdue(task) ? { color: '#ef4444' } : {}}>
                  📅 {new Date(task.due_date).toLocaleDateString()}
                </span>
              )}
              <span>By: {task.creator?.full_name || task.creator?.email}</span>
            </div>
            <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setEditTask(task)}>Edit</button>
              {(isAdmin || task.created_by === user?.id) && (
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(task)}>Delete</button>
              )}
            </div>
          </div>
        ))
      )}

      {editTask && (
        <TaskForm
          projectId={projectId}
          members={members}
          task={editTask}
          onClose={() => setEditTask(null)}
        />
      )}
    </div>
  )
}

export default TaskList
