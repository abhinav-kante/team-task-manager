import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

const storedUser = localStorage.getItem('user')
const storedToken = localStorage.getItem('token')

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await api.post('/api/auth/login', credentials)
    return response.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Login failed')
  }
})

export const signupUser = createAsyncThunk('auth/signup', async (userData, { rejectWithValue }) => {
  try {
    const response = await api.post('/api/auth/signup', userData)
    return response.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Signup failed')
  }
})

export const fetchCurrentUser = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/api/auth/me')
    return response.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Failed to fetch user')
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken || null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    const handleAuthSuccess = (state, action) => {
      state.loading = false
      state.error = null
      state.token = action.payload.access_token
      state.user = action.payload.user
      localStorage.setItem('token', action.payload.access_token)
      localStorage.setItem('user', JSON.stringify(action.payload.user))
    }
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; state.error = null })
      .addCase(loginUser.fulfilled, handleAuthSuccess)
      .addCase(loginUser.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(signupUser.pending, (state) => { state.loading = true; state.error = null })
      .addCase(signupUser.fulfilled, handleAuthSuccess)
      .addCase(signupUser.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.user = action.payload
        localStorage.setItem('user', JSON.stringify(action.payload))
      })
  },
})

export const { logout, clearError } = authSlice.actions
export default authSlice.reducer
