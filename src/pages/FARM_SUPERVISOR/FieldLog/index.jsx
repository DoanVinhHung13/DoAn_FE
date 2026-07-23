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
import CultivationStageService from 'src/services/CultivationStageService'
import CultivationTaskService from 'src/services/CultivationTaskService'
import { formatDate } from 'src/utils/dateFormatters'
import { useCultivationStatus } from 'src/hooks/useCultivationStatus'
import { canWriteDailyLog } from 'src/utils/cultivationStatus'

const { Text } = Typography

// ── Component: Task Card nhỏ trong giai đoạn ─────────────────────────────────
const TaskRow = ({ task, getTaskStatus }) => {
  const navigate = useNavigate()
  const cfg = getTaskStatus(task.status)

  const handleClick = () => {
    if (task.status === 'PENDING') {
      message.info('Công việc này chưa được kích hoạt.')
      return
    }
    navigate(ROUTER.FL_TASK_LOG.replace(':taskId', task.id))
  }

  const inProgress = canWriteDailyLog(task.status)

  return (
    <div
      className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 transition hover:border-green-300 hover:bg-green-50/30 hover:shadow-sm"
      onClick={handleClick}
    >
      <div className={`min-h-8 min-w-8 rounded-full flex items-center justify-center text-xs font-bold ${
        task.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
        inProgress ? 'bg-blue-100 text-blue-700' :
        'bg-gray-100 text-gray-500'
      }`}>
        {task.status === 'PENDING' ? <ClockCircleOutlined /> : <CheckCircleOutlined />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-gray-900 truncate">{task.name}</div>
        <div className="text-xs text-gray-500 mt-0.5 truncate">{task.description}</div>
      </div>
      <div className="flex flex-col items-end gap-1 shrink-0">
        <Tag color={cfg.color} className="rounded-full m-0">{cfg.label}</Tag>
      </div>

      {inProgress ? (
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
  const navigate = useNavigate()

  const [stages, setStages] = useState([])
  const [tasks, setTasks] = useState({}) // { stageId: [tasks] }
  const [loading, setLoading] = useState(true)
  const [expandedStages, setExpandedStages] = useState([])

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        // Only get tasks assigned to current Farm Leader
        const tasksRes = await CultivationTaskService.getAll({
          PageIndex: 1,
          PageSize: 1000,
        })
        
        // Handle API response structure: { success, data: { items: [] } }
        const responseData = tasksRes?.data?.data || tasksRes?.data
        const tasksList = responseData?.items || responseData || []
        
        console.log('Tasks loaded:', tasksList) // Debug log

        if (!Array.isArray(tasksList) || tasksList.length === 0) {
          setStages([])
          setTasks({})
          return
        }

        // Get unique stage IDs from tasks
        const stageIds = [...new Set(tasksList.map(t => t.stageId).filter(Boolean))]

        if (stageIds.length === 0) {
          // No stages, but we have tasks - just show them ungrouped
          setStages([{
            id: 'ungrouped',
            stageName: 'Công việc chưa phân giai đoạn',
            order: 0
          }])
          setTasks({ 'ungrouped': tasksList })
          setExpandedStages(['ungrouped'])
          return
        }

        // Load stages (just for display grouping)
        const stagesPromises = stageIds.map(id => 
          CultivationStageService.getById(id).catch(() => null)
        )
        const stagesResults = await Promise.all(stagesPromises)
        const stagesData = stagesResults
          .filter(Boolean)
          .map(res => res?.data ?? res)
          .filter(Boolean)
        
        setStages(stagesData)

        // Group tasks by stage
        const tasksMap = {}
        stagesData.forEach(stage => {
          tasksMap[stage.id] = tasksList.filter(t => t.stageId === stage.id)
        })
        setTasks(tasksMap)

        // Auto-expand stages with ACTIVE or IN_PROGRESS tasks
        const activeStageKeys = stagesData
          .filter(s => tasksMap[s.id]?.some(t => 
            t.status === 'ACTIVE' || t.status === 'IN_PROGRESS'
          ))
          .map(s => s.id)
        setExpandedStages(activeStageKeys.length > 0 ? activeStageKeys : [stagesData[0]?.id].filter(Boolean))

      } catch (error) {
        console.error('Error loading tasks:', error)
        message.error('Không thể tải danh sách công việc.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center min-h-96"><Spin size="large" /></div>
  }

  if (stages.length === 0) {
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
            Công việc của tôi
          </TitleCustom>
        </div>
      </div>

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
