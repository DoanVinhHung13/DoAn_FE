// taskService/urls.js

export const apiGetTasks = '/standard-tasks'
export const apiCreateTask = '/standard-tasks'
export const apiGetTaskById = (id) => `/standard-tasks/${id}`
export const apiUpdateTask = (id) => `/standard-tasks/${id}`
export const apiDeleteTask = (id) => `/standard-tasks/${id}`
export const apiToggleTaskStatus = (id) => `/standard-tasks/${id}/status`
