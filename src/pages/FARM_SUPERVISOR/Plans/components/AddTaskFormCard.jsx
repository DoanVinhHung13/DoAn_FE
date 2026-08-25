import {
  DeleteOutlined,
  PlusCircleOutlined,
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
  message,
} from "antd"
import { useState } from "react"
import {
  CULTIVATION_TASK_TYPE_OPTIONS,
  CULTIVATION_TASK_TYPES,
} from "src/constants/cultivationTask"
import CultivationTaskService from "src/services/CultivationTaskService"
import { formatDateForApi, getLocalNow } from "src/utils/dateFormatters"
import { makeDescriptionValidator, makeNameValidator } from "src/utils/helpers"

const AddTaskFormCard = ({
  planId,
  selectedId,
  taskCatalogOptions,
  availableTaskCatalogOptions,
  leaders,
  farmers,
  loadingUsers,
  onCancel,
  onSaveSuccess,
}) => {
  const [taskForm] = Form.useForm()
  const [savingTask, setSavingTask] = useState(false)

  const handleAddTask = async () => {
    try {
      const values = await taskForm.validateFields()
      const taskList = values.tasks || []

      if (!taskList.length) {
        message.warning("Vui lòng thêm ít nhất một công việc.")
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
            plannedStartDate: formatDateForApi(task.plannedStartDate),
            activityType:
              catalog?.activityType ||
              (task.taskType === CULTIVATION_TASK_TYPES.HARVEST
                ? "HARVESTING"
                : "OTHER"),
          }
        })
        .filter(task => task.name)

      if (!validTasks.length) {
        message.warning("Chọn công việc từ danh mục hoặc nhập tên mới.")
        setSavingTask(false)
        return
      }

      if (validTasks.some(task => !task.taskType)) {
        message.warning("Vui lòng chọn loại công việc cho công việc tự do.")
        setSavingTask(false)
        return
      }

      await CultivationTaskService.createBulk({
        cultivationLogbookId: planId,
        cultivationStageId: selectedId,
        tasks: validTasks,
      })

      taskForm.resetFields()
      onSaveSuccess()
    } catch {
      // Axios interceptor handles error notification directly from backend response
    } finally {
      setSavingTask(false)
    }
  }

  return (
    <Card
      size="small"
      className="mt-3 border border-green-200 rounded-2xl bg-white shadow-sm"
      styles={{
        header: {
          backgroundColor: "#f0fdf4",
          borderTopLeftRadius: "1rem",
          borderTopRightRadius: "1rem",
          borderBottom: "1px solid #dcfce7",
          padding: "10px 16px",
        },
        body: { padding: "16px" },
      }}
      title={
        <div className="flex items-center gap-2 text-green-800">
          <PlusCircleOutlined className="text-green-600 text-base" />
          <span className="font-bold text-sm">Thêm công việc mới</span>
        </div>
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
            },
          ],
        }}
      >
        <Form.List name="tasks">
          {(fields, { add, remove }) => (
            <div className="space-y-3">
              {fields.map(({ key, name, ...restField }) => (
                <Card
                  key={key}
                  size="small"
                  className="border border-gray-200 rounded-xl bg-gray-50/60 shadow-none hover:border-green-300 transition-colors"
                  styles={{ body: { padding: "12px 14px" } }}
                >
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                      Công việc #{name + 1}
                    </span>
                    {fields.length > 1 && (
                      <Button
                        type="text"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        className="rounded-lg text-xs hover:bg-red-50"
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

                  <Row gutter={[12, 0]}>
                    {/* Tên công việc */}
                    <Col xs={24} md={16}>
                      <Form.Item
                        {...restField}
                        name={[name, "name"]}
                        label="Tên công việc"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập tên công việc.",
                          },
                          makeNameValidator({ label: "Tên công việc" }),
                        ]}
                        className="!mb-2.5"
                      >
                        <AutoComplete
                          options={availableTaskCatalogOptions.map(catalog => ({
                            value: catalog.label,
                            label: catalog.label,
                            catalog,
                          }))}
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
                            const list = taskForm.getFieldValue("tasks") || []
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
                            const list = taskForm.getFieldValue("tasks") || []
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
                    </Col>

                    {/* Loại công việc */}
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
                                message: "Vui lòng chọn loại công việc.",
                              },
                            ]}
                            className="!mb-2.5"
                          >
                            <Select
                              options={CULTIVATION_TASK_TYPE_OPTIONS}
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
                  </Row>

                  {/* Mô tả chi tiết */}
                  <Form.Item
                    {...restField}
                    name={[name, "description"]}
                    label="Mô tả chi tiết"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng nhập mô tả chi tiết.",
                      },
                      makeDescriptionValidator({ maxLength: 500 }),
                    ]}
                    className="!mb-2.5"
                  >
                    <Input.TextArea
                      rows={2}
                      placeholder="Mô tả chi tiết, hướng dẫn, liều lượng vật tư..."
                    />
                  </Form.Item>

                  <Row gutter={[12, 0]}>
                    {/* Bắt đầu dự kiến - chỉ chọn ngày, click là chọn luôn */}
                    <Col xs={24} sm={12}>
                      <Form.Item
                        {...restField}
                        name={[name, "plannedStartDate"]}
                        label="Bắt đầu dự kiến"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng chọn ngày bắt đầu dự kiến.",
                          },
                        ]}
                        className="!mb-2.5"
                      >
                        <DatePicker
                          format="DD/MM/YYYY"
                          className="w-full"
                          placeholder="Chọn ngày bắt đầu"
                          disabledDate={date =>
                            date &&
                            date.isBefore(getLocalNow().startOf("day"), "day")
                          }
                          onChange={() => {
                            taskForm
                              .validateFields([
                                ["tasks", name, "plannedStartDate"],
                              ])
                              .catch(() => {})
                          }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={[12, 0]}>
                    {/* Người phụ trách */}
                    <Col xs={24} sm={12}>
                      <Form.Item
                        {...restField}
                        name={[name, "leaderId"]}
                        label="Người phụ trách (Leader)"
                        className="!mb-1"
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

                    {/* Người hỗ trợ */}
                    <Col xs={24} sm={12}>
                      <Form.Item
                        {...restField}
                        name={[name, "farmerIds"]}
                        label="Người hỗ trợ (Farmer)"
                        className="!mb-1"
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
                    plannedStartDate: getLocalNow().startOf("day"),
                    leaderId: null,
                    farmerIds: [],
                  })
                }
                block
                icon={<PlusOutlined />}
                className="text-green-600 border-green-300 rounded-xl hover:border-green-500 hover:text-green-700 font-medium h-9"
              >
                Thêm công việc khác
              </Button>
            </div>
          )}
        </Form.List>

        <div className="flex justify-end gap-2.5 pt-4 mt-2 border-t border-gray-100">
          <Button onClick={onCancel} className="rounded-xl px-4">
            Hủy
          </Button>
          <Button
            type="primary"
            onClick={handleAddTask}
            loading={savingTask}
            className="bg-green-600 border-green-600 rounded-xl hover:!bg-green-700 font-semibold px-5"
          >
            Lưu công việc
          </Button>
        </div>
      </Form>
    </Card>
  )
}

export default AddTaskFormCard
