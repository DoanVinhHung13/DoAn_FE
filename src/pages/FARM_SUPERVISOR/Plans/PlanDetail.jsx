/**
 * Farm Supervisor: Chi tiết Kế hoạch - Quản lý Giai đoạn & Công việc
 * Route: /farm-supervisor/plans/:planId  (ROUTER.FS_PLAN_DETAIL)
 */
import {
  ArrowLeftOutlined,
  BookOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  FileTextOutlined,
  PlusOutlined,
  SendOutlined,
  TeamOutlined,
  UserOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Empty,
  Form,
  Input,
  List,
  message,
  Modal,
  Progress,
  Row,
  Skeleton,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import TitleCustom from 'src/components/TitleCustom'
import { formatDate } from 'src/utils/dateFormatters'
import { getLandPlotsFromLogbook } from 'src/utils/helpers'
import ROUTER from 'src/router/ROUTER'
import CultivationLogbookService from 'src/services/CultivationLogbookService'
import CultivationStageService from 'src/services/CultivationStageService'

import StageTaskManagementTab from './components/StageTaskManagementTab'
import LogbookFinalizationTab from './components/LogbookFinalizationTab'
import TaskLogHistoryTab from './components/TaskLogHistoryTab'

const { Text, Paragraph } = Typography

// ── Main ──────────────────────────────────────────────────────────────────────
const FarmSupervisorPlanDetail = () => {
  const { planId } = useParams()
  const navigate = useNavigate()

  const [activeTabKey, setActiveTabKey] = useState('1')
  const [plan, setPlan] = useState(null)
  const [stages, setStages] = useState([])
  const [tasks, setTasks] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitModal, setSubmitModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // ── Load ──────────────────────────────────────────────────────────────────
  const loadData = async (isInitial = false) => {
    if (isInitial || !plan) {
      setLoading(true)
    }
    try {
      const planRes = await CultivationLogbookService.getById(planId)
      if (planRes?.success === false) {
        message.error(planRes?.message || 'Không tìm thấy kế hoạch.')
        navigate(ROUTER.FS_PLANS)
        return
      }
      // Interceptor trả body: { success, data: plan }
      const planData = planRes?.data ?? planRes
      if (!planData) {
        message.error('Không tìm thấy kế hoạch.')
        navigate(ROUTER.FS_PLANS)
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
      console.error(error)
      message.error('Không thể tải dữ liệu kế hoạch.')
      navigate(ROUTER.FS_PLANS)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData(true) }, [planId])

  // ── Derived ───────────────────────────────────────────────────────────────
  const allTasks = useMemo(() => Object.values(tasks).flat(), [tasks])

  const allCompleted = useMemo(
    () => allTasks.length > 0 && allTasks.every((t) => t.status === 'COMPLETED'),
    [allTasks]
  )

  const overallProgress = useMemo(() => {
    if (!allTasks.length) return 0
    return Math.round(
      allTasks.reduce((s, t) => s + (t.progress || 0), 0) / allTasks.length
    )
  }, [allTasks])

  const handleSubmitLogbook = async () => {
    try {
      setSubmitting(true)
      await CultivationLogbookService.submitCompletion(planId)
      message.success('Đã gửi yêu cầu chốt sổ lên Farm Manager!')
      setSubmitModal(false)
      navigate(ROUTER.FS_PLANS)
    } catch (error) {
      console.error(error)
      message.error(error.message || 'Gửi chốt sổ thất bại.')
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

  if (!plan) {
    return (
      <div className="py-16 text-center">
        <Empty description="Không tìm thấy kế hoạch." />
        <Button onClick={() => navigate(ROUTER.FS_PLANS)} className="mt-4">Quay lại</Button>
      </div>
    )
  }

  const completedCount = allTasks.filter((t) => t.status === 'COMPLETED').length

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTER.FS_PLANS)}>
            Quay lại
          </Button>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <FileTextOutlined className="text-green-600" />
            Chi tiết Kế hoạch
          </TitleCustom>
        </div>
        <Tooltip title={!allCompleted ? 'Hoàn thành tất cả công việc trước khi gửi.' : ''}>
          <Button
            type="primary"
            icon={<SendOutlined />}
            disabled={!allCompleted}
            onClick={() => setSubmitModal(true)}
            className="h-10 px-5 font-semibold bg-green-600 border-0 rounded-xl shadow-md shadow-green-100"
          >
            Gửi nhật ký lên Manager
          </Button>
        </Tooltip>
      </div>

      {/* ── Info Card ───────────────────────────────────────────────────────── */}
      <Card bordered className="border-gray-200 shadow-sm rounded-2xl">
        <Row gutter={24} align="middle">
          <Col flex="1">
            <Text className="text-xl font-bold text-gray-800 block mb-3">
              {plan.logbookName}
            </Text>
            <Descriptions size="small" column={{ xs: 1, sm: 2, md: 3 }} colon>
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
                              onClick={() => navigate(`/farm-supervisor/lands/${plot.id}`)}
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
          </Col>

          <Col flex="none">
            <Divider type="vertical" style={{ height: 100 }} className="hidden lg:block" />
          </Col>

          {/* Hình tròn tiến độ */}
          <Col flex="none" className="flex flex-col items-center">
            <Text className="mb-2 text-sm font-semibold text-gray-500 block">Tiến độ tổng thể</Text>
            <Progress
              type="circle"
              percent={overallProgress}
              size={96}
              strokeColor={{ '0%': '#86efac', '100%': '#16a34a' }}
              format={(p) => <span className="text-lg font-bold text-green-700">{p}%</span>}
            />
            <Text type="secondary" className="mt-2 text-xs text-center block">
              {completedCount}/{allTasks.length} việc xong
            </Text>
          </Col>
        </Row>
      </Card>

      {/* ── Tabs ─────────────────────────────────────────────────────────────── */}
      <Tabs
        activeKey={activeTabKey}
        onChange={setActiveTabKey}
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
            label: <span className="px-4 font-medium"><FileTextOutlined className="mr-2" />Lịch sử ghi Log</span>,
            children: activeTabKey === '2' && (
              <TaskLogHistoryTab stages={stages} tasks={tasks} />
            ),
          },
          {
            key: '3',
            label: <span className="px-4 font-medium"><CheckCircleOutlined className="mr-2" />Chốt Logbook</span>,
            children: activeTabKey === '3' && (
              <LogbookFinalizationTab planId={planId} stages={stages} tasks={tasks} loadData={loadData} />
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
            Gửi nhật ký lên Farm Manager
          </div>
        }
        onOk={handleSubmitLogbook}
        okText="Xác nhận gửi"
        cancelText="Hủy"
        confirmLoading={submitting}
        okButtonProps={{ className: 'bg-green-600' }}
      >
        <Alert
          message="Bạn có chắc muốn gửi toàn bộ nhật ký canh tác lên Farm Manager để xét duyệt không?"
          type="warning"
          showIcon
          className="rounded-xl"
        />
      </Modal>
    </div>
  )
}

export default FarmSupervisorPlanDetail
