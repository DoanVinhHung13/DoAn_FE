import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Result } from 'antd';
import { LockOutlined, CheckCircleFilled, ArrowRightOutlined } from '@ant-design/icons';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from 'src/services/01_axios';

const { Title, Text, Paragraph } = Typography;

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      await api.put(`/auth/reset-password/${token}`, { password: values.password });
      message.success('Mật khẩu của bạn đã được cập nhật thành công!');
      setSuccess(true);
    } catch (error) {
      message.error(error.response?.data?.message || 'Link khôi phục không hợp lệ hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-100/50 rounded-full blur-[120px]"></div>
        <Card className="w-full max-w-[540px] shadow-2xl rounded-[40px] p-12 text-center border-white bg-white/70 backdrop-blur-2xl relative z-10 animate-in zoom-in duration-500">
            <Result
                status="success"
                title={<Title level={2} className="!font-black !text-gray-800 !mb-2">Thủ tục hoàn tất!</Title>}
                subTitle={<Text className="text-gray-500 font-medium">Mật khẩu mới đã được kích hoạt. Hãy bảo mật thông tin này cẩn thận.</Text>}
                extra={[
                    <Button 
                        type="primary" 
                        key="login" 
                        size="large" 
                        className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black text-lg border-0 shadow-xl shadow-emerald-200" 
                        onClick={() => navigate('/login')}
                        icon={<ArrowRightOutlined />}
                    >
                        Đăng nhập ngay
                    </Button>,
                ]}
            />
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-6 bg-slate-50">
      {/* Background Decor */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-100/50 rounded-full blur-[120px]"></div>
      
      <div className="w-full max-w-[540px] bg-white/70 backdrop-blur-2xl rounded-[40px] shadow-2xl p-10 md:p-16 border border-white relative z-10 animate-in fade-in slide-in-from-bottom duration-700">
        
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-emerald-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-emerald-200 mb-8">
            <LockOutlined className="text-3xl" />
          </div>
          <Title level={2} className="!font-black !text-gray-800 !mb-2 text-center">Đặt lại mật khẩu</Title>
          <Text className="text-gray-400 font-medium text-center px-4">
              Xác lập mật khẩu mới cực kỳ bảo mật cho tài khoản EBookFarm của bạn.
          </Text>
        </div>

        <Form
          name="reset-password"
          onFinish={onFinish}
          layout="vertical"
          size="large"
          className="premium-form"
        >
          <Form.Item
            name="password"
            label={<span className="text-[11px] uppercase font-black text-gray-400 tracking-wider">Mật khẩu mới</span>}
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
              { min: 6, message: 'Mật khẩu phải từ 6 ký tự trở lên' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined className="text-gray-300" />} 
              placeholder="••••••••" 
              className="rounded-2xl h-14 border-gray-100 focus:border-emerald-500"
            />
          </Form.Item>

          <Form.Item
            name="confirm"
            label={<span className="text-[11px] uppercase font-black text-gray-400 tracking-wider">Xác nhận lại mật khẩu</span>}
            dependencies={['password']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
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
              className="rounded-2xl h-14 border-gray-100 focus:border-emerald-500"
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <Button 
                type="primary" 
                htmlType="submit" 
                className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 font-black text-lg border-0 shadow-xl shadow-emerald-200" 
                loading={loading}
            >
              Cập nhật mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </div>

      <div className="absolute bottom-8 text-[10px] uppercase font-bold tracking-[3px] text-gray-400/50 pointer-events-none w-full text-center">
        Secured by EBookFarm Cryptographic Standard
      </div>
    </div>
  );
};

export default ResetPassword;
