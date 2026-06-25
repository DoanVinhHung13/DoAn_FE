import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  EditOutlined,
  StopOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { Sprout } from 'lucide-react';

import TitleCustom from 'src/components/TitleCustom';
import GrowthStages from 'src/components/GrowthStages';
import CropService from 'src/services/CropService';
import CropManagementService from 'src/services/CropManagementService';
import GrowthStageService from 'src/services/GrowthStageService';
import ROUTER from 'src/router/ROUTER';

const { Text, Paragraph } = Typography;

const EMPTY_MESSAGE = 'Không tìm thấy thông tin cây trồng.';

const displayValue = (value) => value || 'Chưa cập nhật';

const isCropActive = (item) => {
  if (typeof item?.isActive === 'boolean') return item.isActive;
  const status = String(item?.status || '').toLowerCase();
  return !['inactive', 'disabled', 'deleted', 'ngừng hoạt động'].includes(status);
};

const getStatusLabel = (item) =>
  isCropActive(item) ? 'Hoạt động' : 'Ngừng hoạt động';

const CATEGORY_TAG_COLORS = [
  { bg: '#dcfce7', text: '#15803d' },
  { bg: '#dbeafe', text: '#1d4ed8' },
  { bg: '#fef3c7', text: '#b45309' },
  { bg: '#fce7f3', text: '#be185d' },
  { bg: '#ede9fe', text: '#6d28d9' },
  { bg: '#ccfbf1', text: '#0f766e' },
  { bg: '#fee2e2', text: '#b91c1c' },
  { bg: '#e0f2fe', text: '#0369a1' },
];

const getCategoryTagStyle = (value) => {
  const text = displayValue(value);
  const hash = [...text].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const color = CATEGORY_TAG_COLORS[hash % CATEGORY_TAG_COLORS.length];
  return {
    backgroundColor: color.bg,
    color: color.text,
  };
};

const CropDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isVarietiesModalOpen, setIsVarietiesModalOpen] = useState(false);

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

  const { data: cropCatalogsData } = useQuery({
    queryKey: ['crop-catalogs-dropdown'],
    queryFn: async () => {
      try {
        const response = await CropService.getCrops({ PageIndex: 1, PageSize: 100 });
        const payload = response?.data ?? response ?? {};
        const data = payload?.data ?? payload;
        const items = Array.isArray(data)
          ? data
          : data?.items ||
            data?.results ||
            data?.crops ||
            data?.cropCatalogs ||
            payload?.items ||
            payload?.results ||
            [];
        return items;
      } catch (err) {
        return [];
      }
    },
    retry: false,
  });

  const getCropCatalogName = (id) => {
    if (!cropCatalogsData || !id) return id;
    const catalog = cropCatalogsData.find(c => c.id === id || c.cropCatalogId === id);
    return catalog ? (catalog.name || catalog.cropCatalogName) : id;
  };

  const { data: growthStagesData, isLoading: isGrowthStagesLoading } = useQuery({
    queryKey: ['growth-stages', id],
    queryFn: async () => {
      try {
        const response = await GrowthStageService.getGrowthStages({ cropId: id, PageSize: 100 });
        const payload = response?.data ?? response ?? {};
        const data = payload?.data ?? payload;
        const items = Array.isArray(data) ? data : data?.items || [];
        // Sort by orderIndex
        return items.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
      } catch (err) {
        return [];
      }
    },
    enabled: !!id,
    retry: false,
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
            onClick={() => navigate(ROUTER.LM_CROPS)}
            className="h-10"
          >
            Quay lại
          </Button>
          <TitleCustom className="!mb-0">Chi tiết cây trồng</TitleCustom>
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
            onClick={() => navigate(ROUTER.LM_CROPS)}
            className="h-10"
          >
            Quay lại
          </Button>
          <TitleCustom className="!mb-0">Chi tiết cây trồng</TitleCustom>
        </div>
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={EMPTY_MESSAGE}
          />
        </Card>
      </div>
    );
  }

  const isActive = isCropActive(cropDetail);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTER.LM_CROPS)}
            className="h-10 rounded-lg"
          >
            Quay lại
          </Button>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <Sprout className="h-6 w-6" />
            Chi tiết cây trồng
          </TitleCustom>
        </div>
        <Space>      
          
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Left Column - Image & Basic Info */}
        <Col xs={24} lg={10}>
          <Card className="rounded-lg shadow-sm">
            {/* Crop Image */}
            <div className="mb-6">
              {cropDetail.imageUrl ? (
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <img
                    src={cropDetail.imageUrl}
                    alt={displayValue(cropDetail.name)}
                    className="h-[320px] w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-[320px] items-center justify-center rounded-xl border border-gray-200 bg-green-50">
                  <Sprout className="h-24 w-24 text-green-300" />
                </div>
              )}
            </div>

            {/* Crop Name & Status */}
            <div className="space-y-4 border-t border-gray-100 pt-6">
              <div>
                <Text type="secondary" className="block text-sm">
                  Tên cây trồng
                </Text>
                <Text strong className="block text-2xl text-gray-900">
                  {displayValue(cropDetail.name)}
                </Text>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold ${
                    isActive
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-600'
                  }`}
                >
                  {isActive ? <CheckCircleOutlined /> : <StopOutlined />}
                  {getStatusLabel(cropDetail)}
                </div>

                {cropDetail.cropCatalogId && (
                  <Tag
                    className="!m-0 rounded-full border-0 px-4 py-1.5 text-sm font-semibold"
                    style={getCategoryTagStyle(getCropCatalogName(cropDetail.cropCatalogId))}
                  >
                    {getCropCatalogName(cropDetail.cropCatalogId)}
                  </Tag>
                )}
              </div>
            </div>
          </Card>
        </Col>

        {/* Right Column - Detailed Information */}
        <Col xs={24} lg={14}>
          <Space direction="vertical" size={24} className="w-full">
            {/* Basic Information */}
            <Card
              title={
                <span className="flex items-center gap-2 text-lg font-semibold text-green-600">
                  <Sprout className="h-5 w-5" />
                  Thông tin cơ bản
                </span>
              }
              className="rounded-lg shadow-sm"
            >
              <Descriptions column={1} size="middle" className="[&_.ant-descriptions-item-label]:w-[200px]">
                <Descriptions.Item label="Danh mục">
                  {displayValue(getCropCatalogName(cropDetail.cropCatalogId))}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Cultivation Conditions */}
  
            {/* Description */}
            <Card
              title={
                <span className="text-lg font-semibold text-green-600">
                  Mô tả
                </span>
              }
              className="rounded-lg shadow-sm"
            >
              <Paragraph className="mb-0 whitespace-pre-wrap text-gray-700">
                {cropDetail.description || 'Chưa có mô tả cho cây trồng này'}
              </Paragraph>
            </Card>

            {/* Growth Stages */}
            <div className="relative">
              {isGrowthStagesLoading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 rounded-lg">
                  <Spin />
                </div>
              )}
              <GrowthStages value={growthStagesData || []} readonly={true} />
            </div>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default CropDetail;
