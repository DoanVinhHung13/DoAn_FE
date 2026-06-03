import React from 'react';
import { Form, Input, Button, message, Typography, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, RocketFilled, SafetyCertificateFilled } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { StoreContext } from 'src/contexts';
import { useAppDispatch } from 'src/redux/hooks';
import { setUserInfo } from 'src/redux/slices/appGlobalSlice';
import STORAGE, { setStorage } from 'src/lib/storage';

import logo from 'src/assets/logo-ebookfarm.jpg';
import AuthService from 'src/services/AuthService'
import ROUTER from 'src/router/ROUTER'

const { Title, Text, Paragraph } = Typography;

const Register = () => {
  const navigate = useNavigate();
  const { loginStore } = useContext(StoreContext);
  const { setIsLoginContext } = loginStore;
  const dispatch = useAppDispatch();
  const setCredentials = (user, token) => {
    setStorage(STORAGE.TOKEN, token);
    dispatch(setUserInfo(user));
    setIsLoginContext(true);
  };
  const [loading, setLoading] = React.useState(false);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      const { data } = await AuthService.register({
          ...values,
          role: 'Farmer' // Default role for public registration
      });
      setCredentials(data.data, data.data.token);
      navigate(ROUTER.FM_DASHBOARD);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 md:p-6 bg-slate-50">
      {/* Dynamic Background */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-100/50 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-green-100/40 rounded-full blur-[100px]"></div>
      
      <div className="w-full max-w-[1000px] flex flex-col md:flex-row-reverse bg-white/70 backdrop-blur-2xl rounded-[32px] md:rounded-[40px] shadow-2xl overflow-hidden border border-white relative z-10 animate-in fade-in zoom-in duration-700">
        
        {/* Side Banner: Benefits */}
        <div className="hidden md:flex md:w-5/12 bg-emerald-600 p-12 flex-col justify-between relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-green-800"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full -ml-20 -mb-20 blur-3xl"></div>
            
            <div className="relative z-10">
                <Title level={1} className="!text-white !font-black !text-4xl !mb-8 leading-tight">
                    Bắt đầu hành trình nông nghiệp số
                </Title>
                
                <div className="space-y-8">
                    <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                            <RocketFilled className="text-white text-lg" />
                        </div>
                        <div>
                            <Text className="text-white font-bold block mb-1">Thiết lập nhanh</Text>
                            <Text className="text-emerald-50/60 text-xs">Chỉ mất 2 phút để bắt đầu quản lý nông trại đầu tiên của bạn.</Text>
                        </div>
                    </div>
                    <div className="flex gap-4 items-start">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                            <SafetyCertificateFilled className="text-white text-lg" />
                        </div>
                        <div>
                            <Text className="text-white font-bold block mb-1">Chuẩn TCVN/VietGAP</Text>
                            <Text className="text-emerald-50/60 text-xs">Phần mềm tuân thủ nghiêm ngặt các tiêu chuẩn nông nghiệp sạch.</Text>
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative z-10 bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 text-center">
                <Text className="text-white/80 text-xs font-medium italic">
                    "EBookFarm giúp chúng tôi chuyên nghiệp hóa quy trình sản xuất và nâng cao giá trị thương phẩm."
                </Text>
            </div>
        </div>

        {/* Form Content */}
        <div className="w-full md:w-7/12 p-5 sm:p-10 md:p-16 flex flex-col justify-center bg-white/40">
            <div className="mb-4 md:mb-8">
                <Link to="/" className="hidden md:flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity cursor-pointer">
                    <div className="w-14 h-14 rounded-2xl bg-white shadow-lg flex items-center justify-center overflow-hidden border border-gray-100 p-2">
                        <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                    </div>
                    <Text className="font-black text-2xl text-gray-800 tracking-tighter uppercase">EBookFarm</Text>
                </Link>
                {/* Mobile Logo */}
                <div className="block md:hidden mb-4">
                    <Link to="/">
                        <img src={logo} alt="Logo" className="h-8 w-auto mb-4 cursor-pointer hover:opacity-80 transition-opacity" />
                    </Link>
                </div>
                <Title level={3} className="!font-black !text-gray-800 !mb-1 md:!text-3xl">Tạo tài khoản</Title>
                <Text className="text-gray-400 font-medium text-xs md:text-sm">Bắt đầu miễn phí ngay hôm nay</Text>
            </div>

            <Form
                name="register"
                layout="vertical"
                size="large"
                onFinish={onFinish}
                className="premium-form"
            >
                <Row gutter={[12, 0]}>
                    <Col span={24}>
                        <Form.Item
                            name="fullname"
                            label={<span className="text-[10px] md:text-[11px] uppercase font-black text-gray-400 tracking-wider">Họ và tên chủ sở hữu</span>}
                            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                            className="mb-3 md:mb-6"
                        >
                            <Input 
                                placeholder="Nguyễn Văn A" 
                                className="rounded-xl h-11 md:h-14 border-gray-100 hover:border-emerald-400 focus:border-emerald-500 transition-all font-medium text-sm md:text-base"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="username"
                            label={<span className="text-[10px] md:text-[11px] uppercase font-black text-gray-400 tracking-wider">Tên tài khoản</span>}
                            rules={[{ required: true, message: 'Vui lòng nhập tên tài khoản!' }]}
                            className="mb-3 md:mb-6"
                        >
                            <Input 
                                prefix={<UserOutlined className="text-gray-300" />} 
                                placeholder="nva_farm" 
                                className="rounded-xl h-11 md:h-14 border-gray-100 text-sm md:text-base"
                            />
                        </Form.Item>
                    </Col>
                    <Col xs={24} sm={12}>
                        <Form.Item
                            name="email"
                            label={<span className="text-[10px] md:text-[11px] uppercase font-black text-gray-400 tracking-wider">Địa chỉ Email</span>}
                            rules={[
                                { required: true, message: 'Email là bắt buộc!' },
                                { type: 'email', message: 'Email không hợp lệ!' }
                            ]}
                            className="mb-3 md:mb-6"
                        >
                            <Input 
                                prefix={<MailOutlined className="text-gray-300" />} 
                                placeholder="example@gmail.com" 
                                className="rounded-xl h-11 md:h-14 border-gray-100 text-sm md:text-base"
                            />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item
                            name="password"
                            label={<span className="text-[10px] md:text-[11px] uppercase font-black text-gray-400 tracking-wider">Thiết lập mật khẩu</span>}
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu!' },
                                { min: 6, message: 'Mật khẩu phải từ 6 ký tự' }
                            ]}
                            className="mb-4 md:mb-8"
                        >
                            <Input.Password 
                                prefix={<LockOutlined className="text-gray-300" />} 
                                placeholder="••••••••" 
                                className="rounded-xl h-11 md:h-14 border-gray-100 text-sm md:text-base"
                            />
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item className="mt-2 mb-6 md:mb-8">
                    <Button 
                        type="primary" 
                        htmlType="submit" 
                        loading={loading}
                        className="w-full h-11 md:h-14 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-black text-base md:text-lg border-0 shadow-xl shadow-emerald-200"
                    >
                        Tạo tài khoản ngay
                    </Button>
                </Form.Item>
            </Form>

            <div className="text-center">
                <Text className="text-gray-400 font-medium text-xs sm:text-sm">Bạn đã có tài khoản? </Text>
                <Link to="/login" className="text-emerald-600 font-black hover:underline px-1 text-xs sm:text-sm">
                    Đăng nhập tại đây
                </Link>
            </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-0 right-0 text-center text-[10px] uppercase font-bold tracking-[3px] text-gray-400/50 pointer-events-none">
        Digital Agriculture Transformation Initiative
      </div>
    </div>
  );
};

export default Register;
