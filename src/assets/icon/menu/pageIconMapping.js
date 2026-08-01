// Icon mapping for all pages
// Sử dụng file này để áp dụng icons cho các trang index

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
  QRManagementIcon,
} from 'src/assets/icon/menu/MenuIcons'

// Mapping icons theo route path
export const PAGE_ICONS = {
  // Farm Manager Pages
  '/farm-manager/dashboard': {
    icon: DashboardIcon,
    title: 'Tổng quan',
    color: '#1890ff',
  },
  '/farm-manager/users': {
    icon: UserManagementIcon,
    title: 'Quản lý người dùng',
    color: '#16a34a',
  },
  '/farm-manager/lands': {
    icon: LandManagementIcon,
    title: 'Quản lý vùng trồng',
    color: '#10b981',
  },
  '/farm-manager/crop-catalogs': {
    icon: CropCatalogIcon,
    title: 'Danh mục cây trồng',
    color: '#059669',
  },
  '/farm-manager/crops': {
    icon: CropIcon,
    title: 'Cây trồng',
    color: '#22c55e',
  },
  '/farm-manager/process-templates': {
    icon: TemplateLibraryIcon,
    title: 'Thư viện mẫu',
    color: '#06b6d4',
  },
  '/farm-manager/cultivation-logbooks': {
    icon: LogbookIcon,
    title: 'Nhật ký canh tác',
    color: '#f59e0b',
  },
  '/farm-manager/logbooks': {
    icon: ApprovalLogbookIcon,
    title: 'Duyệt nhật ký canh tác',
    color: '#8b5cf6',
  },
  '/farm-manager/reports': {
    icon: ReportIcon,
    title: 'Báo cáo thống kê',
    color: '#3b82f6',
  },
  '/farm-manager/task-catalogs': {
    icon: TaskCatalogIcon,
    title: 'Danh mục công việc',
    color: '#6366f1',
  },
  '/farm-manager/harvest-batches': {
    icon: HarvestBatchIcon,
    title: 'Quản lý lô thu hoạch',
    color: '#f97316',
  },
  '/farm-manager/qr-codes': {
    icon: QRManagementIcon,
    title: 'Quản lý mã QR',
    color: '#0ea5e9',
  },
  '/farm-manager/notifications': {
    icon: NotificationIcon,
    title: 'Thông báo',
    color: '#ef4444',
  },
  '/farm-manager/fertilizers': {
    icon: FertilizerIcon,
    title: 'Quản lý phân bón',
    color: '#84cc16',
  },
  '/farm-manager/pesticides': {
    icon: PesticideIcon,
    title: 'Quản lý nông dược',
    color: '#a855f7',
  },
  '/farm-manager/inventory-import-history': {
    icon: ImportHistoryIcon,
    title: 'Lịch sử nhập kho',
    color: '#64748b',
  },
  '/farm-manager/ref-fertilizer': {
    icon: ReferenceBookIcon,
    title: 'Tra cứu phân bón',
    color: '#0891b2',
  },
  '/farm-manager/ref-pesticide': {
    icon: ReferenceBookIcon,
    title: 'Tra cứu nông dược',
    color: '#0891b2',
  },

  // Farm Supervisor Pages
  '/farm-supervisor/cultivation-logbooks': {
    icon: PlanLogbookIcon,
    title: 'Kế hoạch & Nhật ký',
    color: '#f59e0b',
  },
  '/farm-supervisor/farmers': {
    icon: FarmerManagementIcon,
    title: 'Quản lý nông dân',
    color: '#16a34a',
  },
  '/farm-supervisor/lands': {
    icon: LandManagementIcon,
    title: 'Quản lý vùng trồng',
    color: '#10b981',
  },

  // Farm Leader Pages
  '/farm-leader/tasks': {
    icon: MyTaskIcon,
    title: 'Công việc của tôi',
    color: '#6366f1',
  },
}

// Helper function để lấy icon config theo path
export const getPageIconConfig = (path) => {
  return PAGE_ICONS[path] || null
}

// Helper function để render icon với title
export const renderPageTitle = (path, customTitle = null) => {
  const config = getPageIconConfig(path)
  if (!config) return null

  const Icon = config.icon
  return {
    icon: <Icon style={{ fontSize: '24px', color: config.color }} />,
    title: customTitle || config.title,
    color: config.color,
  }
}

export default PAGE_ICONS
