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
  SearchOutlined,
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
  Tag,
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
import ProcessStepService from 'src/services/ProcessStepService'
import CropService from 'src/services/CropService'
import CropManagementService from 'src/services/CropManagementService'
import LandPlotService from 'src/services/LandPlotService'
import UserService from 'src/services/UserService'
import StandardTaskService from 'src/services/StandardTaskService'
import CultivationTaskService from 'src/services/CultivationTaskService'
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
  response?.data?.data?.id ||
  response?.data?.data?.cultivationLogbookId ||
  response?.data?.id ||
  response?.data?.cultivationLogbookId ||
  response?.data?.productionPlanId ||
  response?.data?.processTemplateId ||
  response?.id ||
  response?.productionPlanId ||
  response?.processTemplateId ||
  null

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

const createEmptyTask = (order, stageKey) => ({
  _key: `task-${Date.now()}-${order}`,
  id: null,
  stageKey,
  taskLibraryId: null,
  name: '',
  description: '',
  startDate: null,
  dueDate: null,
  assigneeIds: [],
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
  const selectedPlanStartDate = Form.useWatch('expectedStartDate', form);
  const selectedPlanEndDate = Form.useWatch('expectedEndDate', form);

  // ── Stages state ──
  const [stages, setStages] = useState([createEmptyStage(1)])
  const [originalStages, setOriginalStages] = useState([])
  const [workTasks, setWorkTasks] = useState([])
  const [originalWorkTasks, setOriginalWorkTasks] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [savingTemplate, setSavingTemplate] = useState(false)
  const [loadingPlan, setLoadingPlan] = useState(false)
  const [immutablePlanFields, setImmutablePlanFields] = useState(null)
  const [originalPlanValues, setOriginalPlanValues] = useState(null)

  // ── Dropdown options ──
  const [supervisorOptions, setSupervisorOptions] = useState([])
  const [isSupervisorsLoading, setIsSupervisorsLoading] = useState(false)
  const [farmerOptions, setFarmerOptions] = useState([])
  const [isFarmersLoading, setIsFarmersLoading] = useState(false)
  const [taskLibraryOptions, setTaskLibraryOptions] = useState([])
  const [isTaskLibrariesLoading, setIsTaskLibrariesLoading] = useState(false)

  const [catalogsData, setCatalogsData] = useState(null);
  const [isCatalogsLoading, setIsCatalogsLoading] = useState(false);
  const [cropsData, setCropsData] = useState(null);
  const [isCropsLoading, setIsCropsLoading] = useState(false);
  const [landsData, setLandsData] = useState(null);
  const [isLandsLoading, setIsLandsLoading] = useState(false);
  // ── Template modal ──
  const [templateModal, setTemplateModal] = useState(false)
  const [templates, setTemplates] = useState([])
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [templateSearch, setTemplateSearch] = useState('')

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

  React.useEffect(() => {
    let isMounted = true
    const fetchFarmers = async () => {
      setIsFarmersLoading(true)
      try {
        const response = await UserService.getUsers({
          PageIndex: 1,
          PageSize: 1000,
          Role: ROLES.FARMER,
          IsActive: true,
        })
        if (!isMounted) return
        setFarmerOptions(
          normalizeResponse(response)
            .filter((user) => user.isActive !== false)
            .map((user) => ({
              value: user.id || user._id || user.userId,
              label: user.fullName || user.name || user.email,
            }))
            .filter((option) => option.value)
        )
      } catch (error) {
        console.error(error)
        if (isMounted) setFarmerOptions([])
      } finally {
        if (isMounted) setIsFarmersLoading(false)
      }
    }

    fetchFarmers()
    return () => {
      isMounted = false
    }
  }, [])

  React.useEffect(() => {
    let isMounted = true
    const fetchTaskLibraries = async () => {
      setIsTaskLibrariesLoading(true)
      try {
        const response = await StandardTaskService.getAll({
          PageIndex: 1,
          PageSize: 1000,
          Status: true,
        })
        if (!isMounted) return
        setTaskLibraryOptions(
          normalizeResponse(response)
            .filter((task) => task.isActive !== false)
            .map((task) => ({
              value: task.id || task.taskLibraryId,
              label: task.title || task.name,
              description: task.description || '',
            }))
            .filter((option) => option.value && option.label)
        )
      } catch (error) {
        console.error(error)
        if (isMounted) setTaskLibraryOptions([])
      } finally {
        if (isMounted) setIsTaskLibrariesLoading(false)
      }
    }
    fetchTaskLibraries()
    return () => {
      isMounted = false
    }
  }, [])

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
        let planStages =
          plan.cultivationStages || plan.productionStages || plan.stages || []
        let planTasks = plan.tasks || plan.cultivationTasks || []
        const originalSupervisorId =
          plan.assignedFarmSupervisorId ||
          supervisor.id ||
          supervisor.userId ||
          null
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

        try {
          const tasksResponse = await CultivationTaskService.getAll({
            PageIndex: 1,
            PageSize: 1000,
          })
          const tasksByPlan = normalizeResponse(tasksResponse).filter(
            (task) =>
              (task.cultivationLogbookId ||
                task.productionPlanId ||
                task.logbookId) === id
          )
          if (tasksByPlan.length) {
            planTasks = tasksByPlan
          }
        } catch (error) {
          console.error('Không thể lấy công việc canh tác:', error)
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
          farmerIds:
            plan.farmerIds ||
            plan.farmers?.map((farmer) => farmer.id || farmer.userId) ||
            [],
        }
        form.setFieldsValue(loadedPlanValues)
        setOriginalPlanValues({
          landPlotId: loadedPlanValues.area,
          cropId: loadedPlanValues.cropVariety,
          planName: loadedPlanValues.name?.trim() || '',
          startDate: formatApiDate(loadedPlanValues.expectedStartDate),
          expectedEndDate: formatApiDate(loadedPlanValues.expectedEndDate),
          farmerIds: [...(loadedPlanValues.farmerIds || [])].sort().join(','),
        })
        setImmutablePlanFields({
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

        const mappedTasks = planTasks.map((task, index) => {
          const taskStartDate = task.startDate ? dayjs(task.startDate) : null
          const taskDueDate = task.dueDate ? dayjs(task.dueDate) : null
          const matchedStage = mappedStages.find((stage) => {
            const stageStartDate =
              stage.startDate || loadedPlanValues.expectedStartDate
            const stageEndDate =
              stage.endDate || loadedPlanValues.expectedEndDate
            return (
              taskStartDate &&
              taskDueDate &&
              stageStartDate &&
              stageEndDate &&
              !taskStartDate.isBefore(stageStartDate, 'day') &&
              !taskDueDate.isAfter(stageEndDate, 'day')
            )
          })
          return {
            _key: `task-${task.id || index}-${Date.now()}`,
            id: task.id || task.cultivationTaskId || null,
            stageKey: matchedStage?._key || mappedStages[0]?._key,
            taskLibraryId:
              task.taskLibraryId ||
              task.standardTaskId ||
              task.taskLibrary?.id,
            name: task.name || task.title || '',
            description: task.description || '',
            startDate: taskStartDate,
            dueDate: taskDueDate,
            assigneeIds:
              task.assigneeIds ||
              task.assignees?.map(
                (assignee) => assignee.id || assignee.userId
              ) ||
              [],
          }
        })
        setOriginalWorkTasks(mappedTasks)
        setWorkTasks(mappedTasks)
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

  // ── Load template if templateId from query ──
  useEffect(() => {
    if (!templateIdFromQuery || isEdit) return
    const loadTemplate = async () => {
      try {
        const [templateResponse, stepsResponse] = await Promise.all([
          PlanTemplateService.getById(templateIdFromQuery),
          ProcessStepService.getAll({ PageIndex: 1, PageSize: 1000 }),
        ])
        if (templateResponse?.success === false) return
        const templateSteps = normalizeResponse(stepsResponse)
          .filter(
            (step) =>
              (step.processTemplateId || step.processTemplate?.id) ===
              templateIdFromQuery
          )
          .sort(
            (first, second) =>
              (first.stepOrder || 0) - (second.stepOrder || 0)
          )
        if (templateSteps.length) {
          setStages(
            templateSteps.map((step, i) => ({
              _key: `tpl-${Date.now()}-${i}`,
              order: i + 1,
              title: step.stepName || '',
              description: [step.description, step.note]
                .filter(Boolean)
                .join('\n'),
              startDate: null,
              endDate: null,
              status: 'ACTIVE',
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
    const removedStageKey = stages[index]?._key
    setStages((prev) => {
      const next = prev.filter((_, i) => i !== index)
      return next.map((s, i) => ({ ...s, order: i + 1 }))
    })
    setWorkTasks((prev) =>
      prev.filter((task) => task.stageKey !== removedStageKey)
    )
  }

  const updateStage = (index, field, value) => {
    setStages((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    )
  }

  const addWorkTask = (stageKey) => {
    setWorkTasks((prev) => [
      ...prev,
      createEmptyTask(prev.length + 1, stageKey),
    ])
  }

  const removeWorkTask = (index) => {
    setWorkTasks((prev) => prev.filter((_, taskIndex) => taskIndex !== index))
  }

  const updateWorkTask = (index, field, value) => {
    setWorkTasks((prev) =>
      prev.map((task, taskIndex) =>
        taskIndex === index ? { ...task, [field]: value } : task
      )
    )
  }

  const selectTaskLibrary = (index, taskLibraryId) => {
    const selectedTask = taskLibraryOptions.find(
      (option) => option.value === taskLibraryId
    )
    setWorkTasks((prev) =>
      prev.map((task, taskIndex) =>
        taskIndex === index
          ? {
              ...task,
              taskLibraryId,
              name: selectedTask?.label || task.name,
              description: selectedTask?.description || task.description,
            }
          : task
      )
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

  const syncWorkTasks = async (cultivationLogbookId, nextTasks) => {
    const nextIds = new Set(nextTasks.map((task) => task.id).filter(Boolean))
    const removedTasks = originalWorkTasks.filter(
      (task) => task.id && !nextIds.has(task.id)
    )

    for (const task of removedTasks) {
      await CultivationTaskService.remove(task.id)
    }

    for (const task of nextTasks) {
      const commonTaskPayload = {
        name: task.name,
        description: task.description,
        startDate: formatApiDate(task.startDate),
        dueDate: formatApiDate(task.dueDate),
      }
      const original = task.id
        ? originalWorkTasks.find((item) => item.id === task.id)
        : null
      const changed =
        !original ||
        original.name?.trim() !== task.name ||
        (original.description?.trim() || null) !== task.description ||
        formatApiDate(original.startDate) !== commonTaskPayload.startDate ||
        formatApiDate(original.dueDate) !== commonTaskPayload.dueDate

      if (!changed) continue

      if (task.id) {
        await CultivationTaskService.update(task.id, commonTaskPayload)
      } else {
        await CultivationTaskService.create({
          cultivationLogbookId,
          taskLibraryId: task.taskLibraryId,
          ...commonTaskPayload,
        })
      }
    }
  }

  // ── Choose from template library ──
  const handleOpenTemplateModal = async () => {
    setTemplateModal(true)
    setTemplateSearch('')
    try {
      setTemplatesLoading(true)
      const [templateResponse, stepResponse] = await Promise.all([
        PlanTemplateService.getAll({ PageIndex: 1, PageSize: 1000 }),
        ProcessStepService.getAll({ PageIndex: 1, PageSize: 1000 }),
      ])
      const stepCountByTemplate = normalizeResponse(stepResponse).reduce(
        (counts, step) => {
          const processTemplateId =
            step.processTemplateId || step.processTemplate?.id
          if (processTemplateId) {
            counts[processTemplateId] =
              (counts[processTemplateId] || 0) + 1
          }
          return counts
        },
        {}
      )
      setTemplates(
        normalizeResponse(templateResponse).map((template) => ({
          ...template,
          _stepCount: stepCountByTemplate[template.id] || 0,
        }))
      )
    } catch {
      // silent
    } finally {
      setTemplatesLoading(false)
    }
  }

  const handleSelectTemplate = async (template) => {
    try {
      setTemplatesLoading(true)
      const stepsResponse = await ProcessStepService.getAll({
        PageIndex: 1,
        PageSize: 1000,
      })
      const templateSteps = normalizeResponse(stepsResponse)
        .filter(
          (step) =>
            (step.processTemplateId || step.processTemplate?.id) === template.id
        )
        .sort(
          (first, second) =>
            (first.stepOrder || 0) - (second.stepOrder || 0)
        )
      if (templateSteps.length) {
        setStages(
          templateSteps.map((step, i) => ({
            _key: `tpl-${Date.now()}-${i}`,
            order: i + 1,
            title: step.stepName || '',
            description: [step.description, step.note]
              .filter(Boolean)
              .join('\n'),
            startDate: null,
            endDate: null,
            status: 'ACTIVE',
          }))
        )
        setWorkTasks([])
      }
      setTemplateModal(false)
      message.success(`Đã áp dụng mẫu "${template.name}"`)
    } finally {
      setTemplatesLoading(false)
    }
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
    const normalizedTasks = workTasks
      .filter(
        (task) =>
          task.taskLibraryId ||
          task.name?.trim() ||
          task.description?.trim() ||
          task.startDate ||
          task.dueDate
      )
      .map((task) => ({
        ...task,
        name: task.name?.trim() || '',
        description: task.description?.trim() || null,
      }))

    const commonBody = {
      landPlotId: values.area,
      cropId: values.cropVariety,
      planName: values.name?.trim(),
      startDate: formatApiDate(values.expectedStartDate),
      expectedEndDate: formatApiDate(values.expectedEndDate),
      farmerIds: values.farmerIds || [],
    }
    const body = isEdit
      ? {
          ...commonBody,
          status: immutablePlanFields?.status || 'DRAFT',
        }
      : {
          ...commonBody,
          status: 'DRAFT',
          assignedFarmSupervisorId: values.supervisorId || null,
          cultivationStages: normalizedStages.map((stage) => ({
            stageName: stage.stageName,
            note: stage.note,
          })),
        }

    try {
      if (isEdit && !immutablePlanFields) {
        message.error('Chưa tải xong dữ liệu gốc của nhật ký.')
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
          `Thời gian của giai đoạn "${stageOutsidePlan.stageName}" phải nằm trong thời gian dự kiến của nhật ký.`
        )
        return
      }
      const incompleteTask = normalizedTasks.find(
        (task) =>
          !task.taskLibraryId ||
          !task.name ||
          !task.startDate ||
          !task.dueDate
      )
      if (incompleteTask) {
        message.error(
          'Mỗi công việc cần có công việc mẫu, tên, ngày bắt đầu và hạn hoàn thành.'
        )
        return
      }
      const invalidTask = normalizedTasks.find(
        (task) => task.startDate.isAfter(task.dueDate, 'day')
      )
      if (invalidTask) {
        message.error(
          `Ngày bắt đầu công việc "${invalidTask.name}" không được sau hạn hoàn thành.`
        )
        return
      }
      const taskOutsidePlan = normalizedTasks.find(
        (task) =>
          task.startDate.isBefore(values.expectedStartDate, 'day') ||
          task.dueDate.isAfter(values.expectedEndDate, 'day')
      )
      if (taskOutsidePlan) {
        message.error(
          `Thời gian công việc "${taskOutsidePlan.name}" phải nằm trong thời gian của nhật ký.`
        )
        return
      }
      const taskOutsideStage = normalizedTasks.find((task) => {
        const parentStage = stages.find(
          (stage) => stage._key === task.stageKey
        )
        if (!parentStage) return true
        const stageStart = parentStage.startDate || values.expectedStartDate
        const stageEnd = parentStage.endDate || values.expectedEndDate
        return (
          task.startDate.isBefore(stageStart, 'day') ||
          task.dueDate.isAfter(stageEnd, 'day')
        )
      })
      if (taskOutsideStage) {
        message.error(
          `Thời gian công việc "${taskOutsideStage.name}" phải nằm trong giai đoạn canh tác đã chọn.`
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
        originalPlanValues.farmerIds !==
          [...commonBody.farmerIds].sort().join(',')

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

      if (
        isEdit &&
        productionPlanId &&
        (normalizedStages.length || originalStages.length)
      ) {
        await syncProductionStages(
          productionPlanId,
          normalizedStages,
          commonBody.startDate,
          commonBody.expectedEndDate
        )
      }

      if (normalizedTasks.length || originalWorkTasks.length) {
        if (!productionPlanId) {
          throw new Error(
            'API chưa trả mã nhật ký nên không thể lưu chi tiết công việc.'
          )
        }
        await syncWorkTasks(productionPlanId, normalizedTasks)
      }

      message.success(
        isEdit
          ? 'Cập nhật nhật ký canh tác thành công!'
          : 'Tạo nhật ký canh tác thành công!'
      )
      navigate(ROUTER.FM_PRODUCTION_PLANS)
    } catch (error) {
      message.error(error.message || 'Không thể lưu nhật ký canh tác.')
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
      message.warning('Vui lòng nhập tên nhật ký trước.')
      return
    }
    if (!values.category) {
      message.warning('Vui lòng chọn danh mục cây trồng trước.')
      return
    }

    const body = {
      name: `Mẫu từ: ${values.name.trim()}`,
      cropCatalogId: values.category,
      cropId: values.cropVariety || null,
      estimatedDurationDays:
        values.expectedStartDate && values.expectedEndDate
          ? values.expectedEndDate.diff(values.expectedStartDate, 'day')
          : null,
    }

    try {
      setSavingTemplate(true)
      const res = await PlanTemplateService.create(body, { skipNotice: true })
      if (res?.success === false) return
      const processTemplateId = getCreatedPlanId(res)
      if (!processTemplateId) {
        throw new Error(
          'API đã tạo mẫu nhưng không trả về ID để lưu các bước quy trình.'
        )
      }
      const validStages = stages.filter((stage) => stage.title?.trim())
      for (const [index, stage] of validStages.entries()) {
        await ProcessStepService.create({
          processTemplateId,
          stepName: stage.title.trim(),
          stepOrder: index + 1,
          description: stage.description?.trim() || null,
          estimatedDay:
            stage.startDate && values.expectedStartDate
              ? stage.startDate.diff(values.expectedStartDate, 'day')
              : null,
          requiredMaterialType: null,
          note: null,
        })
      }
      message.success('Đã lưu thành mẫu quy trình.')
    } catch (error) {
      message.error(error.message || 'Không thể lưu thành mẫu quy trình.')
    } finally {
      setSavingTemplate(false)
    }
  }, [form, stages])

  const stage = stages[0]

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
            {isEdit ? 'Cập nhật Nhật ký Canh tác' : 'Tạo Nhật ký Canh tác'}
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
                    Tên nhật ký canh tác
                  </span>
                }
                rules={[{ required: true, message: 'Vui lòng nhập tên nhật ký canh tác.' }]}
              >
                <Input
                  placeholder="VD: Nhật ký canh tác vụ Xuân Hè 2024"
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
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng chọn danh mục cây trồng.',
                  },
                ]}
              >
                <Select
                  placeholder="Chọn danh mục..."
                  options={categoryOptions}
                  loading={isCatalogsLoading}
                  className="h-10"
                  showSearch
                  optionFilterProp="label"
                  onChange={() =>
                    form.setFieldValue('cropVariety', undefined)
                  }
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
                  disabled={!selectedCatalogId}
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
                name="farmerIds"
                label={
                  <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                    <TeamOutlined /> Nông dân thực hiện
                  </span>
                }
              >
                <Select
                  mode="multiple"
                  allowClear
                  placeholder="Chọn một hoặc nhiều nông dân..."
                  options={farmerOptions}
                  loading={isFarmersLoading}
                  className="h-10"
                  showSearch
                  optionFilterProp="label"
                  maxTagCount="responsive"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* ════ Section 2 – Giai Đoạn Sản Xuất ════ */}
          <SectionTitle>Giai đoạn Canh tác</SectionTitle>

          <div className="relative ml-4 pl-7 mb-4 space-y-4 border-l-2 border-green-100">
            {stages.map((stage, index) => (
              <div
                key={stage._key}
                className="relative flex flex-col gap-4 px-5 py-4 bg-white border border-gray-200 shadow-sm rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="absolute -left-[46px] top-4 flex h-7 w-7 items-center justify-center rounded-full border-2 border-green-700 bg-white text-xs font-bold text-green-800"
                  >
                    {index + 1}
                  </div>
                  <Input
                    value={stage.title}
                    onChange={(e) => updateStage(index, 'title', e.target.value)}
                    placeholder={`Tên giai đoạn ${index + 1}`}
                    className="flex-1 h-10 text-base font-bold text-green-950 rounded-lg"
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
                  <Text className="block mb-2 text-xs font-medium text-gray-600">
                    Mô tả
                  </Text>
                  <Input.TextArea
                    value={stage.description}
                    onChange={(e) => updateStage(index, 'description', e.target.value)}
                    placeholder="Nhập hướng dẫn kỹ thuật chi tiết..."
                    rows={3}
                    className="text-sm bg-white rounded-lg"
                  />
                </div>
                <Row gutter={[12, 8]} className="hidden">
                  <Col xs={24} md={12}>
                    <Text type="secondary" className="block mb-1 text-xs">
                      Ngày bắt đầu giai đoạn
                    </Text>
                    <DatePicker
                      value={stage.startDate}
                      onChange={(value) =>
                        updateStage(index, 'startDate', value)
                      }
                      placeholder="Theo ngày bắt đầu nhật ký"
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
                  <Col xs={24} md={12}>
                    <Text type="secondary" className="block mb-1 text-xs">
                      Ngày kết thúc giai đoạn
                    </Text>
                    <DatePicker
                      value={stage.endDate}
                      onChange={(value) =>
                        updateStage(index, 'endDate', value)
                      }
                      placeholder="Theo ngày kết thúc nhật ký"
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
                </Row>
                <div className="pt-3 border-t border-green-100">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <Text strong className="text-sm text-green-800">
                        Chi tiết công việc
                      </Text>
                      <Text type="secondary" className="block text-xs">
                        Công việc thuộc giai đoạn {index + 1}
                      </Text>
                    </div>
                    <Button
                      type="dashed"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => addWorkTask(stage._key)}
                      className="text-green-700 border-green-400 rounded-lg"
                    >
                      Thêm Công việc
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {workTasks.map((task, taskIndex) =>
                      task.stageKey === stage._key ? (
                        <div
                          key={task._key}
                          className="p-3 bg-white border border-green-100 rounded-xl"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Text strong>
                              Công việc{' '}
                              {workTasks
                                .slice(0, taskIndex)
                                .filter(
                                  (item) => item.stageKey === stage._key
                                ).length + 1}
                            </Text>
                            <Button
                              type="text"
                              danger
                              icon={<MinusCircleOutlined />}
                              onClick={() => removeWorkTask(taskIndex)}
                            />
                          </div>
                          <Row gutter={[12, 10]}>
                            <Col xs={24} md={12}>
                              <Select
                                value={task.taskLibraryId}
                                onChange={(value) =>
                                  selectTaskLibrary(taskIndex, value)
                                }
                                options={taskLibraryOptions}
                                loading={isTaskLibrariesLoading}
                                placeholder="Chọn công việc mẫu..."
                                showSearch
                                optionFilterProp="label"
                                className="w-full"
                                disabled={Boolean(task.id)}
                              />
                            </Col>
                            <Col xs={24} md={12}>
                              <Input
                                value={task.name}
                                onChange={(event) =>
                                  updateWorkTask(
                                    taskIndex,
                                    'name',
                                    event.target.value
                                  )
                                }
                                placeholder="Tên công việc..."
                              />
                            </Col>
                            <Col xs={24} md={12}>
                              <DatePicker
                                value={task.startDate}
                                onChange={(value) =>
                                  updateWorkTask(
                                    taskIndex,
                                    'startDate',
                                    value
                                  )
                                }
                                placeholder="Ngày bắt đầu"
                                format="DD/MM/YYYY"
                                className="w-full"
                                disabledDate={(current) => {
                                  const stageStart =
                                    stage.startDate || selectedPlanStartDate
                                  const stageEnd =
                                    stage.endDate || selectedPlanEndDate
                                  return (
                                    (stageStart &&
                                      current.isBefore(stageStart, 'day')) ||
                                    (stageEnd &&
                                      current.isAfter(stageEnd, 'day'))
                                  )
                                }}
                              />
                            </Col>
                            <Col xs={24} md={12}>
                              <DatePicker
                                value={task.dueDate}
                                onChange={(value) =>
                                  updateWorkTask(
                                    taskIndex,
                                    'dueDate',
                                    value
                                  )
                                }
                                placeholder="Hạn hoàn thành"
                                format="DD/MM/YYYY"
                                className="w-full"
                                disabledDate={(current) => {
                                  const stageStart =
                                    stage.startDate || selectedPlanStartDate
                                  const stageEnd =
                                    stage.endDate || selectedPlanEndDate
                                  return (
                                    (stageStart &&
                                      current.isBefore(stageStart, 'day')) ||
                                    (stageEnd &&
                                      current.isAfter(stageEnd, 'day')) ||
                                    (task.startDate &&
                                      current.isBefore(task.startDate, 'day'))
                                  )
                                }}
                              />
                            </Col>
                            <Col xs={24}>
                              <Input.TextArea
                                value={task.description}
                                onChange={(event) =>
                                  updateWorkTask(
                                    taskIndex,
                                    'description',
                                    event.target.value
                                  )
                                }
                                rows={2}
                                placeholder="Mô tả và hướng dẫn thực hiện..."
                              />
                            </Col>
                          </Row>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
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

          <div className="hidden">
          <SectionTitle>Chi tiết Công việc</SectionTitle>

          <div className="mb-3 space-y-3">
            {workTasks.map((task, index) => (
              <div
                key={task._key}
                className="p-4 border border-gray-100 rounded-xl bg-gray-50/70"
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 font-semibold text-gray-700">
                    <span className="flex items-center justify-center w-8 h-8 text-sm font-bold text-green-700 bg-green-100 rounded-full">
                      {index + 1}
                    </span>
                    Công việc {index + 1}
                  </div>
                  <Button
                    type="text"
                    danger
                    icon={<MinusCircleOutlined />}
                    onClick={() => removeWorkTask(index)}
                  />
                </div>

                <Row gutter={[12, 12]}>
                  <Col xs={24} md={12}>
                    <Text type="secondary" className="block mb-1 text-xs">
                      Công việc mẫu <span className="text-red-500">*</span>
                    </Text>
                    <Select
                      value={task.taskLibraryId}
                      onChange={(value) => selectTaskLibrary(index, value)}
                      options={taskLibraryOptions}
                      loading={isTaskLibrariesLoading}
                      placeholder="Chọn công việc từ thư viện..."
                      showSearch
                      optionFilterProp="label"
                      className="w-full"
                      disabled={Boolean(task.id)}
                    />
                  </Col>
                  <Col xs={24} md={12}>
                    <Text type="secondary" className="block mb-1 text-xs">
                      Tên công việc <span className="text-red-500">*</span>
                    </Text>
                    <Input
                      value={task.name}
                      onChange={(event) =>
                        updateWorkTask(index, 'name', event.target.value)
                      }
                      placeholder="Nhập tên công việc..."
                    />
                  </Col>
                  <Col xs={24} md={12}>
                    <Text type="secondary" className="block mb-1 text-xs">
                      Ngày bắt đầu <span className="text-red-500">*</span>
                    </Text>
                    <DatePicker
                      value={task.startDate}
                      onChange={(value) =>
                        updateWorkTask(index, 'startDate', value)
                      }
                      format="DD/MM/YYYY"
                      className="w-full"
                      disabledDate={(current) =>
                        (selectedPlanStartDate &&
                          current.isBefore(selectedPlanStartDate, 'day')) ||
                        (selectedPlanEndDate &&
                          current.isAfter(selectedPlanEndDate, 'day'))
                      }
                    />
                  </Col>
                  <Col xs={24} md={12}>
                    <Text type="secondary" className="block mb-1 text-xs">
                      Hạn hoàn thành <span className="text-red-500">*</span>
                    </Text>
                    <DatePicker
                      value={task.dueDate}
                      onChange={(value) =>
                        updateWorkTask(index, 'dueDate', value)
                      }
                      format="DD/MM/YYYY"
                      className="w-full"
                      disabledDate={(current) =>
                        (selectedPlanStartDate &&
                          current.isBefore(selectedPlanStartDate, 'day')) ||
                        (selectedPlanEndDate &&
                          current.isAfter(selectedPlanEndDate, 'day')) ||
                        (task.startDate &&
                          current.isBefore(task.startDate, 'day'))
                      }
                    />
                  </Col>
                  <Col xs={24}>
                    <Text type="secondary" className="block mb-1 text-xs">
                      Nông dân thực hiện
                    </Text>
                    <Select
                      mode="multiple"
                      allowClear
                      value={task.assigneeIds}
                      onChange={(value) =>
                        updateWorkTask(index, 'assigneeIds', value)
                      }
                      options={farmerOptions}
                      loading={isFarmersLoading}
                      placeholder="Chọn nông dân phụ trách công việc..."
                      showSearch
                      optionFilterProp="label"
                      maxTagCount="responsive"
                      className="w-full"
                    />
                  </Col>
                  <Col xs={24}>
                    <Text type="secondary" className="block mb-1 text-xs">
                      Mô tả công việc
                    </Text>
                    <Input.TextArea
                      value={task.description}
                      onChange={(event) =>
                        updateWorkTask(
                          index,
                          'description',
                          event.target.value
                        )
                      }
                      rows={2}
                      placeholder="Nhập hướng dẫn thực hiện công việc..."
                    />
                  </Col>
                </Row>

                <div className="pt-3 mt-1 border-t border-green-100">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div>
                      <Text strong className="text-sm text-green-800">
                        Công việc trong giai đoạn
                      </Text>
                      <Text type="secondary" className="block mt-0.5 text-xs">
                        Thêm các công việc cần thực hiện cho riêng giai đoạn này
                      </Text>
                    </div>
                    <Button
                      type="dashed"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => addWorkTask(stage._key)}
                      className="text-green-700 border-green-400 rounded-lg"
                    >
                      Thêm Công việc
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {workTasks.map((task, taskIndex) =>
                      task.stageKey === stage._key ? (
                        <div
                          key={task._key}
                          className="p-4 bg-white border border-green-100 rounded-xl"
                        >
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <Text strong>Công việc {taskIndex + 1}</Text>
                            <Button
                              type="text"
                              danger
                              icon={<MinusCircleOutlined />}
                              onClick={() => removeWorkTask(taskIndex)}
                            />
                          </div>
                          <Row gutter={[12, 12]}>
                            <Col xs={24} md={12}>
                              <Text
                                type="secondary"
                                className="block mb-1 text-xs"
                              >
                                Công việc mẫu{' '}
                                <span className="text-red-500">*</span>
                              </Text>
                              <Select
                                value={task.taskLibraryId}
                                onChange={(value) =>
                                  selectTaskLibrary(taskIndex, value)
                                }
                                options={taskLibraryOptions}
                                loading={isTaskLibrariesLoading}
                                placeholder="Chọn công việc từ thư viện..."
                                showSearch
                                optionFilterProp="label"
                                className="w-full"
                                disabled={Boolean(task.id)}
                              />
                            </Col>
                            <Col xs={24} md={12}>
                              <Text
                                type="secondary"
                                className="block mb-1 text-xs"
                              >
                                Tên công việc{' '}
                                <span className="text-red-500">*</span>
                              </Text>
                              <Input
                                value={task.name}
                                onChange={(event) =>
                                  updateWorkTask(
                                    taskIndex,
                                    'name',
                                    event.target.value
                                  )
                                }
                                placeholder="Nhập tên công việc..."
                              />
                            </Col>
                            <Col xs={24} md={12}>
                              <Text
                                type="secondary"
                                className="block mb-1 text-xs"
                              >
                                Ngày bắt đầu{' '}
                                <span className="text-red-500">*</span>
                              </Text>
                              <DatePicker
                                value={task.startDate}
                                onChange={(value) =>
                                  updateWorkTask(
                                    taskIndex,
                                    'startDate',
                                    value
                                  )
                                }
                                format="DD/MM/YYYY"
                                className="w-full"
                                disabledDate={(current) => {
                                  const stageStart =
                                    stage.startDate || selectedPlanStartDate
                                  const stageEnd =
                                    stage.endDate || selectedPlanEndDate
                                  return (
                                    (stageStart &&
                                      current.isBefore(stageStart, 'day')) ||
                                    (stageEnd &&
                                      current.isAfter(stageEnd, 'day'))
                                  )
                                }}
                              />
                            </Col>
                            <Col xs={24} md={12}>
                              <Text
                                type="secondary"
                                className="block mb-1 text-xs"
                              >
                                Hạn hoàn thành{' '}
                                <span className="text-red-500">*</span>
                              </Text>
                              <DatePicker
                                value={task.dueDate}
                                onChange={(value) =>
                                  updateWorkTask(
                                    taskIndex,
                                    'dueDate',
                                    value
                                  )
                                }
                                format="DD/MM/YYYY"
                                className="w-full"
                                disabledDate={(current) => {
                                  const stageStart =
                                    stage.startDate || selectedPlanStartDate
                                  const stageEnd =
                                    stage.endDate || selectedPlanEndDate
                                  return (
                                    (stageStart &&
                                      current.isBefore(stageStart, 'day')) ||
                                    (stageEnd &&
                                      current.isAfter(stageEnd, 'day')) ||
                                    (task.startDate &&
                                      current.isBefore(task.startDate, 'day'))
                                  )
                                }}
                              />
                            </Col>
                            <Col xs={24}>
                              <Text
                                type="secondary"
                                className="block mb-1 text-xs"
                              >
                                Nông dân thực hiện
                              </Text>
                              <Select
                                mode="multiple"
                                allowClear
                                value={task.assigneeIds}
                                onChange={(value) =>
                                  updateWorkTask(
                                    taskIndex,
                                    'assigneeIds',
                                    value
                                  )
                                }
                                options={farmerOptions}
                                loading={isFarmersLoading}
                                placeholder="Chọn nông dân phụ trách công việc..."
                                showSearch
                                optionFilterProp="label"
                                maxTagCount="responsive"
                                className="w-full"
                              />
                            </Col>
                            <Col xs={24}>
                              <Text
                                type="secondary"
                                className="block mb-1 text-xs"
                              >
                                Mô tả công việc
                              </Text>
                              <Input.TextArea
                                value={task.description}
                                onChange={(event) =>
                                  updateWorkTask(
                                    taskIndex,
                                    'description',
                                    event.target.value
                                  )
                                }
                                rows={2}
                                placeholder="Nhập hướng dẫn thực hiện công việc..."
                              />
                            </Col>
                          </Row>
                        </div>
                      ) : null
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={addWorkTask}
            className="w-full mb-3 text-green-700 border-green-400 rounded-lg hover:border-green-500"
          >
            Thêm Công việc
          </Button>
          </div>

          <div className="px-4 py-3 mb-5 text-sm text-amber-700 border border-amber-200 rounded-xl bg-amber-50">
            Vật tư thực tế được ghi nhận khi thực hiện công việc. API nhật ký
            hoạt động hiện hỗ trợ lưu vật tư; API công việc chưa có trường định
            mức để tự động đối chiếu với hướng dẫn sử dụng.
          </div>

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
              {isEdit ? 'Lưu thay đổi' : 'Tạo Nhật ký Mới'}
            </Button>
          </div>
        </Form>
      </Card>

      {/* ── Modal: Chọn từ thư viện mẫu ── */}
      <Modal
        open={templateModal}
        onCancel={() => setTemplateModal(false)}
        title={
          <div>
            <div className="text-lg font-bold text-gray-800">
              Chọn mẫu quy trình
            </div>
            <div className="mt-1 text-xs font-normal text-gray-400">
              Chọn một mẫu để tự động thêm các giai đoạn canh tác
            </div>
          </div>
        }
        footer={null}
        width={680}
        centered
        styles={{
          content: { borderRadius: 18, padding: 0, overflow: 'hidden' },
          header: { padding: '20px 24px 14px', margin: 0 },
          body: { padding: '0 24px 22px' },
        }}
      >
        {templatesLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spin size="large" />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <BookOutlined className="text-4xl mb-3" />
            <p className="text-sm">Chưa có mẫu quy trình nào.</p>
          </div>
        ) : (
          <div>
            <Input
              value={templateSearch}
              onChange={(event) => setTemplateSearch(event.target.value)}
              prefix={<SearchOutlined className="text-gray-300" />}
              allowClear
              placeholder="Tìm theo tên mẫu hoặc cây trồng..."
              className="mb-4 h-10 rounded-xl"
            />
            <div className="space-y-3 max-h-[430px] overflow-y-auto pr-1">
              {templates
                .filter((template) => {
                  const keyword = templateSearch.trim().toLowerCase()
                  if (!keyword) return true
                  const cropName =
                    template.cropName ||
                    template.crop?.name ||
                    template.cropCatalogName ||
                    template.cropCatalog?.name ||
                    ''
                  return `${template.name || ''} ${cropName}`
                    .toLowerCase()
                    .includes(keyword)
                })
                .map((template) => {
                  const cropName =
                    template.cropName ||
                    template.crop?.name ||
                    template.cropCatalogName ||
                    template.cropCatalog?.name
                  return (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleSelectTemplate(template)}
                      className="group w-full cursor-pointer rounded-xl border border-gray-100 bg-white p-4 text-left transition-all hover:border-green-300 hover:bg-green-50/40 hover:shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-bold text-gray-800 group-hover:text-green-700">
                            {template.name}
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <Tag color="green" className="m-0">
                              {template._stepCount} bước
                            </Tag>
                            {cropName && (
                              <Tag className="m-0">{cropName}</Tag>
                            )}
                          </div>
                          <p className="mb-0 mt-2 line-clamp-2 text-xs leading-5 text-gray-500">
                            {template.description || 'Chưa có mô tả.'}
                          </p>
                        </div>
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600 opacity-0 transition-opacity group-hover:opacity-100">
                          <PlusOutlined />
                        </div>
                      </div>
                    </button>
                  )
                })}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ProductionPlanCreate
