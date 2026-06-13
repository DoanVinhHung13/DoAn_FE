import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message, Typography, Alert, Steps } from 'antd';
import {
  MailOutlined, ArrowLeftOutlined, CheckCircleFilled,
  LockOutlined, SafetyCertificateOutlined, ArrowRightOutlined,
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';

import AuthService from 'src/services/AuthService';
import ROUTER from 'src/router/ROUTER';

const { Title, Text } = Typography;

const STEPS = { EMAIL: 0, OTP: 1, PASSWORD: 2, SUCCESS: 3 };
const OTP_LENGTH = 6;
const OTP_EXPIRE_SECONDS = 5 * 60;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return undefined;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const formatCountdown = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleApiError = (error, fallback) => {
    message.error(error?.message || fallback);
  };

  const handleSendOtp = async (values) => {
    try {
      setLoading(true);
      const res = await AuthService.forgotPassword({ email: values.email });
      if (res?.success === false) {
        throw new Error(res?.message || res?.errors?.[0] || 'Không tìm thấy tài khoản với Email này.');
      }
      setEmail(values.email);
      setOtp('');
      setCountdown(OTP_EXPIRE_SECONDS);
      setCurrentStep(STEPS.OTP);
    } catch (error) {
      handleApiError(error, 'Không tìm thấy tài khoản với Email này.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (countdown > 0) return;
    try {
      setLoading(true);
      const res = await AuthService.forgotPassword({ email });
      if (res?.success === false) {
        throw new Error(res?.message || res?.errors?.[0] || 'Không thể gửi lại mã OTP.');
      }
      setOtp('');
      setCountdown(OTP_EXPIRE_SECONDS);
    } catch (error) {
      handleApiError(error, 'Không thể gửi lại mã OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== OTP_LENGTH) {
      message.error('Vui lòng nhập đủ 6 chữ số OTP.');
      return;
    }
    try {
      setLoading(true);
      const res = await AuthService.verifyOTP({ email, otp });
      if (res?.success === false) {
        throw new Error(res?.message || res?.errors?.[0] || 'Mã OTP không hợp lệ hoặc đã hết hạn.');
      }
      setCurrentStep(STEPS.PASSWORD);
    } catch (error) {
      handleApiError(error, 'Mã OTP không hợp lệ hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (values) => {
    try {
      setLoading(true);
      const res = await AuthService.resetPassword({
        email,
        otp,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmNewPassword,
      });
      if (res?.success === false) {
        throw new Error(res?.message || res?.errors?.[0] || 'Đặt lại mật khẩu thất bại.');
      }
      setCurrentStep(STEPS.SUCCESS);
    } catch (error) {
      handleApiError(error, 'Đặt lại mật khẩu thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const stepIcons = [
    <MailOutlined className="text-2xl md:text-3xl" />,
    <SafetyCertificateOutlined className="text-2xl md:text-3xl" />,
    <LockOutlined className="text-2xl md:text-3xl" />,
  ];

  const stepTitles = ['Nhập email', 'Xác minh OTP', 'Mật khẩu mới'];
  const stepDescriptions = [
    'Nhập email liên kết với tài khoản để nhận mã OTP.',
    'Nhập mã OTP 6 chữ số đã được gửi đến email của bạn.',
    'Thiết lập mật khẩu mới cho tài khoản của bạn.',
  ];

  const renderStepContent = () => {
    if (currentStep === STEPS.SUCCESS) {
      return (
        <div className="space-y-8 animate-in zoom-in duration-500">
          <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex items-start gap-4 text-left">
            <CheckCircleFilled className="text-emerald-500 text-2xl mt-1" />
            <div>
              <Text className="text-emerald-900 font-bold block mb-1 text-lg">Đặt lại mật khẩu thành công</Text>
              <Text className="text-emerald-700/80 leading-relaxed font-medium">
                Mật khẩu mới đã được kích hoạt. Vui lòng đăng nhập lại bằng mật khẩu mới.
              </Text>
            </div>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<ArrowRightOutlined />}
            className="w-full h-12 md:h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-black text-base md:text-lg border-0 shadow-xl shadow-emerald-200"
            onClick={() => navigate(ROUTER.LOGIN)}
          >
            Đăng nhập ngay
          </Button>
        </div>
      );
    }

    if (currentStep === STEPS.EMAIL) {
      return (
        <Form
          form={form}
          name="forgot-password-email"
          onFinish={handleSendOtp}
          layout="vertical"
          size="large"
          className="premium-form"
          initialValues={{ email }}
        >
          <Form.Item
            name="email"
            label={<span className="text-[10px] md:text-[11px] uppercase font-black text-gray-400 tracking-wider">Địa chỉ Email của bạn</span>}
            rules={[
              { required: true, message: 'Vui lòng nhập Email!' },
              { type: 'email', message: 'Email không hợp lệ!' },
            ]}
            className="mb-6 md:mb-10"
          >
            <Input
              prefix={<MailOutlined className="text-gray-300" />}
              placeholder="example@farm.com"
              className="rounded-xl h-12 md:h-14 border-gray-100 focus:border-emerald-500 text-sm md:text-base"
            />
          </Form.Item>
          <Form.Item className="mb-0">
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              className="w-full h-12 md:h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-black text-base md:text-lg border-0 shadow-xl shadow-emerald-200"
            >
              Gửi mã OTP
            </Button>
          </Form.Item>
        </Form>
      );
    }

    if (currentStep === STEPS.OTP) {
      return (
        <div className="space-y-6">
          <Alert
            message={`Mã OTP đã gửi đến ${email}`}
            description={
              countdown > 0
                ? `Mã có hiệu lực trong ${formatCountdown(countdown)}.`
                : 'Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.'
            }
            type="info"
            showIcon
            className="rounded-2xl border-blue-50 bg-blue-50/50 text-left"
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
            onClick={handleVerifyOtp}
            className="w-full h-12 md:h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-black text-base md:text-lg border-0 shadow-xl shadow-emerald-200"
          >
            Xác minh OTP
          </Button>
          <div className="flex items-center justify-between gap-3">
            <Button
              type="link"
              className="!px-0 text-gray-500 font-semibold"
              onClick={() => setCurrentStep(STEPS.EMAIL)}
            >
              Đổi email
            </Button>
            <Button
              type="link"
              className="!px-0 text-emerald-600 font-semibold"
              disabled={countdown > 0}
              loading={loading}
              onClick={handleResendOtp}
            >
              {countdown > 0 ? `Gửi lại sau ${formatCountdown(countdown)}` : 'Gửi lại mã OTP'}
            </Button>
          </div>
        </div>
      );
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
          label={<span className="text-[10px] md:text-[11px] uppercase font-black text-gray-400 tracking-wider">Mật khẩu mới</span>}
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
            { min: 6, message: 'Mật khẩu phải từ 6 ký tự trở lên' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-300" />}
            placeholder="••••••••"
            className="rounded-xl h-12 md:h-14 border-gray-100 focus:border-emerald-500"
          />
        </Form.Item>
        <Form.Item
          name="confirmNewPassword"
          label={<span className="text-[10px] md:text-[11px] uppercase font-black text-gray-400 tracking-wider">Xác nhận mật khẩu</span>}
          dependencies={['newPassword']}
          rules={[
            { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-gray-300" />}
            placeholder="••••••••"
            className="rounded-xl h-12 md:h-14 border-gray-100 focus:border-emerald-500"
          />
        </Form.Item>
        <Form.Item className="mb-0">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="w-full h-12 md:h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-black text-base md:text-lg border-0 shadow-xl shadow-emerald-200"
          >
            Đặt lại mật khẩu
          </Button>
        </Form.Item>
      </Form>
    );
  };

  const activeIconIndex = Math.min(currentStep, STEPS.PASSWORD);

  return (
    <div>
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-50 w-full">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-100/50 rounded-full blur-[120px]" />

        <div className="w-full max-w-[540px] bg-white/70 backdrop-blur-2xl rounded-[32px] md:rounded-[40px] shadow-2xl p-6 sm:p-10 md:p-16 border border-white relative z-10 animate-in fade-in slide-in-from-bottom duration-700">
          <div className="flex flex-col items-center mb-6 md:mb-8">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-600 rounded-2xl md:rounded-3xl flex items-center justify-center text-white shadow-xl shadow-emerald-200 mb-4 md:mb-6">
              {currentStep === STEPS.SUCCESS
                ? <CheckCircleFilled className="text-2xl md:text-3xl" />
                : stepIcons[activeIconIndex]}
            </div>
            <Title level={3} className="!font-black !text-gray-800 !mb-1 text-center md:!text-3xl">
              {currentStep === STEPS.SUCCESS ? 'Hoàn tất!' : 'Quên mật khẩu?'}
            </Title>
            {currentStep !== STEPS.SUCCESS && (
              <Text className="text-gray-400 font-medium text-center px-4 text-xs md:text-sm">
                {stepDescriptions[activeIconIndex]}
              </Text>
            )}
          </div>

          {currentStep !== STEPS.SUCCESS && (
            <Steps
              current={activeIconIndex}
              size="small"
              className="mb-8"
              items={stepTitles.map((title) => ({ title }))}
            />
          )}

          {renderStepContent()}

          {currentStep !== STEPS.SUCCESS && (
            <div className="mt-12 text-center">
              <Link to={ROUTER.LOGIN} className="flex items-center justify-center gap-2 text-emerald-600 font-black hover:underline group">
                <ArrowLeftOutlined className="group-hover:-translate-x-1 transition-transform" />
                Quay lại Đăng nhập
              </Link>
            </div>
          )}
        </div>

        <div className="absolute bottom-8 text-[10px] uppercase font-bold tracking-[3px] text-gray-400/50 pointer-events-none w-full text-center">
          EBookFarm identity protection system
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
