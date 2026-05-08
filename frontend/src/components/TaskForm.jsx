import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { createTask, updateTask } from '../features/task/taskSlice'
import { TASK_STATUSES } from '../utils/constants'
import PropTypes from 'prop-types'

function TaskForm({ projectId, members, task, onClose, onSuccess }) {
  const dispatch = useDispatch()
  const [form, setForm] = useState({
    title: task?.title || '',
    description: task?.description || '',
    assigned_to: task?.assigned_to || '',
    status: task?.status || 'To Do',
    due_date: task?.due_date ? task.due_date.split('T')[0] : '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    const payload = {
      title: form.title,
      description: form.description || undefined,
      assigned_to: form.assigned_to ? parseInt(form.assigned_to) : undefined,
      status: form.status,
      // Append time component to preserve local date without UTC shift
      due_date: form.due_date ? `${form.due_date}T00:00:00` : undefined,
    }

    let result
    if (task) {
      result = await dispatch(updateTask({ id: task.id, data: payload }))
    } else {
      result = await dispatch(createTask({ ...payload, project_id: projectId }))
    }

    if (createTask.fulfilled.match(result) || updateTask.fulfilled.match(result)) {
      onSuccess?.()
      onClose()
    } else {
      setError(result.payload || 'Failed to save task')
    }
    setSubmitting(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{task ? 'Edit Task' : 'New Task'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && <div className="alert alert-error">{error}</div>}
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                type="text"
                className="form-input"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
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
            <div className="form-group">
              <label className="form-label">Assigned To</label>
              <select
                className="form-select"
                value={form.assigned_to}
                onChange={e => setForm({ ...form, assigned_to: e.target.value })}
              >
                <option value="">Unassigned</option>
                {members?.map(m => (
                  <option key={m.user_id} value={m.user_id}>
                    {m.user?.full_name || m.user?.email}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="form-select"
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
              >
                {TASK_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Due Date</label>
              <input
                type="date"
                className="form-input"
                value={form.due_date}
                onChange={e => setForm({ ...form, due_date: e.target.value })}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const memberShape = PropTypes.shape({
  user_id: PropTypes.number,
  user: PropTypes.shape({
    full_name: PropTypes.string,
    email: PropTypes.string,
  }),
})

TaskForm.propTypes = {
  projectId: PropTypes.number.isRequired,
  members: PropTypes.arrayOf(memberShape),
  task: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    description: PropTypes.string,
    assigned_to: PropTypes.number,
    status: PropTypes.string,
    due_date: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
}

export default TaskForm
