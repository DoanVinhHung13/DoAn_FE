/**
 * Farm Supervisor: Chi tiết Kế hoạch - Quản lý Giai đoạn & Công việc
 * Route: /farm-supervisor/plans/:planId  (ROUTER.FS_PLAN_DETAIL)
 *
 * Luồng:
 * - Xem danh sách giai đoạn
 * - Thêm Work Task cho giai đoạn chưa hoàn thành
 * - Xem chi tiết Work Task
 * - Gửi Logbook lên Manager khi tất cả giai đoạn hoàn thành
 */
import {
  ArrowLeftOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  SendOutlined,
  TeamOutlined,
  UserOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import {
  Alert,
  Badge,
  Button,
  Card,
  Collapse,
  Descriptions,
  Empty,
  Form,
  Input,
  message,
  Modal,
  Progress,
  Row,
  Spin,
  Tag,
  Timeline,
  Tooltip,
  Typography,
} from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/vi'

import TitleCustom from 'src/components/TitleCustom'
import ROUTER from 'src/router/ROUTER'
import ProductionPlanService from 'src/services/ProductionPlanService'
import ProductionStageService from 'src/services/ProductionStageService'
import { formatDate } from 'src/utils/dateFormatters'
import {
  FakeCultivationService,
  getMockTasksByStage,
  MOCK_SUPERVISOR_PLAN,
  MOCK_SUPERVISOR_STAGES,
  MOCK_CULTIVATION_TASKS,
} from '../Logbooks/mockData'

dayjs.extend(relativeTime)
dayjs.locale('vi')

const { Text, Title, Paragraph } = Typography

// ── Helpers ──────────────────────────────────────────────────────────────────
const stageStatusConfig = {
  PENDING: { color: 'default', bg: 'bg-gray-50', text: 'text-gray-600', label: 'Chưa bắt đầu', dot: '🔵' },
  IN_PROGRESS: { color: 'processing', bg: 'bg-blue-50', text: 'text-blue-700', label: 'Đang thực hiện', dot: '🟡' },
  COMPLETED: { color: 'success', bg: 'bg-green-50', text: 'text-green-700', label: 'Hoàn thành', dot: '🟢' },
}

const taskStatusConfig = {
  PENDING: { color: 'default', label: 'Chờ kích hoạt', icon: <ClockCircleOutlined /> },
  ACTIVE: { color: 'processing', label: 'Đang thực hiện', icon: <CheckCircleOutlined /> },
  COMPLETED: { color: 'success', label: 'Hoàn thành', icon: <CheckCircleOutlined /> },
}

const mergeItems = (apiItems, mockItems) => {
  if (apiItems.length) return apiItems
  return mockItems
}

// ── Component: Task Card nhỏ trong giai đoạn ─────────────────────────────────
const TaskRow = ({ task, planId, stageId }) => {
  const navigate = useNavigate()
  const cfg = taskStatusConfig[task.status] || taskStatusConfig.PENDING
  return (
    <div
      className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 transition hover:border-green-300 hover:bg-green-50/30 hover:shadow-sm"
      onClick={() =>
        navigate(
          ROUTER.FS_TASK_DETAIL
            .replace(':planId', planId)
            .replace(':taskId', task.id)
        )
      }
    >
      <div className={`min-h-8 min-w-8 rounded-full flex items-center justify-center text-xs font-bold ${task.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : task.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-gray-900 truncate">{task.name}</div>
        <div className="text-xs text-gray-500 mt-0.5 truncate">{task.description}</div>
        {(task.farmLeaderId || task.farmerIds?.length > 0) && (
          <div className="flex flex-wrap gap-1 mt-1">
            {task.farmLeaderId && (
              <Tag icon={<UserOutlined />} color="green" className="rounded-full text-xs m-0">
                {task.farmLeaderName || 'Farm Leader'}
              </Tag>
            )}
            {task.farmerIds?.length > 0 && (
              <Tag icon={<TeamOutlined />} color="blue" className="rounded-full text-xs m-0">
                {task.farmerIds.length} Farmer
              </Tag>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <Tag color={cfg.color} className="rounded-full m-0">{cfg.label}</Tag>
      </div>
      <EyeOutlined className="text-gray-400 shrink-0" />
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
const FarmSupervisorPlanDetail = () => {
  const { planId } = useParams()
  const navigate = useNavigate()
  const [plan, setPlan] = useState(null)
  const [stages, setStages] = useState([])
  const [tasks, setTasks] = useState({}) // { stageId: [] }
  const [loading, setLoading] = useState(true)
  const [addTaskModal, setAddTaskModal] = useState(false)
  const [activeStageId, setActiveStageId] = useState(null)
  const [taskForm] = Form.useForm()
  const [savingTask, setSavingTask] = useState(false)
  const [submitModal, setSubmitModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [expandedStages, setExpandedStages] = useState([])

  const loadData = async () => {
    setLoading(true)
    try {
      let planData = null
      let stageData = []
      let tasksMap = {}

      // Load plan
      try {
        const res = await ProductionPlanService.getById(planId)
        planData = res?.data ?? res
      } catch { /* fallback mock */ }

      if (!planData || planData?.success === false) {
        planData = MOCK_SUPERVISOR_PLAN
        stageData = MOCK_SUPERVISOR_STAGES
      } else {
        // Load stages
        try {
          const stagesRes = await ProductionStageService.getAll({ PageIndex: 1, PageSize: 1000 })
          const all = stagesRes?.data?.data || stagesRes?.data || []
          stageData = (Array.isArray(all) ? all : []).filter(
            (s) => s.cultivationLogbookId === planId || s.productionPlanId === planId
          )
        } catch { stageData = MOCK_SUPERVISOR_STAGES }
      }

      if (!stageData.length) stageData = MOCK_SUPERVISOR_STAGES

      // Load tasks per stage
      for (const stage of stageData) {
        try {
          const tasksRes = await FakeCultivationService.getTasksByStage(stage.id)
          const items = tasksRes?.data?.data || []
          tasksMap[stage.id] = items.length ? items : getMockTasksByStage(stage.id)
        } catch {
          tasksMap[stage.id] = getMockTasksByStage(stage.id)
        }
      }

      setPlan(planData)
      setStages(stageData)
      setTasks(tasksMap)
      // Auto-expand stages in progress
      const inProgressIds = stageData
        .filter((s) => s.status === 'IN_PROGRESS')
        .map((s) => s.id)
      setExpandedStages(inProgressIds.length ? inProgressIds : [stageData[0]?.id].filter(Boolean))
    } catch (error) {
      console.error(error)
      message.error('Không thể tải dữ liệu kế hoạch.')
      setPlan(MOCK_SUPERVISOR_PLAN)
      setStages(MOCK_SUPERVISOR_STAGES)
      const tasksMap = {}
      MOCK_SUPERVISOR_STAGES.forEach((s) => { tasksMap[s.id] = getMockTasksByStage(s.id) })
      setTasks(tasksMap)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [planId])

  const allStageTasks = useMemo(
    () => Object.values(tasks).flat(),
    [tasks]
  )
  const allCompleted = useMemo(
    () => allStageTasks.length > 0 && allStageTasks.every((t) => t.status === 'COMPLETED'),
    [allStageTasks]
  )

  const openAddTask = (stageId) => {
    const stage = stages.find((s) => s.id === stageId)
    if (stage?.status === 'COMPLETED') {
      message.warning('Giai đoạn đã hoàn thành 100%. Không thể thêm công việc mới.')
      return
    }
    setActiveStageId(stageId)
    taskForm.resetFields()
    setAddTaskModal(true)
  }

  const handleAddTask = async () => {
    try {
      const values = await taskForm.validateFields()
      setSavingTask(true)
      const stageName = stages.find((s) => s.id === activeStageId)?.stageName || ''
      const tasksToCreate = (values.tasks || [{ name: values.name, description: values.description }])
        .filter((t) => t.name?.trim())

      for (const task of tasksToCreate) {
        const newTask = {
          id: `mock-ctask-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          planId,
          stageId: activeStageId,
          stageName,
          name: task.name.trim(),
          description: task.description?.trim() || '',
          status: 'PENDING',
          progress: 0,
          farmLeaderId: null,
          farmLeaderName: null,
          farmerIds: [],
          farmerNames: [],
          startDate: null,
          leaderSummary: null,
          officialLog: null,
        }
        setTasks((prev) => ({
          ...prev,
          [activeStageId]: [...(prev[activeStageId] || []), newTask],
        }))
      }

      message.success(`Đã thêm ${tasksToCreate.length} công việc vào giai đoạn!`)
      setAddTaskModal(false)
      taskForm.resetFields()
    } catch { /* validation */ } finally {
      setSavingTask(false)
    }
  }

  const handleSubmitLogbook = async () => {
    try {
      setSubmitting(true)
      const response = await FakeCultivationService.submitLogbook(planId)
      if (response?.data?.success) {
        message.success('Đã gửi nhật ký lên Farm Manager thành công!')
        setSubmitModal(false)
        navigate(ROUTER.FS_PLANS)
      } else {
        message.error(response?.data?.message || 'Gửi nhật ký thất bại.')
      }
    } catch (error) {
      message.error('Gửi nhật ký thất bại.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Spin size="large" tip="Đang tải kế hoạch..." />
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="py-16 text-center">
        <Empty description="Không tìm thấy kế hoạch." />
        <Button onClick={() => navigate(ROUTER.FS_PLANS)} className="mt-4">Quay lại</Button>
      </div>
    )
  }

  const overallProgress = allStageTasks.length
    ? Math.round(allStageTasks.reduce((sum, t) => sum + (t.progress || 0), 0) / allStageTasks.length)
    : 0

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button
            type="text" icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTER.FS_PLANS)}
            className="mb-3 -ml-2 h-9 text-gray-600 hover:text-green-700"
          >
            Quay lại danh sách
          </Button>
          <TitleCustom className="!mb-1">{plan.planName || 'Kế hoạch canh tác'}</TitleCustom>
          <div className="flex flex-wrap gap-2">
            <Tag color="processing" className="rounded-full">Đang thực hiện</Tag>
            {plan.isMock && <Tag color="blue" className="rounded-full">Dữ liệu mẫu</Tag>}
          </div>
        </div>
        <Tooltip title={!allCompleted ? 'Cần hoàn thành tất cả công việc trước khi gửi.' : ''}>
          <Button
            type="primary" icon={<SendOutlined />} size="large"
            disabled={!allCompleted}
            onClick={() => setSubmitModal(true)}
            className="h-11 rounded-xl bg-green-600 px-6 font-semibold"
          >
            Gửi nhật ký lên Manager
          </Button>
        </Tooltip>
      </div>

      {/* Plan Overview Card */}
      <Card bordered={false} className="shadow-sm rounded-2xl overflow-hidden">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Title level={5} className="!mb-3 !text-green-700">Thông tin kế hoạch</Title>
            <Descriptions column={{ xs: 1, sm: 2, lg: 3 }} size="small">
              <Descriptions.Item label={<><EnvironmentOutlined className="mr-1" />Vùng trồng</>}>
                {plan.landPlotName || '—'}
              </Descriptions.Item>
              <Descriptions.Item label={<><BookOutlined className="mr-1" />Cây trồng</>}>
                {plan.cropName || '—'}
              </Descriptions.Item>
              <Descriptions.Item label={<><UserOutlined className="mr-1" />Giám sát viên</>}>
                {plan.supervisorName || '—'}
              </Descriptions.Item>
            </Descriptions>
          </div>
          <div className="flex flex-col items-center justify-center border-l border-gray-100 pl-6">
            <div className="mb-2 text-sm font-semibold text-gray-600">Tiến độ tổng thể</div>
            <Progress type="circle" percent={overallProgress} size={110}
              strokeColor={{ '0%': '#86efac', '100%': '#16a34a' }}
              format={(p) => <span className="text-2xl font-bold text-green-700">{p}%</span>}
            />
            <div className="mt-3 text-center text-xs text-gray-500">
              {allStageTasks.filter((t) => t.status === 'COMPLETED').length}/{allStageTasks.length} công việc hoàn thành
            </div>
          </div>
        </div>
      </Card>

      {/* Stages & Tasks */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Title level={5} className="!mb-0 !text-gray-900">Giai đoạn canh tác</Title>
          <Text type="secondary">({stages.length} giai đoạn)</Text>
        </div>

        <Collapse
          activeKey={expandedStages}
          onChange={setExpandedStages}
          accordion={false}
          bordered={false}
          className="bg-transparent"
        >
          {stages.map((stage, idx) => {
            const cfg = stageStatusConfig[stage.status] || stageStatusConfig.PENDING
            const stageTasks = tasks[stage.id] || []
            const completedCount = stageTasks.filter((t) => t.status === 'COMPLETED').length
            const stageProgress = stageTasks.length
              ? Math.round(stageTasks.reduce((s, t) => s + (t.progress || 0), 0) / stageTasks.length)
              : 0

            return (
              <Collapse.Panel
                key={stage.id}
                className={`mb-3 rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${cfg.bg}`}
                header={
                  <div className="flex flex-wrap items-center justify-between gap-3 py-1">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 flex items-center justify-center rounded-full text-sm font-bold ${stage.status === 'COMPLETED' ? 'bg-green-600' : stage.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-gray-300'} text-white`}>
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{stage.stageName}</div>
                        <div className="text-xs text-gray-500">
                          {stage.startDate ? formatDate(stage.startDate) : '?'} — {stage.endDate ? formatDate(stage.endDate) : '?'}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mr-4">
                      <Tag color={cfg.color} className="rounded-full m-0">{cfg.label}</Tag>
                      <span className="text-xs text-gray-500 whitespace-nowrap">{completedCount}/{stageTasks.length} việc xong</span>
                      <Progress percent={stageProgress} size="small" className="!w-24 !m-0" showInfo={false}
                        strokeColor={stage.status === 'COMPLETED' ? '#16a34a' : '#3b82f6'}
                      />
                    </div>
                  </div>
                }
              >
                {/* Stage Description */}
                {stage.note && (
                  <div className="mb-4 rounded-xl bg-amber-50 border border-amber-100 p-3">
                    <div className="text-xs font-semibold text-amber-700 mb-1">📋 Hướng dẫn giai đoạn:</div>
                    <Paragraph className="!mb-0 text-sm text-amber-900">{stage.note}</Paragraph>
                  </div>
                )}

                {/* Task List */}
                <div className="space-y-2">
                  {stageTasks.length ? (
                    stageTasks.map((task) => (
                      <TaskRow key={task.id} task={task} planId={planId} stageId={stage.id} />
                    ))
                  ) : (
                    <div className="py-6 text-center text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
                      Chưa có công việc nào. Thêm công việc đầu tiên cho giai đoạn này.
                    </div>
                  )}
                </div>

                {/* Nhật ký chính thức - chỉ hiển thị khi giai đoạn hoàn thành 100% */}
                {stage.status === 'COMPLETED' && stageTasks.length > 0 && stageTasks.every(t => t.status === 'COMPLETED') && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-2 mb-3">
                      <FileTextOutlined className="text-green-600" />
                      <span className="font-semibold text-green-700">Nhật ký chính thức của giai đoạn</span>
                    </div>
                    <div className="space-y-3">
                      {stageTasks.map((task) => (
                        <Card key={task.id} bordered={false} className="shadow-sm rounded-xl border border-green-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <CheckCircleOutlined className="text-green-600" />
                              <span className="font-semibold">{task.name}</span>
                            </div>
                            <Tag color="success" className="rounded-full">Hoàn thành</Tag>
                          </div>
                          <div className="mt-2 text-sm">
                            {task.officialLog ? (
                              <div className="space-y-2">
                                <div className="font-mono bg-gray-50 rounded-lg p-2">{task.officialLog.dataSentence}</div>
                                <div className="italic bg-blue-50 rounded-lg p-2">{task.officialLog.supervisorDescription}</div>
                              </div>
                            ) : (
                              <Alert message="Chưa biên soạn nhật ký chính thức" type="info" showIcon className="rounded-lg" />
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Task Button - chỉ hiển thị khi giai đoạn chưa hoàn thành */}
                {stage.status !== 'COMPLETED' && (
                  <Button
                    type="dashed" icon={<PlusOutlined />}
                    onClick={(e) => { e.stopPropagation(); openAddTask(stage.id) }}
                    className="w-full mt-3 h-10 rounded-xl border-green-300 text-green-700 hover:border-green-500"
                  >
                    + Thêm công việc vào giai đoạn này
                  </Button>
                )}
              </Collapse.Panel>
            )
          })}
        </Collapse>
      </div>

      {/* Modal: Thêm Công Việc */}
      <Modal
        open={addTaskModal}
        onCancel={() => setAddTaskModal(false)}
        title={
          <div className="flex items-center gap-2">
            <PlusOutlined className="text-green-600" />
            <span>Thêm Công Việc — {stages.find((s) => s.id === activeStageId)?.stageName}</span>
          </div>
        }
        onOk={handleAddTask}
        okText="Lưu tất cả công việc"
        cancelText="Hủy"
        confirmLoading={savingTask}
        okButtonProps={{ className: 'bg-green-600' }}
        width={680}
        className="rounded-2xl"
      >
        <div className="mb-4 rounded-xl bg-blue-50 p-3 text-sm text-blue-700 border border-blue-100">
          💡 Hướng dẫn giai đoạn: <em>{stages.find((s) => s.id === activeStageId)?.note}</em>
        </div>
        <Form form={taskForm} layout="vertical">
          <Form.List name="tasks" initialValue={[{ name: '', description: '' }]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map((field, index) => (
                  <div key={field.key} className="mb-3 rounded-xl border border-gray-100 bg-gray-50 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-gray-700">Công việc #{index + 1}</span>
                      {fields.length > 1 && (
                        <Button type="text" danger size="small" onClick={() => remove(field.name)}>Xóa</Button>
                      )}
                    </div>
                    <Row gutter={12}>
                      <Col span={24}>
                        <Form.Item
                          {...field} name={[field.name, 'name']}
                          label="Tên công việc" rules={[{ required: true, message: 'Nhập tên công việc' }]}
                        >
                          <Input placeholder="VD: Bón phân đón đòng, Phun thuốc phòng đạo ôn..." />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item {...field} name={[field.name, 'description']} label="Mô tả / Hướng dẫn thực hiện">
                          <Input.TextArea rows={2} placeholder="Mô tả chi tiết cách thực hiện, liều lượng, lưu ý..." />
                        </Form.Item>
                      </Col>
                    </Row>
                  </div>
                ))}
                <Button
                  type="dashed" onClick={() => add({ name: '', description: '' })}
                  icon={<PlusOutlined />} className="w-full rounded-xl text-green-700 border-green-300"
                >
                  + Thêm công việc nữa
                </Button>
              </>
            )}
          </Form.List>
        </Form>
      </Modal>

      {/* Modal: Xác nhận gửi nhật ký */}
      <Modal
        open={submitModal}
        onCancel={() => setSubmitModal(false)}
        title={<div className="flex items-center gap-2 text-green-700"><SendOutlined />Gửi nhật ký lên Farm Manager</div>}
        onOk={handleSubmitLogbook}
        okText="Xác nhận gửi"
        cancelText="Hủy"
        confirmLoading={submitting}
        okButtonProps={{ className: 'bg-green-600' }}
      >
        <div className="space-y-3 text-sm">
          <Alert
            message="✅ Tất cả công việc đã hoàn thành!"
            description="Nhật ký canh tác sẽ được gửi đến Farm Manager để duyệt."
            type="success"
            showIcon
            className="rounded-xl"
          />
          <div className="text-gray-500">
            Sau khi gửi, bạn không thể chỉnh sửa. Farm Manager sẽ duyệt hoặc từ chối kèm lý do.
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default FarmSupervisorPlanDetail