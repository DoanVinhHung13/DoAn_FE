import React from "react"
import { Form, Input, Button } from "antd"
import { KeyOutlined, LockOutlined } from "@ant-design/icons"
import CustomModal from "src/components/Modal/CustomModal"
import UserService from "src/services/UserService"

const ResetPasswordModal = ({ open, onClose, user }) => {
  const [form] = Form.useForm()

  React.useEffect(() => {
    if (open) form.resetFields()
  }, [open, form])

  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async values => {
    try {
      setLoading(true)
      await UserService.changeUserPassword(user.id, {
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmNewPassword,
      })
      onClose()
    } catch {
      // Axios handles error notification
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
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
            <KeyOutlined className="text-red-500" />
          </div>
          <div>
            <div className="font-bold text-gray-800">Đặt lại mật khẩu</div>
            <div className="text-[11px] text-gray-400 font-normal">
              {user?.fullName}
            </div>
          </div>
        </div>
      }
      footer={null}
      width={440}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
      >
        <Form.Item
          name="newPassword"
          label={
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Mật khẩu mới
            </span>
          }
          rules={[
            { required: true, message: "Nhập mật khẩu mới!" },
            { min: 6, message: "Tối thiểu 6 ký tự!" },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-300" />}
            placeholder="••••••••"
            className="h-10 rounded-lg"
          />
        </Form.Item>
        <Form.Item
          name="confirmNewPassword"
          label={
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Xác nhận mật khẩu
            </span>
          }
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value)
                  return Promise.resolve()
                return Promise.reject(new Error("Mật khẩu không khớp!"))
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-300" />}
            placeholder="••••••••"
            className="h-10 rounded-lg"
          />
        </Form.Item>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-2">
          <Button onClick={onClose} className="h-10 px-6 rounded-xl">
            Hủy
          </Button>
          <Button
            danger
            htmlType="submit"
            loading={loading}
            className="h-10 px-6 rounded-xl font-bold"
          >
            Đặt lại mật khẩu
          </Button>
        </div>
      </Form>
    </CustomModal>
  )
}

export default ResetPasswordModal
