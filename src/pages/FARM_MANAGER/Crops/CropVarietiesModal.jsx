import React, { useState } from 'react';
import {
  Button,
  Card,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  Skeleton,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
  Upload,
  message,
} from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import GrowthStages from 'src/components/GrowthStages';
import CropVarietyService from 'src/services/CropVarietyService';
import UploadService from 'src/services/UploadService';

const { Text } = Typography;

const CropVarietiesModal = ({ open, onCancel, cropId, cropName }) => {
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [isCreating, setIsCreating] = useState(false);
  const [editingVariety, setEditingVariety] = useState(null);
  const [uploading, setUploading] = useState(false);
  const watchedImageUrl = Form.useWatch('imageUrl', form);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['crop-varieties', cropId],
    queryFn: async () => {
      console.log('🔍 Fetching crop varieties for cropId:', cropId);
      const response = await CropVarietyService.getCropVarieties({ cropId });
      console.log('📦 API Response:', response);
      const payload = response?.data ?? response ?? {};
      const items = Array.isArray(payload?.data)
        ? payload.data
        : payload?.data?.items || payload?.items || [];
      
      // FRONTEND FILTER: Lọc theo cropId nếu backend không lọc
      const filteredItems = items.filter(item => {
        // Kiểm tra xem item có cropId khớp không
        return item.cropId === cropId || item.cropId === Number(cropId);
      });
      
      console.log('✅ All items:', items.length);
      console.log('✅ Filtered items for cropId', cropId, ':', filteredItems.length);
      return filteredItems;
    },
    enabled: !!cropId && open,
    retry: false,
  });

  const createMutation = useMutation({
    mutationFn: (values) => {
      const payload = {
        cropId: cropId,
        name: values.name.trim(),
        description: values.description?.trim() || null,
        expectedYield: values.expectedYield || null,
        imageUrl: values.imageUrl?.trim() || null,
        growthStages: values.growthStages || [],
      };
      return CropVarietyService.createCropVariety(payload);
    },
    onSuccess: () => {
      message.success('Tạo giống cây thành công.');
      setIsCreating(false);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['crop-varieties', cropId] });
    },
    onError: (error) => {
      message.error(
        error?.response?.data?.message || 'Không thể tạo giống cây.'
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }) => {
      const payload = {
        cropId: cropId,
        name: values.name.trim(),
        description: values.description?.trim() || null,
        expectedYield: values.expectedYield || null,
        imageUrl: values.imageUrl?.trim() || null,
        growthStages: values.growthStages || [],
      };
      return CropVarietyService.updateCropVariety(id, payload);
    },
    onSuccess: () => {
      message.success('Cập nhật giống cây thành công.');
      setEditingVariety(null);
      form.resetFields();
      queryClient.invalidateQueries({ queryKey: ['crop-varieties', cropId] });
    },
    onError: (error) => {
      message.error(
        error?.response?.data?.message || 'Không thể cập nhật giống cây.'
      );
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => CropVarietyService.deleteCropVariety(id),
    onSuccess: () => {
      message.success('Xóa giống cây thành công.');
      queryClient.invalidateQueries({ queryKey: ['crop-varieties', cropId] });
    },
    onError: (error) => {
      message.error(
        error?.response?.data?.message || 'Không thể xóa giống cây.'
      );
    },
  });

  const handleImageUpload = async ({ file, onSuccess, onError }) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await UploadService.uploadImage(formData);
      const payload = response?.data?.data || response?.data || {};
      const imageUrl =
        payload.imageUrl ||
        payload.url ||
        payload.secureUrl ||
        payload.fileUrl ||
        payload.path;

      if (!imageUrl) {
        throw new Error('Không nhận được đường dẫn ảnh sau khi upload.');
      }

      form.setFieldsValue({ imageUrl });
      message.success('Tải ảnh thành công.');
      onSuccess(response);
    } catch (error) {
      message.error(
        error?.response?.data?.message || 'Không thể tải ảnh. Vui lòng thử lại.'
      );
      onError(error);
    } finally {
      setUploading(false);
    }
  };

  const beforeUpload = (file) => {
    const validType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
    if (!validType) {
      message.error('Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.');
      return Upload.LIST_IGNORE;
    }
    if (file.size / 1024 / 1024 > 5) {
      message.error('Dung lượng ảnh không được vượt quá 5MB.');
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const openEditForm = (record) => {
    setEditingVariety(record);
    form.setFieldsValue({
      name: record.name || '',
      description: record.description || '',
      expectedYield: record.expectedYield || null,
      imageUrl: record.imageUrl || '',
      growthStages: record.growthStages || [],
    });
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa giống cây này không?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okButtonProps: { danger: true },
      onOk: () => deleteMutation.mutate(id),
    });
  };

  const columns = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Tên giống',
      dataIndex: 'name',
      key: 'name',
      render: (value, record) => (
        <div className="flex items-center gap-2">
          {record.imageUrl && (
            <img
              src={record.imageUrl}
              alt={value}
              className="h-10 w-10 rounded-lg object-cover"
            />
          )}
          <Text strong>{value}</Text>
        </div>
      ),
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (value) => value || <Text type="secondary">Chưa có mô tả</Text>,
    },
    {
      title: 'Năng suất dự kiến',
      dataIndex: 'expectedYield',
      key: 'expectedYield',
      width: 150,
      align: 'center',
      render: (value) =>
        value ? (
          <Tag color="green">{value} tấn/ha</Tag>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 120,
      align: 'center',
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Tooltip title="Sửa">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              className="!h-8 !w-8 text-green-600 hover:bg-green-50"
              onClick={() => openEditForm(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="text"
              size="small"
              danger
              icon={<DeleteOutlined />}
              loading={deleteMutation.isPending && deleteMutation.variables === record.id}
              className="!h-8 !w-8"
              onClick={() => handleDelete(record.id || record._id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Modal
        open={open}
        onCancel={onCancel}
        footer={null}
        width={1000}
        title={
          <span className="text-xl font-bold text-green-600">
            Quản lý giống cây: {cropName}
          </span>
        }
        destroyOnClose
      >
        <div className="space-y-4 pt-4">
          <div className="flex justify-end">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreating(true)}
              className="bg-green-500"
            >
              Thêm giống cây
            </Button>
          </div>

          {isLoading ? (
            <Skeleton active paragraph={{ rows: 4 }} />
          ) : (
            <Table
              rowKey={(record) => record.id || record._id}
              columns={columns}
              dataSource={data || []}
              pagination={false}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chưa có giống cây nào"
                  />
                ),
              }}
            />
          )}
        </div>
      </Modal>

      {/* Modal Create/Edit */}
      <Modal
        open={isCreating || !!editingVariety}
        onCancel={() => {
          setIsCreating(false);
          setEditingVariety(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
        title={
          <span className="text-xl font-bold text-green-600">
            {editingVariety ? 'Cập nhật giống cây' : 'Thêm giống cây'}
          </span>
        }
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          className="pt-4"
          onFinish={(values) =>
            editingVariety
              ? updateMutation.mutate({ id: editingVariety.id || editingVariety._id, values })
              : createMutation.mutate(values)
          }
        >
          <div className="grid grid-cols-1 gap-x-4 md:grid-cols-2">
            <Form.Item
              name="name"
              label="Tên giống"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: 'Vui lòng nhập tên giống.',
                },
              ]}
            >
              <Input className="h-11" placeholder="Nhập tên giống" />
            </Form.Item>

            <Form.Item name="expectedYield" label="Năng suất dự kiến (tấn/ha)">
              <InputNumber
                min={0}
                max={9999}
                className="!h-11 !w-full"
                placeholder="Nhập năng suất"
              />
            </Form.Item>

            <Form.Item name="imageUrl" label="Ảnh minh họa" className="md:col-span-2">
              <div className="space-y-3">
                <Upload
                  accept="image/png,image/jpeg,image/webp"
                  showUploadList={false}
                  beforeUpload={beforeUpload}
                  customRequest={handleImageUpload}
                >
                  <Button 
                    icon={<UploadOutlined />} 
                    loading={uploading}
                    className="h-11 rounded-lg"
                  >
                    {uploading ? 'Đang tải lên...' : 'Tải ảnh lên'}
                  </Button>
                </Upload>

                {/* Loading state */}
                {uploading && !watchedImageUrl && (
                  <div className="flex h-[200px] w-full items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-green-500 border-t-transparent"></div>
                      <Text type="secondary">Đang tải ảnh lên...</Text>
                    </div>
                  </div>
                )}

                {/* Preview ảnh sau khi upload xong */}
                {watchedImageUrl && !uploading && (
                  <div className="group relative h-[200px] w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                    <img
                      src={watchedImageUrl}
                      alt="Ảnh minh họa giống cây"
                      className="h-full w-full object-cover"
                    />
                    {/* Overlay với nút actions */}
                    <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        type="default"
                        size="large"
                        icon={<EyeOutlined />}
                        className="!h-12 !w-12 rounded-lg bg-white/20 text-white backdrop-blur-sm hover:!bg-white/30"
                        onClick={() => window.open(watchedImageUrl, '_blank')}
                      />
                      <Button
                        danger
                        size="large"
                        icon={<DeleteOutlined />}
                        className="!h-12 !w-12 rounded-lg"
                        onClick={() => form.setFieldsValue({ imageUrl: '' })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Form.Item>
          </div>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} placeholder="Nhập mô tả" />
          </Form.Item>

          <Form.Item name="growthStages" label="Giai đoạn sinh trưởng">
            <GrowthStages />
          </Form.Item>

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button
              onClick={() => {
                setIsCreating(false);
                setEditingVariety(null);
                form.resetFields();
              }}
            >
              Hủy
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createMutation.isPending || updateMutation.isPending}
              className="bg-green-500"
            >
              {editingVariety ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default CropVarietiesModal;
