import {
  LayoutDashboard,
  Users,
  Settings,
  User,
  BookOpen,
  Warehouse,
  Trees,
  ScrollText,
  Tractor,
  NotebookPen,
  PackageSearch,
  FlaskConical,
  KeyRound,
  Bell,
  HelpCircle,
  ShieldCheck,
  Sprout,
} from "lucide-react";
import ROUTER from "./ROUTER";

// ─────────────────────────────────────────────────────────────────────────────
// SIDEBAR MENU – dùng trong Sidebar (có children để nhóm)
// ─────────────────────────────────────────────────────────────────────────────

export const MenuItemAdmin = () => [
  {
    key: ROUTER.ADMIN_DASHBOARD,
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  {
    key: "admin-farm",
    label: "Farm Management",
    icon: <Trees size={18} />,
    children: [
      {
        key: ROUTER.ADMIN_JOURNAL,
        label: "Electronic Journals",
        icon: <NotebookPen size={15} />,
      },
      {
        key: ROUTER.ADMIN_INVENTORY,
        label: "Inventory Master",
        icon: <PackageSearch size={15} />,
      },
      {
        key: ROUTER.ADMIN_SUPPLIES,
        label: "Supplies Management",
        icon: <FlaskConical size={15} />,
      },
    ],
  },
  {
    key: "admin-system",
    label: "System Configuration",
    icon: <Settings size={18} />,
    children: [
      {
        key: ROUTER.ADMIN_USERS,
        label: "User Management",
        icon: <Users size={15} />,
      },
      {
        key: ROUTER.ADMIN_FORM_TEMPLATE,
        label: "Form Templates",
        icon: <ScrollText size={15} />,
      },
    ],
  },
];

export const MenuItemUser = () => [
  {
    key: ROUTER.USER_DASHBOARD,
    label: "My Dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  {
    key: "user-production",
    label: "Production",
    icon: <Tractor size={18} />,
    children: [
      {
        key: ROUTER.USER_JOURNAL,
        label: "My Journals",
        icon: <BookOpen size={15} />,
      },
      {
        key: ROUTER.USER_PRODUCTION_PROCESS,
        label: "Production Process",
        icon: <Sprout size={15} />,
      },
    ],
  },
  {
    key: ROUTER.USER_WAREHOUSE,
    label: "My Warehouse",
    icon: <Warehouse size={18} />,
  },
];

export const MenuItemSeller = () => [
  {
    key: "/seller/dashboard",
    label: "Seller Dashboard",
    icon: <LayoutDashboard size={18} />,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// DROPDOWN MENU – dùng trong Avatar Dropdown ở Header (flat, có phân nhóm)
// ─────────────────────────────────────────────────────────────────────────────

export const MenuDropItemAdmin = () => [
  {
    type: "group",
    label: "Quick Navigation",
    children: [
      {
        key: ROUTER.ADMIN_DASHBOARD,
        label: "Dashboard",
        icon: <LayoutDashboard size={15} />,
      },
      {
        key: ROUTER.ADMIN_JOURNAL,
        label: "Electronic Journals",
        icon: <NotebookPen size={15} />,
      },
      {
        key: ROUTER.ADMIN_INVENTORY,
        label: "Inventory Master",
        icon: <PackageSearch size={15} />,
      },
      {
        key: ROUTER.ADMIN_USERS,
        label: "User Management",
        icon: <Users size={15} />,
      },
      {
        key: ROUTER.ADMIN_FORM_TEMPLATE,
        label: "Form Templates",
        icon: <ScrollText size={15} />,
      },
    ],
  },
  { type: "divider" },
  {
    type: "group",
    label: "Account",
    children: [
      {
        key: ROUTER.PROFILE,
        label: "My Profile",
        icon: <User size={15} />,
      },
      {
        key: ROUTER.CHANGE_PASSWORD,
        label: "Change Password",
        icon: <KeyRound size={15} />,
      },
      {
        key: ROUTER.NOTIFICATIONS,
        label: "Notifications",
        icon: <Bell size={15} />,
      },
    ],
  },
];

export const MenuDropItemUser = () => [
  {
    type: "group",
    label: "Quick Navigation",
    children: [
      {
        key: ROUTER.USER_DASHBOARD,
        label: "My Dashboard",
        icon: <LayoutDashboard size={15} />,
      },
      {
        key: ROUTER.USER_JOURNAL,
        label: "My Journals",
        icon: <BookOpen size={15} />,
      },
      {
        key: ROUTER.USER_PRODUCTION_PROCESS,
        label: "Production Process",
        icon: <Tractor size={15} />,
      },
      {
        key: ROUTER.USER_WAREHOUSE,
        label: "My Warehouse",
        icon: <Warehouse size={15} />,
      },
    ],
  },
  { type: "divider" },
  {
    type: "group",
    label: "Account",
    children: [
      {
        key: ROUTER.PROFILE,
        label: "My Profile",
        icon: <User size={15} />,
      },
      {
        key: ROUTER.CHANGE_PASSWORD,
        label: "Change Password",
        icon: <KeyRound size={15} />,
      },
      {
        key: ROUTER.NOTIFICATIONS,
        label: "Notifications",
        icon: <Bell size={15} />,
      },
    ],
  },
];

export const MenuDropItemSeller = () => [
  {
    type: "group",
    label: "Quick Navigation",
    children: [
      {
        key: "/seller/dashboard",
        label: "Seller Dashboard",
        icon: <LayoutDashboard size={15} />,
      },
    ],
  },
  { type: "divider" },
  {
    type: "group",
    label: "Account",
    children: [
      {
        key: ROUTER.PROFILE,
        label: "My Profile",
        icon: <User size={15} />,
      },
      {
        key: ROUTER.NOTIFICATIONS,
        label: "Notifications",
        icon: <Bell size={15} />,
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Lấy Sidebar menu theo role */
export const getMenuByRole = (role) => {
  switch (role) {
    case "admin":   return MenuItemAdmin();
    case "user":    return MenuItemUser();
    case "seller":  return MenuItemSeller();
    default:        return MenuItem();
  }
};

/** Lấy Dropdown menu theo role (dùng cho Avatar dropdown ở Header) */
export const getDropMenuByRole = (role) => {
  switch (role) {
    case "admin":   return MenuDropItemAdmin();
    case "user":    return MenuDropItemUser();
    case "seller":  return MenuDropItemSeller();
    default:        return [];
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC MENU (trang chủ – không cần đăng nhập)
// ─────────────────────────────────────────────────────────────────────────────
const MenuItem = () => [
  { key: ROUTER.HOME,    label: "Home" },
  { key: "/news",        label: "Agricultural News" },
  { key: "/about",       label: "About Us" },
  { key: "/contact",     label: "Contact" },
];

export default MenuItem;
