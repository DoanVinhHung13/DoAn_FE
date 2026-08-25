import {
  ArrowLeftOutlined,
  BarcodeOutlined,
  CalendarOutlined,
  ExperimentOutlined,
  ShopOutlined,
  TagOutlined,
} from "@ant-design/icons"
import {
  Badge,
  Button,
  Card,
  Descriptions,
  Empty,
  Skeleton,
  Table,
  Tag,
  Typography,
} from "antd"
import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import TitleCustom from "src/components/TitleCustom"
import ROUTER from "src/router/ROUTER"
import FertilizerService from "src/services/FertilizerService"
import { formatAreaUnit } from "src/constants/measurementUnits"
import { formatDateTime } from "src/utils/dateFormatters"

const { Text } = Typography

const componentColumns = [
  {
    title: "Tên thành phần",
    dataIndex: "name",
    key: "name",
    render: v => <Text strong>{v || "—"}</Text>,
  },
  {
    title: "Hàm lượng",
    dataIndex: "value",
    key: "value",
    align: "center",
    width: 120,
    render: v => <Text>{v != null && v !== "" ? `${v}` : "—"}</Text>,
  },
  {
    title: "Đơn vị tính",
    dataIndex: "unit",
    key: "unit",
    align: "center",
    width: 120,
    render: v => (
      <Tag color="green" className="rounded-full font-medium">
        {v || "%"}
      </Tag>
    ),
  },
]

const dosageColumns = [
  {
    title: "Đối tượng",
    dataIndex: "target",
    key: "target",
    render: v => <Text strong>{v || "—"}</Text>,
  },
  {
    title: "Liều lượng",
    dataIndex: "amount",
    key: "amount",
    align: "center",
    width: 100,
    render: v => <Text>{v != null && v !== "" ? v : "—"}</Text>,
  },
  {
    title: "Đơn vị tính / diện tích",
    key: "unitPerArea",
    align: "center",
    width: 200,
    render: (_, record) => (
      <Text>{`${record.unit || "kg"}/${formatAreaUnit(record.areaUnit)}`}</Text>
    ),
  },
]

const FertilizerDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [initialLoading, setInitialLoading] = useState(true)
  const [item, setItem] = useState(null)

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setInitialLoading(true)
        const res = await FertilizerService.getFertilizerById(id)
        setItem(res?.data)
      } catch {
        navigate(ROUTER.FM_FERTILIZERS)
      } finally {
        setInitialLoading(false)
      }
    }
    if (id) fetchDetail()
  }, [id, navigate])

  if (initialLoading) {
    return (
      <div className="space-y-6">
        <TitleCustom className="!mb-0 flex items-center gap-2">
          <ExperimentOutlined className="text-emerald-600" />
          Chi tiết phân bón
        </TitleCustom>
        <Card
          bordered={false}
          className="shadow-sm rounded-2xl"
          bodyStyle={{ padding: "24px" }}
        >
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      </div>
    )
  }

  if (!item) return null

  const isActive = item.isActive !== false
  const components = item.compositions || item.components || []
  const dosages = item.dosages || []

  return (
    <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTER.FM_FERTILIZERS)}
          >
            Quay lại
          </Button>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <ExperimentOutlined className="text-green-600" />
            Chi tiết phân bón
          </TitleCustom>
        </div>
      </div>

      <Card
        bordered={false}
        className="shadow-sm rounded-2xl"
        bodyStyle={{ padding: "24px" }}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-end">
            <Badge
              status={isActive ? "success" : "error"}
              text={
                <span
                  className={`text-sm font-semibold ${
                    isActive ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {isActive ? "Đang hoạt động" : "Ngừng hoạt động"}
                </span>
              }
            />
          </div>

          <div>
            <div
              className="mb-3 px-4 py-2 rounded-lg font-semibold text-green-800"
              style={{
                background: "#f0fdf4",
                borderLeft: "3px solid #16a34a",
                fontSize: 13,
              }}
            >
              Thông Tin Cơ Bản
            </div>

            <Descriptions
              column={{ xs: 1, sm: 3 }}
              size="small"
              labelStyle={{
                fontWeight: 600,
                color: "#6b7280",
                fontSize: 12,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
              contentStyle={{ color: "#1f2937", fontSize: 14 }}
            >
              <Descriptions.Item
                label={
                  <span className="inline-flex items-center gap-1">
                    Tên phân bón
                  </span>
                }
                span={1}
              >
                <span className="font-semibold">{item.name || "—"}</span>
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <span className="inline-flex items-center gap-1">
                    Nhà Sản Xuất
                  </span>
                }
                span={2}
              >
                {item.manufacturer || <span className="text-gray-400">—</span>}
              </Descriptions.Item>

              <Descriptions.Item label="Loại Phân Bón" span={1}>
                {item.type ? (
                  item.type
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <span className="inline-flex items-center gap-1">
                    Tồn kho thực tế
                  </span>
                }
                span={1}
              >
                <span className="font-semibold text-blue-600">
                  {item.inventoryQuantity != null
                    ? `${Number(item.inventoryQuantity).toLocaleString("vi-VN")} ${item.inventoryUnit || item.unit || ""}`
                    : "—"}
                </span>
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <span className="inline-flex items-center gap-1">
                    Tồn kho tối thiểu
                  </span>
                }
                span={1}
              >
                <span className="font-semibold text-emerald-600">
                  {item.minimumStock != null
                    ? `${Number(item.minimumStock).toLocaleString("vi-VN")} ${item.unit || ""}`
                    : "—"}
                </span>
              </Descriptions.Item>

              {/* Ngày tạo */}
              {item.createdAt && (
                <Descriptions.Item
                  label={
                    <span className="inline-flex items-center gap-1">
                      <CalendarOutlined /> Ngày tạo
                    </span>
                  }
                  span={3}
                >
                  {formatDateTime(item.createdAt, "HH:mm - DD/MM/YYYY")}
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* Mô Tả */}
            {item.description && (
              <div className="mt-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <p className="mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Mô tả
                </p>
                <p className="min-w-0 max-w-full text-sm leading-relaxed text-gray-700 whitespace-pre-line break-words [overflow-wrap:anywhere] m-0">
                  {item.description}
                </p>
              </div>
            )}
          </div>

          <div>
            <div
              className="mb-3 px-4 py-2 rounded-lg font-semibold text-green-800"
              style={{
                background: "#f0fdf4",
                borderLeft: "3px solid #16a34a",
                fontSize: 13,
              }}
            >
              Thành Phần
            </div>

            {components.length > 0 ? (
              <Table
                rowKey={(_, i) => i}
                dataSource={components}
                columns={componentColumns}
                pagination={false}
                size="small"
                bordered
                className="rounded-lg overflow-hidden"
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có thành phần"
                className="py-4"
              />
            )}
          </div>

          <div>
            <div
              className="mb-3 px-4 py-2 rounded-lg font-semibold text-green-800"
              style={{
                background: "#f0fdf4",
                borderLeft: "3px solid #16a34a",
                fontSize: 13,
              }}
            >
              Liều Lượng
            </div>

            {dosages.length > 0 ? (
              <Table
                rowKey={(_, i) => i}
                dataSource={dosages.map(dosage => ({
                  ...dosage,
                  unit: item.unit || dosage.unit,
                }))}
                columns={dosageColumns}
                pagination={false}
                size="small"
                bordered
                className="rounded-lg overflow-hidden"
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có liều lượng"
                className="py-4"
              />
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}

export default FertilizerDetail
