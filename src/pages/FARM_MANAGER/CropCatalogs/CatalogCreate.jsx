import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Form, Input, Select } from 'antd';
import { ArrowLeftOutlined, SaveOutlined, FileTextOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import TitleCustom from 'src/components/TitleCustom';
import CropService from 'src/services/CropService';
import ROUTER from 'src/router/ROUTER';
import { useSystemKey } from 'src/hooks/useSystemKey';

const CatalogCreate = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { refetchSystemKey } = useSystemKey();
  const [inlineError, setInlineError] = useState('');

  const createMutation = useMutation({
    mutationFn: (values) => {
      const payload = {
        name: values.name.trim().replace(/\s+/g, ' '),
        description: values.description?.trim().replace(/\s+/g, ' ') || null,
        isActive: values.isActive ?? true,
      };
      return CropService.createCrop(payload);
    },
    onSuccess: async () => {
      setInlineError('');
      queryClient.invalidateQueries({ queryKey: ['crop-catalogs'] });
      queryClient.invalidateQueries({ queryKey: ['crop-catalogs-dropdown'] });
      await refetchSystemKey();
      navigate(ROUTER.FM_CROP_CATALOGS);
    },
    onError: () => {
      // axios interceptor handles error notification
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="h-10 rounded-lg"
        >
          Quay lại
        </Button>
        <TitleCustom className="!mb-0 flex items-center gap-2">
          <FileTextOutlined className="h-6 w-6" />
          Thêm danh mục cây trồng
        </TitleCustom>
      </div>

      <Card className="mx-auto max-w-3xl rounded-lg shadow-sm">
        <Form
          form={form}
          layout="vertical"
          initialValues={{ isActive: true }}
          onFinish={(values) => createMutation.mutate(values)}
          onFinishFailed={() => {}}
          scrollToFirstError
        >
          <Form.Item
            name="name"
            label="Tên loại cây trồng"
            rules={[
              { required: true, message: 'Vui lòng nhập tên loại cây trồng.' },
              {
                validator: (_, value) => {
                  if (!value || value.trim()) return Promise.resolve();
                  return Promise.reject(new Error('Tên loại cây trồng không được chỉ chứa khoảng trắng.'));
                },
              },
            ]}
          >
            <Input className="h-11 rounded-lg" placeholder="Nhập tên loại cây trồng" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea
              rows={4}
              className="rounded-lg"
              placeholder="Nhập mô tả danh mục cây trồng"
            />
          </Form.Item>

          <Form.Item name="isActive" label="Trạng thái">
            <Select
              className="h-11"
              options={[
                { value: true, label: 'Hoạt động' },
                { value: false, label: 'Ngừng hoạt động' },
              ]}
            />
          </Form.Item>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-6">
            <Button
              onClick={() => navigate(-1)}
              className="h-11 min-w-[100px] rounded-lg font-semibold"
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={createMutation.isPending}
              className="h-11 min-w-[120px] rounded-lg bg-green-500 font-semibold shadow-lg shadow-green-100"
            >
              Thêm mới
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default CatalogCreate;
