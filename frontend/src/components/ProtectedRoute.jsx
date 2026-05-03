import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'

function ProtectedRoute({ children }) {
  const { token } = useSelector((state) => state.auth)
  if (!token) return <Navigate to="/login" replace />
  return children
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
}

export default ProtectedRoute
