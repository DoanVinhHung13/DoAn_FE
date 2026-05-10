import { LayoutDashboard, Users, Settings, User, BookOpen, Warehouse, Trees, ScrollText, Tractor } from "lucide-react";
import ROUTER from "./ROUTER";

export const MenuItemAdmin = () => [
  {
    key: ROUTER.ADMIN_DASHBOARD,
    label: "Dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  {
    key: "admin-farm",
    label: "Farm Management",
    icon: <Trees size={20} />,
    children: [
      {
        key: ROUTER.ADMIN_JOURNAL,
        label: "Electronic Journals",
      },
      {
        key: ROUTER.ADMIN_INVENTORY,
        label: "Inventory Master",
      },
      {
        key: ROUTER.ADMIN_SUPPLIES,
        label: "Supplies Management",
      },
    ],
  },
  {
    key: "admin-system",
    label: "System Configuration",
    icon: <Settings size={20} />,
    children: [
      {
        key: ROUTER.ADMIN_USERS,
        label: "User Management",
        icon: <Users size={16} />
      },
      {
        key: ROUTER.ADMIN_FORM_TEMPLATE,
        label: "Form Templates",
        icon: <ScrollText size={16} />
      },
    ],
  },
];

export const MenuItemUser = () => [
  {
    key: ROUTER.USER_DASHBOARD,
    label: "My Dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  {
    key: "user-production",
    label: "Production",
    icon: <Tractor size={20} />,
    children: [
      {
        key: ROUTER.USER_JOURNAL,
        label: "My Journals",
        icon: <BookOpen size={16} />
      },
      {
        key: ROUTER.USER_PRODUCTION_PROCESS,
        label: "Production Process",
      },
    ]
  },
  {
    key: ROUTER.USER_WAREHOUSE,
    label: "My Warehouse",
    icon: <Warehouse size={20} />,
  },
  {
    key: ROUTER.PROFILE,
    label: "My Profile",
    icon: <User size={20} />,
  },
];

export const MenuItemSeller = () => [
  {
    key: "/seller/dashboard",
    label: "Seller Dashboard",
    icon: <LayoutDashboard size={20} />,
  },
];

// Helper to get menu by role
export const getMenuByRole = (role) => {
  switch (role) {
    case "admin":
      return MenuItemAdmin();
    case "user":
      return MenuItemUser();
    case "seller":
      return MenuItemSeller();
    default:
      return MenuItem();
  }
};

const MenuItem = () => {
  return [
    {
      key: ROUTER.HOME,
      label: "Home",
    },
    {
      label: "Agricultural News",
      key: "/news",
    },
    {
      label: "About Us",
      key: "/about",
    },
    {
      label: "Contact",
      key: "/contact",
    },
  ];
};
export default MenuItem;
