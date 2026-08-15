import { ArrowLeftOutlined, CheckSquareOutlined, EditOutlined } from '@ant-design/icons'
import { Button, Card, Form, Skeleton } from 'antd'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TitleCustom from 'src/components/TitleCustom'
import ROUTER from 'src/router/ROUTER'
import TaskCatalogService from 'src/services/TaskCatalogService'
import { applyApiFieldErrors, normalizeApiError } from 'src/services/core/apiError'
import TaskFormFields from './TaskFormFields'
import useFormDraft from 'src/hooks/useFormDraft'
import { getFormDraftKey } from 'src/utils/formDraftKeys'

const unwrap = (res) => res?.data?.data ?? res?.data ?? res
const normalizeTaskType = (data) => String(data?.taskType || '').toUpperCase() === 'HARVEST'
  || String(data?.activityType || '').toUpperCase() === 'HARVESTING' ? 'HARVEST' : 'NORMAL'

const TaskEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const storageKey = getFormDraftKey('task-catalog', 'edit', id)
  const { saveDraft, clearDraft, restoreDraft } = useFormDraft({ form, storageKey })

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setInitialLoading(true)
        const res = await TaskCatalogService.getTaskCatalogById(id)
        const data = unwrap(res) || {}

        const serverValues = {
          cropCatalogId: data.cropCatalogId || '__ALL__',
          cropId: data.cropId || '__ALL__',
          taskType: normalizeTaskType(data),
          activityType: data.activityType || (normalizeTaskType(data) === 'HARVEST' ? 'HARVESTING' : 'OTHER'),
          name: data.name,
          description: data.description,
        }
        const draft = restoreDraft()
        form.setFieldsValue({ ...serverValues, ...(draft?.data || {}) })
      } catch {
        navigate(ROUTER.FM_TASK_CATALOGS)
      } finally {
        setInitialLoading(false)
      }
    }
    if (id) fetchDetail()
  }, [id, form, navigate, restoreDraft])

  const handleSubmit = async (values) => {
    try {
      setLoading(true)

      const body = {
        cropCatalogId: values.cropCatalogId === '__ALL__' ? null : values.cropCatalogId,
        cropId: values.cropId === '__ALL__' ? null : values.cropId,
        name: values.name?.trim(),
        description: values.description?.trim() || null,
        taskType: values.taskType || 'NORMAL',
        activityType: values.taskType === 'HARVEST' ? 'HARVESTING' : (values.activityType || 'OTHER'),
      }

      await TaskCatalogService.updateTaskCatalog(id, body, {
        errorHandling: 'form',
        fieldErrorMapping: { CropCatalogId: 'cropCatalogId', CropId: 'cropId', Name: 'name', Description: 'description', TaskType: 'taskType', ActivityType: 'activityType' },
      })

      clearDraft()
      navigate(ROUTER.FM_TASK_CATALOGS)
    } catch (error) {
      applyApiFieldErrors(form, normalizeApiError(error), {
        CropCatalogId: 'cropCatalogId', CropId: 'cropId', Name: 'name', Description: 'description', TaskType: 'taskType', ActivityType: 'activityType',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTER.FM_TASK_CATALOGS)}>
            Quay lại
          </Button>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <CheckSquareOutlined className="text-blue-600" />
            Chỉnh sửa công việc
          </TitleCustom>
        </div>
      </div>

      <Card bordered={false} className="shadow-sm rounded-2xl" bodyStyle={{ padding: '24px' }}>
        {initialLoading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <Form form={form} layout="vertical" onFinish={handleSubmit} onValuesChange={(_, allValues) => saveDraft(allValues)}>
            <TaskFormFields form={form} isEdit={true} />

            <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
              <Button onClick={() => navigate(ROUTER.FM_TASK_CATALOGS)} className="h-10 px-6 rounded-xl" disabled={loading}>
                Hủy
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<EditOutlined />}
                className="h-10 px-6 font-bold bg-blue-600 border-0 shadow-lg rounded-xl shadow-blue-100"
              >
                Lưu thay đổi
              </Button>
            </div>
          </Form>
        )}
      </Card>
    </div>
  )
}

export default TaskEdit
