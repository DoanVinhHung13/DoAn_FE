import { BookOutlined, CheckCircleOutlined, SaveOutlined, EditOutlined, LockOutlined } from '@ant-design/icons'
import { Alert, Avatar, Button, Card, Col, Form, Image, Input, List, Row, Table, Tag, Typography, message } from 'antd'
import { useEffect, useState } from 'react'
import { formatDate } from 'src/utils/dateFormatters'

const { Text, Title, Paragraph } = Typography
const { TextArea } = Input

// ── Config ────────────────────────────────────────────────────────────────────
const stageStatusConfig = {
  PENDING: { color: 'default', label: 'Chưa bắt đầu' },
  IN_PROGRESS: { color: 'processing', label: 'Đang thực hiện' },
  COMPLETED: { color: 'success', label: 'Hoàn thành' },
}

const getStageCfg = (s) => stageStatusConfig[s] || stageStatusConfig.PENDING

// ── Mock Data ─────────────────────────────────────────────────────────────
const mockStageSummary = {
  materials: [
    { key: '1', name: 'Phân bón Đầu Trâu NPK', type: 'Hóa học', quantity: 45.0, unit: 'kg' },
    { key: '2', name: 'Thuốc trừ sâu Sinh học BT', type: 'Sinh học', quantity: 2.5, unit: 'lít' },
    { key: '3', name: 'Vôi bột nông nghiệp', type: 'Cải tạo đất', quantity: 120.0, unit: 'kg' },
  ],
  images: [
    { id: 1, url: 'https://images.unsplash.com/photo-1592982537447-6f2963e6efdb?auto=format&fit=crop&q=80&w=200&h=150', label: '18/10 - Tưới nước' },
    { id: 2, url: 'https://images.unsplash.com/photo-1628183226466-9e6773229b11?auto=format&fit=crop&q=80&w=200&h=150', label: '18/10 - Bón phân' },
    { id: 3, url: 'https://images.unsplash.com/photo-1498408040764-ab647585090c?auto=format&fit=crop&q=80&w=200&h=150', label: '20/10 - Kiểm tra đất' },
    { id: 4, url: 'https://images.unsplash.com/photo-1592982537447-6f2963e6efdb?auto=format&fit=crop&q=80&w=200&h=150', label: '22/10 - Sensor' },
  ],
  description: 'Giai đoạn phát triển nụ của lô VN-12345-LX01 diễn ra theo đúng tiến độ kế hoạch. Tổng lượng vật tư sử dụng nằm trong hạn mức cho phép. Hệ thống tưới tự động hoạt động ổn định 100%. Đã ghi nhận một vài dấu hiệu sâu đục thân nhẹ nhưng đã được xử lý triệt để bằng thuốc sinh học vào ngày 19/10. Cây trồng hiện đang trong trạng thái khỏe mạnh, chuẩn bị bước vào giai đoạn trổ bông.',
  approvedLogs: [
    { id: 101, date: '2023-10-18', task: 'Tưới nước', farmer: 'Nguyễn Văn A', notes: 'Đã tưới 100 lít nước', progress: 100 },
    { id: 102, date: '2023-10-18', task: 'Bón phân NPK', farmer: 'Trần Thị B', notes: 'Bón 45kg phân Đầu Trâu', progress: 100 },
    { id: 103, date: '2023-10-19', task: 'Phun thuốc trừ sâu', farmer: 'Nguyễn Văn A', notes: 'Phun 2.5 lít BT', progress: 100 },
  ]
}

// Item trong danh sách giai đoạn bên trái
const StageListItem = ({ stage, index, isActive, onClick }) => {
  const cfg = getStageCfg(stage.status)
  return (
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
          <Text strong style={{ color: isActive ? '#15803d' : '#1f2937', whiteSpace: 'normal', fontSize: 13 }}>
            {stage.stageName || stage.name || `Giai đoạn ${index + 1}`}
          </Text>
        }
        description={
          <div className="mt-1 flex flex-col ">
            <Tag color={cfg.color} style={{ margin: 0, fontSize: 10 }}>{cfg.label}</Tag>
          </div>
        }
      />
    </List.Item>
  )
}

const LogbookFinalizationTab = ({ stages, tasks }) => {
  const [selectedId, setSelectedId] = useState(null)
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)

  // Mặc định chọn giai đoạn đầu tiên khi load
  useEffect(() => {
    if (stages.length > 0 && !selectedId) {
      setSelectedId(stages[0].id)
    }
  }, [stages, selectedId])

  const selectedStage = stages.find((s) => s.id === selectedId)

  useEffect(() => {
    if (selectedStage) {
      // Dùng mock data thay vì fetch từ API
      form.setFieldsValue({
        supervisorDescription: mockStageSummary.description,
      })
    }
  }, [selectedStage, form])

  const handleSaveLogbook = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      // Giả lập gọi API chốt logbook giai đoạn
      await new Promise(resolve => setTimeout(resolve, 800))
      console.log('Finalizing logbook for stage:', selectedStage.id, values)
      message.success('Đã lưu lịch sử nhật ký chính thức cho giai đoạn này!')
    } catch (error) {
      console.error(error)
      message.error('Không thể lưu nhật ký chính thức.')
    } finally {
      setSaving(false)
    }
  }

  const columns = [
    { title: 'Tên vật tư', dataIndex: 'name', key: 'name', render: text => <Text strong>{text}</Text> },
    { title: 'Loại', dataIndex: 'type', key: 'type', render: text => <Text type="secondary">{text}</Text> },
    { title: 'Số lượng đã dùng', dataIndex: 'quantity', key: 'quantity', align: 'right', render: text => <Text strong>{text}</Text> },
    { title: 'Đơn vị', dataIndex: 'unit', key: 'unit', align: 'center' },
  ]

  return (
    <Card bordered={false} className="shadow-sm rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Row gutter={[24, 24]} className="min-h-[520px]">
        {/* Cột trái: Lộ trình sản xuất */}
        <Col xs={24} lg={8} xl={6} className="border-b lg:border-b-0 lg:border-r border-gray-100 lg:pr-6 pb-6 lg:pb-0">
          <p className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Cấu trúc Nhật ký
          </p>
          {stages.length === 0 ? (
            <Alert message="Chưa có giai đoạn nào." type="info" />
          ) : (
            <List
              dataSource={stages}
              split={false}
              renderItem={(stage, index) => (
                <StageListItem
                  key={stage.id}
                  stage={stage}
                  index={index}
                  isActive={selectedId === stage.id}
                  onClick={() => setSelectedId(stage.id)}
                />
              )}
            />
          )}
        </Col>

        {/* Cột phải: Chi tiết và Chốt Giai đoạn */}
        <Col xs={24} lg={16} xl={18}>
          {!selectedStage ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
              <BookOutlined className="text-4xl mb-3 opacity-50" />
              <p>Chọn một giai đoạn bên trái để xem và chốt nhật ký</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircleOutlined className="text-green-600 text-xl" />
                <Title level={5} className="!mb-0">
                  Biên tập Nhật ký: {selectedStage.stageName || selectedStage.name}
                </Title>
              </div>

              {/* Bảng tổng hợp vật tư */}
              <Card size="small" bordered className="rounded-xl shadow-sm border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold flex items-center gap-2"><BookOutlined className="text-gray-500"/> Bảng tổng hợp vật tư (Chế độ xem)</div>
                  <Tag icon={<LockOutlined />} color="default" className="rounded-full">ĐÃ KHÓA</Tag>
                </div>
                <Table
                  columns={columns}
                  dataSource={mockStageSummary.materials}
                  pagination={false}
                  size="small"
                  className="rounded-lg overflow-hidden border border-gray-100"
                />
              </Card>

              {/* Ảnh thực địa */}
              <Card size="small" bordered className="rounded-xl shadow-sm border-gray-200 mt-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold flex items-center gap-2"><BookOutlined className="text-gray-500"/> Ảnh thực địa giai đoạn (Chỉ đọc)</div>
                  <Tag icon={<LockOutlined />} color="default" className="rounded-full">ĐÃ KHÓA</Tag>
                </div>
                <Image.PreviewGroup>
                  <div className="flex flex-wrap gap-3">
                    {mockStageSummary.images.map(img => (
                      <div key={img.id} className="relative group rounded-lg overflow-hidden border border-gray-200">
                        <Image src={img.url} width={120} height={90} className="object-cover" />
                        <div className="absolute bottom-0 w-full bg-black bg-opacity-60 text-white text-[10px] px-1 py-0.5 text-center pointer-events-none truncate">
                          {img.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </Image.PreviewGroup>
              </Card>

              {/* Biên soạn mô tả */}
              <Card size="small" bordered className="rounded-xl shadow-sm border-green-600 mt-4 bg-green-50/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-green-700 flex items-center gap-2"><EditOutlined /> Biên soạn mô tả tổng kết</div>
                  <Tag color="blue" className="rounded-full border-blue-200 bg-blue-50 text-blue-600">Đang chỉnh sửa từ bản nháp của Leader</Tag>
                </div>
                <Form form={form} layout="vertical">
                  <Form.Item
                    name="supervisorDescription"
                    label={<Text className="text-gray-500 text-xs">Mô tả văn phong chuẩn (Hiển thị trong báo cáo khách hàng)</Text>}
                    rules={[{ required: true, message: 'Vui lòng nhập mô tả tổng kết' }]}
                    className="mb-2"
                  >
                    <TextArea
                      rows={5}
                      placeholder="Nhập mô tả tổng kết giai đoạn..."
                      className="rounded-lg shadow-inner"
                    />
                  </Form.Item>
                  <div className="flex justify-end gap-3 mt-4">
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={handleSaveLogbook}
                      loading={saving}
                      className="bg-green-600 rounded-lg px-6 h-9 font-semibold"
                    >
                      Lưu vào lịch sử
                    </Button>
                  </div>
                </Form>
              </Card>

              {/* Lịch sử nhật ký đã duyệt */}
              <div className="mt-8">
                <div className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-4">Các nhật ký đã được Supervisor duyệt</div>
                <List
                  dataSource={mockStageSummary.approvedLogs}
                  renderItem={(log) => (
                    <List.Item className="mb-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                      <List.Item.Meta
                        title={
                          <div className="flex items-center justify-between">
                            <Text strong className="text-gray-800">
                              {log.date ? formatDate(log.date) : 'Không rõ ngày'}
                            </Text>
                            <Tag color="blue">{log.farmer || 'Người nông dân'}</Tag>
                          </div>
                        }
                        description={
                          <div className="mt-2 text-gray-600">
                            {log.task && (
                              <p className="mb-1 text-xs">
                                <strong>Công việc con:</strong> {log.task}
                              </p>
                            )}
                            <Paragraph ellipsis={{ rows: 3, expandable: true, symbol: 'Xem thêm' }}>
                              {log.notes || 'Không có ghi chú'}
                            </Paragraph>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              </div>

            </div>
          )}
        </Col>
      </Row>
    </Card>
  )
}

export default LogbookFinalizationTab
