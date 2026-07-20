/**
 * Farm Leader: Danh sách Công việc được giao
 * Route: /farm-leader/tasks  (ROUTER.FL_TASKS)
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
  Button,
  Card,
  Empty,
  Input,
  Progress,
  Skeleton,
  Tag,
  Typography,
  message,
} from 'antd'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'

import TitleCustom from 'src/components/TitleCustom'
import ROUTER from 'src/router/ROUTER'
import CultivationTaskService from 'src/services/CultivationTaskService'
import { formatDate } from 'src/utils/dateFormatters'

const { Text } = Typography

const userIdOf = (user) => user?.id || user?._id || user?.userId

const taskStatusConfig = {
  PENDING: { color: 'default', label: 'Chờ kích hoạt' },
  ACTIVE: { color: 'processing', label: 'Đang thực hiện' },
  COMPLETED: { color: 'success', label: 'Hoàn thành' },
}

const FarmLeaderTasks = () => {
  const navigate = useNavigate()
  const user = useSelector((state) => state.appGlobal.userInfo)
  const currentUserId = userIdOf(user)
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        // Lấy danh sách tasks được giao cho Farm Leader
        const response = await CultivationTaskService.getAll({
          farmLeaderId: currentUserId,
          PageIndex: 1,
          PageSize: 1000,
        })
        const data = response?.data?.data || response?.data || []
        const tasksList = Array.isArray(data) ? data : data?.items || []
        
        if (mounted) setTasks(tasksList)
      } catch (error) {
        console.error(error)
        if (mounted) {
          message.error(error.message || 'Không thể tải công việc.')
          setTasks([])
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    if (currentUserId) load()
    else setLoading(false)
    
    return () => { mounted = false }
  }, [currentUserId, reloadKey])

  const visibleTasks = tasks.filter((task) => {
    const keyword = search.trim().toLowerCase()
    return !keyword || [task.name, task.stageName, task.description]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(keyword))
  })

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
        <Text type="secondary">Danh sách công việc được giao và tiến độ thực hiện.</Text>
      </div>

      <Card bordered={false} className="shadow-sm rounded-2xl" bodyStyle={{ padding: 0 }}>
        <div className="flex flex-col gap-3 p-4 border-b border-gray-100">
          <div className="flex flex-wrap gap-2">
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onPressEnter={() => setSearch(searchInput.trim())}
              onClear={() => { setSearchInput(''); setSearch('') }}
              placeholder="Tìm kiếm công việc..."
              prefix={<SearchOutlined className="text-gray-300" />}
              className="flex-1 h-10 rounded-xl"
              allowClear
            />
            <Button onClick={() => setSearch(searchInput.trim())} icon={<SearchOutlined />} className="h-10 px-4 font-semibold rounded-xl bg-gray-50">
              Tìm kiếm
            </Button>
            <Button icon={<ReloadOutlined />} onClick={() => setReloadKey((v) => v + 1)} loading={loading} className="h-10 px-3 rounded-xl bg-gray-50" title="Làm mới" />
          </div>
          <Text type="secondary" className="text-xs">Tìm thấy <strong>{visibleTasks.length}</strong> công việc</Text>
        </div>

        {loading ? (
          <div className="p-5"><Skeleton active paragraph={{ rows: 5 }} /></div>
        ) : visibleTasks.length ? (
          <div className="p-5">
            <div className="grid gap-4 xl:grid-cols-2">
              {visibleTasks.map((task) => {
                const cfg = taskStatusConfig[task.status] || taskStatusConfig.PENDING
                return (
                  <Card
                    key={task.id}
                    bordered={false}
                    className="overflow-hidden transition border border-gray-100 shadow-sm rounded-2xl hover:border-green-300 hover:shadow-md cursor-pointer"
                    bodyStyle={{ padding: 0 }}
                    onClick={() => openTaskLog(task.id)}
                  >
                    <div className="p-5 border-b border-green-100 bg-gradient-to-r from-green-50 to-white">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <Tag color={cfg.color} className="rounded-full">{cfg.label}</Tag>
                        <Tag color="blue" className="rounded-full">{task.stageName}</Tag>
                      </div>
                      <h3 className="mb-1 text-lg font-bold text-gray-900">{task.name}</h3>
                      <Text type="secondary" className="text-sm line-clamp-2">{task.description}</Text>
                    </div>
                    <div className="p-5">
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <Text type="secondary" className="text-xs font-semibold">Tiến độ</Text>
                          <Text className="text-sm font-bold text-green-700">{task.progress}%</Text>
                        </div>
                        <Progress
                          percent={task.progress}
                          strokeColor={task.status === 'COMPLETED' ? '#16a34a' : '#3b82f6'}
                          showInfo={false}
                        />
                      </div>
                      <div className="grid gap-2 text-sm">
                        <div>
                          <Text type="secondary">Kế hoạch</Text>
                          <div className="mt-1 font-semibold">{task.planName || 'Chưa cập nhật'}</div>
                        </div>
                        <div>
                          <Text type="secondary">Vùng trồng</Text>
                          <div className="mt-1 font-semibold">
                            <EnvironmentOutlined className="mr-1 text-green-600" />
                            {task.landPlotName || 'Chưa cập nhật'}
                          </div>
                        </div>
                        {task.startDate && (
                          <div>
                            <Text type="secondary">Bắt đầu</Text>
                            <div className="mt-1 font-semibold">
                              <CalendarOutlined className="mr-1 text-green-600" />
                              {formatDate(task.startDate)}
                            </div>
                          </div>
                        )}
                      </div>
                      <Button
                        type="primary"
                        icon={task.status === 'ACTIVE' ? <FileTextOutlined /> : <EyeOutlined />}
                        onClick={() => openTaskLog(task.id)}
                        className="w-full h-10 mt-4 font-semibold bg-green-600 rounded-lg"
                      >
                        {task.status === 'ACTIVE' ? 'Ghi nhật ký' : 'Xem chi tiết'}
                      </Button>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="p-8">
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có công việc nào được giao." />
          </div>
        )}
      </Card>
    </div>
  )
}

export default FarmLeaderTasks
