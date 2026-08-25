import React from "react"
import { Tag, Typography } from "antd"

const { Text } = Typography

export const getFertilizerColumns = (currentPage, pageSize) => [
  {
    title: "STT",
    key: "stt",
    width: 70,
    align: "center",
    render: (_, __, index) => (
      <Text className="font-bold text-gray-400">
        {(currentPage - 1) * pageSize + index + 1}
      </Text>
    ),
  },
  {
    title: "Mã",
    dataIndex: "code",
    key: "code",
    width: 140,
    render: text => (
      <span className="font-mono font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs">
        {text || "—"}
      </span>
    ),
  },
  {
    title: "Tên phân bón",
    dataIndex: "name",
    key: "name",
    width: 220,
    render: text => (
      <Text className="font-bold text-gray-800">{text || "—"}</Text>
    ),
  },
  {
    title: "Loại phân bón",
    dataIndex: "category",
    key: "category",
    width: 160,
    render: text => (
      <Tag className="font-medium rounded border-0 whitespace-normal">
        {text || "—"}
      </Tag>
    ),
  },
  {
    title: "Đơn vị",
    dataIndex: "unit",
    key: "unit",
    width: 100,
    align: "center",
    render: text => (
      <span className="text-xs font-semibold px-2 py-1 bg-gray-100 rounded-full text-gray-600">
        {text || "—"}
      </span>
    ),
  },
  {
    title: "Thành phần",
    dataIndex: "ingredients",
    key: "ingredients",
    render: text => (
      <Text className="text-gray-600 text-sm">{text || "—"}</Text>
    ),
  },
  {
    title: "Công ty / Nhà sản xuất",
    dataIndex: "company",
    key: "company",
    width: 220,
    render: text => (
      <Text className="text-gray-600 text-sm">{text || "—"}</Text>
    ),
  },
]
