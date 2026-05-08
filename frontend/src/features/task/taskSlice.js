import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

export const fetchTasks = createAsyncThunk('tasks/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const res = await api.get('/api/tasks', { params })
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Failed to fetch tasks')
  }
})

export const createTask = createAsyncThunk('tasks/create', async (data, { rejectWithValue }) => {
  try {
    const res = await api.post('/api/tasks', data)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Failed to create task')
  }
})

export const updateTask = createAsyncThunk('tasks/update', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/api/tasks/${id}`, data)
    return res.data
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Failed to update task')
  }
})

export const deleteTask = createAsyncThunk('tasks/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/api/tasks/${id}`)
    return id
  } catch (err) {
    return rejectWithValue(err.response?.data?.detail || 'Failed to delete task')
  }
})

const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    list: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearTaskError: (state) => { state.error = null },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => { state.loading = true })
      .addCase(fetchTasks.fulfilled, (state, action) => { state.loading = false; state.list = action.payload })
      .addCase(fetchTasks.rejected, (state, action) => { state.loading = false; state.error = action.payload })
      .addCase(createTask.fulfilled, (state, action) => { state.list.unshift(action.payload) })
      .addCase(updateTask.fulfilled, (state, action) => {
        const idx = state.list.findIndex(t => t.id === action.payload.id)
        if (idx !== -1) state.list[idx] = action.payload
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.list = state.list.filter(t => t.id !== action.payload)
      })
  },
})

export const { clearTaskError } = taskSlice.actions
export default taskSlice.reducer
