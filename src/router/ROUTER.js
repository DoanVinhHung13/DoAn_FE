const ROUTER = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password/:token',
  NOT_FOUND: '/404',
  FORBIDDEN: '/403',

  // Public
  NEWS: '/news',
  NEWS_DETAIL: '/news/:id',
  TCVN: '/reference/tcvn',
  TRACE: '/trace/:qrCode',

  // Admin
  ADMIN_DASHBOARD: '/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_JOURNALS: '/admin/journals',
  ADMIN_FORM_BUILDER: '/form-builder',
  ADMIN_INVENTORY: '/inventory/items',
  ADMIN_INVENTORY_CATEGORY: '/inventory/categories',
  ADMIN_INVENTORY_MODELS: '/inventory/models',
  ADMIN_GROUPS: '/admin/groups',
  ADMIN_ROLES: '/admin/roles',
  ADMIN_NEWS: '/admin/news',
  ADMIN_CONSULTATIONS: '/admin/consultations',
  ADMIN_LOGS: '/admin/logs',
  ADMIN_BACKUP: '/admin/backup',
  ADMIN_REPORTS: '/reports',
  ADMIN_CHAT_STATS: '/admin/chat-stats',
  ADMIN_AG_MODELS: '/agriculture-models',
  ADMIN_GEMINI: '/admin/gemini-test',
  ADMIN_OPENAI: '/admin/openai-test',
  ADMIN_GROQ: '/admin/groq-test',
  ADMIN_RAG: '/admin/rag-test',
  ADMIN_ACCOUNTS_MGMT: '/admin/accounts-mgmt',
  ADMIN_DASHBOARD_ALIAS: '/admin/dashboard',

  // User / HTX / Farmer
  CHANGE_PASSWORD: '/change-password',
  ACCOUNT_INFO: '/account-info',
  HTX_JOURNALS: '/htx/journals',
  HTX_APPROVALS: '/htx/approvals',
  HTX_FARMERS: '/htx/farmers',
  HTX_PRODUCTS: '/htx/products',
  HTX_BATCHES: '/htx/batches',
  HTX_SUPPLIES: '/htx/supplies',
  HTX_PORTAL_SETTINGS: '/htx/portal-settings',
  HTX_INVENTORY: '/inventory',
  FARMER_INVENTORY: '/inventory/farmer',
  FARMER_SUPPLIES: '/supplies/farmer',
  PRODUCTION_TECH: '/docs',
  JOURNAL_VIEW: '/journals/view/:id',
  APP_REDIRECT: '/app',

  // Farmer category-based routes
  VIETGAP: '/vietgap/:subCategory',
  HUUCO: '/huuco/:subCategory',
  THONGMINH: '/thongminh/:subCategory',

  // Legacy/sidebar shortcuts
  TCVN_AUTH: '/tcvn',
  FARMERS: '/farmers',
}

export default ROUTER
