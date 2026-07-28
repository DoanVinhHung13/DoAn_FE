import { ArrowLeftOutlined, CheckSquareOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Card, Form, message } from 'antd'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TitleCustom from 'src/components/TitleCustom'
import ROUTER from 'src/router/ROUTER'
import TaskCatalogService from 'src/services/TaskCatalogService'
import TaskFormFields from './TaskFormFields'

const TaskCreate = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (values) => {
    try {
      setLoading(true)
      const body = {
        name: values.name?.trim(),
        description: values.description?.trim() || null,
      }

      const res = await TaskCatalogService.create(body)

      if (res?.success === false) return

      navigate(ROUTER.FM_TASKS)
    } catch (err) {
      // axios interceptor handles error notification
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTER.FM_TASKS)}>
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
        bodyStyle={{ padding: '24px' }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <TaskFormFields isEdit={false} />

          {/* Footer actions */}
          <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
            <Button
              onClick={() => navigate(ROUTER.FM_TASKS)}
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
