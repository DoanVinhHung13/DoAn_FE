import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Spin,
  Upload,
  message,
} from 'antd';
import {
  ArrowLeftOutlined,
  DeleteOutlined,
  EyeOutlined,
  SaveOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Sprout } from 'lucide-react';

import TitleCustom from 'src/components/TitleCustom';
// import GrowthStages from 'src/components/GrowthStages'; // TODO: Sẽ quản lý riêng qua CropVarieties API
import CropManagementService from 'src/services/CropManagementService';
import CropService from 'src/services/CropService';
import UploadService from 'src/services/UploadService';
import ROUTER from 'src/router/ROUTER';
import { useSystemKey } from 'src/hooks/useSystemKey';
import { SYSTEM_KEY } from 'src/constants/systemKey';

const EMPTY_MESSAGE = 'Không tìm thấy thông tin cây trồng.';

const CropEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const watchedImageUrl = Form.useWatch('imageUrl', form);
  const [previewImage, setPreviewImage] = useState(null); // State cho modal xem ảnh
  const [uploading, setUploading] = useState(false); // Loading state khi upload

  // SystemKey hook
  const { getCombo } = useSystemKey();
  const cropTypeOptions = getCombo(SYSTEM_KEY.CROP_TYPE);

  const {
    data: cropDetail,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['crop-detail', id],
    queryFn: async () => {
      const response = await CropManagementService.getCropById(id);
      const payload = response?.data ?? {};
      return payload?.data ?? payload;
    },
    enabled: !!id,
    retry: false,
  });

  // Query to get crop catalogs for the dropdown
  const { data: cropCatalogsData, isLoading: isCatalogsLoading } = useQuery({
    queryKey: ['crop-catalogs-dropdown'],
    queryFn: async () => {
      try {
        const response = await CropService.getCrops({ PageIndex: 1, PageSize: 100 });
        const payload = response?.data ?? response ?? {};
        const data = payload?.data ?? payload;
        const items = Array.isArray(data)
          ? data
          : data?.items || data?.results || data?.crops || data?.cropCatalogs || [];
        return items.filter(item => {
          if (typeof item?.isActive === 'boolean') return item.isActive;
          const status = String(item?.status || '').toLowerCase();
          return !['inactive', 'disabled', 'deleted'].includes(status);
        });
      } catch (err) {
        return [];
      }
    },
    retry: false,
  });

  const cropCatalogOptions = useMemo(() => {
    if (!cropCatalogsData || cropCatalogsData.length === 0) {
      return [];
    }
    return cropCatalogsData.map((catalog) => ({
      value: catalog.name || catalog.cropCatalogName,
      label: catalog.name || catalog.cropCatalogName,
    }));
  }, [cropCatalogsData]);

  // Create options ưu tiên SystemKey, fallback Crop Catalogs
  const cropTypeFormOptions = useMemo(() => {
    if (cropTypeOptions && cropTypeOptions.length > 0) {
      return cropTypeOptions.map((opt) => ({
        value: opt.codeValue || opt.CodeValue,
        label: opt.description || opt.Description,
      }));
    }
    if (cropCatalogOptions && cropCatalogOptions.length > 0) {
      return cropCatalogOptions;
    }
    return [];
  }, [cropTypeOptions, cropCatalogOptions]);

  useEffect(() => {
    if (cropDetail) {
      form.setFieldsValue({
        name: cropDetail.name || '',
        cropCode: cropDetail.cropCode || '',
        cropType: cropDetail.cropType || '',
        description: cropDetail.description || '',
        growthDurationDays: cropDetail.growthDurationDays || null,
        imageUrl: cropDetail.imageUrl || '',
        recommendedCultivationConditions:
          cropDetail.recommendedCultivationConditions || '',
        // growthStages: cropDetail.growthStages || [], // TODO: Quản lý riêng qua CropVarieties
      });
    }
  }, [cropDetail, form]);

  const updateMutation = useMutation({
    mutationFn: (values) => {
      const payload = {
        name: values.name.trim().replace(/\s+/g, ' '),
        cropCode: values.cropCode?.trim().replace(/\s+/g, ' ') || null,
        cropType: values.cropType?.trim().replace(/\s+/g, ' ') || null,
        description: values.description?.trim().replace(/\s+/g, ' ') || null,
        growthDurationDays: values.growthDurationDays || null,
        imageUrl: values.imageUrl?.trim() || '', // Gửi string rỗng thay vì null
        recommendedCultivationConditions:
          values.recommendedCultivationConditions?.trim().replace(/\s+/g, ' ') || null,
        isActive: typeof cropDetail?.isActive === 'boolean' ? cropDetail.isActive : true,
      };
      console.log('🔄 Payload gửi lên server:', payload);
      console.log('📷 ImageUrl:', payload.imageUrl === '' ? 'EMPTY STRING (sẽ xóa ảnh)' : payload.imageUrl);
      // TODO: Quản lý CropVarieties qua API riêng /api/crop-varieties
      // const growthStages = values.growthStages || [];
      return CropManagementService.updateCrop(id, payload);
    },
    onSuccess: (response) => {
      console.log('✅ Update Crop Response:', response);
      message.success('Cập nhật cây trồng thành công.');
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      queryClient.invalidateQueries({ queryKey: ['crop-detail', id] });
      navigate(ROUTER.FM_CROPS);
    },
    onError: (error) => {
      if (error?.response?.status === 404) {
        message.error(EMPTY_MESSAGE);
        navigate(ROUTER.FM_CROPS);
        return;
      }
      message.error(
        error?.response?.data?.message ||
          error?.response?.data?.title ||
          'Không thể cập nhật cây trồng.'
      );
    },
  });

  const beforeCropImageUpload = (file) => {
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

  const handleCropImageUpload = async ({ file, onSuccess, onError }) => {
    setUploading(true);

    console.log('📤 Bắt đầu upload ảnh:', file);
    const formData = new FormData();
    formData.append('file', file);
    console.log('📦 FormData created');

    try {
      console.log('🔄 Đang gọi API /v1/media/upload...');
      const response = await UploadService.uploadImage(formData);
      console.log('✅ Upload response:', response);
      
      const payload = response?.data?.data || response?.data || {};
      console.log('📦 Payload:', payload);
      
      const imageUrl =
        payload.imageUrl ||
        payload.url ||
        payload.secureUrl ||
        payload.fileUrl ||
        payload.path;

      console.log('🖼️ ImageUrl:', imageUrl);

      if (!imageUrl) {
        throw new Error('Không nhận được đường dẫn ảnh sau khi upload.');
      }

      // Cập nhật URL thật từ server sau khi upload xong
      form.setFieldsValue({ imageUrl });
      message.success('Tải ảnh minh họa thành công.');
      onSuccess(response);
    } catch (error) {
      console.error('❌ Upload error:', error);
      console.error('❌ Error details:', {
        status: error?.response?.status,
        data: error?.response?.data,
        message: error?.message
      });
      message.error(
        error?.response?.data?.message ||
          error?.message ||
          'Không thể tải ảnh minh họa. Vui lòng thử lại.'
      );
      onError(error);
    } finally {
      setUploading(false);
    }
  };

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
            onClick={() => navigate(ROUTER.FM_CROPS)}
            className="h-10"
          >
            Quay lại
          </Button>
          <TitleCustom className="!mb-0">Chỉnh sửa cây trồng</TitleCustom>
        </div>
        <Alert
          showIcon
          type="error"
          message="Không thể tải thông tin cây trồng."
          action={
            <Button size="small" onClick={() => refetch()}>
              Thử lại
            </Button>
          }
        />
      </div>
    );
  }

  if (!cropDetail) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTER.FM_CROPS)}
            className="h-10"
          >
            Quay lại
          </Button>
          <TitleCustom className="!mb-0">Chỉnh sửa cây trồng</TitleCustom>
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
          <Sprout className="h-6 w-6" />
          Chỉnh sửa cây trồng
        </TitleCustom>
      </div>

      <Card className="rounded-lg shadow-sm">
        <Form
          form={form}
          layout="vertical"
          onFinish={(values) => updateMutation.mutate(values)}
          onFinishFailed={() =>
            message.error('Vui lòng điền đầy đủ các thông tin bắt buộc.')
          }
          scrollToFirstError
        >
          <div className="grid grid-cols-1 gap-x-6 md:grid-cols-2">
            <Form.Item
              name="name"
              label="Tên cây trồng"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: 'Vui lòng nhập tên cây trồng.',
                },
                { max: 150, message: 'Tên cây trồng không được vượt quá 150 ký tự.' },
              ]}
            >
              <Input className="h-11 rounded-lg" placeholder="Nhập tên cây trồng" />
            </Form.Item>

            <Form.Item
              name="cropCode"
              label="Mã cây"
              rules={[
                { max: 50, message: 'Mã cây không được vượt quá 50 ký tự.' },
              ]}
            >
              <Input className="h-11 rounded-lg" placeholder="Nhập mã cây" />
            </Form.Item>

            <Form.Item
              name="cropType"
              label="Danh mục"
              rules={[
                { required: true, message: 'Vui lòng chọn danh mục.' },
              ]}
            >
              <Select
                className="h-11"
                placeholder={cropTypeOptions?.length > 0 ? "Chọn danh mục" : "Chọn danh mục từ danh sách"}
                loading={isCatalogsLoading && !cropTypeOptions?.length}
                options={cropTypeFormOptions}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                notFoundContent={
                  isCatalogsLoading ? (
                    <span>Đang tải...</span>
                  ) : (
                    <span>Không có dữ liệu. Vui lòng cấu hình SystemKey hoặc tạo danh mục cây trồng.</span>
                  )
                }
                disabled={!cropTypeFormOptions || cropTypeFormOptions.length === 0}
              />
            </Form.Item>

            <Form.Item name="imageUrl" label="Ảnh minh họa">
              <div className="space-y-3">
                <Upload
                  accept="image/png,image/jpeg,image/webp"
                  showUploadList={false}
                  beforeUpload={beforeCropImageUpload}
                  customRequest={(options) => handleCropImageUpload(options)}
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
                  <div className="flex h-[120px] w-[140px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50">
                    <Spin />
                  </div>
                )}

                {/* Preview ảnh sau khi upload xong */}
                {watchedImageUrl && !uploading && (
                  <div className="group relative h-[120px] w-[140px] overflow-hidden rounded-lg border border-gray-200 bg-gray-50 p-1">
                    <img
                      src={watchedImageUrl}
                      alt="Ảnh minh họa cây trồng"
                      className="h-full w-full rounded-md object-cover"
                    />
                    <div className="absolute inset-1 flex items-center justify-center gap-2 rounded-md bg-black/45 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        type="text"
                        size="small"
                        icon={<EyeOutlined />}
                        className="!h-8 !w-8 !text-white hover:!bg-white/20"
                        onClick={() => setPreviewImage(watchedImageUrl)}
                      />
                      <Button
                        type="text"
                        size="small"
                        icon={<DeleteOutlined />}
                        className="!h-8 !w-8 !text-white hover:!bg-white/20"
                        onClick={() => form.setFieldsValue({ imageUrl: '' })}
                      />
                    </div>
                  </div>
                )}
              </div>
            </Form.Item>
          </div>

          <Form.Item name="recommendedCultivationConditions" label="Điều kiện canh tác khuyến nghị">
            <Input.TextArea
              rows={4}
              className="rounded-lg"
              placeholder="Nhập điều kiện canh tác khuyến nghị"
            />
          </Form.Item>

          <Form.Item name="description" label="Mô tả">
            <Input.TextArea
              rows={4}
              className="rounded-lg"
              placeholder="Nhập mô tả về cây trồng"
            />
          </Form.Item>

          {/* TODO: Giai đoạn sinh trưởng sẽ được quản lý riêng qua CropVarieties API */}
          {/* <Form.Item name="growthStages" label="Giai đoạn sinh trưởng">
            <GrowthStages />
          </Form.Item> */}

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

      {/* Modal xem ảnh */}
      <Modal
        open={!!previewImage}
        onCancel={() => setPreviewImage(null)}
        footer={null}
        centered
        width="auto"
        styles={{
          body: { padding: 0 },
        }}
        closeIcon={
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70">
            ×
          </span>
        }
      >
        <div className="relative max-h-[80vh] max-w-[90vw]">
          <img
            src={previewImage}
            alt="Xem ảnh"
            className="max-h-[80vh] max-w-full rounded-lg object-contain"
            style={{ display: 'block' }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default CropEdit;
