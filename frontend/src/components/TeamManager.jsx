import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { addProjectMember, removeProjectMember } from '../features/project/projectSlice'
import { ROLE_COLORS, USER_ROLES } from '../utils/constants'
import PropTypes from 'prop-types'

function TeamManager({ project, isAdmin }) {
  const dispatch = useDispatch()
  const [showAdd, setShowAdd] = useState(false)
  const [role, setRole] = useState('Member')
  const [submitting, setSubmitting] = useState(false)

  const handleAddById = async (e) => {
    e.preventDefault()
    const userIdInput = e.target.elements.userId.value
    if (!userIdInput) return
    setSubmitting(true)
    const result = await dispatch(addProjectMember({
      projectId: project.id,
      data: { user_id: parseInt(userIdInput), role },
    }))
    if (addProjectMember.fulfilled.match(result)) {
      setShowAdd(false)
      e.target.reset()
    }
    setSubmitting(false)
  }

  const handleRemove = (userId) => {
    if (window.confirm('Remove this member from the project?')) {
      dispatch(removeProjectMember({ projectId: project.id, userId }))
    }
  }

  return (
    <div>
      {isAdmin && (
        <div style={{ marginBottom: 16 }}>
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(!showAdd)}>
            {showAdd ? 'Cancel' : '+ Add Member'}
          </button>
        </div>
      )}

      {showAdd && (
        <div className="card" style={{ marginBottom: 16, padding: 16 }}>
          <form onSubmit={handleAddById}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                <label className="form-label">User ID</label>
                <input type="number" name="userId" className="form-input" placeholder="Enter user ID" required />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Role</label>
                <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
                  {USER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Adding...' : 'Add'}
              </button>
            </div>
          </form>
        </div>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>Member</th>
            <th>Email</th>
            <th>Role</th>
            <th>Joined</th>
            {isAdmin && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {project.members?.map(member => (
            <tr key={member.id}>
              <td>{member.user?.full_name || '—'}</td>
              <td>{member.user?.email}</td>
              <td><span className={`badge ${ROLE_COLORS[member.role]}`}>{member.role}</span></td>
              <td>{new Date(member.joined_at).toLocaleDateString()}</td>
              {isAdmin && (
                <td>
                  {member.user_id !== project.owner_id && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleRemove(member.user_id)}
                    >
                      Remove
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

TeamManager.propTypes = {
  project: PropTypes.shape({
    id: PropTypes.number,
    owner_id: PropTypes.number,
    members: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      user_id: PropTypes.number,
      role: PropTypes.string,
      joined_at: PropTypes.string,
      user: PropTypes.shape({
        full_name: PropTypes.string,
        email: PropTypes.string,
      }),
    })),
  }).isRequired,
  isAdmin: PropTypes.bool.isRequired,
}

export default TeamManager
