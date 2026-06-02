const ROUTER = {
  // ── Public & Common (Dùng chung / Chưa Đăng Nhập) ───────
  HOME:                  '/',
  LOGIN:                 '/login',
  REGISTER:              '/register',
  FORGOT_PASSWORD:       '/forgot-password',
  RESET_PASSWORD:        '/reset-password/:token',
  NOT_FOUND:             '/404',
  FORBIDDEN:             '/403',

  // ── Shared Authenticated Routes ──────────────────────────
  ACCOUNT_INFO:          '/account-info',
  CHANGE_PASSWORD:       '/change-password',
  NOTIFICATIONS:         '/notifications',
  NOTIFICATIONS_DETAIL:  '/notifications/:id',
  SCAN_QR:               '/scan-qr',

  // ── Public Pages ─────────────────────────────────────────
  NEWS:                  '/news',
  NEWS_DETAIL:           '/news/:id',
  TCVN:                  '/reference/tcvn',
  TRACE:                 '/trace/:qrCode',

  // ── Farm Manager (Quản lý cấp cao - Thay thế HTX) ────────
  FM_DASHBOARD:          '/farm-manager/dashboard',
  FM_USERS:              '/farm-manager/users',
  FM_LANDS:              '/farm-manager/lands',
  FM_CROP_CATALOGS:      '/farm-manager/crop-catalogs',
  FM_CROPS:              '/farm-manager/crops',
  FM_PRODUCTION_PLANS:    '/farm-manager/production-plans',
  FM_TASKS:              '/farm-manager/tasks',
  FM_LOGBOOKS:           '/farm-manager/logbooks',
  FM_BATCHES:            '/farm-manager/batches',
  FM_NOTIFICATIONS:      '/farm-manager/notifications',
  FM_VIEW_FERTILIZERS:   '/farm-manager/view-fertilizers',
  FM_VIEW_CROP_PROTECTIONS: '/farm-manager/view-crop-protections',
  FM_VIEW_PURCHASE_REQS: '/farm-manager/view-purchase-reqs',

  // ── Land Manager (Quản lý khu đất - Mới) ──────────────────
  LM_DASHBOARD:          '/land-manager/dashboard',
  LM_FARMERS:            '/land-manager/farmers',
  LM_LANDS:              '/land-manager/lands',
  LM_PRODUCTION_PLANS:   '/land-manager/production-plans',
  LM_TASKS:              '/land-manager/tasks',
  LM_LOGBOOKS:           '/land-manager/logbooks',
  LM_BATCHES:            '/land-manager/batches',
  LM_VIEW_CATALOGS:      '/land-manager/view-catalogs',

  // ── Material Manager (Quản lý Vật tư - Thay thế Kho) ─────
  MM_DASHBOARD:          '/material-manager/dashboard',
  MM_FERTILIZERS:        '/material-manager/fertilizers',
  MM_CROP_PROTECTIONS:   '/material-manager/crop-protections',
  MM_MACHINERY:          '/material-manager/machinery',
  MM_OTHER_MATERIALS:    '/material-manager/materials',
  MM_PURCHASE_REQS:      '/material-manager/purchase-requisitions',
  MM_PRODUCTION_PLANS:   '/material-manager/production-plans',
  MM_TASKS:              '/material-manager/tasks',

  // ── Farmer (Nông dân) ────────────────────────────────────
  FARMER_DASHBOARD:      '/farmer/dashboard',
  FARMER_TASKS:          '/farmer/tasks',
  FARMER_LOGBOOKS:       '/farmer/logbooks',
  FARMER_PLANS:          '/farmer/production-plans',
  FARMER_SUPPLIES:       '/farmer/supplies',

  // ── Legacy / Admin (Giữ lại từ hệ thống cũ) ─────────────
  ADMIN_DASHBOARD:       '/dashboard',
  ADMIN_DASHBOARD_ALIAS: '/admin/dashboard',
  ADMIN_USERS:           '/admin/users',
  ADMIN_JOURNALS:        '/admin/journals',
  ADMIN_FORM_BUILDER:    '/form-builder',
  ADMIN_INVENTORY:       '/inventory/items',
  ADMIN_INVENTORY_CATEGORY: '/inventory/categories',
  ADMIN_INVENTORY_MODELS: '/inventory/models',
  ADMIN_GROUPS:          '/admin/groups',
  ADMIN_ROLES:           '/admin/roles',
  ADMIN_NEWS:            '/admin/news',
  ADMIN_CONSULTATIONS:   '/admin/consultations',
  ADMIN_LOGS:            '/admin/logs',
  ADMIN_BACKUP:          '/admin/backup',
  ADMIN_REPORTS:         '/reports',
  ADMIN_CHAT_STATS:      '/admin/chat-stats',
  ADMIN_AG_MODELS:       '/agriculture-models',
  ADMIN_GEMINI:          '/admin/gemini-test',
  ADMIN_OPENAI:          '/admin/openai-test',
  ADMIN_GROQ:            '/admin/groq-test',
  ADMIN_RAG:             '/admin/rag-test',
  ADMIN_ACCOUNTS_MGMT:   '/admin/accounts-mgmt',

  // ── HTX / Farmer Legacy Routes ───────────────────────────
  HTX_JOURNALS:          '/htx/journals',
  HTX_APPROVALS:         '/htx/approvals',
  HTX_FARMERS:            '/htx/farmers',
  HTX_PRODUCTS:          '/htx/products',
  HTX_BATCHES:           '/htx/batches',
  HTX_SUPPLIES:          '/htx/supplies',
  HTX_PORTAL_SETTINGS:   '/htx/portal-settings',
  HTX_INVENTORY:         '/inventory',
  FARMER_INVENTORY:      '/inventory/farmer',
  PRODUCTION_TECH:       '/docs',
  JOURNAL_VIEW:          '/journals/view/:id',
  APP_REDIRECT:          '/app',

  // ── Farmer category-based routes ─────────────────────────
  VIETGAP:               '/vietgap/:subCategory',
  HUUCO:                 '/huuco/:subCategory',
  THONGMINH:             '/thongminh/:subCategory',

  // ── Legacy shortcuts ─────────────────────────────────────
  TCVN_AUTH:             '/tcvn',
  FARMERS:               '/farmers',
}

export default ROUTER
