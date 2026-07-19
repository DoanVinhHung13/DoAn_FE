/**
 * Farm Manager: Duyệt nhật ký canh tác
 * Route: /farm-manager/logbooks/:id/review  (ROUTER.FM_LOGBOOK_REVIEW)
 */
import {
  ArrowLeftOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  FileTextOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  PrinterOutlined,
  ReloadOutlined,
  SearchOutlined,
  SendOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Card,
  Collapse,
  Descriptions,
  Divider,
  Empty,
  Image,
  Input,
  message,
  Modal,
  Progress,
  Skeleton,
  Spin,
  Steps,
  Tag,
  Timeline,
  Tooltip,
  Typography,
} from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import TitleCustom from 'src/components/TitleCustom'
import ROUTER from 'src/router/ROUTER'
import CultivationLogbookService from 'src/services/CultivationLogbookService'
import CultivationStageService from 'src/services/CultivationStageService'
import CultivationLogService from 'src/services/CultivationLogService'
import { formatDate } from 'src/utils/dateFormatters'

const { Text, Title, Paragraph } = Typography

const logbookStatusConfig = {
  PENDING_REVIEW: { color: 'gold', label: 'Chờ duyệt' },
  APPROVED: { color: 'success', label: 'Đã duyệt' },
  REJECTED: { color: 'error', label: 'Bị từ chối' },
}

const LogbookReview = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [logbook, setLogbook] = useState(null)
  const [loading, setLoading] = useState(true)
  const [rejectModal, setRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [rejecting, setRejecting] = useState(false)
  const [approving, setApproving] = useState(false)

  useEffect(() => {
    const loadLogbook = async () => {
      setLoading(true)
      try {
        // Trong môi trường dev, dùng mock data
        if (import.meta.env.DEV) {
          const foundLogbook = MOCK_SUBMITTED_LOGBOOKS.find((lb) => lb.id === id) || MOCK_SUBMITTED_LOGBOOKS[0]
          setLogbook(foundLogbook)
        } else {
          const response = await FakeCultivationService.getSubmittedLogbooks()
          const foundLogbook = response?.data?.data?.find((lb) => lb.id === id)
          setLogbook(foundLogbook || null)
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          setLogbook(MOCK_SUBMITTED_LOGBOOKS[0])
          message.info('API chưa có dữ liệu. Đang hiển thị nhật ký mẫu.')
        } else {
          message.error(error.message || 'Không thể tải nhật ký.')
        }
      } finally {
        setLoading(false)
      }
    }
    loadLogbook()
  }, [id])

  const handleApprove = async () => {
    try {
      setApproving(true)
      await FakeCultivationService.approveLogbook(id)
      message.success('Đã duyệt nhật ký thành công! Mã QR truy xuất nguồn gốc đã được tạo.')
      navigate(ROUTER.FM_LOGBOOKS)
    } catch (error) {
      message.error('Duyệt nhật ký thất bại.')
    } finally {
      setApproving(false)
    }
  }

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      message.warning('Vui lòng nhập lý do từ chối.')
      return
    }
    try {
      setRejecting(true)
      await FakeCultivationService.rejectLogbook(id, rejectReason)
      message.success('Đã từ chối nhật ký thành công! Farm Supervisor sẽ nhận được thông báo.')
      navigate(ROUTER.FM_LOGBOOKS)
    } catch (error) {
      message.error('Từ chối nhật ký thất bại.')
    } finally {
      setRejecting(false)
      setRejectModal(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Spin size="large" tip="Đang tải nhật ký..." />
      </div>
    )
  }

  if (!logbook) {
    return (
      <div className="py-16 text-center">
        <Empty description="Không tìm thấy nhật ký." />
        <Button onClick={() => navigate(ROUTER.FM_LOGBOOKS)} className="mt-4">Quay lại</Button>
      </div>
    )
  }

  const statusCfg = logbookStatusConfig[logbook.status] || logbookStatusConfig.PENDING_REVIEW

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button
            type="text" icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTER.FM_LOGBOOKS)}
            className="mb-3 -ml-2 h-9 text-gray-600 hover:text-green-700"
          >
            Quay lại danh sách
          </Button>
          <TitleCustom className="!mb-1">{logbook.planName}</TitleCustom>
          <div className="flex flex-wrap gap-2">
            <Tag color={statusCfg.color} className="rounded-full">{statusCfg.label}</Tag>
            {logbook.isMock && <Tag color="blue" className="rounded-full">Dữ liệu mẫu</Tag>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {logbook.status === 'PENDING_REVIEW' && (
            <>
              <Button
                type="default" icon={<CloseCircleOutlined />}
                onClick={() => setRejectModal(true)}
                className="h-10 px-6 font-semibold rounded-xl"
              >
                Từ chối
              </Button>
              <Button
                type="primary" icon={<CheckCircleOutlined />}
                onClick={handleApprove} loading={approving}
                className="h-10 px-6 font-semibold bg-green-600 rounded-xl"
              >
                Duyệt & Tạo QR
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Overview */}
      <Card bordered={false} className="shadow-sm rounded-2xl">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Title level={5} className="!mb-3 !text-green-700">Thông tin kế hoạch</Title>
            <Descriptions column={{ xs: 1, sm: 2, lg: 3 }} size="small">
              <Descriptions.Item label={<><EnvironmentOutlined className="mr-1" />Vùng trồng</>}>
                {logbook.landPlotName || '—'}
              </Descriptions.Item>
              <Descriptions.Item label={<><BookOutlined className="mr-1" />Cây trồng</>}>
                {logbook.cropName || '—'}
              </Descriptions.Item>
              <Descriptions.Item label={<><UserOutlined className="mr-1" />Giám sát viên</>}>
                {logbook.supervisorName || '—'}
              </Descriptions.Item>
              <Descriptions.Item label={<><CalendarOutlined className="mr-1" />Gửi lên</>}>
                {logbook.submittedAt ? formatDate(logbook.submittedAt) : '—'}
              </Descriptions.Item>
            </Descriptions>
          </div>
          <div className="flex flex-col items-center justify-center border-l border-gray-100 pl-6">
            <div className="mb-2 text-sm font-semibold text-gray-600">Trạng thái</div>
            <div className={`text-2xl font-bold ${statusCfg.color === 'success' ? 'text-green-600' : statusCfg.color === 'error' ? 'text-red-600' : 'text-yellow-600'}`}>
              {statusCfg.label}
            </div>
            <div className="mt-3 text-center text-xs text-gray-500">
              {logbook.revisionHistory?.length || 0} lần chỉnh sửa
            </div>
          </div>
        </div>
      </Card>

      {/* Revision History */}
      {logbook.revisionHistory?.length > 0 && (
        <Card bordered={false} className="shadow-sm rounded-2xl" title="Lịch sử chỉnh sửa">
          <Timeline mode="left">
            {logbook.revisionHistory.map((rev, index) => (
              <Timeline.Item
                key={rev.version}
                label={formatDate(rev.editedAt)}
                color={index === logbook.revisionHistory.length - 1 ? 'green' : 'gray'}
              >
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm">
                  <div className="flex items-center gap-2 mb-1">
                    <UserOutlined className="text-blue-600" />
                    <span className="font-semibold">{rev.editedBy}</span>
                    {index === logbook.revisionHistory.length - 1 && (
                      <Tag color="green" className="rounded-full ml-auto">Bản hiện tại</Tag>
                    )}
                  </div>
                  <div className="text-gray-700">{rev.reason}</div>
                  {rev.changes?.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      {rev.changes.map((change, i) => (
                        <div key={i} className="flex gap-1">
                          <span>• {change.field}:</span>
                          <span className="italic">{change.oldValue || '—'} → {change.newValue || '—'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
      )}

      {/* Stages & Tasks */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Title level={5} className="!mb-0 !text-gray-900">Nhật ký canh tác</Title>
          <Text type="secondary">({logbook.stages?.length || 0} giai đoạn)</Text>
        </div>

        <Collapse bordered={false} className="bg-transparent" defaultActiveKey={logbook.stages?.map((s) => s.id)}>
          {logbook.stages?.map((stage) => {
            const stageTasks = MOCK_SUPERVISOR_STAGES.find((s) => s.id === stage.id)?.taskCount || 0
            const completedTasks = MOCK_SUPERVISOR_STAGES.find((s) => s.id === stage.id)?.completedTaskCount || 0
            const stageProgress = stageTasks > 0 ? Math.round((completedTasks / stageTasks) * 100) : 0

            return (
              <Collapse.Panel
                key={stage.id}
                className="mb-3 rounded-2xl border border-gray-100 shadow-sm overflow-hidden bg-green-50"
                header={
                  <div className="flex flex-wrap items-center justify-between gap-3 py-1">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 flex items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">
                        {logbook.stages.indexOf(stage) + 1}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{stage.stageName}</div>
                        <div className="text-xs text-gray-500">
                          {stage.startDate ? formatDate(stage.startDate) : '?'} — {stage.endDate ? formatDate(stage.endDate) : '?'}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mr-4">
                      <Tag color="green" className="rounded-full m-0">Hoàn thành</Tag>
                      <span className="text-xs text-gray-500 whitespace-nowrap">{completedTasks}/{stageTasks} công việc</span>
                      <Progress percent={stageProgress} size="small" className="!w-24 !m-0" showInfo={false} strokeColor="#16a34a" />
                    </div>
                  </div>
                }
              >
                <div className="space-y-4">
                  {/* Stage Description */}
                  {stage.note && (
                    <div className="rounded-xl bg-amber-50 border border-amber-100 p-3">
                      <div className="text-xs font-semibold text-amber-700 mb-1">📋 Hướng dẫn giai đoạn:</div>
                      <Paragraph className="!mb-0 text-sm text-amber-900">{stage.note}</Paragraph>
                    </div>
                  )}

                  {/* Tasks in Stage */}
                  {MOCK_SUPERVISOR_STAGES.find((s) => s.id === stage.id)?.taskCount > 0 ? (
                    <div className="space-y-3">
                      {Array.from({ length: completedTasks }).map((_, taskIndex) => {
                        const task = FakeCultivationService.getTasksByStage(stage.id).then((res) => res.data.data[taskIndex])
                        return (
                          <Card
                            key={taskIndex}
                            bordered={false}
                            className="shadow-sm rounded-2xl border border-green-100"
                            title={
                              <div className="flex items-center gap-2">
                                <FileTextOutlined className="text-green-600" />
                                <span>Công việc #{taskIndex + 1}</span>
                                <Tag color="success" className="rounded-full ml-auto">Hoàn thành</Tag>
                              </div>
                            }
                          >
                            <div className="space-y-4">
                              {/* Data Sentence */}
                              <div>
                                <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">📊 Số liệu tổng hợp</div>
                                <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 text-sm font-mono text-gray-700">
                                  {task?.leaderSummary ? (
                                    <>
                                      {(task.leaderSummary.totalFertilizers || []).map((f) => (
                                        <div key={f.name}>
                                          Đã bón {f.totalQuantity} {f.quantityUnit} {f.name} cho {f.totalArea} {f.areaUnit}
                                          {f.dailyBreakdown?.length > 0 && (
                                            <span> ({f.dailyBreakdown.map((d) => `${formatDate(d.date)}: ${d.quantity} ${f.quantityUnit}/${d.area} ${f.areaUnit}`).join('; ')})</span>
                                          )}
                                        </div>
                                      ))}
                                      {(task.leaderSummary.totalPesticides || []).map((p) => (
                                        <div key={p.name}>
                                          Đã phun {p.totalQuantity} {p.quantityUnit} {p.name} cho {p.totalArea} {p.areaUnit}
                                          {p.dailyBreakdown?.length > 0 && (
                                            <span> ({p.dailyBreakdown.map((d) => `${formatDate(d.date)}: ${d.quantity} ${p.quantityUnit}/${d.area} ${p.areaUnit}`).join('; ')})</span>
                                          )}
                                        </div>
                                      ))}
                                    </>
                                  ) : 'Không có số liệu phân bón / thuốc BVTV.'}
                                </div>
                              </div>

                              {/* Images */}
                              {task?.leaderSummary?.images?.length > 0 && (
                                <div>
                                  <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">📷 Ảnh đính kèm ({task.leaderSummary.images.length} ảnh)</div>
                                  <Image.PreviewGroup>
                                    <div className="grid grid-cols-3 gap-2">
                                      {task.leaderSummary.images.map((img) => (
                                        <Image key={img.id} src={img.url} className="rounded-lg object-cover aspect-square" />
                                      ))}
                                    </div>
                                  </Image.PreviewGroup>
                                </div>
                              )}

                              {/* Description */}
                              <div>
                                <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">✍️ Mô tả nhật ký</div>
                                <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-sm italic text-blue-900">
                                  "{task?.officialLog?.supervisorDescription || task?.leaderSummary?.descriptionSummary || 'Không có mô tả.'}"
                                </div>
                              </div>
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                  ) : (
                    <Empty description="Không có công việc nào trong giai đoạn này." />
                  )}
                </div>
              </Collapse.Panel>
            )
          })}
        </Collapse>
      </div>

      {/* Reject Modal */}
      <Modal
        open={rejectModal}
        onCancel={() => setRejectModal(false)}
        title={<div className="flex items-center gap-2 text-red-600"><CloseCircleOutlined />Từ chối nhật ký</div>}
        onOk={handleReject}
        okText="Xác nhận từ chối"
        cancelText="Hủy"
        confirmLoading={rejecting}
        okButtonProps={{ className: 'bg-red-600', danger: true }}
      >
        <div className="space-y-4 text-sm">
          <Alert
            message="⚠️ Lưu ý:"
            description="Bạn đang từ chối nhật ký canh tác. Farm Supervisor sẽ nhận được thông báo và phải chỉnh sửa theo yêu cầu của bạn."
            type="warning"
            showIcon
            className="rounded-xl"
          />
          <div>
            <div className="font-semibold mb-2">Lý do từ chối <span className="text-red-500">*</span></div>
            <Input.TextArea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="VD: Thiếu ảnh minh chứng cho giai đoạn X. Mô tả không rõ ràng. Số liệu không khớp với thực tế..."
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default LogbookReview
