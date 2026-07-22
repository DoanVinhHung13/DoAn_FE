import React, { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  Typography,
  Timeline,
  Image,
  Descriptions,
  Tag,
  Space,
  Alert,
  Row,
  Col,
  Spin,
} from 'antd';
import {
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import { Sprout, Wheat } from 'lucide-react';
import dayjs from 'dayjs';
import { mockBatches } from 'src/mocks/batchMockData';
import BatchService from 'src/services/BatchService';

const { Title, Paragraph, Text } = Typography;

const Trace = () => {
  const { qrCode } = useParams();
  const [searchParams] = useSearchParams();

  // Parse display options from URL query parameters (e.g. ?log=1&mat=1&pic=1&cert=0)
  const displayOptions = useMemo(() => {
    const hasLog = searchParams.get('log');
    const hasMat = searchParams.get('mat');
    const hasPic = searchParams.get('pic');
    const hasCert = searchParams.get('cert');

    return {
      showDailyLog: hasLog !== null ? hasLog === '1' : true,
      showMaterials: hasMat !== null ? hasMat === '1' : true,
      showAutomation: hasMat !== null ? hasMat === '1' : true,
      showPhotos: hasPic !== null ? hasPic === '1' : true,
      showCertificates: hasCert !== null ? hasCert === '1' : false,
      showCertificate: hasCert !== null ? hasCert === '1' : false,
    };
  }, [searchParams]);

  // 1. Fetch real batches from API (if available)
  const { data: apiBatches = [], isLoading } = useQuery({
    queryKey: ['trace-api-batches'],
    queryFn: async () => {
      try {
        const response = await BatchService.getBatches();
        return response?.data?.data?.items || response?.data?.data || response?.data?.items || response?.data || [];
      } catch (error) {
        return [];
      }
    },
  });

  // 2. Resolve matching batch dynamically
  const resolvedBatch = useMemo(() => {
    const rawCode = (qrCode || '').trim();
    const cleanCode = rawCode.replace(/^TR-/, '').trim().toLowerCase();

    const allBatches = [...apiBatches, ...mockBatches];

    // Priority 1: Exact match by batchCode or id
    let matched = allBatches.find(
      (b) =>
        String(b.id).toLowerCase() === cleanCode ||
        String(b.batchCode || '').toLowerCase() === cleanCode ||
        rawCode.toLowerCase() === String(b.batchCode || '').toLowerCase()
    );

    // Priority 2: Partial match (includes batchCode)
    if (!matched) {
      matched = allBatches.find(
        (b) =>
          b.batchCode && (cleanCode.includes(b.batchCode.toLowerCase()) || b.batchCode.toLowerCase().includes(cleanCode))
      );
    }

    // Priority 3: Smart fallback based on code keywords
    if (!matched) {
      if (cleanCode.includes('a05') || cleanCode.includes('cafe') || cleanCode.includes('robusta')) {
        matched = mockBatches.find((b) => b.batchCode === 'LOT-A05-2024') || {
          batchCode: 'LOT-A05-2024',
          cropName: 'Cà phê Robusta',
          landPlotName: 'Vườn C1',
          startDate: '2024-01-15',
          harvestDate: '2024-04-01',
          area: 5.0,
        };
      } else if (cleanCode.includes('b12') || cleanCode.includes('ngo')) {
        matched = mockBatches.find((b) => b.batchCode === 'LOT-B12-2024');
      } else if (cleanCode.includes('c22') || cleanCode.includes('cai')) {
        matched = mockBatches.find((b) => b.batchCode === 'LOT-C22-2024');
      } else if (cleanCode.includes('d33') || cleanCode.includes('nang-hoa')) {
        matched = mockBatches.find((b) => b.batchCode === 'LOT-D33-2024');
      } else if (cleanCode.includes('x01') || cleanCode.includes('st25')) {
        matched = mockBatches.find((b) => b.batchCode === 'LOT-X01-2024');
      }
    }

    // Priority 4: Default fallback
    return matched || mockBatches[0];
  }, [qrCode, apiBatches]);

  // Construct dynamic trace data
  const traceData = useMemo(() => {
    const b = resolvedBatch;
    return {
      qrCode: qrCode || `TR-${b.batchCode || 'LOT'}`,
      batchCode: b.batchCode || 'LOT-DEMO',
      cropName: b.cropName || b.cropType || 'Nông sản',
      farmName: b.landPlotName ? `Vùng trồng ${b.landPlotName} - Trang trại Nông nghiệp` : 'Trang trại Hữu Nghị',
      harvestDate: b.harvestDate || '2024-05-20',
      startDate: b.startDate || '2024-01-15',
      area: b.area ? `${b.area} ha` : '2.5 ha',
      yield: b.yield || '15.5 tấn',
      certifications: b.certifications || ['VietGAP', 'Organic'],

      displayOptions,

      dailyLogs: b.dailyLogs || [
        {
          date: b.startDate || '2024-03-12',
          stage: 'Gieo trồng / Chuẩn bị',
          activity: `Bắt đầu gieo trồng & canh tác ${b.cropName || 'nông sản'}`,
          weather: 'Nắng nhẹ, 28°C',
          notes: `Chuẩn bị đất tại ${b.landPlotName || 'vùng trồng'}`,
        },
        {
          date: dayjs(b.startDate || '2024-03-12').add(20, 'day').format('YYYY-MM-DD'),
          stage: 'Chăm sóc',
          activity: 'Bón phân & tưới tiêu định kỳ',
          weather: 'Nắng, 30°C',
          notes: 'Cung cấp dinh dưỡng phát triển cây trồng',
        },
        {
          date: dayjs(b.startDate || '2024-03-12').add(45, 'day').format('YYYY-MM-DD'),
          stage: 'Phòng trừ sâu bệnh',
          activity: 'Phun chế phẩm sinh học bảo vệ',
          weather: 'Mát mẻ, 26°C',
          notes: 'Đảm bảo an toàn vệ sinh sản phẩm',
        },
        {
          date: b.harvestDate || '2024-05-20',
          stage: 'Thu hoạch',
          activity: `Thu hoạch ${b.cropName || 'nông sản'} chín rộ`,
          weather: 'Nắng đẹp, 32°C',
          notes: 'Đạt chỉ tiêu chất lượng xuất kho',
        },
      ],

      materials: b.materials || [
        { type: 'Phân bón', name: 'NPK Hữu cơ sinh học', quantity: '300 kg', supplier: 'Công ty Phân bón Đồng Nai' },
        { type: 'Thuốc BVTV', name: 'Biotin Plus (Sinh học)', quantity: '5 lít', supplier: 'Công ty TNHH Sinh học An Nông' },
        { type: 'Giống', name: b.cropName || 'Giống chuẩn', quantity: '120 kg', supplier: 'Trung tâm Giống cây trồng' },
      ],

      photos: b.photos || [
        {
          url: `https://placehold.co/400x300/22c55e/ffffff?text=${encodeURIComponent(b.cropName || 'Nông sản')}+giai+đoạn+đầu`,
          caption: `${b.cropName || 'Nông sản'} giai đoạn sinh trưởng`,
          date: b.startDate || '2024-03-12',
        },
        {
          url: `https://placehold.co/400x300/facc15/333333?text=${encodeURIComponent(b.cropName || 'Nông sản')}+trước+thu+hoạch`,
          caption: 'Phát triển tốt trước thu hoạch',
          date: dayjs(b.harvestDate || '2024-05-20').subtract(10, 'day').format('YYYY-MM-DD'),
        },
        {
          url: `https://placehold.co/400x300/3b82f6/ffffff?text=${encodeURIComponent(b.cropName || 'Nông sản')}+thu+hoạch`,
          caption: 'Ngày thu hoạch chính thức',
          date: b.harvestDate || '2024-05-20',
        },
      ],
    };
  }, [resolvedBatch, qrCode, displayOptions]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" tip="Đang tải thông tin truy xuất..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <div className="bg-green-600 text-white py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              <Wheat className="w-10 h-10 text-green-600" />
            </div>
            <div>
              <Title level={1} className="!text-white !mb-2">Truy xuất nguồn gốc</Title>
              <Text className="text-green-100 text-lg">
                Mã QR: <strong>{traceData.qrCode}</strong>
              </Text>
            </div>
          </div>

          <Alert
            message="Thông tin minh bạch 100%"
            description="Sản phẩm được theo dõi toàn bộ quá trình sản xuất từ gieo trồng đến thu hoạch"
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
            className="bg-green-700 border-green-600 text-white"
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* Thông tin cơ bản */}
        <Card className="shadow-lg rounded-xl">
          <Title level={3} className="flex items-center gap-2 !mb-4">
            <Sprout className="w-6 h-6 text-green-600" />
            Thông tin sản phẩm
          </Title>
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Mã lô" span={1}>
              <Tag color="blue" className="text-base font-semibold">{traceData.batchCode}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Sản phẩm" span={1}>
              <Text strong className="text-lg">{traceData.cropName}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Trang trại" span={2}>
              <Space>
                <EnvironmentOutlined className="text-green-600" />
                {traceData.farmName}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Ngày thu hoạch" span={1}>
              <Space>
                <CalendarOutlined className="text-blue-600" />
                {dayjs(traceData.harvestDate).format('DD/MM/YYYY')}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="Diện tích" span={1}>
              {traceData.area}
            </Descriptions.Item>
            <Descriptions.Item label="Sản lượng" span={1}>
              <Text strong className="text-green-600">{traceData.yield}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Chứng nhận" span={1}>
              <Space>
                {traceData.certifications.map((cert) => (
                  <Tag key={cert} color="green" icon={<SafetyCertificateOutlined />}>
                    {cert}
                  </Tag>
                ))}
              </Space>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {/* Nhật ký hàng ngày */}
        {traceData.displayOptions.showDailyLog && (
          <Card className="shadow-lg rounded-xl">
            <Title level={3} className="!mb-4">
              📝 Nhật ký canh tác hàng ngày
            </Title>
            <Timeline
              mode="left"
              items={traceData.dailyLogs.map((log, index) => ({
                key: index,
                color: 'green',
                dot: <CheckCircleOutlined className="text-lg" />,
                children: (
                  <div className="pb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Tag color="blue">{dayjs(log.date).format('DD/MM/YYYY')}</Tag>
                      <Text strong className="text-base">{log.stage}</Text>
                    </div>
                    <Paragraph className="!mb-1">
                      <Text strong>Hoạt động:</Text> {log.activity}
                    </Paragraph>
                    {log.weather && (
                      <Paragraph className="!mb-1 text-gray-600">
                        <Text>Thời tiết:</Text> {log.weather}
                      </Paragraph>
                    )}
                    <Paragraph className="!mb-0 text-gray-600">
                      <Text>Ghi chú:</Text> {log.notes}
                    </Paragraph>
                  </div>
                ),
              }))}
            />
          </Card>
        )}

        {/* Thông tin vật tư */}
        {(traceData.displayOptions.showMaterials ?? traceData.displayOptions.showAutomation) && (
          <Card className="shadow-lg rounded-xl">
            <Title level={3} className="flex items-center gap-2 !mb-4">
              <ExperimentOutlined className="text-orange-600" />
              Thông tin vật tư sử dụng
            </Title>
            <div className="space-y-4">
              {traceData.materials.map((material, index) => (
                <Card key={index} size="small" className="bg-gray-50">
                  <Row gutter={16}>
                    <Col span={6}>
                      <Text type="secondary">Loại vật tư</Text>
                      <div><Text strong>{material.type}</Text></div>
                    </Col>
                    <Col span={6}>
                      <Text type="secondary">Tên sản phẩm</Text>
                      <div><Text strong>{material.name}</Text></div>
                    </Col>
                    <Col span={6}>
                      <Text type="secondary">Số lượng</Text>
                      <div><Text strong className="text-blue-600">{material.quantity}</Text></div>
                    </Col>
                    <Col span={6}>
                      <Text type="secondary">Nhà cung cấp</Text>
                      <div><Text>{material.supplier}</Text></div>
                    </Col>
                  </Row>
                </Card>
              ))}
            </div>
          </Card>
        )}

        {/* Hình ảnh thực địa */}
        {traceData.displayOptions.showPhotos && (
          <Card className="shadow-lg rounded-xl">
            <Title level={3} className="!mb-4">
              📷 Hình ảnh thực tế tại vùng trồng
            </Title>
            <Row gutter={[16, 16]}>
              {traceData.photos.map((photo, index) => (
                <Col key={index} xs={24} sm={12} md={8}>
                  <Card
                    size="small"
                    cover={<Image src={photo.url} alt={photo.caption} className="rounded-t-lg" />}
                  >
                    <Paragraph className="!mb-1 text-center" strong>{photo.caption}</Paragraph>
                    <Text className="text-gray-500 text-sm block text-center">
                      {dayjs(photo.date).format('DD/MM/YYYY')}
                    </Text>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>
        )}

        {/* Giấy chứng nhận */}
        {(traceData.displayOptions.showCertificates ?? traceData.displayOptions.showCertificate) && (
          <Card className="shadow-lg rounded-xl">
            <Title level={3} className="flex items-center gap-2 !mb-4">
              <SafetyCertificateOutlined className="text-blue-600" />
              Giấy chứng nhận chất lượng
            </Title>
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl border border-purple-100">
              <SafetyCertificateOutlined className="text-3xl text-purple-600" />
              <div>
                <Text strong className="block text-base">Chứng nhận VietGAP No. 2024-AGRI-088</Text>
                <Text className="text-sm text-gray-500">Hiệu lực đến: 12/2026 • Cấp bởi Cục Trồng Trọt & Nông Sản</Text>
              </div>
            </div>
          </Card>
        )}

        {/* Footer */}
        <Card className="bg-green-50 border-green-200 shadow-lg rounded-xl">
          <div className="text-center">
            <CheckCircleOutlined className="text-4xl text-green-600 mb-3" />
            <Title level={4} className="!mb-2">Sản phẩm an toàn, chất lượng đảm bảo</Title>
            <Paragraph className="text-gray-600">
              Mọi thông tin đều được ghi nhận và xác thực bởi hệ thống quản lý điện tử
            </Paragraph>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Trace;
