import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

export const fetchProjects = createAsyncThunk('projects/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/projects')
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Failed to fetch projects')
  }
})

export const fetchProject = createAsyncThunk('projects/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/api/projects/${id}`)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Failed to fetch project')
  }
})

export const createProject = createAsyncThunk('projects/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/api/projects', data)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Failed to create project')
  }
})

export const updateProject = createAsyncThunk('projects/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/api/projects/${id}`, data)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Failed to update project')
  }
})

export const deleteProject = createAsyncThunk('projects/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/api/projects/${id}`)
    return id
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Failed to delete project')
  }
})

export const addProjectMember = createAsyncThunk('projects/addMember', async ({ projectId, data }, { rejectWithValue }) => {
  try {
    const res = await api.post(`/api/projects/${projectId}/members`, data)
    return { projectId, member: res.data }
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Failed to add member')
  }
})

export const removeProjectMember = createAsyncThunk('projects/removeMember', async ({ projectId, userId }, { rejectWithValue }) => {
  try {
    await api.delete(`/api/projects/${projectId}/members/${userId}`)
    return { projectId, userId }
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Failed to remove member')
  }
})

const projectSlice = createSlice({
  name: 'projects',
  initialState: {
    list: [],
    current: null,
    loading: false,
    error: null,
  },
  reducers: {
    clearProjectError: (state) => { state.error = null },
    clearCurrentProject: (state) => { state.current = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => { state.loading = true })
      .addCase(fetchProjects.fulfilled, (state, action) => { state.loading = false; state.list = action.payload })
      .addCase(fetchProjects.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(fetchProject.pending, (state) => { state.loading = true })
      .addCase(fetchProject.fulfilled, (state, action) => { state.loading = false; state.current = action.payload })
      .addCase(fetchProject.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(createProject.fulfilled, (state, action) => { state.list.push(action.payload) })
      .addCase(updateProject.fulfilled, (state, action) => {
        const idx = state.list.findIndex(p => p.id === action.payload.id)
        if (idx !== -1) state.list[idx] = action.payload
        if (state.current?.id === action.payload.id) state.current = action.payload
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.list = state.list.filter(p => p.id !== action.payload)
        if (state.current?.id === action.payload) state.current = null
      })
      .addCase(addProjectMember.fulfilled, (state, action) => {
        if (state.current?.id === action.payload.projectId) {
          state.current.members.push(action.payload.member)
        }
      })
      .addCase(removeProjectMember.fulfilled, (state, action) => {
        if (state.current?.id === action.payload.projectId) {
          state.current.members = state.current.members.filter(m => m.user_id !== action.payload.userId)
        }
      })
  },
})

export const { clearProjectError, clearCurrentProject } = projectSlice.actions
export default projectSlice.reducer
