import {
  ArrowLeftOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  HistoryOutlined,
  FileTextOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Skeleton,
  Tag,
  message,
  Tabs,
} from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import TitleCustom from 'src/components/TitleCustom'
import ROUTER from 'src/router/ROUTER'
import CultivationLogbookService from 'src/services/CultivationLogbookService'
import { getLandPlotsFromLogbook } from 'src/utils/helpers'


// Import các Tab components
import TaskLogHistoryTab from 'src/pages/FARM_SUPERVISOR/Plans/components/TaskLogHistoryTab'
import OfficialLogbookTab from './components/OfficialLogbookTab'
import { useCultivationStatus } from 'src/hooks/useCultivationStatus'
import { formatDate } from 'src/utils/dateFormatters'


const CultivationLogbookDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { getLogbookStatus } = useCultivationStatus()

  const [initialLoading, setInitialLoading] = useState(true)
  const [item, setItem] = useState(null)
  const [stages, setStages] = useState([])
  const [activeTab, setActiveTab] = useState('official')

  useEffect(() => {
    let isMounted = true

    const fetchDetail = async () => {
      try {
        setInitialLoading(true)

        const response = await CultivationLogbookService.getById(id)
        if (response?.success === false || !response?.data) {
          message.error('Không tìm thấy nhật ký canh tác')
          navigate(ROUTER.FM_CULTIVATION_LOGBOOKS)
          return
        }

        const plan = response.data
        const planTasks = plan.tasks || plan.cultivationTasks || []
        const planStages = Array.isArray(plan.cultivationStages) ? plan.cultivationStages : []

        if (!isMounted) return
        setItem({ ...plan, tasks: planTasks })
        setStages(planStages)

      } catch {
        message.error('Lấy thông tin nhật ký canh tác thất bại')
        navigate(ROUTER.FM_CULTIVATION_LOGBOOKS)
      } finally {
        if (isMounted) setInitialLoading(false)
      }
    }

    if (id) fetchDetail()
    return () => {
      isMounted = false
    }
  }, [id, navigate])

  if (initialLoading) {
    return (
      <div className="space-y-6">
        <TitleCustom className="!mb-0 flex items-center gap-2">
          <CalendarOutlined className="text-green-600" />
          Chi tiết Nhật ký canh tác
        </TitleCustom>
        <Card bordered={false} className="shadow-sm rounded-2xl">
          <Skeleton active paragraph={{ rows: 10 }} />
        </Card>
      </div>
    )
  }

  if (!item) return null

  // Build tasksMap từ stages (mỗi stage có array tasks)
  const tasksMap = Object.fromEntries(
    stages.map((stage) => [stage.id, Array.isArray(stage.tasks) ? stage.tasks : []])
  )

  const tabItems = [
    {
      key: 'official',
      label: (
        <span className="flex items-center gap-2">
          <CheckCircleOutlined />
          Nhật ký chính thức
        </span>
      ),
    },
    {
      key: 'process',
      label: (
        <span className="flex items-center gap-2">
          <HistoryOutlined />
          Lịch sử ghi Log
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTER.FM_CULTIVATION_LOGBOOKS)}
          >
            Quay lại
          </Button>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <CalendarOutlined className="text-green-600" />
            Chi tiết Nhật ký canh tác
          </TitleCustom>
        </div>
      </div>

      {/* Hero Card */}
      <Card bordered={true} className="border-gray-200 shadow-sm rounded-2xl">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1">

            <div className="flex items-center gap-3 mb-2">
              <h1 className="max-w-4xl m-0 text-xl font-bold leading-tight text-gray-800">
                {item.logbookName}
              </h1>
              {item.status && (() => {
                const cfg = getLogbookStatus(item.status)
                return (
                  <Tag color={cfg.color} className="m-0">
                    {cfg.label}
                  </Tag>
                )
              })()}
            </div>

            {(item.description || item.note) && (
              <p className="mb-2 text-sm text-gray-600 whitespace-pre-wrap">
                {item.description || item.note}
              </p>
            )}

            <div className="grid gap-3 mt-4 text-sm sm:grid-cols-2 md:grid-cols-3">
              <div className="flex items-center gap-2">
                <FileTextOutlined className="text-gray-400" />
                <span>
                  <span className="text-gray-500">Danh mục:</span>{' '}
                  <span className="font-medium text-gray-800">
                    {item.cropCatalogName || 'Chưa cập nhật'}
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <FileTextOutlined className="text-gray-400" />
                <span>
                  <span className="text-gray-500">Cây trồng:</span>{' '}
                  <span className="font-medium text-gray-800">
                    {item.cropName || 'Chưa cập nhật'}
                  </span>
                </span>
              </div>

              <div className="flex items-[baseline] gap-2">
                <EnvironmentOutlined className="text-gray-400 mt-1" />
                <span>
                  <span className="text-gray-500">Vùng trồng:</span>{' '}
                  {(() => {
                    const landPlots = getLandPlotsFromLogbook(item)
                    if (!landPlots.length) {
                      return <span className="font-medium text-gray-800">Chưa cập nhật</span>
                    }
                    return (
                      <span className="inline-flex flex-wrap items-center gap-1.5">
                        {landPlots.map((plot, idx) => (
                          <span key={plot.id || idx} className="inline-flex items-center">
                            {plot.id ? (
                              <button
                                onClick={() => navigate(ROUTER.FM_LAND_DETAIL.replace(':id', plot.id))}
                                className="font-medium text-green-600 hover:text-green-700 hover:underline"
                              >
                                {plot.name}
                              </button>
                            ) : (
                              <span className="font-medium text-gray-800">{plot.name}</span>
                            )}
                            {idx < landPlots.length - 1 && <span className="text-gray-400 ml-1">,</span>}
                          </span>
                        ))}
                      </span>
                    )
                  })()}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <CalendarOutlined className="text-gray-400" />
                <span>
                  <span className="text-gray-500">Thời gian:</span>{' '}
                  <span className="font-medium text-gray-800">
                    {item.startDate ? formatDate(item.startDate) : '...'} - {item.expectedEndDate || item.endDate ? formatDate(item.expectedEndDate || item.endDate) : '...'}
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-2 sm:col-span-2">
                <TeamOutlined className="text-gray-400" />
                <span>
                  <span className="text-gray-500">Người giám sát:</span>{' '}
                  <span className="font-medium text-gray-800">
                    {item.supervisorName || 'Chưa chỉ định'}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tab navigation */}
      <Card bordered={false} className="shadow-sm rounded-2xl">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
          className="farm-manager-tabs"
        />
      </Card>

      {/* Tab content */}
      {activeTab === 'official' ? (
        <OfficialLogbookTab item={item} stages={stages} />
      ) : (
        <TaskLogHistoryTab stages={stages} tasks={tasksMap} />
      )}
    </div>
  )
}

export default CultivationLogbookDetail
