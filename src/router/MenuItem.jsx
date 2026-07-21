// src/router/MenuItem.jsx
// 4 Role: FARM_MANAGER, FARM_SUPERVISOR, FARM_LEADER, FARMER
// Sidebar được lọc theo user?.role

import {
  AppstoreOutlined,
  FileTextOutlined,
  BellOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  ToolOutlined,
  ShoppingCartOutlined,
  ShopOutlined,
  EnvironmentOutlined,
  UserOutlined,
  BookOutlined,
  ContainerOutlined,
  ProfileOutlined,
  FormOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons'
import { Sprout } from 'lucide-react'
import ROUTER from './ROUTER'
import { ROLES } from 'src/constants/roles'

// ─── FARM_MANAGER MENU ────────────────────────────────────────────────────────
export const farmManagerItem = () => [
  {
    key: ROUTER.FM_DASHBOARD,
    icon: <AppstoreOutlined className="text-lg" />,
    label: 'Tổng quan',
  },
  {
    key: ROUTER.FM_USERS,
    icon: <UserOutlined className="text-lg" />,
    label: 'Quản lý người dùng',
  },
  {
    key: ROUTER.FM_LANDS,
    icon: <EnvironmentOutlined className="text-lg" />,
    label: 'Quản lý vùng trồng',
  },
  {
    key: ROUTER.FM_CROP_CATALOGS,
    icon: <FileTextOutlined className="text-lg" />,
    label: 'Danh mục cây trồng',
  },
  {
    key: ROUTER.FM_CROPS,
    icon: <Sprout className="w-5 h-5" />,
    label: 'Cây trồng',
  },
  {
    key: ROUTER.FM_PLAN_TEMPLATES,
    icon: <ProfileOutlined className="text-lg" />,
    label: 'Thư viện mẫu',
  },
  {
    key: ROUTER.FM_PRODUCTION_PLANS,
    icon: <ContainerOutlined className="text-lg" />,
    label: 'Nhật ký canh tác',
  },
  {
    key: ROUTER.FM_LOGBOOKS,
    icon: <BookOutlined className="text-lg" />,
    label: 'Duyệt nhật ký canh tác',
  },
  {
    key: ROUTER.FM_QUALITY_INSPECTIONS,
    icon: <SafetyCertificateOutlined className="text-lg" />,
    label: 'Kiểm tra chất lượng',
  },

  // {
  //   key: ROUTER.FM_TASKS,
  //   icon: <CheckCircleOutlined className="text-lg" />,
  //   label: 'Quản lý nhiệm vụ',
  // },
  {
    key: ROUTER.FM_BATCHES,
    icon: <InboxOutlined className="text-lg" />,
    label: 'Quản lý lô thu hoạch',
  },
  {
    key: ROUTER.FM_NOTIFICATIONS,
    icon: <BellOutlined className="text-lg" />,
    label: 'Thông báo',
  },
  {
    key: 'material-submenu',
    icon: <ShopOutlined className="text-lg" />,
    label: 'Quản lý vật tư',
    children: [
      { key: ROUTER.FM_VIEW_FERTILIZERS, label: 'Phân bón' },
      { key: ROUTER.FM_VIEW_CROP_PROTECTIONS, label: 'Nông dược' },
    ],
  },
  {
    key: 'reference-submenu',
    icon: <BookOutlined className="text-lg" />,
    label: 'Tra cứu cấp phép',
    children: [
      { key: ROUTER.FM_REF_FERTILIZER, label: 'Danh mục phân bón' },
      { key: ROUTER.FM_REF_PESTICIDE, label: 'Danh mục thuốc BVTV' },
    ],
  },
]

// ─── FARM SUPERVISOR MENU ─────────────────────────────────────────────────────
export const farmSupervisorItem = () => [
  {
    key: ROUTER.FS_PLANS,
    icon: <ContainerOutlined className="text-lg" />,
    label: 'Kế hoạch & Nhật ký',
  },
  {
    key: ROUTER.LM_FARMERS,
    icon: <TeamOutlined className="text-lg" />,
    label: 'Quản lý nông dân',
  },
  {
    key: ROUTER.LM_LANDS,
    icon: <EnvironmentOutlined className="text-lg" />,
    label: 'Quản lý vùng trồng',
  },
  {
    key: ROUTER.NOTIFICATIONS,
    icon: <BellOutlined className="text-lg" />,
    label: 'Thông báo',
  },
]

// ─── FARM LEADER MENU ─────────────────────────────────────────────────────────
export const farmLeaderItem = () => [
  {
    key: ROUTER.LM_FIELD_LOG,
    icon: <FormOutlined className="text-lg" />,
    label: 'Kế hoạch & Ghi chép',
  },
  {
    key: ROUTER.FL_TASKS,
    icon: <CheckCircleOutlined className="text-lg" />,
    label: 'Công việc của tôi',
  },
  {
    key: ROUTER.NOTIFICATIONS,
    icon: <BellOutlined className="text-lg" />,
    label: 'Thông báo',
  },
]

// ─── FARMER MENU ──────────────────────────────────────────────────────────────
export const farmerItem = () => [
  {
    key: ROUTER.FARMER_DASHBOARD,
    icon: <AppstoreOutlined className="text-lg" />,
    label: 'Tổng quan',
  },
  {
    key: ROUTER.FARMER_TASKS,
    icon: <CheckCircleOutlined className="text-lg" />,
    label: 'Nhiệm vụ',
  },
  {
    key: ROUTER.FARMER_LOGBOOKS,
    icon: <FileTextOutlined className="text-lg" />,
    label: 'Nhật ký canh tác',
  },
  {
    key: ROUTER.FARMER_SUPPLIES,
    icon: <ShoppingCartOutlined className="text-lg" />,
    label: 'Yêu cầu vật tư',
  },
]

// ─── HELPER: Lấy menu theo role ───────────────────────────────────────────────
export const getMenuByRole = (role) => {
  switch (role) {
    case ROLES.FARM_MANAGER: return farmManagerItem()
    case ROLES.FARM_SUPERVISOR: return farmSupervisorItem()
    case ROLES.FARM_LEADER: return farmLeaderItem()
    case ROLES.FARMER: return farmerItem()
    default: return []
  }
}

// ─── PUBLIC MENU (landing navigation) ────────────────────────────────────────
export const publicMenu = () => [
  { key: ROUTER.HOME, label: 'Trang chủ' },
  { key: ROUTER.NEWS, label: 'Tin tức' },
  { key: ROUTER.TCVN, label: 'Tra cứu TCVN' },
]

export default {
  farmManagerItem,
  farmerItem,
  farmSupervisorItem,
  farmLeaderItem,
  getMenuByRole,
  publicMenu,
}
