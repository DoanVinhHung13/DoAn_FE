import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Form, Input, Select, Upload, Spin, message, Row, Col, Modal } from 'antd';
import { ArrowLeftOutlined, DeleteOutlined, EyeOutlined, SaveOutlined, UploadOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { Sprout } from 'lucide-react';

import TitleCustom from 'src/components/TitleCustom';
import { CropIcon } from 'src/assets/icon/menu/MenuIcons';
import CropManagementService from 'src/services/CropManagementService';
import CropCatalogService from 'src/services/CropCatalogService';
import UploadService from 'src/services/UploadService';
import ROUTER from 'src/router/ROUTER';
import { isActiveCropCatalog } from 'src/utils/cropCatalog';
import { applyApiFieldErrors } from 'src/services/core/apiError';
import useFormDraft from 'src/hooks/useFormDraft';
import { getFormDraftKey } from 'src/utils/formDraftKeys';

const CROP_FIELD_MAPPING = {
  Name: 'name', name: 'name', CropCatalogId: 'cropCatalogId', cropCatalogId: 'cropCatalogId',
  Description: 'description', description: 'description', ImageUrl: 'imageUrl', imageUrl: 'imageUrl',
};

const normalizeCropResponse = (response) => {
  const payload = response?.data ?? response ?? {};
  const data = payload?.data ?? payload;
  const items = Array.isArray(data)
    ? data
    : data?.items ||
      data?.results ||
      data?.cropCatalogs ||
      data?.crops ||
      payload?.items ||
      payload?.results ||
      [];

  return { items };
};

const CropCreate = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const storageKey = getFormDraftKey('crop', 'create');
  const { saveDraft, clearDraft, restoreDraft } = useFormDraft({ form, storageKey });
  
  const [uploadingCreate, setUploadingCreate] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  
  const watchedImageUrl = Form.useWatch('imageUrl', form);

  React.useEffect(() => {
    const draft = restoreDraft();
    if (draft?.data) form.setFieldsValue(draft.data);
  }, [form, restoreDraft]);

  const { data: cropCatalogsData, isLoading: isCatalogsLoading } = useQuery({
    queryKey: ['crop-catalogs-dropdown'],
    queryFn: async () => {
      try {
        const response = await CropCatalogService.getCropCatalogs({ PageIndex: 1, PageSize: 100, Status: 'ACTIVE' });
        const items = normalizeCropResponse(response).items;
        return items.filter(isActiveCropCatalog);
      } catch (err) {
        if (!err?.code && err?.status === 405) {
          return [
            { id: '1', name: 'Cây rau', description: 'Các loại rau ăn lá', isActive: true },
            { id: '2', name: 'Cây củ', description: 'Các loại củ quả', isActive: true },
            { id: '3', name: 'Cây ăn trái', description: 'Các loại cây ăn quả', isActive: true },
          ];
        }
        return [];
      }
    },
    retry: false,
  });

  const cropCatalogOptions = useMemo(() => {
    if (!cropCatalogsData) return [];
    return cropCatalogsData.filter(isActiveCropCatalog).map(catalog => ({
      value: catalog.id || catalog.cropCatalogId,
      label: catalog.name || catalog.cropCatalogName,
    }));
  }, [cropCatalogsData]);

  const cropTypeFormOptions = useMemo(() => {
    return cropCatalogOptions || [];
  }, [cropCatalogOptions]);

  const beforeCropImageUpload = (file) => {
    const isJpgOrPng = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
    if (!isJpgOrPng) {
      message.error('Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP.');
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Dung lượng ảnh không được vượt quá 5MB.');
    }
    return isJpgOrPng && isLt5M;
  };

  const handleCropImageUpload = async ({ file, onSuccess, onError }) => {
    try {
      setUploadingCreate(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await UploadService.uploadImage(formData);
      
      const imageUrl = response?.data?.url || response?.url;
      if (!imageUrl) {
        throw new Error('Không nhận được đường dẫn ảnh sau khi upload.');
      }

      form.setFieldsValue({ imageUrl });
      onSuccess(response);
    } catch (error) {
      onError(error);
    } finally {
      setUploadingCreate(false);
    }
  };

  const createMutation = useMutation({
    mutationFn: (values) => {
      const unitToDays = {
        days: 1,
        months: 30,
        years: 365,
      };
      
      const minDays = values.minHarvestDays 
        ? values.minHarvestDays * unitToDays[values.minDurationUnit || 'days'] 
        : null;
        
      const maxDays = values.maxHarvestDays 
        ? values.maxHarvestDays * unitToDays[values.maxDurationUnit || 'days'] 
        : null;

      const payload = {
        name: values.name.trim().replace(/\s+/g, ' '),
        cropCatalogId: values.cropCatalogId || null,
        minHarvestDays: minDays,
        maxHarvestDays: maxDays,
        description: values.description?.trim().replace(/\s+/g, ' ') || null,
        imageUrl: values.imageUrl || null,
      };
      return CropManagementService.createCrop(payload, {
        errorHandling: 'form',
        fieldErrorMapping: CROP_FIELD_MAPPING,
      });
    },
    onSuccess: () => {
      clearDraft();
      queryClient.invalidateQueries({ queryKey: ['crops'] });
      navigate(ROUTER.FM_CROPS);
    },
    onError: (error) => applyApiFieldErrors(form, error, CROP_FIELD_MAPPING),
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
          <CropIcon style={{ fontSize: '24px', color: '#15803d' }} />
          Thêm cây trồng
        </TitleCustom>
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={(values) => createMutation.mutate(values)}
        onValuesChange={(_, allValues) => saveDraft(allValues)}
        onFinishFailed={() => {}}
        scrollToFirstError
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <div className="space-y-6">
              {/* Basic Information Card */}
              <Card 
                className="rounded-lg shadow-sm"
                title={<span className="text-lg font-semibold text-green-600">Thông tin cơ bản</span>}
              >
                <div className="grid grid-cols-1 gap-x-6 md:grid-cols-2">
                  <Form.Item
                    name="name"
                    label="Tên cây trồng"
                    rules={[
                      { required: true, message: 'Vui lòng nhập tên cây trồng.' },
                      {
                        validator: (_, value) => {
                          if (!value) return Promise.resolve();
                          const trimmed = value.trim();
                          if (!trimmed) {
                            return Promise.reject(new Error('Tên cây trồng không được chỉ chứa khoảng trắng.'));
                          }
                          if (trimmed.length > 100) {
                            return Promise.reject(new Error('Tên cây trồng không được vượt quá 100 ký tự.'));
                          }
                          if (trimmed !== trimmed.replace(/\s+/g, ' ')) {
                            return Promise.reject(new Error('Tên cây trồng không được chứa nhiều khoảng trắng liên tiếp.'));
                          }
                          return Promise.resolve();
                        },
                      },
                    ]}
                  >
                    <Input className="h-11 rounded-lg" placeholder="Nhập tên cây trồng" />
                  </Form.Item>

                  <Form.Item
                    name="cropCatalogId"
                    label="Nhóm cây"
                    rules={[
                      { required: true, message: 'Vui lòng chọn nhóm cây.' },
                    ]}
                  >
                    <Select
                      className="h-11"
                      placeholder={cropTypeFormOptions?.length > 0 ? "Chọn nhóm cây" : "Chọn nhóm cây từ danh sách"}
                      loading={isCatalogsLoading}
                      options={cropTypeFormOptions}
                      showSearch
                      filterOption={(input, option) =>
                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                      }
                      disabled={!cropTypeFormOptions || cropTypeFormOptions.length === 0}
                    />
                  </Form.Item>

                  
                </div>
              </Card>

              {/* Detailed Information Card */}
              <Card 
                className="rounded-lg shadow-sm"
                title={<span className="text-lg font-semibold text-green-600">Thông tin chi tiết</span>}
              >
                <Form.Item 
                  name="description" 
                  label="Mô tả" 
                  className="mb-0"
                  rules={[
                    {
                      validator: (_, value) => {
                        if (!value) return Promise.resolve();
                        const trimmed = value.trim();
                        if (!trimmed) {
                          return Promise.reject(new Error('Mô tả không được chỉ chứa khoảng trắng.'));
                        }
                        if (trimmed.length > 500) {
                          return Promise.reject(new Error('Mô tả không được vượt quá 500 ký tự.'));
                        }
                        if (trimmed !== trimmed.replace(/\s+/g, ' ')) {
                          return Promise.reject(new Error('Mô tả không được chứa nhiều khoảng trắng liên tiếp.'));
                        }
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input.TextArea rows={4} className="rounded-lg" placeholder="Nhập mô tả" />
                </Form.Item>
              </Card>

            </div>
          </Col>

          {/* Right Column */}
          <Col xs={24} lg={8}>
            <div className="space-y-6">
              <Card 
                className="rounded-lg shadow-sm"
                title={<span className="text-lg font-semibold text-green-600">Ảnh minh họa</span>}
              >
                <Form.Item name="imageUrl" className="mb-0">
                  <div className="space-y-3">
                    <Upload
                      accept="image/png,image/jpeg,image/webp"
                      showUploadList={false}
                      beforeUpload={beforeCropImageUpload}
                      customRequest={(options) => handleCropImageUpload(options)}
                    >
                      <Button 
                        icon={<UploadOutlined />} 
                        loading={uploadingCreate}
                        className="h-11 w-full rounded-lg"
                      >
                        {uploadingCreate ? 'Đang tải lên...' : 'Tải ảnh lên'}
                      </Button>
                    </Upload>

                    {uploadingCreate && !watchedImageUrl && (
                      <div className="flex h-48 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
                        <Spin />
                      </div>
                    )}

                    {watchedImageUrl && !uploadingCreate && (
                      <div className="group relative h-48 w-full overflow-hidden rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 p-1">
                        <img
                          src={watchedImageUrl}
                          alt="Ảnh minh họa"
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
              </Card>
            </div>
          </Col>
        </Row>

        <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-6">
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

export default CropCreate;
