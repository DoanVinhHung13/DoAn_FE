const ROUTER = {
  // Public
  HOME: "/",
  FORBIDDEN: "/403",
  NOT_FOUND: "/404",
  SERVER_ERROR: "/500",
  MAINTENANCE: "/503",
  UNAUTHORIZED: "/401",

  // Auth
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  VERIFY_OTP: "/verify-otp",

  // Admin Module
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_JOURNAL: "/admin/journal",
  ADMIN_JOURNAL_DETAIL: "/admin/journal/:id",
  ADMIN_INVENTORY: "/admin/inventory",
  ADMIN_USERS: "/admin/users",
  ADMIN_FORM_TEMPLATE: "/admin/form-template",
  ADMIN_DYNAMIC_FORM_BUILDER: "/admin/dynamic-form-builder",
  ADMIN_SUPPLIES: "/admin/supplies",

  // User Module
  USER_DASHBOARD: "/user/dashboard",
  USER_JOURNAL: "/user/journal",
  USER_JOURNAL_CREATE: "/user/journal/create",
  USER_JOURNAL_DETAIL: "/user/journal/:id",
  USER_PRODUCTION_PROCESS: "/user/production-process",
  USER_WAREHOUSE: "/user/warehouse",

  // Profile
  PROFILE: "/profile",
  SETTINGS: "/settings",
  NOTIFICATIONS: "/notifications",
  CHANGE_PASSWORD: "/change-password",
};

export default ROUTER;
