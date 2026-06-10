/**
 * AccountInfo — Hồ sơ cá nhân (dùng chung cho mọi role)
 *
 * Mapping field từ API /auth/me (và PUT /users/me/profile):
 *   fullName      → form field "fullName"
 *   phoneNumber   → form field "phoneNumber"
 *   dateOfBirth   → form field "dateOfBirth"
 *   avatarUrl     → avatarUrl state
 *   email         → hiển thị, readonly
 *   roles         → hiển thị role[0]
 *
 * PUT /users/me/profile chỉ chấp nhận: { fullName, phoneNumber, dateOfBirth }
 * Các trường mở rộng (address, farmName...) lưu local-only / future BE support
 */
import React, { useState, useEffect } from 'react';
import {
    Card, Typography, Form, Input, Button, Avatar, Space,
    message, Divider, Row, Col, Select, DatePicker, Upload, Tag, Spin, Modal, Tooltip
} from 'antd';
import {
    UserOutlined, MailOutlined, HomeOutlined, SaveOutlined, PhoneOutlined,
    EnvironmentOutlined, EditOutlined, CameraOutlined, IdcardOutlined,
    ShopOutlined, SafetyCertificateOutlined, PlusOutlined, DeleteOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'src/redux/hooks';
import { setUserInfo } from 'src/redux/slices/appGlobalSlice';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { getProvinces, getWardsByProvince } from 'src/services/LocationService';
import { API_URL, getAvatarUrl, getInitialAvatar, isValidPhone } from 'src/utils/helpers';
import UserService from 'src/services/UserService';
import TitleCustom from 'src/components/TitleCustom';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;



/* ─── Main Component ─────────────────────────────────────── */
const AccountInfo = () => {
    const { userInfo: user } = useSelector((state) => state.appGlobal);
    const dispatch = useAppDispatch();
    const queryClient = useQueryClient();
    const [form] = Form.useForm();

    const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
    const [uploadError, setUploadError] = useState('');

    // Chứng nhận (local-only, chờ BE hỗ trợ)
    const [localCerts, setLocalCerts] = useState(user?.certifications || []);


    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                fullName: user.fullName || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                dateOfBirth: user.dateOfBirth ? dayjs(user.dateOfBirth) : null,
                gender: user.gender || undefined,
                organization: user.organization || '',
                bio: user.bio || '',
                province: user.province || undefined,
                ward: user.ward || undefined,
                address: user.address || '',
                farmType: user.farmType || undefined,
            });
            setAvatarUrl(user.avatarUrl || '');
            setLocalCerts(user.certifications || []);
        }
    }, [user, form]);



    /**
     * Mutation cập nhật hồ sơ.
     * PUT /users/me/profile chỉ nhận: { fullName, phoneNumber, dateOfBirth }
     * Response trả về user object đã cập nhật → dispatch vào store.
     */
    const updateMutation = useMutation({
        mutationFn: (values) => {
            const payload = {
                fullName: values.fullName?.trim(),
                phoneNumber: values.phoneNumber || null,
                dateOfBirth: values.dateOfBirth && dayjs.isDayjs(values.dateOfBirth)
                    ? values.dateOfBirth.toISOString()
                    : (values.dateOfBirth || null),
            };
            return UserService.updateMyProfile(payload);
        },
        onSuccess: (res) => {
            // API trả về data với đúng field names (fullName, phoneNumber, avatarUrl...)
            const updated = res.data?.data || res.data;
            if (updated) {
                // Merge với store hiện tại để giữ nguyên các field phụ (role, etc.)
                dispatch(setUserInfo({ ...user, ...updated }));
            }
            message.success('Cập nhật hồ sơ thành công!');
            queryClient.invalidateQueries(['users']);
        },
        onError: (err) => message.error(err.response?.data?.message || err.message || 'Có lỗi xảy ra!'),
    });

    const handleAvatarChange = (info) => {
        if (info.file.status === 'uploading') {
            setUploadError('');
            message.loading({ content: 'Đang tải ảnh lên...', key: 'avatar' });
        }
        if (info.file.status === 'done') {
            const newAvatarUrl = info.file.response?.data?.avatar || info.file.response?.data?.avatarUrl;
            setAvatarUrl(newAvatarUrl);
            dispatch(setUserInfo({ ...user, avatarUrl: newAvatarUrl }));
        } else if (info.file.status === 'error') {
            setUploadError(info.file.response?.message || info.file.error?.message || 'Tải ảnh thất bại!');
        }
    };

    const beforeUpload = (file) => {
        setUploadError('');
        if (!file.type.startsWith('image/')) {
            setUploadError('Chỉ chấp nhận file ảnh!');
            return Upload.LIST_IGNORE;
        }
        if (file.size / 1024 / 1024 >= 5) {
            setUploadError('Ảnh phải nhỏ hơn 5MB!');
            return Upload.LIST_IGNORE;
        }
        return true;
    };

    // Tên hiển thị: ưu tiên fullName, fallback username/email
    const displayName = user?.fullName || user?.username || user?.email || '---';
    // Role hiển thị
    const displayRole = user?.role || (user?.roles?.[0] ?? '');

    return (
        <div >
            {/* Breadcrumb */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                <TitleCustom level={4} className="!mb-0">Hồ sơ cá nhân</TitleCustom>
            </div>

            <Row gutter={[24, 24]} align="stretch">
                {/* ─── Cột trái: Thẻ hồ sơ tóm tắt ─── */}
                <Col span={24} lg={8} className="flex">
                    <Card bordered={false} className="shadow-sm rounded-[24px] text-center p-4 w-full h-full flex flex-col">
                        {/* Avatar + Upload */}
                        <div className="relative inline-block mb-4">
                            <Avatar
                                size={100}
                                src={getAvatarUrl(avatarUrl)}
                                icon={!avatarUrl && <UserOutlined />}
                                className="bg-green-50 text-green-600 border-4 border-white shadow-lg"
                            >
                                {!avatarUrl && getInitialAvatar(displayName)}
                            </Avatar>
                            <Upload
                                name="file"
                                showUploadList={false}
                                customRequest={async ({ file, onSuccess, onError }) => {
                                    const formData = new FormData();
                                    formData.append('file', file);
                                    try {
                                        const res = await UserService.uploadMyAvatar(formData);
                                        onSuccess(res);
                                    } catch (error) {
                                        onError(error);
                                    }
                                }}
                                beforeUpload={beforeUpload}
                                onChange={handleAvatarChange}
                                className="absolute bottom-0 right-0"
                            >
                                <Button
                                    shape="circle"
                                    size="small"
                                    icon={<CameraOutlined />}
                                    className="bg-green-500 text-white border-0 shadow-lg hover:bg-green-600"
                                />
                            </Upload>
                        </div>

                        {uploadError && (
                            <Text type="danger" className="block text-xs mb-3 font-medium">
                                {uploadError}
                            </Text>
                        )}

                        <Title level={4} className="!mb-0">{displayName}</Title>
                        <Text type="secondary" className="text-xs uppercase font-bold tracking-widest text-green-600">{displayRole}</Text>

                        {user?.bio && (
                            <Text className="text-sm text-gray-500 block mt-3 px-4">{user.bio}</Text>
                        )}

                        <Divider className="my-6" />

                        <div className="space-y-4 text-left px-2">
                            {/* Ngày sinh */}
                            {user?.dateOfBirth && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                        <IdcardOutlined />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Text type="secondary" className="text-[10px] uppercase font-bold block">Ngày sinh</Text>
                                        <Text strong className="block truncate">{dayjs(user.dateOfBirth).format('DD/MM/YYYY')}</Text>
                                    </div>
                                </div>
                            )}

                            {/* Giới tính */}
                            {user?.gender && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                        <UserOutlined />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Text type="secondary" className="text-[10px] uppercase font-bold block">Giới tính</Text>
                                        <Text strong className="block truncate">{user.gender}</Text>
                                    </div>
                                </div>
                            )}

                            {/* Tổ chức */}
                            {user?.organization && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                        <ShopOutlined />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Text type="secondary" className="text-[10px] uppercase font-bold block">Tổ chức</Text>
                                        <Text strong className="block truncate">{user.organization}</Text>
                                    </div>
                                </div>
                            )}

                            {/* Địa chỉ */}
                            {(user?.province || user?.ward || user?.address) && (
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                        <EnvironmentOutlined />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Text type="secondary" className="text-[10px] uppercase font-bold block">Địa chỉ</Text>
                                        <Text strong className="text-xs block">
                                            {[user?.address, user?.ward, user?.province].filter(Boolean).join(', ')}
                                        </Text>
                                    </div>
                                </div>
                            )}

                            {/* Chứng nhận */}
                            {localCerts && localCerts.length > 0 && (
                                <div className="mt-4">
                                    <Text type="secondary" className="text-[10px] uppercase font-bold block mb-2">Chứng nhận hiện có</Text>
                                    <div className="flex flex-wrap gap-1">
                                        {localCerts.map((cert, idx) => {
                                            let color = 'default';
                                            if (cert.status === 'Approved') color = 'success';
                                            if (cert.status === 'Pending') color = 'warning';
                                            if (cert.status === 'Rejected') color = 'error';
                                            return (
                                                <Tooltip title={cert.status === 'Approved' ? 'Đã duyệt' : cert.status === 'Pending' ? 'Chờ duyệt' : 'Từ chối'} key={idx}>
                                                    <Tag color={color} className="text-[10px] rounded-full border-0 font-bold">
                                                        {cert.name} {cert.status === 'Approved' && '✓'}
                                                    </Tag>
                                                </Tooltip>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </Col>

                {/* ─── Cột phải: Form chỉnh sửa ─── */}
                <Col span={24} lg={16} className="flex">
                    <Card bordered={false} className="shadow-sm rounded-[24px] p-4 w-full h-full flex flex-col">
                        <Title level={5} className="mb-6 flex items-center gap-2">
                            <EditOutlined className="text-green-500" />
                            Thay đổi thông tin
                        </Title>

                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={(values) => updateMutation.mutate(values)}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Họ tên — fullName (API field) */}
                                <Form.Item
                                    name="fullName"
                                    label="Họ và tên"
                                    rules={[{ required: true, message: 'Nhập họ tên!' }]}
                                >
                                    <Input className="h-11 rounded-lg" prefix={<UserOutlined className="text-gray-300" />} placeholder="Nguyễn Văn A" />
                                </Form.Item>

                                {/* Email — readonly */}
                                <Form.Item name="email" label="Địa chỉ Email">
                                    <Input disabled className="h-11 rounded-lg bg-gray-50" prefix={<MailOutlined className="text-gray-300" />} />
                                </Form.Item>

                                {/* Điện thoại — phoneNumber (API field) */}
                                <Form.Item
                                    name="phoneNumber"
                                    label="Số điện thoại"
                                    rules={[{
                                        validator: (_, value) => {
                                            if (!value) return Promise.resolve();
                                            if (!isValidPhone(value)) return Promise.reject(new Error('Số điện thoại không hợp lệ!'));
                                            return Promise.resolve();
                                        }
                                    }]}
                                >
                                    <Input className="h-11 rounded-lg" prefix={<PhoneOutlined className="text-gray-300" />} placeholder="0912345678" />
                                </Form.Item>

                                {/* Ngày sinh — dateOfBirth (API field) */}
                                <Form.Item
                                    name="dateOfBirth"
                                    label="Ngày sinh"
                                    rules={[{
                                        validator: (_, value) => {
                                            if (!value) return Promise.resolve();
                                            const age = dayjs().diff(value, 'year');
                                            if (age < 16) return Promise.reject(new Error('Phải từ 16 tuổi trở lên!'));
                                            if (age > 100) return Promise.reject(new Error('Ngày sinh không hợp lệ!'));
                                            return Promise.resolve();
                                        }
                                    }]}
                                >
                                    <DatePicker
                                        className="w-full h-11 rounded-lg"
                                        format="DD/MM/YYYY"
                                        placeholder="Chọn ngày sinh"
                                        disabledDate={(current) => current && current > dayjs().endOf('day')}
                                    />
                                </Form.Item>
                            </div>

                            <div className="flex justify-end mt-6">
                                <Button
                                    type="primary"
                                    icon={<SaveOutlined />}
                                    onClick={() => form.submit()}
                                    loading={updateMutation.isPending || updateMutation.isLoading}
                                    className="h-11 px-8 rounded-xl bg-green-600 border-0 font-bold shadow-lg shadow-green-100"
                                >
                                    Lưu thông tin hồ sơ
                                </Button>
                            </div>
                        </Form>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AccountInfo;
