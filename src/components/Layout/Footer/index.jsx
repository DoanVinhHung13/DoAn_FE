import React from 'react';
import { Row, Col, Typography, Space, Divider } from 'antd';
import { GlobalOutlined, ThunderboltFilled, EnvironmentOutlined, PhoneOutlined, MailOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from 'src/redux/hooks';
import { setUserInfo } from 'src/redux/slices/appGlobalSlice';
import { clearAuthStorage } from 'src/redux/storage';
import { useSelector } from 'react-redux';
import logo from 'src/assets/images/logo/logo-eapls.jpg';
import ROUTER from 'src/router/ROUTER';

const { Text, Paragraph } = Typography;

const PublicFooter = () => {
    const navigate = useNavigate();
    // Dùng Redux làm nguồn duy nhất
    const { userInfo } = useSelector((state) => state.appGlobal);
    const isLoggedIn = Boolean(userInfo?._id);
    const dispatch = useAppDispatch();

    const logout = () => {
        clearAuthStorage();
        dispatch(setUserInfo({}));
    };

    const handleDashboardClick = () => {
        navigate(ROUTER.FM_DASHBOARD);
    };

    return (
        <footer className="bg-gray-900 text-white py-16 px-6">
            <div className="max-w-7xl mx-auto">
                <Row gutter={[48, 48]}>
                    {/* Company Info */}
                    <Col xs={24} md={8} className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-10 h-10 overflow-hidden bg-white border rounded-full shadow-sm border-gray-50">
                                <img src={logo} alt="EAPLS Logo" className="w-[140%] h-[140%] object-contain mix-blend-multiply" />
                            </div>
                            <div className="flex flex-col justify-center">
                                <span className="text-green-400 font-extrabold text-[14px] leading-[1.1] uppercase tracking-tight">Nhật ký sản xuất</span>
                                <span className="text-green-400 font-bold text-[14px] leading-[1.1] uppercase tracking-tight">Điện tử</span>
                            </div>
                        </div>
                        <Paragraph className="text-gray-400 max-w-sm leading-relaxed">
                            Hệ thống số hóa nhật ký canh tác & truy xuất nguồn gốc nông sản. Giúp trang trại và hợp tác xã quản lý toàn bộ quy trình sản xuất minh bạch và hiệu quả.
                        </Paragraph>

                        <div className="space-y-3 pt-4">
                            <div className="flex items-center gap-3 text-gray-400 hover:text-green-400 transition-colors">
                                <SafetyCertificateOutlined className="text-lg" />
                                <Text className="text-gray-400">Giấy phép ĐKKD: 0123456789</Text>
                            </div>
                            <div className="flex items-center gap-3 text-gray-400 hover:text-green-400 transition-colors">
                                <SafetyCertificateOutlined className="text-lg" />
                                <Text className="text-gray-400">Ngày cấp: 01/01/2020</Text>
                            </div>
                        </div>
                    </Col>

                    {/* Office Locations */}
                    <Col xs={24} md={8} className="space-y-6">
                        <Text strong className="text-white block uppercase tracking-widest text-xs mb-4">Văn phòng</Text>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Text strong className="text-green-400 block text-sm">Địa chỉ đăng ký</Text>
                                <div className="flex items-start gap-2 text-gray-400">
                                    <EnvironmentOutlined className="text-base mt-1 shrink-0" />
                                    <Text className="text-gray-200 text-sm leading-relaxed">
                                        Căn số 13 tổ 49 trường NT Nguyễn Viết Xuân, phường Yên Hòa, quận Cầu Giấy, TP Hà Nội
                                    </Text>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Text strong className="text-green-400 block text-sm">Văn phòng giao dịch</Text>
                                <div className="flex items-start gap-2 text-gray-400">
                                    <EnvironmentOutlined className="text-base mt-1 shrink-0" />
                                    <Text className="text-gray-200 text-sm leading-relaxed">
                                        Số 19 phố Liễu Giai, phường Liễu Giai, quận Ba Đình, thành phố Hà Nội
                                    </Text>
                                </div>
                            </div>
                        </div>
                    </Col>

                    {/* Quick Links & Contact */}
                    <Col xs={24} md={8}>
                        <div className="grid grid-cols-1 gap-8">
                            <div className="space-y-4">
                                <Text strong className="text-white block uppercase tracking-widest text-xs">Liên kết nhanh</Text>
                                <Space direction="vertical" className="text-gray-200">
                                    {isLoggedIn ? (
                                        <Text className="text-gray-200 hover:text-green-400 cursor-pointer transition-colors" onClick={handleDashboardClick}>
                                            Vào bảng điều khiển
                                        </Text>
                                    ) : (
                                        <Text className="text-gray-200 hover:text-green-400 cursor-pointer transition-colors" onClick={() => navigate(ROUTER.LOGIN)}>
                                            Đăng nhập
                                        </Text>
                                    )}
                                    {isLoggedIn ? (
                                        <Text className="text-red-400 hover:text-red-300 cursor-pointer transition-colors" onClick={() => { logout(); navigate(ROUTER.HOME); }}>
                                            Đăng xuất
                                        </Text>
                                    ) : null}
                                    {/* <Text className="text-gray-200 hover:text-green-400 cursor-pointer transition-colors" onClick={() => navigate(ROUTER.REGISTER)}>
                                        Đăng ký
                                    </Text> */}
                                    <Text className="text-gray-200 hover:text-green-400 cursor-pointer transition-colors">
                                        Hướng dẫn sử dụng
                                    </Text>
                                </Space>
                            </div>

                            <div className="space-y-4">
                                <Text strong className="text-white block uppercase tracking-widest text-xs">Liên hệ</Text>
                                <Space direction="vertical" className="text-gray-200">
                                    <div className="flex items-center gap-2 text-gray-200 hover:text-green-400 transition-colors">
                                        <PhoneOutlined />
                                        <Text className="text-gray-200">Hotline: 02462730.818</Text>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-200 hover:text-green-400 transition-colors">
                                        <MailOutlined />
                                        <Text className="text-gray-200">tuvansct@gmail.com</Text>
                                    </div>
                                </Space>
                            </div>
                        </div>
                    </Col>
                </Row>

                <Divider className="my-12 border-gray-700" />

                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="space-y-2 text-center md:text-left">
                        <Text className="text-gray-400 text-xs block">
                            © 2026 EAPLS. Tất cả quyền được bảo lưu.
                        </Text>
                        <Text className="text-gray-500 text-xs block">
                            Minh bạch - Chuẩn hóa - Tin cậy - Nhật ký sản xuất điện tử
                        </Text>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default PublicFooter;
