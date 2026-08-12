// src/router/MenuItem.jsx
// 3 Roles: FARM_MANAGER, FARM_SUPERVISOR, FARMER_LEADER
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
    icon: <DashboardIcon style={{ fontSize: '22px' }} />,
    label: 'Tổng quan',
  },
  {
    key: ROUTER.FM_USERS,
    icon: <UserManagementIcon style={{ fontSize: '22px' }} />,
    label: 'Quản lý người dùng',
  },
  {
    key: ROUTER.FM_LANDS,
    icon: <LandManagementIcon style={{ fontSize: '22px' }} />,
    label: 'Quản lý vùng trồng',
  },
  {
    key: ROUTER.FM_CROP_CATALOGS,
    icon: <CropCatalogIcon style={{ fontSize: '22px' }} />,
    label: 'Danh mục cây trồng',
  },
  {
    key: ROUTER.FM_CROPS,
    icon: <CropIcon style={{ fontSize: '22px' }} />,
    label: 'Cây trồng',
  },
  {
    key: ROUTER.FM_PROCESS_TEMPLATES,
    icon: <TemplateLibraryIcon style={{ fontSize: '22px' }} />,
    label: 'Thư viện mẫu',
  },
  {
    key: ROUTER.FM_CULTIVATION_LOGBOOKS,
    icon: <LogbookIcon style={{ fontSize: '22px' }} />,
    label: 'Nhật ký canh tác',
  },
  {
    key: ROUTER.FM_LOGBOOKS,
    icon: <ApprovalLogbookIcon style={{ fontSize: '22px' }} />,
    label: 'Duyệt nhật ký canh tác',
  },
  {
    key: ROUTER.FM_REPORTS,
    icon: <ReportIcon style={{ fontSize: '22px' }} />,
    label: 'Báo cáo thống kê',
  },
  {
    key: ROUTER.FM_TASK_CATALOGS,
    icon: <TaskCatalogIcon style={{ fontSize: '22px' }} />,
    label: 'Danh mục công việc',
  },
  {
    key: ROUTER.FM_HARVEST_BATCHES,
    icon: <HarvestBatchIcon style={{ fontSize: '22px' }} />,
    label: 'Quản lý lô thu hoạch',
  },
  {
    key: ROUTER.FM_NOTIFICATIONS,
    icon: <NotificationIcon style={{ fontSize: '22px' }} />,
    label: 'Thông báo',
  },
  {
    key: 'material-submenu',
    icon: <MaterialManagementIcon style={{ fontSize: '22px' }} />,
    label: 'Quản lý vật tư',
    children: [
      { key: ROUTER.FM_FERTILIZERS, icon: <FertilizerIcon style={{ fontSize: '16px' }} />, label: 'Phân bón' },
      { key: ROUTER.FM_PESTICIDES, icon: <PesticideIcon style={{ fontSize: '16px' }} />, label: 'Nông dược' },
      { key: ROUTER.FM_INVENTORY_IMPORT_HISTORY, icon: <ImportHistoryIcon style={{ fontSize: '16px' }} />, label: 'Lịch sử nhập kho' },
    ],
  },
  {
    key: 'reference-submenu',
    icon: <ReferenceBookIcon style={{ fontSize: '22px' }} />,
    label: 'Tra cứu cấp phép',
    children: [
      { key: ROUTER.FM_REF_FERTILIZER, icon: <ReferenceBookIcon style={{ fontSize: '16px' }} />, label: 'Danh mục phân bón' },
      { key: ROUTER.FM_REF_PESTICIDE, icon: <ReferenceBookIcon style={{ fontSize: '16px' }} />, label: 'Danh mục nông dược' },
    ],
  },
]

// ─── FARM SUPERVISOR MENU ─────────────────────────────────────────────────────
export const farmSupervisorItem = () => [
  {
    key: ROUTER.FS_CULTIVATION_LOGBOOKS,
    icon: <PlanLogbookIcon style={{ fontSize: '22px' }} />,
    label: 'Kế hoạch & Nhật ký',
  },
  {
    key: ROUTER.FS_FARMERS,
    icon: <FarmerManagementIcon style={{ fontSize: '22px' }} />,
    label: 'Quản lý nông dân',
  },
  {
    key: ROUTER.FS_LANDS,
    icon: <LandManagementIcon style={{ fontSize: '22px' }} />,
    label: 'Quản lý vùng trồng',
  },
  {
    key: ROUTER.NOTIFICATIONS,
    icon: <NotificationIcon style={{ fontSize: '22px' }} />,
    label: 'Thông báo',
  },
]

// ─── FARM LEADER MENU ─────────────────────────────────────────────────────────
export const farmLeaderItem = () => [
  {
    key: ROUTER.FL_TASKS,
    icon: <MyTaskIcon style={{ fontSize: '22px' }} />,
    label: 'Công việc của tôi',
  },
  {
    key: ROUTER.NOTIFICATIONS,
    icon: <NotificationIcon style={{ fontSize: '22px' }} />,
    label: 'Thông báo',
  },
]

// ─── HELPER: Lấy menu theo role ───────────────────────────────────────────────
export const getMenuByRole = (role) => {
  switch (role) {
    case ROLES.FARM_MANAGER: return farmManagerItem()
    case ROLES.FARM_SUPERVISOR: return farmSupervisorItem()
    case ROLES.FARMER_LEADER: return farmLeaderItem()
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
