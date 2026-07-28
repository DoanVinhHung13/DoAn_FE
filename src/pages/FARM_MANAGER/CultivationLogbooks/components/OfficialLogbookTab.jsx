import {
  FileImageOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import { Card, Empty, Image, Spin, List, Avatar, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { formatDate } from 'src/utils/dateFormatters'
import CultivationStageService from 'src/services/CultivationStageService'

const { Text, Paragraph } = Typography

const SectionTitle = ({ children }) => (
  <div className="flex items-center gap-3 mb-5">
    <span className="w-1 h-6 bg-green-500 rounded-full" />
    <h3 className="m-0 text-base font-bold text-gray-800">{children}</h3>
  </div>
)

// Item trong danh sách "Lộ trình sản xuất" bên trái
const StageListItem = ({ stage, index, isActive, onClick }) => (
  <List.Item
    onClick={onClick}
    className="mb-2 cursor-pointer rounded-xl px-3 py-2 transition-colors"
    style={{
      border: isActive ? '1px solid #22c55e' : '1px solid #e5e7eb',
      background: isActive ? '#f0fdf4' : '#fff',
    }}
  >
    <List.Item.Meta
      avatar={
        <Avatar
          size={32}
          style={{
            backgroundColor: isActive ? '#16a34a' : '#f3f4f6',
            color: isActive ? '#fff' : '#6b7280',
            fontWeight: 700,
          }}
        >
          {index + 1}
        </Avatar>
      }
      title={
        <Text strong style={{ color: isActive ? '#15803d' : '#1f2937', whiteSpace: 'normal' }}>
          {stage.stageName || stage.name || `Giai đoạn ${index + 1}`}
        </Text>
      }
      description={
        <div className="flex flex-col gap-0.5">
          <Text type="secondary" style={{ fontSize: 11 }}>
            Kế hoạch: {stage.startDate ? formatDate(stage.startDate) : 'Chưa xác định'}{' — '}
            {stage.endDate ? formatDate(stage.endDate) : 'Chưa xác định'}
          </Text>
          <Text style={{ fontSize: 11, color: stage.actualStartDate ? '#16a34a' : '#9ca3af' }}>
            Thực tế: {stage.actualStartDate ? formatDate(stage.actualStartDate) : 'Chưa bắt đầu'}{' — '}
            {stage.actualEndDate ? formatDate(stage.actualEndDate) : 'Đang thực hiện'}
          </Text>
        </div>
      }
    />
  </List.Item>
)

const OfficialLogbookTab = ({ item, stages = [] }) => {
  const [officialLogs, setOfficialLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedStageId, setSelectedStageId] = useState(null)

  // Mặc định chọn giai đoạn đầu tiên khi có dữ liệu
  useEffect(() => {
    if (stages.length && selectedStageId === null) {
      setSelectedStageId(stages[0]?.id ?? 0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stages])

  useEffect(() => {
    const fetchOfficialLogs = async () => {
      if (!selectedStageId) return

      try {
        setLoading(true)
        const response = await CultivationStageService.getStageLogs(selectedStageId, {
          cultivationLogbookId: item?.id,
        })

        if (response?.data) {
          const logs = Array.isArray(response.data) ? response.data : response.data.data || response.data.items || []
          setOfficialLogs(logs)
        }
      } catch (error) {
        console.error('Lỗi khi lấy nhật ký chính thức:', error)
        setOfficialLogs([])
      } finally {
        setLoading(false)
      }
    }

    fetchOfficialLogs()
  }, [item?.id, selectedStageId])

  const selectedIndex = stages.findIndex((s, idx) => (s.id ?? idx) === selectedStageId)
  const selectedStage = selectedIndex >= 0 ? stages[selectedIndex] : null

  const stageLogs = officialLogs || []

  return (
    <div className="space-y-6">
      <Card bordered={false} className="shadow-sm rounded-2xl">
        <SectionTitle>Nhật ký chính thức (Đã biên tập bởi Supervisor)</SectionTitle>

        {stages.length ? (
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Cột trái: Lộ trình sản xuất */}
            <div className="flex-shrink-0 lg:w-72">
              <p className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
                Giai đoạn canh tác
              </p>
              <List
                itemLayout="horizontal"
                split={false}
                dataSource={stages}
                renderItem={(stage, stageIndex) => (
                  <StageListItem
                    key={stage.id || stageIndex}
                    stage={stage}
                    index={stageIndex}
                    isActive={(stage.id ?? stageIndex) === selectedStageId}
                    onClick={() => setSelectedStageId(stage.id ?? stageIndex)}
                  />
                )}
              />
            </div>

            {/* Cột phải: Chi tiết giai đoạn */}
            <div className="flex-1 min-w-0 pl-0 lg:pl-6 lg:border-l lg:border-gray-100">
              <Spin spinning={loading} tip="Đang tải dữ liệu giai đoạn...">
              {selectedStage ? (
                <>
                  <div className="mb-3">
                    <h4 className="mb-0.5 text-sm font-semibold text-gray-800">
                      {selectedStage.stageName || selectedStage.name || `Giai đoạn ${selectedIndex + 1}`}
                    </h4>
                    {stageLogs.length > 0 && (
                      <div className="flex flex-col gap-0.5">
                        {(() => {
                          const firstLog = stageLogs[0]
                          const lastLog = stageLogs[stageLogs.length - 1]
                          const wsd = firstLog.workStartDate || firstLog.startDate
                          const wed = lastLog.workEndDate || lastLog.endDate || wsd
                          return (
                            <Text style={{ fontSize: 12, color: '#16a34a' }}>
                              <CalendarOutlined className="mr-1" />
                              <span className="font-medium">Thực tế:</span>{' '}
                              {wsd ? formatDate(wsd) : 'Chưa xác định'}{' — '}
                              {wed ? formatDate(wed) : '—'}
                            </Text>
                          )
                        })()}
                      </div>
                    )}
                  </div>

                  {stageLogs.length > 0 ? (
                    stageLogs.map((task, logIndex) => {
                      const summary = task.summary || task.officialLog || {}
                      const taskName = task.taskName || task.name || task.title || `Công việc ${logIndex + 1}`
                      const description = summary.description || task.summaryDescription || task.finalDescription || ''
                      const materialsText = summary.materialsText || task.materialsText || ''
                      const workStartDate = task.workStartDate || summary.workStartDate || task.startDate
                      const workEndDate = task.workEndDate || summary.workEndDate || task.endDate
                      const editedBy = summary.editedBy || task.editedByName || summary.supervisorName || 'Supervisor'
                      const editedAt = summary.editedAt || task.editedAt || task.updatedAt

                      const rawImages = summary.images || task.images || []
                      const images = rawImages.map(img => {
                        if (typeof img === 'string') return img
                        return img.url ?? null
                      }).filter(Boolean)

                      const totalFertilizers = summary.totalFertilizers || summary.fertilizers || task.totalFertilizers || []
                      const totalPesticides = summary.totalPesticides || summary.pesticides || task.totalPesticides || []

                      return (
                        <div key={task.id || logIndex} className="flex gap-3">
                          {/* ── Timeline line + dot ── */}
                          <div className="flex flex-col items-center shrink-0 w-6">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm mt-2 z-10" />
                            <div className="w-0.5 flex-1 bg-emerald-300 mt-1" />
                          </div>

                          {/* ── Nội dung log ── */}
                          <div className="flex-1 py-2 pb-4">
                            <div className="mb-1 text-sm font-bold text-gray-800">{taskName}</div>
                            {/* 1. Ngày bắt đầu - kết thúc */}
                            {(workStartDate || workEndDate) && (
                              <div className="mb-2 text-sm font-semibold text-gray-800">
                                {workStartDate && formatDate(workStartDate)}
                                {workEndDate && ` - ${formatDate(workEndDate)}`}
                              </div>
                            )}

                            {(editedBy || editedAt) && (
                              <div className="mb-2 text-xs text-gray-500">
                                Cập nhật bởi {editedBy}
                                {editedAt ? ` · ${formatDate(editedAt)}` : ''}
                              </div>
                            )}

                            {/* 2. Mô tả */}
                            {description && (
                              <Paragraph className="!mb-1 !mt-0 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {description}
                              </Paragraph>
                            )}

                            {/* 3. Materials text */}
                            {materialsText && (
                              <Paragraph className="!mb-1 !mt-0 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                                {materialsText}
                              </Paragraph>
                            )}

                            {/* 4. Số liệu tổng hợp */}
                            {(totalFertilizers.length > 0 || totalPesticides.length > 0) && (
                              <div className="p-3 my-2 bg-gray-50 border border-gray-200 rounded-lg">
                                {totalFertilizers.length > 0 && (
                                  <div className="mb-2">
                                    <p className="mb-1 text-xs text-gray-500 font-medium">Phân bón:</p>
                                    <div className="space-y-1">
                                      {totalFertilizers.map((fert, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-xs text-gray-700">
                                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                                          <span className="font-medium">{fert.name || fert.fertilizerName || fert.materialName}</span>
                                          <span className="text-gray-400">-</span>
                                          <span className="font-medium text-green-700">
                                            {fert.quantity || fert.totalQuantity} {fert.unit || 'kg'}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {totalPesticides.length > 0 && (
                                  <div>
                                    <p className="mb-1 text-xs text-gray-500 font-medium">Thuốc BVTV:</p>
                                    <div className="space-y-1">
                                      {totalPesticides.map((pest, idx) => (
                                        <div key={idx} className="flex items-center gap-2 text-xs text-gray-700">
                                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0" />
                                          <span className="font-medium">{pest.name || pest.pesticideName || pest.materialName}</span>
                                          <span className="text-gray-400">-</span>
                                          <span className="font-medium text-orange-700">
                                            {pest.quantity || pest.totalQuantity} {pest.unit || 'lít'}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* 5. Ảnh minh chứng */}
                            {images.length > 0 && (
                              <div className="mt-2">
                                <p className="mb-1.5 text-xs font-semibold text-gray-500">
                                  <FileImageOutlined className="mr-1" />
                                  Ảnh minh chứng ({images.length})
                                </p>
                                <Image.PreviewGroup items={images}>
                                  <div className="flex flex-wrap gap-2">
                                    {images.map((src, idx) => (
                                      <div
                                        key={idx}
                                        className="h-16 w-16 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden cursor-pointer hover:border-emerald-400 hover:shadow-md transition-all [&_.ant-image]:!h-full [&_.ant-image]:!w-full [&_.ant-image-img]:!h-full [&_.ant-image-img]:!w-full [&_.ant-image-img]:!object-cover"
                                      >
                                        <Image src={src} preview={{ src }} />
                                      </div>
                                    ))}
                                  </div>
                                </Image.PreviewGroup>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Chưa có nhật ký chính thức cho giai đoạn này"
                      className="my-8"
                    />
                  )}
                </>
              ) : (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chọn một giai đoạn để xem chi tiết" />
              )}
              </Spin>
            </div>
          </div>
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Chưa có giai đoạn canh tác"
          />
        )}
      </Card>
    </div>
  )
}

export default OfficialLogbookTab
