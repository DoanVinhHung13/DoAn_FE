// src/router/ROUTER.js
// 4 Role: FARM_MANAGER, LAND_MANAGER, MATERIAL_MANAGER, FARMER
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
  FM_CROP_CATALOG_DETAIL: '/farm-manager/crop-catalogs/:id',
  FM_CROP_CATALOG_EDIT:  '/farm-manager/crop-catalogs/:id/edit',
  FM_CROPS:              '/farm-manager/crops',
  FM_CROP_DETAIL:        '/farm-manager/crops/:id',
  FM_CROP_EDIT:          '/farm-manager/crops/:id/edit',
  FM_PRODUCTION_PLANS:   '/farm-manager/production-plans',
  FM_TASKS:              '/farm-manager/tasks',
  FM_LOGBOOKS:           '/farm-manager/logbooks',
  FM_BATCHES:            '/farm-manager/batches',
  FM_NOTIFICATIONS:      '/farm-manager/notifications',
  FM_NOTIFICATION_DETAIL: '/farm-manager/notifications/:id',
  FM_VIEW_FERTILIZERS:   '/farm-manager/view-fertilizers',
  FM_VIEW_CROP_PROTECTIONS: '/farm-manager/view-crop-protections',
  FM_VIEW_PURCHASE_REQS: '/farm-manager/view-purchase-reqs',
  FM_VIETGAP:            '/farm-manager/vietgap/:subCategory',
  FM_HUUCO:              '/farm-manager/huuco/:subCategory',
  FM_THONGMINH:          '/farm-manager/thongminh/:subCategory',
  FM_JOURNAL_ENTRY:      '/farm-manager/journals/view/:id',

  // ── Land Manager Routes ────────────────────────────────────────────────────
  LM_DASHBOARD:          '/land-manager/dashboard',
  LM_FARMERS:            '/land-manager/farmers',
  LM_LANDS:              '/land-manager/lands',
  LM_LAND_DETAIL:        '/land-manager/lands/:id',
  LM_PRODUCTION_PLANS:   '/land-manager/production-plans',
  LM_TASKS:              '/land-manager/tasks',
  LM_LOGBOOKS:           '/land-manager/logbooks',
  LM_BATCHES:            '/land-manager/batches',
  LM_NOTIFICATIONS:      '/land-manager/notifications',
  LM_NOTIFICATION_DETAIL: '/land-manager/notifications/:id',
  LM_VIEW_CATALOGS:      '/land-manager/view-catalogs',

  // ── Material Manager Routes ────────────────────────────────────────────────
  MM_DASHBOARD:          '/material-manager/dashboard',
  MM_FERTILIZERS:        '/material-manager/fertilizers',
  MM_CROP_PROTECTIONS:   '/material-manager/crop-protections',
  MM_MACHINERY:          '/material-manager/machinery',
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

  // ── Land Manager additional ───────────────────────────────────────────────
  LM_CROP_CATALOGS:     '/land-manager/crop-catalogs',
  LM_CROP_CATALOG_DETAIL: '/land-manager/crop-catalogs/:id',
  LM_CROPS:             '/land-manager/crops',
  LM_CROP_DETAIL:       '/land-manager/crops/:id',

  // ── Material Manager additional ──────────────────────────────────────────
  MM_PURCHASE_REQS:     '/material-manager/purchase-requisitions',

  // ── Legacy shortcuts (redirects) ──────────────────────────────────────────
  TCVN_AUTH:             '/tcvn',
  APP_REDIRECT:          '/app',
}

export default ROUTER
