import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  OrderedListOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Empty,
  Progress,
  Skeleton,
  Tag,
  Typography,
  message,
} from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'

import ROUTER from 'src/router/ROUTER'
import ProductionPlanService from 'src/services/CultivationLogbookService'
import ProductionStageService from 'src/services/ProductionStageService'
import { formatDate } from 'src/utils/dateFormatters'

const { Text } = Typography

const itemsOf = (response) => {
  const payload = response?.data ?? response
  const data = payload?.data ?? payload
  return Array.isArray(data) ? data : data?.items || []
}

const stageStatus = (status) => {
  const value = String(status || '').toUpperCase()
  if (['COMPLETED', 'DONE'].includes(value)) {
    return { label: 'Hoàn thành', color: 'success', dot: 'bg-green-500' }
  }
  if (['IN_PROGRESS', 'ACTIVE'].includes(value)) {
    return {
      label: 'Đang thực hiện',
      color: 'processing',
      dot: 'bg-green-700',
    }
  }
  return { label: 'Chưa bắt đầu', color: 'default', dot: 'bg-gray-300' }
}

const LogbookDetail = () => {
  const navigate = useNavigate()
  const { planId } = useParams()
  const user = useSelector((state) => state.appGlobal.userInfo)
  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState(null)
  const [stages, setStages] = useState([])

  const load = useCallback(async () => {
    if (planId.startsWith('mock-')) {
      setPlan({ ...MOCK_SUPERVISOR_PLAN, isMock: true })
      setStages(MOCK_SUPERVISOR_STAGES)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const [planResponse, stageResponse] = await Promise.all([
        ProductionPlanService.getById(planId),
        ProductionStageService.getAll({
          PageIndex: 1,
          PageSize: 1000,
          CultivationLogbookId: planId,
        }),
      ])
      setPlan(planResponse?.data ?? planResponse)
      setStages(
        itemsOf(stageResponse)
          .filter(
            (stage) =>
              String(
                stage.cultivationLogbookId || stage.productionPlanId || ''
              ) === String(planId)
          )
          .sort(
            (first, second) =>
              new Date(first.startDate || 0) -
              new Date(second.startDate || 0)
          )
      )
    } catch (error) {
      message.error(error.message || 'Không thể tải chi tiết nhật ký.')
    } finally {
      setLoading(false)
    }
  }, [planId])

  useEffect(() => {
    load()
  }, [load])

  const completedCount = stages.filter((stage) =>
    ['COMPLETED', 'DONE'].includes(String(stage.status || '').toUpperCase())
  ).length
  const progressPercent = stages.length
    ? Math.round((completedCount / stages.length) * 100)
    : 0

  if (loading) {
    return (
      <Card className="rounded-2xl">
        <Skeleton active paragraph={{ rows: 14 }} />
      </Card>
    )
  }

  return (
    <div className="space-y-5 duration-500 animate-in fade-in slide-in-from-bottom-3">
      <Button
        type="text"
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(ROUTER.FS_LOGBOOKS)}
        className="h-9 px-0 font-semibold text-gray-600 hover:!bg-transparent hover:!text-green-700"
      >
        Quay lại danh sách
      </Button>

      <section className="relative overflow-hidden text-white shadow-lg rounded-3xl bg-gradient-to-br from-green-800 via-green-700 to-emerald-600 shadow-green-100">
        <div className="absolute w-64 h-64 rounded-full pointer-events-none -right-20 -top-24 bg-white/10" />
        <div className="relative grid gap-6 p-6 lg:grid-cols-[1fr_280px] lg:p-7">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                <span className="w-2 h-2 bg-green-300 rounded-full" />
                Đang canh tác
              </span>
              {plan?.isMock && (
                <span className="px-3 py-1 text-xs font-semibold text-blue-700 rounded-full bg-blue-50">
                  Dữ liệu mẫu
                </span>
              )}
            </div>

            <h1 className="mt-4 mb-2 text-2xl font-bold text-white md:text-3xl">
              {plan?.planName || 'Nhật ký chưa đặt tên'}
            </h1>
            <p className="max-w-2xl mt-0 mb-6 text-sm text-green-100">
              Theo dõi tiến độ và ghi nhận công việc thực tế theo từng giai đoạn
              canh tác.
            </p>

            <div className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
              <div className="flex items-center gap-3 p-3 border bg-white/10 rounded-xl border-white/10">
                <UserOutlined className="text-lg text-green-200" />
                <div>
                  <div className="text-xs text-green-200">Người giám sát</div>
                  <div className="font-semibold text-white">
                    {plan?.supervisorName ||
                      user?.fullName ||
                      user?.name ||
                      '—'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border bg-white/10 rounded-xl border-white/10">
                <EnvironmentOutlined className="text-lg text-green-200" />
                <div>
                  <div className="text-xs text-green-200">Vùng trồng</div>
                  <div className="font-semibold text-white">
                    {plan?.landPlotName || '—'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border bg-white/10 rounded-xl border-white/10">
                <FileTextOutlined className="text-lg text-green-200" />
                <div>
                  <div className="text-xs text-green-200">Cây trồng</div>
                  <div className="font-semibold text-white">
                    {plan?.cropName || '—'}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 border bg-white/10 rounded-xl border-white/10">
                <CalendarOutlined className="text-lg text-green-200" />
                <div>
                  <div className="text-xs text-green-200">Thời gian</div>
                  <div className="font-semibold text-white">
                    {plan?.startDate ? formatDate(plan.startDate) : '—'} –{' '}
                    {plan?.expectedEndDate
                      ? formatDate(plan.expectedEndDate)
                      : '—'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center p-5 border bg-white/10 rounded-2xl border-white/15 backdrop-blur-sm">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xs font-semibold tracking-wide text-green-100 uppercase">
                  Tiến độ quy trình
                </div>
                <div className="mt-1 text-3xl font-bold text-white">
                  {progressPercent}%
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-white">
                  {completedCount}/{stages.length}
                </div>
                <div className="text-xs text-green-200">giai đoạn hoàn thành</div>
              </div>
            </div>
            <Progress
              percent={progressPercent}
              showInfo={false}
              strokeColor="#ffffff"
              trailColor="rgba(255,255,255,.2)"
              className="mt-3"
            />
            <div className="flex justify-between pt-4 mt-4 text-xs text-green-100 border-t border-white/15">
              <span>
                <ClockCircleOutlined className="mr-1" />
                Bắt đầu {plan?.startDate ? formatDate(plan.startDate) : '—'}
              </span>
            </div>
          </div>
        </div>
      </section>

      <Card
        bordered={false}
        className="border border-gray-100 shadow-sm rounded-3xl"
        title={
          <div className="flex flex-wrap items-center justify-between gap-3 py-1">
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-10 h-10 text-green-700 rounded-xl bg-green-50">
                <OrderedListOutlined />
              </span>
              <div>
                <div className="font-bold text-gray-900">Lộ trình canh tác</div>
                <Text type="secondary" className="text-xs font-normal">
                  Chọn giai đoạn đang thực hiện để ghi chép
                </Text>
              </div>
            </div>
            <Tag color="green" className="px-3 py-1 m-0 rounded-full">
              {stages.length} giai đoạn
            </Tag>
          </div>
        }
      >
        {stages.length ? (
          <div className="relative space-y-3 before:absolute before:bottom-6 before:left-[23px] before:top-6 before:w-px before:bg-green-100">
            {stages.map((stage, index) => {
              const status = stageStatus(stage.status)
              const isActive = status.label === 'Đang thực hiện'
              const isCompleted = status.label === 'Hoàn thành'
              const canOpen = isActive || isCompleted

              return (
                <div
                  key={stage.id || index}
                  className="relative z-10 flex items-stretch gap-4"
                >
                  <div
                    className={`mt-4 flex h-12 w-12 flex-none items-center justify-center rounded-full border-4 border-white text-sm font-bold shadow-sm ${
                      isCompleted
                        ? 'bg-green-500 text-white'
                        : isActive
                          ? 'bg-green-700 text-white ring-4 ring-green-100'
                          : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {isCompleted ? <CheckCircleFilled /> : index + 1}
                  </div>

                  <button
                    type="button"
                    disabled={!canOpen}
                    onClick={() => {
                      if (!canOpen) return
                      navigate(
                        ROUTER.FS_STAGE_LOG
                          .replace(':planId', planId)
                          .replace(':stageId', stage.id)
                      )
                    }}
                    className={`group flex min-w-0 flex-1 items-center justify-between gap-4 rounded-2xl border p-4 text-left transition ${
                      isActive
                        ? 'border-green-300 bg-green-50/70 shadow-sm hover:shadow-md'
                        : isCompleted
                          ? 'border-gray-200 bg-white hover:border-green-300 hover:shadow-sm'
                          : 'cursor-not-allowed border-gray-100 bg-gray-50/60 opacity-70'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="m-0 text-base font-bold text-gray-900">
                          {stage.stageName}
                        </h3>
                        <Tag
                          color={status.color}
                          className="m-0 rounded-full"
                        >
                          {status.label}
                        </Tag>
                      </div>
                      <div className="mt-1 text-xs font-medium text-gray-500">
                        <CalendarOutlined className="mr-1" />
                        {stage.startDate
                          ? formatDate(stage.startDate)
                          : '...'}{' '}
                        – {stage.endDate ? formatDate(stage.endDate) : '...'}
                      </div>
                      {stage.note && (
                        <p className="mt-2 mb-0 text-sm leading-6 text-gray-600 line-clamp-2">
                          {stage.note}
                        </p>
                      )}
                    </div>

                    <div className="flex-none">
                      {canOpen ? (
                        <span
                          className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${
                            isActive
                              ? 'bg-green-700 text-white'
                              : 'bg-gray-50 text-green-700 group-hover:bg-green-50'
                          }`}
                        >
                          {isActive ? 'Ghi chép' : 'Xem lại'}
                          <ArrowRightOutlined />
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-gray-400">
                          Chưa đến giai đoạn
                        </span>
                      )}
                    </div>
                  </button>
                </div>
              )
            })}
          </div>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Nhật ký chưa có giai đoạn canh tác"
          />
        )}
      </Card>
    </div>
  )
}

export default LogbookDetail
