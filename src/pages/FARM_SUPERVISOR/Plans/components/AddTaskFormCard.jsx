import {
  PlusOutlined,
} from "@ant-design/icons"
import {
  AutoComplete,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Typography,
  message,
} from "antd"
import { useState } from "react"
import {
  CULTIVATION_TASK_TYPE_OPTIONS,
  CULTIVATION_TASK_TYPES,
  getTaskSchedulingErrorMessage,
  toTaskApiDateTime,
} from "src/constants/cultivationTask"
import { normalizeApiError } from "src/services/core/apiError"
import CultivationTaskService from "src/services/CultivationTaskService"
import { getLocalNow } from "src/utils/dateFormatters"

const { Text } = Typography

const isHarvestTask = task => task?.taskType === CULTIVATION_TASK_TYPES.HARVEST

const AddTaskFormCard = ({
  planId,
  selectedId,
  taskCatalogOptions,
  availableTaskCatalogOptions,
  leaders,
  farmers,
  loadingUsers,
  hasHarvestTask,
  onCancel,
  onSaveSuccess,
}) => {
  const [taskForm] = Form.useForm()
  const [savingTask, setSavingTask] = useState(false)

  const handleAddTask = async () => {
    if (hasHarvestTask) {
      message.warning(
        "Nhật ký đã có công việc thu hoạch, không thể thêm công việc khác.",
      )
      return
    }

    try {
      const values = await taskForm.validateFields()
      const taskList = values.tasks || []

      if (!taskList.length) {
        message.warning("Vui lòng thêm ít nhất một công việc")
        return
      }

      setSavingTask(true)

      const validTasks = taskList
        .filter(task => task.taskCatalogId || task.name?.trim())
        .map(task => {
          const catalog = taskCatalogOptions.find(
            o => o.value === task.taskCatalogId,
          )
          return {
            taskCatalogId: task.taskCatalogId || null,
            name: (task.name || catalog?.label || "").trim(),
            description:
              (task.description || catalog?.description || "").trim() || null,
            leaderId: task.leaderId || null,
            farmerIds: Array.isArray(task.farmerIds)
              ? task.farmerIds.filter(Boolean)
              : [],
            taskType: catalog?.taskType || task.taskType || null,
            plannedStartDate: toTaskApiDateTime(task.plannedStartDate),
            plannedEndDate: toTaskApiDateTime(task.plannedEndDate),
            activityType:
              catalog?.activityType ||
              (task.taskType === CULTIVATION_TASK_TYPES.HARVEST
                ? "HARVESTING"
                : "OTHER"),
          }
        })
        .filter(task => task.name)

      if (!validTasks.length) {
        message.warning("Chọn công việc từ danh mục hoặc nhập tên mới")
        setSavingTask(false)
        return
      }

      if (validTasks.some(task => !task.taskType)) {
        message.warning("Vui lòng chọn loại công việc cho công việc tự do.")
        return
      }

      if (
        validTasks.some(
          task =>
            !task.plannedStartDate ||
            !task.plannedEndDate ||
            task.plannedStartDate >= task.plannedEndDate,
        )
      ) {
        message.warning(
          "Ngày bắt đầu dự kiến phải trước ngày kết thúc dự kiến.",
        )
        return
      }

      const harvestFlags = validTasks.map(isHarvestTask)
      const firstHarvestIndex = harvestFlags.findIndex(Boolean)
      if (
        firstHarvestIndex >= 0 &&
        harvestFlags.slice(firstHarvestIndex + 1).some(flag => !flag)
      ) {
        message.warning("Công việc thu hoạch phải ở cuối cùng.")
        setSavingTask(false)
        return
      }

      await CultivationTaskService.createBulk(
        {
          cultivationLogbookId: planId,
          cultivationStageId: selectedId,
          tasks: validTasks,
        },
        { errorHandling: "component" },
      )

      taskForm.resetFields()
      onSaveSuccess()
    } catch (error) {
      if (!error?.errorFields) {
        const normalizedError = normalizeApiError(error)
        message.error(getTaskSchedulingErrorMessage(normalizedError))
      }
    } finally {
      setSavingTask(false)
    }
  }

  return (
    <Card
      size="small"
      className="mt-3 border border-gray-200 rounded-xl bg-gray-50"
      title={
        <Text strong style={{ fontSize: 13 }}>
          Công việc mới
        </Text>
      }
    >
      <Form
        form={taskForm}
        layout="vertical"
        initialValues={{
          tasks: [
            {
              taskCatalogId: null,
              taskType: null,
              name: "",
              description: "",
              plannedStartDate: getLocalNow().startOf("day"),
              plannedEndDate: getLocalNow()
                .startOf("day")
                .add(1, "day"),
            },
          ],
        }}
      >
        <Form.List name="tasks">
          {(fields, { add, remove }) => (
            <>
              {fields.map(({ key, name, ...restField }) => (
                <Card
                  key={key}
                  size="small"
                  className="mb-3 border border-gray-200 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Text strong>Công việc {name + 1}</Text>
                    {fields.length > 1 && (
                      <Button
                        type="text"
                        danger
                        onClick={() => remove(name)}
                      >
                        Xóa
                      </Button>
                    )}
                  </div>
                  <Form.Item
                    {...restField}
                    name={[name, "taskCatalogId"]}
                    hidden
                  >
                    <Input />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "name"]}
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập tên công việc.",
                      },
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
                              new Error(
                                "Tên công việc không được vượt quá 100 ký tự.",
                              ),
                            )
                          if (
                            trimmed !==
                            trimmed.replace(/\s+/g, " ")
                          )
                            return Promise.reject(
                              new Error(
                                "Tên công việc không được chứa nhiều khoảng trắng liên tiếp.",
                              ),
                            )
                          return Promise.resolve()
                        },
                      },
                    ]}
                    className="!mb-3"
                  >
                    <AutoComplete
                      options={availableTaskCatalogOptions.map(
                        catalog => ({
                          value: catalog.label,
                          label: catalog.label,
                          catalog,
                        }),
                      )}
                      filterOption={(inputValue, option) =>
                        option?.value
                          ?.toLowerCase()
                          .includes(inputValue.toLowerCase())
                      }
                      placeholder="Nhập tên công việc (gợi ý từ danh mục)..."
                      onChange={value => {
                        const catalog = taskCatalogOptions.find(
                          item => item.label === value,
                        )
                        const list =
                          taskForm.getFieldValue("tasks") || []
                        list[name] = {
                          ...list[name],
                          taskCatalogId: catalog?.value || null,
                          taskType: catalog?.taskType || null,
                        }
                        taskForm.setFieldsValue({
                          tasks: [...list],
                        })
                      }}
                      onSelect={(_, option) => {
                        const catalog = option?.catalog
                        if (!catalog) return
                        const list =
                          taskForm.getFieldValue("tasks") || []
                        list[name] = {
                          ...list[name],
                          name: catalog.label,
                          taskCatalogId: catalog.value,
                          taskType: catalog.taskType,
                          description: catalog.description || "",
                        }
                        taskForm.setFieldsValue({
                          tasks: [...list],
                        })
                      }}
                    />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "description"]}
                    rules={[
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.resolve()
                          const trimmed = value.trim()
                          if (!trimmed) return Promise.resolve()
                          if (trimmed.length > 500)
                            return Promise.reject(
                              new Error(
                                "Mô tả công việc không được vượt quá 500 ký tự.",
                              ),
                            )
                          if (
                            trimmed !==
                            trimmed.replace(/\s+/g, " ")
                          )
                            return Promise.reject(
                              new Error(
                                "Mô tả công việc không được chứa nhiều khoảng trắng liên tiếp.",
                              ),
                            )
                          return Promise.resolve()
                        },
                      },
                    ]}
                    className="!mb-3"
                  >
                    <Input.TextArea
                      rows={2}
                      placeholder="Mô tả chi tiết, liều lượng..."
                    />
                  </Form.Item>
                  <Row gutter={12}>
                    <Col xs={24} md={8}>
                      <Form.Item
                        noStyle
                        shouldUpdate={(prev, next) =>
                          prev.tasks?.[name]?.taskCatalogId !==
                          next.tasks?.[name]?.taskCatalogId
                        }
                      >
                        {() => (
                          <Form.Item
                            {...restField}
                            name={[name, "taskType"]}
                            label="Loại công việc"
                            rules={[
                              {
                                required: true,
                                message:
                                  "Vui lòng chọn loại công việc.",
                              },
                            ]}
                          >
                            <Select
                              options={
                                CULTIVATION_TASK_TYPE_OPTIONS
                              }
                              placeholder="Chọn loại công việc"
                              disabled={Boolean(
                                taskForm.getFieldValue([
                                  "tasks",
                                  name,
                                  "taskCatalogId",
                                ]),
                              )}
                            />
                          </Form.Item>
                        )}
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        {...restField}
                        name={[name, "plannedStartDate"]}
                        label="Bắt đầu dự kiến"
                        rules={[
                          {
                            required: true,
                            message:
                              "Vui lòng chọn ngày bắt đầu dự kiến.",
                          },
                          ({ getFieldValue }) => ({
                            validator: (_, value) => {
                              const end = getFieldValue([
                                "tasks",
                                name,
                                "plannedEndDate",
                              ])
                              if (
                                !value ||
                                !end ||
                                value.isBefore(end)
                              )
                                return Promise.resolve()
                              return Promise.reject(
                                new Error(
                                  "Ngày bắt đầu phải trước ngày kết thúc.",
                                ),
                              )
                            },
                          }),
                        ]}
                      >
                        <DatePicker
                          showTime
                          format="DD/MM/YYYY HH:mm"
                          className="w-full"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        {...restField}
                        name={[name, "plannedEndDate"]}
                        label="Kết thúc dự kiến"
                        rules={[
                          {
                            required: true,
                            message:
                              "Vui lòng chọn ngày kết thúc dự kiến.",
                          },
                          ({ getFieldValue }) => ({
                            validator: (_, value) => {
                              const start = getFieldValue([
                                "tasks",
                                name,
                                "plannedStartDate",
                              ])
                              if (
                                !value ||
                                !start ||
                                start.isBefore(value)
                              )
                                return Promise.resolve()
                              return Promise.reject(
                                new Error(
                                  "Ngày kết thúc phải sau ngày bắt đầu.",
                                ),
                              )
                            },
                          }),
                        ]}
                      >
                        <DatePicker
                          showTime
                          format="DD/MM/YYYY HH:mm"
                          className="w-full"
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                  <Row gutter={12}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        {...restField}
                        name={[name, "leaderId"]}
                        label="Người phụ trách"
                        className="!mb-3"
                      >
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
                      <Form.Item
                        {...restField}
                        name={[name, "farmerIds"]}
                        label="Người hỗ trợ"
                        className="!mb-3"
                      >
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
                </Card>
              ))}
              <Button
                type="dashed"
                onClick={() =>
                  add({
                    taskCatalogId: null,
                    taskType: null,
                    name: "",
                    description: "",
                    plannedStartDate:
                      getLocalNow().startOf("day"),
                    plannedEndDate: getLocalNow()
                      .startOf("day")
                      .add(1, "day"),
                    leaderId: null,
                    farmerIds: [],
                  })
                }
                block
                icon={<PlusOutlined />}
                className="mb-3 text-green-600 border-green-300 hover:border-green-500"
              >
                Thêm công việc khác
              </Button>
            </>
          )}
        </Form.List>
        <Row gutter={12}>
          <Col span={24}>
            <div className="flex justify-end gap-2">
              <Button
                onClick={onCancel}
                className="rounded-lg"
              >
                Hủy
              </Button>
              <Button
                type="primary"
                onClick={handleAddTask}
                loading={savingTask}
                className="bg-green-600 rounded-lg hover:!bg-green-700"
              >
                Lưu {taskForm.getFieldValue("tasks")?.length || 1} công việc
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    </Card>
  )
}

export default AddTaskFormCard
