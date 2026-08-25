import React from "react"
import { Link } from "react-router-dom"
import { Card, Typography } from "antd"
import {
  BookOpenText,
  ClipboardList,
  MapPinned,
  Package,
  Sprout,
  Users,
} from "lucide-react"

import ROUTER from "src/router/ROUTER"

const { Title, Text } = Typography

const defaultQuickAccessItems = [
  {
    title: "Quản lý người dùng",
    icon: <Users className="h-8 w-8" />,
    path: ROUTER.FM_USERS,
    color: "#6366f1",
  },
  {
    title: "Quản lý vùng trồng",
    icon: <MapPinned className="h-8 w-8" />,
    path: ROUTER.FM_LANDS,
    color: "#22c55e",
  },
  {
    title: "Danh mục cây trồng",
    icon: <Sprout className="h-8 w-8" />,
    path: ROUTER.FM_CROP_CATALOGS,
    color: "#10b981",
  },
  {
    title: "Nhật ký canh tác",
    icon: <ClipboardList className="h-8 w-8" />,
    path: ROUTER.FM_CULTIVATION_LOGBOOKS,
    color: "#f59e0b",
  },
  {
    title: "Thư viện mẫu",
    icon: <BookOpenText className="h-8 w-8" />,
    path: ROUTER.FM_PROCESS_TEMPLATES,
    color: "#06b6d4",
  },
  {
    title: "Quản lý vật tư",
    icon: <Package className="h-8 w-8" />,
    path: ROUTER.FM_FERTILIZERS,
    color: "#ec4899",
  },
]

const QuickNavigation = ({ items = defaultQuickAccessItems }) => {
  return (
    <Card variant="borderless" className="h-full !p-2">
      <div className="mb-10 flex items-center justify-between">
        <Title level={5} className="!mb-0 !text-gray-800">
          Truy cập nhanh
        </Title>
        <Text className="text-xs font-medium text-gray-400">
          Các chức năng quản lý
        </Text>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 md:grid-cols-3 md:gap-x-6 md:gap-y-12">
        {items.map(item => (
          <Link
            key={item.title}
            to={item.path}
            className="group flex cursor-pointer flex-col items-center text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2"
          >
            <div className="dashboard-quick-icon mb-4 flex h-16 w-16 items-center justify-center rounded-2xl shadow-sm transition-[transform,box-shadow] duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
              <span aria-hidden="true">{item.icon}</span>
            </div>
            <span className="text-[13px] font-bold leading-tight text-gray-700 transition-colors group-hover:text-green-600">
              {item.title}
            </span>
          </Link>
        ))}
      </div>
    </Card>
  )
}

export default QuickNavigation
