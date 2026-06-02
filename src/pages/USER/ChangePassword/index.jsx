import React from 'react';
import { Card, Typography, Form, Input, Button, message, Divider, Space, Breadcrumb } from 'antd';
import { LockOutlined, SaveOutlined, HomeOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';

import UserService from 'src/services/UserService'

const { Title, Text, Paragraph } = Typography;

const ChangePassword = () => {
    const [form] = Form.useForm();

    const updateMutation = useMutation({
        mutationFn: (values) => {
            if (values.newPassword !== values.confirmPassword) {
                return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
            }
            return UserService.updateProfile({ 
                currentPassword: values.currentPassword, 
                password: values.newPassword 
            });
        },
        onSuccess: () => {
            message.success('Đổi mật khẩu thành công!');
            form.resetFields();
        },
        onError: (err) => message.error(err.response?.data?.message || err.message || 'Có lỗi xảy ra!')
    });

    return (
        <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-2">
                <Breadcrumb
                    items={[
                        { title: <><HomeOutlined /> Tổng quan</> },
                        { title: <Text type="secondary">Cài đặt tài khoản</Text> },
                        { title: <span className="text-green-600 font-bold">Đổi mật khẩu</span> }
                    ]}
                />
                <Title level={4} className="!mb-0">Bảo mật tài khoản</Title>
            </div>

            <Card bordered={false} className="shadow-sm rounded-[24px] overflow-hidden p-2">
                <div className="p-4 bg-orange-50/50 rounded-2xl mb-8 flex items-start gap-4">
                    <SafetyCertificateOutlined className="text-2xl text-orange-500 mt-1" />
                    <div>
                        <Title level={5} className="!mb-1">Cập nhật mật khẩu định kỳ</Title>
                        <Paragraph className="text-gray-500 text-xs !mb-0 max-w-sm">
                            Để bảo vệ tài khoản của bạn, chúng tôi khuyến nghị thay đổi mật khẩu ít nhất 3 tháng một lần. Hãy sử dụng mật khẩu mạnh bao gồm chữ cái, số và ký hiệu.
                        </Paragraph>
                    </div>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={(values) => updateMutation.mutate(values)}
                    className="px-2"
                >
                    <Form.Item
                        name="currentPassword"
                        label="Mật khẩu hiện tại"
                        rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
                    >
                        <Input.Password
                            prefix={<LockOutlined className="text-gray-400" />}
                            className="h-11 rounded-lg"
                            placeholder="Nhập mật khẩu đang sử dụng"
                        />
                    </Form.Item>

                    <Divider className="my-8" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item
                            name="newPassword"
                            label="Mật khẩu mới"
                            rules={[
                                { required: true, message: 'Nhập mật khẩu mới!' },
                                { min: 6, message: 'Tối thiểu 6 ký tự' }
                            ]}
                        >
                            <Input.Password
                                prefix={<LockOutlined className="text-green-500" />}
                                className="h-11 rounded-lg"
                                placeholder="Mật khẩu mới"
                            />
                        </Form.Item>

                        <Form.Item
                            name="confirmPassword"
                            label="Xác nhận mật khẩu mới"
                            dependencies={['newPassword']}
                            rules={[
                                { required: true, message: 'Xác nhận lại mật khẩu!' },
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
                                prefix={<LockOutlined className="text-green-500" />}
                                className="h-11 rounded-lg"
                                placeholder="Nhập lại mật khẩu mới"
                            />
                        </Form.Item>
                    </div>

                    <div className="flex justify-end mt-8">
                        <Space>
                            <Button className="h-11 px-6 rounded-xl border-gray-100 font-bold" onClick={() => form.resetFields()}>Hủy bỏ</Button>
                            <Button
                                type="primary"
                                icon={<SaveOutlined />}
                                htmlType="submit"
                                loading={updateMutation.isLoading}
                                className="h-11 px-8 rounded-xl premium-gradient border-0 font-bold shadow-lg shadow-green-100"
                            >
                                Cập nhật mật khẩu mới
                            </Button>
                        </Space>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default ChangePassword;
