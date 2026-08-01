// src/router/MenuItem.jsx
// 3 Roles: FARM_MANAGER, FARM_SUPERVISOR, FARM_LEADER
// Sidebar được lọc theo user?.role

import {
  DashboardIcon,
  UserManagementIcon,
  LandManagementIcon,
  CropCatalogIcon,
  CropIcon,
  TemplateLibraryIcon,
  LogbookIcon,
  ApprovalLogbookIcon,
  ReportIcon,
  TaskCatalogIcon,
  HarvestBatchIcon,
  NotificationIcon,
  MaterialManagementIcon,
  FertilizerIcon,
  PesticideIcon,
  ImportHistoryIcon,
  ReferenceBookIcon,
  PlanLogbookIcon,
  FarmerManagementIcon,
  MyTaskIcon,
} from 'src/assets/icon/menu/MenuIcons'
import ROUTER from './ROUTER'
import { ROLES } from 'src/constants/roles'

// ─── FARM_MANAGER MENU ────────────────────────────────────────────────────────
export const farmManagerItem = () => [
  {
    key: ROUTER.FM_DASHBOARD,
    icon: <DashboardIcon className="text-lg" />,
    label: 'Tổng quan',
  },
  {
    key: ROUTER.FM_USERS,
    icon: <UserManagementIcon className="text-lg" />,
    label: 'Quản lý người dùng',
  },
  {
    key: ROUTER.FM_LANDS,
    icon: <LandManagementIcon className="text-lg" />,
    label: 'Quản lý vùng trồng',
  },
  {
    key: ROUTER.FM_CROP_CATALOGS,
    icon: <CropCatalogIcon className="text-lg" />,
    label: 'Danh mục cây trồng',
  },
  {
    key: ROUTER.FM_CROPS,
    icon: <CropIcon className="text-lg" />,
    label: 'Cây trồng',
  },
  {
    key: ROUTER.FM_PROCESS_TEMPLATES,
    icon: <TemplateLibraryIcon className="text-lg" />,
    label: 'Thư viện mẫu',
  },
  {
    key: ROUTER.FM_CULTIVATION_LOGBOOKS,
    icon: <LogbookIcon className="text-lg" />,
    label: 'Nhật ký canh tác',
  },
  {
    key: ROUTER.FM_LOGBOOKS,
    icon: <ApprovalLogbookIcon className="text-lg" />,
    label: 'Duyệt nhật ký canh tác',
  },
  {
    key: ROUTER.FM_REPORTS,
    icon: <ReportIcon className="text-lg" />,
    label: 'Báo cáo thống kê',
  },
  {
    key: ROUTER.FM_TASK_CATALOGS,
    icon: <TaskCatalogIcon className="text-lg" />,
    label: 'Danh mục công việc',
  },
  {
    key: ROUTER.FM_HARVEST_BATCHES,
    icon: <HarvestBatchIcon className="text-lg" />,
    label: 'Quản lý lô thu hoạch',
  },
  {
    key: ROUTER.FM_NOTIFICATIONS,
    icon: <NotificationIcon className="text-lg" />,
    label: 'Thông báo',
  },
  {
    key: 'material-submenu',
    icon: <MaterialManagementIcon className="text-lg" />,
    label: 'Quản lý vật tư',
    children: [
      { key: ROUTER.FM_FERTILIZERS, icon: <FertilizerIcon />, label: 'Phân bón' },
      { key: ROUTER.FM_PESTICIDES, icon: <PesticideIcon />, label: 'Nông dược' },
      { key: ROUTER.FM_INVENTORY_IMPORT_HISTORY, icon: <ImportHistoryIcon />, label: 'Lịch sử nhập kho' },
    ],
  },
  {
    key: 'reference-submenu',
    icon: <ReferenceBookIcon className="text-lg" />,
    label: 'Tra cứu cấp phép',
    children: [
      { key: ROUTER.FM_REF_FERTILIZER, icon: <FertilizerIcon />, label: 'Danh mục phân bón' },
      { key: ROUTER.FM_REF_PESTICIDE, icon: <PesticideIcon />, label: 'Danh mục nông dược' },
    ],
  },
]

// ─── FARM SUPERVISOR MENU ─────────────────────────────────────────────────────
export const farmSupervisorItem = () => [
  {
    key: ROUTER.FS_CULTIVATION_LOGBOOKS,
    icon: <PlanLogbookIcon className="text-lg" />,
    label: 'Kế hoạch & Nhật ký',
  },
  {
    key: ROUTER.FS_FARMERS,
    icon: <FarmerManagementIcon className="text-lg" />,
    label: 'Quản lý nông dân',
  },
  {
    key: ROUTER.FS_LANDS,
    icon: <LandManagementIcon className="text-lg" />,
    label: 'Quản lý vùng trồng',
  },
  {
    key: ROUTER.NOTIFICATIONS,
    icon: <NotificationIcon className="text-lg" />,
    label: 'Thông báo',
  },
]

// ─── FARM LEADER MENU ─────────────────────────────────────────────────────────
export const farmLeaderItem = () => [
  {
    key: ROUTER.FL_TASKS,
    icon: <MyTaskIcon className="text-lg" />,
    label: 'Công việc của tôi',
  },
  {
    key: ROUTER.NOTIFICATIONS,
    icon: <NotificationIcon className="text-lg" />,
    label: 'Thông báo',
  },
]

// ─── HELPER: Lấy menu theo role ───────────────────────────────────────────────
export const getMenuByRole = (role) => {
  switch (role) {
    case ROLES.FARM_MANAGER: return farmManagerItem()
    case ROLES.FARM_SUPERVISOR: return farmSupervisorItem()
    case ROLES.FARM_LEADER: return farmLeaderItem()
    default: return []
  }
}

// ─── PUBLIC MENU (landing navigation) ────────────────────────────────────────
export const publicMenu = () => []

export default {
  farmManagerItem,
  farmSupervisorItem,
  farmLeaderItem,
  getMenuByRole,
  publicMenu,
}
