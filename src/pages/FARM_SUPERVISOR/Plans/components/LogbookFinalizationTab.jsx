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

        {/* Cột phải: Form biên tập / chốt log */}
        <Col xs={24} lg={16} xl={18}>
          {!selectedTask ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
              <BookOutlined className="text-4xl mb-3 opacity-50" />
              <p>Chọn một công việc bên trái để biên tập nhật ký chính thức</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircleOutlined className="text-green-600 text-xl" />
                <Title level={5} className="!mb-0">
                  Biên tập Nhật ký: {selectedTask.name || selectedTask.taskName}
                </Title>
              </div>

              <Alert
                message="Chức năng chốt Nhật ký chính thức"
                description="Sau khi Farm Leader ghi nhận các bản ghi hàng ngày, Supervisor có thể tổng hợp và viết lại thành câu văn chuẩn mực cho Nhật ký chính thức (Logbook)."
                type="info"
                showIcon
                className="rounded-xl mb-4"
              />

              <Form form={form} layout="vertical">
                <Form.Item
                  name="dataSentence"
                  label={<Text strong>Mô tả dữ liệu (Data Sentence)</Text>}
                  rules={[{ required: true, message: 'Vui lòng nhập mô tả dữ liệu' }]}
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="VD: Đã bón 50kg phân NPK vào ngày 10/10/2023..."
                    className="rounded-lg"
                  />
                </Form.Item>

                <Form.Item
                  name="supervisorDescription"
                  label={<Text strong>Nhận xét / Đánh giá của Supervisor</Text>}
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="Nhận xét thêm về chất lượng công việc, tình trạng cây trồng..."
                    className="rounded-lg"
                  />
                </Form.Item>

                <div className="flex justify-end gap-3 mt-6">
                  <Button
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSaveLogbook}
                    loading={saving}
                    className="bg-green-600 rounded-lg px-6"
                  >
                    Lưu & Chốt Nhật ký
                  </Button>
                </div>
              </Form>
            </div>
          )}
        </Col>
      </Row>
    </Card>
  )
}

export default LogbookFinalizationTab
