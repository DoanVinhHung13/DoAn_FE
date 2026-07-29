import ROUTER from 'src/router/ROUTER'

const FINALIZATION_NOTIFICATION_TYPES = new Set([
  'CULTIVATION_TASK_SUMMARY_SUBMITTED',
  'CULTIVATION_TASK_SUMMARY_REJECTED',
  'CULTIVATION_STAGE_COMPLETED',
  'CULTIVATION_STAGE_REVIEW_SUBMITTED',
  'CULTIVATION_STAGE_REVIEW_APPROVED',
  'CULTIVATION_STAGE_REVIEW_REJECTED',
])

const parseObject = value => {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value
  if (typeof value !== 'string') return null

  try {
    const parsed = JSON.parse(value)
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? parsed
      : null
  } catch {
    return null
  }
}

const firstNonEmpty = (...values) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

const getMetadata = notification =>
  parseObject(notification?.metadata) ||
  parseObject(notification?.meta) ||
  parseObject(notification?.data) ||
  parseObject(notification?.payload) ||
  parseObject(notification?.details) ||
  {}

const getNotificationType = notification =>
  String(notification?.type || notification?.notificationType || '').toUpperCase()

export const getNotificationContext = notification => {
  const metadata = getMetadata(notification)
  const task = parseObject(notification?.task) || parseObject(metadata.task) || {}
  const stage =
    parseObject(notification?.stage) ||
    parseObject(notification?.cultivationStage) ||
    parseObject(metadata.stage) ||
    parseObject(metadata.cultivationStage) ||
    {}
  const logbook =
    parseObject(notification?.logbook) ||
    parseObject(notification?.cultivationLogbook) ||
    parseObject(metadata.logbook) ||
    parseObject(metadata.cultivationLogbook) ||
    {}

  return {
    taskName: firstNonEmpty(
      notification?.taskName,
      notification?.TaskName,
      notification?.task?.name,
      notification?.task?.taskName,
      task.name,
      task.taskName,
      metadata.taskName,
    ),
    stageName: firstNonEmpty(
      notification?.stageName,
      notification?.StageName,
      notification?.cultivationStageName,
      notification?.stage?.name,
      notification?.stage?.stageName,
      notification?.cultivationStage?.name,
      stage.name,
      stage.stageName,
      metadata.stageName,
      metadata.cultivationStageName,
    ),
    logbookName: firstNonEmpty(
      notification?.logbookName,
      notification?.LogbookName,
      notification?.journalName,
      notification?.planName,
      notification?.cultivationLogbookName,
      notification?.logbook?.name,
      notification?.logbook?.logbookName,
      notification?.cultivationLogbook?.name,
      logbook.name,
      logbook.logbookName,
      metadata.logbookName,
      metadata.journalName,
      metadata.planName,
      metadata.cultivationLogbookName,
    ),
  }
}

const getPlanId = notification =>
  notification?.planId ||
  notification?.PlanId ||
  notification?.logbookId ||
  notification?.LogbookId ||
  notification?.cultivationLogbookId ||
  notification?.logbook?.id ||
  notification?.cultivationLogbook?.id ||
  getMetadata(notification).planId ||
  getMetadata(notification).PlanId ||
  getMetadata(notification).logbookId ||
  getMetadata(notification).LogbookId

const addFinalizationTab = actionUrl => {
  try {
    const url = new URL(actionUrl, 'http://localhost')
    if (!url.pathname.startsWith('/farm-supervisor/cultivation-logbooks/')) return actionUrl
    url.searchParams.set('tab', 'finalization')
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return actionUrl
  }
}

export const getNotificationActionUrl = notification => {
  const actionUrl = firstNonEmpty(
    notification?.actionUrl,
    notification?.actionURL,
    notification?.url,
    notification?.link,
  )
  const shouldOpenFinalization = FINALIZATION_NOTIFICATION_TYPES.has(
    getNotificationType(notification),
  )

  if (actionUrl) {
    return shouldOpenFinalization ? addFinalizationTab(actionUrl) : actionUrl
  }

  const planId = getPlanId(notification)
  if (shouldOpenFinalization && planId) {
    return `${ROUTER.FS_CULTIVATION_LOGBOOK_DETAIL.replace(':planId', planId)}?tab=finalization`
  }

  return ''
}
