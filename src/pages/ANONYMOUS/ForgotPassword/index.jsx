import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Alert, Space } from 'antd';
import { MailOutlined, ArrowLeftOutlined, CheckCircleFilled, WarningFilled } from '@ant-design/icons';
import { Link } from 'react-router-dom';

import logo from 'src/assets/logo-ebookfarm.jpg';
import AuthService from 'src/services/AuthService'

const { Title, Text, Paragraph } = Typography;

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      // Backend expects { email }
      await AuthService.forgotPassword({ email: values.email });
      message.success('Yêu cầu đã được gửi! Vui lòng kiểm tra hộp thư của bạn.');
      setIsSent(true);
    } catch (error) {
      message.error(error.response?.data?.message || 'Không tìm thấy tài khoản với Email này.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 md:p-6 bg-slate-50">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-100/50 rounded-full blur-[120px]"></div>
      
      <div className="w-full max-w-[540px] bg-white/70 backdrop-blur-2xl rounded-[32px] md:rounded-[40px] shadow-2xl p-6 sm:p-10 md:p-16 border border-white relative z-10 animate-in fade-in slide-in-from-bottom duration-700">
        
        <div className="flex flex-col items-center mb-6 md:mb-10">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-600 rounded-2xl md:rounded-3xl flex items-center justify-center text-white shadow-xl shadow-emerald-200 mb-4 md:mb-8">
            <MailOutlined className="text-2xl md:text-3xl" />
          </div>
          <Title level={3} className="!font-black !text-gray-800 !mb-1 text-center md:!text-3xl">Quên mật khẩu?</Title>
          <Text className="text-gray-400 font-medium text-center px-4 text-xs md:text-sm">
              Nhập email liên kết với tài khoản của bạn để nhận liên kết đặt lại mật khẩu.
          </Text>
        </div>

        {!isSent ? (
          <Form
            name="forgot-password"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            className="premium-form"
          >
            <Form.Item
              name="email"
              label={<span className="text-[10px] md:text-[11px] uppercase font-black text-gray-400 tracking-wider">Địa chỉ Email của bạn</span>}
              rules={[
                  { required: true, message: 'Vui lòng nhập Email!' },
                  { type: 'email', message: 'Email không hợp lệ!' }
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
                Gửi link khôi phục
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <div className="space-y-8 animate-in zoom-in duration-500">
            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl flex items-start gap-4 text-left">
               <CheckCircleFilled className="text-emerald-500 text-2xl mt-1" />
               <div>
                   <Text className="text-emerald-900 font-bold block mb-1 text-lg">Kiểm tra Email của bạn</Text>
                   <Text className="text-emerald-700/80 leading-relaxed font-medium">
                       Hệ thống đã gửi hướng dẫn khôi phục mật khẩu vào hòm thư của bạn. Vui lòng kiểm tra cả thư rác (Spam) nếu không thấy.
                   </Text>
               </div>
            </div>

            <Alert
              message="Thời hạn liên kết"
              description="Link khôi phục chỉ có hiệu lực trong vòng 10 phút vì lý do bảo mật. Sau thời gian này bạn cần thực hiện yêu cầu mới."
              type="info"
              showIcon
              className="rounded-2xl border-blue-50 bg-blue-50/50 text-left"
            />
          </div>
        )}

        <div className="mt-12 text-center">
            <Link to="/login" className="flex items-center justify-center gap-2 text-emerald-600 font-black hover:underline group">
              <ArrowLeftOutlined className="group-hover:-translate-x-1 transition-transform" /> 
              Quay lại Đăng nhập
            </Link>
        </div>
      </div>

      <div className="absolute bottom-8 text-[10px] uppercase font-bold tracking-[3px] text-gray-400/50 pointer-events-none w-full text-center">
        EBookFarm identity protection system
      </div>
    </div>
  );
};

export default ForgotPassword;
