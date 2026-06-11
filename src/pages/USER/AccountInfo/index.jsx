import React, { useState, useEffect } from 'react';
import { Card, Typography, Form, Input, Button, Avatar, Space, message, Divider, Row, Col, Select, DatePicker, Upload, Tag, Spin, Alert, Empty, Modal, Tooltip } from 'antd';
import { UserOutlined, MailOutlined, HomeOutlined, SaveOutlined, PhoneOutlined, EnvironmentOutlined, EditOutlined, CameraOutlined, IdcardOutlined, ShopOutlined, SafetyCertificateOutlined, LoadingOutlined, WarningOutlined, PlusOutlined, DeleteOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'src/redux/hooks';
import { setUserInfo } from 'src/redux/slices/appGlobalSlice';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { getProvinces, getWardsByProvince } from 'src/services/LocationService';
import { API_BASE_URL, API_URL, getAvatarUrl, getInitialAvatar } from 'src/lib/utils';
import UserService from 'src/services/UserService'

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const CertificationModal = ({ visible, onCancel, onSave, initialValues, loading }) => {
    const [form] = Form.useForm();
    const [fileUrl, setFileUrl] = useState('');

    useEffect(() => {
        if (visible) {
            if (initialValues) {
                form.setFieldsValue({
                    ...initialValues,
                    issueDate: initialValues.issueDate ? dayjs(initialValues.issueDate) : null,
                    expiryDate: initialValues.expiryDate ? dayjs(initialValues.expiryDate) : null,
                });
                setFileUrl(initialValues.fileUrl || '');
            } else {
                form.resetFields();
                setFileUrl('');
            }
        }
    }, [visible, initialValues, form]);

    const handleFileUpload = (info) => {
        if (info.file.status === 'done') {
            setFileUrl(info.file.response.data.url || info.file.response.data.fileUrl);
            message.success('Tải tệp lên thành công');
        } else if (info.file.status === 'error') {
            message.error('Tải tệp thất bại');
        }
    };

    return (
        <Modal
            title={initialValues ? "Chỉnh sửa chứng nhận" : "Thêm chứng nhận mới"}
            open={visible}
            onCancel={onCancel}
            onOk={() => {
                form.validateFields().then(values => {
                    onSave({ ...values, fileUrl });
                });
            }}
            confirmLoading={loading}
            width={600}
            centered
        >
            <Form form={form} layout="vertical">
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item name="name" label="Tên chứng nhận" rules={[{ required: true, message: 'Vui lòng nhập tên chứng nhận!' }]}>
                            <Select placeholder="Chọn loại chứng nhận" showSearch>
                                <Option value="VietGAP">VietGAP</Option>
                                <Option value="GlobalGAP">GlobalGAP</Option>
                                <Option value="Organic">Hữu cơ (Organic)</Option>
                                <Option value="HACCP">HACCP</Option>
                                <Option value="ISO 22000">ISO 22000</Option>
                                <Option value="OCOP">OCOP</Option>
                            </Select>
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="code" label="Số hiệu chứng chỉ">
                            <Input placeholder="Ví dụ: VG-2024-001" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="issuer" label="Tổ chức cấp">
                            <Input placeholder="Ví dụ: Trung tâm Kiểm định..." />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="issueDate" label="Ngày cấp">
                            <DatePicker className="w-full" format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item name="expiryDate" label="Ngày hết hạn">
                            <DatePicker className="w-full" format="DD/MM/YYYY" />
                        </Form.Item>
                    </Col>
                    <Col span={24}>
                        <Form.Item label="Bản scan chứng chỉ (Ảnh/PDF)">
                            <Upload
                                name="file"
                                action={`${API_URL}/upload/document`}
                                headers={{ Authorization: `Bearer ${localStorage.getItem('token')}` }}
                                onChange={handleFileUpload}
                                maxCount={1}
                                showUploadList={true}
                            >
                                <Button icon={<CameraOutlined />}>Tải tệp lên</Button>
                            </Upload>
                            {fileUrl && <Text type="success" className="text-[10px] mt-1 block">Đã đính kèm tệp</Text>}
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

const AccountInfo = () => {
    const user = useSelector((state) => state.appGlobal.userInfo);
    const dispatch = useAppDispatch();
    const queryClient = useQueryClient();
    const [form] = Form.useForm();
    const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');

    // State cho địa phương (sau sáp nhập: chỉ còn Tỉnh → Phường/Xã)
    const [provinces, setProvinces] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvinceCode, setSelectedProvinceCode] = useState(null);
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingWards, setLoadingWards] = useState(false);

    // Certifications state
    const [isCertModalVisible, setIsCertModalVisible] = useState(false);
    const [editingCert, setEditingCert] = useState(null);
    const [localCerts, setLocalCerts] = useState(user?.certifications || []);

    // Load danh sách tỉnh/thành khi component mount
    useEffect(() => {
        const fetchProvinces = async () => {
            setLoadingProvinces(true);
            const data = await getProvinces();
            setProvinces(data);
            setLoadingProvinces(false);
        };
        fetchProvinces();
    }, []);

    // Sync form values when user changes
    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                ...user,
                dateOfBirth: user.dateOfBirth ? dayjs(user.dateOfBirth) : null
            });
            setAvatarUrl(user.avatar || '');
            setLocalCerts(user.certifications || []);
        }
    }, [user, form]);

    // Load phường/xã khi chọn tỉnh
    useEffect(() => {
        const fetch = async () => {
            if (selectedProvinceCode) {
                setLoadingWards(true);
                const data = await getWardsByProvince(selectedProvinceCode);
                setWards(data);
                setLoadingWards(false);
            } else {
                setWards([]);
            }
        };
        fetch();
    }, [selectedProvinceCode]);

    // Xử lý khi chọn province
    const handleProvinceChange = (value, option) => {
        setSelectedProvinceCode(option.code);
        setWards([]);
        form.setFieldsValue({ province: option.name, ward: undefined });
    };

    // Xử lý khi chọn ward
    const handleWardChange = (value, option) => {
        form.setFieldsValue({ ward: option.name });
    };

    const updateMutation = useMutation({
        mutationFn: (values) => {
            const updateData = {
                fullname: values.fullname,
                phone: values.phone,
                dateOfBirth: values.dateOfBirth,
                gender: values.gender,
                address: values.address,
                province: values.province,
                ward: values.ward,
                farmName: values.farmName,
                farmCode: values.farmCode,
                farmArea: values.farmArea,
                farmType: values.farmType,
                bio: values.bio,
                organization: values.organization,
                avatar: avatarUrl,
                certifications: values.certifications || localCerts
            };

            // Chuyển dateOfBirth sang ISO string
            if (updateData.dateOfBirth && dayjs.isDayjs(updateData.dateOfBirth)) {
                updateData.dateOfBirth = updateData.dateOfBirth.toISOString();
            }

            return UserService.updateProfile(updateData);
        },
        onSuccess: (res) => {
            dispatch(setUserInfo(res.data.data));
            message.success('Cập nhật hồ sơ thành công!');
            queryClient.invalidateQueries(['users']);
        },
        onError: (err) => message.error(err.message || err.response?.data?.message || 'Có lỗi xảy ra!')
    });

    const handleAvatarChange = (info) => {
        if (info.file.status === 'uploading') {
            message.loading({ content: 'Đang tải ảnh lên...', key: 'avatar' });
        }
        if (info.file.status === 'done') {
            const avatarUrl = info.file.response.data.avatar;
            setAvatarUrl(avatarUrl);
            dispatch(setUserInfo({ ...user, avatar: avatarUrl }));
            message.success({ content: 'Tải ảnh đại diện thành công!', key: 'avatar' });
        } else if (info.file.status === 'error') {
            console.error('Upload error:', info.file.error, info.file.response);
            message.error({ content: info.file.response?.message || info.file.error?.message || 'Tải ảnh thất bại!', key: 'avatar' });
        }
    };

    const beforeUpload = (file) => {
        const isImage = file.type.startsWith('image/');
        if (!isImage) {
            message.error('Chỉ chấp nhận file ảnh!');
            return Upload.LIST_IGNORE;
        }
        const isLt5M = file.size / 1024 / 1024 < 5;
        if (!isLt5M) {
            message.error('Ảnh phải nhỏ hơn 5MB!');
            return Upload.LIST_IGNORE;
        }
        return true;
    };

    const uploadButton = (
        <div className="text-center">
            <CameraOutlined className="text-2xl text-gray-400 mb-2" />
            <div className="text-xs text-gray-500">Thay đổi</div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                    <HomeOutlined />
                    <span>Tổng quan</span>
                    <span className="text-gray-200">/</span>
                    <span className="text-green-600">Thông tin tài khoản</span>
                </div>
                <Title level={4} className="!mb-0">Hồ sơ cá nhân</Title>
            </div>

            <Row gutter={[24, 24]}>
                {/* Profile Card */}
                <Col span={24} lg={8}>
                    <Card bordered={false} className="shadow-sm rounded-[24px] text-center p-4 h-full">
                        <div className="relative inline-block mb-4">
                            <Avatar
                                size={100}
                                src={getAvatarUrl(avatarUrl)}
                                icon={!avatarUrl && <UserOutlined />}
                                className="bg-green-50 text-green-600 border-4 border-white shadow-lg"
                            >
                                {!avatarUrl && getInitialAvatar(user?.fullname || user?.username)}
                            </Avatar>
                            <Upload
                                name="avatar"
                                showUploadList={false}
                                action={`${API_URL}/upload/avatar`}
                                headers={{
                                    Authorization: `Bearer ${localStorage.getItem('token')}`
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

                        <Title level={4} className="!mb-0">{user?.fullname || user?.username}</Title>
                        <Text type="secondary" className="text-xs uppercase font-bold tracking-widest text-green-600">{user?.role}</Text>

                        {user?.bio && (
                            <Text className="text-sm text-gray-500 block mt-3 px-4">{user.bio}</Text>
                        )}

                        <Divider className="my-6" />

                        <div className="space-y-4 text-left px-2">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                    <UserOutlined />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <Text type="secondary" className="text-[10px] uppercase font-bold block">Username</Text>
                                    <Text strong className="block truncate">@{user?.username}</Text>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                    <MailOutlined />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <Text type="secondary" className="text-[10px] uppercase font-bold block">Email</Text>
                                    <Text strong className="text-xs block truncate">{user?.email}</Text>
                                </div>
                            </div>

                            {user?.phone && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                        <PhoneOutlined />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Text type="secondary" className="text-[10px] uppercase font-bold block">Điện thoại</Text>
                                        <Text strong className="block truncate">{user.phone}</Text>
                                    </div>
                                </div>
                            )}

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

                            {(user?.province || user?.ward || user?.address) && (
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                        <EnvironmentOutlined />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Text type="secondary" className="text-[10px] uppercase font-bold block">Địa chỉ</Text>
                                        <Text strong className="text-xs block">
                                            {[user?.address, user?.ward, user?.province]
                                                .filter(Boolean)
                                                .join(', ')}
                                        </Text>
                                    </div>
                                </div>
                            )}

                            {user?.farmName && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                        <ShopOutlined />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Text type="secondary" className="text-[10px] uppercase font-bold block">Nông trại</Text>
                                        <Text strong className="block truncate">{user.farmName}</Text>
                                    </div>
                                </div>
                            )}

                            {user?.farmCode && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                        <IdcardOutlined />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Text type="secondary" className="text-[10px] uppercase font-bold block">Mã nông trại</Text>
                                        <Text strong className="block truncate">{user.farmCode}</Text>
                                    </div>
                                </div>
                            )}

                            {user?.farmArea && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                        <EnvironmentOutlined />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Text type="secondary" className="text-[10px] uppercase font-bold block">Diện tích</Text>
                                        <Text strong className="block truncate">{user.farmArea.toLocaleString()} m²</Text>
                                    </div>
                                </div>
                            )}

                            {user?.farmType && (
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                                        <ShopOutlined />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <Text type="secondary" className="text-[10px] uppercase font-bold block">Loại hình</Text>
                                        <Text strong className="block truncate">{user.farmType}</Text>
                                    </div>
                                </div>
                            )}

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
                                                <Tooltip title={`${cert.status === 'Approved' ? 'Đã duyệt' : cert.status === 'Pending' ? 'Chờ duyệt' : 'Từ chối'}`} key={idx}>
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

                {/* Edit Form */}
                <Col span={24} lg={16}>
                    <Card bordered={false} className="shadow-sm rounded-[24px] p-4">
                        <Title level={5} className="mb-6 flex items-center gap-2">
                            <EditOutlined className="text-green-500" />
                            Thay đổi thông tin
                        </Title>

                        <Form
                            form={form}
                            layout="vertical"
                            initialValues={{
                                ...user,
                                dateOfBirth: user?.dateOfBirth ? dayjs(user.dateOfBirth) : null
                            }}
                            onFinish={(values) => updateMutation.mutate(values)}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Form.Item
                                    name="fullname"
                                    label="Họ và tên"
                                    rules={[{ required: true, message: 'Nhập họ tên!' }]}
                                >
                                    <Input className="h-11 rounded-lg" prefix={<UserOutlined className="text-gray-300" />} placeholder="Nguyễn Văn A" />
                                </Form.Item>

                                <Form.Item
                                    name="email"
                                    label="Địa chỉ Email"
                                >
                                    <Input disabled className="h-11 rounded-lg bg-gray-50" prefix={<MailOutlined className="text-gray-300" />} />
                                </Form.Item>

                                <Form.Item
                                    name="phone"
                                    label="Số điện thoại"
                                    rules={[{ pattern: /^[0-9]{10}$/, message: 'Số điện thoại không hợp lệ!' }]}
                                >
                                    <Input className="h-11 rounded-lg" prefix={<PhoneOutlined className="text-gray-300" />} placeholder="0912345678" />
                                </Form.Item>

                                <Form.Item
                                    name="dateOfBirth"
                                    label="Ngày sinh"
                                    rules={[
                                        {
                                            validator: (_, value) => {
                                                if (!value) return Promise.resolve();
                                                const age = dayjs().diff(value, 'year');
                                                if (age < 16) {
                                                    return Promise.reject(new Error('Phải từ 16 tuổi trở lên!'));
                                                }
                                                if (age > 100) {
                                                    return Promise.reject(new Error('Ngày sinh không hợp lệ!'));
                                                }
                                                return Promise.resolve();
                                            }
                                        }
                                    ]}
                                >
                                    <DatePicker
                                        className="w-full h-11 rounded-lg"
                                        format="DD/MM/YYYY"
                                        placeholder="Chọn ngày sinh"
                                        disabledDate={(current) => {
                                            // Không cho chọn ngày trong tương lai
                                            return current && current > dayjs().endOf('day');
                                        }}
                                    />
                                </Form.Item>

                                <Form.Item name="gender" label="Giới tính">
                                    <Select className="h-11" placeholder="Chọn giới tính">
                                        <Option value="Nam">Nam</Option>
                                        <Option value="Nữ">Nữ</Option>
                                        <Option value="Khác">Khác</Option>
                                    </Select>
                                </Form.Item>

                                <Form.Item name="organization" label="Tổ chức/Công ty">
                                    <Input className="h-11 rounded-lg" prefix={<ShopOutlined className="text-gray-300" />} placeholder="HTX Nông nghiệp..." />
                                </Form.Item>
                            </div>

                            <Form.Item name="bio" label="Giới thiệu ngắn">
                                <TextArea rows={3} className="rounded-lg" placeholder="Mô tả ngắn về bản thân..." />
                            </Form.Item>

                            {/* Địa chỉ */}
                            <Divider orientation="left" className="!text-gray-600 !text-sm font-bold mt-6">
                                <EnvironmentOutlined className="mr-2" />
                                Địa chỉ
                            </Divider>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Form.Item name="province" label="Tỉnh/Thành phố">
                                    <Select
                                        className="h-11"
                                        placeholder="Chọn tỉnh/thành phố"
                                        showSearch
                                        loading={loadingProvinces}
                                        notFoundContent={loadingProvinces ? <Spin size="small" /> : 'Không tìm thấy'}
                                        filterOption={(input, option) =>
                                            (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                        }
                                        onChange={handleProvinceChange}
                                    >
                                        {provinces.map((province) => (
                                            <Option
                                                value={province.name}
                                                key={province.code}
                                                code={province.code}
                                                name={province.name}
                                            >
                                                {province.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>

                                <Form.Item name="ward" label="Phường/Xã">
                                    <Select
                                        className="h-11"
                                        placeholder="Chọn phường/xã"
                                        disabled={!selectedProvinceCode}
                                        showSearch
                                        loading={loadingWards}
                                        notFoundContent={loadingWards ? <Spin size="small" /> : 'Không tìm thấy'}
                                        filterOption={(input, option) =>
                                            (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                        }
                                        onChange={handleWardChange}
                                    >
                                        {wards.map((ward) => (
                                            <Option
                                                value={ward.name}
                                                key={ward.code}
                                                code={ward.code}
                                                name={ward.name}
                                            >
                                                {ward.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </Form.Item>
                            </div>

                            <Form.Item name="address" label="Địa chỉ chi tiết">
                                <Input className="h-11 rounded-lg" prefix={<EnvironmentOutlined className="text-gray-300" />} placeholder="Số nhà, tên đường..." />
                            </Form.Item>

                            {/* Thông tin nông trại (chỉ hiện với Farmer/User role) */}
                            {['FARMER'].includes(user?.role) && (
                                <>
                                    <Divider orientation="left" className="!text-gray-600 !text-sm font-bold mt-8">
                                        <SafetyCertificateOutlined className="mr-2" />
                                        Quản lý chứng nhận
                                    </Divider>

                                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-dashed border-gray-200 mb-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <div>
                                                <Text strong>Danh sách chứng chỉ</Text>
                                                <Paragraph className="text-[11px] text-gray-500 m-0">Tải lên VietGAP, Organic hoặc các chứng chỉ khác để HTX phê duyệt</Paragraph>
                                            </div>
                                            <Button 
                                                type="primary" 
                                                size="small" 
                                                icon={<PlusOutlined />} 
                                                onClick={() => {
                                                    setEditingCert(null);
                                                    setIsCertModalVisible(true);
                                                }}
                                                className="bg-green-600 border-0 rounded-lg"
                                            >
                                                Thêm mới
                                            </Button>
                                        </div>

                                        <div className="space-y-3">
                                            {localCerts.length === 0 ? (
                                                <div className="text-center py-4 bg-white rounded-xl border border-gray-100">
                                                    <Text className="text-gray-300 italic text-xs">Chưa có chứng nhận nào được tải lên</Text>
                                                </div>
                                            ) : (
                                                localCerts.map((cert, index) => (
                                                    <div key={index} className="flex items-center justify-between bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                                                                <SafetyCertificateOutlined />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <Text strong className="text-sm">{cert.name}</Text>
                                                                    <Tag 
                                                                        color={cert.status === 'Approved' ? 'success' : cert.status === 'Pending' ? 'warning' : 'error'} 
                                                                        className="m-0 text-[9px] border-0 rounded-full font-bold uppercase"
                                                                    >
                                                                        {cert.status === 'Approved' ? 'Đã duyệt' : cert.status === 'Pending' ? 'Chờ HTX duyệt' : 'Từ chối'}
                                                                    </Tag>
                                                                </div>
                                                                <Text className="text-[10px] text-gray-400 block">Số hiệu: {cert.code || '---'} | Hạn: {cert.expiryDate ? dayjs(cert.expiryDate).format('DD/MM/YYYY') : 'Vô thời hạn'}</Text>
                                                            </div>
                                                        </div>
                                                        <Space>
                                                            <Button 
                                                                size="small" 
                                                                type="text" 
                                                                icon={<EditOutlined className="text-blue-500" />} 
                                                                onClick={() => {
                                                                    setEditingCert({ ...cert, index });
                                                                    setIsCertModalVisible(true);
                                                                }}
                                                            />
                                                            <Button 
                                                                size="small" 
                                                                type="text" 
                                                                danger 
                                                                icon={<DeleteOutlined />} 
                                                                onClick={() => {
                                                                    const newCerts = [...localCerts];
                                                                    newCerts.splice(index, 1);
                                                                    setLocalCerts(newCerts);
                                                                }}
                                                            />
                                                        </Space>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <Divider orientation="left" className="!text-gray-600 !text-sm font-bold mt-6">
                                        <ShopOutlined className="mr-2" />
                                        Thông tin nông trại
                                    </Divider>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Form.Item name="farmName" label="Tên nông trại">
                                            <Input className="h-11 rounded-lg" placeholder="Nông trại ABC" />
                                        </Form.Item>

                                        <Form.Item name="farmCode" label="Mã số nông trại">
                                            <Input className="h-11 rounded-lg" placeholder="NT-001" />
                                        </Form.Item>

                                        <Form.Item name="farmArea" label="Diện tích (m²)">
                                            <Input type="number" className="h-11 rounded-lg" placeholder="5000" />
                                        </Form.Item>

                                        <Form.Item name="farmType" label="Loại hình">
                                            <Select className="h-11" placeholder="Chọn loại hình">
                                                <Option value="Trồng trọt">Trồng trọt</Option>
                                                <Option value="Chăn nuôi">Chăn nuôi</Option>
                                                <Option value="Thủy sản">Thủy sản</Option>
                                                <Option value="Hỗn hợp">Hỗn hợp</Option>
                                            </Select>
                                        </Form.Item>
                                    </div>
                                </>
                            )}

                            <div className="flex justify-end mt-6">
                                <Button
                                    type="primary"
                                    icon={<SaveOutlined />}
                                    onClick={() => form.submit()}
                                    loading={updateMutation.isLoading}
                                    className="h-11 px-8 rounded-xl bg-green-600 border-0 font-bold shadow-lg shadow-green-100"
                                >
                                    Lưu thông tin hồ sơ
                                </Button>
                            </div>
                        </Form>
                    </Card>
                </Col>
            </Row>

            <CertificationModal 
                visible={isCertModalVisible}
                onCancel={() => setIsCertModalVisible(false)}
                initialValues={editingCert}
                loading={updateMutation.isLoading}
                onSave={(newCert) => {
                    let updatedCerts = [];
                    if (editingCert) {
                        updatedCerts = [...localCerts];
                        updatedCerts[editingCert.index] = { ...newCert, status: 'Pending' };
                    } else {
                        updatedCerts = [...localCerts, { ...newCert, status: 'Pending' }];
                    }
                    
                    setLocalCerts(updatedCerts);
                    setIsCertModalVisible(false);

                    // Tự động lưu luôn lên server để HTX thấy ngay
                    const currentValues = form.getFieldsValue();
                    updateMutation.mutate({ 
                        ...currentValues, 
                        certifications: updatedCerts 
                    });
                }}
            />
        </div>
    );
};

export default AccountInfo;
