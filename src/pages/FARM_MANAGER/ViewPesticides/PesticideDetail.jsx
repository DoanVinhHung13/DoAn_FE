import {
  ArrowLeftOutlined,
  BarcodeOutlined,
  BugOutlined,
  CalendarOutlined,
  ShopOutlined,
  TagOutlined,
} from '@ant-design/icons'
import { Badge, Button, Card, Descriptions, Empty, Skeleton, Table, Tag, Typography } from 'antd'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TitleCustom from 'src/components/TitleCustom'
import ROUTER from 'src/router/ROUTER'
import PesticideService from 'src/services/PesticideService'
import { formatAreaUnit, getQuantityUnit, MEASUREMENT_UNITS } from 'src/constants/measurementUnits'
import { formatDateTime } from 'src/utils/dateFormatters'

const { Text } = Typography

// ── Sub-tables column definitions ────────────────────────────────────────────
const usageColumns = [
  {
    title: 'Cây trồng',
    dataIndex: 'targetCrop',
    key: 'targetCrop',
    render: (v, record) => <Text strong>{v || record.target || '—'}</Text>,
  },
  {
    title: 'Đơn vị tính / diện tích',
    key: 'unitPerArea',
    align: 'center',
    render: (_, record) => {
      const quantityUnit = getQuantityUnit(
        record.productUnit || record.unit || record.dosageUnitId || record.dosageUnit,
        MEASUREMENT_UNITS.LITER,
      );
      const areaUnit = record.areaUnitId || record.areaUnit || MEASUREMENT_UNITS.SQUARE_METER;
      return <Text>{`${quantityUnit}/${formatAreaUnit(areaUnit)}`}</Text>;
    },
  },
  {
    title: 'Đối tượng sử dụng',
    dataIndex: 'targetCrop',
    key: 'targetCrop',
    render: (v) => <Text strong>{v || '—'}</Text>,
  },
  {
    title: 'Đối tượng diệt trừ',
    dataIndex: 'targetPest',
    key: 'targetPest',
    render: (v) => <Text>{v || '—'}</Text>,
  },
  {
    title: 'Lượng nước pha loãng',
    dataIndex: 'concentration',
    key: 'concentration',
    align: 'center',
    render: (v, record) => {
      const chemicalAmount = record.concentration || '';
      const chemicalUnit = record.concentrationUnit || '%';
      const waterAmount = record.dilutionVolume || '';
      const waterUnit = record.dilutionUnit || MEASUREMENT_UNITS.LITER;

      if (!chemicalAmount && !waterAmount) return <Text>—</Text>;

      return <Text>{`${chemicalAmount} ${chemicalUnit} : ${waterAmount} ${waterUnit}`}</Text>;
    },
  },
  {
    title: 'Liều lượng',
    dataIndex: 'dosage',
    key: 'dosage',
    align: 'center',
    render: (v, record) => {
      const dosage = v != null ? v : '';
      const dUnit = getQuantityUnit(record.productUnit || record.unit || record.dosageUnitId || record.dosageUnit, MEASUREMENT_UNITS.LITER);
      const aVal = record.area != null ? record.area : '';

      if (dosage === '' && aVal === '') return <Text>—</Text>;

      return (
        <Text>
          {`${dosage} ${dUnit}`.trim()}
        </Text>
      )
    },
  },
  {
    title: 'Cách ly (Ngày)',
    dataIndex: 'quarantineDays',
    key: 'quarantineDays',
    align: 'center',
    render: (v, record) => {
      const days = v != null ? v : record.isolationDays;
      return days != null ? <Tag color="red">{days} ngày</Tag> : '—';
    },
  },
]

// ── Main Component ────────────────────────────────────────────────────────────

const PesticideDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [initialLoading, setInitialLoading] = useState(true)
  const [item, setItem] = useState(null)

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setInitialLoading(true)
        const res = await PesticideService.getPesticideById(id)
        setItem(res?.data)
      } catch {
        navigate(ROUTER.FM_PESTICIDES)
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
          <BugOutlined className="text-emerald-600" />
          Chi tiết nông dược
        </TitleCustom>
        <Card bordered={false} className="shadow-sm rounded-2xl" bodyStyle={{ padding: '24px' }}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      </div>
    )
  }

  if (!item) return null

  const isActive = item.isActive !== false
  const usages = item.usages || []

  return (
    <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTER.FM_PESTICIDES)}>
            Quay lại
          </Button>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <BugOutlined className="text-emerald-600" />
            Chi tiết nông dược
          </TitleCustom>
        </div>
      </div>

      <Card
        bordered={false}
        className="shadow-sm rounded-2xl"
        bodyStyle={{ padding: '24px' }}
      >
        <div className="space-y-6">

          {/* Header: mã + trạng thái */}
          <div className="flex items-center justify-between">
            <Badge
              status={isActive ? 'success' : 'error'}
              text={
                <span
                  className={`text-sm font-semibold ${isActive ? 'text-green-600' : 'text-red-500'
                    }`}
                >
                  Trạng thái: {isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                </span>
              }
            />
          </div>

          {/* Section 1 – Thông Tin Cơ Bản */}
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
              <Descriptions.Item
                label={
                  <span className="flex items-center gap-1">
                    <TagOutlined /> Tên nông dược
                  </span>
                }
                span={2}
              >
                <span className="font-semibold">{item.name || '—'}</span>
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <span className="flex items-center gap-1">
                    <ShopOutlined /> Nhà Sản Xuất
                  </span>
                }
              >
                {item.manufacturer || <span className="text-gray-400">—</span>}
              </Descriptions.Item>


              {/* Tồn kho thực tế */}
              <Descriptions.Item
                label={
                  <span className="flex items-center gap-1">
                    <BarcodeOutlined /> Tồn kho thực tế
                  </span>
                }
              >
                <span className="font-semibold text-blue-600">
                  {item.inventoryQuantity != null
                    ? `${Number(item.inventoryQuantity).toLocaleString('vi-VN')} ${getQuantityUnit(item.inventoryUnit || item.unit, MEASUREMENT_UNITS.LITER)}`
                    : '—'}
                </span>
              </Descriptions.Item>

              <Descriptions.Item
                label={
                  <span className="flex items-center gap-1">
                    <BarcodeOutlined /> Tồn kho tối thiểu
                  </span>
                }
              >
                <span className="font-semibold text-emerald-600">
                  {item.minInventory != null || item.minimumStock != null
                    ? `${Number(item.minInventory ?? item.minimumStock).toLocaleString('vi-VN')} ${getQuantityUnit(item.unitId || item.unit, MEASUREMENT_UNITS.LITER)}`
                    : '—'}
                </span>
              </Descriptions.Item>

              <Descriptions.Item label="Đơn vị tính">
                {item.unitId || item.unit ? (
                  <Tag color="blue" className="font-medium rounded-full">
                    {getQuantityUnit(item.unitId || item.unit, MEASUREMENT_UNITS.LITER)}
                  </Tag>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </Descriptions.Item>

              {item.createdAt && (
                <Descriptions.Item
                  label={
                    <span className="flex items-center gap-1">
                      <CalendarOutlined /> Ngày tạo
                    </span>
                  }
                  span={2}
                >
                  {formatDateTime(item.createdAt, 'HH:mm - DD/MM/YYYY')}
                </Descriptions.Item>
              )}
            </Descriptions>

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

          {/* Section 2 – Liều Lượng */}
          <div>
            <div
              className="mb-3 px-4 py-2 rounded-lg font-semibold text-green-800"
              style={{ background: '#f0fdf4', borderLeft: '3px solid #16a34a', fontSize: 13 }}
            >
              Liều Lượng
            </div>

            {usages.length > 0 ? (
              <Table
                rowKey={(_, i) => i}
                dataSource={usages.map((usage) => ({ ...usage, productUnit: item.unit || usage.productUnit }))}
                columns={['targetCrop', 'dosage', 'unitPerArea', 'quarantineDays']
                  .map(key => usageColumns.find(column => column.key === key))
                  .filter(Boolean)}
                pagination={false}
                size="small"
                bordered
                className="rounded-lg overflow-hidden"
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Chưa có thông tin liều lượng"
                className="py-4"
              />
            )}
          </div>
        </div>

        {/* ── Footer actions ── */}
        <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-100">
          <Button
            onClick={() => navigate(ROUTER.FM_PESTICIDES)}
            className="h-10 px-6 rounded-xl"
          >
            Quay lại
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default PesticideDetail
