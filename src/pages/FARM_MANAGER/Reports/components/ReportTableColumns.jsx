import React from "react"
import { Typography } from "antd"
import { formatUnitValue } from "./reportUtils"

const { Text } = Typography

export const getHarvestColumns = () => [
  {
    title: "STT",
    width: 70,
    align: "center",
    render: (_, __, index) => index + 1,
  },
  {
    title: "Cây trồng",
    dataIndex: "cropName",
    key: "cropName",
    render: value => <Text strong>{value}</Text>,
  },
  {
    title: "Sản lượng thu hoạch",
    dataIndex: "value",
    key: "value",
    width: 220,
    render: (value, record) => (
      <Text className="font-bold text-green-700">
        {formatUnitValue(value, record.unit)}
      </Text>
    ),
  },
]

export const getAreaColumns = () => [
  {
    title: "STT",
    width: 70,
    align: "center",
    render: (_, __, index) => index + 1,
  },
  {
    title: "Cây trồng",
    dataIndex: "cropName",
    key: "cropName",
    render: value => <Text strong>{value}</Text>,
  },
  {
    title: "Diện tích canh tác",
    dataIndex: "value",
    key: "value",
    width: 220,
    render: (value, record) => (
      <Text className="font-bold text-emerald-700">
        {formatUnitValue(value, record.unit)}
      </Text>
    ),
  },
]

export const getMaterialColumns = () => [
  {
    title: "STT",
    width: 70,
    align: "center",
    render: (_, __, index) => index + 1,
  },
  {
    title: "Tên vật tư",
    dataIndex: "name",
    key: "name",
    render: value => <Text strong>{value}</Text>,
  },
  {
    title: "Tổng sử dụng",
    dataIndex: "totalQuantity",
    key: "totalQuantity",
    width: 180,
    render: (value, record) => (
      <Text className="font-bold text-green-700">
        {formatUnitValue(value, record.unit)}
      </Text>
    ),
  },
]
