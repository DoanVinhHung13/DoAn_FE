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
} from "@ant-design/icons"
import {
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Spin,
  Typography,
} from "antd"
import React, { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate, useParams, useSearchParams } from "react-router-dom"

import TitleCustom from "src/components/TitleCustom"
import ROUTER from "src/router/ROUTER"
import CultivationLogbookService from "src/services/CultivationLogbookService"
import ProcessTemplateService from "src/services/ProcessTemplateService"
import CropCatalogService from "src/services/CropCatalogService"
import CropManagementService from "src/services/CropManagementService"
import LandPlotService from "src/services/LandPlotService"
import { parseDate } from "src/utils/dateFormatters"
import UserService from "src/services/UserService"
import { ROLES } from "src/constants/roles"
import { applyApiFieldErrors } from "src/services/core/apiError"
import useFormDraft from "src/hooks/useFormDraft"
import { getFormDraftKey } from "src/utils/formDraftKeys"
import { makeDescriptionValidator, makeNameValidator } from "src/utils/helpers"

import SectionTitle from "src/components/Common/SectionTitle"
import { isActiveCropCatalog } from "src/utils/cropCatalog"

const normalizeResponse = response => {
  const data = response?.data?.data ?? response?.data ?? response
  return Array.isArray(data) ? data : data?.items || []
}

const { Text } = Typography

const getCreatedPlanId = response =>
  response?.data?.data?.id || response?.data?.id || response?.id || null

const CULTIVATION_LOGBOOK_FIELD_MAPPING = {
  LogbookName: "logbookName",
  logbookName: "logbookName",
  CropId: "cropId",
  cropId: "cropId",
  LandPlotIds: "landPlotIds",
  landPlotIds: "landPlotIds",
  LandPlotId: "landPlotIds",
  landPlotId: "landPlotIds",
  StartDate: "expectedStartDate",
  startDate: "expectedStartDate",
  AssignedFarmSupervisorId: "assignedFarmSupervisorId",
  assignedFarmSupervisorId: "assignedFarmSupervisorId",
  Description: "description",
  description: "description",
}

// ── Stage helpers ────────────────────────────────────────────────────────
const createEmptyStage = order => ({
  _key: `stage-${Date.now()}-${order}`,
  order,
  title: "",
  description: "",
  startDate: null,
})

const CultivationLogbookCreate = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const isEdit = Boolean(id)
  const templateIdFromQuery = searchParams.get("templateId")
  const [form] = Form.useForm()
  const storageKey = getFormDraftKey(
    "cultivation-logbook",
    isEdit ? "edit" : "create",
    id,
  )
  const { saveDraft, clearDraft, restoreDraft } = useFormDraft({
    form,
    storageKey,
  })
  const draftReadyRef = useRef(false)
  const selectedCatalogId = Form.useWatch("category", form)
  const selectedCropId = Form.useWatch("cropId", form)

  // ── Stages state ──
  const [stages, setStages] = useState([createEmptyStage(1)])
  const [submitting, setSubmitting] = useState(false)
  const [planStatus, setPlanStatus] = useState(null)

  // ── Permission flags ──
  const effectiveStatus = isEdit ? planStatus || "PLANNED" : "PLANNED"
  const isPlanned = effectiveStatus === "PLANNED"
  const isInProgress =
    effectiveStatus === "IN_PROGRESS" || effectiveStatus === "ACTIVE"
  const isCompletedOrCancelled =
    effectiveStatus === "COMPLETED" ||
    effectiveStatus === "CANCELLED" ||
    effectiveStatus === "CANCELED"

  const canEditCategory = isPlanned
  const canEditCrop = isPlanned && Boolean(selectedCatalogId)
  const canEditLandPlots = isPlanned
  const canEditSupervisor = isPlanned || isInProgress
  const canEditStages = isPlanned
  const canEditGeneralInfo = isPlanned || isInProgress
  const canSubmitForm = !isCompletedOrCancelled

  // ── Dropdown options ──
  const [supervisorOptions, setSupervisorOptions] = useState([])
  const [isSupervisorsLoading, setIsSupervisorsLoading] = useState(false)
  const [catalogsData, setCatalogsData] = useState(null)
  const [isCatalogsLoading, setIsCatalogsLoading] = useState(false)
  const [cropsData, setCropsData] = useState(null)
  const [isCropsLoading, setIsCropsLoading] = useState(false)
  const [landsData, setLandsData] = useState(null)
  const [isLandsLoading, setIsLandsLoading] = useState(false)
  const [selectedLandPlotOptions, setSelectedLandPlotOptions] = useState([])

  // ── Template modal ──
  const [templateModal, setTemplateModal] = useState(false)
  const [templates, setTemplates] = useState([])
  const [templatesLoading, setTemplatesLoading] = useState(false)
  const [templateSearch, setTemplateSearch] = useState("")
  const [templateCropFilter, setTemplateCropFilter] = useState(undefined)
  const [templateCatalogFilter, setTemplateCatalogFilter] = useState(undefined)

  // ── Load dropdown options ────────────────────────────────────────
  React.useEffect(() => {
    let isMounted = true
    const fetchSupervisors = async () => {
      setIsSupervisorsLoading(true)
      try {
        const response = await UserService.getUsers({
          PageIndex: 1,
          PageSize: 100,
          Role: ROLES.FARM_SUPERVISOR,
          IsActive: true,
        })
        if (!isMounted) return

        const supervisors = normalizeResponse(response).filter(
          user => user.isActive !== false,
        )

        setSupervisorOptions(
          supervisors
            .map(user => ({
              value: user.id || user._id || user.userId,
              label: user.fullName || user.name || user.email,
            }))
            .filter(option => option.value),
        )
      } catch {
        if (isMounted) setSupervisorOptions([])
      } finally {
        if (isMounted) setIsSupervisorsLoading(false)
      }
    }

    fetchSupervisors()
    return () => {
      isMounted = false
    }
  }, [])

  // Fetch crop catalogs (danh mục cây trồng) - same as /farm-manager/tasks/create
  React.useEffect(() => {
    let isMounted = true
    const fetchCatalogs = async () => {
      setIsCatalogsLoading(true)
      try {
        const response = await CropCatalogService.getCropCatalogs({
          PageIndex: 1,
          PageSize: 100,
          Status: true,
        })
        if (!isMounted) return
        setCatalogsData(normalizeResponse(response).filter(isActiveCropCatalog))
      } catch {
        if (isMounted) setCatalogsData([])
      } finally {
        if (isMounted) setIsCatalogsLoading(false)
      }
    }

    fetchCatalogs()
    return () => {
      isMounted = false
    }
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
          PageSize: 100,
          Status: true,
        })
        if (!isMounted) return
        const allCrops = normalizeResponse(response)
        // Filter by selected catalog
        const filteredCrops = allCrops.filter(crop => {
          const cropCatalogId =
            crop.cropCatalogId || crop.categoryId || crop.cropCatalog?.id
          return (
            String(cropCatalogId || "").toLowerCase() ===
            String(selectedCatalogId || "").toLowerCase()
          )
        })
        setCropsData(filteredCrops)
      } catch {
        if (isMounted) setCropsData([])
      } finally {
        if (isMounted) setIsCropsLoading(false)
      }
    }

    fetchCrops()
    return () => {
      isMounted = false
    }
  }, [selectedCatalogId])

  // Fetch land plots available for logbook
  React.useEffect(() => {
    let isMounted = true
    const fetchLands = async () => {
      setIsLandsLoading(true)
      try {
        const response = await LandPlotService.getAvailableForLogbook({
          PageIndex: 1,
          PageSize: 100,
          logbookId: isEdit ? id : undefined,
        })
        if (!isMounted) return
        const lands = normalizeResponse(response)
        setLandsData(lands)
      } catch {
        if (isMounted) setLandsData([])
      } finally {
        if (isMounted) setIsLandsLoading(false)
      }
    }

    fetchLands()
    return () => {
      isMounted = false
    }
  }, [id, isEdit])

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
        const supervisor =
          plan.assignedFarmSupervisor || plan.farmSupervisor || {}
        let planStages =
          plan.cultivationStages || plan.productionStages || plan.stages || []
        const originalSupervisorId =
          plan.assignedFarmSupervisorId ||
          supervisor.id ||
          supervisor.userId ||
          null
        const selectedCropId = plan.cropId || crop.id
        const selectedCropCatalogId =
          plan.cropCatalogId || crop.cropCatalogId || crop.categoryId || null

        // Normalize stages
        if (!planStages.length && plan.processTemplateId) {
          try {
            const templateRes =
              await ProcessTemplateService.getProcessTemplateById(
                plan.processTemplateId,
              )
            const template = templateRes?.data ?? templateRes
            planStages = template?.processSteps || []
          } catch {
            /* ignore */
          }
        }

        // Extract land plot IDs (supports array or single object/ID)
        let selectedLandPlotIds = []
        if (Array.isArray(plan.landPlotIds)) {
          selectedLandPlotIds = plan.landPlotIds
        } else if (Array.isArray(plan.landPlotId)) {
          selectedLandPlotIds = plan.landPlotId
        } else if (Array.isArray(plan.landPlots)) {
          selectedLandPlotIds = plan.landPlots
            .map(lp => lp.id || lp._id || lp.landPlotId)
            .filter(Boolean)
        } else if (plan.landPlotId) {
          selectedLandPlotIds = [plan.landPlotId]
        } else if (plan.landPlot?.id) {
          selectedLandPlotIds = [plan.landPlot.id]
        }

        const planLandPlots = Array.isArray(plan.landPlots)
          ? plan.landPlots
          : []
        const planLandPlotNames = Array.isArray(plan.landPlotNames)
          ? plan.landPlotNames
          : []
        setSelectedLandPlotOptions(
          selectedLandPlotIds.map((landPlotId, index) => {
            const plot = planLandPlots.find(
              landPlot =>
                String(
                  landPlot?.id || landPlot?._id || landPlot?.landPlotId,
                ) === String(landPlotId),
            )
            return {
              value: landPlotId,
              label:
                plot?.name ||
                plot?.landPlotName ||
                planLandPlotNames[index] ||
                `Vùng trồng ${index + 1}`,
            }
          }),
        )

        // Set form values
        form.setFieldsValue({
          logbookName: plan.logbookName || "",
          category: selectedCropCatalogId,
          cropId: selectedCropId,
          landPlotIds: selectedLandPlotIds,
          area: plan.area || "",
          expectedStartDate: plan.startDate ? parseDate(plan.startDate) : null,
          assignedFarmSupervisorId: originalSupervisorId,
          description: plan.description || "",
        })

        // Set immutable fields — only lock when IN_PROGRESS or COMPLETED
        const currentStatus = plan.status || "PLANNED"

        // Set plan status for field-level permission
        setPlanStatus(currentStatus)

        // Set stages
        const normalizedStages = planStages.map((stage, index) => ({
          _key: `stage-${stage.id || Date.now()}-${index}`,
          order: index + 1,
          title: stage.stageName || "",
          description: stage.description || "",
          startDate: stage.startDate ? parseDate(stage.startDate) : null,
        }))

        const draft = restoreDraft({
          onRestore: ({ data }) => {
            form.setFieldsValue(data)
            setStages(
              data.__draftMeta?.stages ||
                (normalizedStages.length
                  ? normalizedStages
                  : [createEmptyStage(1)]),
            )
          },
        })
        const draftData = draft?.data || {}
        form.setFieldsValue(draftData)
        setStages(
          draftData.__draftMeta?.stages ||
            (normalizedStages.length
              ? normalizedStages
              : [createEmptyStage(1)]),
        )
        draftReadyRef.current = true
      } catch {
        // API error handled by axios interceptor
      }
    }

    loadCultivationLogbook()
    return () => {
      isMounted = false
    }
  }, [id, isEdit, form, restoreDraft])

  useEffect(() => {
    if (isEdit) return
    const draft = restoreDraft({
      onRestore: ({ data }) => {
        form.setFieldsValue(data)
        setStages(data.__draftMeta?.stages || [createEmptyStage(1)])
      },
    })
    const draftData = draft?.data || {}
    form.setFieldsValue(draftData)
    setStages(draftData.__draftMeta?.stages || [createEmptyStage(1)])
    draftReadyRef.current = true
  }, [form, isEdit, restoreDraft])

  useEffect(() => {
    if (draftReadyRef.current) {
      saveDraft({ ...form.getFieldsValue(true), __draftMeta: { stages } })
    }
  }, [form, saveDraft, stages])

  const landPlotOptions = [...(landsData || [])]
  selectedLandPlotOptions.forEach(selectedPlot => {
    const existingPlot = landPlotOptions.find(
      landPlot => String(landPlot.id) === String(selectedPlot.value),
    )
    if (!existingPlot) {
      landPlotOptions.push(selectedPlot)
    } else if (!existingPlot.name && selectedPlot.label) {
      existingPlot.name = selectedPlot.label
    }
  })

  // ── Helper resolution for template crop & category ─────────────────
  const resolveTemplateCropData = useCallback(
    async (templateData, template) => {
      let targetCatalogId =
        templateData?.cropCatalogId ||
        templateData?.cropCatalog?.id ||
        templateData?.cropCatalog?._id ||
        templateData?.crop?.cropCatalogId ||
        templateData?.crop?.categoryId ||
        templateData?.categoryId ||
        template?.cropCatalogId ||
        template?.cropCatalog?.id ||
        template?.cropCatalog?._id ||
        template?.crop?.cropCatalogId ||
        template?.crop?.categoryId ||
        template?.categoryId

      let targetCropId =
        templateData?.cropId ||
        templateData?.crop?.id ||
        templateData?.crop?._id ||
        template?.cropId ||
        template?.crop?.id ||
        template?.crop?._id

      // If cropId is present but targetCatalogId is missing, look up crop to find its catalogId
      if (targetCropId && !targetCatalogId) {
        try {
          const res = await CropManagementService.getCrops({
            PageIndex: 1,
            PageSize: 100,
            Status: true,
          })
          const allCrops = normalizeResponse(res)
          const foundCrop = allCrops.find(
            c =>
              String(c.id || c._id || c.cropId).toLowerCase() ===
              String(targetCropId).toLowerCase(),
          )
          if (foundCrop) {
            targetCatalogId =
              foundCrop.cropCatalogId ||
              foundCrop.categoryId ||
              foundCrop.cropCatalog?.id
          }
        } catch {
          // Crop catalog resolution is best-effort.
        }
      }

      return { targetCatalogId, targetCropId }
    },
    [],
  )

  const applyTemplateFields = useCallback(
    async (templateData, template) => {
      const { targetCatalogId, targetCropId } = await resolveTemplateCropData(
        templateData,
        template,
      )

      const fieldsToUpdate = {}
      if (targetCatalogId) {
        fieldsToUpdate.category = targetCatalogId
      }
      if (targetCropId) {
        fieldsToUpdate.cropId = targetCropId
      }

      const templateName =
        templateData?.templateName ||
        templateData?.name ||
        template?.templateName ||
        template?.name
      if (templateName && !form.getFieldValue("logbookName")) {
        fieldsToUpdate.logbookName = templateName
      }

      const templateDesc = templateData?.description || template?.description
      if (templateDesc && !form.getFieldValue("description")) {
        fieldsToUpdate.description = templateDesc
      }

      if (Object.keys(fieldsToUpdate).length > 0) {
        form.setFieldsValue(fieldsToUpdate)
      }
    },
    [form, resolveTemplateCropData],
  )

  // ── Load template data ───────────────────────────────────────────
  useEffect(() => {
    if (!templateIdFromQuery) return

    let isMounted = true
    const loadTemplate = async () => {
      try {
        const response =
          await ProcessTemplateService.getProcessTemplateById(
            templateIdFromQuery,
          )
        const template = response?.data ?? response
        if (!isMounted || !template) return

        const steps = template.processSteps || []
        const normalizedStages = steps.map((step, index) => ({
          _key: `stage-${step.id || Date.now()}-${index}`,
          order: index + 1,
          title: step.stepName || step.title || "",
          description: step.description || step.note || "",
          startDate: null,
        }))

        setStages(
          normalizedStages.length ? normalizedStages : [createEmptyStage(1)],
        )
        await applyTemplateFields(template, template)
        if (isMounted) {
          message.info("Đã tải mẫu kế hoạch thành công.")
        }
      } catch {
        // API error handled by axios interceptor
      }
    }

    loadTemplate()
    return () => {
      isMounted = false
    }
  }, [applyTemplateFields, templateIdFromQuery])

  // ── Template modal handlers ──────────────────────────────────────
  const openTemplateModal = () => {
    setTemplateCropFilter(selectedCropId)
    setTemplateCatalogFilter(selectedCatalogId)
    setTemplateModal(true)
    setTemplateSearch("")
    loadTemplates("", selectedCropId, selectedCatalogId)
  }

  const loadTemplates = async (
    search = "",
    cropId = null,
    cropCatalogId = null,
  ) => {
    try {
      setTemplatesLoading(true)
      const response = await ProcessTemplateService.getProcessTemplates({
        PageIndex: 1,
        PageSize: 100,
        SearchKeyword: search || undefined,
        CropId: cropId || undefined,
        CropCatalogId: cropCatalogId || undefined,
      })
      setTemplates(normalizeResponse(response))
    } catch {
      setTemplates([])
    } finally {
      setTemplatesLoading(false)
    }
  }

  const templateCropOptions = (cropsData || [])
    .map(crop => ({
      value: crop.id || crop._id || crop.cropId,
      label: crop.name || crop.cropName,
    }))
    .filter(option => option.value && option.label)

  if (
    selectedCropId &&
    !templateCropOptions.some(
      option => String(option.value) === String(selectedCropId),
    )
  ) {
    templateCropOptions.unshift({
      value: selectedCropId,
      label: "Cây trồng đang chọn",
    })
  }

  const selectedCropOption = templateCropOptions.find(
    option => String(option.value) === String(selectedCropId),
  )

  const templateCatalogOptions = (catalogsData || [])
    .map(catalog => ({
      value: catalog.id || catalog._id || catalog.cropCatalogId,
      label: catalog.name || catalog.catalogName,
    }))
    .filter(option => option.value && option.label)

  const selectedCatalogOption = templateCatalogOptions.find(
    option => String(option.value) === String(templateCatalogFilter),
  )

  const applyTemplate = async template => {
    try {
      const response = await ProcessTemplateService.getProcessTemplateById(
        template.id,
      )
      const templateData = response?.data ?? response
      const steps = templateData.processSteps || []

      const normalizedStages = steps.map((step, index) => ({
        _key: `stage-${step.id || Date.now()}-${index}`,
        order: index + 1,
        title: step.stepName || step.title || "",
        description: step.description || step.note || "",
        startDate: null,
      }))

      setStages(
        normalizedStages.length ? normalizedStages : [createEmptyStage(1)],
      )
      await applyTemplateFields(templateData, template)
      setTemplateModal(false)
      message.success(
        `Đã áp dụng mẫu "${template.templateName || template.name}" thành công.`,
      )
    } catch {
      // API error handled by axios interceptor
    }
  }

  // ── Stage handlers ───────────────────────────────────────────────
  const addStage = () => {
    setStages([...stages, createEmptyStage(stages.length + 1)])
  }

  const removeStage = index => {
    if (stages.length <= 1) {
      message.warning("Phải có ít nhất một giai đoạn.")
      return
    }
    const newStages = [...stages]
    newStages.splice(index, 1)
    setStages(newStages.map((stage, idx) => ({ ...stage, order: idx + 1 })))
  }

  const updateStage = (index, field, value) => {
    const newStages = [...stages]
    newStages[index] = { ...newStages[index], [field]: value }
    setStages(newStages)
  }

  // ── Form submission ──────────────────────────────────────────────
  const handleSubmit = async values => {
    if (stages.some(stage => !stage.title.trim())) {
      message.warning("Vui lòng nhập tên cho tất cả các giai đoạn.")
      return
    }

    if (stages.some(stage => stage.title.trim().length > 100)) {
      message.warning("Tên giai đoạn không được vượt quá 100 ký tự.")
      return
    }

    if (
      stages.some(
        stage => stage.title.trim() !== stage.title.trim().replace(/\s+/g, " "),
      )
    ) {
      message.warning(
        "Tên giai đoạn không được chứa nhiều khoảng trắng liên tiếp.",
      )
      return
    }

    if (stages.some(stage => !stage.description || !stage.description.trim())) {
      message.warning(
        "Vui lòng nhập mô tả công việc cần làm cho tất cả các giai đoạn.",
      )
      return
    }

    if (
      stages.some(
        stage => stage.description && stage.description.trim().length > 200,
      )
    ) {
      message.warning("Mô tả giai đoạn không được vượt quá 200 ký tự.")
      return
    }

    if (
      stages.some(
        stage =>
          stage.description &&
          stage.description.trim() !==
            stage.description.trim().replace(/\s+/g, " "),
      )
    ) {
      message.warning(
        "Mô tả giai đoạn không được chứa nhiều khoảng trắng liên tiếp.",
      )
      return
    }

    try {
      setSubmitting(true)
      const landPlotIds = Array.isArray(values.landPlotIds)
        ? values.landPlotIds
        : values.landPlotIds
          ? [values.landPlotIds]
          : values.landPlotId
            ? Array.isArray(values.landPlotId)
              ? values.landPlotId
              : [values.landPlotId]
            : []

      const payload = {
        logbookName: values.logbookName,
        cropId: values.cropId,
        landPlotIds: landPlotIds,
        status: isEdit ? planStatus || "PLANNED" : "PLANNED",
        scope: "OVERALL",
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
        response = await CultivationLogbookService.update(id, payload, {
          errorHandling: "form",
          fieldErrorMapping: CULTIVATION_LOGBOOK_FIELD_MAPPING,
        })
      } else {
        response = await CultivationLogbookService.create(payload, {
          errorHandling: "form",
          fieldErrorMapping: CULTIVATION_LOGBOOK_FIELD_MAPPING,
        })
      }

      clearDraft()
      const createdPlanId = getCreatedPlanId(response)
      if (createdPlanId) {
        navigate(
          ROUTER.FM_CULTIVATION_LOGBOOK_DETAIL.replace(":id", createdPlanId),
        )
      }
    } catch (error) {
      applyApiFieldErrors(form, error, CULTIVATION_LOGBOOK_FIELD_MAPPING)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTER.FM_CULTIVATION_LOGBOOKS)}
            className="mb-3 -ml-2 h-9 text-gray-600 hover:text-green-700"
          >
            Quay lại danh sách
          </Button>
          <TitleCustom className="!mb-1">
            {isEdit ? "Chỉnh sửa nhật ký canh tác" : "Tạo nhật ký canh tác"}
          </TitleCustom>
        </div>
        <div className="flex flex-wrap gap-2">
          {(!isEdit || planStatus === "PLANNED") && (
            <Button
              type="default"
              icon={<BookOutlined />}
              onClick={openTemplateModal}
              className="h-10 px-6 font-semibold rounded-xl"
            >
              Áp dụng mẫu
            </Button>
          )}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => form.submit()}
            loading={submitting}
            disabled={!canSubmitForm}
            className="h-10 px-6 font-semibold bg-green-600 rounded-xl"
          >
            {isEdit ? "Cập nhật nhật ký" : "Lưu nhật ký"}
          </Button>
        </div>
      </div>

      <Form
        form={form}
        onFinish={handleSubmit}
        onValuesChange={(_, allValues) =>
          saveDraft({ ...allValues, __draftMeta: { stages } })
        }
        layout="vertical"
        className="space-y-6"
      >
        {/* Basic Info */}
        <Card bordered={false} className="shadow-sm rounded-2xl">
          <SectionTitle>Thông tin cơ bản</SectionTitle>
          <Row gutter={24}>
            <Col xs={24} md={12} lg={8}>
              <Form.Item
                name="logbookName"
                label="Tên nhật ký"
                rules={[
                  { required: true, message: "Vui lòng nhập tên nhật ký" },
                  makeNameValidator({ label: "Tên nhật ký" }),
                ]}
              >
                <Input
                  placeholder="VD: Vụ Đông Xuân 2026 - Lúa ST25"
                  disabled={!canEditGeneralInfo}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Form.Item
                name="category"
                label="Danh mục cây trồng"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn danh mục cây trồng",
                  },
                ]}
              >
                <Select
                  options={catalogsData?.map(cat => ({
                    value: cat.id || cat._id || cat.cropCatalogId,
                    label: cat.name || cat.catalogName,
                  }))}
                  placeholder="Chọn danh mục..."
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.label || "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  loading={isCatalogsLoading}
                  disabled={!canEditCategory}
                  onChange={() => {
                    form.setFieldsValue({ cropId: undefined })
                    setCropsData([])
                  }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Form.Item
                name="cropId"
                label="Cây trồng cụ thể"
                rules={[{ required: true, message: "Vui lòng chọn cây trồng" }]}
              >
                <Select
                  options={cropsData?.map(crop => ({
                    value: crop.id || crop._id || crop.cropId,
                    label: crop.name || crop.cropName,
                  }))}
                  placeholder="Chọn cây trồng..."
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.label || "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  loading={isCropsLoading}
                  disabled={!canEditCrop}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Form.Item
                name="landPlotIds"
                label="Vùng trồng"
                rules={[
                  {
                    required: true,
                    message: "Vui lòng chọn ít nhất một vùng trồng",
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  options={landPlotOptions.map(land => ({
                    value: land.id,
                    label: land.name,
                  }))}
                  placeholder="Chọn các vùng trồng available..."
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.label || "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  loading={isLandsLoading}
                  disabled={!canEditLandPlots}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12} lg={8}>
              <Form.Item
                name="assignedFarmSupervisorId"
                label="Giám sát viên phụ trách"
                rules={[
                  { required: true, message: "Vui lòng chọn giám sát viên" },
                ]}
              >
                <Select
                  options={supervisorOptions}
                  placeholder="Chọn giám sát viên..."
                  showSearch
                  filterOption={(input, option) =>
                    String(option?.label || "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  loading={isSupervisorsLoading}
                  disabled={!canEditSupervisor}
                />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="description"
                label="Mô tả nhật ký"
                rules={[
                  makeDescriptionValidator({ maxLength: 200 }),
                ]}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Mô tả tổng quan về nhật ký, mục tiêu, yêu cầu kỹ thuật..."
                  disabled={!canEditGeneralInfo}
                />
              </Form.Item>
            </Col>
          </Row>
        </Card>

        {/* Stages */}
        <Card bordered={false} className="shadow-sm rounded-2xl">
          <SectionTitle>Giai đoạn canh tác</SectionTitle>

          {stages.map((stage, index) => (
            <div
              key={stage._key}
              className="mb-6 p-4 rounded-xl border border-gray-100 bg-gray-50"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-gray-700">
                  Giai đoạn {stage.order}
                </span>
                {canEditStages && (
                  <>
                    {stages.length > 1 && (
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<MinusCircleOutlined />}
                        onClick={() => removeStage(index)}
                      >
                        Xóa giai đoạn
                      </Button>
                    )}
                  </>
                )}
              </div>
              <Row gutter={12}>
                <Col xs={24} md={24}>
                  <Form.Item label="Tên giai đoạn" required>
                    <Input
                      value={stage.title}
                      onChange={e =>
                        updateStage(index, "title", e.target.value)
                      }
                      placeholder="VD: Chuẩn bị đất & Xuống giống"
                      disabled={!canEditStages}
                    />
                    {stage.title?.trim() && stage.title.trim().length > 100 && (
                      <p className="mt-0.5 mb-0 text-xs text-red-500">
                        Tên giai đoạn không được vượt quá 100 ký tự.
                      </p>
                    )}
                    {stage.title?.trim() &&
                      stage.title.trim() !==
                        stage.title.trim().replace(/\s+/g, " ") &&
                      stage.title.trim().length <= 100 && (
                        <p className="mt-0.5 mb-0 text-xs text-red-500">
                          Tên giai đoạn không được chứa nhiều khoảng trắng liên
                          tiếp.
                        </p>
                      )}
                  </Form.Item>
                </Col>
                <Col xs={24} md={24}>
                  <Form.Item label="Mô tả công việc cần làm" required>
                    <Input.TextArea
                      value={stage.description}
                      onChange={e =>
                        updateStage(index, "description", e.target.value)
                      }
                      rows={2}
                      placeholder="Mô tả chi tiết công việc cần thực hiện trong giai đoạn này..."
                      disabled={!canEditStages}
                    />
                    {!stage.description?.trim() && (
                      <p className="mt-0.5 mb-0 text-xs text-red-500">
                        Vui lòng nhập mô tả công việc cần làm.
                      </p>
                    )}
                    {stage.description?.trim() &&
                      stage.description.trim().length > 200 && (
                        <p className="mt-0.5 mb-0 text-xs text-red-500">
                          Mô tả giai đoạn không được vượt quá 200 ký tự.
                        </p>
                      )}
                    {stage.description?.trim() &&
                      stage.description.trim() !==
                        stage.description.trim().replace(/\s+/g, " ") &&
                      stage.description.trim().length <= 200 && (
                        <p className="mt-0.5 mb-0 text-xs text-red-500">
                          Mô tả giai đoạn không được chứa nhiều khoảng trắng
                          liên tiếp.
                        </p>
                      )}
                  </Form.Item>
                </Col>
              </Row>
            </div>
          ))}

          {/* Nút Thêm giai đoạn — đặt dưới danh sách */}
          {canEditStages && (
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
              onClick={() =>
                navigate(
                  ROUTER.FM_CULTIVATION_LOGBOOK_DETAIL.replace(":id", id),
                )
              }
              className="h-10 px-6 font-semibold rounded-xl"
            >
              Hủy
            </Button>
          )}
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => form.submit()}
            loading={submitting}
            disabled={!canSubmitForm}
            className="h-10 px-6 font-semibold bg-green-600 rounded-xl"
          >
            {isEdit ? "Cập nhật nhật ký" : "Lưu nhật ký"}
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
          body: { padding: "24px", overscrollBehavior: "contain" },
        }}
      >
        <div className="space-y-5">
          <div className="flex flex-col gap-3 md:flex-row">
            <Input.Search
              placeholder="Tìm kiếm mẫu kế hoạch..."
              value={templateSearch}
              onChange={e => setTemplateSearch(e.target.value)}
              onSearch={value =>
                loadTemplates(value, templateCropFilter, templateCatalogFilter)
              }
              size="large"
              className="flex-1 rounded-xl"
              aria-label="Tìm kiếm mẫu nhật ký canh tác"
            />
            <Select
              value={templateCatalogFilter}
              options={templateCatalogOptions}
              loading={isCatalogsLoading}
              allowClear
              showSearch
              optionFilterProp="label"
              onChange={value => {
                setTemplateCatalogFilter(value)
                const nextCropFilter = value ? templateCropFilter : undefined
                setTemplateCropFilter(nextCropFilter)
                loadTemplates(templateSearch, nextCropFilter, value)
              }}
              placeholder="Tất cả danh mục"
              className="w-full md:w-64"
              size="large"
              aria-label="Lọc mẫu theo danh mục cây trồng"
            />
            <Select
              value={templateCropFilter}
              options={templateCropOptions}
              loading={isCropsLoading}
              allowClear
              showSearch
              optionFilterProp="label"
              onChange={value => {
                setTemplateCropFilter(value)
                loadTemplates(templateSearch, value, templateCatalogFilter)
              }}
              placeholder="Tất cả cây trồng"
              className="w-full md:w-64"
              size="large"
              aria-label="Lọc mẫu theo cây trồng"
            />
          </div>
          {(templateCropFilter || templateCatalogFilter) && (
            <Text type="secondary" className="block -mt-2 text-sm">
              Đang lọc mẫu theo:{" "}
              {[selectedCatalogOption?.label, selectedCropOption?.label]
                .filter(Boolean)
                .join(" · ")}
              . Xóa các bộ lọc để xem tất cả mẫu.
            </Text>
          )}
          {templatesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spin size="large" tip="Đang tải mẫu kế hoạch..." />
            </div>
          ) : templates.length ? (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
              {templates.map(template => (
                <Card
                  key={template.id}
                  hoverable
                  bordered={false}
                  className="overflow-hidden transition-all duration-200 border border-gray-200 shadow-sm rounded-xl hover:border-green-400 hover:shadow-md"
                  onClick={() => applyTemplate(template)}
                  bodyStyle={{ padding: "20px" }}
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
                        <Text
                          type="secondary"
                          className="block text-sm leading-relaxed line-clamp-2"
                        >
                          {template.description || "Chưa có mô tả"}
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
                        onClick={e => {
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
