/**
 * FieldLog for FARM_LEADER - Ghi chép Thực tế Giai đoạn
 * Route: /land-manager/field-log  (ROUTER.LM_FIELD_LOG)
 *
 * Hiển thị Kế hoạch -> Giai đoạn -> Công việc của Farm Leader.
 * - Công việc COMPLETED: Xem nhật ký.
 * - Công việc ACTIVE: Ghi nhật ký thực tế.
 * - Công việc PENDING: Chỉ xem, chưa được làm.
 */
import {
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  FormOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Collapse,
  Descriptions,
  Empty,
  Progress,
  Spin,
  Tag,
  Typography,
  message,
} from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
// import { useSelector } from 'react-redux'

import TitleCustom from 'src/components/TitleCustom'
import ROUTER from 'src/router/ROUTER'
import { formatDate } from 'src/utils/dateFormatters'
import {
  MOCK_SUPERVISOR_PLAN,
  MOCK_SUPERVISOR_STAGES,
  getMockTasksByLeader,
} from '../Logbooks/mockData'

const { Text } = Typography

// ── Helpers ──────────────────────────────────────────────────────────────────
const taskStatusConfig = {
  PENDING: { color: 'default', label: 'Chờ kích hoạt', icon: <ClockCircleOutlined /> },
  ACTIVE: { color: 'processing', label: 'Đang thực hiện', icon: <CheckCircleOutlined /> },
  COMPLETED: { color: 'success', label: 'Hoàn thành', icon: <CheckCircleOutlined /> },
}

// ── Component: Task Card nhỏ trong giai đoạn ─────────────────────────────────
const TaskRow = ({ task }) => {
  const navigate = useNavigate()
  const cfg = taskStatusConfig[task.status] || taskStatusConfig.PENDING

  const handleClick = () => {
    if (task.status === 'PENDING') {
      message.info('Công việc này chưa được kích hoạt.')
      return
    }
    navigate(ROUTER.FL_TASK_LOG.replace(':taskId', task.id))
  }

  return (
    <div
      className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 transition hover:border-green-300 hover:bg-green-50/30 hover:shadow-sm"
      onClick={handleClick}
    >
      <div className={`min-h-8 min-w-8 rounded-full flex items-center justify-center text-xs font-bold ${task.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : task.status === 'ACTIVE' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
        {cfg.icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-gray-900 truncate">{task.name}</div>
        <div className="text-xs text-gray-500 mt-0.5 truncate">{task.description}</div>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <Tag color={cfg.color} className="rounded-full m-0">{cfg.label}</Tag>
      </div>

      {task.status === 'ACTIVE' ? (
        <Button type="primary" size="small" className="bg-green-600 rounded-lg shrink-0 ml-2">
          Ghi nhật ký
        </Button>
      ) : task.status === 'COMPLETED' ? (
        <Button type="default" size="small" icon={<EyeOutlined />} className="rounded-lg shrink-0 ml-2">
          Xem
        </Button>
      ) : (
        <Button disabled size="small" className="rounded-lg shrink-0 ml-2">
          Chưa mở
        </Button>
      )}
    </div>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
const FarmLeaderFieldLog = () => {
  // Lấy userInfo để biết đang là leader nào (ở đây mock leader)
  // const { userInfo } = useSelector((state) => state.auth)
  const leaderId = 'mock-leader-002' // Fake luôn leaderId theo mock data

  const [plan, setPlan] = useState(null)
  const [stages, setStages] = useState([])
  const [tasks, setTasks] = useState({}) // { stageId: [tasks] }
  const [loading, setLoading] = useState(true)
  const [expandedStages, setExpandedStages] = useState([])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        await new Promise((r) => setTimeout(r, 400)) // giả lập API
        // Fake kế hoạch (Chỉ lấy kế hoạch mà leader này được gán, ở đây mock 1 kế hoạch duy nhất)
        setPlan(MOCK_SUPERVISOR_PLAN)

        // Lấy tất cả task của leader này
        const leaderTasks = getMockTasksByLeader(leaderId)

        // Lấy ra các stageId có chứa task của leader
        const activeStageIds = [...new Set(leaderTasks.map(t => t.stageId))]

        // Filter stages từ MOCK
        const relatedStages = MOCK_SUPERVISOR_STAGES.filter(s => activeStageIds.includes(s.id))
        setStages(relatedStages)

        // Group tasks by stage
        const tasksMap = {}
        relatedStages.forEach(stage => {
          tasksMap[stage.id] = leaderTasks.filter(t => t.stageId === stage.id)
        })
        setTasks(tasksMap)

        // Mở sẵn các stage có task ACTIVE
        const activeStageKeys = relatedStages
          .filter(s => tasksMap[s.id].some(t => t.status === 'ACTIVE'))
          .map(s => s.id)
        setExpandedStages(activeStageKeys.length > 0 ? activeStageKeys : [relatedStages[0]?.id].filter(Boolean))

      } catch (error) {
        message.error('Không thể tải dữ liệu kế hoạch.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [leaderId])

  if (loading) {
    return <div className="flex items-center justify-center min-h-96"><Spin size="large" /></div>
  }

  if (!plan || stages.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Hiện tại bạn chưa được phân công công việc nào."
        className="my-10"
      />
    )
  }

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <FormOutlined className="text-green-600" />
            Ghi chép Thực tế (Kế hoạch)
          </TitleCustom>
        </div>
      </div>

      {/* Thông tin kế hoạch */}
      <Card bordered={false} className="shadow-sm rounded-2xl" bodyStyle={{ padding: '20px' }}>
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
            <BookOutlined className="text-2xl" />
          </div>
          <div>
            <div className="text-lg font-bold text-gray-900">{plan.planName}</div>
            <div className="text-sm text-gray-500">Mã kế hoạch: {plan.planCode || plan.id}</div>
          </div>
        </div>

        <Descriptions column={{ xs: 1, sm: 2, md: 4 }} size="small" className="mt-2">
          <Descriptions.Item label={<><EnvironmentOutlined className="mr-1 text-green-600" />Vùng trồng</>}>
            <span className="font-semibold text-gray-800">{plan.landPlotName || '—'}</span>
          </Descriptions.Item>
          <Descriptions.Item label={<><BookOutlined className="mr-1" />Cây trồng</>}>
            {plan.cropName || '—'}
          </Descriptions.Item>
          <Descriptions.Item label={<><UserOutlined className="mr-1" />Giám sát viên</>}>
            {plan.supervisorName || '—'}
          </Descriptions.Item>
          <Descriptions.Item label={<><CalendarOutlined className="mr-1" />Thời gian</>}>
            {plan.startDate ? formatDate(plan.startDate) : '—'} - {plan.expectedEndDate ? formatDate(plan.expectedEndDate) : '—'}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Danh sách giai đoạn */}
      <div className="mb-2 text-base font-bold text-gray-800">
        <ClockCircleOutlined className="mr-2 text-green-600" />
        Các giai đoạn và công việc được giao
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <Collapse
          ghost
          activeKey={expandedStages}
          onChange={(keys) => setExpandedStages(keys)}
          expandIconPosition="end"
          className="bg-transparent"
        >
          {stages.map((stage, idx) => {
            const stageTasks = tasks[stage.id] || []

            return (
              <Collapse.Panel
                key={stage.id}
                className="border-b border-gray-100 last:border-0"
                header={
                  <div className="flex flex-wrap items-center justify-between gap-3 py-1">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 flex items-center justify-center rounded-full text-sm font-bold bg-green-50 text-green-600`}>
                        {idx + 1}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{stage.stageName}</div>
                        <div className="text-xs text-gray-500">
                          {formatDate(stage.startDate)} - {formatDate(stage.endDate)}
                        </div>
                      </div>
                    </div>
                    <Tag color="blue" className="rounded-full">
                      {stageTasks.length} công việc
                    </Tag>
                  </div>
                }
              >
                <div className="space-y-2 mt-2">
                  {stageTasks.length ? (
                    stageTasks.map((task) => (
                      <TaskRow key={task.id} task={task} />
                    ))
                  ) : (
                    <div className="py-6 text-center text-gray-400 text-sm border border-dashed border-gray-200 rounded-xl">
                      Bạn không có công việc nào trong giai đoạn này.
                    </div>
                  )}
                </div>
              </Collapse.Panel>
            )
          })}
        </Collapse>
      </div>
    </div>
  )
}

export default FarmLeaderFieldLog
