// src/router/ROUTER.js
// Main roles: FARM_MANAGER, FARM_SUPERVISOR, FARMER
// Legacy routes (LAND_MANAGER) now accessed by FARM_SUPERVISOR
// URL structure mới theo Role prefix

const ROUTER = {
  // ── Public & Common ────────────────────────────────────────────────────────
  HOME:                  '/',
  LOGIN:                 '/login',
  REGISTER:              '/register',
  FORGOT_PASSWORD:       '/forgot-password',
  NOT_FOUND:             '/404',
  FORBIDDEN:             '/403',

  // ── Shared Authenticated Routes ───────────────────────────────────────────
  ACCOUNT_INFO:          '/account-info',
  CHANGE_PASSWORD:       '/change-password',
  NOTIFICATIONS:         '/notifications',
  NOTIFICATIONS_DETAIL:  '/notifications/:id',
  SCAN_QR:               '/scan-qr',

  // ── Public Pages ──────────────────────────────────────────────────────────
  NEWS:                  '/news',
  NEWS_DETAIL:           '/news/:id',
  TCVN:                  '/reference/tcvn',
  TRACE:                 '/trace/:qrCode',

  // ── Farm Manager Routes ────────────────────────────────────────────────────
  FM_DASHBOARD:          '/farm-manager/dashboard',
  FM_USERS:              '/farm-manager/users',
  FM_USER_DETAIL:        '/farm-manager/users/:id',
  FM_LANDS:              '/farm-manager/lands',
  FM_LAND_CREATE:        '/farm-manager/lands/create',
  FM_LAND_DETAIL:        '/farm-manager/lands/:id',
  FM_LAND_EDIT:          '/farm-manager/lands/:id/edit',
  FM_CROP_CATALOGS:      '/farm-manager/crop-catalogs',
  FM_CROP_CATALOG_CREATE: '/farm-manager/crop-catalogs/create',
  FM_CROP_CATALOG_DETAIL: '/farm-manager/crop-catalogs/:id',
  FM_CROP_CATALOG_EDIT:  '/farm-manager/crop-catalogs/:id/edit',
  FM_CROPS:              '/farm-manager/crops',
  FM_CROP_CREATE:        '/farm-manager/crops/create',
  FM_CROP_DETAIL:        '/farm-manager/crops/:id',
  FM_CROP_EDIT:          '/farm-manager/crops/:id/edit',
  FM_CULTIVATION_LOGBOOKS:   '/farm-manager/cultivation-logbooks',
  FM_CULTIVATION_LOGBOOK_CREATE: '/farm-manager/cultivation-logbooks/create',
  FM_CULTIVATION_LOGBOOK_DETAIL: '/farm-manager/cultivation-logbooks/:id',
  FM_CULTIVATION_LOGBOOK_EDIT:   '/farm-manager/cultivation-logbooks/:id/edit',
  // Legacy routes - kept for backward compatibility
  FM_PRODUCTION_PLANS:   '/farm-manager/cultivation-logbooks',
  FM_PRODUCTION_PLAN_CREATE: '/farm-manager/cultivation-logbooks/create',
  FM_PRODUCTION_PLAN_DETAIL: '/farm-manager/cultivation-logbooks/:id',
  FM_PRODUCTION_PLAN_EDIT:   '/farm-manager/cultivation-logbooks/:id/edit',
  FM_QUALITY_INSPECTIONS:    '/farm-manager/quality-inspections',
  FM_QUALITY_INSPECTION_DETAIL: '/farm-manager/quality-inspections/:id',
  FM_PLAN_TEMPLATES:        '/farm-manager/plan-templates',
  FM_PLAN_TEMPLATE_CREATE:  '/farm-manager/plan-templates/create',
  FM_PLAN_TEMPLATE_EDIT:    '/farm-manager/plan-templates/:id/edit',
  FM_PLAN_TEMPLATE_DETAIL:  '/farm-manager/plan-templates/:id',
  FM_TASKS:              '/farm-manager/tasks',
  FM_TASK_CREATE:        '/farm-manager/tasks/create',
  FM_TASK_DETAIL:        '/farm-manager/tasks/:id',
  FM_TASK_EDIT:          '/farm-manager/tasks/:id/edit',
  FM_BATCHES:            '/farm-manager/batches',
  FM_NOTIFICATIONS:      '/farm-manager/notifications',
  FM_NOTIFICATION_DETAIL: '/farm-manager/notifications/:id',
  FM_REF_FERTILIZER:     '/farm-manager/reference/fertilizers',
  FM_REF_PESTICIDE:      '/farm-manager/reference/pesticides',
  FM_VIEW_FERTILIZERS:   '/farm-manager/view-fertilizers',
  FM_VIEW_FERTILIZER_CREATE: '/farm-manager/view-fertilizers/create',
  FM_VIEW_FERTILIZER_DETAIL: '/farm-manager/view-fertilizers/:id',
  FM_VIEW_FERTILIZER_EDIT:   '/farm-manager/view-fertilizers/:id/edit',
  FM_VIEW_CROP_PROTECTIONS: '/farm-manager/view-crop-protections',
  FM_VIEW_CROP_PROTECTION_CREATE: '/farm-manager/view-crop-protections/create',
  FM_VIEW_CROP_PROTECTION_DETAIL: '/farm-manager/view-crop-protections/:id',
  FM_VIEW_CROP_PROTECTION_EDIT:   '/farm-manager/view-crop-protections/:id/edit',
  FM_VIEW_PURCHASE_REQS: '/farm-manager/view-purchase-reqs',
  FM_VIETGAP:            '/farm-manager/vietgap/:subCategory',
  FM_HUUCO:              '/farm-manager/huuco/:subCategory',
  FM_THONGMINH:          '/farm-manager/thongminh/:subCategory',
  FM_JOURNAL_ENTRY:      '/farm-manager/journals/view/:id',
  FM_LOGBOOKS:           '/farm-manager/logbooks',
  FM_LOGBOOK_REVIEW:     '/farm-manager/logbooks/:id/review',

  // ── Farm Supervisor Routes ────────────────────────────────────────────────
  FS_PLANS:              '/farm-supervisor/plans',
  FS_PLAN_DETAIL:        '/farm-supervisor/plans/:planId',
  FS_STAGE_LOG:          '/farm-supervisor/plans/:planId/stages/:stageId',
  FS_TASK_DETAIL:        '/farm-supervisor/plans/:planId/tasks/:taskId',

  // ── Farm Leader Routes ────────────────────────────────────────────────────
  FL_TASKS:              '/farm-leader/tasks',
  FL_TASK_LOG:           '/farm-leader/tasks/:taskId/log',

  // ── Land Manager Routes (Refactored to FS / FL) ────────────────────────────
  LM_DASHBOARD:          '/farm-supervisor/dashboard',
  LM_FARMERS:            '/farm-supervisor/farmers',
  LM_LANDS:              '/farm-supervisor/lands',
  LM_LAND_DETAIL:        '/farm-supervisor/lands/:id',
  LM_PRODUCTION_PLANS:   '/farm-supervisor/production-plans',
  LM_TASKS:              '/farm-supervisor/tasks',
  LM_LOGBOOKS:           '/farm-supervisor/logbooks',
  LM_BATCHES:            '/farm-supervisor/batches',
  LM_FIELD_LOG:          '/farm-leader/field-log',
  LM_NOTIFICATIONS:      '/farm-supervisor/notifications',
  LM_NOTIFICATION_DETAIL: '/farm-supervisor/notifications/:id',
  LM_VIEW_CATALOGS:      '/farm-supervisor/view-catalogs',

  // ── Material Manager Routes ────────────────────────────────────────────────
  MM_DASHBOARD:          '/material-manager/dashboard',
  MM_FERTILIZERS:        '/material-manager/fertilizers',
  MM_CROP_PROTECTIONS:   '/material-manager/crop-protections',
  MM_MACHINERY:          '/material-manager/machinery',
  MM_MATERIALS:          '/material-manager/materials',
  MM_MATERIAL_CREATE:    '/material-manager/materials/create',
  MM_MATERIAL_DETAIL:    '/material-manager/materials/:id',
  MM_MATERIAL_EDIT:      '/material-manager/materials/:id/edit',
  MM_OTHER_MATERIALS:    '/material-manager/materials',
  MM_PURCHASE_REQS:      '/material-manager/purchase-requisitions',
  MM_PRODUCTION_PLANS:   '/material-manager/production-plans',
  MM_TASKS:              '/material-manager/tasks',

  // ── Farmer Routes ──────────────────────────────────────────────────────────
  FARMER_DASHBOARD:      '/farmer/dashboard',
  FARMER_TASKS:          '/farmer/tasks',
  FARMER_LOGBOOKS:       '/farmer/logbooks',
  FARMER_PLANS:          '/farmer/production-plans',
  FARMER_SUPPLIES:       '/farmer/supplies',

  // ── Land Manager additional (Refactored to FS) ────────────────────────────
  LM_CROP_CATALOGS:     '/farm-supervisor/crop-catalogs',
  LM_CROP_CATALOG_DETAIL: '/farm-supervisor/crop-catalogs/:id',
  LM_CROPS:              '/farm-supervisor/crops',
  LM_CROP_DETAIL:        '/farm-supervisor/crops/:id',

  // ── Material Manager additional ──────────────────────────────────────────


  // ── Legacy shortcuts (redirects) ──────────────────────────────────────────
  TCVN_AUTH:             '/tcvn',
  APP_REDIRECT:          '/app',
}

export default ROUTER
