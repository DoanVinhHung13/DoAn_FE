import React, { useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Card,
  Typography,
  Image,
  Tag,
  Space,
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
import http from 'src/services/01_axios';
import { getUserDisplayName } from 'src/utils/userDisplayName';

const { Title, Paragraph, Text } = Typography;

const getImageUrl = (image) => {
  if (typeof image === 'string') return image;
  return image?.url || image?.imageUrl || image?.filePath || image?.path || image?.src || image?.fileUrl || null;
};

const formatDateRange = (startDate, endDate) => {
  const start = startDate ? dayjs(startDate) : null;
  const end = endDate ? dayjs(endDate) : null;
  const formattedStart = start?.isValid() ? start.format('DD/MM/YYYY') : '—';
  const formattedEnd = end?.isValid() ? end.format('DD/MM/YYYY') : formattedStart;

  return `${formattedStart} – ${formattedEnd}`;
};

const buildTimelineGroups = (traceData) => {
  if (!traceData) return [];

  const officialLogs = Array.isArray(traceData.cultivationLogs) ? traceData.cultivationLogs : [];
  const dailyLogs = Array.isArray(traceData.dailyLogs) ? traceData.dailyLogs : [];
  const rawEntries = officialLogs.length
    ? officialLogs.map((log, index) => {
        const dailyLog = dailyLogs[index] || dailyLogs.find((item) => (
          item?.date && log?.activityDate && dayjs(item.date).isSame(log.activityDate, 'day')
        ));
        const materials = Array.isArray(log.materials) ? log.materials : [];
        const materialsText = log.materialsText || materials
          .map((material) => {
            const name = material.materialName || material.name || 'Vật tư';
            const quantity = material.quantity ?? material.totalQuantity;
            const unit = material.unit || '';
            return quantity == null ? name : `${name}: ${quantity} ${unit}`.trim();
          })
          .join('; ');

        return {
          stage: dailyLog?.stage || log.stage || 'Giai đoạn canh tác',
          taskName: log.cultivationTaskName || log.taskName || dailyLog?.activity || `Công việc ${index + 1}`,
          startDate: log.workStartDate || log.activityDate || dailyLog?.date,
          endDate: log.workEndDate || log.activityDate || dailyLog?.date,
          description: log.description || dailyLog?.activity || '',
          updatedBy: getUserDisplayName(
            log.supervisorEditorName,
            log.editedByName,
            log.editedBy,
            log.updatedByName,
            log.updatedBy,
            log.editorName,
            log.updatedByUser,
            log.editor,
            log.performedByName,
            log.performedBy,
          ),
          materialsText,
          images: (Array.isArray(log.images) ? log.images : []).map(getImageUrl).filter(Boolean),
        };
      })
    : dailyLogs.map((log, index) => ({
        stage: log.stage || 'Giai đoạn canh tác',
        taskName: log.taskName || log.activity || `Công việc ${index + 1}`,
        startDate: log.date,
        endDate: log.date,
        description: log.activity || log.notes || '',
        updatedBy: getUserDisplayName(
          log.updatedByName,
          log.updatedBy,
          log.createdByName,
          log.createdBy,
          log.recordedByName,
          log.recordedBy,
          log.user,
          log.author,
          log.performedByName,
          log.performedBy,
        ),
        materialsText: '',
        images: [],
      }));

  return rawEntries.reduce((groups, entry) => {
    let group = groups.find((item) => item.stage === entry.stage);
    if (!group) {
      group = {
        stage: entry.stage,
        startDate: entry.startDate,
        endDate: entry.endDate,
        entries: [],
      };
      groups.push(group);
    }

    const start = entry.startDate ? dayjs(entry.startDate) : null;
    const end = entry.endDate ? dayjs(entry.endDate) : null;
    if (start?.isValid() && (!group.startDate || start.isBefore(dayjs(group.startDate), 'day'))) {
      group.startDate = entry.startDate;
    }
    if (end?.isValid() && (!group.endDate || end.isAfter(dayjs(group.endDate), 'day'))) {
      group.endDate = entry.endDate;
    }
    group.entries.push(entry);
    return groups;
  }, []);
};

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

  const { data: traceability, isLoading } = useQuery({
    queryKey: ['traceability', qrCode],
    queryFn: async () => {
      try {
        return await http.get(`/traceability/${encodeURIComponent(qrCode)}`, {
          skipNotice: true,
          skipAuthRedirect: true,
        });
      } catch {
        return null;
      }
    },
    enabled: Boolean(qrCode),
    retry: false,
  });

  // Construct dynamic trace data
  const traceData = useMemo(() => {
    // The API returns { success, data: { ...traceability } }.
    const payload = traceability?.data ?? traceability;
    const source = payload?.harvestBatch || payload;
    if (!source) return null;

    const toArray = (value) => (Array.isArray(value) ? value : []);

    const b = {
      ...source,
      dailyLogs: toArray(payload?.dailyLogs ?? source.dailyLogs),
      materials: toArray(payload?.materials ?? source.materials),
      photos: toArray(payload?.photos ?? source.photos),
      certifications: toArray(payload?.certifications ?? source.certifications),
    };
    return {
      qrCode: payload?.traceCode || qrCode || '—',
      batchCode: b.batchCode || '—',
      cropName: payload?.cropName || b.cropName || b.cropType || '—',
      farmName: payload?.farmName || b.farmName || b.landPlotName || '—',
      harvestDate: payload?.harvestDate || b.harvestDate || null,
      startDate: b.startDate,
      area: payload?.area ? `${payload.area} ${payload.areaUnit || 'ha'}` : '—',
      yield: b.quantity != null ? `${b.quantity} ${b.unit || ''}`.trim() : '—',
      dailyLogs: b.dailyLogs,
      certifications: b.certifications,

      displayOptions,

      materials: b.materials,

      photos: b.photos,
      cultivationLogs: toArray(payload?.cultivationLogs ?? source.cultivationLogs),
    };
  }, [traceability, qrCode, displayOptions]);

  const timelineGroups = useMemo(() => buildTimelineGroups(traceData), [traceData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" tip="Đang tải thông tin truy xuất..." />
      </div>
    );
  }

  if (!traceData) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        Không tìm thấy thông tin truy xuất cho mã này.
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
                <Text strong className="text-blue-700">
                  {traceData.harvestDate ? dayjs(traceData.harvestDate).format('DD/MM/YYYY') : '—'}
                </Text>
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

            {timelineGroups.length > 0 ? (
              <div className="space-y-8 px-1 sm:px-2">
                {timelineGroups.map((group) => (
                  <section key={group.stage}>
                    <div className="mb-5">
                      <Text strong className="block text-slate-800 text-sm sm:text-base">{group.stage}</Text>
                      <Text className="block mt-1 text-emerald-600 text-xs sm:text-sm">
                        <CalendarOutlined className="mr-1" />
                        <span className="font-medium">Thực tế:</span> {formatDateRange(group.startDate, group.endDate)}
                      </Text>
                    </div>

                    <div className="relative ml-1 border-l-2 border-emerald-300 pl-6 sm:pl-7">
                      {group.entries.map((entry, index) => (
                        <article key={`${entry.taskName}-${entry.startDate}-${index}`} className="relative pb-7 last:pb-0">
                          <span className="absolute -left-[31px] sm:-left-[34px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
                          <Text strong className="block text-slate-800 text-sm sm:text-base">{entry.taskName}</Text>
                          <Text strong className="block mt-1 text-slate-800 text-xs sm:text-sm">
                            {formatDateRange(entry.startDate, entry.endDate)}
                          </Text>
                          <Text className="block mt-2 text-slate-500 text-xs sm:text-sm">
                            Cập nhật bởi {entry.updatedBy}
                          </Text>
                          {entry.description && (
                            <Paragraph className="!mb-1 !mt-2 text-slate-700 text-xs sm:text-sm whitespace-pre-wrap">
                              {entry.description}
                            </Paragraph>
                          )}
                          {entry.materialsText && (
                            <Paragraph className="!mb-1 !mt-1 text-slate-700 text-xs sm:text-sm whitespace-pre-wrap">
                              {entry.materialsText}
                            </Paragraph>
                          )}
                          {traceData.displayOptions.showPhotos && entry.images.length > 0 && (
                            <Image.PreviewGroup items={entry.images}>
                              <div className="mt-2 flex flex-wrap gap-2">
                                {entry.images.map((src, imageIndex) => (
                                  <Image
                                    key={`${src}-${imageIndex}`}
                                    src={src}
                                    alt={`${entry.taskName} - ảnh ${imageIndex + 1}`}
                                    width={64}
                                    height={64}
                                    className="rounded-lg border border-slate-200 object-cover"
                                    preview={{ src }}
                                  />
                                ))}
                              </div>
                            </Image.PreviewGroup>
                          )}
                        </article>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-sm text-slate-400">Chưa có nhật ký chính thức</div>
            )}
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
                          {photo.date ? dayjs(photo.date).format('DD/MM/YYYY') : '—'}
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
                {traceData.certifications.length ? traceData.certifications.map((cert, index) => (
                  <div key={cert?.id || cert?.code || index}>
                    <Text strong className="block text-slate-900 font-bold sm:text-base">
                      {typeof cert === 'string' ? cert : cert?.name || cert?.certificateName || '—'}
                    </Text>
                    {(cert?.expiryDate || cert?.issuedBy) && (
                      <Text className="text-slate-600 text-xs block mt-0.5">
                        {cert?.expiryDate ? `Hiệu lực đến: ${cert.expiryDate}` : ''}
                        {cert?.expiryDate && cert?.issuedBy ? ' • ' : ''}
                        {cert?.issuedBy ? `Cấp bởi ${cert.issuedBy}` : ''}
                      </Text>
                    )}
                  </div>
                )) : <Text className="text-slate-600 text-xs">Chưa có chứng nhận từ hệ thống.</Text>}
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
