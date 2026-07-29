import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  Row,
  Checkbox,
  Typography,
  message,
  Tag,
  DatePicker,
  Modal,
  Timeline,
  Image,
  Descriptions,
  Space,
  Empty,
} from 'antd';
import {
  QrcodeOutlined,
  DownloadOutlined,
  PrinterOutlined,
  CopyOutlined,
  SafetyOutlined,
  EyeOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  ExperimentOutlined,
} from '@ant-design/icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';

import TitleCustom from 'src/components/TitleCustom';
import QrCodeService from 'src/services/QrCodeService';
import { formatDate, parseDate } from 'src/utils/dateFormatters';
import HarvestBatchService from 'src/services/HarvestBatchService';
import ROUTER from 'src/router/ROUTER';

const { Text, Paragraph } = Typography;

const QRManagement = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const qrContainerRef = useRef(null);

  const [previewData, setPreviewData] = useState(null);
  const [qrData, setQrData] = useState(null);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Get batch info from URL params if present
  const batchIdFromUrl = searchParams.get('batchId');

  // Watch form fields for live updates
  const selectedBatchId = Form.useWatch('harvestBatchId', form);
  const showDailyLog = Form.useWatch('showDailyLog', form);
  const showMaterials = Form.useWatch('showMaterials', form);
  const showPhotos = Form.useWatch('showPhotos', form);

  // 1. Fetch harvest batches list for selection dropdown
  const { data: harvestBatches = [] } = useQuery({
    queryKey: ['harvest-batches-select'],
    queryFn: async () => {
      const response = await HarvestBatchService.getHarvestBatches();
      const list = response?.data?.data?.items || response?.data?.data || response?.data?.items || response?.data || [];
      return Array.isArray(list) ? list : [];
    },
  });

  // Pre-fill batchId if passed in URL query
  useEffect(() => {
    if (batchIdFromUrl) {
      form.setFieldsValue({
        harvestBatchId: String(batchIdFromUrl),
      });
    } else if (harvestBatches.length > 0 && !selectedBatchId) {
      // Auto select first batch if none selected
      form.setFieldsValue({
        harvestBatchId: String(harvestBatches[0].id),
      });
    }
  }, [batchIdFromUrl, harvestBatches, form, selectedBatchId]);

  // 2. Fetch specific harvest batch detail by ID
  const { data: batchDetail } = useQuery({
    queryKey: ['harvest-batch-detail', selectedBatchId],
    queryFn: async () => {
      if (!selectedBatchId) return null;
      const response = await HarvestBatchService.getHarvestBatchById(selectedBatchId);
      return response?.data?.data || response?.data || response;
    },
    enabled: !!selectedBatchId,
  });

  // Automatically update basic info form fields when batchDetail is retrieved
  useEffect(() => {
    if (batchDetail) {
      form.setFieldsValue({
        batchCode: batchDetail.batchCode || '',
        cropName: batchDetail.cropName || batchDetail.cropType || '',
        startDate: batchDetail.startDate ? parseDate(batchDetail.startDate) : null,
        harvestDate: batchDetail.harvestDate ? parseDate(batchDetail.harvestDate) : null,
      });
    }
  }, [batchDetail, form]);

  // 2b. Fetch QR code hiện có của batch (nếu có activeQrCode)
  const { data: existingQRData } = useQuery({
    queryKey: ['existing-qr', selectedBatchId],
    queryFn: async () => {
      try {
        const response = await QrCodeService.getQrCodes({ BatchId: selectedBatchId, PageSize: 1 });
        const list = response?.data?.items || response?.data?.data?.items || [];
        return list[0] || null;
      } catch {
        return null;
      }
    },
    enabled: !!selectedBatchId && !!batchDetail?.hasActiveQrCode,
  });

  // Reset qrData & previewData ngay khi chọn lô thu hoạch khác
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setQrData(null);
    setPreviewData(null);
  }, [selectedBatchId]);

  // Hiển thị QR hiện tại chỉ khi batch đã có QR đang hoạt động.
  useEffect(() => {
    if (batchDetail && String(batchDetail.id) === String(selectedBatchId)) {
      if (batchDetail.hasActiveQrCode) {
        setQrData({
          ...existingQRData,
          traceCode: batchDetail.activeTraceCode || existingQRData?.traceCode || existingQRData?.code || `QR-${batchDetail.batchCode}`,
          harvestBatchId: selectedBatchId,
          isExisting: true,
        });
      } else {
        setQrData(null);
      }
    }
  }, [batchDetail, existingQRData, selectedBatchId]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Active batch info for rendering
  const activeBatch = batchDetail || harvestBatches.find((b) => String(b.id) === String(selectedBatchId)) || {
    batchCode: 'LOT-DEMO',
    cropName: 'Nông sản',
    startDate: '2024-03-01',
    harvestDate: '2024-05-20',
    landPlotName: 'Vườn A1',
    area: 2.5,
  };

  const previewDisplayOptions = previewData?.displayOptions || {
    showDailyLog: !!showDailyLog,
    showMaterials: !!showMaterials,
    showPhotos: !!showPhotos,
  };
  const displayOptionsDisabled = Boolean(qrData);

  // Preview data is supplied by the API. The batch is only a fallback for the
  // surrounding layout fields that are not part of the traceability payload.
  const previewBatchData = {
    ...activeBatch,
    ...(previewData?.traceability || {}),
    dailyLogs: previewData?.traceability?.dailyLogs || activeBatch?.dailyLogs || activeBatch?.logs || [
      {
        date: activeBatch?.startDate || '2024-03-12',
        stage: 'Gieo trồng',
        activity: `Bắt đầu gieo trồng ${activeBatch?.cropName || 'nông sản'}`,
        notes: 'Chuẩn bị đất và gieo hạt giống',
      },
      {
        date: parseDate(activeBatch?.startDate || '2024-03-12').add(20, 'day').format('YYYY-MM-DD'),
        stage: 'Chăm sóc',
        activity: 'Bón phân và tưới nước',
        notes: 'Bón phân NPK theo định kỳ, kiểm tra độ ẩm đất',
      },
      {
        date: parseDate(activeBatch?.startDate || '2024-03-12').add(45, 'day').format('YYYY-MM-DD'),
        stage: 'Phòng trừ sâu bệnh',
        activity: 'Kiểm tra và phun nông dược sinh học',
        notes: 'Phun nông dược sinh học, an toàn cho sức khỏe',
      },
      {
        date: activeBatch?.harvestDate || '2024-05-20',
        stage: 'Thu hoạch',
        activity: `Thu hoạch ${activeBatch?.cropName || 'nông sản'} đạt tiêu chuẩn`,
        notes: `Chất lượng đạt yêu cầu, năng suất tốt trên diện tích ${activeBatch?.area || 'N/A'} m2`,
      },
    ],
    materials: previewData?.traceability?.materials || activeBatch?.materials || activeBatch?.inputs || [
      {
        type: 'Phân bón',
        name: 'NPK 20-20-15',
        quantity: '300 kg',
        supplier: 'Công ty Phân bón Đồng Nai',
      },
      {
        type: 'Nông dược',
        name: 'Biotin Plus (Sinh học)',
        quantity: '5 lít',
        supplier: 'Công ty TNHH Sinh học An Nông',
      },
      {
        type: 'Giống cây trồng',
        name: activeBatch?.cropName || 'Giống chuẩn',
        quantity: '80 kg',
        supplier: 'Trung tâm Giống cây trồng',
      },
    ],
    photos: previewData?.traceability?.photos || activeBatch?.photos || activeBatch?.images || [
      {
        url: `https://placehold.co/400x300/22c55e/ffffff?text=${encodeURIComponent(activeBatch?.cropName || 'Nông sản')}+giai+đoạn+đầu`,
        caption: `${activeBatch?.cropName || 'Nông sản'} giai đoạn sinh trưởng`,
        date: parseDate(activeBatch?.startDate || '2024-03-12').add(30, 'day').format('YYYY-MM-DD'),
      },
      {
        url: `https://placehold.co/400x300/facc15/333333?text=Gần+đến+ngày+thu+hoạch`,
        caption: 'Sắp đến ngày thu hoạch',
        date: parseDate(activeBatch?.harvestDate || '2024-05-20').subtract(10, 'day').format('YYYY-MM-DD'),
      },
      {
        url: `https://placehold.co/400x300/3b82f6/ffffff?text=Thu+hoạch`,
        caption: 'Ngày thu hoạch',
        date: activeBatch?.harvestDate || '2024-05-20',
      },
    ],
  };

  const getPublicTraceUrl = (code, displayOptions = previewDisplayOptions) => {
    if (!code) return '';
    const params = new URLSearchParams();
    params.set('log', displayOptions.showDailyLog ? '1' : '0');
    params.set('mat', displayOptions.showMaterials ? '1' : '0');
    params.set('pic', displayOptions.showPhotos ? '1' : '0');
    return `${window.location.origin}/trace/${code}?${params.toString()}`;
  };

  // Trace code: use server-returned code if available, otherwise derive stably from batchCode (no random suffix)
  const currentTraceCode = qrData?.traceCode
    || previewData?.traceCode
    || (activeBatch?.batchCode ? `TR-${activeBatch.batchCode}` : 'TR-PREVIEW');
  const traceUrl = getPublicTraceUrl(currentTraceCode);
  const previewTraceCode = previewData?.traceCode || '';
  const previewTraceUrl = previewData?.qrCodeUrl
    || getPublicTraceUrl(previewTraceCode, previewDisplayOptions);

  // 3. Preview QR mutation: POST /api/qr-codes/preview
  const previewQRMutation = useMutation({
    mutationFn: (payload) => QrCodeService.previewQrCode(payload),
    onSuccess: (response) => {
      const data = response?.data?.data || response?.data;
      const result = {
        ...data,
        traceCode: data?.traceCode,
        qrImageDataUrl: data?.qrImageDataUrl,
        qrCodeUrl: data?.qrCodeUrl,
        traceability: data?.traceability,
        displayOptions: data?.displayOptions || previewDisplayOptions,
        harvestBatchId: selectedBatchId,
        isPreview: true,
      };
      setPreviewData(result);
      setPreviewModalOpen(true);
    },
    onError: () => {
      setPreviewData(null);
      setPreviewModalOpen(false);
      // axios interceptor handles error notification
    },
  });

  // 4. Create QR mutation
  const createQRMutation = useMutation({
    mutationFn: (payload) => QrCodeService.createQrCode(payload),
    onSuccess: (response, variables) => {
      const data = response?.data?.data || response?.data;
      const result = {
        ...data,
        traceCode: data?.traceCode || variables?.traceCode || currentTraceCode,
        harvestBatchId: selectedBatchId,
        createdAt: new Date().toISOString(),
      };
      setQrData(result);
      queryClient.invalidateQueries({ queryKey: ['qr-stats'] });
      queryClient.invalidateQueries({ queryKey: ['harvest-batch-detail', selectedBatchId] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
    },
    onError: () => {
      // axios interceptor handles error notification
    },
  });

  // Action: Preview trang truy xuất
  const handlePreview = useCallback(async () => {
    try {
      const values = await form.validateFields(['harvestBatchId']);
      const displayOptions = {
        showDailyLog: !!form.getFieldValue('showDailyLog'),
        showMaterials: !!form.getFieldValue('showMaterials'),
        showPhotos: !!form.getFieldValue('showPhotos'),
      };

      previewQRMutation.mutate({
        harvestBatchId: values.harvestBatchId,
        displayOptions,
      });
    } catch {
      message.warning('Vui lòng chọn lô thu hoạch trước khi xem preview!');
    }
  }, [form, previewQRMutation]);

  // Action: Tạo mã QR
  const handleCreateQR = async () => {
    try {
      const values = await form.validateFields(['harvestBatchId']);
      if (!previewData?.traceCode || previewData.harvestBatchId !== values.harvestBatchId) {
        message.warning('Vui lòng xem trước QR trước khi tạo mã chính thức.');
        return;
      }

      const payload = {
        harvestBatchId: values.harvestBatchId,
        traceCode: previewData.traceCode,
        displayOptions: previewData.displayOptions,
      };

      createQRMutation.mutate(payload);
    } catch {
      message.warning('Vui lòng chọn lô thu hoạch!');
    }
  };

  // Download QR SVG/Image
  const handleDownload = () => {
    const svgElement = qrContainerRef.current?.querySelector('svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new window.Image();

    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
      }
      const pngFile = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `QR_${activeBatch.batchCode || 'LOT'}_${currentTraceCode}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      message.success('Tải xuống mã QR thành công!');
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  // Print QR Image
  const handlePrint = () => {
    const printWindow = window.open('', '', 'width=600,height=600');
    const svgElement = qrContainerRef.current?.querySelector('svg');
    const svgHtml = svgElement ? svgElement.outerHTML : '';

    printWindow.document.write(`
      <html>
        <head>
          <title>In mã QR - ${activeBatch.batchCode || ''}</title>
          <style>
            body { text-align: center; padding: 30px; font-family: Arial, sans-serif; }
            .qr-box { display: inline-block; padding: 20px; border: 2px solid #16a34a; border-radius: 12px; }
            .title { color: #166534; font-size: 20px; font-weight: bold; margin-bottom: 10px; }
            .code { font-weight: bold; margin-top: 15px; font-size: 16px; color: #15803d; }
            .sub { color: #6b7280; font-size: 13px; margin-top: 5px; }
          </style>
        </head>
        <body>
          <div class="qr-box">
            <div class="title">Truy Xuất Nguồn Gốc Nông Sản</div>
            <div>${svgHtml}</div>
            <div class="code">Mã lô: ${activeBatch.batchCode || 'N/A'}</div>
            <div class="sub">Trace Code: ${currentTraceCode}</div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Copy Trace Link
  const handleCopy = () => {
    navigator.clipboard.writeText(traceUrl);
    message.success('Đã sao chép liên kết truy xuất!');
  };

  return (
    <>
      <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(ROUTER.FM_HARVEST_BATCHES)}
              className="h-10 rounded-xl"
            >
              Quay lại
            </Button>
            <TitleCustom className="!mb-0 flex items-center gap-2">
              <QrcodeOutlined className="text-2xl text-green-600" />
              Quản lý mã QR
            </TitleCustom>
          </div>
        </div>

        {/* Description */}
        <Card className="bg-green-50/70 border-green-200 rounded-2xl shadow-sm">
          <Paragraph className="mb-0 text-gray-700">
            Mã QR được tạo chuẩn hoá theo từng lô thu hoạch. Tùy chỉnh chọn các mục thông tin bên dưới và nhấn <strong>"Tạo mã QR chính thức"</strong> để sinh mã cho người tiêu dùng.
          </Paragraph>
        </Card>

        <Row gutter={24}>
          {/* Left Form */}
          <Col xs={24} lg={13}>
            {/* Thông tin cơ bản */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-lg">
                    <QrcodeOutlined className="text-green-600" />
                  </div>
                  <span className="text-lg font-semibold text-gray-800">Chi tiết lô thu hoạch</span>
                </div>
              }
              className="rounded-2xl shadow-sm border-0"
            >
              <Form
                form={form}
                layout="vertical"
                initialValues={{
                  showDailyLog: true,
                  showMaterials: true,
                  showPhotos: true,
                }}
              >
                <Form.Item
                  name="harvestBatchId"
                  hidden
                  rules={[{ required: true, message: 'Không xác định được lô thu hoạch' }]}
                >
                  <Input />
                </Form.Item>

                {/* batchCode: Mã lô thu hoạch */}
                <Form.Item
                  name="batchCode"
                  label="Mã lô thu hoạch"
                >
                  <Input
                    placeholder="Mã lô thu hoạch"
                    className="h-10 rounded-xl font-bold text-green-700 bg-gray-50"
                    disabled
                  />
                </Form.Item>

                {/* cropName: Loại cây trồng */}
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item
                      name="cropName"
                      label="Loại cây trồng (Sản phẩm)"
                    >
                      <Input
                        placeholder="Loại cây trồng"
                        className="h-10 rounded-xl font-semibold text-gray-800 bg-gray-50"
                        disabled
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  {/* startDate: Ngày trồng */}
                  <Col span={12}>
                    <Form.Item
                      name="startDate"
                      label="Ngày trồng (Bắt đầu)"
                    >
                      <DatePicker
                        placeholder="DD/MM/YYYY"
                        className="w-full h-10 rounded-xl bg-gray-50"
                        format="DD/MM/YYYY"
                        disabled
                      />
                    </Form.Item>
                  </Col>

                  {/* harvestDate: Ngày thu hoạch */}
                  <Col span={12}>
                    <Form.Item
                      name="harvestDate"
                      label="Ngày thu hoạch"
                    >
                      <DatePicker
                        placeholder="DD/MM/YYYY"
                        className="w-full h-10 rounded-xl bg-gray-50"
                        format="DD/MM/YYYY"
                        disabled
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>
            </Card>

            {/* Display Options */}
            <Card
              title={
                <div className="flex items-center gap-2">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
                    <EyeOutlined className="text-blue-600" />
                  </div>
                  <span className="text-lg font-semibold text-gray-800">Tùy chỉnh thông tin hiển thị</span>
                </div>
              }
              className="mt-6 rounded-2xl shadow-sm border-0"
            >
              <Paragraph className="mb-4 text-sm text-gray-600">
                Tích chọn các mục bên dưới. Khi khách hàng quét mã QR, hệ thống chỉ hiển thị đúng các thông tin được tích:
              </Paragraph>

              <Form form={form} component={false}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50/80 rounded-xl border border-gray-100">
                  <Form.Item name="showDailyLog" valuePropName="checked" noStyle>
                    <Checkbox disabled={displayOptionsDisabled} className="text-sm font-medium">
                      <span className="ml-1">📝 Nhật ký hàng ngày</span>
                    </Checkbox>
                  </Form.Item>

                  <Form.Item name="showMaterials" valuePropName="checked" noStyle>
                    <Checkbox disabled={displayOptionsDisabled} className="text-sm font-medium">
                      <span className="ml-1">🧪 Thông tin vật tư sử dụng</span>
                    </Checkbox>
                  </Form.Item>

                  <Form.Item name="showPhotos" valuePropName="checked" noStyle>
                    <Checkbox disabled={displayOptionsDisabled} className="text-sm font-medium">
                      <span className="ml-1">📷 Hình ảnh thực địa</span>
                    </Checkbox>
                  </Form.Item>

                </div>
              </Form>

              <div className="mt-6 space-y-3">
                {/* QR is controlled by eligibility and active QR state, not harvest progress. */}
                {(() => {
                  const isQrEligible = batchDetail?.isQrEligible === true;

                  if (!isQrEligible) {
                    return (
                      <div className="space-y-3">
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
                          <SafetyOutlined className="text-amber-600 text-lg flex-shrink-0" />
                          <Text className="text-amber-800 text-xs font-medium">
                            Lô thu hoạch này chưa đủ điều kiện tạo QR.
                          </Text>
                        </div>
                        <Button
                          size="large"
                          block
                          disabled
                          icon={<QrcodeOutlined />}
                          className="h-11 rounded-xl font-semibold"
                        >
                          Tạo mã QR
                        </Button>
                        <Button
                          size="large"
                          block
                          disabled
                          icon={<EyeOutlined />}
                          className="h-11 rounded-xl font-medium"
                        >
                          Xem trước QR
                        </Button>
                      </div>
                    );
                  }

                  if (batchDetail?.hasActiveQrCode) {
                    return (
                      <>
                        <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                          <CheckCircleOutlined className="text-blue-500 flex-shrink-0" />
                          <Text className="text-blue-700 text-sm">
                            Lô đã có mã QR đang hoạt động. Để tạo mã mới, cần vô hiệu hoá mã cũ trước.
                          </Text>
                        </div>
                        <Button
                          type="dashed"
                          size="large"
                          block
                          icon={<EyeOutlined />}
                          onClick={handlePreview}
                          loading={previewQRMutation.isPending}
                          className="h-11 rounded-xl text-blue-600 border-blue-400 hover:bg-blue-50 font-medium"
                        >
                          Xem trước QR
                        </Button>
                      </>
                    );
                  }

                  return (
                    <>
                      <Button
                        type="primary"
                        size="large"
                        block
                        icon={<QrcodeOutlined />}
                        onClick={handleCreateQR}
                        loading={createQRMutation.isPending}
                        className="h-11 rounded-xl bg-green-600 hover:bg-green-700 font-semibold shadow-md shadow-green-100"
                      >
                        Tạo mã QR chính thức
                      </Button>
                      <Button
                        type="dashed"
                        size="large"
                        block
                        icon={<EyeOutlined />}
                        onClick={handlePreview}
                        loading={previewQRMutation.isPending}
                        className="h-11 rounded-xl text-blue-600 border-blue-400 hover:bg-blue-50 font-medium"
                      >
                        Xem trước QR
                      </Button>
                    </>
                  );
                })()}
              </div>
            </Card>
          </Col>

          {/* Right Standard QR Code Display */}
          <Col xs={24} lg={11}>
            <Card
              title={
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-gray-800">
                    {qrData ? (qrData.isExisting ? 'MÃ QR HIỆN TẠI' : 'MÃ QR CHÍNH THỨC') : 'KẾT QUẢ MÃ QR'}
                  </span>
                  {qrData ? (
                    <Tag
                      icon={<CheckCircleOutlined />}
                      color={qrData.isExisting ? 'blue' : 'success'}
                      className="px-3 py-1 text-xs font-bold rounded-full"
                    >
                      {qrData.isExisting ? 'ĐANG HOẠT ĐỘNG' : 'ĐÃ TẠO THÀNH CÔNG'}
                    </Tag>
                  ) : (
                    <Tag color="default" className="px-3 py-1 text-xs font-bold rounded-full">
                      CHƯA KHỞI TẠO
                    </Tag>
                  )}
                </div>
              }
              className="rounded-2xl shadow-sm border-0 h-full flex flex-col justify-between"
            >
              {qrData ? (
                <div className="space-y-4">
                  {/* Banner thông báo khi hiển thị QR sẵn có */}
                  {qrData.isExisting && (
                    <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3">
                      <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white text-xs font-bold">i</span>
                      </div>
                      <div>
                        <Text strong className="text-blue-700 text-sm block">Lô này đã có mã QR đang hoạt động</Text>
                        <Text className="text-blue-600 text-xs">
                          Mã truy xuất: <strong>{qrData.traceCode}</strong>. Để tạo mã mới, hãy vô hiệu hoá mã hiện tại trước.
                        </Text>
                      </div>
                    </div>
                  )}
                  <div className="space-y-6">
                  {/* Standard High-contrast Black/White QR Code */}
                  <div className="flex justify-center p-6 bg-white border-2 border-dashed border-gray-200 rounded-2xl">
                    <div ref={qrContainerRef} className="p-4 bg-white rounded-xl shadow-lg border border-gray-100 flex flex-col items-center">
                      <QRCodeSVG
                        value={traceUrl}
                        size={200}
                        level="H"
                        marginSize={2}
                        fgColor="#000000"
                        bgColor="#ffffff"
                      />
                      <div className="mt-3 text-center">
                        <Text strong className="block text-sm text-green-700">
                          {activeBatch.batchCode}
                        </Text>
                        <Text className="text-xs text-gray-500 font-medium">
                          {activeBatch.cropName || activeBatch.cropType || 'Lô thu hoạch'}
                        </Text>
                      </div>
                    </div>
                  </div>

                  {/* Trace Code */}
                  <div className="text-center bg-green-50/60 p-3 rounded-xl border border-green-100">
                    <Text className="text-xs text-gray-500 block mb-1">Mã truy xuất</Text>
                    <Text strong className="text-base text-green-800 font-mono">
                      {currentTraceCode}
                    </Text>
                  </div>

                  {/* Active display options summary */}
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                    <Text className="text-xs text-gray-500 block mb-2 font-medium">Hiển thị khi quét QR:</Text>
                    <div className="flex flex-wrap gap-1.5">
                      <Tag color={showDailyLog ? 'blue' : 'default'} className="rounded-full text-xs">
                        {showDailyLog ? '✓ Nhật ký' : '✕ Nhật ký'}
                      </Tag>
                      <Tag color={showMaterials ? 'orange' : 'default'} className="rounded-full text-xs">
                        {showMaterials ? '✓ Vật tư' : '✕ Vật tư'}
                      </Tag>
                      <Tag color={showPhotos ? 'green' : 'default'} className="rounded-full text-xs">
                        {showPhotos ? '✓ Ảnh thực địa' : '✕ Ảnh thực địa'}
                      </Tag>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-3">
                    <Button
                      type="primary"
                      size="large"
                      block
                      icon={<DownloadOutlined />}
                      onClick={handleDownload}
                      className="h-11 rounded-xl bg-green-600 hover:bg-green-700 font-semibold"
                    >
                      Tải xuống mã QR (PNG)
                    </Button>

                    <Row gutter={12}>
                      <Col span={12}>
                        <Button
                          size="large"
                          block
                          icon={<PrinterOutlined />}
                          onClick={handlePrint}
                          className="h-11 rounded-xl"
                        >
                          In mã QR
                        </Button>
                      </Col>
                      <Col span={12}>
                        <Button
                          size="large"
                          block
                          icon={<CopyOutlined />}
                          onClick={handleCopy}
                          className="h-11 rounded-xl"
                        >
                          Sao chép link
                        </Button>
                      </Col>
                    </Row>
                  </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                  <div className={`w-20 h-20 ${batchDetail?.isQrEligible !== true ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-green-50 text-green-600 border-green-100'} rounded-2xl flex items-center justify-center mb-4 shadow-sm border`}>
                    <QrcodeOutlined className="text-4xl" />
                  </div>
                  <Text strong className="text-gray-800 text-lg mb-1">
                    {batchDetail?.isQrEligible !== true ? 'Lô chưa đủ điều kiện tạo QR' : 'Chưa tạo mã QR chính thức'}
                  </Text>
                  <Paragraph className="text-xs text-gray-500 max-w-xs mb-0">
                    {batchDetail?.isQrEligible !== true
                      ? 'Lô hàng này chưa được hệ thống cho phép tạo QR.'
                      : 'Vui lòng xem trước QR trước, sau đó bấm nút "Tạo mã QR chính thức" để lưu đúng mã truy xuất đã xem.'}
                  </Paragraph>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>

      {/* Trace Preview Modal */}
      <Modal
        open={previewModalOpen}
        onCancel={() => setPreviewModalOpen(false)}
        footer={null}
        width={860}
        title={
          <div className="flex items-center gap-2">
            <EyeOutlined className="text-blue-600" />
            <span>Xem trước trang truy xuất — Lô: <strong>{previewBatchData?.batchCode || 'N/A'}</strong></span>
          </div>
        }
        styles={{ body: { padding: 0, maxHeight: '80vh', overflowY: 'auto' } }}
      >
        {/* Preview banner */}
        <div className="bg-amber-50 border-b border-amber-200 px-5 py-2 flex items-center gap-2">
          <EyeOutlined className="text-amber-500" />
          <span className="text-xs text-amber-700 font-medium">
            Đây là bản xem trước, chưa lưu database.
            {previewData?.traceability?.verificationStatus && (
              <> Trạng thái: <strong>{previewData.traceability.verificationStatus}</strong>.</>
            )}
          </span>
        </div>

        {/* QR Code + Link Preview */}
        <div className="flex items-center gap-6 px-6 py-5 bg-white border-b border-gray-100">
          <div className="flex-shrink-0 p-3 bg-white rounded-xl shadow border border-gray-100 flex flex-col items-center">
            {previewData?.qrImageDataUrl ? (
              <img
                src={previewData.qrImageDataUrl}
                alt={`QR xem trước ${previewBatchData?.batchCode || ''}`}
                className="w-[120px] h-[120px] object-contain"
              />
            ) : (
              <QRCodeSVG
                value={previewTraceUrl}
                size={120}
                level="H"
                marginSize={1}
                fgColor="#000000"
                bgColor="#ffffff"
              />
            )}
            <Text strong className="mt-2 block text-xs text-green-700 text-center">
              {previewBatchData?.batchCode}
            </Text>
          </div>
          <div className="flex-1 min-w-0">
            <Text className="text-xs text-gray-500 block mb-1">Mã truy xuất</Text>
            <Text strong className="text-sm text-green-800 font-mono block mb-3">
              {previewTraceCode || '—'}
            </Text>
            <Text className="text-xs text-gray-500 block mb-1">Link truy xuất:</Text>
            <div className="flex items-center gap-2">
              <Text className="text-xs text-blue-600 font-mono truncate flex-1 bg-blue-50 px-2 py-1 rounded">
                {previewTraceUrl || '—'}
              </Text>
              <Button
                size="small"
                icon={<CopyOutlined />}
                onClick={() => {
                  navigator.clipboard.writeText(previewTraceUrl);
                  message.success('Đã sao chép link truy xuất!');
                }}
                className="flex-shrink-0"
              >
                Sao chép
              </Button>
            </div>
          </div>
        </div>

        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
          {/* Header */}
          <div className="bg-green-600 text-white py-8 px-6">
            <div className="max-w-full">
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🌾</span>
                </div>
                <div>
                  <Typography.Title level={3} className="!text-white !mb-1">Truy xuất nguồn gốc</Typography.Title>
                  <Typography.Text className="text-green-100">
                    Mã lô: <strong>{previewBatchData?.batchCode || 'N/A'}</strong>
                  </Typography.Text>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-5 py-5 space-y-4">
            {/* Thông tin cơ bản — luôn hiển thị */}
            <Card className="shadow-sm rounded-xl">
              <Typography.Title level={5} className="flex items-center gap-2 !mb-3">
                <span>🌱</span> Thông tin sản phẩm
              </Typography.Title>
              <Descriptions bordered column={2} size="small">
                <Descriptions.Item label="Mã lô" span={1}>
                  <Tag color="blue" className="font-semibold">{previewBatchData?.batchCode || '—'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Sản phẩm" span={1}>
                  <Text strong>{previewBatchData?.cropName || previewBatchData?.cropType || '—'}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Trang trại / Vùng trồng" span={2}>
                  <Space>
                    <EnvironmentOutlined className="text-green-600" />
                    {previewBatchData?.landPlotName || previewBatchData?.farmName || '—'}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày bắt đầu" span={1}>
                  <Space>
                    <CalendarOutlined className="text-blue-600" />
                    {previewBatchData?.startDate ? formatDate(previewBatchData.startDate) : '—'}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày thu hoạch" span={1}>
                  <Space>
                    <CalendarOutlined className="text-green-600" />
                    {previewBatchData?.harvestDate ? formatDate(previewBatchData.harvestDate) : '—'}
                  </Space>
                </Descriptions.Item>
                {previewBatchData?.area && (
                  <Descriptions.Item label="Diện tích" span={1}>
                    {previewBatchData.area} m2
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>

            {/* Nhật ký hàng ngày */}
            {previewDisplayOptions.showDailyLog ? (
              <Card className="shadow-sm rounded-xl">
                <Typography.Title level={5} className="!mb-3">📝 Nhật ký canh tác hàng ngày</Typography.Title>
                {previewBatchData.dailyLogs?.length > 0 ? (
                  <Timeline
                    mode="left"
                    items={previewBatchData.dailyLogs.map((log, i) => ({
                      key: i,
                      color: 'green',
                      dot: <CheckCircleOutlined />,
                      children: (
                        <div className="pb-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Tag color="blue">{log.date ? formatDate(log.date) : '—'}</Tag>
                            <Text strong>{log.stage || log.activity || ''}</Text>
                          </div>
                          {log.activity && <Typography.Paragraph className="!mb-1"><Text strong>Hoạt động:</Text> {log.activity}</Typography.Paragraph>}
                          {log.notes && <Typography.Paragraph className="!mb-0 text-gray-500">{log.notes}</Typography.Paragraph>}
                        </div>
                      ),
                    }))}
                  />
                ) : (
                  <Empty description="Chưa có nhật ký canh tác" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Card>
            ) : (
              <Card className="shadow-sm rounded-xl border-dashed border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2 text-gray-400">
                  <span>📝</span>
                  <Text type="secondary" className="text-sm italic">Nhật ký canh tác: <strong>Không hiển thị</strong> (chưa được tích)</Text>
                </div>
              </Card>
            )}

            {/* Thông tin vật tư */}
            {previewDisplayOptions.showMaterials ? (
              <Card className="shadow-sm rounded-xl">
                <Typography.Title level={5} className="flex items-center gap-2 !mb-3">
                  <ExperimentOutlined className="text-orange-500" /> Thông tin vật tư sử dụng
                </Typography.Title>
                {previewBatchData.materials?.length > 0 ? (
                  <div className="space-y-2">
                    {previewBatchData.materials.map((mat, i) => (
                      <Card key={i} size="small" className="bg-gray-50">
                        <Row gutter={12}>
                          <Col span={6}><Text type="secondary">Loại</Text><div><Text strong>{mat.type || mat.materialType || '—'}</Text></div></Col>
                          <Col span={6}><Text type="secondary">Tên</Text><div><Text strong>{mat.name || mat.materialName || '—'}</Text></div></Col>
                          <Col span={6}><Text type="secondary">Số lượng</Text><div><Text strong className="text-blue-600">{mat.quantity || '—'}</Text></div></Col>
                          <Col span={6}><Text type="secondary">Nhà cung cấp</Text><div><Text>{mat.supplier || '—'}</Text></div></Col>
                        </Row>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Empty description="Chưa có thông tin vật tư" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Card>
            ) : (
              <Card className="shadow-sm rounded-xl border-dashed border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2 text-gray-400">
                  <span>🧪</span>
                  <Text type="secondary" className="text-sm italic">Thông tin vật tư: <strong>Không hiển thị</strong> (chưa được tích)</Text>
                </div>
              </Card>
            )}

            {/* Hình ảnh thực địa */}
            {previewDisplayOptions.showPhotos ? (
              <Card className="shadow-sm rounded-xl">
                <Typography.Title level={5} className="!mb-3">📷 Hình ảnh thực tế tại vùng trồng</Typography.Title>
                {previewBatchData.photos?.length > 0 ? (
                  <Row gutter={[12, 12]}>
                    {previewBatchData.photos.map((photo, i) => (
                      <Col key={i} xs={24} sm={12} md={8}>
                        <Card size="small" cover={<Image src={photo.url || photo.imageUrl} alt={photo.caption || photo.description || ''} />}>
                          <Typography.Paragraph className="!mb-0 text-center text-xs" strong>{photo.caption || photo.description || ''}</Typography.Paragraph>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <Empty description="Chưa có hình ảnh thực địa" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
              </Card>
            ) : (
              <Card className="shadow-sm rounded-xl border-dashed border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2 text-gray-400">
                  <span>📷</span>
                  <Text type="secondary" className="text-sm italic">Hình ảnh thực địa: <strong>Không hiển thị</strong> (chưa được tích)</Text>
                </div>
              </Card>
            )}

            {/* Footer */}
            <Card className="bg-green-50 border-green-200 rounded-xl">
              <div className="text-center">
                <CheckCircleOutlined className="text-3xl text-green-600 mb-2" />
                <Typography.Title level={5} className="!mb-1">Sản phẩm an toàn, chất lượng đảm bảo</Typography.Title>
                <Typography.Paragraph className="text-gray-500 !mb-0 text-sm">
                  Mọi thông tin đều được ghi nhận và xác thực bởi hệ thống quản lý điện tử
                </Typography.Paragraph>
              </div>
            </Card>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default QRManagement;
