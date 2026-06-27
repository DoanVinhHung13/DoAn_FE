import { ArrowLeftOutlined, CheckSquareOutlined, EditOutlined } from '@ant-design/icons'
import { Button, Card, Form, message, Skeleton } from 'antd'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TitleCustom from 'src/components/TitleCustom'
import ROUTER from 'src/router/ROUTER'
import TaskService from 'src/services/taskService'
import TaskFormFields from './TaskFormFields'

const TaskEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
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

  const handleSubmit = async (values) => {
    try {
      setLoading(true)
      const body = {
        name: values.name?.trim(),
        targetObjects: values.targetObjects || [],
        description: values.description?.trim() || null,
      }

      const res = await TaskService.update(id, body)

      if (res?.success === false) {
        message.error(res.message || 'Có lỗi xảy ra khi cập nhật công việc.')
        return
      }

      message.success('Cập nhật thông tin công việc thành công.')
      navigate(ROUTER.FM_TASKS)
    } catch (err) {
      message.error('Vui lòng nhập đầy đủ các trường thông tin bắt buộc.')
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
            <CheckSquareOutlined className="text-blue-600" />
            Chỉnh sửa công việc
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
            onFinish={handleSubmit}
          >
            <TaskFormFields isEdit={true} />

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
