import {
  CameraOutlined,
  EditOutlined,
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  SaveOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
} from "antd";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import TitleCustom from "src/components/TitleCustom";
import { SYSTEM_KEY } from "src/constants/systemKey";
import { useSystemKey } from "src/hooks/useSystemKey";
import { useAppDispatch } from "src/redux/hooks";
import authSession from "src/redux/authSession";
import { setUserInfo } from "src/redux/slices/appGlobalSlice";
import UserService from "src/services/UserService";
import { applyApiFieldErrors, getApiMessage } from "src/services/core/apiError";
import { getAvatarUrl, getInitialAvatar } from "src/utils/helpers";
import {
  formatDate,
  formatDateForApi,
  getLocalNow,
  parseDate,
} from "src/utils/dateFormatters";

const { Text, Title } = Typography;

const PROFILE_FIELD_MAPPING = {
  FullName: "fullName",
  PhoneNumber: "phoneNumber",
  DateOfBirth: "dateOfBirth",
  Gender: "gender",
  Address: "address",
};

const displayValue = (value) => value || "Chưa cập nhật";

const fullNamePattern = /^[\p{L}\s]+$/u;
const addressPattern = /^[\p{L}\p{N}\s,.\-/]+$/u;

const isValidPhone = (phone) => {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  return /^(\+84|84|0)[0-9]{9,10}$/.test(cleaned);
};

const AccountInfo = () => {
  const { userInfo: user } = useSelector((state) => state.appGlobal);
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const { getCombo, getDescription } = useSystemKey();
  const genderOptions = getCombo(SYSTEM_KEY.GENDER);
  const [form] = Form.useForm();
  const [editing, setEditing] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [uploadError, setUploadError] = useState("");
  const watchedName = Form.useWatch("fullName", form);

  const initialValues = useMemo(
    () => ({
      fullName: user?.fullName || "",
      email: user?.email || "",
      phoneNumber: user?.phoneNumber || "",
      dateOfBirth: user?.dateOfBirth ? parseDate(user.dateOfBirth) : null,
      gender: user?.gender || undefined,
      address: user?.address || "",
    }),
    [user]
  );

  useEffect(() => {
    form.setFieldsValue(initialValues);
  }, [form, initialValues]);

  const updateMutation = useMutation({
    mutationFn: async (values) => {
      const payload = {
        fullName: values.fullName.trim().replace(/\s+/g, " "),
        phoneNumber: values.phoneNumber?.trim() || null,
        dateOfBirth: formatDateForApi(values.dateOfBirth),
        gender: values.gender || null,
        address: values.address?.trim().replace(/\s+/g, " ") || null,
      };
      return await UserService.updateMyProfile(payload, {
        errorHandling: "form",
        fieldErrorMapping: PROFILE_FIELD_MAPPING,
      });
    },
    onSuccess: (response, values) => {
      const updated = response?.data || {};
      const nextUser = {
        ...user,
        fullName: values.fullName?.trim(),
        phoneNumber: values.phoneNumber?.trim() || null,
        gender: values.gender || null,
        dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format("YYYY-MM-DD") : null,
        ...updated,
      };
      dispatch(setUserInfo(nextUser));
      authSession.updateUser(nextUser);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEditing(false);
    },
    onError: (error) => {
      applyApiFieldErrors(form, error, PROFILE_FIELD_MAPPING)
    },
  });

  const handleCancel = () => {
    form.setFieldsValue(initialValues);
    form.setFields([]);
    setEditing(false);
  };

  const handleAvatarUpload = async ({ file, onSuccess, onError }) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await UserService.uploadMyAvatar(formData);
      const payload = response?.data?.data || response?.data || {};
      const newAvatarUrl = payload.avatarUrl || payload.avatar || payload.url;

      setAvatarUrl(newAvatarUrl);
      const nextUser = { ...user, avatarUrl: newAvatarUrl };
      dispatch(setUserInfo(nextUser));
      authSession.updateUser(nextUser);
      onSuccess(response);
    } catch (error) {
      const errorMsg = getApiMessage(error?.responseData || error);
      if (errorMsg) {
        setUploadError(errorMsg);
      }
      onError(error);
    }
  };

  const beforeAvatarUpload = (file) => {
    setUploadError("");
    const validType = ["image/jpeg", "image/png", "image/webp"].includes(file.type);
    if (!validType) {
      setUploadError("Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.");
      return Upload.LIST_IGNORE;
    }
    if (file.size / 1024 / 1024 > 5) {
      setUploadError("Dung lượng ảnh không được vượt quá 5MB.");
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const previewName = editing ? watchedName || user?.fullName : user?.fullName;
  const role = user?.role || user?.roles?.[0] || "";
  const addressText = [user?.address].filter(Boolean).join(", ");

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
          <Card className="w-full rounded-lg shadow-sm">
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

              {uploadError && (
                <Text type="danger" className="mt-2 !text-xs">
                  {uploadError}
                </Text>
              )}

              <Title level={4} className="!mb-1 !mt-7">
                {displayValue(previewName)}
              </Title>
              <Text className="!text-[10px] !font-bold uppercase tracking-widest !text-gray-400">
                {role}
              </Text>

              <Divider className="!my-7" />

              <div className="space-y-5 px-2 text-left">
                {summaryRow(<MailOutlined />, "Email đăng nhập", user?.email)}
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16} className="flex">
          <Card className="w-full rounded-lg shadow-sm">
            {!editing ? (
              <div className="flex min-h-[520px] flex-col">
                <Title level={5} className="!mb-8 flex items-center gap-2">
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
                      ? formatDate(user.dateOfBirth)
                      : "Chưa cập nhật"}
                  </Text>

                  <Text type="secondary">Giới tính</Text>
                  <Text strong>
                    {displayValue(
                      getDescription(SYSTEM_KEY.GENDER, user?.gender) || user?.gender
                    )}
                  </Text>

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
                <Title level={5} className="!mb-6 flex items-center gap-2">
                  <EditOutlined className="text-green-500" />
                  Thay đổi thông tin
                </Title>

                <Form
                  form={form}
                  layout="vertical"
                  onFinish={(values) => updateMutation.mutate(values)}
                  onFinishFailed={() => {}}
                  scrollToFirstError
                >
                  <Row gutter={16}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="fullName"
                        label="Họ và tên"
                        required
                        rules={[
                          {
                            required: true,
                            whitespace: true,
                            message: "Vui lòng nhập họ và tên.",
                          },
                          {
                            min: 2,
                            max: 100,
                            message: "Họ và tên phải có từ 2 đến 100 ký tự.",
                          },
                          {
                            pattern: fullNamePattern,
                            message:
                              "Họ và tên không hợp lệ. Vui lòng chỉ nhập chữ cái và khoảng trắng.",
                          },
                        ]}
                      >
                        <Input
                          prefix={<UserOutlined className="text-gray-300" />}
                          className="h-11"
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item name="email" label="Địa chỉ Email">
                        <Input
                          disabled
                          prefix={<MailOutlined className="text-gray-300" />}
                          className="h-11"
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        name="phoneNumber"
                        label="Số điện thoại"
                        validateTrigger={["onBlur", "onSubmit"]}
                        rules={[
                          {
                            validator: (_, value) => {
                              if (!value?.trim() || isValidPhone(value.trim()))
                                return Promise.resolve();
                              return Promise.reject(
                                new Error(
                                  "Định dạng số điện thoại không hợp lệ. Vui lòng nhập số điện thoại hợp lệ."
                                )
                              );
                            },
                          },
                        ]}
                      >
                        <Input
                          prefix={<PhoneOutlined className="text-gray-300" />}
                          className="h-11"
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item
                        name="dateOfBirth"
                        label="Ngày sinh"
                        required
                        rules={[
                          { required: true, message: "Vui lòng chọn ngày sinh." },
                          {
                            validator: (_, value) => {
                              if (!value) return Promise.resolve();
                              if (!dayjs(value).isValid() || value.isAfter(getLocalNow(), "day")) {
                                return Promise.reject(new Error("Ngày sinh không hợp lệ."));
                              }
                              if (getLocalNow().diff(value, "year") < 15) {
                                return Promise.reject(
                                  new Error("Người dùng phải từ đủ 15 tuổi.")
                                );
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
                          disabledDate={(current) =>
                            current && current > getLocalNow().endOf("day")
                          }
                        />
                      </Form.Item>
                    </Col>

                    <Col xs={24} md={12}>
                      <Form.Item name="gender" label="Giới tính">
                        <Select
                          allowClear
                          placeholder="Chọn giới tính"
                          className="h-11"
                          options={
                            genderOptions?.length > 0
                              ? genderOptions.map((opt) => ({
                                  value: opt.codeValue || opt.CodeValue,
                                  label: opt.description || opt.Description,
                                }))
                              : [
                                  { value: "Nam", label: "Nam" },
                                  { value: "Nữ", label: "Nữ" },
                                  { value: "Khác", label: "Khác" },
                                ]
                          }
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Divider orientation="left" plain>
                    <span className="flex items-center gap-2 text-gray-500">
                      <EnvironmentOutlined /> Địa chỉ
                    </span>
                  </Divider>

                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item
                        name="address"
                        label=""
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
                                  new Error("Địa chỉ chi tiết không hợp lệ.")
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
