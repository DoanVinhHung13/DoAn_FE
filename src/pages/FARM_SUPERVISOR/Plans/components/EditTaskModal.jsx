import { EditOutlined } from "@ant-design/icons"
import { Col, DatePicker, Form, Input, Modal, Row, Select } from "antd"
import { useEffect, useState } from "react"
import {
  CULTIVATION_TASK_TYPE_OPTIONS,
  normalizeCultivationTaskType,
} from "src/constants/cultivationTask"
import CultivationTaskService from "src/services/CultivationTaskService"
import {
  formatDateForApi,
  getLocalNow,
  parseDate,
} from "src/utils/dateFormatters"
import { makeDescriptionValidator, makeNameValidator } from "src/utils/helpers"

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
        taskType: normalizeCultivationTaskType(task.taskType) || undefined,
        plannedStartDate: parseDate(task.plannedStartDate),
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
        taskType: values.taskType,
        plannedStartDate: formatDateForApi(values.plannedStartDate),
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
      okButtonProps={{
        className: "bg-orange-500 border-orange-500 hover:!bg-orange-600",
      }}
      destroyOnClose
    >
      <Form form={editTaskForm} layout="vertical" className="mt-4">
        <Form.Item
          name="name"
          label="Tên công việc"
          rules={[
            { required: true, message: "Vui lòng nhập tên công việc." },
            makeNameValidator({ label: "Tên công việc" }),
          ]}
        >
          <Input placeholder="VD: Bón phân đón đòng..." />
        </Form.Item>
        <Form.Item
          name="description"
          label="Mô tả chi tiết"
          rules={[
            { required: true, message: "Vui lòng nhập mô tả chi tiết." },
            makeDescriptionValidator({ maxLength: 500 }),
          ]}
        >
          <Input.TextArea
            rows={3}
            placeholder="Mô tả công việc, liều lượng..."
          />
        </Form.Item>
        <Form.Item
          name="taskType"
          label="Loại công việc"
          rules={[
            { required: true, message: "Vui lòng chọn loại công việc." },
          ]}
        >
          <Select
            options={CULTIVATION_TASK_TYPE_OPTIONS}
            placeholder="Chọn loại công việc"
            disabled={Boolean(task?.taskCatalogId)}
          />
        </Form.Item>
        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item
              name="plannedStartDate"
              label="Bắt đầu dự kiến"
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn ngày bắt đầu dự kiến.",
                },
              ]}
            >
              <DatePicker
                format="DD/MM/YYYY"
                className="w-full"
                placeholder="Chọn ngày bắt đầu"
                disabledDate={date =>
                  date && date.isBefore(getLocalNow().startOf("day"), "day")
                }
                onChange={() => {
                  editTaskForm
                    .validateFields(["plannedStartDate"])
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
