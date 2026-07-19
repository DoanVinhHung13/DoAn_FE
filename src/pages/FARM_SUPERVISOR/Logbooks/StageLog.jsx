import {
  ArrowLeftOutlined,
  CameraOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloudUploadOutlined,
  DeleteOutlined,
  ExperimentOutlined,
  FormOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  SaveOutlined,
  SendOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Image,
  Input,
  InputNumber,
  Modal,
  Row,
  Select,
  Skeleton,
  Tag,
  Timeline,
  Typography,
  Upload,
  message,
} from 'antd'
import dayjs from 'dayjs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'

import ROUTER from 'src/router/ROUTER'
import CropProtectionService from 'src/services/CropProtectionService'
import FertilizerService from 'src/services/FertilizerService'
import MaterialService from 'src/services/MaterialService'
import ProductionLogService from 'src/services/ProductionLogService'
import ProductionPlanService from 'src/services/CultivationLogbookService'
import ProductionStageService from 'src/services/ProductionStageService'
import { formatDate } from 'src/utils/dateFormatters'

const { Text } = Typography
const { Dragger } = Upload

const itemsOf = (response) => {
  const payload = response?.data ?? response
  const data = payload?.data ?? payload
  return Array.isArray(data) ? data : data?.items || []
}

const activityOptions = [
  { value: 'LAND_PREPARATION', label: 'Chuẩn bị đất' },
  { value: 'PLANTING', label: 'Gieo trồng' },
  { value: 'IRRIGATION', label: 'Tưới tiêu' },
  { value: 'FERTILIZATION', label: 'Bón phân' },
  { value: 'CROP_PROTECTION_APPLICATION', label: 'Bảo vệ thực vật' },
  { value: 'INSPECTION', label: 'Kiểm tra' },
  { value: 'PRUNING', label: 'Cắt tỉa' },
  { value: 'HARVESTING', label: 'Thu hoạch' },
  { value: 'OTHER', label: 'Công việc khác' },
]

const materialCategories = [
  { value: 'FERTILIZER', label: 'Phân bón' },
  { value: 'CROP_PROTECTION', label: 'Thuốc BVTV' },
  { value: 'FARM_MATERIAL', label: 'Vật tư nông trại' },
  { value: 'MACHINERY', label: 'Máy móc' },
]

const qualityObjectOptions = [
  { value: 'SOIL', label: 'Đất / giá thể' },
  { value: 'IRRIGATION_WATER', label: 'Nước tưới' },
  { value: 'PRODUCT', label: 'Sản phẩm' },
]

const materialFieldConfigs = {
  FERTILIZER: {
    defaultUnit: 'kg',
    quantityLabel: 'Lượng sử dụng',
    areaLabel: 'Định mức / diện tích',
    supportsDilution: true,
    dilutionPlaceholder: 'VD: 1 kg/200 lít',
    units: ['kg', 'g', 'tấn', 'lít', 'ml', 'bao'],
  },
  CROP_PROTECTION: {
    defaultUnit: 'ml',
    quantityLabel: 'Lượng sử dụng',
    areaLabel: 'Liều lượng / diện tích',
    supportsDilution: true,
    dilutionPlaceholder: 'VD: 500 ml/200 lít',
    units: ['ml', 'lít', 'g', 'kg', 'chai', 'gói'],
  },
  FARM_MATERIAL: {
    defaultUnit: 'cái',
    quantityLabel: 'Số lượng sử dụng',
    areaLabel: 'Số lượng / diện tích',
    supportsDilution: false,
    units: ['cái', 'bộ', 'cuộn', 'mét', 'tấm', 'kg', 'bao'],
  },
  MACHINERY: {
    defaultUnit: 'giờ',
    quantityLabel: 'Thời lượng / số ca',
    areaLabel: 'Năng suất / diện tích',
    supportsDilution: false,
    units: ['giờ', 'ca', 'lượt', 'máy', 'ngày công'],
  },
}

const mockMaterialOptions = [
  {
    id: 'mock-fertilizer-001',
    category: 'FERTILIZER',
    name: 'Phân Urê',
    unit: 'kg',
  },
  {
    id: 'mock-protection-001',
    category: 'CROP_PROTECTION',
    name: 'Thuốc trừ sâu sinh học',
    unit: 'ml',
  },
  {
    id: 'mock-material-001',
    category: 'FARM_MATERIAL',
    name: 'Dây thừng',
    unit: 'mét',
  },
  {
    id: 'mock-machinery-001',
    category: 'MACHINERY',
    name: 'Máy cày',
    unit: 'ca',
  },
]

const getCreatedId = (response) =>
  response?.data?.data?.id ||
  response?.data?.id ||
  response?.id ||
  null

const getLogRequestKey = (log, index) =>
  log.id ||
  log.cultivationLogId ||
  log.productionLogId ||
  `stage-log-${index}`

const StageLog = () => {
  const navigate = useNavigate()
  const { planId, stageId } = useParams()
  const user = useSelector((state) => state.appGlobal.userInfo)
  const performedBy = user?.id || user?._id || user?.userId

  const [loading, setLoading] = useState(true)
  const [plan, setPlan] = useState(null)
  const [stage, setStage] = useState(null)
  const [logs, setLogs] = useState([])
  const [activityDate, setActivityDate] = useState(dayjs())
  const [activityType, setActivityType] = useState('OTHER')
  const [content, setContent] = useState('')
  const [files, setFiles] = useState([])
  const [materialCategory, setMaterialCategory] = useState('FERTILIZER')
  const [materialOptions, setMaterialOptions] = useState([])
  const [materials, setMaterials] = useState([])
  const [saving, setSaving] = useState(false)
  const [completing, setCompleting] = useState(false)
  const [qualityModalOpen, setQualityModalOpen] = useState(false)
  const [selectedQualityLog, setSelectedQualityLog] = useState(null)
  const [qualityObject, setQualityObject] = useState()
  const [sampleDate, setSampleDate] = useState(dayjs())
  const [sampleCode, setSampleCode] = useState('')
  const [sampleLocation, setSampleLocation] = useState('')
  const [laboratory, setLaboratory] = useState('')
  const [resultSummary, setResultSummary] = useState('')
  const [qualityFiles, setQualityFiles] = useState([])
  const [qualityRequestStatus, setQualityRequestStatus] = useState({})

  const load = useCallback(async () => {
    if (planId.startsWith('mock-')) {
      const mockStage = getMockStage(stageId) || null
      setPlan(MOCK_SUPERVISOR_PLAN)
      setStage(mockStage)
      if (mockStage?.startDate) {
        setActivityDate(dayjs(mockStage.startDate))
      }
      setLogs(
        MOCK_PRODUCTION_LOGS.filter(
          (log) => log.cultivationStageId === stageId
        )
      )
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const [planResponse, stageResponse, logResponse] = await Promise.all([
        ProductionPlanService.getById(planId),
        ProductionStageService.getAll({ PageIndex: 1, PageSize: 1000 }),
        ProductionLogService.getByPlan(planId),
      ])
      const planData = planResponse?.data ?? planResponse
      const stageData = itemsOf(stageResponse).find(
        (item) => String(item.id) === String(stageId)
      )
      setPlan(planData)
      setStage(stageData || null)
      if (stageData?.startDate) {
        setActivityDate((current) => {
          const stageStart = dayjs(stageData.startDate)
          const stageEnd = stageData.endDate
            ? dayjs(stageData.endDate)
            : null
          if (
            !current ||
            current.isBefore(stageStart, 'day') ||
            (stageEnd && current.isAfter(stageEnd, 'day'))
          ) {
            return stageStart
          }
          return current
        })
      }
      setLogs(itemsOf(logResponse))
    } catch (error) {
      message.error(error.message || 'Không thể tải dữ liệu ghi chép.')
    } finally {
      setLoading(false)
    }
  }, [planId, stageId])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    let mounted = true

    const loadMaterialOptions = async () => {
      if (planId.startsWith('mock-')) {
        setMaterialOptions(mockMaterialOptions)
        return
      }

      const responses = await Promise.allSettled([
        FertilizerService.getFertilizers({ PageIndex: 1, PageSize: 1000 }),
        CropProtectionService.getCropProtections({
          PageIndex: 1,
          PageSize: 1000,
        }),
        MaterialService.getMaterials({ PageIndex: 1, PageSize: 1000 }),
      ])
      if (!mounted) return

      const fertilizerItems =
        responses[0].status === 'fulfilled'
          ? itemsOf(responses[0].value)
          : []
      const protectionItems =
        responses[1].status === 'fulfilled'
          ? itemsOf(responses[1].value)
          : []
      const generalItems =
        responses[2].status === 'fulfilled'
          ? itemsOf(responses[2].value)
          : []

      setMaterialOptions([
        ...fertilizerItems.map((item) => ({
          id: item.id,
          category: 'FERTILIZER',
          name: item.name,
          unit: item.unit,
        })),
        ...protectionItems.map((item) => ({
          id: item.id,
          category: 'CROP_PROTECTION',
          name: item.name,
          unit: item.unit,
        })),
        ...generalItems.map((item) => ({
          id: item.id,
          category: String(item.type || item.category || '')
            .toUpperCase()
            .includes('MACH')
            ? 'MACHINERY'
            : 'FARM_MATERIAL',
          name: item.name,
          unit: item.unit,
        })),
      ])
    }

    loadMaterialOptions()
    return () => {
      mounted = false
    }
  }, [planId])

  const stageLogs = useMemo(() => {
    if (!stage?.startDate && !stage?.endDate) return logs
    return logs.filter((log) => {
      if (!log.activityDate) return true
      const date = dayjs(log.activityDate)
      return (
        (!stage.startDate ||
          !date.isBefore(dayjs(stage.startDate), 'day')) &&
        (!stage.endDate || !date.isAfter(dayjs(stage.endDate), 'day'))
      )
    })
  }, [logs, stage])

  const disableOutsideStage = (date) =>
    (stage?.startDate && date.isBefore(dayjs(stage.startDate), 'day')) ||
    (stage?.endDate && date.isAfter(dayjs(stage.endDate), 'day'))

  const addMaterial = () => {
    const fieldConfig =
      materialFieldConfigs[materialCategory] ||
      materialFieldConfigs.FARM_MATERIAL
    setMaterials((current) => [
      ...current,
      {
        clientId: `${Date.now()}-${current.length}`,
        category: materialCategory,
        resourceId: null,
        resourceName: '',
        concentration: '',
        quantity: null,
        unit: fieldConfig.defaultUnit,
        areaQuantity: null,
        areaUnit: 'ha',
      },
    ])
  }

  const updateMaterial = (clientId, changes) => {
    setMaterials((current) =>
      current.map((item) =>
        item.clientId === clientId ? { ...item, ...changes } : item
      )
    )
  }

  const removeMaterial = (clientId) => {
    setMaterials((current) =>
      current.filter((item) => item.clientId !== clientId)
    )
  }

  const materialPayload = () =>
    materials.map((item) => ({
      materialId:
        ['FARM_MATERIAL', 'MACHINERY'].includes(item.category)
          ? item.resourceId
          : null,
      fertilizerId:
        item.category === 'FERTILIZER' ? item.resourceId : null,
      cropProtectionId:
        item.category === 'CROP_PROTECTION' ? item.resourceId : null,
      quantity: item.quantity,
      unit: item.unit,
      note: [
        item.resourceName,
        item.concentration
          ? `Nồng độ pha loãng: ${item.concentration}`
          : null,
        item.areaQuantity
          ? `Định mức: ${item.areaQuantity} ${item.unit}/${item.areaUnit}`
          : null,
        `Nhóm: ${item.category}`,
      ]
        .filter(Boolean)
        .join(' | '),
    }))

  const save = async () => {
    if (!activityDate || !content.trim()) {
      message.warning('Vui lòng nhập ngày và nội dung ghi chép.')
      return
    }
    if (!performedBy || !plan?.landPlotId) {
      message.error('Thiếu thông tin người thực hiện hoặc vùng trồng.')
      return
    }
    if (
      materials.some(
        (item) => !item.resourceId || !item.quantity || !item.unit
      )
    ) {
      message.warning(
        'Vui lòng chọn vật tư, nhập lượng sử dụng và đơn vị cho tất cả các dòng.'
      )
      return
    }
    try {
      setSaving(true)
      if (planId.startsWith('mock-')) {
        const previewImages = files.map((file, index) => ({
          id: `preview-${Date.now()}-${index}`,
          imageUrl: URL.createObjectURL(file.originFileObj || file),
        }))
        setLogs((current) => [
          {
            id: `mock-log-${Date.now()}`,
            cultivationLogbookId: planId,
            cultivationStageId: stageId,
            activityType,
            activityDate: activityDate.format('YYYY-MM-DD[T]00:00:00'),
            description: content.trim(),
            performedByName:
              user?.fullName || user?.name || 'Farm Supervisor',
            materials: materialPayload(),
            images: previewImages,
          },
          ...current,
        ])
        setContent('')
        setFiles([])
        setMaterials([])
        setActivityDate(
          stage?.startDate ? dayjs(stage.startDate) : dayjs()
        )
        message.success('Đã thêm bản ghi mẫu.')
        return
      }
      const response = await ProductionLogService.create({
        cultivationLogbookId: planId,
        landPlotId: plan.landPlotId,
        activityType,
        activityDate: activityDate.format('YYYY-MM-DD[T]00:00:00'),
        description: content.trim(),
        performedBy,
        materials: materialPayload(),
        images: [],
      })
      if (response?.success === false) return
      const logId = getCreatedId(response)
      if (files.length && !logId) {
        message.warning('Đã lưu bản ghi nhưng API không trả ID để tải ảnh.')
      } else if (logId) {
        for (const file of files) {
          await ProductionLogService.uploadImage(
            logId,
            file.originFileObj || file,
            stage?.stageName
          )
        }
      }
      message.success('Đã lưu ghi chép thực tế.')
      setContent('')
      setFiles([])
      setMaterials([])
      setActivityDate(stage?.startDate ? dayjs(stage.startDate) : dayjs())
      await load()
    } catch (error) {
      message.error(error.message || 'Không thể lưu bản ghi.')
    } finally {
      setSaving(false)
    }
  }

  const openQualityRequest = (log, index) => {
    setSelectedQualityLog({
      ...log,
      requestKey:
        log.id ||
        log.cultivationLogId ||
        log.productionLogId ||
        `stage-log-${index}`,
    })
    setQualityObject(undefined)
    setSampleDate(log.activityDate ? dayjs(log.activityDate) : dayjs())
    setSampleCode('')
    setSampleLocation(plan?.landPlotName || '')
    setLaboratory('')
    setResultSummary('')
    setQualityFiles([])
    setQualityModalOpen(true)
  }

  const submitQualityRequest = () => {
    if (!qualityObject || !sampleDate || !sampleLocation.trim()) {
      message.warning(
        'Vui lòng chọn đối tượng kiểm tra, ngày lấy mẫu và vị trí lấy mẫu.'
      )
      return
    }
    setQualityRequestStatus((current) => ({
      ...current,
      [selectedQualityLog.requestKey]: 'PENDING',
    }))
    setQualityModalOpen(false)
    message.success(
      'Đã gửi yêu cầu kiểm tra chất lượng đến Farm Manager.'
    )
  }

  const completeStage = () => {
    Modal.confirm({
      title: 'Chốt giai đoạn canh tác?',
      content: 'Sau khi chốt, giai đoạn sẽ được đánh dấu hoàn thành.',
      okText: 'Chốt giai đoạn',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setCompleting(true)
          if (planId.startsWith('mock-')) {
            setStage((current) => ({ ...current, status: 'COMPLETED' }))
            message.success('Đã chốt giai đoạn mẫu.')
            return
          }
          await ProductionStageService.update(stageId, {
            cultivationLogbookId: planId,
            stageName: stage.stageName,
            startDate: stage.startDate,
            endDate: stage.endDate,
            status: 'COMPLETED',
            note: stage.note || null,
          })
          message.success('Đã hoàn thành giai đoạn.')
          await load()
        } finally {
          setCompleting(false)
        }
      },
    })
  }

  if (loading) {
    return <Card className="rounded-2xl"><Skeleton active paragraph={{ rows: 14 }} /></Card>
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() =>
              navigate(
                ROUTER.FS_LOGBOOK_DETAIL.replace(':planId', planId)
              )
            }
            className="mb-2"
          >
            Quay lại chi tiết nhật ký
          </Button>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="m-0 text-2xl font-bold text-green-900">
              Ghi chép thực tế giai đoạn
            </h1>
            <Tag color={stage?.status === 'COMPLETED' ? 'success' : 'processing'}>
              {stage?.status === 'COMPLETED' ? 'Hoàn thành' : 'Đang thực hiện'}
            </Tag>
            {planId.startsWith('mock-') && (
              <Tag color="blue">Dữ liệu mẫu cho Backend</Tag>
            )}
          </div>
          <Text type="secondary">{plan?.planName}</Text>
        </div>
        <Button
          icon={<CheckCircleOutlined />}
          onClick={completeStage}
          loading={completing}
          disabled={!stage || stage.status === 'COMPLETED'}
          className="h-10 font-semibold rounded-lg"
        >
          Chốt giai đoạn
        </Button>
      </div>

      <Row gutter={[20, 20]} align="top">
        <Col xs={24} lg={7}>
          <Card
            bordered={false}
            className="overflow-hidden border border-gray-100 shadow-sm rounded-2xl lg:sticky lg:top-5"
            bodyStyle={{ padding: 0 }}
          >
            <div className="p-5 text-white bg-gradient-to-br from-green-700 to-green-600">
              <div className="flex items-center gap-2 text-sm font-semibold text-green-100">
                <InfoCircleOutlined />
                Thông tin giai đoạn
              </div>
              <h2 className="mt-3 mb-0 text-xl font-bold text-white">
                {stage?.stageName || 'Không tìm thấy giai đoạn'}
              </h2>
            </div>
            <div className="p-5">
              <div className="mb-2 text-xs font-bold tracking-wide text-gray-400 uppercase">
                Hướng dẫn kỹ thuật
              </div>
              <p className="m-0 text-sm leading-6 text-gray-700 whitespace-pre-wrap">
                {stage?.note || 'Chưa có mô tả'}
              </p>
              <div className="grid grid-cols-2 gap-3 pt-4 mt-5 border-t border-gray-100">
                <div className="p-3 rounded-xl bg-gray-50">
                  <Text type="secondary" className="block text-xs">
                    Bắt đầu
                  </Text>
                  <div className="mt-1 text-sm font-semibold">
                    {stage?.startDate ? formatDate(stage.startDate) : '—'}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-gray-50">
                  <Text type="secondary" className="block text-xs">
                    Kết thúc
                  </Text>
                  <div className="mt-1 text-sm font-semibold">
                    {stage?.endDate ? formatDate(stage.endDate) : '—'}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={17}>
          <Card
            bordered={false}
            className="border border-gray-100 shadow-sm rounded-2xl"
            title={
              <div className="flex items-center gap-3 py-1">
                <span className="flex items-center justify-center w-9 h-9 text-green-700 rounded-xl bg-green-50">
                  <FormOutlined />
                </span>
                <div>
                  <div className="font-bold text-gray-900">Thêm bản ghi mới</div>
                  <Text type="secondary" className="text-xs font-normal">
                    Ghi nhận công việc thực tế trong giai đoạn
                  </Text>
                </div>
              </div>
            }
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Text className="block mb-1 text-xs font-semibold">Ngày ghi chép</Text>
                <DatePicker
                  value={activityDate}
                  onChange={setActivityDate}
                  disabledDate={disableOutsideStage}
                  format="DD/MM/YYYY"
                  className="w-full"
                />
              </Col>
              <Col xs={24} md={12}>
                <Text className="block mb-1 text-xs font-semibold">Loại công việc</Text>
                <Select
                  value={activityType}
                  onChange={setActivityType}
                  options={activityOptions}
                  className="w-full"
                />
              </Col>
              <Col xs={24}>
                <div className="flex items-center gap-2 mb-2">
                  <FormOutlined className="text-green-600" />
                  <Text className="text-sm font-semibold">
                    Nội dung thực tế tại hiện trường
                  </Text>
                </div>
                <Input.TextArea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  rows={4}
                  className="rounded-xl"
                  placeholder="Mô tả hoạt động đã thực hiện, tình trạng đất đai, cây trồng, máy móc hoặc các phát sinh..."
                />
              </Col>
              <Col xs={24}>
                <div className="flex items-center gap-2 mb-2">
                  <CameraOutlined className="text-green-600" />
                  <Text className="text-sm font-semibold">Ảnh minh chứng</Text>
                  <Text type="secondary" className="text-xs">
                    (Không bắt buộc)
                  </Text>
                </div>
                <Dragger
                  multiple
                  accept=".png,.jpg,.jpeg"
                  fileList={files}
                  beforeUpload={(file) => {
                    setFiles((current) => [...current, file])
                    return false
                  }}
                  onRemove={(file) =>
                    setFiles((current) =>
                      current.filter((item) => item.uid !== file.uid)
                    )
                  }
                  className="[&_.ant-upload]:!py-5 [&_.ant-upload-drag-container]:!align-middle"
                >
                  <CloudUploadOutlined className="text-2xl text-green-600" />
                  <p className="mt-1 mb-0 font-medium">
                    Kéo thả hoặc bấm để tải ảnh
                  </p>
                  <Text type="secondary" className="text-xs">
                    PNG, JPG theo giới hạn hệ thống
                  </Text>
                </Dragger>
              </Col>
              <Col xs={24}>
                <div className="overflow-hidden border border-gray-200 rounded-2xl">
                  <div className="flex flex-wrap items-center justify-between gap-3 p-4 border-b border-gray-100 bg-gray-50/70">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center justify-center w-9 h-9 text-green-700 bg-white border border-green-100 rounded-xl">
                        <ExperimentOutlined />
                      </span>
                      <div>
                        <div className="font-bold text-gray-900">
                          Sử dụng vật tư
                        </div>
                        <Text type="secondary" className="text-xs">
                          Ghi nhận loại và định lượng vật tư đã sử dụng
                        </Text>
                      </div>
                    </div>
                    <Button
                      icon={<PlusOutlined />}
                      onClick={addMaterial}
                      className="h-9 font-semibold text-green-700 border-green-300 rounded-lg hover:!border-green-500"
                    >
                      Thêm vật tư
                    </Button>
                  </div>

                  <div className="p-4">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {materialCategories.map((category) => (
                        <button
                          type="button"
                          key={category.value}
                          onClick={() => setMaterialCategory(category.value)}
                          className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                            materialCategory === category.value
                              ? 'border-green-600 bg-green-600 text-white shadow-sm'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-green-300 hover:text-green-700'
                          }`}
                        >
                          {category.label}
                        </button>
                      ))}
                    </div>

                    {materials.length ? (
                      <div className="space-y-3">
                        {materials.map((item, index) => {
                          const options = materialOptions.filter(
                            (option) => option.category === item.category
                          )
                          const fieldConfig =
                            materialFieldConfigs[item.category] ||
                            materialFieldConfigs.FARM_MATERIAL
                          const unitOptions = [
                            ...new Set(
                              item.unit
                                ? [item.unit, ...fieldConfig.units]
                                : fieldConfig.units
                            ),
                          ].map((unit) => ({
                            value: unit,
                            label: unit,
                          }))
                          return (
                            <div
                              key={item.clientId}
                              className="p-4 bg-white border border-gray-200 rounded-xl"
                            >
                            <div className="flex items-center justify-between gap-2 mb-3">
                              <Tag color="green">
                                {materialCategories.find(
                                  (category) =>
                                    category.value === item.category
                                )?.label || item.category}
                              </Tag>
                              <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() =>
                                  removeMaterial(item.clientId)
                                }
                                aria-label={`Xóa vật tư ${index + 1}`}
                              />
                            </div>

                            <div
                              className={`grid gap-3 md:grid-cols-2 ${
                                fieldConfig.supportsDilution
                                  ? 'xl:grid-cols-6'
                                  : 'xl:grid-cols-5'
                              }`}
                            >
                              <div className="xl:col-span-2">
                                <Text className="block mb-1 text-xs">
                                  Vật tư
                                </Text>
                                <Select
                                  value={item.resourceId}
                                  placeholder="Chọn vật tư..."
                                  className="w-full"
                                  showSearch
                                  optionFilterProp="label"
                                  options={options.map((option) => ({
                                    value: option.id,
                                    label: option.name,
                                  }))}
                                  onChange={(value) => {
                                    const selected = options.find(
                                      (option) => option.id === value
                                    )
                                    updateMaterial(item.clientId, {
                                      resourceId: value,
                                      resourceName: selected?.name || '',
                                      unit: selected?.unit || item.unit,
                                    })
                                  }}
                                />
                              </div>
                              {fieldConfig.supportsDilution && (
                                <div>
                                  <Text className="block mb-1 text-xs">
                                    Nồng độ pha loãng
                                  </Text>
                                  <Input
                                    value={item.concentration}
                                    placeholder={
                                      fieldConfig.dilutionPlaceholder
                                    }
                                    onChange={(event) =>
                                      updateMaterial(item.clientId, {
                                        concentration: event.target.value,
                                      })
                                    }
                                  />
                                </div>
                              )}
                              <div>
                                <Text className="block mb-1 text-xs">
                                  {fieldConfig.quantityLabel}
                                </Text>
                                <InputNumber
                                  value={item.quantity}
                                  min={0.0001}
                                  className="w-full"
                                  placeholder="0"
                                  onChange={(value) =>
                                    updateMaterial(item.clientId, {
                                      quantity: value,
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <Text className="block mb-1 text-xs">
                                  Đơn vị
                                </Text>
                                <Select
                                  value={item.unit}
                                  className="w-full"
                                  options={unitOptions}
                                  onChange={(value) =>
                                    updateMaterial(item.clientId, {
                                      unit: value,
                                    })
                                  }
                                />
                              </div>
                              <div>
                                <Text className="block mb-1 text-xs">
                                  {fieldConfig.areaLabel}
                                </Text>
                                <div className="flex gap-2">
                                  <InputNumber
                                    value={item.areaQuantity}
                                    min={0}
                                    className="w-full"
                                    placeholder="0"
                                    onChange={(value) =>
                                      updateMaterial(item.clientId, {
                                        areaQuantity: value,
                                      })
                                    }
                                  />
                                  <Select
                                    value={item.areaUnit}
                                    className="w-24"
                                    options={[
                                      { value: 'ha', label: 'ha' },
                                      { value: 'm²', label: 'm²' },
                                      { value: 'sào', label: 'sào' },
                                    ]}
                                    onChange={(value) =>
                                      updateMaterial(item.clientId, {
                                        areaUnit: value,
                                      })
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="px-4 py-4 text-center border border-dashed border-gray-200 bg-gray-50/50 rounded-xl">
                        <Text type="secondary" className="text-sm">
                          Chọn nhóm vật tư rồi nhấn “Thêm vật tư”
                        </Text>
                      </div>
                    )}
                  </div>
                </div>
              </Col>
            </Row>
            <div className="flex justify-end pt-4 mt-5 border-t border-gray-100">
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={save}
                loading={saving}
                className="h-11 px-6 font-semibold bg-green-700 border-0 rounded-xl shadow-md shadow-green-100"
              >
                Lưu bản ghi
              </Button>
            </div>
          </Card>

          <Card
            bordered={false}
            className="mt-5 border border-gray-100 shadow-sm rounded-2xl"
            title={
              <div className="flex items-center gap-3 py-1">
                <span className="flex items-center justify-center w-9 h-9 text-green-700 rounded-xl bg-green-50">
                  <HistoryOutlined />
                </span>
                <div>
                  <div className="font-bold text-gray-900">
                    Lịch sử thực hiện
                  </div>
                  <Text type="secondary" className="text-xs font-normal">
                    Các bản ghi đã được lưu trong giai đoạn
                  </Text>
                </div>
              </div>
            }
          >
            {stageLogs.length ? (
              <Timeline
                items={stageLogs.map((log, logIndex) => ({
                  color: 'green',
                  children: (
                    <div className="pb-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Tag color="green">
                          <CalendarOutlined className="mr-1" />
                          {log.activityDate ? formatDate(log.activityDate) : '—'}
                        </Tag>
                        <div className="flex flex-wrap items-center gap-2">
                          <Text type="secondary" className="text-xs">
                            {log.performedByName ||
                              log.creatorName ||
                              'Farm Supervisor'}
                          </Text>
                          {qualityRequestStatus[
                            getLogRequestKey(log, logIndex)
                          ] === 'PENDING' ? (
                            <Tag
                              color="gold"
                              icon={<SafetyCertificateOutlined />}
                            >
                              Chờ Farm Manager kiểm tra
                            </Tag>
                          ) : (
                            <Button
                              size="small"
                              icon={<SafetyCertificateOutlined />}
                              className="border-green-200 text-green-700"
                              onClick={() =>
                                openQualityRequest(log, logIndex)
                              }
                            >
                              Gửi kiểm tra chất lượng
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="p-3 mt-2 mb-0 text-sm text-gray-700 whitespace-pre-wrap border rounded-xl bg-gray-50">
                        {log.description || 'Không có nội dung'}
                      </p>
                      {log.materials?.length > 0 && (
                        <div className="p-3 mt-2 border border-green-100 rounded-xl bg-green-50/50">
                          <div className="mb-2 text-xs font-bold text-green-900">
                            Vật tư đã sử dụng
                          </div>
                          <div className="space-y-1">
                            {log.materials.map((material, index) => (
                              <div
                                key={
                                  material.id ||
                                  material.materialId ||
                                  material.fertilizerId ||
                                  material.cropProtectionId ||
                                  index
                                }
                                className="flex flex-wrap justify-between gap-2 text-xs"
                              >
                                <span>
                                  {material.materialName ||
                                    material.fertilizerName ||
                                    material.cropProtectionName ||
                                    material.note ||
                                    `Vật tư ${index + 1}`}
                                </span>
                                <strong>
                                  {material.quantity} {material.unit}
                                </strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {(log.images?.length || log.imageUrls?.length) > 0 && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {(log.images || log.imageUrls).map((image, index) => (
                            <Image
                              key={image.id || image.imageUrl || image || index}
                              src={image.imageUrl || image.url || image}
                              width={96}
                              height={72}
                              className="object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ),
                }))}
              />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có ghi chép cho giai đoạn này" />
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        open={qualityModalOpen}
        width={820}
        title={
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-lg text-green-700">
              <SafetyCertificateOutlined />
            </span>
            <div>
              <div className="font-bold text-gray-900">
                Gửi yêu cầu kiểm tra chất lượng
              </div>
              <div className="text-xs font-normal text-gray-500">
                Phiếu được gắn với bản ghi nhật ký đã chọn
              </div>
            </div>
          </div>
        }
        onCancel={() => setQualityModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setQualityModalOpen(false)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            icon={<SendOutlined />}
            className="bg-green-600"
            onClick={submitQualityRequest}
          >
            Gửi Farm Manager
          </Button>,
        ]}
      >
        <div className="space-y-5 pt-3">
          <div className="rounded-xl border border-green-100 bg-green-50/60 p-4">
            <div className="mb-1 text-xs font-semibold uppercase text-green-700">
              Bản ghi được kiểm tra
            </div>
            <div className="font-semibold text-gray-900">
              {selectedQualityLog?.description || 'Bản ghi hiện trường'}
            </div>
            <div className="mt-1 text-xs text-gray-500">
              Ngày ghi chép:{' '}
              {selectedQualityLog?.activityDate
                ? formatDate(selectedQualityLog.activityDate)
                : '—'}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Text className="mb-1.5 block text-sm font-medium">
                <span className="mr-1 text-red-500">*</span>
                Đối tượng kiểm tra
              </Text>
              <Select
                value={qualityObject}
                className="w-full"
                placeholder="Chọn đất, nước tưới hoặc sản phẩm"
                options={qualityObjectOptions}
                onChange={setQualityObject}
              />
            </div>
            <div>
              <Text className="mb-1.5 block text-sm font-medium">
                <span className="mr-1 text-red-500">*</span>
                Ngày lấy mẫu
              </Text>
              <DatePicker
                value={sampleDate}
                format="DD/MM/YYYY"
                className="w-full"
                onChange={setSampleDate}
              />
            </div>
            <div>
              <Text className="mb-1.5 block text-sm font-medium">
                Mã mẫu
              </Text>
              <Input
                value={sampleCode}
                placeholder="VD: DAT-A1-1907"
                onChange={(event) => setSampleCode(event.target.value)}
              />
            </div>
            <div>
              <Text className="mb-1.5 block text-sm font-medium">
                <span className="mr-1 text-red-500">*</span>
                Vị trí lấy mẫu
              </Text>
              <Input
                value={sampleLocation}
                placeholder="Nhập vị trí lấy mẫu cụ thể"
                onChange={(event) => setSampleLocation(event.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Text className="mb-1.5 block text-sm font-medium">
                Đơn vị xét nghiệm
              </Text>
              <Input
                value={laboratory}
                placeholder="Tên phòng thử nghiệm hoặc đơn vị xét nghiệm"
                onChange={(event) => setLaboratory(event.target.value)}
              />
            </div>
          </div>

          <div>
            <Text className="mb-1.5 block text-sm font-medium">
              Kết quả hoặc ghi chú ban đầu
            </Text>
            <Input.TextArea
              value={resultSummary}
              rows={3}
              maxLength={1000}
              showCount
              placeholder="Nhập kết quả đo nhanh, tình trạng mẫu hoặc thông tin cần Farm Manager lưu ý..."
              onChange={(event) => setResultSummary(event.target.value)}
            />
          </div>

          <div>
            <Text className="mb-1.5 block text-sm font-medium">
              Phiếu xét nghiệm và ảnh lấy mẫu
            </Text>
            <Dragger
              multiple
              maxCount={5}
              accept=".pdf,.png,.jpg,.jpeg"
              fileList={qualityFiles}
              beforeUpload={() => false}
              onChange={({ fileList }) => setQualityFiles(fileList)}
            >
              <CloudUploadOutlined className="text-2xl text-green-600" />
              <div className="mt-2 font-medium">
                Kéo thả hoặc bấm để tải tệp
              </div>
              <div className="mt-1 text-xs text-gray-400">
                PDF, PNG, JPG · tối đa 5 tệp
              </div>
            </Dragger>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default StageLog
