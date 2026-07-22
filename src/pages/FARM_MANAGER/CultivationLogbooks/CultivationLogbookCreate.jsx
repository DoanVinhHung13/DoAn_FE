/**
 * CultivationLogbookCreate — Tạo Nhật ký Canh tác
 * Route: /farm-manager/cultivation-logbooks/create  (ROUTER.FM_CULTIVATION_LOGBOOK_CREATE)
 * API: POST /api/cultivation-logbooks (CultivationLogbooks)
 *
 * Theo implementation_plan.md:
 * - Farm Manager chỉ tạo nhật ký tổng thể (tên, mô tả, vùng trồng, giai đoạn)
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
import CultivationLogbookService from 'src/services/CultivationLogbookService'
import PlanTemplateService from 'src/services/PlanTemplateService'
import CropService from 'src/services/CropService'
import CropManagementService from 'src/services/CropManagementService'
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
  response?.data?.CultivationLogbookId ||
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

const CultivationLogbookCreate = () => {
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

  // Fetch crop catalogs (danh mục cây trồng) - same as /farm-manager/tasks/create
  React.useEffect(() => {
    let isMounted = true
    const fetchCatalogs = async () => {
      setIsCatalogsLoading(true)
      try {
        const response = await CropService.getCrops({
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

  // Fetch crops (cây trồng) - same as /farm-manager/tasks/create
  React.useEffect(() => {
    if (!selectedCatalogId) {
      setCropsData([])
      return
    }

    let isMounted = true
    const fetchCrops = async () => {
      setIsCropsLoading(true)
      try {
        const response = await CropManagementService.getCrops({
          PageIndex: 1,
          PageSize: 1000,
          Status: true,
        })
        if (!isMounted) return
        const allCrops = normalizeResponse(response)
        // Filter by selected catalog
        const filteredCrops = allCrops.filter((crop) => {
          const cropCatalogId = crop.cropCatalogId || crop.categoryId
          return cropCatalogId === selectedCatalogId
        })
        setCropsData(filteredCrops)
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

  // Fetch land plots available for logbook
  React.useEffect(() => {
    let isMounted = true
    const fetchLands = async () => {
      setIsLandsLoading(true)
      try {
        const response = await LandPlotService.getAvailableForLogbook({
          PageIndex: 1,
          PageSize: 1000,
        })
        if (!isMounted) return
        const lands = normalizeResponse(response)
        setLandsData(lands)
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
    const loadCultivationLogbook = async () => {
      try {
        const response = await CultivationLogbookService.getById(id)
        const plan = response?.data?.data ?? response?.data ?? response
        if (!isMounted || !plan) return

        const crop = plan.crop || {}
        const supervisor = plan.assignedFarmSupervisor || plan.farmSupervisor || {}
        let planStages = plan.cultivationStages || plan.productionStages || plan.stages || []
        const originalSupervisorId = plan.assignedFarmSupervisorId || supervisor.id || supervisor.userId || null
        const selectedCropId = plan.cropId || crop.id
        const selectedCropCatalogId = plan.cropCatalogId || crop.cropCatalogId || crop.categoryId || null

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
          logbookName: plan.logbookName || '',
          category: selectedCropCatalogId,
          cropId: selectedCropId,
          landPlotId: plan.landPlotId || '',
          area: plan.area || '',
          expectedStartDate: plan.startDate ? dayjs(plan.startDate) : null,
          expectedEndDate: plan.expectedEndDate ? dayjs(plan.expectedEndDate) : null,
          assignedFarmSupervisorId: originalSupervisorId,
          description: plan.description || '',
        })

        // Set immutable fields
        setImmutablePlanFields({
          logbookName: plan.logbookName || '',
          category: selectedCropCatalogId,
          cropId: selectedCropId,
          landPlotId: plan.landPlotId || '',
        })

        // Set stages
        const normalizedStages = planStages.map((stage, index) => ({
          _key: `stage-${stage.id || Date.now()}-${index}`,
          order: index + 1,
          title: stage.stageName || '',
          description: stage.description || '',
          startDate: stage.startDate ? dayjs(stage.startDate) : null,
          endDate: stage.endDate ? dayjs(stage.endDate) : null,
        }))

        setStages(normalizedStages.length ? normalizedStages : [createEmptyStage(1)])
      } catch (error) {
        console.error(error)
        message.error('Không thể tải kế hoạch.')
      }
    }

    loadCultivationLogbook()
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

  const applyTemplate = async (template) => {
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
      message.success(`Đã áp dụng mẫu "${template.templateName || template.name}" thành công.`)
    } catch (error) {
      console.error(error)
      message.error('Không thể áp dụng mẫu kế hoạch.')
    }
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
        logbookName: values.logbookName,
        cropId: values.cropId,
        landPlotId: values.landPlotId,
        startDate: formatApiDate(values.expectedStartDate),
        expectedEndDate: formatApiDate(values.expectedEndDate),
        status: isEdit ? undefined : 'PLANNED',
        scope: 'OVERALL',
        assignedFarmSupervisorId: values.assignedFarmSupervisorId,
        description: values.description,
        cultivationStages: stages.map((stage, index) => ({
          stageName: stage.title,
          description: stage.description,
          stageOrder: index + 1,
        })),
      }

      let response
      if (isEdit) {
        response = await CultivationLogbookService.update(id, payload)
      } else {
        response = await CultivationLogbookService.create(payload)
      }

      const createdPlanId = getCreatedPlanId(response)
      if (createdPlanId) {
        navigate(ROUTER.FM_PRODUCTION_PLAN_DETAIL.replace(':id', createdPlanId))
      } else {
      }
    } catch (error) {
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
        templateName: `Mẫu từ kế hoạch: ${values.logbookName}`,
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
            {isEdit ? 'Chỉnh sửa nhật ký canh tác' : 'Tạo nhật ký canh tác'}
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
            {isEdit ? 'Cập nhật nhật ký' : 'Lưu nhật ký'}
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
                name="logbookName" label="Tên nhật ký"
                rules={[{ required: true, message: 'Vui lòng nhập tên nhật ký' }]}
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
                  options={catalogsData?.map((cat) => ({
                    value: cat.id || cat._id || cat.cropCatalogId,
                    label: cat.name || cat.catalogName
                  }))}
                  placeholder="Chọn danh mục..."
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.label || '').toLowerCase().includes(input.toLowerCase())
                  }
                  loading={isCatalogsLoading}
                  disabled={!!immutablePlanFields?.category}
                  onChange={() => {
                    form.setFieldsValue({ cropId: undefined })
                    setCropsData([])
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Form.Item
                name="cropId" label="Cây trồng cụ thể"
                rules={[{ required: true, message: 'Vui lòng chọn cây trồng' }]}
              >
                <Select
                  options={cropsData?.map((crop) => ({
                    value: crop.id || crop._id || crop.cropId,
                    label: crop.name || crop.cropName
                  }))}
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
                  options={landsData?.map((land) => ({
                    value: land.id,
                    label: land.name,
                  }))}
                  placeholder="Chọn vùng trồng available..."
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
              <Form.Item name="description" label="Mô tả nhật ký">
                <Input.TextArea rows={3} placeholder="Mô tả tổng quan về nhật ký, mục tiêu, yêu cầu kỹ thuật..." />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Stages */}
        <Card bordered={false} className="shadow-sm rounded-2xl">
          <SectionTitle>
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

          {/* Nút Thêm giai đoạn — đặt dưới danh sách */}
          {!isEdit && (
            <div className="mt-3">
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={addStage}
                className="w-full text-green-700 border-green-300"
              >
                Thêm giai đoạn
              </Button>
            </div>
          )}
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
            {isEdit ? 'Cập nhật nhật ký' : 'Lưu nhật ký'}
          </Button>
        </div>
      </Form>

      {/* Template Modal */}
      <Modal
        open={templateModal}
        onCancel={() => setTemplateModal(false)}
        title={
          <div className="flex items-center gap-2 text-lg font-bold text-gray-800">
            <BookOutlined className="text-green-600" />
            <span>Chọn mẫu nhật ký canh tác</span>
          </div>
        }
        footer={null}
        width={900}
        centered
        className="template-modal"
        styles={{
          body: { padding: '24px' },
        }}
      >
        <div className="space-y-5">
          <Input.Search
            placeholder="Tìm kiếm mẫu kế hoạch..."
            value={templateSearch}
            onChange={(e) => setTemplateSearch(e.target.value)}
            onSearch={(value) => loadTemplates(value)}
            size="large"
            className="rounded-xl"
          />
          {templatesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spin size="large" tip="Đang tải mẫu kế hoạch..." />
            </div>
          ) : templates.length ? (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  hoverable
                  bordered={false}
                  className="overflow-hidden transition-all duration-200 border border-gray-200 shadow-sm rounded-xl hover:border-green-400 hover:shadow-md"
                  onClick={() => applyTemplate(template)}
                  bodyStyle={{ padding: '20px' }}
                >
                  <div className="flex items-center justify-between gap-6">
                    {/* Left: Template Info */}
                    <div className="flex items-start flex-1 min-w-0 gap-4">
                      <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 rounded-lg bg-green-50">
                        <BookOutlined className="text-xl text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="mb-1 text-base font-bold text-gray-900 line-clamp-1">
                          {template.templateName || template.name}
                        </h3>
                        <Text type="secondary" className="block text-sm leading-relaxed line-clamp-2">
                          {template.description || 'Chưa có mô tả'}
                        </Text>
                      </div>
                    </div>

                    {/* Right: Stage Count & Action */}
                    <div className="flex items-center flex-shrink-0 gap-4">
                      <div className="px-3 py-1.5 rounded-lg bg-green-50">
                        <span className="text-sm font-semibold text-green-700">
                          {template.processStepsCount} giai đoạn
                        </span>
                      </div>
                      <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        className="h-9 px-5 font-semibold text-white bg-green-600 border-0 rounded-lg hover:bg-green-700"
                        onClick={(e) => {
                          e.stopPropagation()
                          applyTemplate(template)
                        }}
                      >
                        Áp dụng
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Empty
              description="Không tìm thấy mẫu kế hoạch phù hợp."
              className="py-12"
            />
          )}
        </div>
      </Modal>
    </div>
  )
}

export default CultivationLogbookCreate
