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
  Col,
  Descriptions,
  Divider,
  Modal,
  Progress,
  Row,
  Tabs,
  Tooltip,
  Typography,
  message,
} from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import TitleCustom from 'src/components/TitleCustom'
import ROUTER from 'src/router/ROUTER'
import { formatDate } from 'src/utils/dateFormatters'

import { mockPlanData, mockStages, mockTasks } from './mockData'

import StageTaskManagementTab from './components/StageTaskManagementTab'
import LogbookFinalizationTab from './components/LogbookFinalizationTab'
import TaskLogHistoryTab from './components/TaskLogHistoryTab'

const { Text } = Typography

const FarmSupervisorPlanDetailMock = () => {
  const { planId } = useParams()
  const navigate = useNavigate()

  const [plan, setPlan] = useState(null)
  const [stages, setStages] = useState([])
  const [tasks, setTasks] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitModal, setSubmitModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // ── Load ──────────────────────────────────────────────────────────────────
  const loadData = () => {
    setLoading(true)
    setTimeout(() => {
      setPlan(mockPlanData)
      setStages(mockStages)
      setTasks(mockTasks)
      setLoading(false)
    }, 500)
  }

  useEffect(() => { loadData() }, [planId])

  // ── Derived ───────────────────────────────────────────────────────────────
  const allTasks = useMemo(() => Object.values(tasks).flat(), [tasks])

  const allCompleted = useMemo(
    () => allTasks.length > 0 && allTasks.every((t) => t.status === 'COMPLETED'),
    [allTasks]
  )

  const overallProgress = useMemo(() => {
    if (!allTasks.length) return 0
    const completedCount = allTasks.filter((t) => t.status === 'COMPLETED').length
    return Math.round((completedCount / allTasks.length) * 100)
  }, [allTasks])

  const handleSubmitLogbook = () => {
    setSubmitting(true)
    setTimeout(() => {
      message.success('Đã gửi nhật ký lên Farm Manager (MOCK)!')
      setSubmitModal(false)
      setSubmitting(false)
    }, 1000)
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return <div className="py-20 text-center">Đang tải dữ liệu mô phỏng...</div>
  }

  if (!plan) return null

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
            Chi tiết Kế hoạch (MOCK)
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
              {plan.planName || plan.name || 'Kế hoạch canh tác'}
            </Text>
            <Descriptions size="small" column={{ xs: 1, sm: 2, md: 3 }} colon>
              <Descriptions.Item label={<span className="text-gray-500"><BookOutlined className="mr-1" />Danh mục</span>}>
                <Text strong>{plan.cropCatalogName || plan.cropCategoryName || '—'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label={<span className="text-gray-500"><BookOutlined className="mr-1" />Cây trồng</span>}>
                <Text strong>{plan.cropName || '—'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label={<span className="text-gray-500"><EnvironmentOutlined className="mr-1" />Vùng trồng</span>}>
                <Text strong className="text-green-600">{plan.landPlotName}</Text>
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
        type="card"
        className="plan-tabs mt-4"
        items={[
          {
            key: '1',
            label: <span className="px-4 font-medium"><EnvironmentOutlined className="mr-2" />Quản lý công việc</span>,
            children: <StageTaskManagementTab planId={planId} stages={stages} tasks={tasks} loadData={loadData} />
          },
          {
            key: '2',
            label: <span className="px-4 font-medium"><CheckCircleOutlined className="mr-2" />Duyệt Bản Tóm Tắt</span>,
            children: <LogbookFinalizationTab stages={stages} tasks={tasks} />
          },
          {
            key: '3',
            label: <span className="px-4 font-medium"><FileTextOutlined className="mr-2" />Lịch sử ghi Log</span>,
            children: <TaskLogHistoryTab stages={stages} tasks={tasks} />
          }
        ]}
      />

      <Modal
        open={submitModal}
        onCancel={() => setSubmitModal(false)}
        title={<div className="flex items-center gap-2 text-green-700"><SendOutlined />Gửi nhật ký lên Farm Manager</div>}
        onOk={handleSubmitLogbook}
        okText="Xác nhận gửi"
        cancelText="Hủy"
        confirmLoading={submitting}
        okButtonProps={{ className: 'bg-green-600' }}
      >
        <Alert
          message="Bạn có chắc muốn gửi toàn bộ nhật ký canh tác (MOCK) lên Farm Manager để xét duyệt không?"
          type="warning"
          showIcon
          className="rounded-xl"
        />
      </Modal>
    </div>
  )
}

export default FarmSupervisorPlanDetailMock
