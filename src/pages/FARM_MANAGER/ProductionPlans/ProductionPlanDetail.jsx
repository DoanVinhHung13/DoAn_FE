/**
 * ProductionPlanDetail — Chi tiết Kế hoạch sản xuất (Màn 2)
 * Route: /farm-manager/production-plans/:id  (ROUTER.FM_PRODUCTION_PLAN_DETAIL)
 *
 * Architecture mirrors FertilizerDetail:
 *   - Button "Quay lại" + TitleCustom header
 *   - Single Card with SectionTitle green-bar headers
 *   - Descriptions for info grid
 */
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  StopOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Badge, Button, Card, Descriptions, Empty, Skeleton, Tag, Typography, message } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import TitleCustom from 'src/components/TitleCustom'
import ROUTER from 'src/router/ROUTER'
import ProductionPlanService from 'src/services/ProductionPlanService'
import { getStageDetails } from 'src/services/ProductionPlanService/mockDataStageDetails'
import StageDetailModal from 'src/components/ProductionPlan/StageDetailModal'
import { useSystemKey } from 'src/hooks/useSystemKey'
import { SYSTEM_KEY } from 'src/constants/systemKey'

const { Text } = Typography

// ── Section header (Fertilizer-style) ─────────────────────────────────────────
const SectionTitle = ({ children }) => (
  <div
    className="mb-3 px-4 py-2 rounded-lg font-semibold text-green-800"
    style={{ background: '#f0fdf4', borderLeft: '3px solid #16a34a', fontSize: 13 }}
  >
    {children}
  </div>
)

// ── Main Component ────────────────────────────────────────────────────────────
const ProductionPlanDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { getDescription } = useSystemKey()

  const [initialLoading, setInitialLoading] = useState(true)
  const [item, setItem] = useState(null)
  const [selectedStage, setSelectedStage] = useState(null)
  const [stageModalOpen, setStageModalOpen] = useState(false)

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setInitialLoading(true)
        const res = await ProductionPlanService.getById(id)
        if (res?.success === false) {
          message.error('Không tìm thấy kế hoạch sản xuất')
          navigate(ROUTER.FM_PRODUCTION_PLANS)
          return
        }
        setItem(res?.data)
      } catch (err) {
        message.error('Lấy thông tin kế hoạch sản xuất thất bại')
        navigate(ROUTER.FM_PRODUCTION_PLANS)
      } finally {
        setInitialLoading(false)
      }
    }
    if (id) fetchDetail()
  }, [id, navigate])

  if (initialLoading) {
    return (
      <div className="space-y-6">
        <TitleCustom className="!mb-0 flex items-center gap-2">
          <CalendarOutlined className="text-green-600" />
          Chi tiết Kế hoạch sản xuất
        </TitleCustom>
        <Card bordered={false} className="shadow-sm rounded-2xl" bodyStyle={{ padding: '24px' }}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      </div>
    )
  }

  if (!item) return null

  const sysVal = item.status
  const isActive = sysVal === true || String(sysVal || '').toLowerCase() === 'active'
  const label = getDescription(SYSTEM_KEY.STATUS, sysVal) || (isActive ? 'Hoạt động' : 'Vô hiệu')

  const stages = item.stages || []

  const handleMapClick = () => {
    console.log('Open map/QR detail for production plan:', item.id)
  }

  const handleStageClick = (stage) => {
    const details = getStageDetails(stage.id)
    setSelectedStage({ ...stage, ...details })
    setStageModalOpen(true)
  }

  const handleCloseStageModal = () => {
    setStageModalOpen(false)
    setSelectedStage(null)
  }

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
            Chi tiết Kế hoạch sản xuất
          </TitleCustom>
        </div>
      </div>

      {/* ── Main Card ── */}
      <Card
        bordered={false}
        className="shadow-sm rounded-2xl"
        bodyStyle={{ padding: '24px' }}
      >
        <div className="space-y-6">

          {/* ── Header: Tên + Trạng thái ── */}
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-0.5 text-xs font-semibold tracking-wider text-gray-400 uppercase">
                Kế hoạch sản xuất
              </p>
              <span className="text-lg font-bold text-gray-800">
                {item.name || '—'}
              </span>
            </div>
            <Badge
              status={isActive ? 'success' : 'error'}
              text={
                <span className={`text-sm font-semibold ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
                  {label}
                </span>
              }
            />
          </div>

          {/* ── Section 1: Thông Tin Tổng Quan ── */}
          <SectionTitle>Thông Tin Tổng Quan</SectionTitle>

          <Descriptions
            column={{ xs: 1, sm: 2, lg: 3 }}
            size="small"
            labelStyle={{
              fontWeight: 600,
              color: '#6b7280',
              fontSize: 12,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
            contentStyle={{ color: '#1f2937', fontSize: 14 }}
          >
            <Descriptions.Item
              label={
                <span className="flex items-center gap-1">
                  <UserOutlined /> Người giám sát
                </span>
              }
            >
              {item.supervisor?.name || <span className="text-gray-400">Chưa chỉ định</span>}
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <span className="flex items-center gap-1">
                  <EnvironmentOutlined /> Vùng trồng
                </span>
              }
            >
              {item.area || <span className="text-gray-400">—</span>}
            </Descriptions.Item>

            <Descriptions.Item label="Danh mục cây trồng">
              {item.category || <span className="text-gray-400">—</span>}
            </Descriptions.Item>

            <Descriptions.Item label="Cây trồng cụ thể">
              {item.specificCrop || <span className="text-gray-400">—</span>}
            </Descriptions.Item>

            <Descriptions.Item
              label={
                <span className="flex items-center gap-1">
                  <CalendarOutlined /> Ngày bắt đầu
                </span>
              }
            >
              {item.startDate || <span className="text-gray-400">—</span>}
            </Descriptions.Item>
          </Descriptions>

          {/* Bản đồ thu nhỏ placeholder */}
          <div className="mt-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <p className="mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Mã Truy Xuất Nguồn Gốc
            </p>
            <button
              onClick={handleMapClick}
              className="w-full max-w-xs h-24 bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center rounded-lg cursor-pointer border-2 border-gray-200 hover:border-green-300 transition-colors"
            >
              <EnvironmentOutlined className="text-3xl text-green-400" />
            </button>
          </div>

          {/* ── Section 2: Quy Trình Kỹ Thuật ── */}
          <SectionTitle>Quy Trình Kỹ Thuật (Stages Sequence)</SectionTitle>

          {stages.length > 0 ? (
            <div className="relative">
              {stages.map((stage, index) => {
                const isLast = index === stages.length - 1
                const status = stage.status || 'notStarted'

                let circleClass = ''
                let innerContent = null
                if (status === 'done') {
                  circleClass = 'bg-green-500'
                  innerContent = <CheckCircleOutlined className="text-white text-sm" />
                } else if (status === 'inProgress') {
                  circleClass = 'bg-white border-2 border-green-500'
                  innerContent = <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                } else {
                  circleClass = 'bg-gray-100 border-2 border-gray-200'
                  innerContent = null
                }

                const statusConfig = {
                  done: { label: 'Hoàn thành', cls: 'bg-green-50 text-green-700' },
                  inProgress: { label: 'Đang thực hiện', cls: 'bg-amber-50 text-amber-700' },
                  notStarted: { label: 'Chưa bắt đầu', cls: 'bg-gray-50 text-gray-500' },
                }
                const sc = statusConfig[status] || statusConfig.notStarted

                return (
                  <div key={stage.id || index} className="relative flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`relative z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${circleClass}`}>
                        {innerContent}
                      </div>
                      {!isLast && <div className="w-0 flex-1 border-l-2 border-gray-200 my-1" />}
                    </div>

                    <div
                      className={`flex-1 ${!isLast ? 'pb-5' : 'pb-0'} cursor-pointer hover:bg-green-50/30 rounded-lg p-3 -ml-3 transition-colors`}
                      onClick={() => handleStageClick(stage)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Text strong className="text-gray-800">
                          Giai đoạn {stage.order || index + 1}: {stage.title}
                        </Text>
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ${sc.cls}`}>
                          {sc.label}
                        </span>
                      </div>

                      {(stage.dateFrom || stage.dateTo) && (
                        <p className="text-xs text-gray-400 m-0 mb-1">
                          Thời gian từ {stage.dateFrom || '...'} đến {stage.dateTo || '...'}
                        </p>
                      )}

                      {stage.description && (
                        <div className="bg-gray-50 rounded-lg p-3 mt-1 border border-gray-100">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap m-0 leading-relaxed">
                            {stage.description}
                          </p>
                        </div>
                      )}

                      <div className="mt-2 text-xs text-green-600 font-semibold">
                        → Nhấn để xem chi tiết
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Chưa có giai đoạn nào"
              className="py-4"
            />
          )}
        </div>
      </Card>

      {/* ── Stage Detail Modal ── */}
      <StageDetailModal
        open={stageModalOpen}
        onClose={handleCloseStageModal}
        stage={selectedStage}
      />
    </div>
  )
}

export default ProductionPlanDetail
