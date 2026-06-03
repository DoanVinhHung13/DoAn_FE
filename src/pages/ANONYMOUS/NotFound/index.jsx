import React from 'react';
import { Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Leaf } from 'lucide-react';
import ROUTER from 'src/router/ROUTER';

const { Title, Text } = Typography;

const NotFound = () => {
  const navigate = useNavigate();
  const userInfo = useSelector((state) => state.appGlobal);
  const user = userInfo;

  const handleGoHome = () => {
    if (!user) navigate(ROUTER.LOGIN);
    else if (user.role === 'Admin') navigate(ROUTER.FM_DASHBOARD);
    else navigate(ROUTER.HOME);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center p-8">
      {/* Decorative background blobs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-green-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse delay-1000" />

      <div className="relative z-10 text-center max-w-xl">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-green-200">
            <Leaf className="w-9 h-9" />
          </div>
        </div>

        {/* 404 Big number */}
        <div className="relative mb-6">
          <span className="text-[180px] font-black text-transparent bg-clip-text bg-gradient-to-b from-green-200 to-green-50 select-none leading-none block">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/80 backdrop-blur-sm border border-green-100 rounded-3xl px-8 py-4 shadow-xl">
              <Text className="text-4xl">🌿</Text>
              <Title level={4} className="!mb-0 !mt-2 text-green-700">Trang không tồn tại</Title>
            </div>
          </div>
        </div>

        <Text className="text-gray-400 text-lg block mb-8 leading-relaxed">
          Có vẻ như trang bạn đang tìm kiếm đã bị di chuyển,<br />
          bị xóa, hoặc chưa bao giờ tồn tại.
        </Text>

        <div className="flex gap-4 justify-center">
          <Button
            type="primary"
            size="large"
            onClick={handleGoHome}
            className="h-12 px-10 rounded-xl bg-green-600 border-0 font-bold shadow-lg shadow-green-200 hover:bg-green-700"
          >
            Về trang chính
          </Button>
          <Button
            size="large"
            onClick={() => navigate(-1)}
            className="h-12 px-8 rounded-xl border-green-200 text-green-600 hover:border-green-400"
          >
            ← Quay lại
          </Button>
        </div>

        <Text className="text-gray-300 text-xs block mt-10 tracking-widest uppercase font-bold">
          EBookFarm · Hệ thống Nhật ký Sản xuất
        </Text>
      </div>
    </div>
  );
};

export default NotFound;
