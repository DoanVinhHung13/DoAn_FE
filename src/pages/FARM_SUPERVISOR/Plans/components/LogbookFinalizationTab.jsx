/**
 * Farm Supervisor — Tab Chốt Logbook
 *
 * Trái: danh sách Stage
 * Phải: Summary Leader gửi (WAITING_APPROVAL) → expand xem chi tiết → viết lại mô tả → Lưu
 */
import {
  BookOutlined,
  CheckCircleOutlined,
  EditOutlined,
  LockOutlined,
  SaveOutlined,
  SendOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Collapse,
  Empty,
  Image,
  Input,
  List,
  Row,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { formatDate } from 'src/utils/dateFormatters'
import CultivationStageService from 'src/services/CultivationStageService'
import CultivationLogbookService from 'src/services/CultivationLogbookService'
import { useCultivationStatus } from 'src/hooks/useCultivationStatus'
import { canCompileTask } from 'src/utils/cultivationStatus'
import {
  loadLeaderCompileData,
  saveCompiledDescription,
  unwrap,
} from './compileLogHelpers'

const { Text, Title, Paragraph } = Typography
const { TextArea } = Input

const StageListItem = ({ stage, index, isActive, onClick, getStageStatus }) => {
  const cfg = getStageStatus(stage.status)
  return (
    <List.Item
      onClick={onClick}
      className="mb-2 cursor-pointer rounded-xl px-3 py-2 transition-colors"
      style={{
        border: isActive ? '1px solid #22c55e' : '1px solid #e5e7eb',
        background: isActive ? '#f0fdf4' : '#fff',
      }}
    >
      <List.Item.Meta
        avatar={
          <Avatar
            size={32}
            style={{
              backgroundColor: isActive ? '#16a34a' : '#f3f4f6',
              color: isActive ? '#fff' : '#6b7280',
              fontWeight: 700,
            }}
          >
            {index + 1}
          </Avatar>
        }
        title={
          <Text strong style={{ color: isActive ? '#15803d' : '#1f2937', whiteSpace: 'normal', fontSize: 13 }}>
            {stage.stageName}
          </Text>
        }
        description={
          <Tag color={cfg.color} style={{ margin: 0, fontSize: 10, width: 'fit-content' }}>
            {cfg.label}
          </Tag>
        }
      />
    </List.Item>
  )
}

const mapMaterialRows = (items = [], nameFallback) =>
  (Array.isArray(items) ? items : []).map((item, i) => ({
    key: item.id || String(i),
    name: item.name || item.fertilizerName || item.pesticideName || item.materialName || `${nameFallback} ${i + 1}`,
    totalQuantity: item.totalQuantity ?? item.quantity ?? 0,
    unit: item.unit ?? item.quantityUnit ?? '',
    totalArea: item.totalArea ?? item.area ?? 0,
    areaUnit: item.areaUnit ?? 'ha',
    days: item.days ?? '—',
  }))

const fertColumns = [
  {
    title: 'Loại phân bón',
    dataIndex: 'name',
    key: 'name',
    render: (v) => <span className="font-medium text-gray-800">{v}</span>,
  },
  {
    title: 'Tổng lượng',
    key: 'qty',
    align: 'right',
    render: (_, r) => (
      <span className="font-semibold text-blue-700">
        {r.totalQuantity} <span className="font-normal text-gray-500">{r.unit}</span>
      </span>
    ),
  },
  {
    title: 'Diện tích',
    key: 'area',
    align: 'right',
    render: (_, r) =>
      r.totalArea > 0 ? (
        <span>
          {r.totalArea} <span className="text-gray-500">{r.areaUnit}</span>
        </span>
      ) : (
        <span className="text-gray-300">—</span>
      ),
  },
  {
    title: 'Số lần',
    dataIndex: 'days',
    key: 'days',
    align: 'center',
    render: (v) => <Tag className="rounded-full m-0" color="blue">{v}</Tag>,
  },
]

const pestColumns = [
  {
    title: 'Loại thuốc BVTV',
    dataIndex: 'name',
    key: 'name',
    render: (v) => <span className="font-medium text-gray-800">{v}</span>,
  },
  {
    title: 'Tổng lượng',
    key: 'qty',
    align: 'right',
    render: (_, r) => (
      <span className="font-semibold text-purple-700">
        {r.totalQuantity} <span className="font-normal text-gray-500">{r.unit}</span>
      </span>
    ),
  },
  {
    title: 'Diện tích',
    key: 'area',
    align: 'right',
    render: (_, r) =>
      r.totalArea > 0 ? (
        <span>
          {r.totalArea} <span className="text-gray-500">{r.areaUnit}</span>
        </span>
      ) : (
        <span className="text-gray-300">—</span>
      ),
  },
  {
    title: 'Số lần',
    dataIndex: 'days',
    key: 'days',
    align: 'center',
    render: (v) => <Tag className="rounded-full m-0" color="purple">{v}</Tag>,
  },
]

/** Expand: thông tin Summary (ảnh, phân, thuốc, mô tả) + textarea Supervisor */
const SummaryCompilePanel = ({ task, onSaved }) => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [leaderSummary, setLeaderSummary] = useState(null)
  const [officialLogId, setOfficialLogId] = useState(null)
  const [description, setDescription] = useState('')

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const { summary, leaderSubmittedDescription, submittedLogId: logId } = await loadLeaderCompileData(task.id, task.stageId)
        if (cancelled) return
        setLeaderSummary(summary)
        setOfficialLogId(logId)
        setDescription(leaderSubmittedDescription || summary?.description || '')
      } catch (err) {
        console.error(err)
        if (!cancelled) {
          setLeaderSummary(null)
          setOfficialLogId(null)
          setDescription('')
          message.error('Không tải được Summary từ Leader.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [task.id])

  const fertRows = mapMaterialRows(leaderSummary?.fertilizers, 'Phân')
  const pestRows = mapMaterialRows(leaderSummary?.pesticides, 'Thuốc')
  const images = leaderSummary?.images || []

  const handleSave = async () => {
    if (!description?.trim()) {
      message.error('Vui lòng nhập mô tả mới.')
      return
    }
    if (!officialLogId) {
      message.error('Chưa có log từ Summary của Leader để lưu.')
      return
    }
    try {
      setSaving(true)
      await saveCompiledDescription(officialLogId, description.trim())
      message.success('Đã lưu mô tả vào Logbook!')
      onSaved?.()
    } catch (err) {
      console.error(err)
      message.error(err.message || 'Lưu thất bại.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="py-8 text-center">
        <Spin tip="Đang tải Summary..." />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {!officialLogId && (
        <Alert
          message="Chưa có log để lưu"
          description="Leader cần gửi Summary trước."
          type="warning"
          showIcon
          className="rounded-xl"
        />
      )}

      <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Text strong className="text-gray-700">
            Thông tin Summary (Leader gửi)
          </Text>
          <Tag icon={<LockOutlined />} color="default" className="rounded-full">
            Chỉ đọc
          </Tag>
        </div>

        {images.length > 0 && (
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Ảnh ({images.length})
            </div>
            <Image.PreviewGroup>
              <div className="flex flex-wrap gap-2">
                {images.map((img) => (
                  <Image
                    key={img.id || img.imageUrl || img.url}
                    src={img.imageUrl || img.url}
                    width={88}
                    height={88}
                    className="rounded-lg object-cover"
                  />
                ))}
              </div>
            </Image.PreviewGroup>
          </div>
        )}

        <div>
          <div className="mb-2 font-semibold text-blue-800">Phân bón</div>
          <Table
            columns={fertColumns}
            dataSource={fertRows}
            size="small"
            pagination={false}
            locale={{ emptyText: 'Chưa ghi nhận phân bón' }}
            className="rounded-xl overflow-hidden border border-blue-100"
          />
        </div>

        <div>
          <div className="mb-2 font-semibold text-purple-800">Thuốc BVTV</div>
          <Table
            columns={pestColumns}
            dataSource={pestRows}
            size="small"
            pagination={false}
            locale={{ emptyText: 'Chưa ghi nhận thuốc BVTV' }}
            className="rounded-xl overflow-hidden border border-purple-100"
          />
        </div>

        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Mô tả gốc (Leader)
          </div>
          <div className="rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900 whitespace-pre-wrap">
            {leaderSummary?.description || '—'}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-green-200 bg-green-50/30 p-4">
        <div className="mb-3 flex items-center gap-2">
          <EditOutlined className="text-green-600" />
          <Text strong className="text-green-800">
            Viết lại mô tả (Supervisor)
          </Text>
        </div>
        <TextArea
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Nhập mô tả chuẩn để lưu vào Logbook..."
          className="rounded-lg"
          disabled={!officialLogId}
        />
        <div className="mt-4 flex justify-end">
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={saving}
            disabled={!officialLogId}
            onClick={handleSave}
            className="h-9 rounded-lg bg-green-600 px-6 font-semibold"
          >
            Lưu
          </Button>
        </div>
      </div>
    </div>
  )
}

const LogbookFinalizationTab = ({ planId, stages, tasks = {}, loadData }) => {
  const { getStageStatus, getReviewStatus } = useCultivationStatus()
  const [selectedId, setSelectedId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [stageLogs, setStageLogs] = useState([])
  const [activeKeys, setActiveKeys] = useState([])

  useEffect(() => {
    if (stages.length > 0 && !selectedId) {
      setSelectedId(stages[0].id)
    }
  }, [stages, selectedId])

  const selectedStage = stages.find((s) => s.id === selectedId)

  const pendingSummaries = useMemo(() => {
    if (!selectedId) return []
    return (tasks[selectedId] || []).filter((t) => canCompileTask(t.status))
  }, [tasks, selectedId])

  useEffect(() => {
    setActiveKeys([])
  }, [selectedId])

  useEffect(() => {
    if (!selectedId) return
    const load = async () => {
      setLoadingLogs(true)
      try {
        const logsRes = await CultivationStageService.getStageLogs(selectedId)
        const logsData = unwrap(logsRes)
        setStageLogs(Array.isArray(logsData) ? logsData : logsData?.items || [])
      } catch (err) {
        console.error(err)
        setStageLogs([])
      } finally {
        setLoadingLogs(false)
      }
    }
    load()
  }, [selectedId])

  const handleSubmitCompletion = async () => {
    if (!planId) {
      message.error('Thiếu planId để gửi chốt sổ.')
      return
    }
    try {
      setSubmitting(true)
      await CultivationLogbookService.submitCompletion(planId)
      message.success('Đã gửi yêu cầu chốt sổ lên Farm Manager!')
    } catch (error) {
      console.error(error)
      message.error(error.message || 'Gửi chốt sổ thất bại.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaved = async () => {
    setActiveKeys([])
    await loadData?.()
    if (selectedId) {
      try {
        const logsRes = await CultivationStageService.getStageLogs(selectedId)
        const logsData = unwrap(logsRes)
        setStageLogs(Array.isArray(logsData) ? logsData : logsData?.items || [])
      } catch (err) {
        console.error(err)
      }
    }
  }

  return (
    <Card bordered={false} className="shadow-sm rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-4 flex flex-wrap items-center justify-end gap-3">
        <Button
          type="primary"
          icon={<SendOutlined />}
          loading={submitting}
          onClick={handleSubmitCompletion}
          className="bg-green-600 rounded-lg h-9 font-semibold"
        >
          Gửi chốt sổ lên Manager
        </Button>
      </div>

      <Row gutter={[24, 24]} className="min-h-[520px]">
        <Col xs={24} lg={8} xl={6} className="border-b lg:border-b-0 lg:border-r border-gray-100 lg:pr-6 pb-6 lg:pb-0">
          <p className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Giai đoạn
          </p>
          {stages.length === 0 ? (
            <Alert message="Chưa có giai đoạn nào." type="info" />
          ) : (
            <List
              dataSource={stages}
              split={false}
              renderItem={(stage, index) => (
                <StageListItem
                  key={stage.id}
                  stage={stage}
                  index={index}
                  isActive={selectedId === stage.id}
                  getStageStatus={getStageStatus}
                  onClick={() => setSelectedId(stage.id)}
                />
              )}
            />
          )}
        </Col>

        <Col xs={24} lg={16} xl={18}>
          {!selectedStage ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
              <BookOutlined className="text-4xl mb-3 opacity-50" />
              <p>Chọn giai đoạn để xem Summary chờ biên soạn</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <CheckCircleOutlined className="text-green-600 text-xl" />
                <Title level={5} className="!mb-0">
                  {selectedStage.stageName}
                </Title>
              </div>

              <Card
                size="small"
                bordered
                className="rounded-xl shadow-sm border-amber-200"
                title={<span className="font-semibold text-amber-900">Summary chờ biên soạn</span>}
              >
                {pendingSummaries.length === 0 ? (
                  <Empty
                    description="Không có Summary chờ duyệt"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                  />
                ) : (
                  <Collapse
                    accordion
                    destroyOnHidden
                    activeKey={activeKeys}
                    onChange={(keys) => {
                      const next = Array.isArray(keys) ? keys : keys ? [keys] : []
                      setActiveKeys(next)
                    }}
                    className="bg-transparent border-0"
                    items={pendingSummaries.map((task, index) => ({
                      key: task.id,
                      label: (
                        <div className="flex w-full flex-wrap items-center gap-2 pr-2">
                          <Avatar
                            size={24}
                            style={{ backgroundColor: '#fef3c7', color: '#92400e', fontSize: 12, fontWeight: 700 }}
                          >
                            {index + 1}
                          </Avatar>
                          <Text strong>{task.name || task.taskName || 'Summary'}</Text>
                          <Tag color="gold">Chờ biên soạn</Tag>
                        </div>
                      ),
                      children: <SummaryCompilePanel task={task} onSaved={handleSaved} />,
                    }))}
                  />
                )}
              </Card>

              <Card
                size="small"
                bordered
                className="rounded-xl shadow-sm border-green-100 bg-green-50/10"
                title={
                  <span className="font-semibold text-green-800 flex items-center gap-2">
                    <BookOutlined /> Logbook giai đoạn
                    <Tag color="green" className="ml-1">{stageLogs.length}</Tag>
                  </span>
                }
              >
                {loadingLogs ? (
                  <div className="py-8 text-center">
                    <Spin tip="Đang tải Logbook..." />
                  </div>
                ) : stageLogs.length === 0 ? (
                  <Empty description="Chưa có mục trong Logbook" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                  <List
                    dataSource={stageLogs}
                    renderItem={(log, index) => (
                      <List.Item className="mb-3 rounded-xl border border-gray-100 bg-white px-4 py-3">
                        <List.Item.Meta
                          avatar={
                            <Avatar size={28} style={{ backgroundColor: '#16a34a', fontSize: 12, fontWeight: 700 }}>
                              {index + 1}
                            </Avatar>
                          }
                          title={
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <Text strong>
                                {log.taskName || log.workTaskName || log.name || `Mục ${index + 1}`}
                              </Text>
                              <div className="flex items-center gap-2">
                                {(log.date || log.createdAt) && (
                                  <Text type="secondary" className="text-xs">
                                    {formatDate(log.date || log.createdAt)}
                                  </Text>
                                )}
                                <Tag color={getReviewStatus(log.status).color}>
                                  {getReviewStatus(log.status).label}
                                </Tag>
                              </div>
                            </div>
                          }
                          description={
                            <Paragraph ellipsis={{ rows: 3, expandable: true, symbol: 'Xem thêm' }} className="!mb-0 mt-2 text-gray-600">
                              {log.supervisorDescription || log.description || '—'}
                            </Paragraph>
                          }
                        />
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            </div>
          )}
        </Col>
      </Row>
    </Card>
  )
}

export default LogbookFinalizationTab
