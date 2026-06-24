// taskService/urls.js
// NOTE: Task API endpoints are currently INCORRECT in Swagger.
// These are placeholder constants — will be replaced when the real API is ready.

export const apiGetTasks = '/tasks'
export const apiCreateTask = '/tasks'
export const apiGetTaskById = (id) => `/tasks/${id}`
export const apiUpdateTask = (id) => `/tasks/${id}`
export const apiDeleteTask = (id) => `/tasks/${id}`
export const apiToggleTaskStatus = (id) => `/tasks/${id}/status`
