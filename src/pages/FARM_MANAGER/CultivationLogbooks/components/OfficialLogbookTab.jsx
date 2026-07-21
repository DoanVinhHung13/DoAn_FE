import {
  CheckCircleOutlined,
  EditOutlined,
  FileImageOutlined,
  CalendarOutlined,
} from '@ant-design/icons'
import { Card, Empty, Tag, Image, Spin, List, Avatar, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { formatDate } from 'src/utils/dateFormatters'
import CultivationStageService from 'src/services/CultivationStageService'

const { Text } = Typography

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
        const response = await CultivationStageService.getStageLogs(selectedStageId)

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
  }, [selectedStageId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spin size="large" tip="Đang tải nhật ký chính thức..." />
      </div>
    )
  }

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
              {selectedStage ? (
                <>
                  <div className="mb-3">
                    <h4 className="mb-0.5 text-sm font-semibold text-gray-800">
                      {selectedStage.stageName || selectedStage.name || `Giai đoạn ${selectedIndex + 1}`}
                    </h4>
                    <div className="flex flex-col gap-0.5">
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        <CalendarOutlined className="mr-1" />
                        <span className="font-medium">Kế hoạch:</span>{' '}
                        {selectedStage.startDate ? formatDate(selectedStage.startDate) : 'Chưa xác định'}{' — '}
                        {selectedStage.endDate ? formatDate(selectedStage.endDate) : 'Chưa xác định'}
                      </Text>
                      <Text style={{ fontSize: 12, color: selectedStage.actualStartDate ? '#16a34a' : '#9ca3af' }}>
                        <CalendarOutlined className="mr-1" />
                        <span className="font-medium">Thực tế:</span>{' '}
                        {selectedStage.actualStartDate ? formatDate(selectedStage.actualStartDate) : 'Chưa bắt đầu'}{' — '}
                        {selectedStage.actualEndDate ? formatDate(selectedStage.actualEndDate) : 'Đang thực hiện'}
                      </Text>
                    </div>
                  </div>

                  {stageLogs.length > 0 ? (
                    stageLogs.map((task, logIndex) => {
                      const summary = task.summary || task.officialLog || {}
                      const taskName = task.taskName || task.name || task.title || `Công việc ${logIndex + 1}`
                      const description = summary.description || task.summaryDescription || task.finalDescription || 'Chưa có mô tả'
                      const editedBy = summary.editedBy || task.editedByName || summary.supervisorName || 'Supervisor'
                      const editedAt = summary.editedAt || task.editedAt || task.updatedAt

                      // Số liệu tổng hợp
                      const totalFertilizers = summary.totalFertilizers || summary.fertilizers || task.totalFertilizers || []
                      const totalPesticides = summary.totalPesticides || summary.pesticides || task.totalPesticides || []
                      const images = summary.images || task.images || []

                      return (
                        <div key={task.id || logIndex} className="p-4 mb-3 border border-blue-100 rounded-lg bg-blue-50/30">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="mb-0.5 text-sm font-semibold text-gray-800">{taskName}</p>
                              <p className="text-xs text-gray-500 mb-0">
                                <EditOutlined className="mr-1" />
                                Biên tập bởi: {editedBy}
                                {editedAt && ` - ${formatDate(editedAt)}`}
                              </p>
                            </div>
                            <Tag color="blue" icon={<CheckCircleOutlined />} className="text-xs">
                              Đã biên tập
                            </Tag>
                          </div>

                          {/* Mô tả chính thức */}
                          <div className="p-3 mb-3 bg-white border border-blue-200 rounded-lg">
                            <p className="mb-1 text-xs font-semibold text-blue-600 uppercase">
                              Mô tả chính thức:
                            </p>
                            <p className="mb-0 text-sm leading-relaxed text-gray-800 whitespace-pre-wrap">
                              {description}
                            </p>
                          </div>

                          {/* Số liệu tổng hợp */}
                          {(totalFertilizers.length > 0 || totalPesticides.length > 0) && (
                            <div className="p-3 mb-3 bg-gray-50 border border-gray-200 rounded-lg">
                              <p className="mb-2 text-xs font-semibold text-gray-600 uppercase">
                                Số liệu tổng hợp (tự động):
                              </p>

                              {totalFertilizers.length > 0 && (
                                <div className="mb-2">
                                  <p className="mb-1 text-xs text-gray-500">Phân bón:</p>
                                  <div className="space-y-1">
                                    {totalFertilizers.map((fert, idx) => (
                                      <div key={idx} className="flex items-center gap-2 text-xs text-gray-700">
                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                                        <span className="font-medium">{fert.name || fert.fertilizerName || fert.materialName}</span>
                                        <span className="text-gray-400">-</span>
                                        <span className="font-medium text-green-700">
                                          {fert.quantity || fert.totalQuantity} {fert.unit || 'kg'}
                                        </span>
                                        {fert.area && (
                                          <>
                                            <span className="text-gray-400">/</span>
                                            <span>{fert.area} {fert.areaUnit || 'm²'}</span>
                                          </>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {totalPesticides.length > 0 && (
                                <div>
                                  <p className="mb-1 text-xs text-gray-500">Thuốc BVTV:</p>
                                  <div className="space-y-1">
                                    {totalPesticides.map((pest, idx) => (
                                      <div key={idx} className="flex items-center gap-2 text-xs text-gray-700">
                                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0" />
                                        <span className="font-medium">{pest.name || pest.pesticideName || pest.materialName}</span>
                                        <span className="text-gray-400">-</span>
                                        <span className="font-medium text-orange-700">
                                          {pest.quantity || pest.totalQuantity} {pest.unit || 'lít'}
                                        </span>
                                        {pest.area && (
                                          <>
                                            <span className="text-gray-400">/</span>
                                            <span>{pest.area} {pest.areaUnit || 'm²'}</span>
                                          </>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Ảnh minh chứng */}
                          {images && images.length > 0 && (
                            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                              <p className="mb-1.5 text-xs font-semibold text-gray-600 uppercase">
                                <FileImageOutlined className="mr-1" />
                                Ảnh minh chứng ({images.length}):
                              </p>
                              <Image.PreviewGroup>
                                <div className="flex flex-wrap gap-2">
                                  {images.map((img, idx) => (
                                    <Image
                                      key={idx}
                                      src={img.url || img.imageUrl || img.filePath || img}
                                      alt={img.description || `Ảnh ${idx + 1}`}
                                      width={64}
                                      height={64}
                                      className="object-cover rounded-md"
                                      fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                                    />
                                  ))}
                                </div>
                              </Image.PreviewGroup>
                            </div>
                          )}
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