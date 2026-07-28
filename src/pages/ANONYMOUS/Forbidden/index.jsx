import React from 'react';
import { Button, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ROUTER from 'src/router/ROUTER';

const { Text } = Typography;

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
        {/* 403 Big number */}
        <div className="relative mb-6">
          <span className="text-[180px] font-black text-transparent bg-clip-text bg-gradient-to-b from-green-400 to-green-100 select-none leading-none block">
            403
          </span>

        </div>

        <Text className="text-gray-400 text-lg block mb-3 leading-relaxed">
          Bạn không có quyền truy cập vào trang này.
        </Text>


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
