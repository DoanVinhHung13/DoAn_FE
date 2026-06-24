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

// Loại công việc
const TASK_TYPE_OPTIONS = [
  { value: 'CULTIVATION', label: 'Canh tác' },
  { value: 'IRRIGATION', label: 'Tưới tiêu' },
  { value: 'FERTILIZATION', label: 'Bón phân' },
  { value: 'PEST_CONTROL', label: 'Phòng trừ sâu bệnh' },
  { value: 'HARVESTING', label: 'Thu hoạch' },
  { value: 'PROCESSING', label: 'Chế biến' },
  { value: 'INSPECTION', label: 'Kiểm tra, giám sát' },
  { value: 'MAINTENANCE', label: 'Bảo trì thiết bị' },
  { value: 'OTHER', label: 'Khác' },
]

// Mức độ ưu tiên
const PRIORITY_OPTIONS = [
  { value: 'CRITICAL', label: '🔴 Khẩn cấp' },
  { value: 'HIGH', label: '🟠 Cao' },
  { value: 'MEDIUM', label: '🟡 Trung bình' },
  { value: 'LOW', label: '🟢 Thấp' },
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
          code:        editingItem.code || '',
          name:        editingItem.name || '',
          taskType:    editingItem.taskType || undefined,
          priority:    editingItem.priority || undefined,
          description: editingItem.description || '',
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
        code:        values.code?.trim(),
        name:        values.name?.trim(),
        taskType:    values.taskType || null,
        priority:    values.priority || null,
        description: values.description?.trim() || null,
      }

      let res
      if (isEdit) {
        res = await TaskService.update(editingItem.id, body)
      } else {
        res = await TaskService.create(body)
      }

      if (res?.success === false) {
        const errMsg = (res.message || (res.errors && res.errors[0]) || '').toLowerCase()
        if (errMsg.includes('code') || errMsg.includes('mã')) {
          form.setFields([
            {
              name: 'code',
              errors: ['Mã công việc đã tồn tại trong hệ thống.'],
            },
          ])
        }
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
      const errMsg = (err?.response?.data?.message || err?.message || '').toLowerCase()
      if (errMsg.includes('code') || errMsg.includes('mã')) {
        form.setFields([
          {
            name: 'code',
            errors: ['Mã công việc đã tồn tại trong hệ thống.'],
          },
        ])
      } else {
        message.error('Vui lòng nhập đầy đủ các trường thông tin bắt buộc.')
      }
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
          {/* Mã công việc */}
          <Col xs={24} md={12}>
            <Form.Item
              name="code"
              label={
                <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Mã công việc <span className="text-red-500">*</span>
                </span>
              }
              rules={[
                { required: true, message: 'Vui lòng nhập mã công việc.' },
                { max: 30, message: 'Mã công việc tối đa 30 ký tự.' },
                {
                  pattern: /^[A-Za-z0-9_\-]+$/,
                  message: 'Mã chỉ chứa chữ cái, số, dấu gạch dưới hoặc gạch ngang.',
                },
              ]}
            >
              <Input
                prefix={<BarcodeOutlined className="text-gray-300" />}
                placeholder="VD: CV-TUOI-001"
                className="h-10 rounded-lg"
                disabled={isEdit}
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

          {/* Loại công việc */}
          <Col xs={24} md={12}>
            <Form.Item
              name="taskType"
              label={
                <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                  <TagOutlined className="mr-1" />
                  Loại công việc
                </span>
              }
            >
              <Select
                allowClear
                placeholder="Chọn loại công việc"
                className="h-10 rounded-lg"
                options={TASK_TYPE_OPTIONS}
              />
            </Form.Item>
          </Col>

          {/* Mức độ ưu tiên */}
          <Col xs={24} md={12}>
            <Form.Item
              name="priority"
              label={
                <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Mức độ ưu tiên
                </span>
              }
            >
              <Select
                allowClear
                placeholder="Chọn mức độ ưu tiên"
                className="h-10 rounded-lg"
                options={PRIORITY_OPTIONS}
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
