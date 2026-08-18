import { ArrowLeftOutlined, PlusOutlined } from "@ant-design/icons"
import { Button, Card, Form } from "antd"
import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import TitleCustom from "src/components/TitleCustom"
import ROUTER from "src/router/ROUTER"
import TaskCatalogService from "src/services/TaskCatalogService"
import {
  applyApiFieldErrors,
  normalizeApiError,
} from "src/services/core/apiError"
import TaskFormFields from "./TaskFormFields"
import useFormDraft from "src/hooks/useFormDraft"
import { getFormDraftKey } from "src/utils/formDraftKeys"
import { CULTIVATION_TASK_TYPES } from "src/constants/cultivationTask"

const TaskCreate = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const storageKey = getFormDraftKey("task-catalog", "create")
  const { saveDraft, clearDraft, restoreDraft } = useFormDraft({
    form,
    storageKey,
  })

  React.useEffect(() => {
    const draft = restoreDraft()
    if (draft?.data) {
      form.setFieldsValue({
        cropCatalogId: "__ALL__",
        cropId: "__ALL__",
        taskType: CULTIVATION_TASK_TYPES.NON_MATERIAL,
        activityType: "OTHER",
        ...draft.data,
      })
    }
  }, [form, restoreDraft])

  const handleSubmit = async values => {
    try {
      setLoading(true)
      const body = {
        cropCatalogId:
          values.cropCatalogId === "__ALL__" ? null : values.cropCatalogId,
        cropId: values.cropId === "__ALL__" ? null : values.cropId,
        name: values.name?.trim(),
        description: values.description?.trim() || null,
        taskType: values.taskType,
        activityType:
          values.taskType === CULTIVATION_TASK_TYPES.HARVEST
            ? "HARVESTING"
            : values.activityType || "OTHER",
      }

      await TaskCatalogService.createTaskCatalog(body, {
        errorHandling: "form",
        fieldErrorMapping: {
          CropCatalogId: "cropCatalogId",
          CropId: "cropId",
          Name: "name",
          Description: "description",
          TaskType: "taskType",
          ActivityType: "activityType",
        },
      })

      clearDraft()
      navigate(ROUTER.FM_TASK_CATALOGS)
    } catch (error) {
      applyApiFieldErrors(form, normalizeApiError(error), {
        CropCatalogId: "cropCatalogId",
        CropId: "cropId",
        Name: "name",
        Description: "description",
        TaskType: "taskType",
        ActivityType: "activityType",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTER.FM_TASK_CATALOGS)}
          >
            Quay lại
          </Button>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            Thêm mới công việc
          </TitleCustom>
        </div>
      </div>

      {/* Main Content */}
      <Card
        bordered={false}
        className="shadow-sm rounded-2xl"
        bodyStyle={{ padding: "24px" }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            cropCatalogId: "__ALL__",
            cropId: "__ALL__",
            taskType: CULTIVATION_TASK_TYPES.NON_MATERIAL,
            activityType: "OTHER",
          }}
          onFinish={handleSubmit}
          onValuesChange={(_, allValues) => saveDraft(allValues)}
        >
          <TaskFormFields form={form} isEdit={false} />

          {/* Footer actions */}
          <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
            <Button
              onClick={() => navigate(ROUTER.FM_TASK_CATALOGS)}
              className="h-10 px-6 rounded-xl"
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<PlusOutlined />}
              className="h-10 px-6 font-bold bg-blue-600 border-0 shadow-lg rounded-xl shadow-blue-100"
            >
              Thêm mới
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  )
}

export default TaskCreate
