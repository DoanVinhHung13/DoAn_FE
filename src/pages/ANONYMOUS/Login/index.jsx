import { LockOutlined, UserOutlined } from "@ant-design/icons"
import {
  Button,
  Checkbox,
  Form,
  Input,
} from "antd"
import React, { useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import STORAGE from "src/redux/storage"
import authSession from "src/redux/authSession"
import { useAppDispatch } from "src/redux/hooks"
import { setUserInfo } from "src/redux/slices/appGlobalSlice"
import ROUTER from "src/router/ROUTER"
import { normalizeRole } from "src/constants/roles"
import { getDashboardPathByRole } from "src/router/roleRedirects"

import logo from "src/assets/images/logo/logo-eapls.jpg"
import AuthService from "src/services/AuthService"
import { LOGIN_IDENTIFIER_RULES, PASSWORD_RULES } from "src/utils/helpers"
import { logDevDiagnostic } from "src/utils/safeDiagnostic"


const Login = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()

  const [loading, setLoading] = React.useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    const remembered =
      localStorage.getItem(STORAGE.REMEMBERED_IDENTIFIER) ||
      localStorage.getItem(STORAGE.REMEMBERED_EMAIL)
    if (remembered) {
      form.setFieldsValue({
        identifier: remembered,
        remember: true,
      })
    }
  }, [form])

  const onFinish = async (values) => {
    try {
      setLoading(true)

      const loginRes = await AuthService.login({
        identifier: values.identifier,
        password: values.password,
      })

      if (values.remember) {
        localStorage.setItem(STORAGE.REMEMBERED_IDENTIFIER, values.identifier.trim())
      } else {
        localStorage.removeItem(STORAGE.REMEMBERED_IDENTIFIER)
      }

      const loginData = loginRes.data
      if (!authSession.persistAuth(loginData)) {
        throw new Error("Không nhận được mã xác thực (Token) từ hệ thống.")
      }

      const meRes = await AuthService.getProfile()
      const meData = meRes.data
      const finalId =
        meData?.id || meData?.userId || loginData?.userId || loginData?.id
      if (!finalId) {
        throw new Error("Không thể lấy thông tin tài khoản sau khi đăng nhập.")
      }

      const userRole = normalizeRole(meData.roles?.[0])
      const userData = {
        _id: finalId,
        id: finalId,
        fullName: meData.fullName,
        email: meData.email,
        phoneNumber: meData.phoneNumber,
        avatarUrl: meData.avatarUrl,
        isActive: meData.isActive,
        lastLoginAt: meData.lastLoginAt,
        dateOfBirth: meData.dateOfBirth,
        gender: meData.gender,
        address: meData.address,
        role: userRole,
        roles: meData.roles || [],
      }

      authSession.updateUser(userData)
      dispatch(setUserInfo(userData))
      navigate(getDashboardPathByRole(userRole))
    } catch (error) {
      logDevDiagnostic('login', error)
      // Lỗi API: axios đã hiện notice — không toast trùng
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-green-50">
      {/* Subtle Background Decoration */}
      <div className="absolute inset-0 overflow-hidden opacity-40">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-200 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-green-200 rounded-full blur-3xl"></div>
      </div>

      {/* Login Container */}
      <div className="relative z-10 w-full max-w-md px-4 py-8 mx-auto">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-emerald-200 rounded-full blur-xl opacity-50"></div>
            <div className="relative w-28 h-28 p-3 bg-white rounded-full shadow-2xl">
              <img
                src={logo}
                alt="EAPLS Logo"
                className="object-contain w-full h-full rounded-full"
              />
            </div>
          </div>
          <h1 className="text-lg font-semibold text-emerald-700">
            Nhật ký sản xuất điện tử
          </h1>
        </div>

        {/* Login Card */}
        <div className="relative overflow-hidden bg-white shadow-2xl rounded-[20px]">
          {/* Gradient Top Border */}
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-green-500 to-blue-500"></div>
          
          <div className="p-8">
            {/* Welcome Header */}
            <div className="mb-6">
              <h2 className="mb-2 text-2xl font-bold text-gray-800">
                Chào mừng trở lại
              </h2>
              <p className="text-sm text-gray-600">
                Vui lòng nhập thông tin để truy cập hệ thống quản lý.
              </p>
            </div>

            {/* Login Form */}
            <Form
              form={form}
              name="login"
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
            >
              {/* Username/Email Field */}
              <Form.Item
                name="identifier"
                label={
                  <span className="text-sm font-semibold text-gray-700">
                    Email / Số điện thoại
                  </span>
                }
                rules={LOGIN_IDENTIFIER_RULES}
              >
                <Input
                  prefix={<UserOutlined className="text-gray-400" />}
                  placeholder="Nhập số điện thoại hoặc email"
                  className="h-12 px-4 text-base bg-gray-50 border border-gray-300 rounded-lg hover:bg-white hover:border-emerald-400 focus:bg-white focus:border-emerald-500 transition-all placeholder:text-gray-400 placeholder:font-normal"
                />
              </Form.Item>

              {/* Password Field */}
              <Form.Item
                name="password"
                label={
                  <span className="text-sm font-semibold text-gray-700">
                    Mật khẩu
                  </span>
                }
                rules={PASSWORD_RULES}
              >
                <Input.Password
                  prefix={<LockOutlined className="text-gray-400" />}
                  placeholder="Nhập mật khẩu"
                  className="h-12 px-4 text-base bg-gray-50 border border-gray-300 rounded-lg hover:bg-white hover:border-emerald-400 focus:bg-white focus:border-emerald-500 transition-all placeholder:text-gray-400 placeholder:font-normal"
                />
              </Form.Item>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between mb-6 -mt-2">
                <Form.Item
                  name="remember"
                  valuePropName="checked"
                  className="mb-0"
                >
                  <Checkbox className="text-sm font-medium text-gray-600 hover:text-gray-800">
                    <span className="ml-1">Ghi nhớ đăng nhập</span>
                  </Checkbox>
                </Form.Item>

                <Link
                  to={ROUTER.FORGOT_PASSWORD}
                  className="text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              {/* Submit Button */}
              <Form.Item className="mb-0">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  className="h-12 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 border-0 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02]"
                >
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-center">
          <p className="text-sm font-medium text-gray-500">
            © 2026 Nhật ký điện tử
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
