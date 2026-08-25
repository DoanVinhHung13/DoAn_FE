import React from "react"
import { Tag, Typography } from "antd"

const { Text } = Typography

export const getPesticideColumns = (currentPage, pageSize) => [
  {
    title: "STT",
    key: "stt",
    width: 80,
    align: "center",
    render: (_, __, index) => (
      <Text className="font-bold text-gray-400">
        {(currentPage - 1) * pageSize + index + 1}
      </Text>
    ),
  },
  {
    title: "Tên",
    dataIndex: "tradeName",
    key: "tradeName",
    width: 200,
    render: text => (
      <Text className="font-bold text-gray-800">{text || "—"}</Text>
    ),
  },
  {
    title: "Loại nông dược",
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
    title: "Mô tả",
    dataIndex: "description",
    key: "description",
    render: text => (
      <Text className="text-gray-600 text-sm">{text || "—"}</Text>
    ),
  },
  {
    title: "Nhà sản xuất",
    dataIndex: "applicant",
    key: "applicant",
    width: 220,
    render: text => (
      <Text className="text-gray-600 text-sm">{text || "—"}</Text>
    ),
  },
]
