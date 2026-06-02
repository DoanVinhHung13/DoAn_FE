// src/router/MenuItem.jsx
// Mỗi item có TabID[] — dùng để hasPermission() filter menu.
// TabID = [] hoặc undefined → luôn hiển thị (public/tất cả role)
// TabID phải khớp với CategoryID trong listTabs từ RoleService.getListTab()
//
// Mapping TabID → Route (cập nhật theo API thực tế của backend):
// 1  = Dashboard / Tổng quan
// 2  = Báo cáo & Thống kê
// 3  = Thông tin tài khoản
// 4  = Biểu mẫu nhật ký (Form Builder)
// 5  = Tra cứu TCVN
// 6  = Quản lý tin tức
// 7  = Yêu cầu tư vấn
// 8  = Test AI (Groq, RAG, Chat Stats)
// 9  = Mô hình nông nghiệp
// 10 = Quản lý nhật ký (Admin)
// 11 = Kho vật tư
// 12 = Quản lý tài khoản (Users/Groups/Roles)
// 13 = Nhật ký hệ thống
// 14 = Cấu hình hệ thống
// 20 = HTX: Quản lý nông dân
// 21 = HTX: Sổ nhật ký
// 22 = HTX: Kho vật tư tập trung
// 23 = HTX: Duyệt nhật ký
// 24 = HTX: Sản phẩm
// 25 = HTX: Lô sản xuất
// 26 = HTX: Cấp phát vật tư
// 27 = HTX: Thiết lập cổng quốc gia
// 30 = Farmer: Nhật ký VietGAP
// 31 = Farmer: Nhật ký Hữu cơ
// 32 = Farmer: Nhật ký Thông minh
// 33 = Farmer: Tồn kho
// 34 = Farmer: Xin cấp vật tư
// 35 = Farmer: Quy trình kỹ thuật

import {
  AppstoreOutlined,
  BarChartOutlined,
  UserOutlined,
  FileTextOutlined,
  ReadOutlined,
  PhoneOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  SettingOutlined,
  InboxOutlined,
  BorderOutlined,
  LockOutlined,
  CheckCircleOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import { Leaf, BoxSelect, Droplet, Sprout, RefreshCcw } from 'lucide-react'
import ROUTER from './ROUTER'

// ─── ADMIN MENU ───────────────────────────────────────────────────────────────
export const MenuItemAdmin = () => [
  {
    key:   ROUTER.ADMIN_DASHBOARD,
    icon:  <AppstoreOutlined className="text-lg" />,
    label: 'Tổng quan',
    TabID: [1],
  },
  {
    key:   ROUTER.ADMIN_REPORTS,
    icon:  <BarChartOutlined className="text-lg" />,
    label: 'Báo cáo & Thống kê',
    TabID: [2],
  },
  {
    key:   ROUTER.ACCOUNT_INFO,
    icon:  <UserOutlined className="text-lg" />,
    label: 'Thông tin tài khoản',
    TabID: [],  // tất cả đã login đều thấy
  },
  {
    key:   ROUTER.ADMIN_FORM_BUILDER,
    icon:  <FileTextOutlined className="text-lg" />,
    label: 'Biểu mẫu nhật ký',
    TabID: [4],
  },
  {
    key:   ROUTER.TCVN_AUTH,
    icon:  <ReadOutlined className="text-lg" />,
    label: 'Tra cứu TCVN',
    TabID: [5],
  },
  {
    key:   ROUTER.ADMIN_NEWS,
    icon:  <FileTextOutlined className="text-lg" />,
    label: 'Quản lý tin tức',
    TabID: [6],
  },
  {
    key:   ROUTER.ADMIN_CONSULTATIONS,
    icon:  <PhoneOutlined className="text-lg" />,
    label: 'Yêu cầu tư vấn',
    TabID: [7],
  },
  {
    key:   'ai-tools',
    icon:  <ThunderboltOutlined className="text-lg" />,
    label: 'Công cụ AI',
    TabID: [8],
    children: [
      { key: ROUTER.ADMIN_GROQ,       label: 'Test Groq AI',       TabID: [8] },
      { key: ROUTER.ADMIN_GEMINI,     label: 'Test Gemini AI',     TabID: [8] },
      { key: ROUTER.ADMIN_OPENAI,     label: 'Test OpenAI',        TabID: [8] },
      { key: ROUTER.ADMIN_RAG,        label: 'Test RAG System',    TabID: [8] },
      { key: ROUTER.ADMIN_CHAT_STATS, label: 'Thống kê Chat AI',   TabID: [8] },
    ],
  },
  {
    key:   ROUTER.ADMIN_AG_MODELS,
    icon:  <GlobalOutlined className="text-lg" />,
    label: 'Mô hình nông nghiệp',
    TabID: [9],
  },
  {
    key:   ROUTER.ADMIN_JOURNALS,
    icon:  <SettingOutlined className="text-lg" />,
    label: 'Quản lý nhật ký',
    TabID: [10],
  },
  {
    key:   'inventory-mgmt',
    icon:  <InboxOutlined className="text-lg" />,
    label: 'Quản lý kho vật tư',
    TabID: [11],
    children: [
      { key: ROUTER.ADMIN_INVENTORY_CATEGORY, label: 'Danh mục vật tư', TabID: [11] },
      { key: ROUTER.ADMIN_INVENTORY,          label: 'Kho tổng vật tư',  TabID: [11] },
    ],
  },
  {
    key:   'accounts-mgmt',
    icon:  <BorderOutlined className="text-lg" />,
    label: 'Quản lý tài khoản',
    TabID: [12],
    children: [
      { key: ROUTER.ADMIN_USERS,  label: 'Danh sách tài khoản',   TabID: [12] },
      { key: ROUTER.ADMIN_GROUPS, label: 'Quản lý HTX',           TabID: [12] },
      { key: ROUTER.ADMIN_ROLES,  label: 'Phân quyền & Vai trò', TabID: [12] },
    ],
  },
  {
    key:   ROUTER.ADMIN_LOGS,
    icon:  <SettingOutlined className="text-lg" />,
    label: 'Nhật ký hệ thống',
    TabID: [13],
  },
  {
    key:   'system-config',
    icon:  <SettingOutlined className="text-lg" />,
    label: 'Cấu hình hệ thống',
    TabID: [14],
    children: [
      { key: ROUTER.ADMIN_BACKUP, label: 'Backup dữ liệu', TabID: [14] },
    ],
  },
]

// ─── HTX MENU ─────────────────────────────────────────────────────────────────
export const MenuItemHtx = () => [
  {
    key:   ROUTER.ADMIN_DASHBOARD,
    icon:  <AppstoreOutlined className="text-lg" />,
    label: 'Tổng quan HTX',
    TabID: [1],
  },
  {
    key:   ROUTER.ADMIN_REPORTS,
    icon:  <BarChartOutlined className="text-lg" />,
    label: 'Báo cáo & Thống kê',
    TabID: [2],
  },
  {
    key:   ROUTER.HTX_FARMERS,
    icon:  <TeamOutlined className="text-lg" />,
    label: 'Quản lý nông dân',
    TabID: [20],
  },
  {
    key:   ROUTER.HTX_JOURNALS,
    icon:  <SettingOutlined className="text-lg" />,
    label: 'Quản lý sổ HTX',
    TabID: [21],
  },
  {
    key:   ROUTER.HTX_INVENTORY,
    icon:  <InboxOutlined className="text-lg" />,
    label: 'Kho vật tư tập trung',
    TabID: [22],
  },
  {
    key:   ROUTER.HTX_APPROVALS,
    icon:  <CheckCircleOutlined className="text-lg" />,
    label: 'Duyệt nhật ký nông dân',
    TabID: [23],
  },
  {
    key:   ROUTER.HTX_PRODUCTS,
    icon:  <Sprout className="w-5 h-5" />,
    label: 'Quản lý sản phẩm',
    TabID: [24],
  },
  {
    key:   ROUTER.HTX_BATCHES,
    icon:  <BoxSelect className="w-5 h-5" />,
    label: 'Quản lý lô sản xuất',
    TabID: [25],
  },
  {
    key:   ROUTER.HTX_SUPPLIES,
    icon:  <Droplet className="w-5 h-5" />,
    label: 'Quản lý cấp phát vật tư',
    TabID: [26],
  },
  {
    key:   ROUTER.HTX_PORTAL_SETTINGS,
    icon:  <GlobalOutlined className="text-lg" />,
    label: 'Thiết lập cổng quốc gia',
    TabID: [27],
  },
  {
    key:   ROUTER.ACCOUNT_INFO,
    icon:  <UserOutlined className="text-lg" />,
    label: 'Thông tin tài khoản',
    TabID: [],
  },
]

// ─── FARMER MENU ──────────────────────────────────────────────────────────────
export const MenuItemFarmer = () => [
  {
    key:   ROUTER.ADMIN_DASHBOARD,
    icon:  <AppstoreOutlined className="text-lg" />,
    label: 'Tổng quan',
    TabID: [1],
  },
  {
    key:   ROUTER.ADMIN_REPORTS,
    icon:  <BarChartOutlined className="text-lg" />,
    label: 'Báo cáo & Thống kê',
    TabID: [2],
  },
  {
    key:   'vietgap',
    icon:  <Sprout className="w-[18px] h-[18px] text-green-600" />,
    label: 'Sản xuất VietGAP',
    TabID: [30],
    children: [
      { key: '/vietgap/trong-trot', label: 'VietGAP Trồng trọt', TabID: [30] },
      { key: '/vietgap/chan-nuoi',  label: 'VietGAHP Chăn nuôi', TabID: [30] },
      { key: '/vietgap/thuy-san',  label: 'VietGAP Thủy sản',   TabID: [30] },
    ],
  },
  {
    key:   'huuco',
    icon:  <Leaf className="w-5 h-5 text-green-600" />,
    label: 'Nông nghiệp hữu cơ',
    TabID: [31],
    children: [
      { key: '/huuco/cay-trong', label: 'Cây trồng',  TabID: [31] },
      { key: '/huuco/chan-nuoi', label: 'Chăn nuôi',  TabID: [31] },
      { key: '/huuco/thuy-san', label: 'Thủy sản',   TabID: [31] },
    ],
  },
  {
    key:   'thongminh',
    icon:  <RefreshCcw className="w-[18px] h-[18px] text-green-600" />,
    label: 'Nông nghiệp thông minh',
    TabID: [32],
    children: [
      { key: '/thongminh/rau-cu-qua', label: 'Rau củ quả', TabID: [32] },
      { key: '/thongminh/lua',        label: 'Lúa',         TabID: [32] },
      { key: '/thongminh/chan-nuoi',  label: 'Chăn nuôi',   TabID: [32] },
    ],
  },
  {
    key:   ROUTER.FARMER_INVENTORY,
    icon:  <InboxOutlined className="text-lg" />,
    label: 'Tồn kho',
    TabID: [33],
  },
  {
    key:   ROUTER.FARMER_SUPPLIES,
    icon:  <BoxSelect className="w-5 h-5" />,
    label: 'Xin cấp vật tư',
    TabID: [34],
  },
  {
    key:   'docs-submenu',
    icon:  <ReadOutlined className="text-lg" />,
    label: 'Tiêu chuẩn & Quy trình',
    TabID: [35],
    children: [
      { key: ROUTER.PRODUCTION_TECH, label: 'Quy trình kỹ thuật', TabID: [35] },
      { key: ROUTER.TCVN_AUTH,       label: 'Tra cứu TCVN',       TabID: [5] },
    ],
  },
  {
    key:   ROUTER.ACCOUNT_INFO,
    icon:  <UserOutlined className="text-lg" />,
    label: 'Thông tin tài khoản',
    TabID: [],
  },
]

// ─── PUBLIC MENU (landing navigation) ────────────────────────────────────────
const MenuItem = () => [
  { key: ROUTER.HOME,  label: 'Trang chủ' },
  { key: ROUTER.NEWS,  label: 'Tin tức' },
  { key: ROUTER.TCVN,  label: 'Tra cứu TCVN' },
]

export default MenuItem
