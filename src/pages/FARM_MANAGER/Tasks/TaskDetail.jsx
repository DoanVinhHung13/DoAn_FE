import { ArrowLeftOutlined, CheckSquareOutlined } from '@ant-design/icons'
import { Button, Card, Form, message, Skeleton } from 'antd'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TitleCustom from 'src/components/TitleCustom'
import ROUTER from 'src/router/ROUTER'
import TaskService from 'src/services/StandardTaskService'
import TaskFormFields from './TaskFormFields'

const TaskDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setInitialLoading(true)
        const res = await TaskService.getById(id)
        if (res?.success === false) {
          message.error('Không tìm thấy công việc')
          navigate(ROUTER.FM_TASKS)
          return
        }

        const data = res?.data || {}
        form.setFieldsValue({
          name: data.name || '',
          targetObjects: data.targetObjects || [],
          description: data.description || '',
        })
      } catch (err) {
        message.error('Lấy thông tin công việc thất bại')
        navigate(ROUTER.FM_TASKS)
      } finally {
        setInitialLoading(false)
      }
    }
    if (id) fetchDetail()
  }, [id, form, navigate])

  return (
    <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTER.FM_TASKS)}>
            Quay lại
          </Button>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <CheckSquareOutlined className="text-blue-600" />
            Chi tiết công việc
          </TitleCustom>
        </div>
      </div>

      {/* Main Content */}
      <Card
        bordered={false}
        className="shadow-sm rounded-2xl"
        bodyStyle={{ padding: '24px' }}
      >
        {initialLoading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <Form
            form={form}
            layout="vertical"
          >
            <TaskFormFields readOnly={true} />

            {/* Footer actions */}
            <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
              <Button
                onClick={() => navigate(ROUTER.FM_TASKS)}
                icon={<ArrowLeftOutlined />}
                className="h-10 px-6 font-semibold rounded-xl"
              >
                Quay lại
              </Button>
            </div>
          </Form>
        )}
      </Card>
    </div>
  )
}

export default TaskDetail
