/**
 * FertilizerDetailModal — Xem chi tiết phân bón (Read-Only)
 * Triggered by: "Xem chi tiết" action in table row
 *
 * Hiển thị đầy đủ các trường theo Figma:
 *   - Thông Tin Cơ Bản: mã, tên, nhà SX, nhà CC, tồn kho tối thiểu, đơn vị, loại PB, mô tả
 *   - Thành Phần: bảng (Tên thành Phần | Hàm Lượng | Đơn Vị Tính)
 *   - Liều Lượng: bảng (Số | Đơn vị Tính | Đơn Vị diện tích | Đối tượng)
 */
import {
  ArrowLeftOutlined,
  BarcodeOutlined,
  CalendarOutlined,
  ExperimentOutlined,
  ShopOutlined,
  TagOutlined,
} from '@ant-design/icons'
import { Badge, Button, Card, Descriptions, Empty, Skeleton, Table, Tag, Typography } from 'antd'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TitleCustom from 'src/components/TitleCustom'
import ROUTER from 'src/router/ROUTER'
import FertilizerService from 'src/services/FertilizerService'
import { formatAreaUnit } from 'src/constants/measurementUnits'
import { formatDateTime } from 'src/utils/dateFormatters'

const { Text } = Typography

// ── Sub-tables column definitions ────────────────────────────────────────────

const componentColumns = [
  {
    title: 'Tên thành Phần',
    dataIndex: 'name',
    key: 'name',
    render: (v) => <Text strong>{v || '—'}</Text>,
  },
  {
    title: 'Hàm Lượng',
    dataIndex: 'value',
    key: 'value',
    align: 'center',
    width: 110,
    render: (v, record) => {
      if (v == null || v === '') return <Text>—</Text>
      
      if (record.unit === 'CFU/g') {
        const val = Number(v)
        if (val > 0) {
          const exponent = Math.floor(Math.log10(val))
          const base = Number((val / Math.pow(10, exponent)).toFixed(2))
          return (
            <Text>
              {base} x 10<sup className="text-[10px] ml-[1px]">{exponent}</sup>
            </Text>
          )
        }
      }
      return <Text>{v}</Text>
    },
  },
  {
    title: 'Đơn vị Tính (%, ppm, CFU/g)',
    dataIndex: 'unit',
    key: 'unit',
    align: 'center',
    width: 190,
    render: (v) => v ? <Tag color="green" className="rounded-full font-medium">{v}</Tag> : '—',
  },
]

const dosageColumns = [
  {
    title: 'Lượng',
    dataIndex: 'amount',
    key: 'amount',
    align: 'center',
    width: 80,
    render: (v) => <Text strong>{v != null && v !== '' ? v : '—'}</Text>,
  },
  {
    title: 'Đơn vị Tính (Kg/Lit)',
    dataIndex: 'unit',
    key: 'unit',
    align: 'center',
    width: 140,
    render: (v) => <Text>{v || 'kg'}</Text>,
  },
  {
    title: 'Đơn Vị diện tích',
    dataIndex: 'areaUnit',
    key: 'areaUnit',
    align: 'center',
    width: 140,
    render: (v) => <Text>{formatAreaUnit(v)}</Text>,
  },
  {
    title: 'Đối tượng',
    dataIndex: 'target',
    key: 'target',
    render: (v) => <Text>{v || '—'}</Text>,
  },
]

// ── Main Component ────────────────────────────────────────────────────────────

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
        if (res?.success === false) {
          navigate(ROUTER.FM_FERTILIZERS)
          return
        }
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
        <Card bordered={false} className="shadow-sm rounded-2xl" bodyStyle={{ padding: '24px' }}>
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
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTER.FM_FERTILIZERS)}>
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
        bodyStyle={{ padding: '24px' }}
      >
        <div className="space-y-6">

          {/* ════════════════════════════════════════════════════════════════
            Header: mã + trạng thái
        ═══════════════════════════════════════════════════════════════════ */}
          <div className="flex items-center justify-end">
            <Badge
              status={isActive ? 'success' : 'error'}
              text={
                <span
                  className={`text-sm font-semibold ${isActive ? 'text-green-600' : 'text-red-500'
                    }`}
                >
                  {isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                </span>
              }
            />
          </div>

          {/* ════════════════════════════════════════════════════════════════
            Section 1 – Thông Tin Cơ Bản
        ═══════════════════════════════════════════════════════════════════ */}
          <div>
            <div
              className="mb-3 px-4 py-2 rounded-lg font-semibold text-green-800"
              style={{ background: '#f0fdf4', borderLeft: '3px solid #16a34a', fontSize: 13 }}
            >
              Thông Tin Cơ Bản
            </div>

            <Descriptions
              column={{ xs: 1, sm: 2 }}
              size="small"
              labelStyle={{
                fontWeight: 600,
                color: '#6b7280',
                fontSize: 12,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
              }}
              contentStyle={{ color: '#1f2937', fontSize: 14 }}
            >
              {/* Tên phân bón – span 2 */}
              <Descriptions.Item
                label={
                  <span className="inline-flex items-center gap-1">
                    <TagOutlined /> Tên phân bón
                  </span>
                }
                span={2}
              >
                <span className="font-semibold">{item.name || '—'}</span>
              </Descriptions.Item>

              {/* Loại Phân Bón */}
              <Descriptions.Item label="Loại Phân Bón" span={2}>
                {(item.type)
                  ? (item.type)
                  : <span className="text-gray-400">—</span>}
              </Descriptions.Item>

              {/* Nhà Sản Xuất */}
              <Descriptions.Item
                label={
                  <span className="inline-flex items-center gap-1">
                    <ShopOutlined /> Nhà Sản Xuất
                  </span>
                }
              >
                {item.manufacturer || <span className="text-gray-400">—</span>}
              </Descriptions.Item>

              {/* Nhà Cung Cấp */}
              <Descriptions.Item label="Nhà Cung Cấp">
                {item.supplier || <span className="text-gray-400">—</span>}
              </Descriptions.Item>

              {/* Tồn kho thực tế */}
              <Descriptions.Item
                label={
                  <span className="inline-flex items-center gap-1">
                    <BarcodeOutlined /> Tồn kho thực tế
                  </span>
                }
              >
                <span className="font-semibold text-blue-600">
                  {item.inventoryQuantity != null
                    ? `${Number(item.inventoryQuantity).toLocaleString('vi-VN')} ${item.inventoryUnit || item.unit || ''}`
                    : '—'}
                </span>
              </Descriptions.Item>

              {/* Tồn Kho tối thiểu */}
              <Descriptions.Item
                label={
                  <span className="inline-flex items-center gap-1">
                    <BarcodeOutlined /> Tồn kho tối thiểu
                  </span>
                }
              >
                <span className="font-semibold text-emerald-600">
                  {item.minimumStock != null
                    ? `${Number(item.minimumStock).toLocaleString('vi-VN')} ${item.unit || ''}`
                    : '—'}
                </span>
              </Descriptions.Item>

              {/* Đơn vị sử dụng */}
              <Descriptions.Item label="Đơn vị sử dụng">
                {item.usageUnit
                  ? <Tag color="blue" className="font-medium rounded-full">{item.usageUnit}</Tag>
                  : <span className="text-gray-400">—</span>}
              </Descriptions.Item>

              {/* Đơn vị tính */}
              {/* <Descriptions.Item label="Đơn vị tính (kg/lit)">
                {item.unit
                  ? <Tag color="blue" className="font-medium rounded-full">{item.unit}</Tag>
                  : <span className="text-gray-400">—</span>}
              </Descriptions.Item> */}



              {/* Ngày tạo */}
              {item.createdAt && (
                <Descriptions.Item
                  label={
                    <span className="inline-flex items-center gap-1">
                      <CalendarOutlined /> Ngày tạo
                    </span>
                  }
                  span={2}
                >
                  {formatDateTime(item.createdAt, 'HH:mm - DD/MM/YYYY')}
                </Descriptions.Item>
              )}
            </Descriptions>

            {/* Mô Tả */}
            {item.description && (
              <div className="mt-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                <p className="mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Mô tả
                </p>
                <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line m-0">
                  {item.description}
                </p>
              </div>
            )}
          </div>

          {/* ════════════════════════════════════════════════════════════════
            Section 2 – Thành Phần
        ═══════════════════════════════════════════════════════════════════ */}
          <div>
            <div
              className="mb-3 px-4 py-2 rounded-lg font-semibold text-green-800"
              style={{ background: '#f0fdf4', borderLeft: '3px solid #16a34a', fontSize: 13 }}
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

          {/* ════════════════════════════════════════════════════════════════
            Section 3 – Liều Lượng
        ═══════════════════════════════════════════════════════════════════ */}
          <div>
            <div
              className="mb-3 px-4 py-2 rounded-lg font-semibold text-green-800"
              style={{ background: '#f0fdf4', borderLeft: '3px solid #16a34a', fontSize: 13 }}
            >
              Liều Lượng
            </div>

            {dosages.length > 0 ? (
              <Table
                rowKey={(_, i) => i}
                dataSource={dosages}
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
