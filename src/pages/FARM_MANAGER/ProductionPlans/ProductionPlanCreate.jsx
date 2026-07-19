/**
 * ProductionPlanCreate — Tạo Kế hoạch Sản xuất (Màn 7)
 * Route: /farm-manager/production-plans/create  (ROUTER.FM_PRODUCTION_PLAN_CREATE)
 *
 * Theo implementation_plan.md:
 * - Farm Manager chỉ tạo kế hoạch tổng thể (tên, mô tả, vùng trồng, giai đoạn)
 * - Không tạo Work Tasks (Work Tasks do Farm Supervisor tạo sau)
 */
import {
  ArrowLeftOutlined,
  BookOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Spin,
  Typography,
  InputNumber,
  Empty
} from 'antd'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import dayjs from 'dayjs'

import TitleCustom from 'src/components/TitleCustom'
import ROUTER from 'src/router/ROUTER'
import ProductionPlanService from 'src/services/ProductionPlanService'
import PlanTemplateService from 'src/services/PlanTemplateService'
import CropService from 'src/services/CropService'
import LandPlotService from 'src/services/LandPlotService'
import UserService from 'src/services/UserService'
import { ROLES } from 'src/constants/roles'

const normalizeResponse = (response) => {
  const payload = response?.data ?? response ?? {}
  const data = payload?.data ?? payload
  return Array.isArray(data)
    ? data
    : data?.items || data?.results || data?.crops || data?.cropCatalogs || []
}

const { Text, Title } = Typography

// Ngày kế hoạch là ngày nghiệp vụ, không phải một thời điểm UTC.
const formatApiDate = (date) =>
  date ? date.format('YYYY-MM-DD[T]00:00:00') : undefined

const getCreatedPlanId = (response) =>
  response?.data?.data?.id ||
  response?.data?.data?.cultivationLogbookId ||
  response?.data?.id ||
  response?.data?.cultivationLogbookId ||
  response?.data?.productionPlanId ||
  response?.id ||
  null

// ── Section header ────────────────────────────────────────────────────────
const SectionTitle = ({ children, extra }) => (
  <div
    className="mb-4 px-4 py-2 rounded-lg font-semibold text-green-800 flex items-center justify-between"
    style={{ background: '#f0fdf4', borderLeft: '3px solid #16a34a', fontSize: 14 }}
  >
    <span>{children}</span>
    {extra}
  </div>
)

// ── Stage helpers ────────────────────────────────────────────────────────
const createEmptyStage = (order) => ({
  _key: `stage-${Date.now()}-${order}`,
  order,
  title: '',
  description: '',
  startDate: null,
  endDate: null,
})

const ProductionPlanCreate = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const isEdit = Boolean(id)
  const templateIdFromQuery = searchParams.get('templateId')
  const [form] = Form.useForm()
  const selectedCatalogId = Form.useWatch('category', form)
  const selectedPlanStartDate = Form.useWatch('expectedStartDate', form)

  // ── Stages state ──
  const [stages, setStages] = useState([createEmptyStage(1)])
  const [submitting, setSubmitting] = useState(false)
  const [savingTemplate, setSavingTemplate] = useState(false)
  const [immutablePlanFields, setImmutablePlanFields] = useState(null)

  // ── Dropdown options ──
  const [supervisorOptions, setSupervisorOptions] = useState([])
  const [isSupervisorsLoading, setIsSupervisorsLoading] = useState(false)
  const [catalogsData, setCatalogsData] = useState(null)
  const [isCatalogsLoading, setIsCatalogsLoading] = useState(false)
  const [cropsData, setCropsData] = useState(null)
  const [isCropsLoading, setIsCropsLoading] = useState(false)
  const [landsData, setLandsData] = useState(null)
  const [isLandsLoading, setIsLandsLoading] = useState(false)

  // ── Template modal ──
  const [templateModal, setTemplateModal] = useState(false)
  const [templates, setTemplates] = useState([])
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [templateSearch, setTemplateSearch] = useState('')

  // ── Load dropdown options ────────────────────────────────────────
  React.useEffect(() => {
    let isMounted = true
    const fetchSupervisors = async () => {
      setIsSupervisorsLoading(true)
      try {
        const response = await UserService.getUsers({
          PageIndex: 1,
          PageSize: 1000,
          Role: ROLES.FARM_SUPERVISOR,
          IsActive: true,
        })
        if (!isMounted) return

        const supervisors = normalizeResponse(response).filter(
          (user) => user.isActive !== false
        )

        setSupervisorOptions(supervisors.map((user) => ({
          value: user.id || user._id || user.userId,
          label: user.fullName || user.name || user.email,
        })).filter((option) => option.value))
      } catch (error) {
        console.error(error)
        if (isMounted) setSupervisorOptions([])
      } finally {
        if (isMounted) setIsSupervisorsLoading(false)
      }
    }

    fetchSupervisors()
    return () => { isMounted = false }
  }, [])

  React.useEffect(() => {
    let isMounted = true
    const fetchCatalogs = async () => {
      setIsCatalogsLoading(true)
      try {
        const response = await CropService.getCropCatalogs({
          PageIndex: 1,
          PageSize: 1000,
          Status: true,
        })
        if (!isMounted) return
        setCatalogsData(normalizeResponse(response))
      } catch (error) {
        console.error(error)
        if (isMounted) setCatalogsData([])
      } finally {
        if (isMounted) setIsCatalogsLoading(false)
      }
    }

    fetchCatalogs()
    return () => { isMounted = false }
  }, [])

  React.useEffect(() => {
    if (!selectedCatalogId) return

    let isMounted = true
    const fetchCrops = async () => {
      setIsCropsLoading(true)
      try {
        const response = await CropService.getCrops({
          PageIndex: 1,
          PageSize: 1000,
          CropCatalogId: selectedCatalogId,
          Status: true,
        })
        if (!isMounted) return
        setCropsData(normalizeResponse(response))
      } catch (error) {
        console.error(error)
        if (isMounted) setCropsData([])
      } finally {
        if (isMounted) setIsCropsLoading(false)
      }
    }

    fetchCrops()
    return () => { isMounted = false }
  }, [selectedCatalogId])

  React.useEffect(() => {
    let isMounted = true
    const fetchLands = async () => {
      setIsLandsLoading(true)
      try {
        const response = await LandPlotService.getAll({
          PageIndex: 1,
          PageSize: 1000,
          Status: true,
        })
        if (!isMounted) return
        setLandsData(normalizeResponse(response))
      } catch (error) {
        console.error(error)
        if (isMounted) setLandsData([])
      } finally {
        if (isMounted) setIsLandsLoading(false)
      }
    }

    fetchLands()
    return () => { isMounted = false }
  }, [])

  // ── Load plan data for edit mode ──────────────────────────────────
  useEffect(() => {
    if (!isEdit) return

    let isMounted = true
    const loadProductionPlan = async () => {
      try {
        const response = await ProductionPlanService.getById(id)
        const plan = response?.data ?? response
        if (!isMounted || !plan) return

        const crop = plan.crop || {}
        const supervisor = plan.assignedFarmSupervisor || plan.farmSupervisor || {}
        let planStages = plan.cultivationStages || plan.productionStages || plan.stages || []
        const originalSupervisorId = plan.assignedFarmSupervisorId || supervisor.id || supervisor.userId || null
        const selectedCropId = plan.cropId || crop.id
        let selectedCropCatalogId = plan.cropCatalogId || crop.cropCatalogId || crop.categoryId || null

        // Normalize stages
        if (!planStages.length && plan.processTemplateId) {
          try {
            const templateRes = await PlanTemplateService.getById(plan.processTemplateId)
            const template = templateRes?.data ?? templateRes
            planStages = template?.processSteps || []
          } catch { /* ignore */ }
        }

        // Set form values
        form.setFieldsValue({
          planName: plan.planName || plan.name || '',
          category: selectedCropCatalogId,
          cropId: selectedCropId,
          landPlotId: plan.landPlotId || plan.landId || '',
          area: plan.area || '',
          expectedStartDate: plan.startDate ? dayjs(plan.startDate) : null,
          expectedEndDate: plan.expectedEndDate ? dayjs(plan.expectedEndDate) : null,
          assignedFarmSupervisorId: originalSupervisorId,
          description: plan.description || plan.note || '',
        })

        // Set immutable fields
        setImmutablePlanFields({
          planName: plan.planName || plan.name || '',
          category: selectedCropCatalogId,
          cropId: selectedCropId,
          landPlotId: plan.landPlotId || plan.landId || '',
        })

        // Set stages
        const normalizedStages = planStages.map((stage, index) => ({
          _key: `stage-${stage.id || Date.now()}-${index}`,
          order: index + 1,
          title: stage.stageName || stage.title || '',
          description: stage.description || stage.note || '',
          startDate: stage.startDate ? dayjs(stage.startDate) : null,
          endDate: stage.endDate ? dayjs(stage.endDate) : null,
        }))

        setStages(normalizedStages.length ? normalizedStages : [createEmptyStage(1)])
      } catch (error) {
        console.error(error)
        message.error('Không thể tải kế hoạch.')
      }
    }

    loadProductionPlan()
    return () => { isMounted = false }
  }, [id, isEdit, form])

  // ── Load template data ───────────────────────────────────────────
  useEffect(() => {
    if (!templateIdFromQuery) return

    let isMounted = true
    const loadTemplate = async () => {
      try {
        const response = await PlanTemplateService.getById(templateIdFromQuery)
        const template = response?.data ?? response
        if (!isMounted || !template) return

        const steps = template.processSteps || []
        const normalizedStages = steps.map((step, index) => ({
          _key: `stage-${step.id || Date.now()}-${index}`,
          order: index + 1,
          title: step.stepName || step.title || '',
          description: step.description || step.note || '',
          startDate: null,
          endDate: null,
        }))

        setStages(normalizedStages.length ? normalizedStages : [createEmptyStage(1)])
        message.info('Đã tải mẫu kế hoạch thành công.')
      } catch (error) {
        console.error(error)
        message.error('Không thể tải mẫu kế hoạch.')
      }
    }

    loadTemplate()
    return () => { isMounted = false }
  }, [templateIdFromQuery])

  // ── Template modal handlers ──────────────────────────────────────
  const openTemplateModal = () => {
    setTemplateModal(true)
    setTemplateSearch('')
    loadTemplates()
  }

  const loadTemplates = async (search = '') => {
    try {
      setTemplatesLoading(true)
      const response = await PlanTemplateService.getAll({
        PageIndex: 1,
        PageSize: 1000,
        Name: search || undefined,
        Status: true,
      })
      setTemplates(normalizeResponse(response))
    } catch (error) {
      console.error(error)
      setTemplates([])
    } finally {
      setTemplatesLoading(false)
    }
  }

  const applyTemplate = (template) => {
    Modal.confirm({
      title: 'Áp dụng mẫu kế hoạch',
      content: `Bạn có chắc chắn muốn áp dụng mẫu "${template.templateName}" cho kế hoạch này? Các giai đoạn hiện tại sẽ bị thay thế.`,
      onOk: async () => {
        try {
          const response = await PlanTemplateService.getById(template.id)
          const templateData = response?.data ?? response
          const steps = templateData.processSteps || []

          const normalizedStages = steps.map((step, index) => ({
            _key: `stage-${step.id || Date.now()}-${index}`,
            order: index + 1,
            title: step.stepName || step.title || '',
            description: step.description || step.note || '',
            startDate: null,
            endDate: null,
          }))

          setStages(normalizedStages.length ? normalizedStages : [createEmptyStage(1)])
          setTemplateModal(false)
          message.success('Đã áp dụng mẫu kế hoạch thành công.')
        } catch (error) {
          console.error(error)
          message.error('Không thể áp dụng mẫu kế hoạch.')
        }
      },
    })
  }

  // ── Stage handlers ───────────────────────────────────────────────
  const addStage = () => {
    setStages([...stages, createEmptyStage(stages.length + 1)])
  }

  const removeStage = (index) => {
    if (stages.length <= 1) {
      message.warning('Phải có ít nhất một giai đoạn.')
      return
    }
    Modal.confirm({
      title: 'Xóa giai đoạn',
      content: 'Bạn có chắc chắn muốn xóa giai đoạn này?',
      onOk: () => {
        const newStages = [...stages]
        newStages.splice(index, 1)
        setStages(newStages.map((stage, idx) => ({ ...stage, order: idx + 1 })))
      },
    })
  }

  const updateStage = (index, field, value) => {
    const newStages = [...stages]
    newStages[index] = { ...newStages[index], [field]: value }
    setStages(newStages)
  }

  // ── Form submission ──────────────────────────────────────────────
  const handleSubmit = async (values) => {
    if (stages.some((stage) => !stage.title.trim())) {
      message.warning('Vui lòng nhập tên cho tất cả các giai đoạn.')
      return
    }

    if (stages.some((stage) => stage.startDate && stage.endDate && stage.startDate.isAfter(stage.endDate))) {
      message.warning('Ngày bắt đầu không được sau ngày kết thúc trong bất kỳ giai đoạn nào.')
      return
    }

    try {
      setSubmitting(true)
      const payload = {
        planName: values.planName,
        cropCatalogId: values.category,
        cropId: values.cropId,
        landPlotId: values.landPlotId,
        area: values.area,
        startDate: formatApiDate(values.expectedStartDate),
        expectedEndDate: formatApiDate(values.expectedEndDate),
        assignedFarmSupervisorId: values.assignedFarmSupervisorId,
        description: values.description,
        cultivationStages: stages.map((stage) => ({
          stageName: stage.title,
          description: stage.description,
          startDate: formatApiDate(stage.startDate),
          endDate: formatApiDate(stage.endDate),
        })),
      }

      let response
      if (isEdit) {
        response = await ProductionPlanService.update(id, payload)
      } else {
        response = await ProductionPlanService.create(payload)
      }

      const createdPlanId = getCreatedPlanId(response)
      if (createdPlanId) {
        message.success(isEdit ? 'Cập nhật kế hoạch thành công!' : 'Tạo kế hoạch thành công!')
        navigate(ROUTER.FM_PRODUCTION_PLAN_DETAIL.replace(':id', createdPlanId))
      } else {
        message.error('Không thể lấy ID kế hoạch mới.')
      }
    } catch (error) {
      console.error(error)
      message.error(error.message || 'Lưu kế hoạch thất bại.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveAsTemplate = async () => {
    const values = await form.validateFields()
    if (stages.some((stage) => !stage.title.trim())) {
      message.warning('Vui lòng nhập tên cho tất cả các giai đoạn.')
      return
    }

    try {
      setSavingTemplate(true)
      const payload = {
        templateName: `Mẫu từ kế hoạch: ${values.planName}`,
        description: values.description || 'Mẫu kế hoạch được tạo từ kế hoạch sản xuất',
        processSteps: stages.map((stage) => ({
          stepName: stage.title,
          description: stage.description,
          order: stage.order,
        })),
      }

      await PlanTemplateService.create(payload)
      message.success('Đã lưu kế hoạch thành mẫu thành công!')
      setTemplateModal(false)
    } catch (error) {
      console.error(error)
      message.error(error.message || 'Lưu mẫu thất bại.')
    } finally {
      setSavingTemplate(false)
    }
  }

  return (
    <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Button
            type="text" icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTER.FM_PRODUCTION_PLANS)}
            className="mb-3 -ml-2 h-9 text-gray-600 hover:text-green-700"
          >
            Quay lại danh sách
          </Button>
          <TitleCustom className="!mb-1">
            {isEdit ? 'Chỉnh sửa kế hoạch sản xuất' : 'Tạo kế hoạch sản xuất'}
          </TitleCustom>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isEdit && (
            <Button
              type="default" icon={<BookOutlined />}
              onClick={openTemplateModal}
              className="h-10 px-6 font-semibold rounded-xl"
            >
              Áp dụng mẫu
            </Button>
          )}
          <Button
            type="primary" icon={<PlusOutlined />}
            onClick={() => form.submit()}
            loading={submitting}
            className="h-10 px-6 font-semibold bg-green-600 rounded-xl"
          >
            {isEdit ? 'Cập nhật kế hoạch' : 'Lưu kế hoạch'}
          </Button>
        </div>
      </div>

      <Form form={form} onFinish={handleSubmit} layout="vertical" className="space-y-6">
        {/* Basic Info */}
        <Card bordered={false} className="shadow-sm rounded-2xl">
          <SectionTitle>Thông tin cơ bản</SectionTitle>
          <Row gutter={24}>
            <Col xs={24} md={12} lg={8}>
              <Form.Item
                name="planName" label="Tên kế hoạch"
                rules={[{ required: true, message: 'Vui lòng nhập tên kế hoạch' }]}
              >
                <Input placeholder="VD: Vụ Đông Xuân 2026 - Lúa ST25" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Form.Item
                name="category" label="Danh mục cây trồng"
                rules={[{ required: true, message: 'Vui lòng chọn danh mục cây trồng' }]}
              >
                <Select
                  options={catalogsData?.map((cat) => ({ value: cat.id, label: cat.catalogName }))}
                  placeholder="Chọn danh mục..."
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.label || '').toLowerCase().includes(input.toLowerCase())
                  }
                  loading={isCatalogsLoading}
                  disabled={!!immutablePlanFields?.category}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Form.Item
                name="cropId" label="Cây trồng cụ thể"
                rules={[{ required: true, message: 'Vui lòng chọn cây trồng' }]}
              >
                <Select
                  options={cropsData?.map((crop) => ({ value: crop.id, label: crop.cropName }))}
                  placeholder="Chọn cây trồng..."
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.label || '').toLowerCase().includes(input.toLowerCase())
                  }
                  loading={isCropsLoading}
                  disabled={!selectedCatalogId || !!immutablePlanFields?.cropId}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Form.Item
                name="landPlotId" label="Vùng trồng"
                rules={[{ required: true, message: 'Vui lòng chọn vùng trồng' }]}
              >
                <Select
                  options={landsData?.map((land) => ({ value: land.id, label: land.landPlotName }))}
                  placeholder="Chọn vùng trồng..."
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.label || '').toLowerCase().includes(input.toLowerCase())
                  }
                  loading={isLandsLoading}
                  disabled={!!immutablePlanFields?.landPlotId}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Form.Item
                name="assignedFarmSupervisorId" label="Giám sát viên phụ trách"
                rules={[{ required: true, message: 'Vui lòng chọn giám sát viên' }]}
              >
                <Select
                  options={supervisorOptions}
                  placeholder="Chọn giám sát viên..."
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.label || '').toLowerCase().includes(input.toLowerCase())
                  }
                  loading={isSupervisorsLoading}
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="description" label="Mô tả kế hoạch">
                <Input.TextArea rows={3} placeholder="Mô tả tổng quan về kế hoạch, mục tiêu, yêu cầu kỹ thuật..." />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Stages */}
        <Card bordered={false} className="shadow-sm rounded-2xl">
          <SectionTitle extra={!isEdit && (
            <Button type="dashed" icon={<PlusOutlined />} onClick={addStage} className="text-green-700 border-green-300">
              Thêm giai đoạn
            </Button>
          )}>
            Giai đoạn canh tác
          </SectionTitle>

          {stages.map((stage, index) => (
            <div key={stage._key} className="mb-6 p-4 rounded-xl border border-gray-100 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-gray-700">Giai đoạn {stage.order}</span>
                {!isEdit && stages.length > 1 && (
                  <Button
                    type="text" danger size="small" icon={<MinusCircleOutlined />}
                    onClick={() => removeStage(index)}
                  >
                    Xóa giai đoạn
                  </Button>
                )}
              </div>
              <Row gutter={12}>
                <Col xs={24} md={24}>
                  <Form.Item label="Tên giai đoạn" required>
                    <Input
                      value={stage.title}
                      onChange={(e) => updateStage(index, 'title', e.target.value)}
                      placeholder="VD: Chuẩn bị đất & Xuống giống"
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={24}>
                  <Form.Item label="Mô tả công việc cần làm">
                    <Input.TextArea
                      value={stage.description}
                      onChange={(e) => updateStage(index, 'description', e.target.value)}
                      rows={2}
                      placeholder="Mô tả chi tiết công việc cần thực hiện trong giai đoạn này..."
                    />
                  </Form.Item>
                </Col>
              </Row>
            </div>
          ))}
        </Card>

        <div className="flex flex-wrap gap-3 justify-end">
          {isEdit && (
            <Button
              type="default"
              onClick={() => navigate(ROUTER.FM_PRODUCTION_PLAN_DETAIL.replace(':id', id))}
              className="h-10 px-6 font-semibold rounded-xl"
            >
              Hủy
            </Button>
          )}
          <Button
            type="primary" icon={<PlusOutlined />}
            onClick={() => form.submit()}
            loading={submitting}
            className="h-10 px-6 font-semibold bg-green-600 rounded-xl"
          >
            {isEdit ? 'Cập nhật kế hoạch' : 'Lưu kế hoạch'}
          </Button>
        </div>
      </Form>

      {/* Template Modal */}
      <Modal
        open={templateModal}
        onCancel={() => setTemplateModal(false)}
        title="Áp dụng mẫu kế hoạch"
        footer={null}
        width={800}
        className="rounded-2xl"
      >
        <div className="space-y-4">
          <Input.Search
            placeholder="Tìm kiếm mẫu kế hoạch..."
            value={templateSearch}
            onChange={(e) => setTemplateSearch(e.target.value)}
            onSearch={(value) => loadTemplates(value)}
            className="rounded-xl"
          />
          {templatesLoading ? (
            <div className="py-8 text-center"><Spin tip="Đang tải mẫu kế hoạch..." /></div>
          ) : templates.length ? (
            <div className="grid gap-4 xl:grid-cols-2">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  bordered={false}
                  className="overflow-hidden transition border border-gray-100 shadow-sm rounded-2xl hover:border-green-300 hover:shadow-md cursor-pointer"
                  onClick={() => applyTemplate(template)}
                >
                  <div className="p-4 border-b border-green-100 bg-gradient-to-r from-green-50 to-white">
                    <h3 className="mb-1 text-base font-bold text-gray-900">{template.templateName}</h3>
                    <Text type="secondary" className="text-sm line-clamp-2">{template.description}</Text>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOutlined className="text-green-600" />
                      <span className="text-sm font-semibold">
                        {template.processSteps?.length || 0} giai đoạn
                      </span>
                    </div>
                    <Button type="primary" className="w-full h-9 font-semibold bg-green-600 rounded-lg">
                      Áp dụng mẫu này
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Empty description="Không tìm thấy mẫu kế hoạch phù hợp." />
          )}
          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <Button onClick={() => setTemplateModal(false)} className="rounded-xl">
              Hủy
            </Button>
            <Button
              type="primary" icon={<PlusOutlined />}
              onClick={handleSaveAsTemplate}
              loading={savingTemplate}
              className="bg-green-600 rounded-xl"
            >
              Lưu kế hoạch hiện tại thành mẫu
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ProductionPlanCreate