/**
 * TaskFormModal — Tạo mới / Chỉnh sửa công việc
 * Triggered by: "Thêm mới" (create) | "Sửa" (update)
 *
 * NOTE: Uses MOCK TaskService — real API will be integrated later.
 *
 * Notification messages:
 *   MSG-TSK-01: "Thêm mới công việc thành công."
 *   MSG-TSK-05: "Vui lòng nhập đầy đủ các trường thông tin bắt buộc."
 *   MSG-TSK-06: "Mã công việc đã tồn tại trong hệ thống."
 *   MSG-TSK-09: "Cập nhật thông tin công việc thành công."
 */
import {
  BarcodeOutlined,
  CheckSquareOutlined,
  EditOutlined,
  FileTextOutlined,
  PlusOutlined,
  TagOutlined,
} from '@ant-design/icons'
import {
  Button,
  Col,
  Form,
  Input,
  message,
  Row,
  Select,
} from 'antd'
import React from 'react'
import CustomModal from 'src/components/Modal/CustomModal'
import TaskService from 'src/services/taskService'

// Danh sách đối tượng (Mock data)
const TARGET_OPTIONS = [
  { value: 'Lô đất A', label: 'Lô đất A' },
  { value: 'Lô đất B', label: 'Lô đất B' },
  { value: 'Cây lúa', label: 'Cây lúa' },
  { value: 'Cây ngô', label: 'Cây ngô' },
]

const TaskFormModal = ({ open, editingItem, onClose, onSuccess }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = React.useState(false)
  const isEdit = !!editingItem

  // Điền dữ liệu khi mở modal edit
  React.useEffect(() => {
    if (open) {
      if (isEdit) {
        form.setFieldsValue({
          name:          editingItem.name || '',
          targetObjects: editingItem.targetObjects || [],
          description:   editingItem.description || '',
        })
      } else {
        form.resetFields()
      }
    }
  }, [open, editingItem, isEdit, form])

  const handleSubmit = async (values) => {
    try {
      setLoading(true)

      const body = {
        name:          values.name?.trim(),
        targetObjects: values.targetObjects || [],
        description:   values.description?.trim() || null,
      }

      let res
      if (isEdit) {
        res = await TaskService.update(editingItem.id, body)
      } else {
        res = await TaskService.create(body)
      }

      if (res?.success === false) {
        message.error(res.message || 'Có lỗi xảy ra khi lưu công việc.')
        return
      }

      message.success(
        isEdit
          ? 'Cập nhật thông tin công việc thành công.'
          : 'Thêm mới công việc thành công.',
      )
      onClose()
      onSuccess?.()
    } catch (err) {
      message.error('Vui lòng nhập đầy đủ các trường thông tin bắt buộc.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <CustomModal
      open={open}
      onCancel={onClose}
      title={
        <div className="flex items-center gap-2 py-1">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50">
            {isEdit
              ? <EditOutlined className="text-blue-600" />
              : <PlusOutlined className="text-blue-600" />}
          </div>
          <span className="font-bold">
            {isEdit ? 'Chỉnh sửa công việc' : 'Thêm mới công việc'}
          </span>
        </div>
      }
      footer={null}
      width={700}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
      >
        <Row gutter={16}>
          {/* Đối tượng */}
          <Col xs={24} md={12}>
            <Form.Item
              name="targetObjects"
              label={
                <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                  <TagOutlined className="mr-1" />
                  Đối tượng
                </span>
              }
            >
              <Select
                mode="multiple"
                allowClear
                placeholder="Chọn đối tượng..."
                className="rounded-lg"
                options={TARGET_OPTIONS}
              />
            </Form.Item>
          </Col>

          {/* Tên công việc */}
          <Col xs={24} md={12}>
            <Form.Item
              name="name"
              label={
                <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Tên công việc <span className="text-red-500">*</span>
                </span>
              }
              rules={[
                { required: true, message: 'Vui lòng nhập tên công việc.' },
                { max: 100, message: 'Tên công việc tối đa 100 ký tự.' },
              ]}
            >
              <Input
                prefix={<CheckSquareOutlined className="text-gray-300" />}
                placeholder="VD: Tưới nước buổi sáng"
                className="h-10 rounded-lg"
              />
            </Form.Item>
          </Col>

          {/* Mô tả kỹ thuật */}
          <Col xs={24}>
            <Form.Item
              name="description"
              label={
                <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                  <FileTextOutlined className="mr-1" />
                  Mô tả kỹ thuật
                </span>
              }
            >
              <Input.TextArea
                rows={4}
                placeholder="Nhập mô tả chi tiết, quy trình thực hiện, yêu cầu kỹ thuật..."
                className="rounded-lg"
                maxLength={1000}
                showCount
              />
            </Form.Item>
          </Col>
        </Row>

        {/* Footer actions */}
        <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
          <Button
            onClick={onClose}
            className="h-10 px-6 rounded-xl"
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            icon={isEdit ? <EditOutlined /> : <PlusOutlined />}
            className="h-10 px-6 font-bold bg-blue-600 border-0 shadow-lg rounded-xl shadow-blue-100"
          >
            {isEdit ? 'Lưu thay đổi' : 'Thêm mới'}
          </Button>
        </div>
      </Form>
    </CustomModal>
  )
}

export default TaskFormModal
