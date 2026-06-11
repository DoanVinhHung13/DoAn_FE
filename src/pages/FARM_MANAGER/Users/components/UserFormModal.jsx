import React from 'react'
import { Form, Input, Select, Switch, Button } from 'antd'
import { UserAddOutlined, UserOutlined, MailOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import CustomModal from 'src/components/Modal/CustomModal'
import UserService from 'src/services/UserService'
import Notice from 'src/components/Notice'
import { ROLE_CONFIG } from './AssignRolesModal'
import { FULL_NAME_RULES, EMAIL_RULES, PASSWORD_RULES, PHONE_RULES } from 'src/utils/helpers'
import ROUTER from 'src/router/ROUTER'

const { Option } = Select
const ALL_ROLES = Object.entries(ROLE_CONFIG).map(([value, cfg]) => ({ value, label: cfg.label }))

const UserFormModal = ({ open, onClose, editingUser, onSuccess }) => {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const isEdit = !!editingUser

  React.useEffect(() => {
    if (open) {
      if (isEdit) {
        form.setFieldsValue({
          fullName: editingUser.fullName || '',
          phoneNumber: editingUser.phoneNumber || '',
          isActive: editingUser.isActive ?? true,
        })
      } else {
        form.resetFields()
        form.setFieldsValue({ isActive: true, roles: ['FARMER'] })
      }
    }
  }, [open, editingUser, isEdit, form])

  const mutation = useMutation({
    mutationFn: (values) => {
      if (isEdit) {
        return UserService.updateUser(editingUser.id, {
          fullName: values.fullName,
          phoneNumber: values.phoneNumber || null,
          isActive: editingUser.isActive,
        })
      }
      return UserService.createUser({
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        roles: values.roles || ['FARMER'],
      })
    },
    onSuccess: (res) => {
      if (res?.success === false) return
      queryClient.invalidateQueries(['users'])
      onClose()
      onSuccess?.()

      if (isEdit && editingUser?.id) {
        navigate(ROUTER.FM_USER_DETAIL.replace(':id', editingUser.id))
      }
    },
    onError: (error) => {
      // Check if it's an email conflict
      const errMsg = error.response?.data?.message || error.message;
      if (errMsg && errMsg.toLowerCase().includes('email')) {
        form.setFields([
          {
            name: 'email',
            errors: ['Email đã tồn tại (MSG-UM-02)'],
          },
        ]);
      } else {
        Notice({ msg: errMsg || 'Có lỗi xảy ra', isSuccess: false });
      }
    }
  })

  return (
    <CustomModal
      open={open}
      onCancel={onClose}
      title={
        <div className="flex items-center gap-2 py-1">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
            <UserAddOutlined className="text-green-600" />
          </div>
          <span className="font-bold">
            {isEdit ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
          </span>
        </div>
      }
      footer={null}
      width={520}
    >
      <Form form={form} layout="vertical" onFinish={(v) => mutation.mutate(v)} className="mt-4">
        <Form.Item
          name="fullName"
          label={<span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Họ và tên</span>}
          rules={FULL_NAME_RULES}
        >
          <Input prefix={<UserOutlined className="text-gray-300" />} placeholder="Nguyễn Văn A" className="h-10 rounded-lg" />
        </Form.Item>

        {!isEdit && (
          <>
            <Form.Item
              name="email"
              label={<span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email</span>}
              rules={EMAIL_RULES}
            >
              <Input prefix={<MailOutlined className="text-gray-300" />} placeholder="example@eapls.com" className="h-10 rounded-lg" />
            </Form.Item>
            <Form.Item
              name="password"
              label={<span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Mật khẩu</span>}
              rules={PASSWORD_RULES}
            >
              <Input.Password prefix={<LockOutlined className="text-gray-300" />} placeholder="••••••••" className="h-10 rounded-lg" />
            </Form.Item>
            <Form.Item
              name="roles"
              label={<span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Vai trò</span>}
              rules={[{ required: true, message: 'Chọn ít nhất một vai trò!' }]}
            >
              <Select mode="multiple" placeholder="Chọn vai trò" className="rounded-lg">
                {ALL_ROLES.map(r => <Option key={r.value} value={r.value}>{r.label}</Option>)}
              </Select>
            </Form.Item>
          </>
        )}

        {isEdit && (
          <Form.Item
            name="phoneNumber"
            label={<span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Số điện thoại</span>}
            rules={PHONE_RULES}
          >
            <Input prefix={<PhoneOutlined className="text-gray-300" />} placeholder="0912345678" className="h-10 rounded-lg" />
          </Form.Item>
        )}



        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
          <Button onClick={onClose} className="h-10 px-6 rounded-xl">Hủy</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={mutation.isPending || mutation.isLoading}
            className="h-10 px-6 rounded-xl bg-green-600 border-0 font-bold shadow-lg shadow-green-100"
          >
            {isEdit ? 'Lưu thay đổi' : 'Tạo tài khoản'}
          </Button>
        </div>
      </Form>
    </CustomModal>
  )
}

export default UserFormModal
