import { BookOutlined, CheckCircleOutlined, SaveOutlined } from '@ant-design/icons'
import { Alert, Button, Card, Col, Form, Input, Row, Tree, Typography, message } from 'antd'
import { useState } from 'react'

const { Text, Title } = Typography

const LogbookFinalizationTab = ({ stages, tasks }) => {
  const [selectedTask, setSelectedTask] = useState(null)
  const [form] = Form.useForm()
  const [saving, setSaving] = useState(false)

  // Map data to Ant Design Tree format
  const treeData = stages.map((stage, index) => ({
    title: <Text strong>{stage.stageName || stage.name || `Giai đoạn ${index + 1}`}</Text>,
    key: stage.id,
    selectable: false, // User shouldn't select the stage directly for editing log
    children: (tasks[stage.id] || []).map((task) => ({
      title: task.name || task.taskName,
      key: task.id,
      isLeaf: true,
      taskData: task,
    })),
  }))

  const onSelect = (selectedKeys, info) => {
    if (info.node.isLeaf) {
      const task = info.node.taskData
      setSelectedTask(task)
      form.setFieldsValue({
        dataSentence: task.officialLog?.dataSentence || '',
        supervisorDescription: task.officialLog?.supervisorDescription || '',
      })
    } else {
      setSelectedTask(null)
    }
  }

  const handleSaveLogbook = async () => {
    try {
      const values = await form.validateFields()
      setSaving(true)
      // TODO: Replace with the actual API for Supervisor to compile/chốt logbook.
      // Example: await CultivationTaskService.compileLogbook(selectedTask.id, values)
      console.log('Finalizing logbook for task:', selectedTask.id, values)
      message.success('Đã lưu nhật ký chính thức cho công việc này!')
      // Giả lập reload data
    } catch (error) {
      console.error(error)
      message.error('Không thể lưu nhật ký chính thức.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card bordered={false} className="shadow-sm rounded-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Row gutter={[24, 24]} className="min-h-[520px]">
        {/* Cột trái: Cây thư mục Giai đoạn -> Công việc */}
        <Col xs={24} lg={8} xl={6} className="border-b lg:border-b-0 lg:border-r border-gray-100 lg:pr-6 pb-6 lg:pb-0">
          <p className="mb-3 text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Cấu trúc Nhật ký
          </p>
          {stages.length === 0 ? (
            <Alert message="Chưa có giai đoạn nào." type="info" />
          ) : (
            <Tree
              showIcon
              defaultExpandAll
              treeData={treeData}
              onSelect={onSelect}
              className="bg-transparent"
            />
          )}
        </Col>

        {/* Cột phải: Xem và Duyệt Summary */}
        <Col xs={24} lg={16} xl={18}>
          {!selectedTask ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
              <BookOutlined className="text-4xl mb-3 opacity-50" />
              <p>Chọn một công việc bên trái để xem và duyệt Bản Tóm tắt (Summary)</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircleOutlined className="text-green-600 text-xl" />
                <Title level={5} className="!mb-0">
                  Duyệt Bản Tóm tắt: {selectedTask.name || selectedTask.taskName}
                </Title>
              </div>

              <Alert
                message="Duyệt Bản Tóm Tắt Công Việc"
                description="Farm Leader đã tổng hợp lịch sử các bản ghi hàng ngày thành Bản tóm tắt này. Supervisor cần kiểm tra và Duyệt để đưa vào Nhật ký chính thức (Logbook)."
                type="info"
                showIcon
                className="rounded-xl mb-4"
              />

              {!selectedTask.summary ? (
                <Empty description="Farm Leader chưa tạo Bản Tóm tắt cho công việc này." className="py-10" />
              ) : (
                <div className="space-y-6">
                  {/* Nội dung Farm Leader nộp */}
                  <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                    <div className="mb-4">
                      <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mô tả tổng kết của Farm Leader</Text>
                      <p className="mt-2 text-gray-800 text-base">{selectedTask.summary.leaderDescription}</p>
                    </div>

                    {selectedTask.summary.aggregatedFertilizers?.length > 0 && (
                      <div className="mb-4">
                        <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phân bón đã sử dụng (Cộng dồn)</Text>
                        <div className="mt-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 border-b">
                              <tr>
                                <th className="px-4 py-2">Loại phân bón</th>
                                <th className="px-4 py-2">Tổng lượng</th>
                                <th className="px-4 py-2">Diện tích</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedTask.summary.aggregatedFertilizers.map((item, idx) => (
                                <tr key={idx} className="border-b last:border-0">
                                  <td className="px-4 py-2">{item.name}</td>
                                  <td className="px-4 py-2">{item.amount} {item.unit}</td>
                                  <td className="px-4 py-2">{item.area} {item.areaUnit}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {selectedTask.summary.aggregatedPesticides?.length > 0 && (
                      <div className="mb-4">
                        <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Thuốc BVTV đã sử dụng (Cộng dồn)</Text>
                        <div className="mt-2 bg-white rounded-lg border border-gray-200 overflow-hidden">
                          <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-600 border-b">
                              <tr>
                                <th className="px-4 py-2">Tên thuốc</th>
                                <th className="px-4 py-2">Tổng lượng</th>
                                <th className="px-4 py-2">Diện tích</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedTask.summary.aggregatedPesticides.map((item, idx) => (
                                <tr key={idx} className="border-b last:border-0">
                                  <td className="px-4 py-2">{item.name}</td>
                                  <td className="px-4 py-2">{item.amount} {item.unit}</td>
                                  <td className="px-4 py-2">{item.area} {item.areaUnit}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {selectedTask.summary.images?.length > 0 && (
                      <div className="mb-4">
                        <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Ảnh minh chứng</Text>
                        <div className="mt-2 flex gap-3 overflow-x-auto">
                          {selectedTask.summary.images.map((img, idx) => (
                            <img key={idx} src={img} alt="Minh chứng" className="h-24 w-24 object-cover rounded-lg border border-gray-200" />
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-4">
                      <Text className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Trạng thái</Text>
                      <div className="mt-2">
                        {selectedTask.summary.status === 'APPROVED' ? (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">Đã duyệt</span>
                        ) : (
                          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">Chờ duyệt</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Form Supervisor Biên tập */}
                  <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm">
                    <Title level={5} className="text-blue-700 mb-4">Biên soạn Nhật ký chính thức</Title>
                    <Form form={form} layout="vertical">
                      <Form.Item
                        name="supervisorDescription"
                        label="Mô tả Nhật ký chính thức (Văn phong chuẩn)"
                        rules={[{ required: true, message: 'Vui lòng nhập mô tả nhật ký' }]}
                      >
                        <Input.TextArea
                          rows={4}
                          placeholder="Dựa vào mô tả và số liệu của Farm Leader, biên tập lại thành câu văn hoàn chỉnh..."
                          className="rounded-lg"
                        />
                      </Form.Item>
                      
                      <div className="flex justify-end gap-3 mt-2">
                        {selectedTask.summary.status !== 'APPROVED' && (
                          <Button onClick={() => message.info('Đã từ chối và yêu cầu Farm Leader viết lại!')}>
                            Yêu cầu viết lại
                          </Button>
                        )}
                        <Button
                          type="primary"
                          icon={<SaveOutlined />}
                          onClick={handleSaveLogbook}
                          loading={saving}
                          className="bg-blue-600 rounded-lg px-6"
                        >
                          {selectedTask.summary.status === 'APPROVED' ? 'Cập nhật Nhật ký' : 'Duyệt & Lưu Nhật ký'}
                        </Button>
                      </div>
                    </Form>
                  </div>
                </div>
              )}
            </div>
          )}
        </Col>
      </Row>
    </Card>
  )
}

export default LogbookFinalizationTab
