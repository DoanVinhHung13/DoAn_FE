/**
 * FertilizerDetailModal — Xem chi tiết phân bón (Read-Only)
 * Triggered by: "Xem chi tiết" action in table row
 */
import {
  BarcodeOutlined,
  CalendarOutlined,
  ContainerOutlined,
  ExperimentOutlined,
  InfoCircleOutlined,
  TagOutlined,
} from '@ant-design/icons'
import { Badge, Descriptions, Divider, Spin, Tag } from 'antd'
import CustomModal from 'src/components/Modal/CustomModal'

const FertilizerDetailModal = ({ open, item, onClose }) => {
  if (!item) return null

  const isActive = item.isActive !== false

  return (
    <CustomModal
      open={open}
      onCancel={onClose}
      title={
        <div className="flex items-center gap-2 py-1">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50">
            <ExperimentOutlined className="text-emerald-600" />
          </div>
          <span className="font-bold">Chi tiết phân bón</span>
        </div>
      }
      footer={null}
      width={680}
      destroyOnClose
    >
      <div className="mt-2">
        {/* Status badge */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="mb-0.5 text-xs font-semibold tracking-wider text-gray-400 uppercase">
              Mã phân bón
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

        <Divider className="my-4" />

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
                <TagOutlined /> Tên phân bón
              </span>
            }
            span={2}
          >
            <span className="font-semibold">{item.name || '—'}</span>
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <ContainerOutlined /> Phân loại
              </span>
            }
          >
            {item.category ? (
              <Tag color="green" className="font-medium rounded-full">
                {item.category}
              </Tag>
            ) : (
              <span className="text-gray-400">—</span>
            )}
          </Descriptions.Item>

          <Descriptions.Item
            label={
              <span className="flex items-center gap-1">
                <BarcodeOutlined /> Đơn vị tính
              </span>
            }
          >
            <Tag color="blue" className="font-medium rounded-full">
              {item.unit || '—'}
            </Tag>
          </Descriptions.Item>

          <Descriptions.Item label="Số lượng tồn kho">
            <span className="font-semibold text-emerald-600">
              {item.minimumStock != null
                ? `${Number(item.minimumStock).toLocaleString('vi-VN')} ${item.unit || ''}`
                : '—'}
            </span>
          </Descriptions.Item>

          <Descriptions.Item label="Nhà sản xuất">
            {item.manufacturer || <span className="text-gray-400">—</span>}
          </Descriptions.Item>

          <Descriptions.Item label="Giá (VNĐ)">
            {item.price != null
              ? `${Number(item.price).toLocaleString('vi-VN')} ₫`
              : <span className="text-gray-400">—</span>}
          </Descriptions.Item>

          {item.createdAt && (
            <Descriptions.Item
              label={
                <span className="flex items-center gap-1">
                  <CalendarOutlined /> Ngày tạo
                </span>
              }
            >
              {new Date(item.createdAt).toLocaleDateString('vi-VN')}
            </Descriptions.Item>
          )}
        </Descriptions>

        {/* Description block */}
        {item.description && (
          <>
            <Divider orientation="left" className="text-xs text-gray-400 my-4">
              <InfoCircleOutlined className="mr-1" />
              Hướng dẫn sử dụng
            </Divider>
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
              <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line m-0">
                {item.description}
              </p>
            </div>
          </>
        )}
      </div>
    </CustomModal>
  )
}

export default FertilizerDetailModal
