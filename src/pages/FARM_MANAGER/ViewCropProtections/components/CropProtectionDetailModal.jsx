import {
  BarcodeOutlined,
  BugOutlined,
  CalendarOutlined,
  ShopOutlined,
  TagOutlined,
} from '@ant-design/icons'
import { Badge, Descriptions, Empty, Table, Tag, Typography } from 'antd'
import CustomModal from 'src/components/Modal/CustomModal'

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
    dataIndex: 'dilutionRatio',
    key: 'dilutionRatio',
    align: 'center',
    render: (v, record) => (
      <Text>{v ? `${v} ${record.dilutionUnit || ''}` : '—'}</Text>
    ),
  },
  {
    title: 'Liều lượng',
    dataIndex: 'dosage',
    key: 'dosage',
    align: 'center',
    render: (v, record) => (
      <Text>
        {v != null ? `${v} ${record.dosageUnit || ''} / ${record.areaUnit || ''}` : '—'}
      </Text>
    ),
  },
  {
    title: 'Cách ly (Ngày)',
    dataIndex: 'isolationDays',
    key: 'isolationDays',
    align: 'center',
    render: (v) => (v != null ? <Tag color="red">{v} ngày</Tag> : '—'),
  },
]

// ── Main Component ────────────────────────────────────────────────────────────

const CropProtectionDetailModal = ({ open, item, onClose }) => {
  if (!item) return null

  const isActive = item.isActive !== false
  const usages = item.usages || []

  return (
    <CustomModal
      open={open}
      onCancel={onClose}
      title={
        <div className="flex items-center gap-2 py-1">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50">
            <BugOutlined className="text-emerald-600" />
          </div>
          <span className="font-bold">Chi tiết thuốc bảo vệ thực vật</span>
        </div>
      }
      footer={null}
      width={860}
      destroyOnClose
      styles={{ body: { maxHeight: '78vh', overflowY: 'auto', paddingRight: 8 } }}
    >
      <div className="mt-2 space-y-5">
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
              {item.supplierId || <span className="text-gray-400">—</span>}
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <span className="flex items-center gap-1">
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

            <Descriptions.Item label="Đơn vị tính">
              {item.unit ? (
                <Tag color="blue" className="font-medium rounded-full">
                  {item.unit}
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
    </CustomModal>
  )
}

export default CropProtectionDetailModal
