import {
  ArrowLeftOutlined,
  CalendarOutlined,
  EditOutlined,
  EnvironmentOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  HistoryOutlined,
  FileTextOutlined,
  QrcodeOutlined,
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
import CultivationStageService from 'src/services/CultivationStageService'
import GenerateQrModal from 'src/components/QrCode/GenerateQrModal'


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
  const [qrModalOpen, setQrModalOpen] = useState(false)
  const [approving, setApproving] = useState(false)

  const handleApproveReview = async () => {
    if (!stages.length) {
      message.error('Chưa có giai đoạn canh tác nào để duyệt.')
      return
    }
    const lastStage = stages[stages.length - 1]
    try {
      setApproving(true)
      await CultivationStageService.approveReview(lastStage.id, { comment: 'Đạt yêu cầu' })
      message.success('Manager đã duyệt hoàn thành quy trình canh tác thành công!')
      setItem((prev) => (prev ? { ...prev, status: 'COMPLETED' } : prev))
    } catch (err) {
      console.error(err)
      message.error(err?.response?.data?.message || err?.message || 'Duyệt thất bại.')
    } finally {
      setApproving(false)
    }
  }

  useEffect(() => {
    let isMounted = true

    const fetchDetail = async () => {
      try {
        setInitialLoading(true)

        // 1.1 Lấy thông tin logbook (không lấy cultivationStages từ đây)
        const response = await CultivationLogbookService.getById(id)
        if (response?.success === false || !response?.data) {
          message.error('Không tìm thấy nhật ký canh tác')
          navigate(ROUTER.FM_PRODUCTION_PLANS)
          return
        }

        const plan = response.data
        const planTasks = plan.tasks || plan.cultivationTasks || []

        if (!isMounted) return
        // Lưu thông tin logbook nhưng bỏ cultivationStages
        setItem({ ...plan, tasks: planTasks })

        // 1.2 Lấy stages riêng bằng API cultivation-stages/logbook/{logbookId}
        try {
          const stagesResponse = await CultivationStageService.getByLogbookId(id)
          if (isMounted && stagesResponse?.data) {
            const stagesData = Array.isArray(stagesResponse.data)
              ? stagesResponse.data
              : stagesResponse.data?.data || stagesResponse.data?.items || []
            setStages(stagesData)
          }
        } catch (stageErr) {
          console.error('Lỗi khi lấy giai đoạn canh tác:', stageErr)
        }

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
      children: <OfficialLogbookTab item={item} stages={stages} />,
    },
    {
      key: 'process',
      label: (
        <span className="flex items-center gap-2">
          <HistoryOutlined />
          Lịch sử ghi Log
        </span>
      ),
      children: <TaskLogHistoryTab stages={stages} tasks={tasksMap} />,
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
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            loading={approving}
            onClick={handleApproveReview}
            className="h-10 px-4 font-semibold bg-emerald-600 border-0 shadow-md rounded-xl shadow-emerald-100"
          >
            Duyệt kết thúc quy trình
          </Button>

          <Button
            icon={<QrcodeOutlined />}
            onClick={() => setQrModalOpen(true)}
            className="h-10 px-4 font-semibold border-emerald-600 text-emerald-700 rounded-xl hover:bg-emerald-50"
          >
            Tạo Mã QR Traceability
          </Button>

          <Button
            type="default"
            icon={<EditOutlined />}
            className="h-10 px-4 font-semibold rounded-xl"
            onClick={() =>
              navigate(ROUTER.FM_PRODUCTION_PLAN_EDIT.replace(':id', item.id))
            }
          >
            Sửa nhật ký
          </Button>
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

            <div className="grid gap-3 mt-4 text-sm sm:grid-cols-2">
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

      {/* QR Generation Modal */}
      <GenerateQrModal
        open={qrModalOpen}
        onCancel={() => setQrModalOpen(false)}
        batchId={item.productBatchId || item.harvestBatchId || item.id}
        batchName={item.logbookName || item.batchName}
      />
    </div>
  )
}

export default CultivationLogbookDetail

