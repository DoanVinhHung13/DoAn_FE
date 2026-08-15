/**
 * Farm Supervisor: Chi tiết Kế hoạch - Quản lý Giai đoạn & Công việc
 * Route: /farm-supervisor/cultivation-logbooks/:planId  (ROUTER.FS_CULTIVATION_LOGBOOK_DETAIL)
 */
import {
  ArrowLeftOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  SendOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Empty,
  Modal,
  Skeleton,
  Tabs,
  Tooltip,
  Typography,
} from 'antd'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'

import TitleCustom from 'src/components/TitleCustom'
import { PlanLogbookIcon } from 'src/assets/icon/menu/MenuIcons'
import { formatDate } from 'src/utils/dateFormatters'
import { getLandPlotsFromLogbook } from 'src/utils/helpers'
import ROUTER from 'src/router/ROUTER'
import CultivationLogbookService from 'src/services/CultivationLogbookService'
import { isNotFoundError } from 'src/services/core/apiError'
import QuarantineSummary from 'src/components/QuarantineSummary'

import StageTaskManagementTab from './components/StageTaskManagementTab'
import LogbookFinalizationTab from './components/LogbookFinalizationTab'
import TaskLogHistoryTab from './components/TaskLogHistoryTab'

const { Text } = Typography

const normalizeTabKey = value => {
  if (value === '2' || value === 'history') return '2'
  if (value === '3' || value === 'finalization' || value === 'closing') return '3'
  return '1'
}

// ── Main ──────────────────────────────────────────────────────────────────────
const FarmSupervisorPlanDetail = () => {
  const { planId } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [activeTabKey, setActiveTabKey] = useState(() =>
    normalizeTabKey(searchParams.get('tab')),
  )
  const [plan, setPlan] = useState(null)
  const [stages, setStages] = useState([])
  const [tasks, setTasks] = useState({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [submitModal, setSubmitModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const nextTabKey = normalizeTabKey(searchParams.get('tab'))
    setActiveTabKey(currentTabKey =>
      currentTabKey === nextTabKey ? currentTabKey : nextTabKey,
    )
  }, [searchParams])

  const handleTabChange = tabKey => {
    setActiveTabKey(tabKey)
    setSearchParams(
      currentParams => {
        const nextParams = new URLSearchParams(currentParams)
        if (tabKey === '3') nextParams.set('tab', 'finalization')
        else if (tabKey === '2') nextParams.set('tab', 'history')
        else nextParams.delete('tab')
        return nextParams
      },
      { replace: true },
    )
  }

  // ── Load ──────────────────────────────────────────────────────────────────
  const loadData = useCallback(async (isInitial = false) => {
    if (isInitial) {
      setLoading(true)
    }
    try {
      setLoadError(false)
      const planRes = await CultivationLogbookService.getById(planId, {
        errorHandling: 'component',
      })
      // Interceptor trả body: { success, data: plan }
      const planData = planRes?.data ?? planRes
      if (!planData) {
        navigate(ROUTER.FS_CULTIVATION_LOGBOOKS)
        return
      }

      const raw = planData.cultivationStages || planData.productionStages || planData.stages || []
      const stageData = Array.isArray(raw) ? raw : []

      const tasksMap = {}
      for (const stage of stageData) {
        tasksMap[stage.id] = Array.isArray(stage.tasks) ? stage.tasks : []
      }

      setPlan(planData)
      setStages(stageData)
      setTasks(tasksMap)
    } catch (error) {
      if (isNotFoundError(error)) {
        navigate(ROUTER.FS_CULTIVATION_LOGBOOKS)
        return
      }
      setPlan(null)
      setStages([])
      setTasks({})
      setLoadError(true)
    } finally {
      setLoading(false)
    }
  }, [navigate, planId])

  useEffect(() => { loadData(true) }, [loadData])

  // ── Derived ───────────────────────────────────────────────────────────────
  const allStagesCompleted = useMemo(
    () => stages.length > 0 && stages.every((s) => s.status === 'COMPLETED'),
    [stages]
  )

  // Keep the BE review status, but the FE flow treats a submitted plan as completed.
  const isPlanCompleted = plan?.status === 'COMPLETED' || plan?.reviewStatus === 'WAITING_APPROVAL'

  const quarantineWarnings = useMemo(
    () => Object.values(tasks).flatMap(taskList =>
      taskList.flatMap(task => Array.isArray(task.quarantineWarnings) ? task.quarantineWarnings : []),
    ),
    [tasks],
  )

  const canSubmit = useMemo(
    () => !isPlanCompleted && allStagesCompleted,
    [isPlanCompleted, allStagesCompleted]
  )

  const handleSubmitLogbook = async () => {
    try {
      setSubmitting(true)
      await CultivationLogbookService.submitCompletion(planId)
      setSubmitModal(false)
      navigate(ROUTER.FS_CULTIVATION_LOGBOOKS)
    } finally {
      setSubmitting(false)
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton active paragraph={{ rows: 2 }} />
        <Card bordered={false} className="shadow-sm rounded-2xl">
          <Skeleton active paragraph={{ rows: 10 }} />
        </Card>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="space-y-4">
        <Alert
          type="error"
          message="Không thể tải chi tiết kế hoạch."
          action={<Button size="small" onClick={() => loadData(true)}>Thử lại</Button>}
          className="rounded-xl"
        />
        <Button onClick={() => navigate(ROUTER.FS_CULTIVATION_LOGBOOKS)}>Quay lại</Button>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="py-16 text-center">
        <Empty description="Không tìm thấy kế hoạch." />
        <Button onClick={() => navigate(ROUTER.FS_CULTIVATION_LOGBOOKS)} className="mt-4">Quay lại</Button>
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTER.FS_CULTIVATION_LOGBOOKS)}>
            Quay lại
          </Button>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <PlanLogbookIcon style={{ fontSize: '24px', color: '#15803d' }} />
            Chi tiết Kế hoạch
          </TitleCustom>
        </div>
        {!isPlanCompleted && (
          <Tooltip
            title={
              !canSubmit
                ? 'Hoàn thành tất cả các giai đoạn trước khi gửi.'
                : ''
            }
          >
            <Button
              type="primary"
              icon={<SendOutlined />}
              disabled={!canSubmit}
              onClick={() => setSubmitModal(true)}
              className="h-10 px-5 font-semibold bg-green-600 border-0 rounded-xl shadow-md shadow-green-100"
            >
              Gửi nhật ký lên quản lý nông trại
            </Button>
          </Tooltip>
        )}
      </div>

      {/* ── Info Card ───────────────────────────────────────────────────────── */}
      <Card bordered className="border-gray-200 shadow-sm rounded-2xl">
        <Text className="text-xl font-bold text-gray-800 block mb-3">
          {plan.logbookName}
        </Text>
        <Descriptions size="small" column={{ xs: 1, sm: 2, md: 3, lg: 4 }} colon>
          <Descriptions.Item label={<span className="text-gray-500"><BookOutlined className="mr-1" />Danh mục</span>}>
            <Text strong>{plan.cropCatalogName || plan.cropCategoryName || '—'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label={<span className="text-gray-500"><BookOutlined className="mr-1" />Cây trồng</span>}>
            <Text strong>{plan.cropName || '—'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label={<span className="text-gray-500"><EnvironmentOutlined className="mr-1" />Vùng trồng</span>}>
            {(() => {
              const landPlots = getLandPlotsFromLogbook(plan)
              if (!landPlots.length) return <Text strong>—</Text>
              return (
                <span className="inline-flex flex-wrap items-center gap-1.5">
                  {landPlots.map((plot, idx) => (
                    <span key={plot.id || idx} className="inline-flex items-center">
                      {plot.id ? (
                        <Button
                          type="link"
                          onClick={() => navigate(ROUTER.FS_LAND_DETAIL.replace(':id', plot.id))}
                          className="p-0 h-auto font-medium text-green-600 hover:text-green-700 hover:underline"
                        >
                          {plot.name}
                        </Button>
                      ) : (
                        <Text strong>{plot.name}</Text>
                      )}
                      {idx < landPlots.length - 1 && <span className="text-gray-400 ml-1">,</span>}
                    </span>
                  ))}
                </span>
              )
            })()}
          </Descriptions.Item>
          <Descriptions.Item label={<span className="text-gray-500"><UserOutlined className="mr-1" />Giám sát</span>}>
            <Text strong>{plan.supervisorName || '—'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label={<span className="text-gray-500"><CalendarOutlined className="mr-1" />Thời gian</span>} span={2}>
            <Text strong>
              {plan.startDate ? formatDate(plan.startDate) : '—'} – {plan.expectedEndDate ? formatDate(plan.expectedEndDate) : 'Chưa kết thúc'}
            </Text>
          </Descriptions.Item>
        </Descriptions>

        {/* Lý do từ chối */}
        {plan.reviewStatus === 'REJECTED' && plan.rejectionReason && (
          <Alert
            className="mt-4 rounded-xl"
            type="error"
            message={
              <span className="font-semibold text-red-700">Lý do từ chối duyệt</span>
            }
            description={
              <span className="text-red-600 whitespace-pre-line break-words [overflow-wrap:anywhere]">{plan.rejectionReason}</span>
            }
          />
        )}
      </Card>

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <QuarantineSummary warnings={quarantineWarnings} />

      <Tabs
        activeKey={activeTabKey}
        onChange={handleTabChange}
        type="card"
        className="plan-tabs mt-4"
        items={[
          {
            key: '1',
            label: <span className="px-4 font-medium"><EnvironmentOutlined className="mr-2" />Quản lý công việc</span>,
            children: activeTabKey === '1' && (
              <StageTaskManagementTab plan={plan} planId={planId} stages={stages} tasks={tasks} loadData={loadData} />
            ),
          },
          {
            key: '2',
            label: <span className="px-4 font-medium"><FileTextOutlined className="mr-2" />Lịch sử ghi nhật ký</span>,
            children: activeTabKey === '2' && (
              <TaskLogHistoryTab stages={stages} tasks={tasks} />
            ),
          },
          {
            key: '3',
            label: <span className="px-4 font-medium"><CheckCircleOutlined className="mr-2" />Chốt nhật ký</span>,
            children: activeTabKey === '3' && (
              <LogbookFinalizationTab planId={planId} stages={stages} tasks={tasks} loadData={loadData} plan={plan} />
            ),
          },
        ]}
      />



      {/* ── Modal: Xác nhận gửi nhật ký ─────────────────────────────────────── */}
      <Modal
        open={submitModal}
        onCancel={() => setSubmitModal(false)}
        title={
          <div className="flex items-center gap-2 text-green-700">
            <SendOutlined />
            Gửi nhật ký lên quản lý nông trại
          </div>
        }
        onOk={handleSubmitLogbook}
        okText="Xác nhận gửi"
        cancelText="Hủy"
        confirmLoading={submitting}
        okButtonProps={{ className: 'bg-green-600' }}
      >
        <Alert
          message="Bạn có chắc muốn gửi toàn bộ nhật ký canh tác lên quản lý nông trại không?"
          type="warning"
          className="rounded-xl"
        />
      </Modal>
    </div>
  )
}

export default FarmSupervisorPlanDetail
