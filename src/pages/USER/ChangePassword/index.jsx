import React from 'react';
import { Card, Form, Input, Button, Divider, Space } from 'antd';
import { LockOutlined, SaveOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';

import notice from 'src/components/Notice'
import AuthService from 'src/services/AuthService'
import authSession from 'src/redux/authSession'
import { useAppDispatch } from 'src/redux/hooks'
import { setUserInfo } from 'src/redux/slices/appGlobalSlice'
import { useNavigate } from 'react-router-dom'
import ROUTER from 'src/router/ROUTER'
import TitleCustom from 'src/components/TitleCustom';

const ChangePassword = () => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const updateMutation = useMutation({
        mutationFn: async (values) => {
            if (values.newPassword !== values.confirmPassword) {
                notice({ msg: 'Mật khẩu xác nhận không khớp!', isSuccess: false });
                throw new Error('Mật khẩu xác nhận không khớp!');
            }
            const res = await AuthService.changePassword({
                currentPassword: values.currentPassword,
                newPassword: values.newPassword,
                confirmNewPassword: values.confirmPassword,
            });
            if (!res?.success) {
                throw new Error(res?.message || res?.errors?.[0] || 'Đổi mật khẩu thất bại');
            }
            return res;
        },
        onSuccess: () => {
            form.resetFields();
            authSession.clearSession();
            dispatch(setUserInfo({}));
            navigate(ROUTER.LOGIN);
        },
    });

    return (
        <div className="">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <TitleCustom level={4} className="!mb-0">Đổi mật khẩu</TitleCustom>
            </div>

            <Card bordered={false} className="shadow-sm rounded-[24px] overflow-hidden p-2">


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
                                { min: 6, message: 'Tối thiểu 6 ký tự' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('currentPassword') !== value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Mật khẩu mới không được trùng với mật khẩu hiện tại!'));
                                    },
                                }),
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
                                loading={updateMutation.isPending || updateMutation.isLoading}
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
