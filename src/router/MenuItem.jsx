// src/router/MenuItem.jsx
// 4 Role: FARM_MANAGER, LAND_MANAGER, MATERIAL_MANAGER, FARMER
// Sidebar được lọc theo user?.role

import {
  AppstoreOutlined,
  FileTextOutlined,
  ReadOutlined,
  BellOutlined,
  SettingOutlined,
  InboxOutlined,
  CheckCircleOutlined,
  TeamOutlined,
  ToolOutlined,
  ShoppingCartOutlined,
  ShopOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons'
import {
  BookOpenText,
  BoxSelect,
  ClipboardList,
  MapPinned,
  Package,
  Sprout,
  Users,
} from 'lucide-react'
import ROUTER from './ROUTER'

// ─── FARM_MANAGER MENU ────────────────────────────────────────────────────────
export const farmManagerItem = () => [
  {
    key: ROUTER.FM_DASHBOARD,
    icon: <AppstoreOutlined className="text-lg" />,
    label: 'Tổng quan',
  },
  {
    key: ROUTER.FM_USERS,
    icon: <Users className="w-5 h-5" />,
    label: 'Quản lý người dùng',
  },
  {
    key: ROUTER.FM_LANDS,
    icon: <MapPinned className="w-5 h-5" />,
    label: 'Quản lý vùng trồng',
  },
  {
    key: ROUTER.FM_CROP_CATALOGS,
    icon: <Sprout className="w-5 h-5" />,
    label: 'Danh mục cây trồng',
  },
  {
    key: ROUTER.FM_PRODUCTION_PLANS,
    icon: <ClipboardList className="w-5 h-5" />,
    label: 'Kế hoạch sản xuất',
  },
  {
    key: ROUTER.FM_TASKS,
    icon: <CheckCircleOutlined className="text-lg" />,
    label: 'Quản lý nhiệm vụ',
  },
  {
    key: ROUTER.FM_LOGBOOKS,
    icon: <BookOpenText className="w-5 h-5" />,
    label: 'Nhật ký sản xuất',
  },
  {
    key: ROUTER.FM_BATCHES,
    icon: <BoxSelect className="w-5 h-5" />,
    label: 'Quản lý lô sản xuất',
  },
  {
    key: ROUTER.FM_NOTIFICATIONS,
    icon: <BellOutlined className="text-lg" />,
    label: 'Thông báo',
  },
  {
    key: 'material-submenu',
    icon: <Package className="w-5 h-5" />,
    label: 'Quản lý vật tư',
    children: [
      { key: ROUTER.FM_VIEW_FERTILIZERS, label: 'Phân bón' },
      { key: ROUTER.FM_VIEW_CROP_PROTECTIONS, label: 'Nông dược' },
    ],
  },
]

// ─── LAND_MANAGER MENU ────────────────────────────────────────────────────────
export const landManagerItem = () => [
  {
    key: ROUTER.LM_DASHBOARD,
    icon: <AppstoreOutlined className="text-lg" />,
    label: 'Tổng quan',
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
    key: ROUTER.LM_CROP_CATALOGS,
    icon: <Sprout className="w-5 h-5" />,
    label: 'Danh mục cây trồng',
  },
  {
    key: ROUTER.LM_PRODUCTION_PLANS,
    icon: <FileTextOutlined className="text-lg" />,
    label: 'Kế hoạch sản xuất',
  },
  {
    key: ROUTER.LM_TASKS,
    icon: <CheckCircleOutlined className="text-lg" />,
    label: 'Quản lý nhiệm vụ',
  },
  {
    key: ROUTER.LM_LOGBOOKS,
    icon: <SettingOutlined className="text-lg" />,
    label: 'Nhật ký sản xuất',
  },
  {
    key: ROUTER.LM_BATCHES,
    icon: <BoxSelect className="w-5 h-5" />,
    label: 'Quản lý lô sản xuất',
  },
  {
    key: ROUTER.LM_VIEW_CATALOGS,
    icon: <ReadOutlined className="text-lg" />,
    label: 'Danh mục tham khảo',
  },
]

// ─── MATERIAL_MANAGER MENU ────────────────────────────────────────────────────
export const materialManagerItem = () => [
  {
    key: ROUTER.MM_DASHBOARD,
    icon: <AppstoreOutlined className="text-lg" />,
    label: 'Tổng quan',
  },
  {
    key: ROUTER.MM_FERTILIZERS,
    icon: <InboxOutlined className="text-lg" />,
    label: 'Quản lý phân bón',
  },
  {
    key: ROUTER.MM_CROP_PROTECTIONS,
    icon: <ShopOutlined className="w-5 h-5" />,
    label: 'Quản lý thuốc BVTV',
  },
  {
    key: ROUTER.MM_MACHINERY,
    icon: <ToolOutlined className="text-lg" />,
    label: 'Quản lý máy móc',
  },
  {
    key: ROUTER.MM_OTHER_MATERIALS,
    icon: <BoxSelect className="w-5 h-5" />,
    label: 'Vật tư khác',
  },
  {
    key: ROUTER.MM_PURCHASE_REQS,
    icon: <ShoppingCartOutlined className="text-lg" />,
    label: 'Yêu cầu mua vật tư',
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
    label: 'Nhật ký sản xuất',
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
    case 'FARM_MANAGER':     return farmManagerItem()
    case 'LAND_MANAGER':     return landManagerItem()
    case 'MATERIAL_MANAGER': return materialManagerItem()
    case 'FARMER':           return farmerItem()
    default:                 return []
  }
}

// ─── PUBLIC MENU (landing navigation) ────────────────────────────────────────
export const publicMenu = () => [
  { key: ROUTER.HOME,  label: 'Trang chủ' },
  { key: ROUTER.NEWS,  label: 'Tin tức' },
  { key: ROUTER.TCVN,  label: 'Tra cứu TCVN' },
]

export default {
  farmManagerItem,
  landManagerItem,
  materialManagerItem,
  farmerItem,
  getMenuByRole,
  publicMenu,
}
