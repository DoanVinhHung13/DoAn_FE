import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  InboxOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import TitleCustom from 'src/components/TitleCustom';
import MaterialService from 'src/services/MaterialService';
import ROUTER from 'src/router/ROUTER';
import { MATERIAL_MESSAGES } from 'src/constants/messages/materials';

const { TextArea } = Input;

const MATERIAL_TYPE_OPTIONS = [
  { value: 'Phân bón', label: 'Phân bón' },
  { value: 'Thuốc bảo vệ thực vật', label: 'Thuốc bảo vệ thực vật' },
  { value: 'Giống cây', label: 'Giống cây' },
  { value: 'Dụng cụ', label: 'Dụng cụ' },
  { value: 'Khác', label: 'Khác' },
];

const MaterialCreate = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mutation để tạo vật tư mới
  const createMutation = useMutation({
    mutationFn: (data) => MaterialService.createMaterial(data),
    onSuccess: (response) => {
      const successMsg = response?.data?.message || response?.message;
      if (successMsg) message.success(successMsg);
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      navigate(ROUTER.MM_MATERIALS);
    },
    onError: (error) => {
      const apiMessage = error?.response?.data?.message || error?.message || '';
      
      // BR-AMM-01: Kiểm tra mã vật tư đã tồn tại
      if (/material.*code.*exist|mã.*tồn tại|duplicate.*code/i.test(apiMessage)) {
        form.setFields([
          {
            name: 'materialCode',
            errors: [MATERIAL_MESSAGES.CODE_EXISTS],
          },
        ]);
      }
      // BR-AMM-06: Kiểm tra tên vật tư đã tồn tại
      else if (/material.*name.*exist|tên.*tồn tại|duplicate.*name/i.test(apiMessage)) {
        form.setFields([
          {
            name: 'name',
            errors: [MATERIAL_MESSAGES.NAME_EXISTS],
          },
        ]);
      } else if (apiMessage) {
        message.error(apiMessage);
      }
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  // Handle form submit
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const values = await form.validateFields();

      // Chuẩn bị payload
      const payload = {
        materialCode: values.materialCode.trim(),
        name: values.name.trim(),
        type: values.type,
        quantity: values.quantity || 0,
        unit: values.unit?.trim() || '',
        manufacturer: values.manufacturer?.trim() || '',
        supplier: values.supplier?.trim() || '',
        description: values.description?.trim() || '',
        isActive: true, // Mặc định khi tạo mới là active
      };

      createMutation.mutate(payload);
    } catch (error) {
      // Validation errors từ form
      setIsSubmitting(false);
      message.warning(MATERIAL_MESSAGES.REQUIRED_FIELDS); // MSG-AMM-07
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate(ROUTER.MM_MATERIALS);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={handleCancel}
          className="h-10 rounded-lg"
        >
          Quay lại
        </Button>
        <TitleCustom className="!mb-0 flex items-center gap-2">
          <InboxOutlined className="text-2xl text-green-600" />
          Thêm vật tư nông nghiệp
        </TitleCustom>
      </div>

      {/* Form Card */}
      <Card className="rounded-lg shadow-sm">
        <Form
          form={form}
          layout="vertical"
          autoComplete="off"
          requiredMark="optional"
        >
          <Row gutter={24}>
            {/* Left Column */}
            <Col xs={24} lg={12}>
              <Card
                title={
                  <span className="text-base font-semibold text-green-600">
                    Thông tin cơ bản
                  </span>
                }
                className="mb-6 rounded-lg border border-gray-200"
              >
                {/* Material Code - BR-AMM-01: Must be unique */}
                <Form.Item
                  name="materialCode"
                  label="Mã vật tư"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mã vật tư' },
                    {
                      pattern: /^[A-Za-z0-9_-]+$/,
                      message: 'Mã vật tư chỉ chứa chữ, số, gạch ngang và gạch dưới',
                    },
                    {
                      max: 50,
                      message: 'Mã vật tư không được vượt quá 50 ký tự',
                    },
                  ]}
                  extra="Mã vật tư phải là duy nhất trong hệ thống"
                >
                  <Input
                    placeholder="Ví dụ: VT001"
                    maxLength={50}
                    className="h-11 rounded-lg"
                  />
                </Form.Item>

                {/* Material Name - BR-AMM-06: Must be unique */}
                <Form.Item
                  name="name"
                  label="Tên vật tư"
                  rules={[
                    { required: true, message: 'Vui lòng nhập tên vật tư' },
                    {
                      max: 200,
                      message: 'Tên vật tư không được vượt quá 200 ký tự',
                    },
                  ]}
                  extra="Tên vật tư phải là duy nhất trong hệ thống"
                >
                  <Input
                    placeholder="Ví dụ: Phân NPK 16-16-8"
                    maxLength={200}
                    className="h-11 rounded-lg"
                  />
                </Form.Item>

                {/* Material Type */}
                <Form.Item
                  name="type"
                  label="Loại vật tư"
                  rules={[{ required: true, message: 'Vui lòng chọn loại vật tư' }]}
                >
                  <Select
                    placeholder="Chọn loại vật tư"
                    options={MATERIAL_TYPE_OPTIONS}
                    className="h-11"
                  />
                </Form.Item>

                {/* Quantity and Unit */}
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name="quantity"
                      label="Số lượng"
                      rules={[
                        { required: true, message: 'Vui lòng nhập số lượng' },
                      ]}
                      initialValue={0}
                    >
                      <InputNumber
                        placeholder="0"
                        min={0}
                        precision={2}
                        className="h-11 w-full rounded-lg"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="unit"
                      label="Đơn vị"
                      rules={[{ required: true, message: 'Vui lòng nhập đơn vị' }]}
                    >
                      <Input
                        placeholder="Ví dụ: kg, lít, bao"
                        maxLength={50}
                        className="h-11 rounded-lg"
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Card>
            </Col>

            {/* Right Column */}
            <Col xs={24} lg={12}>
              <Card
                title={
                  <span className="text-base font-semibold text-green-600">
                    Thông tin bổ sung
                  </span>
                }
                className="mb-6 rounded-lg border border-gray-200"
              >
                {/* Manufacturer/Supplier */}
                <Form.Item
                  name="manufacturer"
                  label="Nhà sản xuất"
                >
                  <Input
                    placeholder="Tên nhà sản xuất"
                    maxLength={200}
                    className="h-11 rounded-lg"
                  />
                </Form.Item>

                <Form.Item
                  name="supplier"
                  label="Nhà cung cấp"
                >
                  <Input
                    placeholder="Tên nhà cung cấp"
                    maxLength={200}
                    className="h-11 rounded-lg"
                  />
                </Form.Item>

                {/* Description */}
                <Form.Item
                  name="description"
                  label="Mô tả"
                >
                  <TextArea
                    placeholder="Mô tả chi tiết về vật tư..."
                    rows={8}
                    maxLength={1000}
                    showCount
                    className="rounded-lg"
                  />
                </Form.Item>
              </Card>
            </Col>
          </Row>

          {/* Action Buttons */}
          <Card className="rounded-lg border border-gray-200 bg-gray-50">
            <div className="flex justify-end gap-3">
              <Button
                size="large"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="min-w-[120px] rounded-lg"
              >
                Hủy
              </Button>
              <Button
                type="primary"
                size="large"
                icon={<SaveOutlined />}
                onClick={handleSubmit}
                loading={isSubmitting}
                className="min-w-[120px] rounded-lg bg-green-500 font-semibold shadow-lg shadow-green-100"
              >
                Lưu
              </Button>
            </div>
          </Card>
        </Form>
      </Card>
    </div>
  );
};

export default MaterialCreate;
