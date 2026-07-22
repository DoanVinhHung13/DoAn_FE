/**
 * Farm Leader hub — Công việc của tôi
 * Route: /farm-leader/tasks  (ROUTER.FL_TASKS)
 *
 * Tabs: Đang làm | Chờ duyệt | Lịch sử
 * Enrich task bằng GET /cultivation-logbooks/{id} (logbookName, landPlotName, cropName)
 */
import {
  CalendarOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  FileTextOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import {
  Badge,
  Button,
  Card,
  Empty,
  Input,
  Progress,
  Skeleton,
  Tabs,
  Tag,
  Typography,
  message,
} from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import TitleCustom from 'src/components/TitleCustom'
import ROUTER from 'src/router/ROUTER'
import CultivationLogbookService from 'src/services/CultivationLogbookService'
import CultivationTaskService from 'src/services/CultivationTaskService'
import { canWriteDailyLog, getTaskStatus } from 'src/utils/cultivationStatus'
import { formatDate } from 'src/utils/dateFormatters'

const { Text } = Typography

const userIdOf = (user) => user?.id || user?._id || user?.userId

const unwrap = (res) => res?.data?.data ?? res?.data ?? res

const ACTIVE_STATUSES = new Set(['PENDING', 'IN_PROGRESS', 'ACTIVE'])
const WAITING_STATUSES = new Set(['WAITING_APPROVAL'])
const HISTORY_STATUSES = new Set(['COMPLETED'])

const tabOfStatus = (status) => {
  if (WAITING_STATUSES.has(status)) return 'waiting'
  if (HISTORY_STATUSES.has(status)) return 'history'
  if (ACTIVE_STATUSES.has(status)) return 'active'
  return 'active'
}

const TaskCard = ({ task, logbook, onOpen }) => {
  const cfg = getTaskStatus(task.status)
  const canLog = canWriteDailyLog(task.status)
  const progress = task.progress ?? 0

  let ctaLabel = 'Xem chi tiết'
  let ctaIcon = <EyeOutlined />
  if (canLog) {
    ctaLabel = 'Ghi nhật ký'
    ctaIcon = <FileTextOutlined />
  } else if (task.status === 'WAITING_APPROVAL') {
    ctaLabel = 'Xem báo cáo đã gửi'
  } else if (task.status === 'PENDING') {
    ctaLabel = 'Chưa mở'
  }

  return (
    <Card
      bordered={false}
      className="overflow-hidden transition border border-gray-100 shadow-sm rounded-2xl hover:border-green-300 hover:shadow-md cursor-pointer h-full"
      bodyStyle={{ padding: 0 }}
      onClick={() => {
        if (task.status === 'PENDING') {
          message.info('Công việc chưa được kích hoạt.')
          return
        }
        onOpen(task.id)
      }}
    >
      <div className="p-4 border-b border-green-100 bg-gradient-to-r from-green-50 to-white">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <Tag color={cfg.color} className="rounded-full m-0">{cfg.label}</Tag>
          {task.taskCatalogName && (
            <Tag color="blue" className="rounded-full m-0">{task.taskCatalogName}</Tag>
          )}
        </div>
        <h3 className="mb-1 text-base font-bold text-gray-900">{task.name}</h3>
        {task.description && (
          <Text type="secondary" className="text-sm line-clamp-2">{task.description}</Text>
        )}
      </div>
      <div className="p-4 space-y-3">
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-3 text-sm space-y-1.5">
          <div className="flex items-start gap-2 text-gray-700">
            <FileTextOutlined className="mt-0.5 text-green-600 shrink-0" />
            <span className="font-medium">{logbook?.logbookName || 'Đang tải kế hoạch...'}</span>
          </div>
          <div className="flex items-start gap-2 text-gray-600">
            <EnvironmentOutlined className="mt-0.5 text-green-600 shrink-0" />
            <span>{logbook?.landPlotName || '—'}</span>
          </div>
          <div className="flex items-start gap-2 text-gray-600">
            <CheckCircleOutlined className="mt-0.5 text-green-600 shrink-0" />
            <span>{logbook?.cropName || '—'}</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <Text type="secondary" className="text-xs font-semibold">Tiến độ</Text>
            <Text className="text-sm font-bold text-green-700">{progress}%</Text>
          </div>
          <Progress
            percent={progress}
            strokeColor={task.status === 'COMPLETED' ? '#16a34a' : '#3b82f6'}
            showInfo={false}
            size="small"
          />
        </div>

        {task.startDate && (
          <div className="text-sm text-gray-600">
            <CalendarOutlined className="mr-1 text-green-600" />
            Bắt đầu: {formatDate(task.startDate)}
          </div>
        )}

        <Button
          type="primary"
          icon={ctaIcon}
          disabled={task.status === 'PENDING'}
          onClick={(e) => {
            e.stopPropagation()
            if (task.status === 'PENDING') return
            onOpen(task.id)
          }}
          className="w-full h-10 font-semibold bg-green-600 rounded-lg"
        >
          {ctaLabel}
        </Button>
      </div>
    </Card>
  )
}

const GroupedTaskList = ({ tasks, logbooksById, onOpen }) => {
  const groups = useMemo(() => {
    const map = new Map()
    tasks.forEach((task) => {
      const key = task.cultivationLogbookId || 'unknown'
      if (!map.has(key)) map.set(key, [])
      map.get(key).push(task)
    })
    return Array.from(map.entries())
  }, [tasks])

  if (!tasks.length) {
    return (
      <div className="p-8">
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có công việc trong mục này." />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-5">
      {groups.map(([logbookId, groupTasks]) => {
        const lb = logbooksById[logbookId]
        return (
          <div key={logbookId}>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Text strong className="text-gray-800">
                {lb?.logbookName || 'Kế hoạch canh tác'}
              </Text>
              {lb?.landPlotName && (
                <Tag icon={<EnvironmentOutlined />} className="rounded-full m-0">
                  {lb.landPlotName}
                </Tag>
              )}
              {lb?.cropName && (
                <Tag color="green" className="rounded-full m-0">{lb.cropName}</Tag>
              )}
              <Text type="secondary" className="text-xs">
                {groupTasks.length} công việc
              </Text>
            </div>
            <div className="grid gap-4 xl:grid-cols-2">
              {groupTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  logbook={lb}
                  onOpen={onOpen}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

const FarmLeaderTasks = () => {
  const navigate = useNavigate()
  const user = useSelector((state) => state.appGlobal.userInfo)
  const currentUserId = userIdOf(user)

  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState([])
  const [logbooksById, setLogbooksById] = useState({})
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [reloadKey, setReloadKey] = useState(0)
  const [activeTab, setActiveTab] = useState('active')

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        const response = await CultivationTaskService.getAll({
          farmLeaderId: currentUserId,
          PageIndex: 1,
          PageSize: 1000,
        })
        const data = unwrap(response)
        const tasksList = Array.isArray(data) ? data : data?.items || []
        if (!mounted) return
        setTasks(tasksList)

        const ids = [...new Set(tasksList.map((t) => t.cultivationLogbookId).filter(Boolean))]
        const entries = await Promise.all(
          ids.map(async (id) => {
            try {
              const res = await CultivationLogbookService.getById(id)
              const lb = unwrap(res)
              return [
                id,
                {
                  id,
                  logbookName: lb?.logbookName,
                  landPlotName: lb?.landPlotName,
                  cropName: lb?.cropName,
                  status: lb?.status,
                },
              ]
            } catch {
              return [id, { id, logbookName: null, landPlotName: null, cropName: null }]
            }
          })
        )
        if (mounted) setLogbooksById(Object.fromEntries(entries))
      } catch (error) {
        console.error(error)
        if (mounted) {
          message.error(error.message || 'Không thể tải công việc.')
          setTasks([])
          setLogbooksById({})
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    if (currentUserId) load()
    else setLoading(false)

    return () => {
      mounted = false
    }
  }, [currentUserId, reloadKey])

  const filteredTasks = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    return tasks.filter((task) => {
      if (!keyword) return true
      const lb = logbooksById[task.cultivationLogbookId]
      return [task.name, task.taskCatalogName, task.description, lb?.logbookName, lb?.landPlotName, lb?.cropName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    })
  }, [tasks, search, logbooksById])

  const counts = useMemo(() => {
    const c = { active: 0, waiting: 0, history: 0 }
    filteredTasks.forEach((t) => {
      c[tabOfStatus(t.status)] += 1
    })
    return c
  }, [filteredTasks])

  const tabTasks = useMemo(
    () => filteredTasks.filter((t) => tabOfStatus(t.status) === activeTab),
    [filteredTasks, activeTab]
  )

  const openTaskLog = (taskId) => {
    navigate(ROUTER.FL_TASK_LOG.replace(':taskId', taskId))
  }

  return (
    <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      <div>
        <TitleCustom className="!mb-0 flex items-center gap-2">
          <CheckCircleOutlined className="text-green-600" />
          Công việc của tôi
        </TitleCustom>
        <Text type="secondary">
          Công việc đang làm, chờ duyệt và lịch sử — kèm vùng trồng & cây trồng theo kế hoạch.
        </Text>
      </div>

      <Card bordered={false} className="shadow-sm rounded-2xl" bodyStyle={{ padding: 0 }}>
        <div className="flex flex-col gap-3 p-4 border-b border-gray-100">
          <div className="flex flex-wrap gap-2">
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onPressEnter={() => setSearch(searchInput.trim())}
              onClear={() => {
                setSearchInput('')
                setSearch('')
              }}
              placeholder="Tìm theo công việc, kế hoạch, vùng trồng, cây..."
              prefix={<SearchOutlined className="text-gray-300" />}
              className="flex-1 h-10 rounded-xl min-w-48"
              allowClear
            />
            <Button
              onClick={() => setSearch(searchInput.trim())}
              icon={<SearchOutlined />}
              className="h-10 px-4 font-semibold rounded-xl bg-gray-50"
            >
              Tìm kiếm
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => setReloadKey((v) => v + 1)}
              loading={loading}
              className="h-10 px-3 rounded-xl bg-gray-50"
              title="Làm mới"
            />
          </div>
        </div>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          className="px-4 pt-2"
          items={[
            {
              key: 'active',
              label: (
                <span>
                  Đang làm <Badge count={counts.active} className="ml-1" showZero color="#16a34a" />
                </span>
              ),
            },
            {
              key: 'waiting',
              label: (
                <span>
                  Chờ duyệt <Badge count={counts.waiting} className="ml-1" showZero color="#d97706" />
                </span>
              ),
            },
            {
              key: 'history',
              label: (
                <span>
                  Lịch sử <Badge count={counts.history} className="ml-1" showZero color="#6b7280" />
                </span>
              ),
            },
          ]}
        />

        {loading ? (
          <div className="p-5">
            <Skeleton active paragraph={{ rows: 6 }} />
          </div>
        ) : (
          <GroupedTaskList tasks={tabTasks} logbooksById={logbooksById} onOpen={openTaskLog} />
        )}
      </Card>
    </div>
  )
}

export default FarmLeaderTasks
