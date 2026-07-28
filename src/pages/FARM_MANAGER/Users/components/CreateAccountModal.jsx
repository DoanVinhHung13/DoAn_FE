import React from "react"
import { Button, Form, Input, Select } from "antd"
import { KeyOutlined, LockOutlined, MailOutlined, PhoneOutlined, UserOutlined } from "@ant-design/icons"
import CustomModal from "src/components/Modal/CustomModal"
import { ROLES } from "src/constants/roles"
import { SYSTEM_KEY } from "src/constants/systemKey"
import { useSystemKey } from "src/hooks/useSystemKey"
import UserService from "src/services/UserService"
import Notice from "src/components/Notice"
import { EMAIL_RULES, PASSWORD_RULES, PHONE_RULES } from "src/utils/helpers"

const OPTIONAL_EMAIL_RULES = EMAIL_RULES.filter(rule => !rule.required)

const contactRequiredRule = ({ getFieldValue }) => ({
  validator: (_, value) => {
    const hasEmail = getFieldValue("email")?.trim()
    const hasPhone = getFieldValue("phoneNumber")?.trim()
    if (value?.trim() || hasEmail || hasPhone) return Promise.resolve()
    return Promise.reject(new Error("Vui lòng nhập email hoặc số điện thoại!"))
  },
})

const CreateAccountModal = ({ open, onClose, users = [], loadingUsers = false, onSuccess }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = React.useState(false)
  const { getOptions } = useSystemKey()
  const roleOptions = getOptions(SYSTEM_KEY.ROLE).filter(option => {
    const role = option.codeValue || option.value
    return role !== ROLES.FARM_MANAGER && role !== ROLES.FARMER
  })

  const userOptions = users
    .filter(user => user?.id)
    .map(user => ({
      value: user.id,
      label: `${user.fullName || "Người dùng"}${user.email ? ` — ${user.email}` : ""}`,
    }))

  React.useEffect(() => {
    if (open) {
      form.resetFields()
    }
  }, [open, form])

  const handleUserChange = userId => {
    const selectedUser = users.find(user => user.id === userId)
    form.setFieldsValue({
      email: selectedUser?.email || "",
      phoneNumber: selectedUser?.phoneNumber || selectedUser?.phone || "",
    })
  }

  const handleSubmit = async values => {
    try {
      setLoading(true)
      const res = await UserService.createAccount(values.userId, {
        password: values.password,
        roles: [values.role],
        email: values.email?.trim() || null,
        phoneNumber: values.phoneNumber?.trim() || null,
      })

      if (res?.success === false) return

      Notice({ msg: "Tạo tài khoản thành công!", isSuccess: true })
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
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50">
            <KeyOutlined className="text-blue-600" />
          </div>
          <div>
            <div className="font-bold text-gray-800">Tạo tài khoản</div>
            <div className="text-[11px] font-normal text-gray-400">
              Cấp mật khẩu và phân quyền cho nhân viên đã tồn tại
            </div>
          </div>
        </div>
      }
      footer={null}
      width={520}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit} className="mt-4">
        <Form.Item
          name="userId"
          label={<span className="text-xs font-bold tracking-wider text-gray-500 uppercase">Nhân viên</span>}
          rules={[{ required: true, message: "Vui lòng chọn nhân viên!" }]}
        >
          <Select
            showSearch
            optionFilterProp="label"
            loading={loadingUsers}
            placeholder="Chọn nhân viên đã tồn tại"
            options={userOptions}
            onChange={handleUserChange}
            disabled={!userOptions.length}
            suffixIcon={<UserOutlined className="text-gray-300" />}
            className="h-10 rounded-lg"
            notFoundContent="Chưa có nhân viên phù hợp"
          />
        </Form.Item>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Form.Item
            name="email"
            dependencies={["phoneNumber"]}
            label={<span className="text-xs font-bold tracking-wider text-gray-500 uppercase">Email</span>}
            rules={[...OPTIONAL_EMAIL_RULES, contactRequiredRule]}
          >
            <Input
              type="email"
              autoComplete="email"
              prefix={<MailOutlined className="text-gray-300" />}
              placeholder="example@eapls.com"
              className="h-10 rounded-lg"
            />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            dependencies={["email"]}
            label={<span className="text-xs font-bold tracking-wider text-gray-500 uppercase">Số điện thoại</span>}
            rules={[...PHONE_RULES, contactRequiredRule]}
          >
            <Input
              type="tel"
              autoComplete="tel"
              prefix={<PhoneOutlined className="text-gray-300" />}
              placeholder="0912345678"
              className="h-10 rounded-lg"
            />
          </Form.Item>
        </div>

        <Form.Item
          name="password"
          label={<span className="text-xs font-bold tracking-wider text-gray-500 uppercase">Mật khẩu</span>}
          rules={PASSWORD_RULES}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-300" />}
            placeholder="Nhập mật khẩu đăng nhập"
            autoComplete="new-password"
            className="h-10 rounded-lg"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label={<span className="text-xs font-bold tracking-wider text-gray-500 uppercase">Xác nhận mật khẩu</span>}
          dependencies={["password"]}
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("password") === value) return Promise.resolve()
                return Promise.reject(new Error("Mật khẩu không khớp!"))
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-300" />}
            placeholder="Nhập lại mật khẩu"
            autoComplete="new-password"
            className="h-10 rounded-lg"
          />
        </Form.Item>

        <Form.Item
          name="role"
          label={<span className="text-xs font-bold tracking-wider text-gray-500 uppercase">Vai trò</span>}
          rules={[{ required: true, message: "Vui lòng chọn một vai trò!" }]}
        >
          <Select
            placeholder="Chọn vai trò"
            options={roleOptions}
            className="rounded-lg"
          />
        </Form.Item>

        {!userOptions.length && (
          <div className="p-3 mb-4 text-xs text-amber-700 border border-amber-100 rounded-xl bg-amber-50">
            Chưa có nhân viên trong danh sách để cấp tài khoản.
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
          <Button onClick={onClose} className="h-10 px-6 rounded-xl" disabled={loading}>
            Hủy
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={!userOptions.length}
            className="h-10 px-6 font-bold bg-blue-600 border-0 rounded-xl"
          >
            Tạo tài khoản
          </Button>
        </div>
      </Form>
    </CustomModal>
  )
}

export default CreateAccountModal
