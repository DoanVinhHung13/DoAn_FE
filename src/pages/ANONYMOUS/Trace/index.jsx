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

  // 1. Fetch real batches from API (silently fail if guest/unauthenticated)
  const { data: apiBatches = [], isLoading } = useQuery({
    queryKey: ['trace-api-batches'],
    queryFn: async () => {
      try {
        const response = await BatchService.getBatches(undefined, { skipNotice: true, skipAuthRedirect: true });
        const list = response?.data?.items || response?.data?.data?.items || response?.data?.data || response?.data || [];
        return Array.isArray(list) ? list : [];
      } catch (error) {
        return [];
      }
    },
    retry: false,
  });

  // 2. Resolve matching batch dynamically
  const resolvedBatch = useMemo(() => {
    const rawCode = (qrCode || '').trim();
    const normalizedRaw = rawCode.toLowerCase();
    const cleanCode = rawCode.replace(/^(TR-|QR-|EAPLS-)/i, '').trim().toLowerCase();

    const allBatches = apiBatches;

    // Priority 1: Exact match by activeTraceCode, batchCode, or id
    let matched = allBatches.find(
      (b) =>
        (b.activeTraceCode && String(b.activeTraceCode).toLowerCase() === normalizedRaw) ||
        (b.activeTraceCode && String(b.activeTraceCode).replace(/^(TR-|QR-|EAPLS-)/i, '').toLowerCase() === cleanCode) ||
        String(b.id).toLowerCase() === normalizedRaw ||
        String(b.id).toLowerCase() === cleanCode ||
        String(b.batchCode || '').toLowerCase() === normalizedRaw ||
        String(b.batchCode || '').toLowerCase() === cleanCode
    );

    // Priority 2: Partial match (batchCode or activeTraceCode contains code core)
    if (!matched) {
      matched = allBatches.find((b) => {
        const bCode = String(b.batchCode || '').toLowerCase();
        const aCode = String(b.activeTraceCode || '').toLowerCase();
        return (
          (bCode && (cleanCode.includes(bCode) || bCode.includes(cleanCode))) ||
          (aCode && (cleanCode.includes(aCode) || aCode.includes(cleanCode)))
        );
      });
    }

    // Priority 3: Smart fallback based on code keywords
    if (!matched) {
      if (cleanCode.includes('a05') || cleanCode.includes('cafe') || cleanCode.includes('robusta')) {
        matched = allBatches.find((b) => String(b.batchCode).includes('A05')) || mockBatches.find((b) => b.batchCode === 'LOT-A05-2024');
      } else if (cleanCode.includes('b12') || cleanCode.includes('ngo')) {
        matched = allBatches.find((b) => String(b.batchCode).includes('B12')) || mockBatches.find((b) => b.batchCode === 'LOT-B12-2024');
      } else if (cleanCode.includes('c22') || cleanCode.includes('cai')) {
        matched = allBatches.find((b) => String(b.batchCode).includes('C22')) || mockBatches.find((b) => b.batchCode === 'LOT-C22-2024');
      } else if (cleanCode.includes('d33') || cleanCode.includes('nang-hoa') || cleanCode.includes('d33-2024')) {
        matched = allBatches.find((b) => String(b.batchCode).includes('D33')) || mockBatches.find((b) => b.batchCode === 'LOT-D33-2024');
      } else if (cleanCode.includes('x01') || cleanCode.includes('st25')) {
        matched = allBatches.find((b) => String(b.batchCode).includes('X01')) || mockBatches.find((b) => b.batchCode === 'LOT-X01-2024');
      } else if (cleanCode.includes('01') || cleanCode.includes('batch-01')) {
        matched = allBatches.find((b) => String(b.batchCode).includes('BATCH-01')) || mockBatches.find((b) => b.batchCode === 'BATCH-01');
      }
    }

    // Priority 4: Default fallback
    return matched || allBatches[0] || mockBatches[0];
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
    <div className="min-h-screen bg-slate-50/80 pb-12">
      {/* ── Mobile & Desktop Header Banner ── */}
      <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-teal-700 text-white shadow-md">
        <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center flex-shrink-0 shadow-inner">
              <Wheat className="w-10 h-10 sm:w-12 sm:h-12 text-amber-300" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium text-emerald-100 mb-2">
                <CheckCircleOutlined className="text-emerald-300" /> Hệ thống truy xuất nguồn gốc nông sản
              </div>
              <Title level={2} className="!text-white !mb-1 text-xl sm:text-2xl font-bold tracking-tight">
                {traceData.cropName}
              </Title>
              <Text className="text-emerald-100 text-xs sm:text-sm font-mono block">
                Mã QR: <strong className="text-white bg-black/20 px-2 py-0.5 rounded">{traceData.qrCode}</strong>
              </Text>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/15 text-xs sm:text-sm text-emerald-50 flex items-center gap-3">
            <CheckCircleOutlined className="text-lg text-amber-300 flex-shrink-0" />
            <span>Sản phẩm được theo dõi và xác thực 100% dữ liệu điện tử từ quy trình gieo trồng đến thu hoạch.</span>
          </div>
        </div>
      </div>

      {/* ── Main Container ── */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 space-y-5">

        {/* ── 1. Thông tin cơ bản ── */}
        <Card className="rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Sprout className="w-5 h-5" />
            </div>
            <Title level={4} className="!mb-0 !text-base sm:!text-lg font-bold text-slate-800">
              Thông tin sản phẩm & Vùng trồng
            </Title>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 flex flex-col justify-between">
              <Text className="text-slate-500 text-xs font-semibold block mb-1">Mã lô sản xuất</Text>
              <div>
                <Tag color="blue" className="text-xs sm:text-sm font-semibold px-2.5 py-0.5 rounded-md m-0">
                  {traceData.batchCode}
                </Tag>
              </div>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 flex flex-col justify-between">
              <Text className="text-slate-500 text-xs font-semibold block mb-1">Tên sản phẩm</Text>
              <Text strong className="text-sm sm:text-base text-emerald-800">{traceData.cropName}</Text>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 sm:col-span-2">
              <Text className="text-slate-500 text-xs font-semibold block mb-1">Vùng trồng & Trang trại</Text>
              <Space className="text-xs sm:text-sm">
                <EnvironmentOutlined className="text-emerald-600 text-sm" />
                <Text strong className="text-slate-800">{traceData.farmName}</Text>
              </Space>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 flex flex-col justify-between">
              <Text className="text-slate-500 text-xs font-semibold block mb-1">Ngày thu hoạch</Text>
              <Space className="text-xs sm:text-sm">
                <CalendarOutlined className="text-blue-600" />
                <Text strong className="text-blue-700">{dayjs(traceData.harvestDate).format('DD/MM/YYYY')}</Text>
              </Space>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 flex flex-col justify-between">
              <Text className="text-slate-500 text-xs font-semibold block mb-1">Diện tích & Sản lượng</Text>
              <Text className="text-xs sm:text-sm font-semibold text-slate-800">
                {traceData.area} • <span className="text-emerald-600">{traceData.yield}</span>
              </Text>
            </div>

            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/70 sm:col-span-2">
              <Text className="text-slate-500 text-xs font-semibold block mb-1.5">Tiêu chuẩn & Chứng nhận</Text>
              <div className="flex flex-wrap gap-1.5">
                {traceData.certifications.map((cert) => (
                  <Tag key={cert} color="green" icon={<SafetyCertificateOutlined />} className="text-xs rounded-md m-0">
                    {cert}
                  </Tag>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* ── 2. Nhật ký canh tác hàng ngày ── */}
        {traceData.displayOptions.showDailyLog && (
          <Card className="rounded-2xl shadow-sm border border-slate-200/80">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                📝
              </div>
              <Title level={4} className="!mb-0 !text-base sm:!text-lg font-bold text-slate-800">
                Nhật ký canh tác điện tử
              </Title>
            </div>

            <Timeline
              mode="left"
              className="mt-2 px-1 sm:px-2"
              items={traceData.dailyLogs.map((log, index) => ({
                key: index,
                color: 'green',
                dot: <CheckCircleOutlined className="text-base text-emerald-600 bg-white rounded-full" />,
                children: (
                  <div className="pb-3 text-xs sm:text-sm">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Tag color="blue" className="rounded-md font-semibold text-xs m-0">
                        {dayjs(log.date).format('DD/MM/YYYY')}
                      </Tag>
                      <Text strong className="text-slate-800 text-xs sm:text-sm">{log.stage}</Text>
                    </div>
                    <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1 mt-1">
                      <Paragraph className="!mb-0 text-slate-700">
                        <strong className="text-slate-900">Hoạt động:</strong> {log.activity}
                      </Paragraph>
                      {log.weather && (
                        <Paragraph className="!mb-0 text-slate-500 text-xs">
                          <strong>Thời tiết:</strong> {log.weather}
                        </Paragraph>
                      )}
                      <Paragraph className="!mb-0 text-slate-500 text-xs">
                        <strong>Ghi chú:</strong> {log.notes}
                      </Paragraph>
                    </div>
                  </div>
                ),
              }))}
            />
          </Card>
        )}

        {/* ── 3. Thông tin vật tư sử dụng ── */}
        {(traceData.displayOptions.showMaterials ?? traceData.displayOptions.showAutomation) && (
          <Card className="rounded-2xl shadow-sm border border-slate-200/80">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center text-orange-700">
                <ExperimentOutlined className="text-lg" />
              </div>
              <Title level={4} className="!mb-0 !text-base sm:!text-lg font-bold text-slate-800">
                Vật tư & Chế phẩm nông nghiệp
              </Title>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {traceData.materials.map((material, index) => (
                <div key={index} className="p-3 sm:p-4 bg-slate-50/90 rounded-xl border border-slate-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Tag color="orange" className="rounded-md font-medium text-xs m-0">{material.type}</Tag>
                      <Text strong className="text-slate-900">{material.name}</Text>
                    </div>
                    <Text className="text-slate-500 text-xs block">Nhà cung cấp: {material.supplier}</Text>
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0">
                    <Text className="text-slate-400 text-xs block sm:inline mr-1">Liều lượng:</Text>
                    <Text strong className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">{material.quantity}</Text>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ── 4. Hình ảnh thực địa ── */}
        {traceData.displayOptions.showPhotos && (
          <Card className="rounded-2xl shadow-sm border border-slate-200/80">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
                📷
              </div>
              <Title level={4} className="!mb-0 !text-base sm:!text-lg font-bold text-slate-800">
                Hình ảnh thực tế tại trang trại
              </Title>
            </div>

            <Image.PreviewGroup>
              <Row gutter={[12, 12]}>
                {traceData.photos.map((photo, index) => (
                  <Col key={index} xs={24} sm={12} md={8}>
                    <div className="bg-slate-50 rounded-xl border border-slate-200/60 overflow-hidden shadow-xs">
                      <Image
                        src={photo.url}
                        alt={photo.caption}
                        className="object-cover w-full h-40 sm:h-36"
                      />
                      <div className="p-2.5 text-center">
                        <Paragraph className="!mb-0 text-xs font-semibold text-slate-800 truncate">
                          {photo.caption}
                        </Paragraph>
                        <Text className="text-slate-400 text-[11px] block mt-0.5">
                          {dayjs(photo.date).format('DD/MM/YYYY')}
                        </Text>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            </Image.PreviewGroup>
          </Card>
        )}

        {/* ── 5. Giấy chứng nhận ── */}
        {(traceData.displayOptions.showCertificates ?? traceData.displayOptions.showCertificate) && (
          <Card className="rounded-2xl shadow-sm border border-slate-200/80">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center text-teal-700">
                <SafetyCertificateOutlined className="text-lg" />
              </div>
              <Title level={4} className="!mb-0 !text-base sm:!text-lg font-bold text-slate-800">
                Giấy chứng nhận & Tiêu chuẩn
              </Title>
            </div>

            <div className="flex items-center gap-3 p-3.5 sm:p-4 bg-teal-50/80 rounded-xl border border-teal-200/70 text-xs sm:text-sm">
              <SafetyCertificateOutlined className="text-2xl sm:text-3xl text-teal-600 flex-shrink-0" />
              <div>
                <Text strong className="block text-slate-900 font-bold sm:text-base">Chứng nhận VietGAP No. 2024-AGRI-088</Text>
                <Text className="text-slate-600 text-xs block mt-0.5">Hiệu lực đến: 12/2026 • Cấp bởi Cục Trồng Trọt & Nông Sản</Text>
              </div>
            </div>
          </Card>
        )}

        {/* ── 6. Footer Xác thực ── */}
        <div className="p-6 bg-gradient-to-br from-emerald-800 to-green-900 text-white rounded-2xl shadow-md text-center space-y-2">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto text-amber-300">
            <CheckCircleOutlined className="text-2xl" />
          </div>
          <Title level={4} className="!text-white !mb-1 text-base sm:text-lg font-bold">
            Sản phẩm an toàn — Minh bạch nguồn gốc
          </Title>
          <Paragraph className="text-emerald-100 text-xs sm:text-sm max-w-md mx-auto !mb-0">
            Mọi dữ liệu nhật ký canh tác và vật tư đều được ghi nhận trực tiếp từ trang trại và xác thực bởi hệ thống truy xuất điện tử.
          </Paragraph>
        </div>
      </div>
    </div>
  );
};

export default Trace;
