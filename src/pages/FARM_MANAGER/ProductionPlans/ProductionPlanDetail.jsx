import {
  ArrowLeftOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  EditOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  TeamOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Empty,
  Skeleton,
  Tag,
  Typography,
  message,
} from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import TitleCustom from 'src/components/TitleCustom'
import ROUTER from 'src/router/ROUTER'
import ProductionPlanService from 'src/services/CultivationLogbookService'
import CultivationTaskService from 'src/services/CultivationTaskService'
import { formatDate, formatDateTime } from 'src/utils/dateFormatters'

const { Text } = Typography

const PLAN_STATUS = {
  DRAFT: { label: 'Bản nháp', color: 'default' },
  PLANNED: { label: 'Đã lên kế hoạch', color: 'blue' },
  IN_PROGRESS: { label: 'Đang thực hiện', color: 'gold' },
  COMPLETED: { label: 'Đã hoàn thành', color: 'green' },
  CANCELLED: { label: 'Đã hủy', color: 'red' },
}

const REVIEW_STATUS = {
  DRAFT: { label: 'Chưa gửi duyệt', color: 'default' },
  PENDING: { label: 'Chờ duyệt', color: 'gold' },
  PENDING_REVIEW: { label: 'Chờ duyệt', color: 'gold' },
  APPROVED: { label: 'Đã duyệt', color: 'green' },
  REJECTED: { label: 'Bị từ chối', color: 'red' },
}

const SectionTitle = ({ children, extra }) => (
  <div className="flex items-center justify-between gap-3 mb-5">
    <div className="flex items-center gap-3">
      <span className="w-1 h-6 bg-green-500 rounded-full" />
      <h3 className="m-0 text-base font-bold text-gray-800">{children}</h3>
    </div>
    {extra}
  </div>
)

const EmptyValue = ({ children }) =>
  children || <span className="text-gray-400">Chưa cập nhật</span>

const StatusTag = ({ value, config }) => {
  const status = config[value] || {
    label: value || 'Chưa cập nhật',
    color: 'default',
  }
  return (
    <Tag color={status.color} className="px-3 py-1 m-0 font-semibold rounded-full">
      {status.label}
    </Tag>
  )
}

const getStageName = (stage, index) =>
  stage.stageName || stage.title || stage.name || `Giai đoạn ${index + 1}`

const getStageNote = (stage) => stage.note || stage.description

const getTaskName = (task, index) =>
  task.taskName || task.title || task.name || `Công việc ${index + 1}`

const ProductionPlanDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [initialLoading, setInitialLoading] = useState(true)
  const [item, setItem] = useState(null)

  useEffect(() => {
    let isMounted = true

    const fetchDetail = async () => {
      try {
        setInitialLoading(true)
        const response = await ProductionPlanService.getById(id)
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
                task.productionPlanId ||
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

  const stages =
    item.cultivationStages || item.productionStages || item.stages || []
  const tasks = item.tasks || []

  return (
    <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
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

      <div className="relative overflow-hidden bg-gradient-to-br from-green-600 via-green-600 to-emerald-700 shadow-lg rounded-3xl shadow-green-100">
        <div className="absolute w-48 h-48 rounded-full pointer-events-none -right-12 -top-20 bg-white/10" />
        <div className="absolute w-32 h-32 rounded-full pointer-events-none right-32 -bottom-20 bg-white/5" />
        <div className="relative p-6 md:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-3 text-sm font-semibold text-green-100">
                <CalendarOutlined />
                <span>Nhật ký canh tác</span>
              </div>
              <h1 className="max-w-4xl m-0 text-2xl font-bold leading-tight text-white md:text-3xl">
                  {item.planName || item.name || 'Chưa đặt tên nhật ký'}
              </h1>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-sm text-green-50">
                <span>
                  <EnvironmentOutlined className="mr-2" />
                  {item.landPlotName || 'Chưa chọn vùng trồng'}
                </span>
                <span>
                  <TeamOutlined className="mr-2" />
                  {item.supervisorName || 'Chưa chỉ định người giám sát'}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap flex-none gap-2">
              <div className="px-1 py-1 rounded-full bg-white/95">
                <StatusTag value={item.status} config={PLAN_STATUS} />
              </div>
              <div className="px-1 py-1 rounded-full bg-white/95">
                <StatusTag value={item.reviewStatus} config={REVIEW_STATUS} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card bordered={false} className="shadow-sm rounded-2xl">
            <SectionTitle>Thông tin nhật ký</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  label: 'Cây trồng',
                  value: item.cropName,
                  icon: <FileTextOutlined />,
                },
                {
                  label: 'Nông dân thực hiện',
                  value:
                    item.farmerNames?.join?.(', ') ||
                    item.farmers
                      ?.map(
                        (farmer) =>
                          farmer.fullName || farmer.name || farmer.email
                      )
                      .filter(Boolean)
                      .join(', '),
                  icon: <TeamOutlined />,
                },
                {
                  label: 'Ngày bắt đầu',
                  value: item.startDate ? formatDate(item.startDate) : null,
                  icon: <CalendarOutlined />,
                },
                {
                  label: 'Kết thúc dự kiến',
                  value: item.expectedEndDate
                    ? formatDate(item.expectedEndDate)
                    : null,
                  icon: <ClockCircleOutlined />,
                },
                {
                  label: 'Kết thúc thực tế',
                  value: item.actualEndDate
                    ? formatDate(item.actualEndDate)
                    : 'Chưa hoàn thành',
                  icon: <ClockCircleOutlined />,
                },
              ].map((field) => (
                <div
                  key={field.label}
                  className="flex min-w-0 gap-3 p-4 border border-gray-100 rounded-2xl bg-gray-50/70"
                >
                  <div className="flex items-center justify-center flex-none w-10 h-10 text-green-600 bg-green-100 rounded-xl">
                    {field.icon}
                  </div>
                  <div className="min-w-0">
                    <p className="mb-1 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                      {field.label}
                    </p>
                    <div
                      className="text-sm font-semibold text-gray-800 break-words"
                      title={field.value || ''}
                    >
                      <EmptyValue>{field.value}</EmptyValue>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card bordered={false} className="shadow-sm rounded-2xl">
            <SectionTitle>Giai đoạn canh tác</SectionTitle>
            {stages.length ? (
              <div>
                {stages.map((stage, index) => (
                  <div
                    key={stage.id || `${getStageName(stage, index)}-${index}`}
                    className="relative flex gap-4 pb-6 last:pb-0"
                  >
                    {index < stages.length - 1 && (
                      <div className="absolute w-px bg-green-100 left-5 top-10 bottom-0" />
                    )}
                    <div className="relative z-10 flex items-center justify-center flex-none w-10 h-10 font-bold text-white bg-green-600 rounded-full shadow-md shadow-green-100">
                      {stage.order || index + 1}
                    </div>
                    <div className="flex-1 min-w-0 p-4 -mt-1 border border-gray-100 rounded-2xl bg-gray-50/60">
                      <Text strong className="text-base text-gray-800">
                        {getStageName(stage, index)}
                      </Text>
                      {getStageNote(stage) && (
                        <p className="mt-2 mb-0 text-sm leading-relaxed text-gray-600 whitespace-pre-wrap">
                          {getStageNote(stage)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Nhật ký chưa có giai đoạn canh tác"
              />
            )}
          </Card>

          <Card bordered={false} className="shadow-sm rounded-2xl">
            <SectionTitle>Công việc trong nhật ký</SectionTitle>
            {tasks.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {tasks.map((task, index) => (
                  <div
                    key={task.id || `${getTaskName(task, index)}-${index}`}
                    className="p-4 transition-shadow border border-gray-100 rounded-2xl bg-gray-50/60 hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <Text strong>{getTaskName(task, index)}</Text>
                      {task.status && (
                        <Tag className="m-0">{task.status}</Tag>
                      )}
                    </div>
                    {(task.startDate || task.dueDate || task.endDate) && (
                      <p className="mt-2 mb-0 text-xs text-gray-500">
                        <ClockCircleOutlined className="mr-1" />
                        {task.startDate ? formatDate(task.startDate) : '...'}
                        {' — '}
                        {task.dueDate || task.endDate
                          ? formatDate(task.dueDate || task.endDate)
                          : '...'}
                      </p>
                    )}
                    {task.description && (
                      <p className="mt-2 mb-0 text-sm text-gray-600">
                        {task.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Nhật ký chưa có công việc"
              />
            )}
          </Card>
        </div>

        <div className="space-y-6 xl:sticky xl:top-6">
          <Card bordered={false} className="shadow-sm rounded-2xl">
            <SectionTitle>Thông tin xét duyệt</SectionTitle>
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <span className="text-sm text-gray-500">Trạng thái</span>
                <StatusTag value={item.reviewStatus} config={REVIEW_STATUS} />
              </div>
              {[
                {
                  label: 'Gửi duyệt',
                  value: item.submittedAt
                    ? formatDateTime(item.submittedAt)
                    : 'Chưa gửi duyệt',
                },
                {
                  label: 'Xét duyệt',
                  value: item.reviewedAt
                    ? formatDateTime(item.reviewedAt)
                    : 'Chưa xét duyệt',
                },
                {
                  label: 'Người xét duyệt',
                  value:
                    item.reviewedByName ||
                    item.reviewerName ||
                    item.reviewedBy ||
                    'Chưa chỉ định',
                },
              ].map((field) => (
                <div key={field.label}>
                  <p className="mb-1 text-xs font-semibold tracking-wide text-gray-400 uppercase">
                    {field.label}
                  </p>
                  <p className="m-0 text-sm font-medium text-gray-700 break-words">
                    {field.value}
                  </p>
                </div>
              ))}
              {item.rejectionReason && (
                <div className="p-3 text-sm text-red-700 border border-red-100 rounded-xl bg-red-50">
                  <p className="mb-1 font-semibold">Lý do từ chối</p>
                  <p className="m-0">{item.rejectionReason}</p>
                </div>
              )}
            </div>
          </Card>

          <Card bordered={false} className="shadow-sm rounded-2xl">
            <SectionTitle>Mô tả nhật ký</SectionTitle>
            <div className="text-sm leading-6 text-gray-600 whitespace-pre-wrap">
              {item.description || (
                <span className="italic text-gray-400">
                  Chưa có mô tả cho nhật ký này.
                </span>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default ProductionPlanDetail
