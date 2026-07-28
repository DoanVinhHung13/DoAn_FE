import {
  ArrowLeftOutlined,
  EditOutlined,
  FileTextOutlined,
  ProfileOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Empty,
  message,
  Skeleton,
  Typography,
} from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import TitleCustom from 'src/components/TitleCustom'
import ROUTER from 'src/router/ROUTER'
import PlanTemplateService from 'src/services/PlanTemplateService'
import ProcessStepService from 'src/services/ProcessStepService'

const { Text } = Typography

const normalizeItems = (response) => {
  const payload = response?.data ?? response ?? {}
  const data = payload?.data ?? payload
  return Array.isArray(data)
    ? data
    : data?.items || data?.results || data?.processSteps || []
}

const InfoItem = ({ label, value, helper, icon }) => (
  <div className="flex min-w-0 items-center gap-3 px-5 py-4">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-50 text-base text-green-600">
      {icon}
    </div>
    <div className="min-w-0">
      <p className="mb-0.5 text-[11px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p className="m-0 truncate text-sm font-semibold text-gray-800">
        {value || '—'}
      </p>
      <p className="mb-0 mt-0.5 truncate text-xs text-gray-400">{helper}</p>
    </div>
  </div>
)

const PlanTemplateDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [item, setItem] = useState(null)
  const [steps, setSteps] = useState([])

  useEffect(() => {
    let mounted = true

    const loadDetail = async () => {
      try {
        setLoading(true)
        const [templateResponse, stepsResponse] = await Promise.all([
          PlanTemplateService.getById(id),
          ProcessStepService.getAll({ PageIndex: 1, PageSize: 1000 }),
        ])
        if (!mounted) return

        const template = templateResponse?.data ?? templateResponse
        const templateSteps = normalizeItems(stepsResponse)
          .filter(
            (step) =>
              (step.processTemplateId || step.processTemplate?.id) === id
          )
          .sort(
            (first, second) =>
              (first.stepOrder || 0) - (second.stepOrder || 0)
          )

        setItem(template)
        setSteps(templateSteps)
      } catch (error) {
        // axios interceptor handles error notification
        navigate(ROUTER.FM_PLAN_TEMPLATES)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadDetail()
    return () => {
      mounted = false
    }
  }, [id, navigate])

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton.Button active className="!h-10 !w-72" />
        <Card variant="borderless" className="shadow-sm rounded-2xl">
          <Skeleton active paragraph={{ rows: 10 }} />
        </Card>
      </div>
    )
  }

  if (!item) return null

  const catalogName =
    item.cropCatalogName || item.cropCatalog?.name || 'Chưa xác định'
  const cropName = item.cropName || item.crop?.name

  return (
    <div className="space-y-5 duration-500 animate-in fade-in">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTER.FM_PLAN_TEMPLATES)}
            className="h-10 rounded-xl"
          >
            Quay lại
          </Button>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <ProfileOutlined className="text-green-600" />
            Chi tiết mẫu quy trình
          </TitleCustom>
        </div>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() =>
            navigate(ROUTER.FM_PLAN_TEMPLATE_EDIT.replace(':id', id))
          }
          className="h-10 rounded-xl border-0 bg-green-600 px-5 font-bold shadow-lg shadow-green-100"
        >
          Chỉnh sửa
        </Button>
      </div>

      <Card
        variant="borderless"
        className="overflow-hidden border border-gray-100 shadow-sm rounded-2xl"
        styles={{ body: { padding: 0 } }}
      >
        <div
          className="border-l-4 border-green-600 px-6 py-5 md:px-7"
          style={{ backgroundColor: '#f0fdf4' }}
        >
          <h1 className="mb-1 text-xl font-bold leading-tight text-gray-900 md:text-2xl">
            {item.name}
          </h1>
          <p className="m-0 max-w-5xl text-sm leading-6 text-gray-600">
            {item.description || 'Mẫu quy trình chưa có mô tả tổng quan.'}
          </p>
        </div>

        <div className="grid divide-y divide-gray-100 bg-white sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:divide-x">
          <InfoItem
            label="Danh mục"
            value={catalogName}
            icon={<ProfileOutlined />}
          />
          <InfoItem
            label="Cây trồng"
            value={cropName || 'Cả danh mục'}
            icon={<FileTextOutlined />}
          />
          {/* <InfoItem
            label="Thời lượng"
            value={
              item.estimatedDurationDays
                ? `${item.estimatedDurationDays} ngày`
                : 'Chưa thiết lập'
            }
            helper="Tổng thời gian dự kiến"
            icon={<CalendarOutlined />}
          /> */}
          <InfoItem
            label="Số bước"
            value={`${steps.length} bước`}
            icon={<ProfileOutlined />}
          />
        </div>
      </Card>

      <Card
        variant="borderless"
        className="shadow-sm rounded-2xl"
        styles={{ body: { padding: 0 } }}
      >
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="m-0 text-base font-bold text-gray-800">
              Các bước thực hiện
            </h2>
            <Text type="secondary" className="text-xs">
              Sắp xếp theo thứ tự thực hiện
            </Text>
          </div>
          {/* <Tag color="green" className="m-0 rounded-full px-3 py-1">
            {steps.length} bước
          </Tag> */}
        </div>

        {steps.length ? (
          <div className="relative px-6 py-5">
            <div className="absolute bottom-10 left-[43px] top-10 w-px bg-green-100" />
            <div className="space-y-3">
              {steps.map((step, index) => (
                <div
                  key={step.id || index}
                  className="group relative flex items-start gap-3"
                >
                  <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-4 border-green-50 bg-green-600 text-xs font-bold text-white">
                    {step.stepOrder || index + 1}
                  </div>

                  <div className="min-w-0 flex-1 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 transition-colors group-hover:border-green-200">
                    <div className="mb-2 flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                      <h3 className="m-0 text-sm font-bold text-gray-800">
                        {step.stepName || `Bước ${index + 1}`}
                      </h3>
                      {/* <div className="flex flex-wrap gap-2">
                        {step.estimatedDay !== null &&
                          step.estimatedDay !== undefined && (
                            <Tag
                              icon={<CalendarOutlined />}
                              color="blue"
                              className="m-0"
                            >
                              Ngày thứ {step.estimatedDay}
                            </Tag>
                          )}
                        {step.requiredMaterialType && (
                          <Tag color="gold" className="m-0">
                            {step.requiredMaterialType}
                          </Tag>
                        )}
                      </div> */}
                    </div>

                    <p className="m-0 whitespace-pre-line text-sm leading-5 text-gray-600">
                      {step.description || 'Chưa có mô tả công việc.'}
                    </p>

                    {/* {step.note && (
                      <div className="mt-3 flex gap-2 rounded-lg bg-amber-50 px-3 py-2 text-sm">
                        <span className="shrink-0 font-semibold text-amber-700">
                          Ghi chú:
                        </span>
                        <p className="m-0 whitespace-pre-line leading-5 text-amber-900">
                          {step.note}
                        </p>
                      </div>
                    )} */}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Mẫu quy trình chưa có bước nào."
            className="py-10"
          />
        )}
      </Card>
    </div>
  )
}

export default PlanTemplateDetail
