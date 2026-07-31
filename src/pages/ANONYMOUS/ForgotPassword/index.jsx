import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  CheckCircleFilled,
  LockOutlined,
  SafetyCertificateOutlined,
  UserOutlined,
} from "@ant-design/icons"
import { Alert, Button, Form, Input, Steps, Typography } from "antd"
import { useEffect, useState } from "react"
import { Link, useNavigate } from "react-router-dom"

import ROUTER from "src/router/ROUTER"
import AuthService from "src/services/AuthService"
import { LOGIN_IDENTIFIER_RULES } from "src/utils/helpers"

const { Title, Text } = Typography

const STEPS = { IDENTIFIER: 0, OTP: 1, PASSWORD: 2, SUCCESS: 3 }
const OTP_LENGTH = 6
const OTP_EXPIRE_SECONDS = 5 * 60

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(STEPS.IDENTIFIER)
  const [identifier, setIdentifier] = useState("")
  const [otp, setOtp] = useState("")
  const [countdown, setCountdown] = useState(0)

  useEffect(() => {
    if (countdown <= 0) return undefined
    const timer = setInterval(() => setCountdown(c => c - 1), 1000)
    return () => clearInterval(timer)
  }, [countdown])

  const formatCountdown = seconds => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, "0")}`
  }

  const handleSendOtp = async values => {
    try {
      setLoading(true)
      await AuthService.forgotPassword({
        identifier: values.identifier.trim(),
      })
      setIdentifier(values.identifier.trim())
      setOtp("")
      setCountdown(OTP_EXPIRE_SECONDS)
      setCurrentStep(STEPS.OTP)
    } catch {
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    if (countdown > 0) return
    try {
      setLoading(true)
      await AuthService.forgotPassword({ identifier })
      setOtp("")
      setCountdown(OTP_EXPIRE_SECONDS)
    } catch {
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== OTP_LENGTH) return
    try {
      setLoading(true)
      await AuthService.verifyOTP({ identifier, otp })
      setCurrentStep(STEPS.PASSWORD)
    } catch {
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async values => {
    try {
      setLoading(true)
      await AuthService.resetPassword({
        identifier,
        otp,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmNewPassword,
      })
      setCurrentStep(STEPS.SUCCESS)
    } catch {
      setLoading(false)
    } finally {
      setLoading(false)
    }
  }

  const stepIcons = [
    <UserOutlined className="text-2xl md:text-3xl" />,
    <SafetyCertificateOutlined className="text-2xl md:text-3xl" />,
    <LockOutlined className="text-2xl md:text-3xl" />,
  ]

  const stepTitles = ["Nhập tài khoản", "Xác minh OTP", "Mật khẩu mới"]
  const stepDescriptions = [
    "Nhập email hoặc số điện thoại liên kết với tài khoản để nhận mã OTP.",
    "Nhập mã OTP 6 chữ số đã được gửi đến email của bạn.",
    "Thiết lập mật khẩu mới cho tài khoản của bạn.",
  ]

  const renderStepContent = () => {
    if (currentStep === STEPS.SUCCESS) {
      return (
        <div className="space-y-8 duration-500 animate-in zoom-in">
          <div className="flex items-start gap-4 p-6 text-left border bg-emerald-50 border-emerald-100 rounded-3xl">
            <CheckCircleFilled className="mt-1 text-2xl text-emerald-500" />
            <div>
              <Text className="block mb-1 text-lg font-bold text-emerald-900">
                Đặt lại mật khẩu thành công
              </Text>
              <Text className="font-medium leading-relaxed text-emerald-700/80">
                Mật khẩu mới đã được kích hoạt. Vui lòng đăng nhập lại bằng mật
                khẩu mới.
              </Text>
            </div>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<ArrowRightOutlined />}
            className="w-full h-12 text-base font-black border-0 shadow-xl md:h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 md:text-lg shadow-emerald-200"
            onClick={() => navigate(ROUTER.LOGIN)}
          >
            Đăng nhập ngay
          </Button>
        </div>
      )
    }

    if (currentStep === STEPS.IDENTIFIER) {
      return (
        <Form
          form={form}
          name="forgot-password-identifier"
          onFinish={handleSendOtp}
          layout="vertical"
          size="large"
          className="premium-form"
          initialValues={{ identifier }}
        >
          <Form.Item
            name="identifier"
            label={
              <span className="text-[10px] md:text-[11px] uppercase font-black text-gray-400 tracking-wider">
                Email hoặc Số điện thoại
              </span>
            }
            rules={LOGIN_IDENTIFIER_RULES}
            className="mb-6 md:mb-10"
          >
            <Input
              prefix={<UserOutlined className="text-gray-300" />}
              placeholder="Email hoặc số điện thoại"
              className="h-12 text-sm border-gray-100 rounded-xl md:h-14 focus:border-emerald-500 md:text-base"
            />
          </Form.Item>
          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full h-12 text-base font-black border-0 shadow-xl md:h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 md:text-lg shadow-emerald-200"
            >
              Gửi mã OTP
            </Button>
          </Form.Item>
        </Form>
      )
    }

    if (currentStep === STEPS.OTP) {
      return (
        <div className="space-y-6">
          <Alert
            message={`Mã OTP đã gửi đến ${identifier}`}
            description={
              countdown > 0
                ? `Mã có hiệu lực trong ${formatCountdown(countdown)}.`
                : "Mã OTP đã hết hạn. Vui lòng gửi lại mã mới."
            }
            type="info"
            showIcon
            className="text-left rounded-2xl border-blue-50 bg-blue-50/50"
          />
          <div className="flex justify-center py-2">
            <Input.OTP
              length={OTP_LENGTH}
              value={otp}
              onChange={setOtp}
              size="large"
            />
          </div>
          <Button
            type="primary"
            loading={loading}
            disabled={otp.length !== OTP_LENGTH}
            onClick={handleVerifyOtp}
            className="w-full h-12 text-base font-black border-0 shadow-xl md:h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 md:text-lg shadow-emerald-200"
          >
            Xác minh OTP
          </Button>
          <div className="flex items-center justify-between gap-3">
            <Button
              type="link"
              className="!px-0 text-gray-500 font-semibold"
              onClick={() => setCurrentStep(STEPS.IDENTIFIER)}
            >
              Đổi tài khoản
            </Button>
            <Button
              type="link"
              className="!px-0 text-emerald-600 font-semibold"
              disabled={countdown > 0}
              loading={loading}
              onClick={handleResendOtp}
            >
              {countdown > 0
                ? `Gửi lại sau ${formatCountdown(countdown)}`
                : "Gửi lại mã OTP"}
            </Button>
          </div>
        </div>
      )
    }

    return (
      <Form
        name="forgot-password-reset"
        onFinish={handleResetPassword}
        layout="vertical"
        size="large"
        className="premium-form"
      >
        <Form.Item
          name="newPassword"
          label={
            <span className="text-[10px] md:text-[11px] uppercase font-black text-gray-400 tracking-wider">
              Mật khẩu mới
            </span>
          }
          rules={[
            { required: true, message: "Vui lòng nhập mật khẩu mới!" },
            { min: 6, message: "Mật khẩu phải từ 6 ký tự trở lên" },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-300" />}
            placeholder="••••••••"
            className="h-12 border-gray-100 rounded-xl md:h-14 focus:border-emerald-500"
          />
        </Form.Item>
        <Form.Item
          name="confirmNewPassword"
          label={
            <span className="text-[10px] md:text-[11px] uppercase font-black text-gray-400 tracking-wider">
              Xác nhận mật khẩu
            </span>
          }
          dependencies={["newPassword"]}
          rules={[
            { required: true, message: "Vui lòng xác nhận mật khẩu!" },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve()
                }
                return Promise.reject(
                  new Error("Mật khẩu xác nhận không khớp!"),
                )
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-300" />}
            placeholder="••••••••"
            className="h-12 border-gray-100 rounded-xl md:h-14 focus:border-emerald-500"
          />
        </Form.Item>
        <Form.Item className="mb-0">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="w-full h-12 text-base font-black border-0 shadow-xl md:h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 md:text-lg shadow-emerald-200"
          >
            Đặt lại mật khẩu
          </Button>
        </Form.Item>
      </Form>
    )
  }

  const activeIconIndex = Math.min(currentStep, STEPS.PASSWORD)

  return (
    <div>
      <div className="relative flex items-center justify-center w-full min-h-screen overflow-hidden bg-slate-50">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-100/50 rounded-full blur-[120px]" />

        <div className="w-full max-w-[540px] bg-white/70 backdrop-blur-2xl rounded-[32px] md:rounded-[40px] shadow-2xl p-6 sm:p-10 md:p-16 border border-white relative z-10 animate-in fade-in slide-in-from-bottom duration-700">
          <div className="flex flex-col items-center mb-6 md:mb-8">
            <div className="flex items-center justify-center w-12 h-12 mb-4 text-white shadow-xl md:w-16 md:h-16 bg-emerald-600 rounded-2xl md:rounded-3xl shadow-emerald-200 md:mb-6">
              {currentStep === STEPS.SUCCESS ? (
                <CheckCircleFilled className="text-2xl md:text-3xl" />
              ) : (
                stepIcons[activeIconIndex]
              )}
            </div>
            <Title
              level={3}
              className="!font-black !text-gray-800 !mb-1 text-center md:!text-3xl"
            >
              {currentStep === STEPS.SUCCESS ? "Hoàn tất!" : "Quên mật khẩu?"}
            </Title>
            {currentStep !== STEPS.SUCCESS && (
              <Text className="px-4 text-xs font-medium text-center text-gray-400 md:text-sm">
                {stepDescriptions[activeIconIndex]}
              </Text>
            )}
          </div>

          {currentStep !== STEPS.SUCCESS && (
            <Steps
              current={activeIconIndex}
              size="small"
              className="mb-8"
              items={stepTitles.map(title => ({ title }))}
            />
          )}

          {renderStepContent()}

          {currentStep !== STEPS.SUCCESS && (
            <div className="mt-12 text-center">
              <Link
                to={ROUTER.LOGIN}
                className="flex items-center justify-center gap-2 font-black text-emerald-600 hover:underline group"
              >
                <ArrowLeftOutlined className="transition-transform group-hover:-translate-x-1" />
                Quay lại Đăng nhập
              </Link>
            </div>
          )}
        </div>

        <div className="absolute bottom-8 text-[10px] uppercase font-bold tracking-[3px] text-gray-400/50 pointer-events-none w-full text-center">
          EAPLS identity protection system
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
