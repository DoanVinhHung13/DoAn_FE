import React, { useEffect, useState } from 'react';
import {
    Avatar,
    Button,
    Card,
    Col,
    DatePicker,
    Divider,
    Form,
    Input,
    Row,
    Select,
    Spin,
    Typography,
    Upload,
    message
} from 'antd';
import {
    CameraOutlined,
    EditOutlined,
    EnvironmentOutlined,
    MailOutlined,
    PhoneOutlined,
    SaveOutlined,
    ShopOutlined,
    UserOutlined
} from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

import { getAvatarUrl, getInitialAvatar, API_URL } from 'src/lib/utils';
import { useAppDispatch } from 'src/redux/hooks';
import { setUserInfo } from 'src/redux/slices/appGlobalSlice';
import { getProvinces, getWardsByProvince } from 'src/services/LocationService';
import UserService from 'src/services/UserService';

const { Text, Title } = Typography;

const MSG_UPDATE_SUCCESS = 'Thông tin cá nhân đã được cập nhật thành công.';
const MSG_INVALID_INPUT = 'Nhập liệu không hợp lệ. Vui lòng kiểm tra các trường được đánh dấu.';
const MSG_INVALID_PHONE = 'Định dạng số điện thoại không hợp lệ. Vui lòng nhập số điện thoại hợp lệ.';
const MSG_DUPLICATE_PHONE = 'Số điện thoại này đã được đăng ký. Vui lòng thử số khác.';
const MSG_MINIMUM_AGE = 'Người dùng phải từ đủ 15 tuổi.';
const MSG_REQUIRED_DATE_OF_BIRTH = 'Vui lòng chọn ngày sinh.';
const MSG_INVALID_DATE_OF_BIRTH = 'Ngày sinh không hợp lệ.';
const MSG_REQUIRED_FULLNAME = 'Vui lòng nhập họ và tên.';
const MSG_INVALID_FULLNAME =
    'Họ và tên không hợp lệ. Vui lòng chỉ nhập chữ cái và khoảng trắng.';
const MSG_INVALID_ORGANIZATION =
    'Tên tổ chức/công ty không hợp lệ. Vui lòng nhập tên có ít nhất 2 chữ hoặc số.';
const MSG_INVALID_ADDRESS =
    'Địa chỉ chi tiết không hợp lệ. Vui lòng nhập địa chỉ có ít nhất 2 chữ hoặc số.';
const MSG_REQUIRED_PROVINCE = 'Vui lòng chọn tỉnh/thành phố.';
const MSG_REQUIRED_WARD = 'Vui lòng chọn phường/xã.';
const PHONE_PATTERN = /^0\d{9}$/;
const FULLNAME_PATTERN = /^[\p{L}]+(?:[\s'-][\p{L}]+)*$/u;
const ORGANIZATION_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N}\s&().,/'’+-]*$/u;
const ADDRESS_PATTERN = /^[\p{L}\p{N}][\p{L}\p{N}\s,./#()'’+-]*$/u;
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

const normalizeWhitespace = (value) => value?.trim().replace(/\s+/g, ' ');

const getUserValue = (user, ...keys) => {
    const key = keys.find((item) => user?.[item] !== undefined && user?.[item] !== null);
    return key ? user[key] : '';
};

const getFormValues = (user) => ({
    fullname: getUserValue(user, 'fullname', 'fullName'),
    email: getUserValue(user, 'email'),
    phone: getUserValue(user, 'phone', 'phoneNumber'),
    dateOfBirth: user?.dateOfBirth ? dayjs(user.dateOfBirth) : null,
    gender: user?.gender,
    organization: getUserValue(user, 'organization', 'farmName'),
    province: user?.province,
    ward: user?.ward,
    address: user?.address
});

const PROFILE_FIELD_NAMES = Object.keys(getFormValues({}));

const extractUpdatedUser = (response) =>
    response?.data?.data || response?.data || response || {};

const collectErrorText = (value) => {
    if (value === undefined || value === null) return [];
    if (typeof value === 'string' || typeof value === 'number') {
        return [String(value)];
    }
    if (Array.isArray(value)) {
        return value.flatMap(collectErrorText);
    }
    if (typeof value === 'object') {
        return Object.entries(value).flatMap(([key, item]) => [
            key,
            ...collectErrorText(item)
        ]);
    }
    return [];
};

const isDuplicatePhoneError = (error) => {
    const status = error?.response?.status;
    const responseData = error?.response?.data;
    const errorText = collectErrorText([
        error?.message,
        error?.code,
        error?.messages,
        responseData
    ])
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

    const mentionsPhone =
        errorText.includes('phone') ||
        errorText.includes('số điện thoại') ||
        errorText.includes('so dien thoai');
    const mentionsDuplicate =
        errorText.includes('exist') ||
        errorText.includes('duplicate') ||
        errorText.includes('unique') ||
        errorText.includes('conflict') ||
        errorText.includes('đăng ký') ||
        errorText.includes('tồn tại') ||
        errorText.includes('đã được sử dụng');

    return mentionsPhone && (status === 409 || mentionsDuplicate);
};

const AccountInfo = () => {
    const user = useSelector((state) => state.appGlobal.userInfo);
    const dispatch = useAppDispatch();
    const queryClient = useQueryClient();
    const [form] = Form.useForm();
    const [isEditing, setIsEditing] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState(getUserValue(user, 'avatar', 'avatarUrl'));
    const [provinces, setProvinces] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
    const [loadingProvinces, setLoadingProvinces] = useState(false);
    const [loadingWards, setLoadingWards] = useState(false);

    const fullname = getUserValue(user, 'fullname', 'fullName');
    const phone = getUserValue(user, 'phone', 'phoneNumber');
    const email = getUserValue(user, 'email');
    const organization = getUserValue(user, 'organization', 'farmName');
    const address = [
        getUserValue(user, 'address'),
        getUserValue(user, 'ward'),
        getUserValue(user, 'province')
    ].filter(Boolean).join(', ');

    useEffect(() => {
        form.setFieldsValue(getFormValues(user));
        setAvatarUrl(getUserValue(user, 'avatar', 'avatarUrl'));
    }, [form, user]);

    useEffect(() => {
        const loadProvinces = async () => {
            setLoadingProvinces(true);
            const data = await getProvinces();
            setProvinces(data);

            const currentProvince = data.find((item) =>
                [item.name, item.fullName].includes(user?.province)
            );
            setSelectedProvinceCode(currentProvince?.code || '');
            setLoadingProvinces(false);
        };

        loadProvinces();
    }, [user?.province]);

    useEffect(() => {
        const loadWards = async () => {
            if (!selectedProvinceCode) {
                setWards([]);
                return;
            }

            setLoadingWards(true);
            setWards(await getWardsByProvince(selectedProvinceCode));
            setLoadingWards(false);
        };

        loadWards();
    }, [selectedProvinceCode]);

    const updateMutation = useMutation({
        mutationFn: (values) => {
            const updateData = {
                fullname: normalizeWhitespace(values.fullname),
                phone: values.phone?.trim(),
                dateOfBirth: values.dateOfBirth
                    ? values.dateOfBirth.format('YYYY-MM-DD')
                    : null,
                gender: values.gender,
                address: normalizeWhitespace(values.address),
                province: values.province,
                ward: values.ward,
                farmName: user?.farmName,
                farmCode: user?.farmCode,
                farmArea: user?.farmArea,
                farmType: user?.farmType,
                bio: user?.bio,
                organization: normalizeWhitespace(values.organization),
                avatar: avatarUrl,
                certifications: user?.certifications || []
            };

            return UserService.updateProfile(updateData);
        },
        onSuccess: (response, values) => {
            const serverUser = extractUpdatedUser(response);
            const updatedUser = {
                ...user,
                ...serverUser,
                fullname:
                    serverUser.fullname ||
                    serverUser.fullName ||
                    normalizeWhitespace(values.fullname),
                fullName:
                    serverUser.fullName ||
                    serverUser.fullname ||
                    normalizeWhitespace(values.fullname),
                phone: serverUser.phone ?? serverUser.phoneNumber ?? values.phone?.trim() ?? '',
                phoneNumber: serverUser.phoneNumber ?? serverUser.phone ?? values.phone?.trim() ?? '',
                dateOfBirth: serverUser.dateOfBirth || values.dateOfBirth?.format('YYYY-MM-DD') || null,
                gender: serverUser.gender || values.gender,
                organization: serverUser.organization || values.organization,
                bio: serverUser.bio ?? user?.bio,
                province: serverUser.province || values.province,
                ward: serverUser.ward || values.ward,
                address: serverUser.address || values.address
            };

            dispatch(setUserInfo(updatedUser));
            queryClient.invalidateQueries({ queryKey: ['users'] });
            form.setFieldsValue(getFormValues(updatedUser));
            message.success(MSG_UPDATE_SUCCESS);
            setIsEditing(false);
        },
        onError: (error) => {
            if (isDuplicatePhoneError(error)) {
                form.setFields([
                    {
                        name: 'phone',
                        errors: [MSG_DUPLICATE_PHONE]
                    }
                ]);
                return;
            }

            message.error(error?.response?.data?.message || error?.message || MSG_INVALID_INPUT);
        }
    });

    const startEditing = () => {
        form.setFieldsValue(getFormValues(user));
        form.setFields(PROFILE_FIELD_NAMES.map((name) => ({ name, errors: [] })));
        setIsEditing(true);
    };

    const cancelEditing = () => {
        form.setFieldsValue(getFormValues(user));
        form.setFields(PROFILE_FIELD_NAMES.map((name) => ({ name, errors: [] })));
        setIsEditing(false);
    };

    const handleProvinceChange = (value, option) => {
        setSelectedProvinceCode(option?.code || '');
        setWards([]);
        form.setFieldsValue({ province: value, ward: undefined });
    };

    const handleAvatarChange = (info) => {
        if (info.file.status === 'uploading') {
            message.loading({ content: 'Đang tải ảnh lên...', key: 'avatar' });
            return;
        }

        if (info.file.status === 'done') {
            const nextAvatar =
                info.file.response?.data?.avatar ||
                info.file.response?.data?.avatarUrl ||
                info.file.response?.avatar ||
                info.file.response?.avatarUrl;

            if (!nextAvatar) {
                message.error({
                    content: 'Không nhận được đường dẫn ảnh từ hệ thống.',
                    key: 'avatar'
                });
                return;
            }

            setAvatarUrl(nextAvatar);
            dispatch(setUserInfo({ ...user, avatar: nextAvatar, avatarUrl: nextAvatar }));
            message.success({ content: 'Tải ảnh đại diện thành công!', key: 'avatar' });
        } else if (info.file.status === 'error') {
            message.error({
                content:
                    info.file.response?.message ||
                    info.file.error?.message ||
                    'Tải ảnh thất bại!',
                key: 'avatar'
            });
        }
    };

    const beforeUpload = (file) => {
        if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
            message.error('Chỉ chấp nhận ảnh JPG, JPEG, PNG hoặc WEBP!');
            return Upload.LIST_IGNORE;
        }

        if (!file.size) {
            message.error('Tệp ảnh không được để trống!');
            return Upload.LIST_IGNORE;
        }

        if (file.size >= MAX_AVATAR_SIZE) {
            message.error('Ảnh phải nhỏ hơn 5MB!');
            return Upload.LIST_IGNORE;
        }

        return true;
    };

    const profileItems = [
        {
            key: 'email',
            label: 'Email đăng nhập',
            value: email || 'Chưa cập nhật',
            icon: <MailOutlined />
        },
        {
            key: 'organization',
            label: 'Tổ chức/Công ty',
            value: organization || 'Chưa cập nhật',
            icon: <ShopOutlined />
        }
    ];

    return (
        <div className="mx-auto max-w-[1020px] px-1 py-1">
            <Row gutter={[26, 26]} align="stretch">
                <Col span={24} lg={8}>
                    <Card bordered={false} className="h-full rounded-[20px] text-center shadow-sm">
                        <div className="relative mb-7 mt-5 inline-block">
                            <Avatar
                                size={116}
                                src={getAvatarUrl(avatarUrl)}
                                icon={!avatarUrl && <UserOutlined />}
                                className="border-4 border-white bg-green-50 !text-[54px] text-green-600 shadow-lg"
                            >
                                {!avatarUrl && getInitialAvatar(fullname || email)}
                            </Avatar>

                            <Upload
                                name="avatar"
                                showUploadList={false}
                                accept=".jpg,.jpeg,.png,.webp"
                                action={`${API_URL}/upload/avatar`}
                                headers={{ Authorization: `Bearer ${localStorage.getItem('token')}` }}
                                beforeUpload={beforeUpload}
                                onChange={handleAvatarChange}
                                className="absolute bottom-0 right-0"
                            >
                                <Button
                                    shape="circle"
                                    size="small"
                                    title="Thay đổi ảnh đại diện"
                                    icon={<CameraOutlined />}
                                    className="!border-0 !bg-green-500 !text-white shadow-lg hover:!bg-green-600"
                                />
                            </Upload>
                        </div>

                        <Title level={4} className="!mb-0 !text-[20px] !font-bold !leading-7">
                            {fullname || email || 'Chưa cập nhật'}
                        </Title>
                        <Text type="secondary" className="text-[10px] font-bold uppercase tracking-widest">
                            {user?.role || 'Chưa cập nhật'}
                        </Text>

                        {organization && (
                            <div className="mx-auto mt-4 flex max-w-[190px] items-center justify-center gap-2 rounded-2xl bg-green-100 px-4 py-3 text-[11px] font-medium leading-5 text-green-700">
                                <ShopOutlined />
                                <span>{organization}</span>
                            </div>
                        )}

                        <Divider className="!my-7" />

                        <div className="space-y-4 px-4 pb-5 text-left">
                            {profileItems.map((item) => (
                                <div
                                    key={item.key}
                                    className={`flex gap-3 ${item.multiline ? 'items-start' : 'items-center'}`}
                                >
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
                                        {item.icon}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <Text type="secondary" className="block !text-xs font-semibold uppercase">
                                            {item.label}
                                        </Text>
                                        <Text
                                            strong
                                            className="block truncate !text-sm !leading-6 text-gray-900"
                                        >
                                            {item.value}
                                        </Text>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </Col>

                <Col span={24} lg={16}>
                    <Card bordered={false} className="h-full rounded-[20px] px-5 py-7 shadow-sm md:px-8">
                        <Title level={5} className="!mb-7 flex items-center gap-2 !text-[17px]">
                            <EditOutlined className="text-green-500" />
                            {isEditing ? 'Thay đổi thông tin' : 'Thông tin cá nhân'}
                        </Title>

                        {isEditing ? (
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={(values) => updateMutation.mutate(values)}
                                onFinishFailed={({ errorFields }) => {
                                    const firstErrorField = errorFields?.[0]?.name;
                                    if (firstErrorField) {
                                        form.scrollToField(firstErrorField, {
                                            behavior: 'smooth',
                                            block: 'center'
                                        });
                                        form.focusField(firstErrorField);
                                    }
                                }}
                                validateTrigger={['onChange', 'onBlur']}
                                requiredMark
                            >
                                <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
                                    <Form.Item
                                        name="fullname"
                                        label="Họ và tên"
                                        required
                                        rules={[
                                            {
                                                validator: (_, value) => {
                                                    const normalizedValue = normalizeWhitespace(value);
                                                    if (!normalizedValue) {
                                                        return Promise.reject(
                                                            new Error(MSG_REQUIRED_FULLNAME)
                                                        );
                                                    }
                                                    if (
                                                        normalizedValue.length <= 100 &&
                                                        FULLNAME_PATTERN.test(normalizedValue)
                                                    ) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject(
                                                        new Error(MSG_INVALID_FULLNAME)
                                                    );
                                                }
                                            }
                                        ]}
                                    >
                                        <Input
                                            className="h-11 rounded-lg"
                                            prefix={<UserOutlined className="text-gray-300" />}
                                            placeholder="Nhập họ và tên"
                                        />
                                    </Form.Item>

                                    <Form.Item name="email" label="Địa chỉ Email">
                                        <Input
                                            disabled
                                            className="h-11 rounded-lg bg-gray-50"
                                            prefix={<MailOutlined className="text-gray-300" />}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        name="phone"
                                        label="Số điện thoại"
                                        rules={[
                                            {
                                                validator: (_, value) => {
                                                    if (!value || PHONE_PATTERN.test(value.trim())) {
                                                        return Promise.resolve();
                                                    }
                                                    return Promise.reject(new Error(MSG_INVALID_PHONE));
                                                }
                                            }
                                        ]}
                                    >
                                        <Input
                                            className="h-11 rounded-lg"
                                            prefix={<PhoneOutlined className="text-gray-300" />}
                                            placeholder="Ví dụ: 0912345678"
                                            maxLength={10}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        name="dateOfBirth"
                                        label="Ngày sinh"
                                        required
                                        rules={[
                                            {
                                                validator: (_, value) => {
                                                    if (!value) {
                                                        return Promise.reject(
                                                            new Error(MSG_REQUIRED_DATE_OF_BIRTH)
                                                        );
                                                    }
                                                    if (
                                                        !dayjs(value).isValid() ||
                                                        dayjs(value).isAfter(dayjs(), 'day')
                                                    ) {
                                                        return Promise.reject(
                                                            new Error(MSG_INVALID_DATE_OF_BIRTH)
                                                        );
                                                    }
                                                    if (dayjs(value).isAfter(dayjs().subtract(15, 'year'), 'day')) {
                                                        return Promise.reject(new Error(MSG_MINIMUM_AGE));
                                                    }
                                                    return Promise.resolve();
                                                }
                                            }
                                        ]}
                                    >
                                        <DatePicker
                                            className="h-11 w-full rounded-lg"
                                            format="DD/MM/YYYY"
                                            placeholder="Chọn ngày sinh"
                                            disabledDate={(current) =>
                                                current && current.isAfter(dayjs(), 'day')
                                            }
                                        />
                                    </Form.Item>

                                    <Form.Item name="gender" label="Giới tính">
                                        <Select
                                            className="h-11"
                                            placeholder="Chọn giới tính"
                                            options={[
                                                { value: 'Nam', label: 'Nam' },
                                                { value: 'Nữ', label: 'Nữ' },
                                                { value: 'Khác', label: 'Khác' }
                                            ]}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        name="organization"
                                        label="Tổ chức/Công ty"
                                        rules={[
                                            {
                                                validator: (_, value) => {
                                                    if (!value) {
                                                        return Promise.resolve();
                                                    }

                                                    const normalizedValue = normalizeWhitespace(value);
                                                    const meaningfulCharacters =
                                                        normalizedValue?.match(/[\p{L}\p{N}]/gu)?.length || 0;

                                                    if (
                                                        normalizedValue.length <= 150 &&
                                                        meaningfulCharacters >= 2 &&
                                                        ORGANIZATION_PATTERN.test(normalizedValue)
                                                    ) {
                                                        return Promise.resolve();
                                                    }

                                                    return Promise.reject(
                                                        new Error(MSG_INVALID_ORGANIZATION)
                                                    );
                                                }
                                            }
                                        ]}
                                    >
                                        <Input
                                            className="h-11 rounded-lg"
                                            prefix={<ShopOutlined className="text-gray-300" />}
                                            placeholder="Nhập tổ chức/công ty"
                                            maxLength={150}
                                        />
                                    </Form.Item>
                                </div>

                                <Divider orientation="left" className="!mb-5 !mt-7 !text-sm !font-normal !text-gray-500">
                                    <EnvironmentOutlined className="mr-2" />
                                    Địa chỉ
                                </Divider>

                                <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
                                    <Form.Item
                                        name="province"
                                        label="Tỉnh/Thành phố"
                                        rules={[
                                            {
                                                validator: (_, value) => {
                                                    const ward = form.getFieldValue('ward');
                                                    if (!ward || value) return Promise.resolve();
                                                    return Promise.reject(
                                                        new Error(MSG_REQUIRED_PROVINCE)
                                                    );
                                                }
                                            }
                                        ]}
                                        dependencies={['ward']}
                                    >
                                        <Select
                                            className="h-11"
                                            placeholder="Chọn tỉnh/thành phố"
                                            showSearch
                                            loading={loadingProvinces}
                                            notFoundContent={loadingProvinces ? <Spin size="small" /> : 'Không tìm thấy'}
                                            optionFilterProp="label"
                                            onChange={handleProvinceChange}
                                            options={provinces.map((item) => ({
                                                value: item.name,
                                                label: item.name,
                                                code: item.code
                                            }))}
                                        />
                                    </Form.Item>

                                    <Form.Item
                                        name="ward"
                                        label="Phường/Xã"
                                        rules={[
                                            {
                                                validator: (_, value) => {
                                                    const province = form.getFieldValue('province');
                                                    if (!province || value) return Promise.resolve();
                                                    return Promise.reject(
                                                        new Error(MSG_REQUIRED_WARD)
                                                    );
                                                }
                                            }
                                        ]}
                                        dependencies={['province']}
                                    >
                                        <Select
                                            className="h-11"
                                            placeholder="Chọn phường/xã"
                                            showSearch
                                            disabled={!selectedProvinceCode}
                                            loading={loadingWards}
                                            notFoundContent={loadingWards ? <Spin size="small" /> : 'Không tìm thấy'}
                                            optionFilterProp="label"
                                            options={wards.map((item) => ({
                                                value: item.name,
                                                label: item.name
                                            }))}
                                        />
                                    </Form.Item>
                                </div>

                                <Form.Item
                                    name="address"
                                    label="Địa chỉ chi tiết"
                                    rules={[
                                        {
                                            validator: (_, value) => {
                                                if (!value) {
                                                    return Promise.resolve();
                                                }

                                                const normalizedValue = normalizeWhitespace(value);
                                                const meaningfulCharacters =
                                                    normalizedValue?.match(/[\p{L}\p{N}]/gu)?.length || 0;

                                                if (
                                                    normalizedValue.length <= 255 &&
                                                    meaningfulCharacters >= 2 &&
                                                    ADDRESS_PATTERN.test(normalizedValue)
                                                ) {
                                                    return Promise.resolve();
                                                }

                                                return Promise.reject(
                                                    new Error(MSG_INVALID_ADDRESS)
                                                );
                                            }
                                        }
                                    ]}
                                >
                                    <Input
                                        className="h-11 rounded-lg"
                                        prefix={<EnvironmentOutlined className="text-gray-300" />}
                                        placeholder="Số nhà, tên đường..."
                                        maxLength={255}
                                    />
                                </Form.Item>

                                <div className="mt-10 flex justify-end gap-3">
                                    <Button
                                        onClick={cancelEditing}
                                        disabled={updateMutation.isPending}
                                        className="h-10 rounded-lg px-5 font-semibold"
                                    >
                                        Hủy
                                    </Button>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        icon={<SaveOutlined />}
                                        loading={updateMutation.isPending}
                                        className="h-10 rounded-lg !border-0 !bg-green-500 px-6 font-semibold shadow-lg shadow-green-100 hover:!bg-green-600"
                                    >
                                        Lưu hồ sơ
                                    </Button>
                                </div>
                            </Form>
                        ) : (
                            <div>
                                <div className="divide-y divide-gray-100">
                                    {[
                                        {
                                            label: 'Số điện thoại',
                                            value: phone || 'Chưa cập nhật'
                                        },
                                        {
                                            label: 'Ngày sinh',
                                            value: user?.dateOfBirth && dayjs(user.dateOfBirth).isValid()
                                                ? dayjs(user.dateOfBirth).format('DD/MM/YYYY')
                                                : 'Chưa cập nhật'
                                        },
                                        {
                                            label: 'Giới tính',
                                            value: user?.gender || 'Chưa cập nhật'
                                        },
                                        {
                                            label: 'Địa chỉ',
                                            value: address || 'Chưa cập nhật'
                                        }
                                    ].map((item) => (
                                        <div
                                            key={item.label}
                                            className="grid gap-2 py-5 sm:grid-cols-[170px_1fr]"
                                        >
                                            <Text type="secondary" className="!text-sm !leading-6">
                                                {item.label}
                                            </Text>
                                            <Text strong className="!text-sm !leading-6">
                                                {item.value}
                                            </Text>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-end pt-7">
                                    <Button
                                        type="primary"
                                        icon={<EditOutlined />}
                                        onClick={startEditing}
                                        className="h-10 rounded-lg !border-0 !bg-green-600 px-5 font-semibold"
                                    >
                                        Thay đổi thông tin
                                    </Button>
                                </div>
                            </div>
                        )}
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default AccountInfo;
