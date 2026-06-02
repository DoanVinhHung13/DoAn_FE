import { LockOutlined, MailOutlined } from "@ant-design/icons"
import { GoogleLogin } from "@react-oauth/google"
import {
  Button,
  Checkbox,
  Divider,
  Form,
  Input,
  message,
  Typography,
} from "antd"
import React, { useContext, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { StoreContext } from "src/contexts"
import STORAGE, { setStorage } from "src/lib/storage"
import { useAppDispatch } from "src/redux/hooks"
import { setUserInfo } from "src/redux/slices/appGlobalSlice"
import ROUTER from "src/router/ROUTER"

import logo from "src/assets/logo-ebookfarm.jpg"
import AuthService from "../../../services/AuthService"

const { Title, Text, Paragraph } = Typography

const Login = () => {
  const navigate = useNavigate()
  const { loginStore } = useContext(StoreContext)
  const { setIsLoginContext } = loginStore
  const dispatch = useAppDispatch()
  
  const setCredentials = (user, token) => {
    setStorage(STORAGE.TOKEN, token)
    dispatch(setUserInfo(user))
    setIsLoginContext(true)
  }
  
  const [loading, setLoading] = React.useState(false)
  const [form] = Form.useForm()

  // Load remembered account
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail")
    if (rememberedEmail) {
      form.setFieldsValue({
        email: rememberedEmail,
        remember: true,
      })
    }
  }, [form])

  const onFinish = async (values) => {
    try {
      setLoading(true)
      const { data } = await AuthService.login({
        identifier: values.email,
        password: values.password,
      })

      // Handle Remember Me
      if (values.remember) {
        localStorage.setItem("rememberedEmail", values.email)
      } else {
        localStorage.removeItem("rememberedEmail")
      }

      setCredentials(data.data, data.data.token)
      message.success("Đăng nhập thành công! Chào mừng trở lại EBookFarm.")
      
      // Navigate based on role
      const userRole = data.data.user?.role || data.data.role
      if (userRole === 'FarmManager') {
        navigate(ROUTER.FM_DASHBOARD)
      } else if (userRole === 'LandManager') {
        navigate(ROUTER.LM_DASHBOARD)
      } else if (userRole === 'MaterialManager') {
        navigate(ROUTER.MM_DASHBOARD)
      } else if (userRole === 'Farmer') {
        navigate(ROUTER.FARMER_DASHBOARD)
      } else {
        navigate(ROUTER.ADMIN_DASHBOARD)
      }
    } catch (error) {
      message.error(
        error.response?.data?.message ||
          "Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản."
      )
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true)
      const { data } = await AuthService.googleLogin({
        tokenId: credentialResponse.credential,
      })
      setCredentials(data.data, data.data.token)
      message.success("Đăng nhập Google thành công!")
      navigate(ROUTER.FM_DASHBOARD)
    } catch (error) {
      message.error("Xác thực Google thất bại. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden md:p-6 bg-slate-50">
      {/* Dynamic Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-100/50 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-green-100/40 rounded-full blur-[100px]"></div>

      <div className="w-full max-w-[1000px] mx-auto flex flex-col md:flex-row bg-white/70 backdrop-blur-2xl rounded-[32px] md:rounded-[40px] shadow-2xl overflow-hidden border border-white relative z-10 animate-in fade-in zoom-in duration-700">
        {/* Left Side: Branding/Visual */}
        <div className="relative flex-col justify-between hidden p-12 overflow-hidden md:flex md:w-1/2 bg-emerald-600">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-green-800"></div>
          <div className="absolute top-0 right-0 w-64 h-64 -mt-20 -mr-20 rounded-full bg-white/10 blur-3xl"></div>

          <div className="relative z-10">
            <Link
              to={ROUTER.HOME}
              className="flex items-center gap-3 mb-12 transition-opacity cursor-pointer hover:opacity-80"
            >
              <div className="flex items-center justify-center w-16 h-16 p-2 overflow-hidden bg-white border shadow-lg rounded-2xl border-white/20">
                <img
                  src={logo}
                  alt="Logo"
                  className="object-contain w-full h-full"
                />
              </div>
              <div className="flex flex-col text-white">
                <span className="text-2xl font-black leading-none tracking-tighter uppercase">
                  EBookFarm
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80 text-emerald-100">
                  Agri-tech Solution
                </span>
              </div>
            </Link>

            <Title
              level={1}
              className="!text-white !font-black !text-4xl !mb-6 leading-tight"
            >
              Chào mừng bạn quay lại hệ thống
            </Title>
            <Paragraph className="text-emerald-50/80 text-lg leading-relaxed max-w-[320px]">
              Tiếp tục quản lý nông trại và theo dõi nhật ký sản xuất chuẩn quốc gia ngay hôm nay.
            </Paragraph>
          </div>

          <div className="relative z-10 p-6 border bg-white/10 backdrop-blur-md rounded-3xl border-white/10">
            <div className="flex items-center gap-3 mb-8">
              <div className="flex items-center justify-center p-2 overflow-hidden bg-white border border-gray-100 shadow-lg w-14 h-14 rounded-2xl">
                <img
                  src={logo}
                  alt="Logo"
                  className="object-contain w-full h-full"
                />
              </div>
              <Text className="text-2xl font-black tracking-tighter text-gray-800 uppercase">
                EBookFarm
              </Text>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="flex flex-col justify-center w-full p-5 md:w-1/2 sm:p-10 md:p-16">
          <div className="block mb-4 md:mb-10 md:hidden">
            <Link to={ROUTER.HOME}>
              <img
                src={logo}
                alt="Logo"
                className="w-auto h-8 mb-4 transition-opacity cursor-pointer hover:opacity-80"
              />
            </Link>
          </div>

          <div className="mb-6 md:mb-10">
            <Title
              level={3}
              className="!font-black !text-gray-800 !mb-1 md:!text-3xl"
            >
              Đăng nhập
            </Title>
            <Text className="text-xs font-medium tracking-tight text-gray-400 md:text-sm">
              Vui lòng nhập thông tin để truy cập hệ thống
            </Text>
          </div>

          <Form
            form={form}
            name="login"
            layout="vertical"
            size="large"
            onFinish={onFinish}
            autoComplete="off"
            className="premium-form"
          >
            <Form.Item
              name="email"
              label={
                <span className="text-[10px] md:text-[11px] uppercase font-black text-gray-400 tracking-wider">
                  Email hoặc Tên tài khoản
                </span>
              }
              rules={[
                { required: true, message: "Thông tin này là bắt buộc!" },
              ]}
              className="mb-3 md:mb-6"
            >
              <Input
                prefix={<MailOutlined className="text-gray-300" />}
                placeholder="example@farm.com"
                className="h-12 text-sm font-medium transition-all border-gray-100 rounded-xl md:h-14 hover:border-emerald-400 focus:border-emerald-500 md:text-base"
              />
            </Form.Item>

            <Form.Item
              name="password"
              label={
                <span className="text-[10px] md:text-[11px] uppercase font-black text-gray-400 tracking-wider">
                  Mật khẩu bảo mật
                </span>
              }
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
              className="mb-4 md:mb-6"
            >
              <Input.Password
                prefix={<LockOutlined className="text-gray-300" />}
                placeholder="••••••••"
                className="h-12 text-sm font-medium transition-all border-gray-100 rounded-xl md:h-14 hover:border-emerald-400 focus:border-emerald-500 md:text-base"
              />
            </Form.Item>

            <div className="flex flex-col items-start justify-between gap-2 mb-6 sm:flex-row sm:items-center sm:gap-0 md:mb-8">
              <Form.Item name="remember" valuePropName="checked" noStyle>
                <Checkbox className="text-gray-500 font-bold text-[11px] capitalize">
                  Ghi nhớ tôi
                </Checkbox>
              </Form.Item>
              <Link
                to={ROUTER.FORGOT_PASSWORD}
                alt="Quên mật khẩu"
                className="text-emerald-600 font-bold text-[11px] hover:underline"
              >
                Quên mật khẩu?
              </Link>
            </div>

            <Form.Item className="mb-6 md:mb-8">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="w-full h-12 text-base font-black border-0 shadow-xl md:h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 md:text-lg shadow-emerald-200"
              >
                Đăng nhập ngay
              </Button>
            </Form.Item>

            <Divider plain className="border-gray-100">
              <span className="text-[10px] text-gray-300 font-bold uppercase tracking-[2px]">
                Hoặc sử dụng Google
              </span>
            </Divider>

            <div className="flex justify-center w-full mt-4 md:mt-6">
              <div className="flex justify-center max-w-full mx-auto overflow-hidden">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() =>
                    message.error("Không thể kết nối với máy chủ Google.")
                  }
                  shape="pill"
                  theme="outline"
                  width="280"
                />
              </div>
            </div>
          </Form>

          <div className="mt-12 text-center">
            <Text className="font-medium text-gray-400">
              Bạn chưa có tài khoản?{" "}
            </Text>
            <Link
              to={ROUTER.REGISTER}
              className="px-1 font-black text-emerald-600 hover:underline"
            >
              Đăng ký miễn phí
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center text-[10px] uppercase font-bold tracking-[3px] text-gray-400/50 pointer-events-none">
        Copyright 2026 © EBookFarm Security Standard
      </div>
    </div>
  )
}

export default Login
