export const API_BASE_URL = import.meta.env.VITE_API_URL || ''

export const TASK_STATUSES = ['To Do', 'In Progress', 'Done', 'Archived']

export const USER_ROLES = ['Admin', 'Member']

export const STATUS_COLORS = {
  'To Do': 'badge-todo',
  'In Progress': 'badge-in-progress',
  'Done': 'badge-done',
  'Archived': 'badge-archived',
}

export const ROLE_COLORS = {
  Admin: 'badge-admin',
  Member: 'badge-member',
}
