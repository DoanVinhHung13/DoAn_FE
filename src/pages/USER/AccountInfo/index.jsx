import React, { useEffect, useMemo, useState } from 'react';
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
  Typography,
  Upload,
  message,
} from 'antd';
import {
  CalendarOutlined,
  CameraOutlined,
  EditOutlined,
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  SaveOutlined,
  ShopOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';

import { useAppDispatch } from 'src/redux/hooks';
import { setUserInfo } from 'src/redux/slices/appGlobalSlice';
import TitleCustom from 'src/components/TitleCustom';
import { getProvinces, getWardsByProvince } from 'src/services/LocationService';
import UserService from 'src/services/UserService';
import { getAvatarUrl, getInitialAvatar, isValidPhone } from 'src/utils/helpers';

const { Text, Title } = Typography;

const fullNamePattern = /^[\p{L}\s]+$/u;
const organizationPattern = /^[\p{L}\d][\p{L}\d\s().,&/-]*$/u;
const addressPattern = /^[\p{L}\d\s,./#()-]+$/u;

const displayValue = (value) => value || 'Chưa cập nhật';

const AccountInfo = () => {
  const { userInfo: user } = useSelector((state) => state.appGlobal);
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [editing, setEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [uploadError, setUploadError] = useState('');
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);

  const watchedName = Form.useWatch('fullName', form);
  const watchedOrganization = Form.useWatch('organization', form);
  const watchedProvince = Form.useWatch('province', form);

  const initialValues = useMemo(
    () => ({
      fullName: user?.fullName || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      dateOfBirth: user?.dateOfBirth ? dayjs(user.dateOfBirth) : null,
      gender: user?.gender || undefined,
      organization: user?.organization || '',
      province: user?.province || undefined,
      ward: user?.ward || undefined,
      address: user?.address || '',
    }),
    [user]
  );

  useEffect(() => {
    form.setFieldsValue(initialValues);
    setAvatarUrl(user?.avatarUrl || '');
  }, [form, initialValues, user?.avatarUrl]);

  useEffect(() => {
    getProvinces().then(setProvinces);
  }, []);

  useEffect(() => {
    if (!watchedProvince) {
      setWards([]);
      return;
    }
    getWardsByProvince(watchedProvince).then(setWards);
  }, [watchedProvince]);

  const updateMutation = useMutation({
    mutationFn: (values) => {
      const payload = {
        fullName: values.fullName.trim().replace(/\s+/g, ' '),
        phoneNumber: values.phoneNumber?.trim() || null,
        dateOfBirth: values.dateOfBirth?.format('YYYY-MM-DD') || null,
      };
      return UserService.updateMyProfile(payload);
    },
    onSuccess: (response, values) => {
      const updated = response?.data?.data || response?.data || {};
      const province = provinces.find((item) => item.code === values.province);
      const ward = wards.find((item) => item.code === values.ward);
      const localValues = {
        fullName: values.fullName.trim().replace(/\s+/g, ' '),
        phoneNumber: values.phoneNumber?.trim() || null,
        dateOfBirth: values.dateOfBirth?.format('YYYY-MM-DD') || null,
        gender: values.gender || null,
        organization: values.organization?.trim().replace(/\s+/g, ' ') || null,
        province: values.province || null,
        provinceName: province?.fullName || province?.name || user?.provinceName,
        ward: values.ward || null,
        wardName: ward?.fullName || ward?.name || user?.wardName,
        address: values.address?.trim().replace(/\s+/g, ' ') || null,
      };
      dispatch(setUserInfo({ ...user, ...localValues, ...updated }));
      queryClient.invalidateQueries({ queryKey: ['users'] });
      message.success('Thông tin cá nhân đã được cập nhật thành công.');
      setEditing(false);
    },
    onError: (error) => {
      const apiMessage =
        error?.response?.data?.message ||
        error?.response?.data?.title ||
        error?.message ||
        '';
      const duplicatePhone =
        error?.response?.status === 409 ||
        /phone|điện thoại|số điện thoại/i.test(apiMessage) &&
          /exist|duplicate|đăng ký|tồn tại|trùng/i.test(apiMessage);

      if (duplicatePhone) {
        form.setFields([
          {
            name: 'phoneNumber',
            errors: ['Số điện thoại này đã được đăng ký. Vui lòng thử số khác.'],
          },
        ]);
        return;
      }
      message.error(apiMessage || 'Không thể cập nhật thông tin cá nhân.');
    },
  });

  const handleCancel = () => {
    form.setFieldsValue(initialValues);
    form.setFields([]);
    setEditing(false);
  };

  const handleAvatarUpload = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await UserService.uploadMyAvatar(formData);
      const payload = response?.data?.data || response?.data || {};
      const newAvatarUrl = payload.avatarUrl || payload.avatar || payload.url;
      setAvatarUrl(newAvatarUrl);
      dispatch(setUserInfo({ ...user, avatarUrl: newAvatarUrl }));
      message.success('Ảnh đại diện đã được cập nhật.');
      onSuccess(response);
    } catch (error) {
      setUploadError(
        error?.response?.data?.message || 'Không thể tải ảnh đại diện. Vui lòng thử lại.'
      );
      onError(error);
    }
  };

  const beforeAvatarUpload = (file) => {
    setUploadError('');
    const validType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
    if (!validType) {
      setUploadError('Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.');
      return Upload.LIST_IGNORE;
    }
    if (file.size / 1024 / 1024 > 5) {
      setUploadError('Dung lượng ảnh không được vượt quá 5MB.');
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const previewName = editing ? watchedName || user?.fullName : user?.fullName;
  const previewOrganization = editing
    ? watchedOrganization || user?.organization
    : user?.organization;
  const role = user?.role || user?.roles?.[0] || '';
  const addressText = [
    user?.address,
    user?.wardName || user?.ward,
    user?.provinceName || user?.province,
  ]
    .filter(Boolean)
    .join(', ');

  const summaryRow = (icon, label, value) => (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
        {icon}
      </div>
      <div className="min-w-0">
        <Text className="block !text-[10px] !font-semibold uppercase !text-gray-400">
          {label}
        </Text>
        <Text strong className="block break-words !text-sm">
          {displayValue(value)}
        </Text>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1180px] space-y-6">
      <TitleCustom className="!mb-0 flex items-center gap-2">
        <UserOutlined className="text-green-600" />
        Thông tin cá nhân
      </TitleCustom>

      <Row gutter={[24, 24]} align="stretch">
        <Col xs={24} lg={8} className="flex">
          <Card variant="borderless" className="w-full rounded-lg shadow-sm">
            <div className="flex h-full flex-col text-center">
              <div className="relative mx-auto mt-2 inline-block">
                <Avatar
                  size={116}
                  src={getAvatarUrl(avatarUrl)}
                  icon={!avatarUrl && <UserOutlined />}
                  className="border-4 border-white bg-green-50 text-5xl text-green-600 shadow-lg"
                >
                  {!avatarUrl && getInitialAvatar(previewName)}
                </Avatar>
                <Upload
                  showUploadList={false}
                  customRequest={handleAvatarUpload}
                  beforeUpload={beforeAvatarUpload}
                >
                  <Button
                    aria-label="Cập nhật ảnh đại diện"
                    shape="circle"
                    size="small"
                    icon={<CameraOutlined />}
                    className="absolute bottom-1 right-1 border-2 border-white bg-green-500 text-white"
                  />
                </Upload>
              </div>
              {uploadError && <Text type="danger" className="mt-2 !text-xs">{uploadError}</Text>}

              <Title level={4} className="!mb-1 !mt-7">
                {displayValue(previewName)}
              </Title>
              <Text className="!text-[10px] !font-bold uppercase tracking-widest !text-gray-400">
                {role}
              </Text>

              <Divider className="!my-7" />
              <div className="space-y-5 px-2 text-left">
                {summaryRow(<MailOutlined />, 'Email đăng nhập', user?.email)}
                {summaryRow(<ShopOutlined />, 'Tổ chức/Công ty', previewOrganization)}
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16} className="flex">
          <Card variant="borderless" className="w-full rounded-lg shadow-sm">
            {!editing ? (
              <div className="flex min-h-[520px] flex-col">
                <Title level={5} className="flex items-center gap-2 !mb-8">
                  <EditOutlined className="text-green-500" />
                  Thông tin cá nhân
                </Title>
                <div className="grid grid-cols-[150px_1fr] gap-x-7 gap-y-7 text-sm">
                  <Text type="secondary">Họ và tên</Text>
                  <Text strong>{displayValue(user?.fullName)}</Text>
                  <Text type="secondary">Số điện thoại</Text>
                  <Text strong>{displayValue(user?.phoneNumber)}</Text>
                  <Text type="secondary">Ngày sinh</Text>
                  <Text strong>
                    {user?.dateOfBirth
                      ? dayjs(user.dateOfBirth).format('DD/MM/YYYY')
                      : 'Chưa cập nhật'}
                  </Text>
                  <Text type="secondary">Giới tính</Text>
                  <Text strong>{displayValue(user?.gender)}</Text>
                  <Text type="secondary">Địa chỉ</Text>
                  <Text strong>{displayValue(addressText)}</Text>
                </div>
                <div className="mt-auto flex justify-end pt-10">
                  <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => setEditing(true)}
                    className="h-10 bg-green-500 px-5 font-semibold"
                  >
                    Thay đổi thông tin
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <Title level={5} className="flex items-center gap-2 !mb-6">
                  <EditOutlined className="text-green-500" />
                  Thay đổi thông tin
                </Title>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={(values) => updateMutation.mutate(values)}
                  onFinishFailed={() =>
                    message.error('Nhập liệu không hợp lệ. Vui lòng kiểm tra các trường được đánh dấu.')
                  }
                  scrollToFirstError
                >
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="fullName"
                        label="Họ và tên"
                        required
                        rules={[
                          { required: true, whitespace: true, message: 'Vui lòng nhập họ và tên.' },
                          { min: 2, max: 100, message: 'Họ và tên phải có từ 2 đến 100 ký tự.' },
                          {
                            pattern: fullNamePattern,
                            message: 'Họ và tên không hợp lệ. Vui lòng chỉ nhập chữ cái và khoảng trắng.',
                          },
                        ]}
                      >
                        <Input prefix={<UserOutlined className="text-gray-300" />} className="h-11" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="email" label="Địa chỉ Email">
                        <Input disabled prefix={<MailOutlined className="text-gray-300" />} className="h-11" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="phoneNumber"
                        label="Số điện thoại"
                        validateTrigger={['onBlur', 'onSubmit']}
                        rules={[
                          {
                            validator: (_, value) => {
                              if (!value?.trim() || isValidPhone(value.trim())) return Promise.resolve();
                              return Promise.reject(
                                new Error('Định dạng số điện thoại không hợp lệ. Vui lòng nhập số điện thoại hợp lệ.')
                              );
                            },
                          },
                        ]}
                      >
                        <Input prefix={<PhoneOutlined className="text-gray-300" />} className="h-11" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="dateOfBirth"
                        label="Ngày sinh"
                        required
                        rules={[
                          { required: true, message: 'Vui lòng chọn ngày sinh.' },
                          {
                            validator: (_, value) => {
                              if (!value) return Promise.resolve();
                              if (!dayjs(value).isValid() || value.isAfter(dayjs(), 'day')) {
                                return Promise.reject(new Error('Ngày sinh không hợp lệ.'));
                              }
                              if (dayjs().diff(value, 'year') < 15) {
                                return Promise.reject(new Error('Người dùng phải từ đủ 15 tuổi.'));
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                      >
                        <DatePicker
                          format="DD/MM/YYYY"
                          placeholder="Chọn ngày sinh"
                          className="h-11 w-full"
                          disabledDate={(current) => current && current > dayjs().endOf('day')}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="gender" label="Giới tính">
                        <Select
                          allowClear
                          placeholder="Chọn giới tính"
                          className="h-11"
                          options={[
                            { value: 'Nam', label: 'Nam' },
                            { value: 'Nữ', label: 'Nữ' },
                            { value: 'Khác', label: 'Khác' },
                          ]}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="organization"
                        label="Tổ chức/Công ty"
                        rules={[
                          {
                            validator: (_, value) => {
                              if (!value?.trim()) return Promise.resolve();
                              const normalized = value.trim();
                              const meaningful = normalized.match(/[\p{L}\d]/gu)?.length || 0;
                              if (
                                normalized.length < 2 ||
                                meaningful < 2 ||
                                !organizationPattern.test(normalized)
                              ) {
                                return Promise.reject(
                                  new Error('Tên tổ chức/công ty không hợp lệ.')
                                );
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                      >
                        <Input prefix={<ShopOutlined className="text-gray-300" />} className="h-11" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Divider orientation="left" plain>
                    <span className="flex items-center gap-2 text-gray-500">
                      <EnvironmentOutlined /> Địa chỉ
                    </span>
                  </Divider>

                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item name="province" label="Tỉnh/Thành phố">
                        <Select
                          allowClear
                          showSearch
                          optionFilterProp="label"
                          placeholder="Chọn tỉnh/thành phố"
                          className="h-11"
                          options={provinces.map((item) => ({
                            value: item.code,
                            label: item.fullName || item.name,
                          }))}
                          onChange={() => form.setFieldValue('ward', undefined)}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item name="ward" label="Phường/Xã">
                        <Select
                          allowClear
                          showSearch
                          disabled={!watchedProvince}
                          optionFilterProp="label"
                          placeholder="Chọn phường/xã"
                          className="h-11"
                          options={wards.map((item) => ({
                            value: item.code,
                            label: item.fullName || item.name,
                          }))}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item
                        name="address"
                        label="Địa chỉ chi tiết"
                        rules={[
                          {
                            validator: (_, value) => {
                              if (!value?.trim()) return Promise.resolve();
                              const normalized = value.trim();
                              if (
                                normalized.length < 3 ||
                                normalized.length > 200 ||
                                !addressPattern.test(normalized)
                              ) {
                                return Promise.reject(
                                  new Error('Địa chỉ chi tiết không hợp lệ.')
                                );
                              }
                              return Promise.resolve();
                            },
                          },
                        ]}
                      >
                        <Input
                          prefix={<EnvironmentOutlined className="text-gray-300" />}
                          placeholder="Số nhà, tên đường..."
                          className="h-11"
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <div className="flex justify-end gap-3 pt-3">
                    <Button onClick={handleCancel} className="h-10 px-5 font-semibold">
                      Hủy
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      loading={updateMutation.isPending}
                      className="h-10 bg-green-500 px-5 font-semibold"
                    >
                      Lưu hồ sơ
                    </Button>
                  </div>
                </Form>
              </>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AccountInfo;
