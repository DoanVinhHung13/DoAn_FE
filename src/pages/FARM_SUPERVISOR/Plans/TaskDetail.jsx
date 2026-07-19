/**
 * Farm Supervisor: Chi tiết Công việc (Work Task)
 * Route: /farm-supervisor/plans/:planId/tasks/:taskId  (ROUTER.FS_TASK_DETAIL)
 *
 * Luồng: Xem task → Gán Farm Leader + Farmers → Active → Xem Summary → Biên soạn nhật ký
 */
import {
  ArrowLeftOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  EditOutlined,
  EyeOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  SaveOutlined,
  SendOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Form,
  Image,
  Input,
  message,
  Modal,
  Progress,
  Row,
  Select,
  Space,
  Spin,
  Steps,
  Tag,
  Timeline,
  Typography,
} from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'

import TitleCustom from 'src/components/TitleCustom'
import ROUTER from 'src/router/ROUTER'
import { formatDate } from 'src/utils/dateFormatters'
import {
  FakeCultivationService,
  getMockDailyLogsByTask,
  getMockTask,
  MOCK_CULTIVATION_TASKS,
  MOCK_FARMERS,
  MOCK_FERTILIZER_OPTIONS,
  MOCK_LEADERS,
  MOCK_PESTICIDE_OPTIONS,
  MOCK_SUPERVISOR_PLAN,
  MOCK_SUPERVISOR_STAGES,
} from '../Logbooks/mockData'

const { Text, Title, Paragraph } = Typography
const { TextArea } = Input

// ── Helpers ──────────────────────────────────────────────────────────────────
const taskStatusConfig = {
  PENDING:   { label: 'Chờ kích hoạt',  color: 'default',    step: 0 },
  ACTIVE:    { label: 'Đang thực hiện', color: 'processing', step: 1 },
  COMPLETED: { label: 'Hoàn thành',     color: 'success',    step: 2 },
}

const buildDataSentence = (summary) => {
  if (!summary) return ''
  const parts = []
  ;(summary.totalFertilizers || []).forEach((f) => {
    const daily = (f.dailyBreakdown || [])
      .map((d) => `${formatDate(d.date)}: ${d.quantity} ${f.quantityUnit}/${d.area} ${f.areaUnit}`)
      .join('; ')
    parts.push(
      `Đã bón ${f.totalQuantity} ${f.quantityUnit} ${f.name} cho ${f.totalArea} ${f.areaUnit}` +
      (daily ? ` (${daily})` : '')
    )
  })
  ;(summary.totalPesticides || []).forEach((p) => {
    const daily = (p.dailyBreakdown || [])
      .map((d) => `${formatDate(d.date)}: ${d.quantity} ${p.quantityUnit}/${d.area} ${p.areaUnit}`)
      .join('; ')
    parts.push(
      `Đã phun ${p.totalQuantity} ${p.quantityUnit} ${p.name} cho ${p.totalArea} ${p.areaUnit}` +
      (daily ? ` (${daily})` : '')
    )
  })
  return parts.join('. ') || 'Không có số liệu phân bón / thuốc BVTV.'
}

// ── Component ─────────────────────────────────────────────────────────────────
const FarmSupervisorTaskDetail = () => {
  const { planId, taskId } = useParams()
  const navigate = useNavigate()
  const [task, setTask] = useState(null)
  const [plan, setPlan] = useState(MOCK_SUPERVISOR_PLAN)
  const [stage, setStage] = useState(null)
  const [dailyLogs, setDailyLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [assignForm] = Form.useForm()
  const [compileForm] = Form.useForm()
  const [savingAssign, setSavingAssign] = useState(false)
  const [activating, setActivating] = useState(false)
  const [compileModal, setCompileModal] = useState(false)
  const [savingCompile, setSavingCompile] = useState(false)

  const leaderOptions = MOCK_LEADERS.map((l) => ({ value: l.id, label: l.name }))
  const farmerOptions = MOCK_FARMERS.map((f) => ({ value: f.id, label: f.name }))

  useEffect(() => {
    const loadTask = async () => {
      setLoading(true)
      try {
        const foundTask = getMockTask(taskId)
        if (foundTask) {
          setTask({ ...foundTask })
          setDailyLogs(getMockDailyLogsByTask(taskId))
          const foundStage = MOCK_SUPERVISOR_STAGES.find((s) => s.id === foundTask.stageId)
          setStage(foundStage || null)
          // Pre-fill assign form
          if (foundTask.farmLeaderId) {
            assignForm.setFieldsValue({
              farmLeaderId: foundTask.farmLeaderId,
              farmerIds: foundTask.farmerIds || [],
            })
          }
          // Pre-fill compile form if summary exists
          if (foundTask.leaderSummary) {
            compileForm.setFieldsValue({
              supervisorDescription: foundTask.leaderSummary.descriptionSummary || '',
            })
          }
        } else {
          message.error('Không tìm thấy công việc.')
          navigate(ROUTER.FS_PLAN_DETAIL.replace(':planId', planId))
        }
      } finally {
        setLoading(false)
      }
    }
    loadTask()
  }, [taskId, planId, navigate, assignForm, compileForm])

  const handleAssignTeam = async () => {
    try {
      const values = await assignForm.validateFields()
      setSavingAssign(true)
      const leader = MOCK_LEADERS.find((l) => l.id === values.farmLeaderId)
      const farmers = MOCK_FARMERS.filter((f) => (values.farmerIds || []).includes(f.id))
      await FakeCultivationService.assignTeam(taskId, {
        farmLeaderId: values.farmLeaderId,
        farmLeaderName: leader?.name || '',
        farmerIds: values.farmerIds || [],
        farmerNames: farmers.map((f) => f.name),
      })
      setTask((prev) => ({
        ...prev,
        farmLeaderId: values.farmLeaderId,
        farmLeaderName: leader?.name || '',
        farmerIds: values.farmerIds || [],
        farmerNames: farmers.map((f) => f.name),
      }))
      message.success('Đã cập nhật phân công team!')
    } catch { /* validation */ } finally {
      setSavingAssign(false)
    }
  }

  const handleActivate = async () => {
    if (!task?.farmLeaderId) {
      message.warning('Vui lòng gán Farm Leader trước khi kích hoạt công việc.')
      return
    }
    try {
      setActivating(true)
      await FakeCultivationService.activateTask(taskId)
      setTask((prev) => ({ ...prev, status: 'ACTIVE' }))
      message.success('Công việc đã được kích hoạt! Farm Leader có thể bắt đầu ghi nhật ký.')
    } catch { message.error('Kích hoạt thất bại.') } finally {
      setActivating(false)
    }
  }

  const handleCompile = async () => {
    try {
      const values = await compileForm.validateFields()
      setSavingCompile(true)
      const dataSentence = buildDataSentence(task.leaderSummary)
      const officialLog = {
        dataSentence,
        supervisorDescription: values.supervisorDescription,
        images: task.leaderSummary?.images || [],
        compiledAt: dayjs().format('YYYY-MM-DD'),
      }
      await FakeCultivationService.compileOfficialLog(taskId, officialLog)
      setTask((prev) => ({ ...prev, officialLog }))
      message.success('Đã lưu nhật ký chính thức!')
      setCompileModal(false)
    } catch { /* validation */ } finally {
      setSavingCompile(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-96"><Spin size="large" /></div>
  }

  if (!task) return null

  const cfg = taskStatusConfig[task.status] || taskStatusConfig.PENDING
  const dataSentence = buildDataSentence(task.leaderSummary)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <Button type="text" icon={<ArrowLeftOutlined />}
          onClick={() => navigate(ROUTER.FS_PLAN_DETAIL.replace(':planId', planId))}
          className="mb-3 -ml-2 h-9 text-gray-600 hover:text-green-700"
        >
          Quay lại kế hoạch
        </Button>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <Tag color="default" className="rounded-full">{stage?.stageName || 'Giai đoạn'}</Tag>
              <Tag color={cfg.color} className="rounded-full">{cfg.label}</Tag>
            </div>
            <TitleCustom className="!mb-0">{task.name}</TitleCustom>
          </div>
          <Progress type="circle" percent={task.progress} size={72}
            strokeColor={task.status === 'COMPLETED' ? '#16a34a' : '#3b82f6'}
          />
        </div>
        {task.description && (
          <div className="mt-3 rounded-xl bg-amber-50 border border-amber-100 p-3 text-sm text-amber-900">
            📋 <strong>Mô tả/Hướng dẫn:</strong> {task.description}
          </div>
        )}
      </div>

      {/* Steps */}
      <Card bordered={false} className="shadow-sm rounded-2xl">
        <Steps current={cfg.step} size="small"
          items={[
            { title: 'Gán Team', description: 'Phân công Leader & Farmer' },
            { title: 'Kích hoạt', description: 'Cho phép Leader ghi nhật ký' },
            { title: 'Hoàn thành', description: 'Nhận Summary từ Leader' },
          ]}
        />
      </Card>

      <Row gutter={[24, 24]}>
        {/* Cột trái: Gán Team + Active */}
        <Col xs={24} lg={10}>
          <div className="space-y-5">
            {/* Assign Team Card */}
            <Card
              bordered={false}
              className="shadow-sm rounded-2xl"
              title={<div className="flex items-center gap-2"><TeamOutlined className="text-green-600" />Phân công nhóm thực hiện</div>}
            >
              <Form form={assignForm} layout="vertical">
                <Form.Item
                  name="farmLeaderId" label="Farm Leader phụ trách"
                  rules={[{ required: true, message: 'Chọn Farm Leader' }]}
                  tooltip="Farm Leader chịu trách nhiệm ghi nhật ký và báo cáo."
                >
                  <Select
                    options={leaderOptions}
                    placeholder="Chọn Farm Leader..."
                    showSearch
                    filterOption={(input, option) =>
                      String(option?.label || '').toLowerCase().includes(input.toLowerCase())
                    }
                    className="w-full"
                  />
                </Form.Item>
                <Form.Item name="farmerIds" label="Danh sách Farmer hỗ trợ">
                  <Select
                    mode="multiple"
                    options={farmerOptions}
                    placeholder="Chọn các Farmer..."
                    showSearch
                    filterOption={(input, option) =>
                      String(option?.label || '').toLowerCase().includes(input.toLowerCase())
                    }
                    className="w-full"
                  />
                </Form.Item>
                <Button
                  type="primary" icon={<SaveOutlined />}
                  onClick={handleAssignTeam} loading={savingAssign}
                  className="w-full h-10 rounded-xl bg-green-600 font-semibold"
                >
                  Lưu phân công
                </Button>
              </Form>
            </Card>

            {/* Activate Card */}
            <Card
              bordered={false}
              className="shadow-sm rounded-2xl"
              title={<div className="flex items-center gap-2"><PlayCircleOutlined className="text-blue-600" />Kích hoạt công việc</div>}
            >
              {task.status === 'PENDING' ? (
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    Sau khi kích hoạt, Farm Leader có thể bắt đầu ghi nhật ký hàng ngày cho công việc này.
                  </div>
                  {!task.farmLeaderId && (
                    <Alert type="warning" showIcon message="Cần gán Farm Leader trước khi kích hoạt." className="rounded-xl" />
                  )}
                  <Button
                    type="primary" icon={<PlayCircleOutlined />}
                    onClick={handleActivate} loading={activating}
                    disabled={!task.farmLeaderId}
                    className="w-full h-10 rounded-xl bg-blue-600 font-semibold"
                  >
                    Kích hoạt công việc
                  </Button>
                </div>
              ) : (
                <div className={`rounded-xl p-4 text-center ${task.status === 'COMPLETED' ? 'bg-green-50' : 'bg-blue-50'}`}>
                  <CheckCircleOutlined className={`text-2xl mb-2 ${task.status === 'COMPLETED' ? 'text-green-600' : 'text-blue-600'}`} />
                  <div className={`font-semibold ${task.status === 'COMPLETED' ? 'text-green-700' : 'text-blue-700'}`}>
                    {task.status === 'COMPLETED' ? 'Công việc đã hoàn thành!' : 'Đang thực hiện...'}
                  </div>
                  {task.startDate && (
                    <div className="text-xs text-gray-500 mt-1">
                      Bắt đầu: {formatDate(task.startDate)}
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        </Col>

        {/* Cột phải: Summary + Biên soạn */}
        <Col xs={24} lg={14}>
          <div className="space-y-5">
            {/* Current Team */}
            {(task.farmLeaderName || task.farmerNames?.length > 0) && (
              <Card bordered={false} className="shadow-sm rounded-2xl"
                title={<div className="flex items-center gap-2"><UserOutlined className="text-green-600" />Nhóm thực hiện hiện tại</div>}
              >
                <div className="space-y-2">
                  {task.farmLeaderName && (
                    <div className="flex items-center gap-2">
                      <Tag color="green" className="rounded-full"><UserOutlined /> Farm Leader</Tag>
                      <span className="font-semibold">{task.farmLeaderName}</span>
                    </div>
                  )}
                  {task.farmerNames?.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <Tag color="blue" className="rounded-full"><TeamOutlined /> Farmers</Tag>
                      {task.farmerNames.map((name) => (
                        <Tag key={name} className="rounded-full">{name}</Tag>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Leader Summary */}
            {task.leaderSummary ? (
              <Card bordered={false} className="shadow-sm rounded-2xl border border-green-100"
                title={
                  <div className="flex items-center gap-2">
                    <FileTextOutlined className="text-green-600" />
                    Báo cáo hoàn thành từ Farm Leader
                    <Tag color="success" className="rounded-full ml-auto">Nhận {formatDate(task.leaderSummary.completedAt)}</Tag>
                  </div>
                }
              >
                <div className="space-y-4">
                  {/* Data sentence */}
                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">📊 Số liệu tổng hợp (Không thể sửa)</div>
                    <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 text-sm font-mono text-gray-700">
                      {dataSentence || 'Không có số liệu phân bón / thuốc BVTV.'}
                    </div>
                  </div>

                  {/* Fertilizers breakdown */}
                  {task.leaderSummary.totalFertilizers?.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-gray-500 mb-2">🌱 Chi tiết Phân bón</div>
                      {task.leaderSummary.totalFertilizers.map((f) => (
                        <div key={f.name} className="mb-2 rounded-lg bg-green-50 p-2 text-sm">
                          <span className="font-semibold">{f.name}</span> — Tổng: {f.totalQuantity} {f.quantityUnit} / {f.totalArea} {f.areaUnit}
                          <div className="mt-1 text-xs text-gray-500">
                            {f.dailyBreakdown?.map((d) => `${formatDate(d.date)}: ${d.quantity} ${f.quantityUnit}/${d.area} ${f.areaUnit}`).join(' · ')}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pesticides breakdown */}
                  {task.leaderSummary.totalPesticides?.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-gray-500 mb-2">🔬 Chi tiết Thuốc BVTV</div>
                      {task.leaderSummary.totalPesticides.map((p) => (
                        <div key={p.name} className="mb-2 rounded-lg bg-orange-50 p-2 text-sm">
                          <span className="font-semibold">{p.name}</span> — Tổng: {p.totalQuantity} {p.quantityUnit} / {p.totalArea} {p.areaUnit}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Images */}
                  {task.leaderSummary.images?.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-gray-500 mb-2">📷 Ảnh đính kèm ({task.leaderSummary.images.length} ảnh)</div>
                      <Image.PreviewGroup>
                        <div className="grid grid-cols-3 gap-2">
                          {task.leaderSummary.images.map((img) => (
                            <Image key={img.id} src={img.url} className="rounded-lg object-cover aspect-square" />
                          ))}
                        </div>
                      </Image.PreviewGroup>
                    </div>
                  )}

                  {/* Leader description */}
                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-2">✍️ Mô tả tổng kết của Farm Leader</div>
                    <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-sm italic text-blue-900">
                      "{task.leaderSummary.descriptionSummary}"
                    </div>
                  </div>

                  {/* Compile button */}
                  {!task.officialLog ? (
                    <Button
                      type="primary" icon={<EditOutlined />}
                      onClick={() => {
                        compileForm.setFieldsValue({ supervisorDescription: task.leaderSummary.descriptionSummary || '' })
                        setCompileModal(true)
                      }}
                      className="w-full h-10 rounded-xl bg-green-600 font-semibold"
                    >
                      Biên soạn nhật ký chính thức
                    </Button>
                  ) : (
                    <div className="rounded-xl bg-green-50 border border-green-200 p-4">
                      <div className="flex items-center gap-2 mb-3 text-green-700 font-semibold">
                        <CheckCircleOutlined />
                        Nhật ký chính thức đã lưu ({formatDate(task.officialLog.compiledAt)})
                      </div>
                      <div className="text-sm text-gray-700 font-mono bg-white rounded-lg p-2 mb-2">
                        {task.officialLog.dataSentence}
                      </div>
                      <div className="text-sm italic text-gray-600">
                        {task.officialLog.supervisorDescription}
                      </div>
                      <Button
                        type="text" size="small" icon={<EditOutlined />}
                        onClick={() => {
                          compileForm.setFieldsValue({ supervisorDescription: task.officialLog.supervisorDescription })
                          setCompileModal(true)
                        }}
                        className="mt-2 text-green-600"
                      >
                        Sửa lại
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ) : task.status === 'ACTIVE' ? (
              <Card bordered={false} className="shadow-sm rounded-2xl border border-blue-100">
                <div className="text-center py-6 text-blue-600">
                  <CheckCircleOutlined className="text-3xl mb-3" />
                  <div className="font-semibold text-lg">Đang chờ Farm Leader báo cáo</div>
                  <Progress percent={task.progress} className="mt-4 mx-auto max-w-xs" strokeColor="#3b82f6" />
                  <div className="text-sm text-gray-500 mt-2">Tiến độ hiện tại: {task.progress}%</div>
                </div>
              </Card>
            ) : task.status === 'PENDING' ? (
              <Card bordered={false} className="shadow-sm rounded-2xl border border-gray-100">
                <div className="text-center py-8 text-gray-400">
                  <CalendarOutlined className="text-3xl mb-3" />
                  <div>Kích hoạt công việc để Farm Leader bắt đầu ghi nhật ký.</div>
                </div>
              </Card>
            ) : null}

            {/* Daily Logs Timeline */}
            {dailyLogs.length > 0 && (
              <Card bordered={false} className="shadow-sm rounded-2xl"
                title={<div className="flex items-center gap-2"><BookOutlined className="text-green-600" />Nhật ký hàng ngày từ Farm Leader</div>}
              >
                <Timeline mode="left">
                  {dailyLogs.map((log) => (
                    <Timeline.Item key={log.id} label={formatDate(log.date)}
                      color={log.progress >= 100 ? 'green' : log.progress > 50 ? 'blue' : 'gray'}
                    >
                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm">
                        <div className="flex items-center justify-between mb-2">
                          <Tag color="blue" className="rounded-full">Tiến độ: {log.progress}%</Tag>
                          {log.fertilizers?.length > 0 && <Tag color="green" className="rounded-full">Phân bón</Tag>}
                          {log.pesticides?.length > 0 && <Tag color="orange" className="rounded-full">TBVTV</Tag>}
                        </div>
                        {log.fertilizers?.length > 0 && (
                          <div className="text-xs text-gray-600 mb-1">
                            🌱 {log.fertilizers.map((f) => `${f.quantity} ${f.quantityUnit} ${f.name}/${f.area} ${f.areaUnit}`).join(', ')}
                          </div>
                        )}
                        {log.pesticides?.length > 0 && (
                          <div className="text-xs text-gray-600 mb-1">
                            🔬 {log.pesticides.map((p) => `${p.quantity} ${p.quantityUnit} ${p.name}/${p.area} ${p.areaUnit}`).join(', ')}
                          </div>
                        )}
                        <div className="text-gray-700">{log.description}</div>
                        {log.images?.length > 0 && (
                          <Image.PreviewGroup>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {log.images.map((img) => (
                                <Image key={img.id} src={img.url} width={60} height={60} className="rounded-lg object-cover" />
                              ))}
                            </div>
                          </Image.PreviewGroup>
                        )}
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </Card>
            )}
          </div>
        </Col>
      </Row>

      {/* Modal: Biên soạn nhật ký chính thức */}
      <Modal
        open={compileModal}
        onCancel={() => setCompileModal(false)}
        title={<div className="flex items-center gap-2"><EditOutlined className="text-green-600" />Biên soạn nhật ký chính thức</div>}
        onOk={handleCompile}
        okText="Lưu nhật ký chính thức"
        cancelText="Hủy"
        confirmLoading={savingCompile}
        okButtonProps={{ className: 'bg-green-600' }}
        width={720}
      >
        <Form form={compileForm} layout="vertical" className="space-y-4">
          <div>
            <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
              📊 Phần số liệu (KHÔNG ĐƯỢC SỬA — hệ thống tự ghép)
            </div>
            <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm font-mono text-gray-700 select-none">
              {dataSentence || 'Không có số liệu phân bón / thuốc BVTV.'}
            </div>
          </div>

          {task.leaderSummary?.images?.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                📷 Ảnh đính kèm (KHÔNG ĐƯỢC XÓA — {task.leaderSummary.images.length} ảnh)
              </div>
              <Image.PreviewGroup>
                <div className="flex flex-wrap gap-2">
                  {task.leaderSummary.images.map((img) => (
                    <Image key={img.id} src={img.url} width={80} height={80} className="rounded-lg object-cover" />
                  ))}
                </div>
              </Image.PreviewGroup>
            </div>
          )}

          <Form.Item
            name="supervisorDescription" label="Mô tả (Farm Supervisor biên tập)"
            rules={[{ required: true, message: 'Nhập mô tả nhật ký' }]}
            extra="Viết lại theo văn phong chuẩn nhật ký canh tác. Không được sửa số liệu ở phần trên."
          >
            <TextArea rows={5}
              placeholder="VD: Công tác bón phân đón đòng được thực hiện theo đúng quy trình kỹ thuật..."
            />
          </Form.Item>

          <div>
            <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">📋 Preview nhật ký cuối</div>
            <Form.Item noStyle dependencies={['supervisorDescription']}>
              {({ getFieldValue }) => (
                <div className="rounded-xl bg-green-50 border border-green-100 p-4 text-sm text-green-900">
                  <span className="font-mono">{dataSentence}</span>
                  {getFieldValue('supervisorDescription') && (
                    <span> — {getFieldValue('supervisorDescription')}</span>
                  )}
                </div>
              )}
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default FarmSupervisorTaskDetail
