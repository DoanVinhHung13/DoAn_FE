import React, { useState } from 'react';
import { Modal, Form, Input, Button, message, Alert, Typography, Divider } from 'antd';
import { LockOutlined, KeyOutlined, SafetyOutlined } from '@ant-design/icons';
import api from 'src/services/01_axios';
import { useAppDispatch } from 'src/redux/hooks';
import { setUserInfo } from 'src/redux/slices/appGlobalSlice';

const { Title, Text } = Typography;

const ForceChangePasswordModal = ({ visible, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();


  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const response = await api.put('/auth/force-change-password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      if (response.data.success) {
        message.success('Đổi mật khẩu thành công! Bạn có thể sử dụng hệ thống ngay bây giờ.');
        
        // Update user in Redux to clear mustChangePassword flag
        dispatch(setUserInfo(response.data.data));
        
        form.resetFields();
        onSuccess();
      }
    } catch (error) {
      message.error(error.response?.data?.message || 'Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      footer={null}
      closable={false}
      maskClosable={false}
      width={480}
      centered
      className="force-password-modal"
      modalRender={(modal) => (
        <div className="relative">
          {/* Decorative Background Elements */}
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-green-500/20 rounded-full blur-3xl"></div>
          {modal}
        </div>
      )}
    >
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 rounded-2xl mb-4 shadow-inner">
          <SafetyOutlined className="text-3xl text-emerald-600 animate-bounce" />
        </div>
        <Title level={3} className="!mb-1 !font-black !text-gray-800 uppercase tracking-tighter">Bảo mật tài khoản</Title>
        <Text className="text-gray-400 font-medium italic">Chào mừng bạn gia nhập cộng đồng EBookFarm</Text>
      </div>

      <Alert
        message={<span className="font-bold text-orange-800">Yêu cầu thay đổi mật khẩu</span>}
        description={<span className="text-xs text-orange-700/80">Tài khoản này vừa được khởi tạo. Để bảo vệ dữ liệu nông nghiệp của bạn, vui lòng thiết lập mật khẩu cá nhân mới.</span>}
        type="warning"
        showIcon
        className="mb-8 rounded-2xl border-orange-100 bg-orange-50/50"
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
        className="premium-form"
      >
        <Form.Item
          name="currentPassword"
          label={<span className="text-[11px] uppercase font-black text-gray-400 tracking-wider">Mật khẩu khởi tạo</span>}
          rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại' }]}
        >
          <Input.Password
            prefix={<LockOutlined className="text-emerald-500" />}
            placeholder="Nhập mật khẩu Admin đã cấp"
            size="large"
            className="rounded-2xl h-12 border-gray-100 hover:border-emerald-400 focus:border-emerald-500 transition-all shadow-sm"
          />
        </Form.Item>

        <Divider className="my-6"><span className="text-[10px] text-gray-300 uppercase font-bold tracking-[4px]">Thiết lập mới</span></Divider>

        <Form.Item
          name="newPassword"
          label={<span className="text-[11px] uppercase font-black text-gray-400 tracking-wider">Mật khẩu mới</span>}
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu mới' },
            { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' }
          ]}
          hasFeedback
        >
          <Input.Password
            prefix={<KeyOutlined className="text-emerald-500" />}
            placeholder="Mật khẩu riêng tư của bạn"
            size="large"
            className="rounded-2xl h-12 border-gray-100"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label={<span className="text-[11px] uppercase font-black text-gray-400 tracking-wider">Xác nhận lại</span>}
          dependencies={['newPassword']}
          hasFeedback
          rules={[
            { required: true, message: 'Vui lòng xác nhận lại mật khẩu' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Mật khẩu không khớp!'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<KeyOutlined className="text-emerald-500" />}
            placeholder="Nhập lại mật khẩu mới"
            size="large"
            className="rounded-2xl h-12 border-gray-100"
          />
        </Form.Item>

        <div className="mt-8">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            block
            className="rounded-2xl h-14 font-black text-lg bg-emerald-600 hover:bg-emerald-700 border-0 shadow-xl shadow-emerald-100 flex items-center justify-center gap-2 group"
          >
            <span>Bắt đầu sử dụng</span>
            <LockOutlined className="group-hover:rotate-12 transition-transform" />
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default ForceChangePasswordModal;
