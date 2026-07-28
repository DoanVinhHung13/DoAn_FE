import {
  CameraOutlined,
  MailOutlined,
  PhoneOutlined,
  UserAddOutlined,
  UserOutlined,
} from "@ant-design/icons"
import {
  Avatar,
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  Row,
  Select,
  Upload,
  message,
} from "antd"
import dayjs from "dayjs"
import React from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import CustomModal from "src/components/Modal/CustomModal"
import { ROLES } from "src/constants/roles"
import { SYSTEM_KEY } from "src/constants/systemKey"
import { useSystemKey } from "src/hooks/useSystemKey"
import ROUTER from "src/router/ROUTER"
import UploadService from "src/services/UploadService"
import UserService from "src/services/UserService"
import {
  CONTACT_REQUIRED_RULE,
  EMAIL_RULES,
  FULL_NAME_RULES,
  PHONE_RULES,
  getAvatarUrl,
} from "src/utils/helpers"

const OPTIONAL_EMAIL_RULES = EMAIL_RULES.filter(rule => !rule.required)

const UserFormModal = ({ open, onClose, editingUser, onSuccess }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = React.useState(false)
  const currentUser = useSelector(state => state.appGlobal.userInfo)
  const currentRoles = currentUser?.roles?.length ? currentUser.roles : [currentUser?.role]
  const navigate = useNavigate()
  const isEdit = !!editingUser
  const { getOptions } = useSystemKey()
  const genderOptions = getOptions(SYSTEM_KEY.GENDER)
  const roleOptions = getOptions(SYSTEM_KEY.ROLE)
  const allowedRoleOptions = currentRoles.includes(ROLES.FARM_MANAGER)
    ? roleOptions
    : roleOptions.filter(option => (option.codeValue || option.value) !== ROLES.FARM_MANAGER)

  const [avatarFile, setAvatarFile] = React.useState(null)
  const [previewAvatar, setPreviewAvatar] = React.useState("")

  React.useEffect(() => {
    if (open) {
      if (isEdit) {
        form.setFieldsValue({
          fullName: editingUser.fullName || "",
          phoneNumber: editingUser.phoneNumber || "",
          gender: editingUser.gender || undefined,
          dateOfBirth: editingUser.dateOfBirth
            ? dayjs(editingUser.dateOfBirth)
            : null,
          roles: editingUser.roles?.[0] || "FARMER",
          isActive: editingUser.isActive ?? true,
        })
        setPreviewAvatar(editingUser.avatarUrl || "")
      } else {
        form.resetFields()
        form.setFieldsValue({ isActive: true })
        setPreviewAvatar("")
      }
      setAvatarFile(null)
    }
  }, [open, editingUser, isEdit, form])

  const beforeUpload = file => {
    const isJpgOrPng =
      file.type === "image/jpeg" ||
      file.type === "image/png" ||
      file.type === "image/webp"
    if (!isJpgOrPng) {
      message.error("Bạn chỉ có thể tải lên file JPG, PNG hoặc WEBP!")
      return Upload.LIST_IGNORE
    }
    const isLt5M = file.size / 1024 / 1024 < 5
    if (!isLt5M) {
      message.error("Kích thước ảnh phải nhỏ hơn 5MB!")
      return Upload.LIST_IGNORE
    }

    setAvatarFile(file)

    // Create local preview
    const reader = new FileReader()
    reader.onload = e => setPreviewAvatar(e.target.result)
    reader.readAsDataURL(file)

    return false
  }

  const handleSubmit = async values => {
    try {
      setLoading(true)
      let uploadedUrl = isEdit ? editingUser.avatarUrl : null

      if (avatarFile) {
        const formData = new FormData()
        formData.append("file", avatarFile)
        const response = await UploadService.uploadImage(formData)
        const payload = response?.data?.data || response?.data || {}
        uploadedUrl =
          payload.avatarUrl ||
          payload.avatar ||
          payload.url ||
          payload ||
          uploadedUrl
      }
      let res
      if (isEdit) {
        // Cập nhật thông tin cơ bản
        await UserService.updateUser(editingUser.id, {
          fullName: values.fullName,
          phoneNumber: values.phoneNumber || null,
          gender: values.gender || null,
          dateOfBirth: values.dateOfBirth
            ? values.dateOfBirth.toISOString()
            : null,
          avatarUrl: uploadedUrl || null,
          isActive: editingUser.isActive,
        })

        // Cập nhật vai trò (gọi API assignRoles)
        if (values.roles && values.roles !== editingUser.roles?.[0]) {
          await UserService.assignRoles(editingUser.id, {
            roles: [values.roles],
          })
        }
        res = { success: true }
      } else {
        // Thêm người dùng mới
        res = await UserService.createUser({
          fullName: values.fullName,
          email: values.email?.trim() || null,
          phoneNumber: values.phoneNumber || null,
          gender: values.gender || null,
          dateOfBirth: values.dateOfBirth
            ? values.dateOfBirth.toISOString()
            : null,
          avatarUrl: uploadedUrl || null,
          roles: [ROLES.FARMER],
        })
      }

      if (res?.success === false) {
        const errMsg = res.message || (res.errors && res.errors[0]) || ""
        const lowerMsg = errMsg.toLowerCase()
        if (lowerMsg.includes("email")) {
          form.setFields([{ name: "email", errors: ["Email đã tồn tại"] }])
        } else if (
          lowerMsg.includes("phone") ||
          lowerMsg.includes("điện thoại")
        ) {
          form.setFields([
            { name: "phoneNumber", errors: ["Số điện thoại đã tồn tại"] },
          ])
        }
        return
      }

      onClose()
      onSuccess?.()

      if (isEdit && editingUser?.id) {
        navigate(ROUTER.FM_USER_DETAIL.replace(":id", editingUser.id))
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || error.message || ""
      const lowerMsg = errMsg.toLowerCase()
      if (lowerMsg.includes("email")) {
        form.setFields([{ name: "email", errors: ["Email đã tồn tại"] }])
      } else if (
        lowerMsg.includes("phone") ||
        lowerMsg.includes("điện thoại")
      ) {
        form.setFields([
          { name: "phoneNumber", errors: ["Số điện thoại đã tồn tại"] },
        ])
      }
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
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-50">
            <UserAddOutlined className="text-green-600" />
          </div>
          <span className="font-bold">
            {isEdit ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
          </span>
        </div>
      }
      footer={null}
      width={700}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
      >
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item
              name="fullName"
              label={
                <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Họ và tên
                </span>
              }
              rules={FULL_NAME_RULES}
            >
              <Input
                prefix={<UserOutlined className="text-gray-300" />}
                placeholder="Nguyễn Văn A"
                className="h-10 rounded-lg"
              />
            </Form.Item>
          </Col>

          {!isEdit && (
            <Col xs={24} md={12}>
              <Form.Item
                name="email"
                label={
                  <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                    Email
                  </span>
                }
                dependencies={["phoneNumber"]}
                rules={[...OPTIONAL_EMAIL_RULES, CONTACT_REQUIRED_RULE]}
              >
                <Input
                  type="email"
                  autoComplete="email"
                  prefix={<MailOutlined className="text-gray-300" />}
                  placeholder="example@eapls.com"
                  className="h-10 rounded-lg"
                />
              </Form.Item>
            </Col>
          )}

          {isEdit && (
            <Col xs={24} md={12}>
              <Form.Item
                name="roles"
                label={
                  <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                    Vai trò
                  </span>
                }
                rules={[{ required: true, message: "Chọn một vai trò!" }]}
              >
                <Select
                  placeholder="Chọn vai trò"
                  className="h-10 rounded-lg"
                  options={allowedRoleOptions}
                />
              </Form.Item>
            </Col>
          )}

          <Col xs={24} md={12}>
            <Form.Item
              name="phoneNumber"
              dependencies={["email"]}
              label={
                <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Số điện thoại
                </span>
              }
              rules={isEdit ? PHONE_RULES : [...PHONE_RULES, CONTACT_REQUIRED_RULE]}
            >
              <Input
                type="tel"
                autoComplete="tel"
                prefix={<PhoneOutlined className="text-gray-300" />}
                placeholder="0912345678"
                className="h-10 rounded-lg"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="gender"
              label={
                <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Giới tính
                </span>
              }
            >
              <Select
                allowClear
                placeholder="Chọn giới tính"
                className="h-10 rounded-lg"
                options={genderOptions}
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="dateOfBirth"
              label={
                <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Ngày sinh
                </span>
              }
              rules={[
                {
                  required: true,
                  message: "Vui lòng chọn ngày sinh.",
                },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve()
                    if (
                      !dayjs(value).isValid() ||
                      value.isAfter(dayjs(), "day")
                    ) {
                      return Promise.reject(
                        new Error("Ngày sinh không hợp lệ."),
                      )
                    }
                    if (dayjs().diff(value, "year") < 15) {
                      return Promise.reject(
                        new Error("Người dùng phải từ đủ 15 tuổi."),
                      )
                    }
                    return Promise.resolve()
                  },
                },
              ]}
            >
              <DatePicker
                format="DD/MM/YYYY"
                placeholder="Chọn ngày sinh"
                className="w-full h-10 rounded-lg"
                disabledDate={current =>
                  current && current > dayjs().endOf("day")
                }
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              label={
                <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">
                  Ảnh đại diện
                </span>
              }
            >
              <div className="flex items-center gap-4 mt-1">
                <Avatar
                  size={48}
                  src={avatarFile ? previewAvatar : getAvatarUrl(previewAvatar)}
                  icon={<UserOutlined />}
                  className="bg-gray-100 border border-gray-200 shadow-sm"
                />
                <Upload
                  showUploadList={false}
                  beforeUpload={beforeUpload}
                  accept="image/*"
                >
                  <Button className="h-10 rounded-lg" icon={<CameraOutlined />}>
                    Đổi ảnh đại diện
                  </Button>
                </Upload>
              </div>
            </Form.Item>
          </Col>
        </Row>

        <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-gray-100">
          <Button
            onClick={onClose}
            className="h-10 px-6 rounded-xl"
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="h-10 px-6 font-bold bg-green-600 border-0 shadow-lg rounded-xl shadow-green-100"
          >
            {isEdit ? "Lưu thay đổi" : "Thêm người dùng"}
          </Button>
        </div>
      </Form>
    </CustomModal>
  )
}

export default UserFormModal
