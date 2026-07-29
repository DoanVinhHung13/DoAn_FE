// src/router/ROUTER.js
// Active roles: FARM_MANAGER, FARM_SUPERVISOR, FARM_LEADER

const ROUTER = {
  // ── Public & Common ────────────────────────────────────────────────────────
  HOME: '/',
  LOGIN: '/login',
  FORGOT_PASSWORD: '/forgot-password',
  NOT_FOUND: '/404',
  FORBIDDEN: '/403',

  // ── Shared Authenticated Routes ───────────────────────────────────────────
  ACCOUNT_INFO: '/account-info',
  CHANGE_PASSWORD: '/change-password',
  NOTIFICATIONS: '/notifications',
  NOTIFICATIONS_DETAIL: '/notifications/:id',

  // ── Public Pages ──────────────────────────────────────────────────────────
  NEWS: '/news',
  NEWS_DETAIL: '/news/:id',
  TCVN: '/reference/tcvn',
  TRACE: '/trace/:qrCode',

  // ── Farm Manager Routes ────────────────────────────────────────────────────
  FM_DASHBOARD: '/farm-manager/dashboard',
  FM_USERS: '/farm-manager/users',
  FM_USER_DETAIL: '/farm-manager/users/:id',
  FM_LANDS: '/farm-manager/land-plots',
  FM_LAND_CREATE: '/farm-manager/land-plots/create',
  FM_LAND_DETAIL: '/farm-manager/land-plots/:id',
  FM_LAND_EDIT: '/farm-manager/land-plots/:id/edit',
  FM_CROP_CATALOGS: '/farm-manager/crop-catalogs',
  FM_CROP_CATALOG_CREATE: '/farm-manager/crop-catalogs/create',
  FM_CROP_CATALOG_DETAIL: '/farm-manager/crop-catalogs/:id',
  FM_CROP_CATALOG_EDIT: '/farm-manager/crop-catalogs/:id/edit',
  FM_CROPS: '/farm-manager/crops',
  FM_CROP_CREATE: '/farm-manager/crops/create',
  FM_CROP_DETAIL: '/farm-manager/crops/:id',
  FM_CROP_EDIT: '/farm-manager/crops/:id/edit',
  FM_CULTIVATION_LOGBOOKS: '/farm-manager/cultivation-logbooks',
  FM_CULTIVATION_LOGBOOK_CREATE: '/farm-manager/cultivation-logbooks/create',
  FM_CULTIVATION_LOGBOOK_DETAIL: '/farm-manager/cultivation-logbooks/:id',
  FM_CULTIVATION_LOGBOOK_EDIT: '/farm-manager/cultivation-logbooks/:id/edit',
  FM_PROCESS_TEMPLATES: '/farm-manager/process-templates',
  FM_PROCESS_TEMPLATE_CREATE: '/farm-manager/process-templates/create',
  FM_PROCESS_TEMPLATE_EDIT: '/farm-manager/process-templates/:id/edit',
  FM_PROCESS_TEMPLATE_DETAIL: '/farm-manager/process-templates/:id',
  FM_TASK_CATALOGS: '/farm-manager/task-catalogs',
  FM_TASK_CATALOG_CREATE: '/farm-manager/task-catalogs/create',
  FM_TASK_CATALOG_DETAIL: '/farm-manager/task-catalogs/:id',
  FM_TASK_CATALOG_EDIT: '/farm-manager/task-catalogs/:id/edit',
  FM_HARVEST_BATCHES: '/farm-manager/harvest-batches',
  FM_HARVEST_BATCH_DETAIL: '/farm-manager/harvest-batches/:id',
  FM_QR_CODES: '/farm-manager/qr-codes',
  FM_NOTIFICATIONS: '/farm-manager/notifications',
  FM_NOTIFICATION_DETAIL: '/farm-manager/notifications/:id',
  FM_REF_FERTILIZER: '/farm-manager/catalogs/fertilizers',
  FM_REF_PESTICIDE: '/farm-manager/catalogs/pesticides',
  FM_FERTILIZERS: '/farm-manager/fertilizers',
  FM_FERTILIZER_CREATE: '/farm-manager/fertilizers/create',
  FM_FERTILIZER_DETAIL: '/farm-manager/fertilizers/:id',
  FM_FERTILIZER_EDIT: '/farm-manager/fertilizers/:id/edit',
  FM_PESTICIDES: '/farm-manager/pesticides',
  FM_PESTICIDE_CREATE: '/farm-manager/pesticides/create',
  FM_PESTICIDE_DETAIL: '/farm-manager/pesticides/:id',
  FM_PESTICIDE_EDIT: '/farm-manager/pesticides/:id/edit',
  FM_INVENTORY_IMPORT_HISTORY: '/farm-manager/inventory/import-history',
  FM_LOGBOOKS: '/farm-manager/cultivation-logbooks/reviews',
  FM_LOGBOOK_REVIEW: '/farm-manager/cultivation-logbooks/:id/review',
  FM_REPORTS: '/farm-manager/reports',

  // ── Farm Supervisor Routes ────────────────────────────────────────────────
  FS_CULTIVATION_LOGBOOKS: '/farm-supervisor/cultivation-logbooks',
  FS_CULTIVATION_LOGBOOK_DETAIL: '/farm-supervisor/cultivation-logbooks/:planId',
  FS_FARMERS: '/farm-supervisor/farmers',
  FS_LANDS: '/farm-supervisor/land-plots',
  FS_LAND_DETAIL: '/farm-supervisor/land-plots/:id',

  // ── Farm Leader Routes ────────────────────────────────────────────────────
  FL_TASKS: '/farm-leader/cultivation-tasks',
  FL_TASK_LOG: '/farm-leader/cultivation-tasks/:taskId/daily-logs',

  // ── Legacy shortcuts ──────────────────────────────────────────────────────
}

export default ROUTER
