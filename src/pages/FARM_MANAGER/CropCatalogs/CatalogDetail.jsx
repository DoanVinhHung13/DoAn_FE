import React from 'react';
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
  Typography,
} from 'antd';
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  EditOutlined,
  FileTextOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';

import TitleCustom from 'src/components/TitleCustom';
import CropCatalogService from 'src/services/CropCatalogService';
import ROUTER from 'src/router/ROUTER';

const { Text, Paragraph } = Typography;

const EMPTY_MESSAGE = 'Không tìm thấy thông tin danh mục cây trồng.';

const displayValue = (value) => value || 'Chưa cập nhật';

const isCatalogActive = (item) => {
  if (typeof item?.isActive === 'boolean') return item.isActive;
  const status = String(item?.status || '').toLowerCase();
  return !['inactive', 'disabled', 'deleted', 'ngừng hoạt động'].includes(status);
};

const getStatusLabel = (item) =>
  isCatalogActive(item) ? 'Hoạt động' : 'Ngừng hoạt động';

const CatalogDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    data: catalogDetail,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['crop-catalog-detail', id],
    queryFn: async () => {
      const response = await CropCatalogService.getCropCatalogById(id, { errorHandling: 'component' });
      const payload = response?.data ?? {};
      return payload?.data ?? payload;
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
            onClick={() => navigate(ROUTER.FM_CROP_CATALOGS)}
            className="h-10"
          >
            Quay lại
          </Button>
          <TitleCustom className="!mb-0">Chi tiết danh mục cây trồng</TitleCustom>
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
          <TitleCustom className="!mb-0">Chi tiết danh mục cây trồng</TitleCustom>
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

  const isActive = isCatalogActive(catalogDetail);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTER.FM_CROP_CATALOGS)}
            className="h-10 rounded-lg"
          >
            Quay lại
          </Button>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <FileTextOutlined className="h-6 w-6" />
            Chi tiết danh mục cây trồng
          </TitleCustom>
        </div>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => navigate(`${ROUTER.FM_CROP_CATALOGS}/${id}/edit`)}
          className="h-10 rounded-lg bg-green-500 font-semibold shadow-lg shadow-green-100"
        >
          Chỉnh sửa
        </Button>
      </div>

      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <Space direction="vertical" size={24} className="w-full">
            {/* Basic Information */}
            <Card
              title={
                <span className="flex items-center gap-2 text-lg font-semibold text-green-600">
                  <FileTextOutlined />
                  Thông tin cơ bản
                </span>
              }
              className="rounded-lg shadow-sm"
            >
              <Descriptions column={1} size="large">
                <Descriptions.Item label="Tên loại cây trồng">
                  <Text strong className="text-lg text-gray-900">
                    {displayValue(catalogDetail.name || catalogDetail.cropCatalogName)}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold ${
                      isActive
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-600'
                    }`}
                  >
                    {isActive ? <CheckCircleOutlined /> : <StopOutlined />}
                    {getStatusLabel(catalogDetail)}
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Description */}
            {catalogDetail.description && (
              <Card
                title={
                  <span className="text-lg font-semibold text-green-600">
                    Mô tả
                  </span>
                }
                className="rounded-lg shadow-sm"
              >
                <Paragraph className="mb-0 whitespace-pre-wrap text-gray-700">
                  {catalogDetail.description}
                </Paragraph>
              </Card>
            )}
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default CatalogDetail;
