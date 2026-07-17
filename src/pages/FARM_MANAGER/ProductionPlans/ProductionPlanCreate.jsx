/**
 * ProductionPlanCreate — Tạo Kế hoạch Sản xuất (Màn 7)
 * Route: /farm-manager/production-plans/create  (ROUTER.FM_PRODUCTION_PLAN_CREATE)
 *
 * Architecture mirrors FertilizerCreate:
 *   - Button "Quay lại" + TitleCustom header
 *   - Cards with SectionTitle dividers
 *   - Form with footer actions
 */
import {
  ArrowLeftOutlined,
  BookOutlined,
  CalendarOutlined,
  EditOutlined,
  MinusCircleOutlined,
  PlusOutlined,
  TeamOutlined,
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
} from 'antd'
import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import dayjs from 'dayjs'

import TitleCustom from 'src/components/TitleCustom'
import ROUTER from 'src/router/ROUTER'
import ProductionPlanService from 'src/services/ProductionPlanService'
import ProductionStageService from 'src/services/ProductionStageService'
import PlanTemplateService from 'src/services/PlanTemplateService'
import CropService from 'src/services/CropService'
import CropManagementService from 'src/services/CropManagementService'
import LandPlotService from 'src/services/LandPlotService'
import UserService from 'src/services/UserService'
import { ROLES } from 'src/constants/roles'

const normalizeResponse = (response) => {
  const payload = response?.data ?? response ?? {};
  const data = payload?.data ?? payload;
  return Array.isArray(data)
    ? data
    : data?.items ||
        data?.results ||
        data?.crops ||
        data?.cropCatalogs ||
        data?.productionPlans ||
        data?.productionStages ||
        [];
};

const { Text } = Typography

// Ngày kế hoạch là ngày nghiệp vụ, không phải một thời điểm UTC.
// Không dùng toISOString() vì 00:00 giờ Việt Nam sẽ bị lùi về ngày hôm trước.
const formatApiDate = (date) =>
  date ? date.format('YYYY-MM-DD[T]00:00:00') : undefined

const getCreatedPlanId = (response) =>
  response?.data?.id ||
  response?.data?.productionPlanId ||
  response?.id ||
  response?.productionPlanId ||
  null

const PRODUCTION_PLAN_SCOPE_OPTIONS = [
  { value: 'OVERALL', label: 'Kế hoạch tổng thể' },
  { value: 'SPECIFIC', label: 'Kế hoạch chi tiết' },
]

// ── Section header (Fertilizer-style) ─────────────────────────────────────────
const SectionTitle = ({ children, extra }) => (
  <div
    className="mb-4 px-4 py-2 rounded-lg font-semibold text-green-800 flex items-center justify-between"
    style={{ background: '#f0fdf4', borderLeft: '3px solid #16a34a', fontSize: 14 }}
  >
    <span>{children}</span>
    {extra}
  </div>
)

// ── Stage helpers ─────────────────────────────────────────────────────────────
const createEmptyStage = (order) => ({
  _key: `stage-${Date.now()}-${order}`,
  order,
  title: '',
  description: '',
  startDate: null,
  endDate: null,
  status: 'ACTIVE',
})

// ── Main Component ────────────────────────────────────────────────────────────
const ProductionPlanCreate = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const isEdit = Boolean(id)
  const templateIdFromQuery = searchParams.get('templateId')
  const [form] = Form.useForm()
  const selectedCatalogId = Form.useWatch('category', form);
  const selectedScope = Form.useWatch('scope', form);
  const selectedPlanStartDate = Form.useWatch('expectedStartDate', form);
  const selectedPlanEndDate = Form.useWatch('expectedEndDate', form);

  // ── Stages state ──
  const [stages, setStages] = useState([createEmptyStage(1)])
  const [originalStages, setOriginalStages] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [savingTemplate, setSavingTemplate] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState(false)
  const [immutablePlanFields, setImmutablePlanFields] = useState(null)
  const [originalPlanValues, setOriginalPlanValues] = useState(null)

  // ── Dropdown options ──
  const [supervisorOptions, setSupervisorOptions] = useState([])
  const [isSupervisorsLoading, setIsSupervisorsLoading] = useState(false)

  const [catalogsData, setCatalogsData] = useState(null);
  const [isCatalogsLoading, setIsCatalogsLoading] = useState(false);
  const [cropsData, setCropsData] = useState(null);
  const [isCropsLoading, setIsCropsLoading] = useState(false);
  const [landsData, setLandsData] = useState(null);
  const [isLandsLoading, setIsLandsLoading] = useState(false);
  const [parentPlansData, setParentPlansData] = useState(null);
  const [isParentPlansLoading, setIsParentPlansLoading] = useState(false);

  // ── Template modal ──
  const [templateModal, setTemplateModal] = useState(false)
  const [templates, setTemplates] = useState([])
  const [templatesLoading, setTemplatesLoading] = useState(false)

  React.useEffect(() => {
    let isMounted = true;
    const fetchSupervisors = async () => {
      setIsSupervisorsLoading(true);
      try {
        const response = await UserService.getUsers({
          PageIndex: 1,
          PageSize: 1000,
          Role: ROLES.FARM_SUPERVISOR,
          IsActive: true,
        });
        if (!isMounted) return;

        const supervisors = normalizeResponse(response).filter(
          (user) => user.isActive !== false
        );

        setSupervisorOptions(supervisors.map((user) => ({
          value: user.id || user._id || user.userId,
          label: user.fullName || user.name || user.email,
        })).filter((option) => option.value));
      } catch (error) {
        console.error(error);
        if (isMounted) setSupervisorOptions([]);
      } finally {
        if (isMounted) setIsSupervisorsLoading(false);
      }
    };

    fetchSupervisors();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!isEdit) return

    let isMounted = true
    const loadProductionPlan = async () => {
      try {
        setLoadingPlan(true)
        const response = await ProductionPlanService.getById(id)
        const plan = response?.data ?? response
        if (!isMounted || !plan) return

        const crop = plan.crop || {}
        const supervisor = plan.assignedFarmSupervisor || plan.farmSupervisor || {}
        let planStages = plan.productionStages || plan.stages || []
        const originalSupervisorId =
          plan.assignedFarmSupervisorId ||
          supervisor.id ||
          supervisor.userId ||
          null
        const originalScope = plan.scope || 'OVERALL'
        const originalParentPlanId =
          plan.parentPlanId || plan.parentPlan?.id || null
        const selectedCropId = plan.cropId || crop.id
        let selectedCropCatalogId =
          plan.cropCatalogId ||
          crop.cropCatalogId ||
          crop.categoryId ||
          crop.cropCatalog?.id

        try {
          const stagesResponse = await ProductionStageService.getAll({
            PageIndex: 1,
            PageSize: 1000,
          })
          const stagesByPlan = normalizeResponse(stagesResponse).filter(
            (stage) =>
              (stage.productionPlanId || stage.productionPlan?.id) === id
          )
          if (stagesByPlan.length) {
            planStages = stagesByPlan
          }
        } catch (error) {
          console.error('Không thể lấy giai đoạn sản xuất:', error)
        }

        // API chi tiết kế hoạch chỉ trả cropId/cropName. Lấy chi tiết cây trồng
        // để khôi phục đúng danh mục khi mở màn hình cập nhật.
        if (selectedCropId && !selectedCropCatalogId) {
          try {
            const cropResponse =
              await CropManagementService.getCropById(selectedCropId)
            const cropDetail = cropResponse?.data ?? cropResponse
            selectedCropCatalogId =
              cropDetail?.cropCatalogId ||
              cropDetail?.categoryId ||
              cropDetail?.cropCatalog?.id
          } catch (error) {
            console.error('Không thể lấy danh mục của cây trồng:', error)
          }
        }

        const loadedPlanValues = {
          name: plan.planName || plan.name,
          area: plan.landPlotId || plan.landPlot?.id,
          category: selectedCropCatalogId,
          cropVariety: selectedCropId,
          expectedStartDate: plan.startDate ? dayjs(plan.startDate) : null,
          expectedEndDate: plan.expectedEndDate ? dayjs(plan.expectedEndDate) : null,
          supervisorId: originalSupervisorId,
          scope: originalScope,
          parentPlanId: originalParentPlanId,
          description: plan.description || '',
        }
        form.setFieldsValue(loadedPlanValues)
        setOriginalPlanValues({
          landPlotId: loadedPlanValues.area,
          cropId: loadedPlanValues.cropVariety,
          planName: loadedPlanValues.name?.trim() || '',
          startDate: formatApiDate(loadedPlanValues.expectedStartDate),
          expectedEndDate: formatApiDate(loadedPlanValues.expectedEndDate),
          description: loadedPlanValues.description?.trim() || null,
        })
        setImmutablePlanFields({
          scope: originalScope,
          parentPlanId: originalParentPlanId,
          assignedFarmSupervisorId: originalSupervisorId,
          status: plan.status || 'DRAFT',
        })

        const mappedStages = planStages.map((stage, index) => {
          const stageId =
            stage.id || stage.productionStageId || stage.stageId || null
          return {
            _key: `plan-${stageId || index}-${Date.now()}`,
            id: stageId,
            order: index + 1,
            title: stage.stageName || stage.title || stage.name || '',
            description: stage.note || stage.description || '',
            productionPlanId: stage.productionPlanId || id,
            startDate: stage.startDate ? dayjs(stage.startDate) : null,
            endDate: stage.endDate ? dayjs(stage.endDate) : null,
            status: stage.status || 'ACTIVE',
          }
        })
        setOriginalStages(mappedStages)
        setStages(mappedStages.length ? mappedStages : [createEmptyStage(1)])
      } finally {
        if (isMounted) setLoadingPlan(false)
      }
    }

    loadProductionPlan()
    return () => {
      isMounted = false
    }
  }, [form, id, isEdit])

  React.useEffect(() => {
    let isMounted = true;
    const fetchCatalogs = async () => {
      setIsCatalogsLoading(true);
      try {
        const response = await CropService.getCrops({ PageIndex: 1, PageSize: 100, Status: true });
        if (isMounted) setCatalogsData(normalizeResponse(response));
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setIsCatalogsLoading(false);
      }
    };
    if (!catalogsData) fetchCatalogs();
    return () => { isMounted = false; };
  }, [catalogsData]);

  React.useEffect(() => {
    let isMounted = true;
    const fetchCrops = async () => {
      setIsCropsLoading(true);
      try {
        const response = await CropManagementService.getCrops({ PageIndex: 1, PageSize: 1000, Status: true });
        if (isMounted) setCropsData(normalizeResponse(response));
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setIsCropsLoading(false);
      }
    };
    if (!cropsData) fetchCrops();
    return () => { isMounted = false; };
  }, [cropsData]);

  React.useEffect(() => {
    let isMounted = true;
    const fetchLands = async () => {
      setIsLandsLoading(true);
      try {
        const response = await LandPlotService.getLandPlots({ PageIndex: 1, PageSize: 1000, Status: 'Active' });
        if (isMounted) setLandsData(normalizeResponse(response));
      } catch (error) {
        console.error(error);
      } finally {
        if (isMounted) setIsLandsLoading(false);
      }
    };
    if (!landsData) fetchLands();
    return () => { isMounted = false; };
  }, [landsData]);

  React.useEffect(() => {
    let isMounted = true;
    const fetchParentPlans = async () => {
      setIsParentPlansLoading(true);
      try {
        const response = await ProductionPlanService.getAll({
          PageIndex: 1,
          PageSize: 1000,
          Scope: 'OVERALL',
        });
        if (isMounted) setParentPlansData(normalizeResponse(response));
      } catch (error) {
        console.error(error);
        if (isMounted) setParentPlansData([]);
      } finally {
        if (isMounted) setIsParentPlansLoading(false);
      }
    };

    if (selectedScope === 'SPECIFIC' && !parentPlansData) fetchParentPlans();
    return () => { isMounted = false; };
  }, [parentPlansData, selectedScope]);

  const categoryOptions = React.useMemo(() => {
    if (!catalogsData) return [];
    return catalogsData
      .filter((c) => {
        if (typeof c.isActive === 'boolean') return c.isActive;
        const status = String(c.status || '').toLowerCase();
        return !['inactive', 'disabled', 'deleted'].includes(status);
      })
      .map((c) => ({
        value: c.id || c._id || c.cropCatalogId,
        label: c.name,
      }));
  }, [catalogsData]);

  const cropVarietyOptions = React.useMemo(() => {
    if (!cropsData) return [];
    let filtered = cropsData.filter((c) => {
      if (typeof c.isActive === 'boolean') return c.isActive;
      const status = String(c.status || '').toLowerCase();
      return !['inactive', 'disabled', 'deleted'].includes(status);
    });

    if (selectedCatalogId) {
      filtered = filtered.filter((c) => (c.cropCatalogId || c.categoryId) === selectedCatalogId);
    }
    return filtered.map((c) => ({
      value: c.id || c._id || c.cropId,
      label: c.name,
    }));
  }, [cropsData, selectedCatalogId]);

  const areaOptions = React.useMemo(() => {
    if (!landsData) return [];
    return landsData.map((c) => ({
      value: c.id || c.landPlotId,
      label: c.name,
    }));
  }, [landsData]);

  const parentPlanOptions = React.useMemo(() => {
    if (!parentPlansData) return [];
    return parentPlansData
      .filter((plan) => {
        const planId = plan.id || plan._id || plan.productionPlanId
        return (!plan.scope || plan.scope === 'OVERALL') && planId !== id
      })
      .map((plan) => ({
        value: plan.id || plan._id || plan.productionPlanId,
        label: plan.planName || plan.name,
      }))
      .filter((option) => option.value && option.label);
  }, [id, parentPlansData]);

  // ── Load template if templateId from query ──
  useEffect(() => {
    if (!templateIdFromQuery || isEdit) return
    const loadTemplate = async () => {
      try {
        const res = await PlanTemplateService.getById(templateIdFromQuery)
        if (res?.success === false || !res?.data) return
        const t = res.data
        if (t.stages?.length) {
          setStages(
            t.stages.map((s, i) => ({
              _key: `tpl-${Date.now()}-${i}`,
              order: i + 1,
              title: s.title || '',
              description: s.description || '',
            }))
          )
        }
      } catch {
        // silent
      }
    }
    loadTemplate()
  }, [isEdit, templateIdFromQuery])

  // ── Stage handlers ──
  const addStage = () => {
    setStages((prev) => [...prev, createEmptyStage(prev.length + 1)])
  }

  const removeStage = (index) => {
    if (stages.length <= 1) return
    setStages((prev) => {
      const next = prev.filter((_, i) => i !== index)
      return next.map((s, i) => ({ ...s, order: i + 1 }))
    })
  }

  const updateStage = (index, field, value) => {
    setStages((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    )
  }

  const updatePlanDate = (previousPlanDate, stageField, value) => {
    setStages((prev) =>
      prev.map((stage) => {
        const stageDate = stage[stageField]
        const followsPlanDate =
          !stageDate ||
          (previousPlanDate && stageDate.isSame(previousPlanDate, 'day'))

        return followsPlanDate ? { ...stage, [stageField]: value } : stage
      })
    )
  }

  const syncProductionStages = async (
    productionPlanId,
    nextStages,
    planStartDate,
    planEndDate
  ) => {
    const nextIds = new Set(nextStages.map((stage) => stage.id).filter(Boolean))
    const removedStages = originalStages.filter(
      (stage) => stage.id && !nextIds.has(stage.id)
    )

    for (const stage of removedStages) {
      try {
        await ProductionStageService.remove(stage.id)
      } catch (error) {
        console.error('Production stage delete failed:', {
          stageId: stage.id,
          requestUrl: error.requestUrl,
          status: error.status,
          responseData: error.responseData,
          error,
        })
        throw new Error(`Không thể xóa giai đoạn "${stage.title}".`)
      }
    }

    for (const stage of nextStages) {
      const stagePayload = {
        productionPlanId,
        stageName: stage.stageName,
        startDate: formatApiDate(stage.startDate) || planStartDate,
        endDate: formatApiDate(stage.endDate) || planEndDate,
        status: stage.status || 'ACTIVE',
        note: stage.note,
      }

      const original = stage.id
        ? originalStages.find((item) => item.id === stage.id)
        : null
      const changed =
        !original ||
        original.title?.trim() !== stage.stageName ||
        (original.description?.trim() || null) !== stage.note ||
        formatApiDate(original.startDate) !== stagePayload.startDate ||
        formatApiDate(original.endDate) !== stagePayload.endDate ||
        (original.status || 'ACTIVE') !== stagePayload.status

      if (!changed) continue

      try {
        if (stage.id) {
          await ProductionStageService.update(stage.id, stagePayload)
        } else {
          await ProductionStageService.create(stagePayload)
        }
      } catch (error) {
        console.error('Production stage save failed:', {
          stageId: stage.id,
          requestUrl:
            error.requestUrl ||
            (stage.id
              ? `/production-stages/${stage.id}`
              : '/production-stages'),
          status: error.status,
          payload: stagePayload,
          responseData: error.responseData,
          error,
        })
        throw new Error(
          `Không thể ${stage.id ? 'cập nhật' : 'thêm'} giai đoạn "${stage.stageName}".`
        )
      }
    }
  }

  // ── Choose from template library ──
  const handleOpenTemplateModal = async () => {
    setTemplateModal(true)
    try {
      setTemplatesLoading(true)
      const res = await PlanTemplateService.getAll({ PageSize: 50 })
      setTemplates(res?.data?.items || [])
    } catch {
      // silent
    } finally {
      setTemplatesLoading(false)
    }
  }

  const handleSelectTemplate = (template) => {
    if (template.stages?.length) {
      setStages(
        template.stages.map((s, i) => ({
          _key: `tpl-${Date.now()}-${i}`,
          order: i + 1,
          title: s.title || '',
          description: s.description || '',
        }))
      )
    }
    setTemplateModal(false)
    message.success(`Đã áp dụng mẫu "${template.name}"`)
  }

  // ── Submit: Tạo Kế hoạch Sản xuất Mới ──
  const handleSubmit = async (values) => {
    const normalizedStages = stages
      .filter((stage) => stage.title?.trim())
      .map((stage) => ({
        ...stage,
        stageName: stage.title.trim(),
        note: stage.description?.trim() || null,
      }))

    const description = values.description?.trim()
    const commonBody = {
      landPlotId: values.area,
      cropId: values.cropVariety,
      planName: values.name?.trim(),
      startDate: formatApiDate(values.expectedStartDate),
      expectedEndDate: formatApiDate(values.expectedEndDate),
      description: description || null,
    }
    const body = isEdit
      ? {
          ...commonBody,
          status: immutablePlanFields?.status || 'DRAFT',
          scope: immutablePlanFields?.scope || 'OVERALL',
          parentPlanId: immutablePlanFields?.parentPlanId || null,
          assignedFarmSupervisorId:
            immutablePlanFields?.assignedFarmSupervisorId || null,
        }
      : {
          ...commonBody,
          status: 'DRAFT',
          scope: values.scope,
          parentPlanId:
            values.scope === 'SPECIFIC' ? values.parentPlanId : null,
          assignedFarmSupervisorId: values.supervisorId || null,
          productionStages: normalizedStages.map((stage) => ({
            stageName: stage.stageName,
            note: stage.note,
          })),
        }

    try {
      if (isEdit && !immutablePlanFields) {
        message.error('Chưa tải xong dữ liệu gốc của kế hoạch.')
        return
      }
      if (
        !isEdit &&
        values.expectedStartDate &&
        values.expectedStartDate.isBefore(dayjs().startOf('day'), 'day')
      ) {
        message.error('Ngày bắt đầu dự kiến không được trước ngày hiện tại.')
        return
      }
      if (
        values.expectedStartDate &&
        values.expectedEndDate &&
        !values.expectedStartDate.isBefore(values.expectedEndDate, 'day')
      ) {
        message.error(
          'Ngày bắt đầu phải trước ngày kết thúc dự kiến.'
        )
        return
      }
      const invalidStage = normalizedStages.find((stage) => {
        const stageStart = stage.startDate || values.expectedStartDate
        const stageEnd = stage.endDate || values.expectedEndDate
        return stageStart && stageEnd && !stageStart.isBefore(stageEnd, 'day')
      })
      if (invalidStage) {
        message.error(
          `Ngày bắt đầu của giai đoạn "${invalidStage.stageName}" phải trước ngày kết thúc.`
        )
        return
      }
      const stageOutsidePlan = normalizedStages.find((stage) => {
        const stageStart = stage.startDate || values.expectedStartDate
        const stageEnd = stage.endDate || values.expectedEndDate
        return (
          (stageStart &&
            values.expectedStartDate &&
            stageStart.isBefore(values.expectedStartDate, 'day')) ||
          (stageEnd &&
            values.expectedEndDate &&
            stageEnd.isAfter(values.expectedEndDate, 'day'))
        )
      })
      if (stageOutsidePlan) {
        message.error(
          `Thời gian của giai đoạn "${stageOutsidePlan.stageName}" phải nằm trong thời gian dự kiến của kế hoạch.`
        )
        return
      }
      setSubmitting(true)
      const planHasChanged =
        !isEdit ||
        !originalPlanValues ||
        originalPlanValues.landPlotId !== commonBody.landPlotId ||
        originalPlanValues.cropId !== commonBody.cropId ||
        originalPlanValues.planName !== commonBody.planName ||
        originalPlanValues.startDate !== commonBody.startDate ||
        originalPlanValues.expectedEndDate !== commonBody.expectedEndDate ||
        originalPlanValues.description !== commonBody.description

      let productionPlanId = id
      if (planHasChanged) {
        const res = isEdit
          ? await ProductionPlanService.update(id, body, { skipNotice: true })
          : await ProductionPlanService.create(body, { skipNotice: true })
        if (res?.success === false) return
        if (!isEdit) {
          productionPlanId = getCreatedPlanId(res)
        }
      }

      if (isEdit && productionPlanId && normalizedStages.length) {
        await syncProductionStages(
          productionPlanId,
          normalizedStages,
          commonBody.startDate,
          commonBody.expectedEndDate
        )
      }

      message.success(
        isEdit
          ? 'Cập nhật kế hoạch sản xuất thành công!'
          : 'Tạo kế hoạch sản xuất thành công!'
      )
      navigate(ROUTER.FM_PRODUCTION_PLANS)
    } catch (error) {
      message.error(error.message || 'Không thể cập nhật kế hoạch sản xuất.')
      console.error('Production plan submit failed:', {
        id,
        requestUrl: error.requestUrl || `/production-plans/${id}`,
        status: error.status,
        payload: body,
        responseData: error.responseData,
        error,
      })
    } finally {
      setSubmitting(false)
    }
  }

  // ── Submit: Lưu làm Mẫu ──
  const handleSaveAsTemplate = useCallback(async () => {
    const values = form.getFieldsValue()
    if (!values.name?.trim()) {
      message.warning('Vui lòng nhập tên kế hoạch trước.')
      return
    }

    const body = {
      name: `Mẫu từ: ${values.name.trim()}`,
      cropType: values.category,
      description: '',
      stages: stages.map((s) => ({
        order: s.order,
        title: s.title,
        description: s.description,
        materials: [],
      })),
    }

    try {
      setSavingTemplate(true)
      const res = await PlanTemplateService.create(body)
      if (res?.success === false) return
      message.success('Đã lưu làm kế hoạch mẫu!')
    } finally {
      setSavingTemplate(false)
    }
  }, [form, stages])

  return (
    <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* ── Header ── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTER.FM_PRODUCTION_PLANS)}>
            Quay lại
          </Button>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <CalendarOutlined className="text-green-600" />
            {isEdit ? 'Cập nhật Kế hoạch Sản xuất' : 'Tạo Kế hoạch Sản xuất'}
          </TitleCustom>
        </div>
      </div>

      {/* ── Main Card ── */}
      <Card
        bordered={false}
        className="shadow-sm rounded-2xl"
        bodyStyle={{ padding: '24px' }}
        loading={loadingPlan}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            scope: 'OVERALL',
          }}
        >
          {/* ════ Section 1 – Thông Tin Chung ════ */}
          <SectionTitle
            extra={
              <Button
                type="link"
                icon={<BookOutlined />}
                onClick={handleOpenTemplateModal}
                className="text-green-700 text-xs font-semibold p-0 h-auto"
              >
                ✦ Chọn từ thư viện mẫu
              </Button>
            }
          >
            Thông Tin Chung
          </SectionTitle>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item
                name="name"
                label={
                  <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                    Tên kế hoạch sản xuất
                  </span>
                }
                rules={[{ required: true, message: 'Vui lòng nhập tên kế hoạch sản xuất.' }]}
              >
                <Input
                  placeholder="VD: Kế hoạch Xuân Hè 2024"
                  className="h-10 rounded-lg"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="area"
                label={
                  <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                    Vùng trồng
                  </span>
                }
                rules={[{ required: true, message: 'Vui lòng chọn vùng trồng.' }]}
              >
                <Select
                  placeholder="Chọn vùng trồng..."
                  options={areaOptions}
                  loading={isLandsLoading}
                  className="h-10"
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="category"
                label={
                  <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                    Danh mục cây trồng
                  </span>
                }
              >
                <Select
                  placeholder="Chọn danh mục..."
                  options={categoryOptions}
                  loading={isCatalogsLoading}
                  className="h-10"
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="cropVariety"
                label={
                  <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                    Giống cây trồng
                  </span>
                }
                rules={[{ required: true, message: 'Vui lòng chọn giống cây trồng.' }]}
              >
                <Select
                  placeholder="Chọn giống cây trồng..."
                  options={cropVarietyOptions}
                  loading={isCropsLoading}
                  className="h-10"
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="expectedStartDate"
                label={
                  <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                    Ngày bắt đầu dự kiến
                  </span>
                }
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng chọn ngày bắt đầu dự kiến.',
                  },
                ]}
              >
                <DatePicker
                  placeholder="dd/mm/yyyy"
                  className="w-full h-10 rounded-lg"
                  format="DD/MM/YYYY"
                  disabledDate={(current) =>
                    !isEdit && current.isBefore(dayjs().startOf('day'), 'day')
                  }
                  onChange={(value) =>
                    updatePlanDate(selectedPlanStartDate, 'startDate', value)
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="expectedEndDate"
                label={
                  <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                    Ngày kết thúc dự kiến
                  </span>
                }
                dependencies={['expectedStartDate']}
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng chọn ngày kết thúc dự kiến.',
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const startDate = getFieldValue('expectedStartDate')
                      if (!value || !startDate || value.isAfter(startDate, 'day')) {
                        return Promise.resolve()
                      }
                      return Promise.reject(
                        new Error('Ngày kết thúc phải sau ngày bắt đầu.')
                      )
                    },
                  }),
                ]}
              >
                <DatePicker
                  placeholder="dd/mm/yyyy"
                  className="w-full h-10 rounded-lg"
                  format="DD/MM/YYYY"
                  disabledDate={(current) =>
                    selectedPlanStartDate &&
                    !current.isAfter(selectedPlanStartDate, 'day')
                  }
                  onChange={(value) =>
                    updatePlanDate(selectedPlanEndDate, 'endDate', value)
                  }
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="supervisorId"
                label={
                  <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                    <TeamOutlined /> Người giám sát
                  </span>
                }
              >
                <Select
                  placeholder="Chọn người giám sát..."
                  options={supervisorOptions}
                  loading={isSupervisorsLoading}
                  disabled={isEdit}
                  className="h-10"
                  showSearch
                  optionFilterProp="label"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="scope"
                label={
                  <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                    Phạm vi kế hoạch
                  </span>
                }
                rules={[{ required: true, message: 'Vui lòng chọn phạm vi kế hoạch.' }]}
              >
                <Select
                  options={PRODUCTION_PLAN_SCOPE_OPTIONS}
                  disabled={isEdit}
                  className="h-10"
                  onChange={(value) => {
                    if (value === 'OVERALL') {
                      form.setFieldValue('parentPlanId', undefined)
                    }
                  }}
                />
              </Form.Item>
            </Col>
            {selectedScope === 'SPECIFIC' && (
              <Col xs={24} md={12}>
                <Form.Item
                  name="parentPlanId"
                  label={
                    <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                      Kế hoạch cha
                    </span>
                  }
                  rules={[{ required: true, message: 'Vui lòng chọn kế hoạch cha.' }]}
                >
                  <Select
                    placeholder="Chọn kế hoạch tổng thể..."
                    options={parentPlanOptions}
                    loading={isParentPlansLoading}
                    disabled={isEdit}
                    className="h-10"
                    showSearch
                    optionFilterProp="label"
                  />
                </Form.Item>
              </Col>
            )}
            <Col xs={24}>
              <Form.Item
                name="description"
                label={
                  <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                    Mô tả kế hoạch
                  </span>
                }
              >
                <Input.TextArea
                  placeholder="Nhập mô tả chung cho kế hoạch sản xuất..."
                  rows={3}
                  className="rounded-lg"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* ════ Section 2 – Giai Đoạn Sản Xuất ════ */}
          <SectionTitle>Giai Đoạn Sản Xuất</SectionTitle>

          <div className="space-y-2 mb-3">
            {stages.map((stage, index) => (
              <div
                key={stage._key}
                className="flex flex-col gap-3 rounded-lg bg-gray-50 border border-gray-100 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      index === 0
                        ? 'bg-green-600 text-white shadow-md shadow-green-200'
                        : 'bg-white border-2 border-gray-200 text-gray-400'
                    }`}
                  >
                    {index + 1}
                  </div>
                  <Input
                    value={stage.title}
                    onChange={(e) => updateStage(index, 'title', e.target.value)}
                    placeholder={`Tên giai đoạn ${index + 1}`}
                    className="flex-1 h-9 rounded-lg font-semibold"
                  />
                  {stages.length > 1 && (
                    <Button
                      type="text"
                      danger
                      icon={<MinusCircleOutlined />}
                      onClick={() => removeStage(index)}
                      className="!h-9 !w-9 shrink-0 rounded-lg"
                    />
                  )}
                </div>
                <div>
                  <Text type="secondary" className="block mb-1 text-xs">Mô tả kỹ thuật</Text>
                  <Input.TextArea
                    value={stage.description}
                    onChange={(e) => updateStage(index, 'description', e.target.value)}
                    placeholder="Nhập hướng dẫn kỹ thuật chi tiết..."
                    rows={3}
                    className="rounded-lg text-sm"
                  />
                </div>
                <Row gutter={[12, 8]}>
                  <Col xs={24} md={8}>
                    <Text type="secondary" className="block mb-1 text-xs">
                      Ngày bắt đầu giai đoạn
                    </Text>
                    <DatePicker
                      value={stage.startDate}
                      onChange={(value) =>
                        updateStage(index, 'startDate', value)
                      }
                      placeholder="Theo ngày bắt đầu kế hoạch"
                      format="DD/MM/YYYY"
                      className="w-full h-9 rounded-lg"
                      disabledDate={(current) =>
                        (selectedPlanStartDate &&
                          current.isBefore(selectedPlanStartDate, 'day')) ||
                        (selectedPlanEndDate &&
                          current.isAfter(selectedPlanEndDate, 'day'))
                      }
                    />
                  </Col>
                  <Col xs={24} md={8}>
                    <Text type="secondary" className="block mb-1 text-xs">
                      Ngày kết thúc giai đoạn
                    </Text>
                    <DatePicker
                      value={stage.endDate}
                      onChange={(value) =>
                        updateStage(index, 'endDate', value)
                      }
                      placeholder="Theo ngày kết thúc kế hoạch"
                      format="DD/MM/YYYY"
                      className="w-full h-9 rounded-lg"
                      disabledDate={(current) =>
                        (selectedPlanStartDate &&
                          current.isBefore(selectedPlanStartDate, 'day')) ||
                        (selectedPlanEndDate &&
                          current.isAfter(selectedPlanEndDate, 'day')) ||
                        (stage.startDate &&
                          !current.isAfter(stage.startDate, 'day'))
                      }
                    />
                  </Col>
                  <Col xs={24} md={8}>
                    <Text type="secondary" className="block mb-1 text-xs">
                      Trạng thái giai đoạn
                    </Text>
                    <Select
                      value={stage.status || 'ACTIVE'}
                      onChange={(value) =>
                        updateStage(index, 'status', value)
                      }
                      options={[
                        { value: 'ACTIVE', label: 'Hoạt động' },
                        { value: 'INACTIVE', label: 'Ngừng hoạt động' },
                      ]}
                      className="w-full h-9"
                    />
                  </Col>
                </Row>
              </div>
            ))}
          </div>

          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={addStage}
            className="w-full mb-5 rounded-lg border-green-400 text-green-700 hover:border-green-500"
          >
            Thêm Giai Đoạn
          </Button>

          {/* ── Footer actions ── */}
          <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
            <Button
              onClick={handleSaveAsTemplate}
              loading={savingTemplate}
              className="h-10 px-6 rounded-xl"
              disabled={submitting}
            >
              Lưu làm Mẫu
            </Button>
            <Button
              onClick={() => navigate(ROUTER.FM_PRODUCTION_PLANS)}
              className="h-10 px-6 rounded-xl"
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              icon={isEdit ? <EditOutlined /> : <PlusOutlined />}
              className="h-10 px-6 font-bold bg-green-600 border-0 shadow-lg rounded-xl shadow-green-100"
            >
              {isEdit ? 'Lưu thay đổi' : 'Tạo Kế hoạch Mới'}
            </Button>
          </div>
        </Form>
      </Card>

      {/* ── Modal: Chọn từ thư viện mẫu ── */}
      <Modal
        open={templateModal}
        onCancel={() => setTemplateModal(false)}
        title={<span className="font-bold text-gray-800">Chọn kế hoạch mẫu</span>}
        footer={null}
        width={520}
      >
        {templatesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <BookOutlined className="text-4xl mb-3" />
            <p className="text-sm">Chưa có kế hoạch mẫu nào.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => handleSelectTemplate(t)}
                className="w-full text-left p-3 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50/50 transition-all cursor-pointer bg-white"
              >
                <div className="font-semibold text-gray-800 text-sm">{t.name}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {t.stageCount || t.stages?.length || 0} giai đoạn
                  {t.description && ` · ${t.description}`}
                </div>
              </button>
            ))}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ProductionPlanCreate
