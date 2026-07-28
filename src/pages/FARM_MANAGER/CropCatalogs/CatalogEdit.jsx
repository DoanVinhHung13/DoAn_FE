import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  Spin,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  FileTextOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import TitleCustom from 'src/components/TitleCustom';
import CropService from 'src/services/CropService';
import ROUTER from 'src/router/ROUTER';

const EMPTY_MESSAGE = 'Không tìm thấy thông tin danh mục cây trồng.';

const CatalogEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();

  const {
    data: catalogDetail,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['crop-catalog-detail', id],
    queryFn: async () => {
      const response = await CropService.getCropById(id);
      const payload = response?.data ?? {};
      return payload?.data ?? payload;
    },
    enabled: !!id,
    retry: false,
  });

  useEffect(() => {
    if (catalogDetail) {
      form.setFieldsValue({
        name: catalogDetail.name || catalogDetail.cropCatalogName || '',
        description: catalogDetail.description || '',
      });
    }
  }, [catalogDetail, form]);

  const updateMutation = useMutation({
    mutationFn: (values) => {
      const payload = {
        name: values.name.trim().replace(/\s+/g, ' '),
        description: values.description?.trim().replace(/\s+/g, ' ') || null,
        isActive: typeof catalogDetail?.isActive === 'boolean' ? catalogDetail.isActive : true,
      };
      return CropService.updateCrop(id, payload);
    },
    onSuccess: (response) => {
      const successMsg = response?.data?.message || response?.message;
      if (successMsg) message.success(successMsg);
      queryClient.invalidateQueries({ queryKey: ['crop-catalogs'] });
      queryClient.invalidateQueries({ queryKey: ['crop-catalogs-dropdown'] });
      queryClient.invalidateQueries({ queryKey: ['crop-catalog-detail', id] });
      queryClient.invalidateQueries({ queryKey: ['system-key'] });
      navigate(ROUTER.FM_CROP_CATALOGS);
    },
    onError: (error) => {
      if (error?.response?.status === 404) {
        navigate(ROUTER.FM_CROP_CATALOGS);
        return;
      }
      const errorMsg = error?.response?.data?.message || error?.response?.data?.title || error?.message;
      if (errorMsg) message.error(errorMsg);
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTER.FM_CROP_CATALOGS)}
            className="h-10"
          >
            Quay lại
          </Button>
          <TitleCustom className="!mb-0">Chỉnh sửa danh mục cây trồng</TitleCustom>
        </div>
        <Alert
          showIcon
          type="error"
          message="Không thể tải thông tin danh mục cây trồng."
          action={
            <Button size="small" onClick={() => refetch()}>
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  if (!catalogDetail) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTER.FM_CROP_CATALOGS)}
            className="h-10"
          >
            Quay lại
          </Button>
          <TitleCustom className="!mb-0">Chỉnh sửa danh mục cây trồng</TitleCustom>
        </div>
        <Card>
          <Alert showIcon type="warning" message={EMPTY_MESSAGE} />
        </Card>
      </div>
    );
  }

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
          Chỉnh sửa danh mục cây trồng
        </TitleCustom>
      </div>

      <Card className="mx-auto max-w-3xl rounded-lg shadow-sm">
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => updateMutation.mutate(values)}
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
                  return Promise.reject(
                    new Error('Tên loại cây trồng không được chỉ chứa khoảng trắng.')
                  );
                },
              },
            ]}
          >
            <Input
              className="h-11 rounded-lg"
              placeholder="Nhập tên loại cây trồng"
            />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea
              rows={6}
              className="rounded-lg"
              placeholder="Nhập mô tả danh mục cây trồng"
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
              loading={updateMutation.isPending}
              className="h-11 min-w-[120px] rounded-lg bg-green-500 font-semibold shadow-lg shadow-green-100"
            >
              Lưu thay đổi
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default CatalogEdit;
