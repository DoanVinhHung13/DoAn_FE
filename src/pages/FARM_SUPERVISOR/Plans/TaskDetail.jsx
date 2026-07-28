/**
 * Farm Supervisor: Chi tiết Công việc (Work Task)
 * Route: /farm-supervisor/plans/:planId/tasks/:taskId  (ROUTER.FS_TASK_DETAIL)
 *
 * Luồng:
 * - Xem công việc → Gán người phụ trách và người hỗ trợ → Kích hoạt
 * - Xem bản tổng hợp từ người phụ trách → Biên soạn nhật ký chính thức
 */
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  EditOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  PlayCircleOutlined,
  SaveOutlined,
  TeamOutlined,
  UserOutlined,

} from '@ant-design/icons'
import {
  Alert,
  Button,
  Card,
  Col,
  Collapse,
  Form,
  Image,
  Input,
  message,
  Modal,
  Progress,
  Row,
  Select,
  Spin,
  Tag,
} from 'antd'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import TitleCustom from 'src/components/TitleCustom'
import ROUTER from 'src/router/ROUTER'
import CultivationTaskService from 'src/services/CultivationTaskService'
import CultivationLogService from 'src/services/CultivationLogService'
import UserService from 'src/services/UserService'
import { formatDate } from 'src/utils/dateFormatters'
import CultivationLogbookService from 'src/services/CultivationLogbookService'
import { ROLES } from 'src/constants/roles'
import { useCultivationStatus } from 'src/hooks/useCultivationStatus'

const { TextArea } = Input

const buildDataSentence = (summary) => {
  if (!summary) return 'Chưa có số liệu'
  const parts = []
  // API returns: fertilizers (not totalFertilizers)
  ; (summary.fertilizers || []).forEach((f) => {
    parts.push(`Đã bón ${f.name || 'Phân bón'}`)
  })
  // API returns: pesticides (not totalPesticides)
  ; (summary.pesticides || []).forEach((p) => {
    parts.push(`Đã phun ${p.name || 'Nông dược'}`)
  })
  return parts.length ? parts.join('. ') : 'Không có số liệu phân bón/nông dược'
}

// ── Component ─────────────────────────────────────────────────────────────────
const FarmSupervisorTaskDetail = () => {
  const { getTaskStatus } = useCultivationStatus()
  const { planId, taskId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { planData: passedPlanData } = location.state || {}
  const [task, setTask] = useState(null)
  const [stage, setStage] = useState(null)
  const [leaders, setLeaders] = useState([])
  const [farmers, setFarmers] = useState([])
  const [loading, setLoading] = useState(true)
  const [assignForm] = Form.useForm()
  const [compileForm] = Form.useForm()
  const [savingAssign, setSavingAssign] = useState(false)
  const [activating, setActivating] = useState(false)
  const [compileModal, setCompileModal] = useState(false)
  const [savingCompile, setSavingCompile] = useState(false)
  const leaderOptions = leaders.map((l) => ({ value: l.id, label: l.fullName || l.name }))
  const farmerOptions = farmers.map((f) => ({ value: f.id, label: f.fullName || f.name }))

  useEffect(() => {
    const loadTaskAndUsers = async () => {
      setLoading(true)
      try {
        const [planRes, leadersRes, farmersRes] = await Promise.all([
          !passedPlanData ? CultivationLogbookService.getById(planId).catch(() => null) : Promise.resolve({ data: passedPlanData }),
          UserService.getUsers({ PageIndex: 1, PageSize: 1000, Role: ROLES.FARM_LEADER, IsActive: true }).catch(() => ({ data: { items: [] } })),
          UserService.getUsers({ PageIndex: 1, PageSize: 1000, Role: ROLES.FARMER, IsActive: true }).catch(() => ({ data: { items: [] } })),
        ])

        const planData = planRes?.data ?? planRes

        if (planData) {
          const stageList = planData.cultivationStages || planData.productionStages || planData.stages || []
          let foundStage = null
          let foundTask = null

          for (const s of stageList) {
            const t = (s.tasks || []).find((x) => x.id === taskId)
            if (t) {
              foundTask = t
              foundStage = s
              break
            }
          }

          if (foundTask) {
            setTask(foundTask)
            setStage(foundStage)
            if (foundTask.assignedLeaderId) {
              assignForm.setFieldsValue({
                farmLeaderId: foundTask.assignedLeaderId,
                farmerIds: foundTask.assignments?.map(a => typeof a === 'object' ? a.userId || a.id : a) || [],
              })
            }
            if (foundTask.leaderSummary) {
              compileForm.setFieldsValue({
                supervisorDescription: foundTask.leaderSummary.description || '',
              })
            }
          } else {
            navigate(ROUTER.FS_PLAN_DETAIL.replace(':planId', planId))
          }
        }

        // Lấy danh sách Farm Leaders
        const leadersList = leadersRes?.data?.items || leadersRes?.data?.data || leadersRes?.data || []
        setLeaders(Array.isArray(leadersList) ? leadersList.filter(u => u.isActive !== false) : [])

        // Lấy danh sách Farmers
        const farmersList = farmersRes?.data?.items || farmersRes?.data?.data || farmersRes?.data || []
        setFarmers(Array.isArray(farmersList) ? farmersList.filter(u => u.isActive !== false) : [])

      } catch (error) {
        console.error(error)
        // axios interceptor handles error notification
      } finally {
        setLoading(false)
      }
    }
    loadTaskAndUsers()
  }, [taskId, planId, navigate, assignForm, compileForm, passedPlanData])

  const handleAssignTeam = async () => {
    try {
      const values = await assignForm.validateFields()
      setSavingAssign(true)
      const leader = farmers.find((l) => l.id === values.farmLeaderId) || leaders.find((l) => l.id === values.farmLeaderId)
      const farmersList = farmers.filter((f) => (values.farmerIds || []).includes(f.id))

      const payload = {
        name: task.name,
        description: task.description,
        leaderId: values.farmLeaderId,
        farmerIds: values.farmerIds || [],
        cultivationLogbookId: planId,
        cultivationStageId: stage?.id
      }

      await CultivationTaskService.update(taskId, payload)

      setTask((prev) => ({
        ...prev,
        assignedLeaderId: values.farmLeaderId,
        assignedLeaderName: leader?.fullName || leader?.name || '',
        assignments: farmersList.map((f) => ({ userId: f.id, fullName: f.fullName || f.name })),
      }))
    } catch (error) {
      console.error(error)
    } finally {
      setSavingAssign(false)
    }
  }

  const handleActivate = async () => {
    if (!task?.assignedLeaderId && !task?.farmLeaderId) {
      message.warning('Vui lòng gán người phụ trách trước khi kích hoạt công việc.')
      return
    }
    try {
      setActivating(true)
      await CultivationTaskService.start(taskId)
      setTask((prev) => ({ ...prev, status: 'IN_PROGRESS' }))
    } finally {
      setActivating(false)
    }
  }

  const handleCompile = async () => {
    try {
      const values = await compileForm.validateFields()
      setSavingCompile(true)
      // Call approve with modifiedDescription directly
      const cultivationLogId = task.cultivationLogId || task.officialLogId
      if (cultivationLogId) {
        await CultivationLogService.approve(cultivationLogId, {
          modifiedDescription: values.supervisorDescription,
        })
      } else {
        // Fallback: Create new log if no existing log
        await CultivationLogService.create({
          cultivationTaskId: taskId,
          description: values.supervisorDescription,
          images: task.leaderSummary?.images || [],
        })
      }
      // Update task status to completed after compilation
      setTask((prev) => ({ ...prev, status: 'COMPLETED' }))
      setCompileModal(false)
    } catch { /* validation */ } finally {
      setSavingCompile(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-96"><Spin size="large" /></div>
  }

  if (!task) return null

  const cfg = getTaskStatus(task.status)
  const dataSentence = buildDataSentence(task.leaderSummary)

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <Button
          type="text" icon={<ArrowLeftOutlined />}
          onClick={() => navigate(ROUTER.FS_PLAN_DETAIL.replace(':planId', planId))}
          className="mb-3 -ml-2 h-9 text-gray-600 hover:text-green-700"
        >
          Quay lại kế hoạch
        </Button>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <Tag color="blue" className="rounded-full">{stage?.stageName || 'Giai đoạn'}</Tag>
              <Tag color={cfg.color} className="rounded-full">{cfg.label}</Tag>
            </div>
            <TitleCustom className="!mb-0">{task.name}</TitleCustom>
          </div>
        </div>
        {task.description && (
          <div className="mt-3 rounded-xl bg-amber-50 border border-amber-100 p-3 text-sm text-amber-900">
            <InfoCircleOutlined className="mr-2" /> <strong>Hướng dẫn:</strong> {task.description}
          </div>
        )}
      </div>

      <Row gutter={[24, 24]}>
        {/* Cột trái: Thông tin cơ bản */}
        <Col xs={24} lg={10}>
          <div className="space-y-5">
            {/* Phân công team */}
            <Card bordered={false} className="shadow-sm rounded-2xl">
              <div className="flex items-center gap-2 mb-4">
                <TeamOutlined className="text-green-600" />
                <span className="font-semibold">Phân công nhóm thực hiện</span>
                {task.status !== 'PENDING' && (
                  // Dùng cfg từ getTaskStatus (đã tính ở trên) — label lấy từ SystemKey
                  <Tag color={cfg.color} className="ml-auto rounded-full">
                    {cfg.label}
                  </Tag>
                )}
              </div>

              {task.status === 'PENDING' ? (
                <Form form={assignForm} layout="vertical">
                  <Form.Item
                    name="farmLeaderId" label="Người phụ trách"
                    rules={[{ required: true, message: 'Chọn người phụ trách' }]}
                    tooltip="Người phụ trách chịu trách nhiệm ghi nhật ký và báo cáo."
                  >
                    <Select
                      options={leaderOptions}
                      placeholder="Chọn người phụ trách..."
                      showSearch
                      filterOption={(input, option) =>
                        String(option?.label || '').toLowerCase().includes(input.toLowerCase())
                      }
                      className="w-full"
                    />
                  </Form.Item>
                  <Form.Item name="farmerIds" label="Người hỗ trợ">
                    <Select
                      mode="multiple"
                      options={farmerOptions}
                      placeholder="Chọn người hỗ trợ..."
                      showSearch
                      filterOption={(input, option) =>
                        String(option?.label || '').toLowerCase().includes(input.toLowerCase())
                      }
                      className="w-full"
                    />
                  </Form.Item>
                  <Button
                    type="primary" icon={<SaveOutlined />}
                    onClick={handleAssignTeam} loading={savingAssign}
                    className="w-full h-10 rounded-xl bg-green-600 font-semibold"
                  >
                    Lưu phân công
                  </Button>
                  <Button
                    type="primary" icon={<PlayCircleOutlined />} loading={activating} className="w-full h-10 mt-2 font-semibold bg-blue-600"
                    onClick={handleActivate} disabled={!task.assignedLeaderId && !task.farmLeaderId}
                  >
                    Kích hoạt công việc
                  </Button>
                </Form>
              ) : (
                <div className="space-y-3">
                  {(task.assignedLeaderName || task.farmLeaderName) && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50">
                      <UserOutlined className="text-green-600" />
                      <span><strong>Người phụ trách:</strong> {task.assignedLeaderName || task.farmLeaderName}</span>
                    </div>
                  )}
                  {(task.assignments?.length > 0 || task.farmerNames?.length > 0) && (
                    <div className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-blue-50">
                      <TeamOutlined className="text-blue-600" />
                      <span><strong>Người hỗ trợ:</strong> {task.assignments ? task.assignments.filter(f => !f.isLeader).map(f => f.fullName || f.name).join(', ') : task.farmerNames.join(', ')}</span>
                    </div>
                  )}
                  <Alert
                    message={task.status === 'COMPLETED' ? 'Công việc đã hoàn thành' : 'Công việc đang được thực hiện'}
                    type={task.status === 'COMPLETED' ? 'success' : 'info'}
                    showIcon
                    className="rounded-lg"
                  />
                </div>
              )}
            </Card>
          </div>
        </Col>

        {/* Cột phải: Nhật ký và biên soạn */}
        <Col xs={24} lg={14}>
          <div className="space-y-5">
            {/* Báo cáo từ Leader */}
            {task.leaderSummary ? (
              <Card bordered={false} className="shadow-sm rounded-2xl border border-green-100">
                <div className="flex items-center gap-2 mb-4">
                  <FileTextOutlined className="text-green-600" />
                  <span className="font-semibold">Báo cáo hoàn thành từ người phụ trách</span>
                  <Tag color="success" className="ml-auto rounded-full">Nhận {formatDate(task.leaderSummary.completedAt)}</Tag>
                </div>

                <Collapse bordered={false} defaultActiveKey={['data', 'images', 'description']} className="bg-transparent">
                  {/* Số liệu tổng hợp */}
                  <Collapse.Panel header="📊 Số liệu tổng hợp" key="data">
                    <div className="rounded-xl bg-gray-50 border border-gray-200 p-3 text-sm font-mono text-gray-700">
                      {dataSentence}
                    </div>
                  </Collapse.Panel>

                  {/* Chi tiết phân bón */}
                  {task.leaderSummary.totalFertilizers?.length > 0 && (
                    <Collapse.Panel header="🌱 Chi tiết Phân bón" key="fertilizers">
                      <div className="space-y-2">
                        {task.leaderSummary.totalFertilizers.map((f) => (
                          <div key={f.name} className="rounded-lg bg-green-50 p-2 text-sm">
                            <div className="font-semibold">{f.name}</div>
                            <div>Tổng: {f.totalQuantity} {f.quantityUnit} / {f.totalArea} {f.areaUnit}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {f.dailyBreakdown?.map((d) => `${formatDate(d.date)}: ${d.quantity} ${f.quantityUnit}/${d.area} ${f.areaUnit}`).join(' · ')}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Collapse.Panel>
                  )}

                  {/* Chi tiết nông dược */}
                  {task.leaderSummary.totalPesticides?.length > 0 && (
                    <Collapse.Panel header="🔬 Chi tiết nông dược" key="pesticides">
                      <div className="space-y-2">
                        {task.leaderSummary.totalPesticides.map((p) => (
                          <div key={p.name} className="rounded-lg bg-orange-50 p-2 text-sm">
                            <div className="font-semibold">{p.name}</div>
                            <div>Tổng: {p.totalQuantity} {p.quantityUnit} / {p.totalArea} {p.areaUnit}</div>
                          </div>
                        ))}
                      </div>
                    </Collapse.Panel>
                  )}

                  {/* Ảnh đính kèm */}
                  {task.leaderSummary.images?.length > 0 && (
                    <Collapse.Panel header={`📷 Ảnh đính kèm (${task.leaderSummary.images.length})`} key="images">
                      <Image.PreviewGroup>
                        <div className="grid grid-cols-3 gap-2">
                          {task.leaderSummary.images.map((img) => (
                            <Image key={img.id} src={img.url} className="rounded-lg object-cover aspect-square" />
                          ))}
                        </div>
                      </Image.PreviewGroup>
                    </Collapse.Panel>
                  )}

                  {/* Mô tả từ Leader */}
                  <Collapse.Panel header="✍️ Mô tả tổng kết từ Leader" key="description">
                    <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-sm italic text-blue-900">
                      "{task.leaderSummary.description}"
                    </div>
                  </Collapse.Panel>
                </Collapse>

                {/* Biên soạn nhật ký chính thức */}
                {!task.officialLog ? (
                  <Button
                    type="primary" icon={<EditOutlined />} size="large"
                    onClick={() => {
                      compileForm.setFieldsValue({ supervisorDescription: task.leaderSummary.description || '' })
                      setCompileModal(true)
                    }}
                    className="w-full h-10 mt-4 font-semibold bg-green-600 rounded-xl"
                  >
                    Biên soạn nhật ký chính thức
                  </Button>
                ) : (
                  <div className="mt-4 rounded-xl bg-green-50 border border-green-200 p-4">
                    <Alert
                      message={`✅ Nhật ký chính thức đã biên soạn (${formatDate(task.officialLog.compiledAt)})`}
                      type="success" showIcon
                      className="rounded-lg"
                    />
                    <div className="mt-3 text-sm">
                      <div className="font-semibold mb-1">Số liệu:</div>
                      <div className="font-mono bg-white rounded-lg p-2">{task.officialLog.dataSentence}</div>
                      <div className="font-semibold mt-3 mb-1">Mô tả đã biên tập:</div>
                      <div className="italic bg-white rounded-lg p-2">{task.officialLog.supervisorDescription}</div>
                    </div>
                    <Button
                      type="text" size="small" icon={<EditOutlined />}
                      onClick={() => {
                        compileForm.setFieldsValue({ supervisorDescription: task.officialLog.supervisorDescription })
                        setCompileModal(true)
                      }}
                      className="mt-2 text-green-600"
                    >
                      Sửa lại
                    </Button>
                  </div>
                )}
              </Card>
            ) : task.status === 'IN_PROGRESS' || task.status === 'ACTIVE' || task.status === 'ASSIGNED' ? (
              <Card bordered={false} className="shadow-sm rounded-2xl border border-blue-100">
                <div className="text-center py-6 text-blue-600">
                  <CheckCircleOutlined className="text-3xl mb-3" />
                  <div className="font-semibold text-lg">Đang chờ người phụ trách báo cáo</div>
                  <Progress percent={task.progress} className="mt-4 mx-auto max-w-xs" strokeColor="#3b82f6" />
                  <div className="text-sm text-gray-500 mt-2">Tiến độ hiện tại: {task.progress}%</div>
                </div>
              </Card>
            ) : task.status === 'PENDING' ? (
              <Card bordered={false} className="shadow-sm rounded-2xl border border-gray-100">
                <div className="text-center py-8 text-gray-400">
                  <CalendarOutlined className="text-3xl mb-3" />
                  <div>Kích hoạt công việc để người phụ trách bắt đầu ghi nhật ký.</div>
                </div>
              </Card>
            ) : null}
          </div>
        </Col>
      </Row>

      {/* Modal: Biên soạn nhật ký chính thức */}
      <Modal
        open={compileModal}
        onCancel={() => setCompileModal(false)}
        title={<div className="flex items-center gap-2"><EditOutlined className="text-green-600" /> Biên soạn nhật ký chính thức</div>}
        onOk={handleCompile}
        okText="Lưu nhật ký chính thức"
        cancelText="Hủy"
        confirmLoading={savingCompile}
        okButtonProps={{ className: 'bg-green-600' }}
        width={720}
      >
        <Form form={compileForm} layout="vertical" className="space-y-4">
          <Alert
            message="⚠️ Lưu ý: Số liệu và ảnh không được phép sửa. Chỉ biên tập lại mô tả cho phù hợp với văn phong nhật ký."
            type="warning" showIcon
            className="rounded-xl"
          />

          <div>
            <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
              📊 Số liệu tổng hợp (KHÔNG ĐƯỢC SỬA)
            </div>
            <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm font-mono text-gray-700 select-none">
              {dataSentence}
            </div>
          </div>

          {task.leaderSummary?.images?.length > 0 && (
            <div>
              <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                📷 Ảnh đính kèm (KHÔNG ĐƯỢC XÓA/SỬA - {task.leaderSummary.images.length} ảnh)
              </div>
              <Image.PreviewGroup>
                <div className="flex flex-wrap gap-2">
                  {task.leaderSummary.images.map((img) => (
                    <Image key={img.id} src={img.url} width={80} height={80} className="rounded-lg object-cover" />
                  ))}
                </div>
              </Image.PreviewGroup>
            </div>
          )}

          <Form.Item
            name="supervisorDescription" label="Mô tả (Farm Supervisor biên tập)"
            rules={[{ required: true, message: 'Nhập mô tả nhật ký' }]}
            extra="Viết lại theo văn phong chuẩn nhật ký canh tác. Không được sửa số liệu ở phần trên."
          >
            <TextArea rows={5} placeholder="VD: Công tác bón phân được thực hiện theo đúng quy trình kỹ thuật..." />
          </Form.Item>

          <div>
            <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">📋 Preview nhật ký cuối</div>
            <Form.Item noStyle dependencies={['supervisorDescription']}>
              {({ getFieldValue }) => (
                <div className="rounded-xl bg-green-50 border border-green-100 p-4 text-sm text-green-900">
                  <span className="font-mono">{dataSentence}</span>
                  {getFieldValue('supervisorDescription') && (
                    <span> — {getFieldValue('supervisorDescription')}</span>
                  )}
                </div>
              )}
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default FarmSupervisorTaskDetail
