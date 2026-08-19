import {
  EditOutlined,
} from "@ant-design/icons"
import {
  Col,
  DatePicker,
  Form,
  Input,
  Modal,
  Row,
  Select,
} from "antd"
import { useEffect, useState } from "react"
import { toTaskApiDateTime } from "src/constants/cultivationTask"
import CultivationTaskService from "src/services/CultivationTaskService"
import { parseDate } from "src/utils/dateFormatters"

const EditTaskModal = ({
  open,
  task,
  onCancel,
  onSaveSuccess,
  leaders,
  farmers,
  loadingUsers,
}) => {
  const [editTaskForm] = Form.useForm()
  const [savingEdit, setSavingEdit] = useState(false)

  useEffect(() => {
    if (open && task) {
      editTaskForm.setFieldsValue({
        name: task.name || task.taskName,
        description: task.description || "",
        plannedStartDate: parseDate(task.plannedStartDate),
        plannedEndDate: parseDate(task.plannedEndDate),
        leaderId: task.assignedLeaderId || null,
        farmerIds:
          task.assignments
            ?.filter(f => !f.isLeader)
            .map(f => f.userId || f.id) || [],
      })
    } else {
      editTaskForm.resetFields()
    }
  }, [open, task, editTaskForm])

  const handleSaveEdit = async () => {
    try {
      const values = await editTaskForm.validateFields()
      setSavingEdit(true)
      await CultivationTaskService.update(task.id, {
        name: values.name,
        description: values.description,
        plannedStartDate: toTaskApiDateTime(values.plannedStartDate),
        plannedEndDate: toTaskApiDateTime(values.plannedEndDate),
        leaderId: values.leaderId || null,
        farmerIds: Array.isArray(values.farmerIds) ? values.farmerIds : [],
      })
      onSaveSuccess()
    } catch {
      // Axios interceptor handles error notification directly from backend response
    } finally {
      setSavingEdit(false)
    }
  }

  return (
    <Modal
      open={open}
      title={
        <div className="flex items-center gap-2 font-semibold text-orange-700">
          <EditOutlined />
          Sửa công việc
        </div>
      }
      onCancel={onCancel}
      onOk={handleSaveEdit}
      confirmLoading={savingEdit}
      okText="Lưu thay đổi"
      cancelText="Hủy"
      okButtonProps={{ className: "bg-orange-500 border-orange-500 hover:!bg-orange-600" }}
      destroyOnClose
    >
      <Form form={editTaskForm} layout="vertical" className="mt-4">
        <Form.Item
          name="name"
          label="Tên công việc"
          rules={[
            { required: true, message: "Vui lòng nhập tên công việc." },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve()
                const trimmed = value.trim()
                if (!trimmed)
                  return Promise.reject(
                    new Error(
                      "Tên công việc không được chỉ chứa khoảng trắng.",
                    ),
                  )
                if (trimmed.length > 100)
                  return Promise.reject(
                    new Error("Tên công việc không được vượt quá 100 ký tự."),
                  )
                if (trimmed !== trimmed.replace(/\s+/g, " "))
                  return Promise.reject(
                    new Error(
                      "Tên công việc không được chứa nhiều khoảng trắng liên tiếp.",
                    ),
                  )
                return Promise.resolve()
              },
            },
          ]}
        >
          <Input placeholder="VD: Bón phân đón đòng..." />
        </Form.Item>
        <Form.Item
          name="description"
          label="Mô tả chi tiết"
          rules={[
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve()
                const trimmed = value.trim()
                if (!trimmed) return Promise.resolve()
                if (trimmed.length > 500)
                  return Promise.reject(
                    new Error("Mô tả không được vượt quá 500 ký tự."),
                  )
                if (trimmed !== trimmed.replace(/\s+/g, " "))
                  return Promise.reject(
                    new Error(
                      "Mô tả không được chứa nhiều khoảng trắng liên tiếp.",
                    ),
                  )
                return Promise.resolve()
              },
            },
          ]}
        >
          <Input.TextArea
            rows={3}
            placeholder="Mô tả công việc, liều lượng..."
          />
        </Form.Item>
        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item
              name="plannedStartDate"
              label="Bắt đầu dự kiến"
              dependencies={["plannedEndDate"]}
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn ngày bắt đầu dự kiến.",
                },
                ({ getFieldValue }) => ({
                  validator: (_, value) => {
                    const end = getFieldValue("plannedEndDate")
                    if (
                      !value ||
                      !end ||
                      value.isBefore(end, "day") ||
                      value.isSame(end, "day")
                    )
                      return Promise.resolve()
                    return Promise.reject(
                      new Error(
                        "Ngày bắt đầu phải trước hoặc cùng ngày với ngày kết thúc.",
                      ),
                    )
                  },
                }),
              ]}
            >
              <DatePicker
                format="DD/MM/YYYY"
                className="w-full"
                placeholder="Chọn ngày bắt đầu"
                onChange={() => {
                  editTaskForm
                    .validateFields(["plannedStartDate", "plannedEndDate"])
                    .catch(() => {})
                }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item
              name="plannedEndDate"
              label="Kết thúc dự kiến"
              dependencies={["plannedStartDate"]}
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn ngày kết thúc dự kiến.",
                },
                ({ getFieldValue }) => ({
                  validator: (_, value) => {
                    const start = getFieldValue("plannedStartDate")
                    if (
                      !value ||
                      !start ||
                      start.isBefore(value, "day") ||
                      start.isSame(value, "day")
                    )
                      return Promise.resolve()
                    return Promise.reject(
                      new Error(
                        "Ngày kết thúc phải sau hoặc cùng ngày với ngày bắt đầu.",
                      ),
                    )
                  },
                }),
              ]}
            >
              <DatePicker
                format="DD/MM/YYYY"
                className="w-full"
                placeholder="Chọn ngày kết thúc"
                onChange={() => {
                  editTaskForm
                    .validateFields(["plannedStartDate", "plannedEndDate"])
                    .catch(() => {})
                }}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item name="leaderId" label="Người phụ trách">
              <Select
                allowClear
                showSearch
                options={leaders}
                placeholder="Chọn người phụ trách..."
                loading={loadingUsers}
                filterOption={(input, option) =>
                  String(option?.label || "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item name="farmerIds" label="Người hỗ trợ">
              <Select
                mode="multiple"
                allowClear
                showSearch
                options={farmers}
                placeholder="Chọn người hỗ trợ..."
                loading={loadingUsers}
                filterOption={(input, option) =>
                  String(option?.label || "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  )
}

export default EditTaskModal
