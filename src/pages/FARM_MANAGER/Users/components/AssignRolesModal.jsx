import React from "react"
import { Form, Select, Button, Typography } from "antd"
import {
  SafetyCertificateOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons"
import CustomModal from "src/components/Modal/CustomModal"
import UserService from "src/services/UserService"
import { ROLE_CONFIG } from "./roleConfig"

const { Text } = Typography
const { Option } = Select

const ALL_ROLES = Object.entries(ROLE_CONFIG).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}))

const AssignRolesModal = ({ open, onClose, user, onSuccess }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (open && user) {
      form.setFieldsValue({ role: user.roles?.[0] || undefined })
    }
  }, [open, user, form])

  const handleSubmit = async values => {
    try {
      setLoading(true)
      await UserService.assignRoles(user.id, { roles: [values.role] })
      onClose()
      onSuccess?.()
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
          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
            <SafetyCertificateOutlined className="text-purple-600" />
          </div>
          <div>
            <div className="font-bold text-gray-800">Phân quyền người dùng</div>
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
          name="role"
          label={
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Vai trò được gán
            </span>
          }
          rules={[
            { required: true, message: "Phải chọn ít nhất một vai trò!" },
          ]}
        >
          <Select
            placeholder="Chọn vai trò"
            className="rounded-lg"
            optionLabelProp="label"
          >
            {ALL_ROLES.map(r => (
              <Option key={r.value} value={r.value} label={r.label}>
                <span className="ml-2 text-sm">{r.label}</span>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 mb-6 flex gap-2 items-start">
          <ExclamationCircleOutlined className="text-amber-500 mt-0.5 flex-shrink-0" />
          <Text className="text-xs text-amber-700">
            Thay đổi vai trò sẽ <strong>thay thế hoàn toàn</strong> danh sách
            hiện tại. Mọi phiên đăng nhập của tài khoản này sẽ bị ảnh hưởng.
          </Text>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button onClick={onClose} className="h-10 px-6 rounded-xl">
            Hủy
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="h-10 px-6 rounded-xl bg-purple-600 border-0 font-bold"
          >
            Lưu phân quyền
          </Button>
        </div>
      </Form>
    </CustomModal>
  )
}

export default AssignRolesModal
