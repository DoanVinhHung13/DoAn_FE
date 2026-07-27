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
  FM_LANDS: '/farm-manager/lands',
  FM_LAND_CREATE: '/farm-manager/lands/create',
  FM_LAND_DETAIL: '/farm-manager/lands/:id',
  FM_LAND_EDIT: '/farm-manager/lands/:id/edit',
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
  FM_PLAN_TEMPLATES: '/farm-manager/plan-templates',
  FM_PLAN_TEMPLATE_CREATE: '/farm-manager/plan-templates/create',
  FM_PLAN_TEMPLATE_EDIT: '/farm-manager/plan-templates/:id/edit',
  FM_PLAN_TEMPLATE_DETAIL: '/farm-manager/plan-templates/:id',
  FM_TASKS: '/farm-manager/task-catalogs',
  FM_TASK_CREATE: '/farm-manager/task-catalogs/create',
  FM_TASK_DETAIL: '/farm-manager/task-catalogs/:id',
  FM_TASK_EDIT: '/farm-manager/task-catalogs/:id/edit',
  FM_BATCHES: '/farm-manager/batches',
  FM_BATCH_DETAIL: '/farm-manager/batches/:id',
  FM_NOTIFICATIONS: '/farm-manager/notifications',
  FM_NOTIFICATION_DETAIL: '/farm-manager/notifications/:id',
  FM_REF_FERTILIZER: '/farm-manager/reference/fertilizers',
  FM_REF_PESTICIDE: '/farm-manager/reference/pesticides',
  FM_VIEW_FERTILIZERS: '/farm-manager/view-fertilizers',
  FM_VIEW_FERTILIZER_CREATE: '/farm-manager/view-fertilizers/create',
  FM_VIEW_FERTILIZER_DETAIL: '/farm-manager/view-fertilizers/:id',
  FM_VIEW_FERTILIZER_EDIT: '/farm-manager/view-fertilizers/:id/edit',
  FM_VIEW_CROP_PROTECTIONS: '/farm-manager/pesticides',
  FM_VIEW_CROP_PROTECTION_CREATE: '/farm-manager/pesticides/create',
  FM_VIEW_CROP_PROTECTION_DETAIL: '/farm-manager/pesticides/:id',
  FM_VIEW_CROP_PROTECTION_EDIT: '/farm-manager/pesticides/:id/edit',
  FM_LOGBOOKS: '/farm-manager/logbooks',
  FM_LOGBOOK_REVIEW: '/farm-manager/logbooks/:id/review',
  FM_REPORTS: '/farm-manager/reports',

  // ── Farm Supervisor Routes ────────────────────────────────────────────────
  FS_PLANS: '/farm-supervisor/plans',
  FS_PLAN_DETAIL: '/farm-supervisor/plans/:planId',
  LM_FARMERS: '/farm-supervisor/farmers',
  LM_LANDS: '/farm-supervisor/lands',
  LM_LAND_DETAIL: '/farm-supervisor/lands/:id',

  // ── Farm Leader Routes ────────────────────────────────────────────────────
  FL_TASKS: '/farm-leader/tasks',
  FL_TASK_LOG: '/farm-leader/tasks/:taskId/log',

  // ── Legacy shortcuts ──────────────────────────────────────────────────────
  TCVN_AUTH: '/tcvn',
  APP_REDIRECT: '/app',

  // ── MenuItem keys (alias kept for backward compat with MenuItem.jsx) ──────
  FM_PRODUCTION_PLANS: '/farm-manager/cultivation-logbooks',
}

export default ROUTER
