/**
 * Farm Supervisor — Tab Chốt Logbook
 *
 * API:
 *   GET  /cultivation-stages/{id}/summary
 *   GET  /cultivation-stages/{id}/logs
 *   POST /cultivation-logbooks/{id}/submit-completion
 */
import { BookOutlined, CheckCircleOutlined, SaveOutlined, EditOutlined, LockOutlined, SendOutlined } from '@ant-design/icons'
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  Form,
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
import { useEffect, useState } from 'react'
import { formatDate } from 'src/utils/dateFormatters'
import CultivationStageService from 'src/services/CultivationStageService'
import CultivationLogbookService from 'src/services/CultivationLogbookService'

const { Text, Title, Paragraph } = Typography
const { TextArea } = Input

const unwrap = (res) => res?.data?.data ?? res?.data ?? res

const stageStatusConfig = {
  PENDING: { color: 'default', label: 'Chưa bắt đầu' },
  ACTIVE: { color: 'processing', label: 'Đang hoạt động' },
  IN_PROGRESS: { color: 'processing', label: 'Đang thực hiện' },
  COMPLETED: { color: 'success', label: 'Hoàn thành' },
}

const getStageCfg = (s) => stageStatusConfig[s] || stageStatusConfig.PENDING

const StageListItem = ({ stage, index, isActive, onClick }) => {
  const cfg = getStageCfg(stage.status)
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
          <div className="mt-1 flex flex-col">
            <Tag color={cfg.color} style={{ margin: 0, fontSize: 10 }}>{cfg.label}</Tag>
          </div>
        }
      />
    </List.Item>
  )
}

const LogbookFinalizationTab = ({ planId, stages }) => {
  const [selectedId, setSelectedId] = useState(null)
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [summary, setSummary] = useState(null)
  const [stageLogs, setStageLogs] = useState([])

  useEffect(() => {
    if (stages.length > 0 && !selectedId) {
      setSelectedId(stages[0].id)
    }
  }, [stages, selectedId])

  const selectedStage = stages.find((s) => s.id === selectedId)

  useEffect(() => {
    if (!selectedId) return

    const load = async () => {
      setLoadingSummary(true)
      try {
        const [summaryRes, logsRes] = await Promise.all([
          CultivationStageService.getSummary(selectedId),
          CultivationStageService.getStageLogs(selectedId),
        ])
        const summaryData = unwrap(summaryRes)
        const logsData = unwrap(logsRes)
        setSummary(summaryData)
        setStageLogs(Array.isArray(logsData) ? logsData : logsData?.items || [])
        form.setFieldsValue({
          supervisorDescription: summaryData?.description || '',
        })
      } catch (err) {
        console.error(err)
        setSummary(null)
        setStageLogs([])
        form.resetFields()
        message.error('Không tải được tổng hợp giai đoạn.')
      } finally {
        setLoadingSummary(false)
      }
    }

    load()
  }, [selectedId, form])

  const materials = summary?.materials || []
  const images = summary?.images || []

  const materialRows = (Array.isArray(materials) ? materials : []).map((m, idx) => ({
    key: m.id || String(idx),
    name: m.name,
    type: m.type,
    quantity: m.quantity,
    unit: m.unit,
  }))

  const handleSaveStageDescription = async () => {
    try {
      await form.validateFields()
      setSaving(true)
      // Mô tả stage-level: nếu BE hỗ trợ official-logs
      await CultivationStageService.createOfficialLogs(selectedId, {
        description: form.getFieldValue('supervisorDescription'),
      })
      message.success('Đã lưu tổng kết giai đoạn!')
    } catch (error) {
      if (!error?.errorFields) {
        console.error(error)
        message.error(error.message || 'Không thể lưu tổng kết giai đoạn.')
      }
    } finally {
      setSaving(false)
    }
  }

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

  const columns = [
    { title: 'Tên vật tư', dataIndex: 'name', key: 'name', render: (text) => <Text strong>{text}</Text> },
    { title: 'Loại', dataIndex: 'type', key: 'type', render: (text) => <Text type="secondary">{text || '—'}</Text> },
    { title: 'Số lượng đã dùng', dataIndex: 'quantity', key: 'quantity', align: 'right', render: (text) => <Text strong>{text}</Text> },
    { title: 'Đơn vị', dataIndex: 'unit', key: 'unit', align: 'center' },
  ]

  return (
    <Card bordered={false} className="shadow-sm rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-4 flex flex-wrap justify-end gap-2">
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
            Cấu trúc Nhật ký
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
              <p>Chọn một giai đoạn bên trái để xem và chốt nhật ký</p>
            </div>
          ) : loadingSummary ? (
            <div className="py-20 text-center">
              <Spin tip="Đang tải tổng hợp giai đoạn..." />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircleOutlined className="text-green-600 text-xl" />
                <Title level={5} className="!mb-0">
                  Biên tập Nhật ký: {selectedStage.stageName}
                </Title>
              </div>

              <Card size="small" bordered className="rounded-xl shadow-sm border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold flex items-center gap-2">
                    <BookOutlined className="text-gray-500" /> Bảng tổng hợp vật tư (Chế độ xem)
                  </div>
                  <Tag icon={<LockOutlined />} color="default" className="rounded-full">ĐÃ KHÓA</Tag>
                </div>
                {materialRows.length === 0 ? (
                  <Empty description="Chưa có vật tư" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                  <Table
                    columns={columns}
                    dataSource={materialRows}
                    pagination={false}
                    size="small"
                    className="rounded-lg overflow-hidden border border-gray-100"
                  />
                )}
              </Card>

              <Card size="small" bordered className="rounded-xl shadow-sm border-gray-200 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold flex items-center gap-2">
                    <BookOutlined className="text-gray-500" /> Ảnh thực địa giai đoạn (Chỉ đọc)
                  </div>
                  <Tag icon={<LockOutlined />} color="default" className="rounded-full">ĐÃ KHÓA</Tag>
                </div>
                {images.length === 0 ? (
                  <Empty description="Chưa có ảnh" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                ) : (
                  <Image.PreviewGroup>
                    <div className="flex flex-wrap gap-3">
                      {images.map((img) => {
                        const src = img.imageUrl || img.url
                        return (
                        <div key={img.id || src} className="relative group rounded-lg overflow-hidden border border-gray-200">
                          <Image src={src} width={120} height={90} className="object-cover" />
                        </div>
                        )
                      })}
                    </div>
                  </Image.PreviewGroup>
                )}
              </Card>

              <Card size="small" bordered className="rounded-xl shadow-sm border-green-600 mt-4 bg-green-50/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-green-700 flex items-center gap-2">
                    <EditOutlined /> Biên soạn mô tả tổng kết giai đoạn
                  </div>
                </div>
                <Form form={form} layout="vertical">
                  <Form.Item
                    name="supervisorDescription"
                    label={<Text className="text-gray-500 text-xs">Mô tả văn phong chuẩn</Text>}
                    rules={[{ required: true, message: 'Vui lòng nhập mô tả tổng kết' }]}
                    className="mb-2"
                  >
                    <TextArea rows={5} placeholder="Nhập mô tả tổng kết giai đoạn..." className="rounded-lg shadow-inner" />
                  </Form.Item>
                  <div className="flex justify-end gap-3 mt-4">
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={handleSaveStageDescription}
                      loading={saving}
                      className="bg-green-600 rounded-lg px-6 h-9 font-semibold"
                    >
                      Lưu tổng kết giai đoạn
                    </Button>
                  </div>
                </Form>
              </Card>

              <div className="mt-8">
                <div className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">
                  Nhật ký giai đoạn
                </div>
                {stageLogs.length === 0 ? (
                  <Empty description="Chưa có nhật ký" />
                ) : (
                  <List
                    dataSource={stageLogs}
                    renderItem={(log) => (
                      <List.Item className="mb-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                        <List.Item.Meta
                          title={
                            <div className="flex items-center justify-between">
                              <Text strong className="text-gray-800">
                                {log.date ? formatDate(log.date) : log.createdAt ? formatDate(log.createdAt) : '—'}
                              </Text>
                              <Tag color={log.status === 'APPROVED' ? 'success' : 'processing'}>{log.status}</Tag>
                            </div>
                          }
                          description={
                            <div className="mt-2 text-gray-600">
                              <Paragraph ellipsis={{ rows: 3, expandable: true, symbol: 'Xem thêm' }}>
                                {log.description}
                              </Paragraph>
                            </div>
                          }
                        />
                      </List.Item>
                    )}
                  />
                )}
              </div>
            </div>
          )}
        </Col>
      </Row>
    </Card>
  )
}

export default LogbookFinalizationTab
