import {
  CameraOutlined,
  EditOutlined,
  MailOutlined,
  UserOutlined,
} from "@ant-design/icons"
import { useQueryClient } from "@tanstack/react-query"
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Row,
  Typography,
  Upload,
} from "antd"
import dayjs from "dayjs"
import { useEffect, useMemo, useState } from "react"
import { useSelector } from "react-redux"

import TitleCustom from "src/components/TitleCustom"
import { SYSTEM_KEY } from "src/constants/systemKey"
import { useSystemKey } from "src/hooks/useSystemKey"
import { useAppDispatch } from "src/redux/hooks"
import authSession from "src/redux/authSession"
import { setUserInfo } from "src/redux/slices/appGlobalSlice"
import UserService from "src/services/UserService"
import { getAvatarUrl, getInitialAvatar } from "src/utils/helpers"
import UpdateProfile from "./UpdateProfile"

const { Text, Title } = Typography

const displayValue = value => value || "Chưa cập nhật"

const AccountInfo = () => {
  const { userInfo: user } = useSelector(state => state.appGlobal)
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()
  const { getCombo, getDescription } = useSystemKey()
  const genderOptions = getCombo(SYSTEM_KEY.GENDER)

  const [form] = Form.useForm()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "")
  const [uploadError, setUploadError] = useState("")

  const watchedName = Form.useWatch("fullName", form)

  const initialValues = useMemo(
    () => ({
      fullName: user?.fullName || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      dateOfBirth: user?.dateOfBirth ? dayjs(user.dateOfBirth) : null,
      gender: user?.gender || undefined,
      address: user?.address || "",
    }),
    [user],
  )

  useEffect(() => {
    form.setFieldsValue(initialValues)
    setAvatarUrl(user?.avatarUrl || "")
  }, [form, initialValues, user?.avatarUrl])

  const handleFinish = async values => {
    setLoading(true)
    try {
      const payload = {
        fullName: values.fullName.trim().replace(/\s+/g, " "),
        phoneNumber: values.phoneNumber?.trim() || null,
        dateOfBirth: values.dateOfBirth?.toISOString() || null,
        gender: values.gender || null,
        address: values.address?.trim().replace(/\s+/g, " ") || null,
      }

      const response = await UserService.updateMyProfile(payload)
      if (response?.success === false) return

      const updated = response?.data || {}
      const nextUser = {
        ...user,
        fullName: payload.fullName,
        phoneNumber: payload.phoneNumber,
        dateOfBirth: payload.dateOfBirth,
        gender: payload.gender,
        address: payload.address,
        ...updated,
      }

      dispatch(setUserInfo(nextUser))
      authSession.updateUser(nextUser)
      queryClient.invalidateQueries({ queryKey: ["users"] })
      setEditing(false)
    } catch (error) {
      const apiMessage = error?.message || ""
      const duplicatePhone =
        /phone|điện thoại|số điện thoại/i.test(apiMessage) &&
        /exist|duplicate|đăng ký|tồn tại|trùng/i.test(apiMessage)

      if (duplicatePhone) {
        form.setFields([
          {
            name: "phoneNumber",
            errors: [
              "Số điện thoại này đã được đăng ký. Vui lòng thử số khác.",
            ],
          },
        ])
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    form.setFieldsValue(initialValues)
    form.setFields([])
    setEditing(false)
  }

  const handleAvatarUpload = async ({ file, onSuccess, onError }) => {
    const formData = new FormData()
    formData.append("file", file)
    try {
      const response = await UserService.uploadMyAvatar(formData)
      const payload = response?.data?.data || response?.data || {}
      const newAvatarUrl = payload.avatarUrl || payload.avatar || payload.url
      setAvatarUrl(newAvatarUrl)
      const nextUser = { ...user, avatarUrl: newAvatarUrl }
      dispatch(setUserInfo(nextUser))
      authSession.updateUser(nextUser)
      onSuccess(response)
    } catch (error) {
      setUploadError(
        error?.message || "Không thể tải ảnh đại diện. Vui lòng thử lại.",
      )
      onError(error)
    }
  }

  const beforeAvatarUpload = file => {
    setUploadError("")
    const validType = ["image/jpeg", "image/png", "image/webp"].includes(
      file.type,
    )
    if (!validType) {
      setUploadError("Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.")
      return Upload.LIST_IGNORE
    }
    if (file.size / 1024 / 1024 > 5) {
      setUploadError("Dung lượng ảnh không được vượt quá 5MB.")
      return Upload.LIST_IGNORE
    }
    return true
  }

  const previewName = editing ? watchedName || user?.fullName : user?.fullName
  const role = user?.role || user?.roles?.[0] || ""
  const addressText = [user?.address].filter(Boolean).join(", ")

  const summaryRow = (icon, label, value) => (
    <div className="flex items-start gap-3">
      <div className="flex items-center justify-center text-gray-400 rounded-lg h-9 w-9 shrink-0 bg-gray-50">
        {icon}
      </div>
      <div className="min-w-0">
        <Text className="block !text-[10px] !font-semibold uppercase !text-gray-400">
          {label}
        </Text>
        <Text strong className="block break-words !text-sm">
          {displayValue(value)}
        </Text>
      </div>
    </div>
  )

  return (
    <div className="mx-auto max-w-[1180px] space-y-6">
      <TitleCustom className="!mb-0 flex items-center gap-2">
        <UserOutlined className="text-green-600" />
        Thông tin cá nhân
      </TitleCustom>

      <Row gutter={[24, 24]} align="stretch">
        <Col xs={24} lg={8} className="flex">
          <Card variant="borderless" className="w-full rounded-lg shadow-sm">
            <div className="flex flex-col h-full text-center">
              <div className="relative inline-block mx-auto mt-2">
                <Avatar
                  size={116}
                  src={getAvatarUrl(avatarUrl)}
                  icon={!avatarUrl && <UserOutlined />}
                  className="text-5xl text-green-600 border-4 border-white shadow-lg bg-green-50"
                >
                  {!avatarUrl && getInitialAvatar(previewName)}
                </Avatar>
                <Upload
                  showUploadList={false}
                  customRequest={handleAvatarUpload}
                  beforeUpload={beforeAvatarUpload}
                >
                  <Button
                    aria-label="Cập nhật ảnh đại diện"
                    shape="circle"
                    size="small"
                    icon={<CameraOutlined />}
                    className="absolute text-white bg-green-500 border-2 border-white bottom-1 right-1"
                  />
                </Upload>
              </div>
              {uploadError && (
                <Text type="danger" className="mt-2 !text-xs">
                  {uploadError}
                </Text>
              )}

              <Title level={4} className="!mb-1 !mt-7">
                {displayValue(previewName)}
              </Title>
              <Text className="!text-[10px] !font-bold uppercase tracking-widest !text-gray-400">
                {role}
              </Text>

              <Divider className="!my-7" />
              <div className="px-2 space-y-5 text-left">
                {summaryRow(<MailOutlined />, "Email đăng nhập", user?.email)}
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16} className="flex">
          <Card variant="borderless" className="w-full rounded-lg shadow-sm">
            {!editing ? (
              <div className="flex min-h-[520px] flex-col">
                <Title level={5} className="flex items-center gap-2 !mb-8">
                  <EditOutlined className="text-green-500" />
                  Thông tin cá nhân
                </Title>
                <div className="grid grid-cols-[150px_1fr] gap-x-7 gap-y-7 text-sm">
                  <Text type="secondary">Họ và tên</Text>
                  <Text strong>{displayValue(user?.fullName)}</Text>
                  <Text type="secondary">Số điện thoại</Text>
                  <Text strong>{displayValue(user?.phoneNumber)}</Text>
                  <Text type="secondary">Ngày sinh</Text>
                  <Text strong>
                    {user?.dateOfBirth
                      ? dayjs(user.dateOfBirth).format("DD/MM/YYYY")
                      : "Chưa cập nhật"}
                  </Text>
                  <Text type="secondary">Giới tính</Text>
                  <Text strong>
                    {displayValue(
                      getDescription(SYSTEM_KEY.GENDER, user?.gender) ||
                      user?.gender,
                    )}
                  </Text>
                  <Text type="secondary">Địa chỉ</Text>
                  <Text strong>{displayValue(addressText)}</Text>
                </div>
                <div className="flex justify-end pt-10 mt-auto">
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => setEditing(true)}
                    className="h-10 px-5 font-semibold bg-green-500"
                  >
                    Thay đổi thông tin
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Title level={5} className="flex items-center gap-2 !mb-6">
                  <EditOutlined className="text-green-500" />
                  Thay đổi thông tin
                </Title>
                <UpdateProfile
                  form={form}
                  onFinish={handleFinish}
                  onCancel={handleCancel}
                  loading={loading}
                  genderOptions={genderOptions}
                />
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AccountInfo
