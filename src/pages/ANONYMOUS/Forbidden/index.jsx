import React from 'react';
import { Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Leaf, ShieldX } from 'lucide-react';
import ROUTER from 'src/router/ROUTER';

const { Title, Text } = Typography;

const Forbidden = () => {
  const navigate = useNavigate();
  const userInfo = useSelector((state) => state.appGlobal);
  const user = userInfo;

  const handleGoHome = () => {
    if (!user) navigate(ROUTER.LOGIN);
    else if (user.role === 'Admin') navigate(ROUTER.FM_DASHBOARD);
    else navigate(ROUTER.FM_DASHBOARD);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 flex items-center justify-center p-8">
      {/* Decorative background blobs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse delay-700" />

      <div className="relative z-10 text-center max-w-xl">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-green-200">
            <Leaf className="w-9 h-9" />
          </div>
        </div>

        {/* 403 Big number */}
        <div className="relative mb-6">
          <span className="text-[180px] font-black text-transparent bg-clip-text bg-gradient-to-b from-orange-200 to-orange-50 select-none leading-none block">
            403
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/80 backdrop-blur-sm border border-orange-100 rounded-3xl px-8 py-4 shadow-xl">
              <div className="flex justify-center mb-2">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <ShieldX className="w-6 h-6 text-orange-500" />
                </div>
              </div>
              <Title level={4} className="!mb-0 text-orange-600">Truy cập bị từ chối</Title>
            </div>
          </div>
        </div>

        <Text className="text-gray-400 text-lg block mb-3 leading-relaxed">
          Bạn không có quyền truy cập vào trang này.
        </Text>
        <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-2xl px-5 py-3 mb-8">
          <ShieldX className="w-4 h-4 text-orange-400" />
          <Text className="text-orange-500 font-semibold text-sm">
            Đang đăng nhập với quyền: <span className="font-black">{user?.role || 'Khách'}</span>
          </Text>
        </div>

        <div className="flex gap-4 justify-center">
          <Button
            type="primary"
            size="large"
            onClick={handleGoHome}
            className="h-12 px-10 rounded-xl bg-green-600 border-0 font-bold shadow-lg shadow-green-200 hover:bg-green-700"
          >
            Về trang của tôi
          </Button>
          <Button
            size="large"
            onClick={() => navigate(-1)}
            className="h-12 px-8 rounded-xl border-orange-200 text-orange-500 hover:border-orange-400"
          >
            ← Quay lại
          </Button>
        </div>

        <div className="mt-10 p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left">
          <Text className="text-gray-400 text-xs block font-bold uppercase tracking-widest mb-2">
            Tại sao tôi thấy trang này?
          </Text>
          <ul className="space-y-1 text-gray-400 text-sm list-disc list-inside">
            <li>Trang này yêu cầu quyền truy cập đặc biệt</li>
            <li>Tài khoản của bạn không có quyền phù hợp</li>
            <li>Vui lòng liên hệ Quản trị viên để được cấp quyền</li>
          </ul>
        </div>

        <Text className="text-gray-300 text-xs block mt-6 tracking-widest uppercase font-bold">
          EAPLS · Hệ thống Nhật ký Sản xuất
        </Text>
      </div>
    </div>
  );
};

export default Forbidden;
