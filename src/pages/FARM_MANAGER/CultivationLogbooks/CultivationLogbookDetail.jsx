import {
  ArrowLeftOutlined,
  CalendarOutlined,
  EditOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  HistoryOutlined,
  FileTextOutlined,
  ExperimentOutlined,
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
import CultivationTaskService from 'src/services/CultivationTaskService'

// Import các Tab components
import ProcessTab from './components/ProcessTab'
import OfficialLogbookTab from './components/OfficialLogbookTab'
import { formatDate } from 'src/utils/dateFormatters'


const CultivationLogbookDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [initialLoading, setInitialLoading] = useState(true)
  const [item, setItem] = useState(null)
  const [activeTab, setActiveTab] = useState('official')

  useEffect(() => {
    let isMounted = true

    const fetchDetail = async () => {
      try {
        setInitialLoading(true)
        const response = await CultivationLogbookService.getById(id)
        if (response?.success === false || !response?.data) {
          message.error('Không tìm thấy nhật ký canh tác')
          navigate(ROUTER.FM_PRODUCTION_PLANS)
          return
        }

        const plan = response.data
        let planTasks = plan.tasks || plan.cultivationTasks || []
        try {
          const taskResponse = await CultivationTaskService.getAll({
            PageIndex: 1,
            PageSize: 1000,
          })
          const taskPayload = taskResponse?.data?.data ?? taskResponse?.data
          const allTasks = Array.isArray(taskPayload)
            ? taskPayload
            : taskPayload?.items || []
          const tasksByLogbook = allTasks.filter(
            (task) =>
              (task.cultivationLogbookId ||
                task.CultivationLogbookId ||
                task.logbookId) === id
          )
          if (tasksByLogbook.length) planTasks = tasksByLogbook
        } catch (error) {
          console.error('Không thể lấy công việc canh tác:', error)
        }
        if (!isMounted) return
        setItem({ ...plan, tasks: planTasks })

      } catch {
        message.error('Lấy thông tin nhật ký canh tác thất bại')
        navigate(ROUTER.FM_PRODUCTION_PLANS)
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

  const tabItems = [
    {
      key: 'official',
      label: (
        <span className="flex items-center gap-2">
          <CheckCircleOutlined />
          Nhật ký chính thức
        </span>
      ),
      children: <OfficialLogbookTab item={item} />,
    },
    {
      key: 'process',
      label: (
        <span className="flex items-center gap-2">
          <ExperimentOutlined />
          Tiến trình thực tế
        </span>
      ),
      children: <ProcessTab item={item} />,
    },
  ]

  return (
    <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTER.FM_PRODUCTION_PLANS)}
          >
            Quay lại
          </Button>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <CalendarOutlined className="text-green-600" />
            Chi tiết Nhật ký canh tác
          </TitleCustom>
        </div>
        <Button
          type="primary"
          icon={<EditOutlined />}
          className="h-10 px-5 font-semibold bg-green-600 border-0 shadow-md rounded-xl shadow-green-100"
          onClick={() =>
            navigate(ROUTER.FM_PRODUCTION_PLAN_EDIT.replace(':id', item.id))
          }
        >
          Sửa nhật ký
        </Button>
      </div>

      {/* Hero Card */}
      <Card bordered={true} className="border-gray-200 shadow-sm rounded-2xl">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1">

            <div className="flex items-center gap-3 mb-2">
              <h1 className="max-w-4xl m-0 text-xl font-bold leading-tight text-gray-800">
                {item.planName || item.name || item.logbookName || 'Chưa đặt tên nhật ký'}
              </h1>
              {item.status && (
                <Tag color={
                  item.status === 'COMPLETED' ? 'green' :
                  item.status === 'IN_PROGRESS' ? 'blue' :
                  item.status === 'DRAFT' ? 'default' :
                  item.status === 'CANCELED' ? 'red' : 'orange'
                } className="m-0">
                  {item.status === 'COMPLETED' ? 'Hoàn thành' :
                   item.status === 'IN_PROGRESS' ? 'Đang thực hiện' :
                   item.status === 'DRAFT' ? 'Bản nháp' :
                   item.status === 'CANCELED' ? 'Đã hủy' : item.status}
                </Tag>
              )}
            </div>

            {(item.description || item.note) && (
              <p className="mb-2 text-sm text-gray-600 whitespace-pre-wrap">
                {item.description || item.note}
              </p>
            )}

            <div className="grid gap-3 mt-4 text-sm sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <FileTextOutlined className="text-gray-400" />
                <span>
                  <span className="text-gray-500">Danh mục:</span>{' '}
                  <span className="font-medium text-gray-800">
                    {item.cropCatalogName || item.cropCategoryName || 'Chưa cập nhật'}
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

              <div className="flex items-center gap-2">
                <EnvironmentOutlined className="text-gray-400" />
                <span>
                  <span className="text-gray-500">Vùng trồng:</span>{' '}
                  {item.landPlotId ? (
                    <button
                      onClick={() => navigate(`/farm-manager/land-plots/${item.landPlotId}`)}
                      className="font-medium text-green-600 hover:text-green-700 hover:underline"
                    >
                      {item.landPlotName || item.fieldName || 'Xem vùng trồng'}
                    </button>
                  ) : (
                    <span className="font-medium text-gray-800">
                      {item.landPlotName || 'Chưa cập nhật'}
                    </span>
                  )}
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

          <div className="flex flex-col items-end flex-none min-w-[180px] border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6">
            <p className="mb-2 text-sm font-semibold text-gray-500">Tiến độ thực tế</p>
            <div className="w-full h-2 mb-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-600 rounded-full transition-all"
                style={{ width: `${item.progress || item.completionRate || 0}%` }}
              />
            </div>
            <p className="text-lg font-bold text-green-600 m-0">
              {item.progress || item.completionRate || 0}%
            </p>
          </div>
        </div>
      </Card>

      {/* Tabs Content */}
      <Card bordered={false} className="shadow-sm rounded-2xl">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
          className="farm-manager-tabs"
        />
      </Card>
    </div>
  )
}

export default CultivationLogbookDetail

