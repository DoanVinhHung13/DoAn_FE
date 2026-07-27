import {
  CalendarOutlined,
  UserOutlined,
  CheckCircleOutlined,
  FileImageOutlined,
} from '@ant-design/icons'
import { Card, Empty, Image, Tag, Spin, List, Avatar, Typography, Alert, Divider, Badge } from 'antd'
import { useEffect, useState } from 'react'
import { formatDate } from 'src/utils/dateFormatters'
import CultivationLogService from 'src/services/CultivationLogService'
import SectionTitle from 'src/components/Common/SectionTitle'

const { Text } = Typography

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

const DailyLogCard = ({ log, index }) => {
  // Parse data từ API
  const logDate = log.logDate || log.workDate || log.date || log.createdAt
  const recordedBy = log.recordedByName || log.createdByName || log.farmerName || log.recordedBy || 'Chưa xác định'
  const description = log.description || log.note || log.workDescription
  const status = log.status || log.approvalStatus

  const fertilizers = log.fertilizers || log.fertilizerUsages || []
  const pesticides = log.pesticides || log.pesticideUsages || []
  const images = log.images || log.photos || log.attachments || []

  return (
    <div className="mb-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gray-50/50 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-green-50 text-green-600 rounded-full font-bold">
            Ngày {index + 1}
          </div>
          <div>
            <p className="mb-0 text-sm font-bold text-gray-800">
              {logDate ? formatDate(logDate) : 'Chưa có ngày'}
            </p>
            <p className="mb-0 text-xs text-gray-500">
              <UserOutlined className="mr-1" />
              {recordedBy}
            </p>
          </div>
        </div>
        {(status === 'APPROVED' || status === 'COMPLETED') && (
          <Tag color="green" icon={<CheckCircleOutlined />} className="text-xs m-0 px-2 py-0.5 rounded-md">
            {status === 'APPROVED' ? 'Đã duyệt' : 'Hoàn thành'}
          </Tag>
        )}
        {status === 'PENDING' && <Tag color="orange" className="text-xs m-0 px-2 py-0.5 rounded-md">Chờ duyệt</Tag>}
      </div>

      <div className="p-4">
        {/* Mô tả công việc */}
        {description && (
          <div className="mb-4">
            <p className="mb-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">Nội dung công việc</p>
            <p className="text-sm text-gray-700 whitespace-pre-wrap mb-0 bg-gray-50 p-3 rounded-lg border border-gray-100">{description}</p>
          </div>
        )}

        {/* Vật tư sử dụng (Phân bón & Thuốc) */}
        {(fertilizers.length > 0 || pesticides.length > 0) && (
          <div className="mb-4 p-3 bg-gray-50/50 rounded-lg border border-gray-100">
            <p className="mb-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vật tư sử dụng</p>

            {fertilizers.length > 0 && (
              <div className="mb-3">
                <p className="mb-1.5 text-xs text-green-600 font-semibold">Phân bón:</p>
                <div className="space-y-1.5 pl-1">
                  {fertilizers.map((fert, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full flex-shrink-0" />
                      <span className="font-medium">{fert.name || fert.fertilizerName || fert.materialName}</span>
                      <span className="text-gray-300">·</span>
                      <span className="font-semibold text-green-700">{fert.quantity || fert.amount || fert.usedQuantity} {fert.unit || 'kg'}</span>
                      {fert.area && (
                        <>
                          <span className="text-gray-300">/</span>
                          <span className="text-gray-500">{fert.area} {fert.areaUnit || 'm²'}</span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pesticides.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs text-orange-600 font-semibold">Thuốc BVTV:</p>
                <div className="space-y-1.5 pl-1">
                  {pesticides.map((pest, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full flex-shrink-0" />
                      <span className="font-medium">{pest.name || pest.pesticideName || pest.materialName}</span>
                      <span className="text-gray-300">·</span>
                      <span className="font-semibold text-orange-700">{pest.quantity || pest.amount || pest.usedQuantity} {pest.unit || 'lít'}</span>
                      {pest.area && (
                        <>
                          <span className="text-gray-300">/</span>
                          <span className="text-gray-500">{pest.area} {pest.areaUnit || 'm²'}</span>
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
          <div>
            <p className="mb-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <FileImageOutlined className="mr-1" />
              Ảnh minh chứng ({images.length})
            </p>
            <Image.PreviewGroup>
              <div className="flex flex-wrap gap-2">
                {images.map((img, idx) => (
                  <div key={idx} className="overflow-hidden rounded-lg border border-gray-200 cursor-pointer">
                    <Image
                      src={img.url || img.imageUrl || img.filePath || img}
                      alt={img.description || img.caption || `Ảnh ${idx + 1}`}
                      width={80}
                      height={80}
                      className="object-cover hover:scale-110 transition-transform duration-300"
                      fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                    />
                  </div>
                ))}
              </div>
            </Image.PreviewGroup>
          </div>
        )}
      </div>
    </div>
  )
}

const ProcessTab = ({ item }) => {
  const stages = item.cultivationStages || item.productionStages || item.stages || []
  const [dailyLogs, setDailyLogs] = useState([])
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
    const fetchDailyLogs = async () => {
      if (!selectedStageId) return

      try {
        setLoading(true)
        const response = await CultivationLogService.getDailyLogsByStage(selectedStageId)

        if (response?.data) {
          const logs = Array.isArray(response.data) ? response.data : response.data.data || response.data.items || []
          setDailyLogs(logs)
        }
      } catch (error) {
        console.error('Lỗi khi lấy nhật ký hàng ngày:', error)
        setDailyLogs([])
      } finally {
        setLoading(false)
      }
    }

    fetchDailyLogs()
  }, [selectedStageId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spin size="large" tip="Đang tải nhật ký hàng ngày..." />
      </div>
    )
  }

  const selectedIndex = stages.findIndex((s, idx) => (s.id ?? idx) === selectedStageId)
  const selectedStage = selectedIndex >= 0 ? stages[selectedIndex] : null

  const stageLogs = dailyLogs || []

  return (
    <div className="space-y-6">
      <Card bordered={false} className="shadow-sm rounded-2xl">
        <SectionTitle>Quá trình thực tế theo từng công việc</SectionTitle>

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
                  {/* Header giai đoạn */}
                  <div className="mb-4 flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Text strong style={{ fontSize: 16 }} className="block text-gray-800 mb-1">
                        {selectedStage.stageName || selectedStage.name || `Giai đoạn ${selectedIndex + 1}`}
                      </Text>
                      <div className="flex flex-col gap-0.5">
                        <Text type="secondary" style={{ fontSize: 13 }}>
                          <CalendarOutlined className="mr-1" />
                          <span className="font-medium">Kế hoạch:</span>{' '}
                          {selectedStage.startDate ? formatDate(selectedStage.startDate) : 'Chưa xác định'}{' – '}
                          {selectedStage.endDate ? formatDate(selectedStage.endDate) : 'Chưa kết thúc'}
                        </Text>
                        <Text style={{ fontSize: 13, color: selectedStage.actualStartDate ? '#16a34a' : '#9ca3af' }}>
                          <CalendarOutlined className="mr-1" />
                          <span className="font-medium">Thực tế:</span>{' '}
                          {selectedStage.actualStartDate ? formatDate(selectedStage.actualStartDate) : 'Chưa bắt đầu'}{' – '}
                          {selectedStage.actualEndDate ? formatDate(selectedStage.actualEndDate) : 'Đang thực hiện'}
                        </Text>
                      </div>
                    </div>
                  </div>

                  {/* Mô tả giai đoạn */}
                  {(selectedStage.description || selectedStage.note) && (
                    <Alert
                      message="Mô tả giai đoạn"
                      description={selectedStage.description || selectedStage.note}
                      type="info"
                      showIcon
                      className="mb-5 rounded-xl border-blue-100 bg-blue-50/50"
                    />
                  )}

                  <Divider className="my-4" />

                  <div className="mb-3 flex items-center justify-between">
                    <Text className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Nhật ký hàng ngày của Farm Leader
                    </Text>
                    <Badge count={stageLogs.length} color="#16a34a" showZero className="ml-2" />
                  </div>

                  {stageLogs.length > 0 ? (
                    stageLogs.map((log, logIndex) => (
                      <DailyLogCard key={log.id || logIndex} log={log} index={logIndex} />
                    ))
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Chưa có nhật ký hàng ngày"
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

export default ProcessTab