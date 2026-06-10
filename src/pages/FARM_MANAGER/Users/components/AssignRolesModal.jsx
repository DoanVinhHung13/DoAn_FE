import React from 'react'
import { Form, Select, Button, Typography } from 'antd'
import { SafetyCertificateOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import CustomModal from 'src/components/Modal/CustomModal'
import UserService from 'src/services/UserService'
import { ROLES } from 'src/constants/roles'
import Notice from 'src/components/Notice'

const { Text } = Typography
const { Option } = Select

export const ROLE_CONFIG = {
  FARM_MANAGER:     { label: 'Farm Manager',     color: 'purple' },
  LAND_MANAGER:     { label: 'Land Manager',     color: 'blue'   },
  MATERIAL_MANAGER: { label: 'Material Manager', color: 'orange' },
  FARMER:           { label: 'Farmer',           color: 'green'  },
}

const ALL_ROLES = Object.entries(ROLE_CONFIG).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}))

const AssignRolesModal = ({ open, onClose, user }) => {
  const [form] = Form.useForm()
  const queryClient = useQueryClient()

  React.useEffect(() => {
    if (open && user) {
      form.setFieldsValue({ roles: user.roles || [] })
    }
  }, [open, user, form])

  const mutation = useMutation({
    mutationFn: (values) => UserService.assignRoles(user.id, { roles: values.roles }),
    onSuccess: (res) => {
      if (res?.success === false) return
      queryClient.invalidateQueries(['users'])
      Notice({ msg: 'Phân quyền thành công!', isSuccess: true })
      onClose()
    },
  })

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
            <div className="text-[11px] text-gray-400 font-normal">{user?.fullName}</div>
          </div>
        </div>
      }
      footer={null}
      width={440}
    >
      <Form form={form} layout="vertical" onFinish={(v) => mutation.mutate(v)} className="mt-4">
        <Form.Item
          name="roles"
          label={<span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Vai trò được gán</span>}
          rules={[{ required: true, message: 'Phải chọn ít nhất một vai trò!' }]}
        >
          <Select
            mode="multiple"
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
            Thay đổi vai trò sẽ <strong>thay thế hoàn toàn</strong> danh sách hiện tại. Mọi phiên đăng nhập của tài khoản này sẽ bị ảnh hưởng.
          </Text>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button onClick={onClose} className="h-10 px-6 rounded-xl">Hủy</Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={mutation.isPending || mutation.isLoading}
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
