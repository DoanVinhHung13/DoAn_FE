import {
  ArrowLeftOutlined,
  BarcodeOutlined,
  BugOutlined,
  CalendarOutlined,
  ShopOutlined,
  TagOutlined,
} from '@ant-design/icons'
import { Badge, Button, Card, Descriptions, Empty, Skeleton, Table, Tag, Typography, message } from 'antd'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TitleCustom from 'src/components/TitleCustom'
import ROUTER from 'src/router/ROUTER'
import CropProtectionService from 'src/services/CropProtectionService'

const { Text } = Typography

// ── Sub-tables column definitions ────────────────────────────────────────────
const usageColumns = [
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
    title: 'Nồng độ pha loãng',
    dataIndex: 'concentration',
    key: 'concentration',
    align: 'center',
    render: (v, record) => {
      const conc = v || record.dilutionRatio;
      if (!conc) return <Text>—</Text>;
      const ratioParts = String(conc).split(':');
      const unitParts = String(record.concentrationUnitId || record.dilutionUnit || '').split(':');
      if (ratioParts.length === 2 && unitParts.length === 2) {
        return <Text>{`${ratioParts[0]} ${unitParts[0]} : ${ratioParts[1]} ${unitParts[1]}`}</Text>;
      }
      return <Text>{`${conc} ${record.concentrationUnitId || record.dilutionUnit || ''}`}</Text>;
    },
  },
  {
    title: 'Liều lượng',
    dataIndex: 'dosage',
    key: 'dosage',
    align: 'center',
    render: (v, record) => {
      const dUnit = record.dosageUnitId || record.dosageUnit || '';
      const aUnit = record.areaUnitId || record.areaUnit || '';
      return (
        <Text>
          {v != null ? `${v} ${dUnit} / ${aUnit}` : '—'}
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

const CropProtectionDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [initialLoading, setInitialLoading] = useState(true)
  const [item, setItem] = useState(null)

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setInitialLoading(true)
        const res = await CropProtectionService.getCropProtectionById(id)
        if (res?.success === false) {
          message.error('Không tìm thấy thuốc BVTV')
          navigate(ROUTER.FM_VIEW_CROP_PROTECTIONS)
          return
        }
        setItem(res?.data)
      } catch (err) {
        message.error('Lấy thông tin thuốc BVTV thất bại')
        navigate(ROUTER.FM_VIEW_CROP_PROTECTIONS)
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
          Chi tiết thuốc bảo vệ thực vật
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
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTER.FM_VIEW_CROP_PROTECTIONS)}>
            Quay lại
          </Button>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <BugOutlined className="text-emerald-600" />
            Chi tiết thuốc bảo vệ thực vật
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
          <div>
            <p className="mb-0.5 text-xs font-semibold tracking-wider text-gray-400 uppercase">
              Mã thuốc BVTV
            </p>
            <span className="text-lg font-bold text-gray-800 font-mono">
              {item.code || '—'}
            </span>
          </div>
          <Badge
            status={isActive ? 'success' : 'error'}
            text={
              <span
                className={`text-sm font-semibold ${
                  isActive ? 'text-green-600' : 'text-red-500'
                }`}
              >
                {isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
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
                  <TagOutlined /> Tên thuốc BVTV
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

            <Descriptions.Item label="Nhà Cung Cấp">
              {item.supplier || item.supplierId || <span className="text-gray-400">—</span>}
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
                  ? `${Number(item.minInventory ?? item.minimumStock).toLocaleString('vi-VN')} ${item.unitId || item.unit || ''}`
                  : '—'}
              </span>
            </Descriptions.Item>

            <Descriptions.Item label="Đơn vị tính">
              {item.unitId || item.unit ? (
                <Tag color="blue" className="font-medium rounded-full">
                  {item.unitId || item.unit}
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
                {new Date(item.createdAt).toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
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

        {/* Section 2 – Cách Sử Dụng */}
        <div>
          <div
            className="mb-3 px-4 py-2 rounded-lg font-semibold text-green-800"
            style={{ background: '#f0fdf4', borderLeft: '3px solid #16a34a', fontSize: 13 }}
          >
            Cách Sử Dụng
          </div>

          {usages.length > 0 ? (
            <Table
              rowKey={(_, i) => i}
              dataSource={usages}
              columns={usageColumns}
              pagination={false}
              size="small"
              bordered
              className="rounded-lg overflow-hidden"
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Chưa có thông tin cách sử dụng"
              className="py-4"
            />
          )}
        </div>
        </div>

        {/* ── Footer actions ── */}
        <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-100">
          <Button
            onClick={() => navigate(ROUTER.FM_VIEW_CROP_PROTECTIONS)}
            className="h-10 px-6 rounded-xl"
          >
            Quay lại
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default CropProtectionDetail
