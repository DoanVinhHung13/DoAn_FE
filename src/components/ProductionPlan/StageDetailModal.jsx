/**
 * StageDetailModal - Modal hiển thị chi tiết giai đoạn
 * Hiển thị thông tin Supervisor đã ghi nhận cho từng giai đoạn
 */
import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EditOutlined,
  FileTextOutlined,
  PictureOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Badge, Button, Card, Descriptions, Empty, Image, Modal, Tag, Timeline, Typography } from 'antd'
import { useState } from 'react'

const { Text, Paragraph } = Typography

// ── Section Title ──────────────────────────────────────────────────────────
const SectionTitle = ({ icon, children }) => (
  <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-green-50 rounded-lg border-l-3 border-green-500">
    {icon}
    <span className="font-semibold text-green-800 text-sm">{children}</span>
  </div>
)

// ── Main Component ─────────────────────────────────────────────────────────
const StageDetailModal = ({ open, onClose, stage }) => {
  if (!stage) return null

  const statusConfig = {
    done: {
      label: 'Hoàn thành',
      color: 'success',
      icon: <CheckCircleOutlined className="text-green-500" />
    },
    inProgress: {
      label: 'Đang thực hiện',
      color: 'processing',
      icon: <ClockCircleOutlined className="text-blue-500" />
    },
    notStarted: {
      label: 'Chưa bắt đầu',
      color: 'default',
      icon: <ClockCircleOutlined className="text-gray-400" />
    },
  }

  const status = stage.status || 'notStarted'
  const config = statusConfig[status] || statusConfig.notStarted

  // Mock data - Thông tin Supervisor ghi nhận
  const supervisorLogs = stage.supervisorLogs || []
  const stagePhotos = stage.photos || []
  const issues = stage.issues || []

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={900}
      footer={null}
      title={
        <div className="flex items-center justify-between pr-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600 font-bold">
              {stage.order}
            </div>
            <div>
              <div className="text-base font-bold text-gray-800">
                Giai đoạn {stage.order}: {stage.title}
              </div>
              <div className="text-xs text-gray-500 font-normal mt-0.5">
                {stage.dateFrom && stage.dateTo
                  ? `${stage.dateFrom} - ${stage.dateTo}`
                  : 'Chưa xác định thời gian'
                }
              </div>
            </div>
          </div>
          <Badge status={config.color} text={config.label} />
        </div>
      }
      className="stage-detail-modal"
    >
      <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2">

        {/* ── Thông tin giai đoạn ── */}
        <SectionTitle icon={<FileTextOutlined />}>
          Thông tin giai đoạn
        </SectionTitle>

        <Card size="small" className="bg-gray-50 border-gray-200">
          <Descriptions column={2} size="small">
            <Descriptions.Item label="Ngày bắt đầu" span={1}>
              <Text strong>{stage.dateFrom || '—'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày kết thúc" span={1}>
              <Text strong>{stage.dateTo || '—'}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Mô tả công việc" span={2}>
              <Paragraph className="mb-0 text-sm text-gray-700 whitespace-pre-line">
                {stage.description || 'Chưa có mô tả'}
              </Paragraph>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* ── Hình ảnh thực tế ── */}
        {stagePhotos.length > 0 && (
          <>
            <SectionTitle icon={<PictureOutlined />}>
              Hình ảnh thực tế ({stagePhotos.length})
            </SectionTitle>
            <div className="grid grid-cols-3 gap-3">
              <Image.PreviewGroup>
                {stagePhotos.map((photo, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={photo.url}
                      alt={photo.caption || `Ảnh ${index + 1}`}
                      className="rounded-lg object-cover w-full h-32"
                    />
                    {photo.caption && (
                      <div className="mt-1 text-xs text-gray-500 text-center">
                        {photo.caption}
                      </div>
                    )}
                    {photo.uploadedAt && (
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">
                        {photo.uploadedAt}
                      </div>
                    )}
                  </div>
                ))}
              </Image.PreviewGroup>
            </div>
          </>
        )}

        {/* ── Lịch sử thực hiện ── */}
        <SectionTitle icon={<ClockCircleOutlined />}>
          Lịch sử thực hiện
        </SectionTitle>

        {supervisorLogs.length > 0 ? (
          <Timeline
            className="mt-4"
            items={supervisorLogs.map((log) => ({
              color: log.type === 'success' ? 'green' : log.type === 'warning' ? 'orange' : 'blue',
              children: (
                <div className="pb-2">
                  <div className="flex items-center justify-between mb-1">
                    <Text strong className="text-sm">{log.title}</Text>
                    <Text type="secondary" className="text-xs">{log.date}</Text>
                  </div>
                  <Paragraph className="mb-1 text-sm text-gray-600">
                    {log.description}
                  </Paragraph>
                  {log.supervisor && (
                    <div className="flex items-center gap-2 mt-2">
                      <UserOutlined className="text-gray-400 text-xs" />
                      <Text type="secondary" className="text-xs">
                        Ghi nhận bởi: {log.supervisor}
                      </Text>
                    </div>
                  )}
                  {log.images && log.images.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {log.images.map((img, idx) => (
                        <img
                          key={idx}
                          src={img}
                          alt=""
                          className="w-16 h-16 rounded object-cover cursor-pointer hover:opacity-80"
                        />
                      ))}
                    </div>
                  )}
                </div>
              ),
            }))}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chưa có lịch sử thực hiện"
            className="py-6"
          />
        )}

        {/* ── Vấn đề cần chú ý ── */}
        {issues.length > 0 && (
          <>
            <SectionTitle icon={<EditOutlined />}>
              Vấn đề cần chú ý ({issues.length})
            </SectionTitle>
            <div className="space-y-2">
              {issues.map((issue, index) => (
                <Card
                  key={index}
                  size="small"
                  className="border-l-4 border-orange-400 bg-orange-50/50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <Text strong className="text-sm">{issue.title}</Text>
                      <Paragraph className="mb-1 mt-1 text-xs text-gray-600">
                        {issue.description}
                      </Paragraph>
                      {issue.resolvedAt ? (
                        <Tag color="success" className="text-xs">
                          Đã xử lý: {issue.resolvedAt}
                        </Tag>
                      ) : (
                        <Tag color="warning" className="text-xs">
                          Đang theo dõi
                        </Tag>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* ── Footer Actions ── */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button onClick={onClose}>
            Đóng
          </Button>
          {status === 'inProgress' && (
            <Button type="primary" icon={<EditOutlined />} className="bg-green-600">
              Cập nhật tiến độ
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}

export default StageDetailModal
