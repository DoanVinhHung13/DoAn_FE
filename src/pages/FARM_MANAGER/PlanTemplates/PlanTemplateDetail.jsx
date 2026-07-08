/**
 * PlanTemplateDetail — Chi tiết Mẫu Kế hoạch (Màn 1)
 * Route: /farm-manager/plan-templates/:id  (ROUTER.FM_PLAN_TEMPLATE_DETAIL)
 *
 * Architecture mirrors FertilizerDetail:
 *   - Button "Quay lại" + TitleCustom header
 *   - Single Card with section headers (green left-border bar)
 *   - Descriptions for basic info
 */
import {
  ArrowLeftOutlined,
  ProfileOutlined,
} from '@ant-design/icons'
import { Badge, Button, Card, Descriptions, Empty, Skeleton, Typography, message } from 'antd'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import TitleCustom from 'src/components/TitleCustom'
import ROUTER from 'src/router/ROUTER'
import PlanTemplateService from 'src/services/PlanTemplateService'

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
const PlanTemplateDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams()

  const [initialLoading, setInitialLoading] = useState(true)
  const [item, setItem] = useState(null)

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setInitialLoading(true)
        const res = await PlanTemplateService.getById(id)
        if (res?.success === false) {
          message.error('Không tìm thấy kế hoạch mẫu')
          navigate(ROUTER.FM_PLAN_TEMPLATES)
          return
        }
        setItem(res?.data)
      } catch (err) {
        message.error('Lấy thông tin kế hoạch mẫu thất bại')
        navigate(ROUTER.FM_PLAN_TEMPLATES)
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
          <ProfileOutlined className="text-green-600" />
          Chi tiết kế hoạch mẫu
        </TitleCustom>
        <Card bordered={false} className="shadow-sm rounded-2xl" bodyStyle={{ padding: '24px' }}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      </div>
    )
  }

  if (!item) return null

  const stages = item.stages || []

  return (
    <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* ── Header ── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTER.FM_PLAN_TEMPLATES)}>
            Quay lại
          </Button>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <ProfileOutlined className="text-green-600" />
            Chi tiết kế hoạch mẫu
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

          {/* ── Section 1: Thông Tin Cơ Bản ── */}
          <SectionTitle>Thông Tin Cơ Bản</SectionTitle>

          <Descriptions
            column={{ xs: 1, sm: 2 }}
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
            <Descriptions.Item label="Tên kế hoạch mẫu" span={2}>
              <span className="font-semibold">{item.name || '—'}</span>
            </Descriptions.Item>

            <Descriptions.Item label="Danh mục">
              {item.category || <span className="text-gray-400">—</span>}
            </Descriptions.Item>

            <Descriptions.Item label="Cây trồng">
              {item.cropType || <span className="text-gray-400">—</span>}
            </Descriptions.Item>
          </Descriptions>

          {item.description && (
            <div className="mt-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <p className="mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Mô tả
              </p>
              <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-line m-0">
                {item.description}
              </p>
            </div>
          )}

          {/* ── Section 2: Quy Trình Kỹ Thuật Chi Tiết ── */}
          <SectionTitle>Quy Trình Kỹ Thuật Chi Tiết</SectionTitle>

          {stages.length > 0 ? (
            <div className="relative">
              {stages.map((stage, index) => {
                const isLast = index === stages.length - 1
                const isFilled = !stage.isDraft

                return (
                  <div key={stage.id || index} className="relative flex gap-4">
                    {/* Vòng tròn + đường kẻ dọc */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                          isFilled
                            ? 'bg-green-600 text-white shadow-md shadow-green-200'
                            : 'bg-gray-100 text-gray-400 border-2 border-gray-200'
                        }`}
                      >
                        {index + 1}
                      </div>
                      {!isLast && (
                        <div className="w-0 flex-1 border-l-2 border-gray-200 my-1" />
                      )}
                    </div>

                    {/* Nội dung */}
                    <div className={`flex-1 ${!isLast ? 'pb-6' : 'pb-0'}`}>
                      <h3 className="text-base font-semibold text-gray-800 m-0 mb-2">
                        {stage.title || `Giai đoạn ${index + 1}`}
                      </h3>
                      {stage.isDraft ? (
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-4">
                          <p className="text-sm text-gray-400 italic m-0">
                            Nội dung đang được cập nhật cho {stage.title?.toLowerCase() || 'giai đoạn này'}...
                          </p>
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                          <p className="text-sm text-gray-700 whitespace-pre-wrap m-0 leading-relaxed">
                            {stage.description || 'Chưa có mô tả.'}
                          </p>
                        </div>
                      )}
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
    </div>
  )
}

export default PlanTemplateDetail
