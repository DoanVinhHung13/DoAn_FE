const getTaskId = item =>
  item?.taskId ||
  item?.cultivationTaskId ||
  item?.workTaskId ||
  item?.cultivationTask?.id ||
  item?.task?.id ||
  item?.id

const getLogTaskId = item =>
  item?.taskId ||
  item?.cultivationTaskId ||
  item?.workTaskId ||
  item?.cultivationTask?.id ||
  item?.task?.id

const getTaskName = item =>
  item?.taskName || item?.name || item?.workTaskName || item?.task?.name || item?.task?.taskName

const normalizeTaskName = value => String(value || '').trim().toLowerCase()

const getCreatedTime = item => {
  const value = item?.createdAt || item?.createdDate || item?.date || item?.workStartDate
  if (!value) return null

  const timestamp = new Date(value).getTime()
  return Number.isNaN(timestamp) ? null : timestamp
}

const findStageTask = (log, tasksById, tasksByName) => {
  const taskId = getLogTaskId(log)
  if (taskId && tasksById.has(String(taskId))) {
    return tasksById.get(String(taskId))
  }

  const taskName = normalizeTaskName(getTaskName(log))
  return taskName ? tasksByName.get(taskName) : undefined
}

export const getOrderedStageLogs = (logs, stageTasks) => {
  const tasksById = new Map()
  const tasksByName = new Map()

  stageTasks.forEach((task, index) => {
    const entry = { task, index }
    const taskId = getTaskId(task)
    const taskName = normalizeTaskName(getTaskName(task))

    if (taskId) tasksById.set(String(taskId), entry)
    if (taskName) tasksByName.set(taskName, entry)
  })

  return logs
    .map((log, originalIndex) => ({
      log,
      originalIndex,
      stageTask: findStageTask(log, tasksById, tasksByName),
      createdTime: getCreatedTime(log),
    }))
    .sort((first, second) => {
      const firstTaskIndex = first.stageTask?.index
      const secondTaskIndex = second.stageTask?.index

      if (firstTaskIndex != null && secondTaskIndex != null) {
        if (firstTaskIndex !== secondTaskIndex) {
          return firstTaskIndex - secondTaskIndex
        }
      } else if (firstTaskIndex != null) {
        return -1
      } else if (secondTaskIndex != null) {
        return 1
      }

      if (first.createdTime != null && second.createdTime != null) {
        if (first.createdTime !== second.createdTime) {
          return first.createdTime - second.createdTime
        }
      } else if (first.createdTime != null) {
        return -1
      } else if (second.createdTime != null) {
        return 1
      }

      return first.originalIndex - second.originalIndex
    })
    .map(({ log }) => log)
}

export const getStageTaskName = (log, stageTasks) => {
  const taskId = getLogTaskId(log)
  const matchingTask = stageTasks.find(task => {
    const taskIdForStage = getTaskId(task)
    return taskId && taskIdForStage && String(taskId) === String(taskIdForStage)
  }) || stageTasks.find(task =>
    normalizeTaskName(getTaskName(task)) === normalizeTaskName(getTaskName(log)),
  )

  return getTaskName(matchingTask) || getTaskName(log)
}
