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
  FileImageOutlined,
} from '@ant-design/icons';
import { formatAreaUnit } from 'src/constants/measurementUnits';
import { Sprout, Wheat } from 'lucide-react';
import http from 'src/services/01_axios';
import { formatDate, parseDate } from 'src/utils/dateFormatters';
import { getUserDisplayName } from 'src/utils/userDisplayName';

const { Title, Paragraph, Text } = Typography;

const MATERIAL_TYPE_LABELS = {
  FERTILIZER: 'Phân bón',
  PESTICIDE: 'Nông dược',
  CROP_PROTECTION: 'Nông dược',
  SEED: 'Giống cây trồng',
  OTHER: 'Vật tư khác',
};

const getMaterialType = (material, fallback = 'OTHER') => (
  material?.materialType || material?.type || material?.category || fallback
);

const getMaterialTypeLabel = (material, fallback = 'OTHER') => {
  const type = getMaterialType(material, fallback);
  const normalizedType = String(type).trim().toUpperCase();
  return MATERIAL_TYPE_LABELS[normalizedType] || type || MATERIAL_TYPE_LABELS.OTHER;
};

const getMaterialName = (material) => (
  material?.materialName || material?.name || material?.fertilizerName || material?.pesticideName || 'Vật tư'
);

const getMaterialQuantity = (material) => (
  material?.quantity ?? material?.totalQuantity ?? material?.quantityUsed
);

const getMaterialUnit = (material, fallback = '') => {
  const explicitUnit = material?.unit || material?.quantityUnit || material?.measurementUnit;
  if (explicitUnit) return explicitUnit;

  const type = String(getMaterialType(material, '')).trim().toUpperCase();
  return fallback || (type === 'FERTILIZER' ? 'kg' : type === 'PESTICIDE' || type === 'CROP_PROTECTION' ? 'lít' : '');
};

const normalizeMaterial = (material, fallbackType, usedAt, taskName) => ({
  ...material,
  type: getMaterialTypeLabel(material, fallbackType),
  name: getMaterialName(material),
  quantity: getMaterialQuantity(material),
  unit: getMaterialUnit(material),
  supplier: material?.supplier || material?.supplierName,
  usedAt: material?.usedAt || usedAt,
  taskName: material?.taskName || taskName,
});

const formatMaterialText = (text) => String(text || '')
  .replace(/\bFERTILIZER\b/gi, 'Phân bón')
  .replace(/\bPESTICIDE\b/gi, 'Nông dược')
  .replace(/\bCROP_PROTECTION\b/gi, 'Nông dược')
  .replace(/\bOTHER\b/gi, 'Vật tư khác');

const formatMaterialQuantity = (material) => {
  const quantity = getMaterialQuantity(material);
  if (quantity == null || quantity === '') return 'Chưa cập nhật';
  if (typeof quantity === 'string' && /[a-zA-ZÀ-ỹ]/.test(quantity)) return quantity;

  return `${quantity}${getMaterialUnit(material) ? ` ${getMaterialUnit(material)}` : ''}`;
};

const getMaterialColorClass = (material) => {
  const type = String(getMaterialType(material, '')).trim().toUpperCase();
  if (type.includes('FERTILIZER') || type.includes('PHÂN BÓN')) return 'text-blue-700';
  if (type.includes('PESTICIDE') || type.includes('CROP_PROTECTION') || type.includes('NÔNG DƯỢC')) {
    return 'text-purple-700';
  }
  return 'text-slate-700';
};

const formatMaterialLine = (material) => {
  const area = material?.area ?? material?.totalArea;
  const areaUnit = material?.areaUnit || material?.totalAreaUnit || 'ha';
  const areaText = area == null || area === ''
    ? ''
    : `, diện tích ${formatAreaValue(area)} ${areaUnit}`;

  return `${getMaterialName(material)}: ${formatMaterialQuantity(material)}${areaText}`;
};

const getMaterialLines = (entry) => {
  const textLines = entry.materialsText
    .split(/[;\n]+/)
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text) => ({
      text: text.replace(/^(?:Phân bón|Nông dược)\s*:?\s*/i, ''),
      colorClass: getMaterialColorClass({ type: text }),
    }));

  if (textLines.length > 0) return textLines;

  return entry.materials.map((material) => ({
    text: formatMaterialLine(material),
    colorClass: getMaterialColorClass(material),
  }));
};

const getImageUrl = (image) => {
  if (typeof image === 'string') return image;
  return image?.url || image?.imageUrl || image?.filePath || image?.path || image?.src || image?.fileUrl || null;
};

const formatDateRange = (startDate, endDate) => {
  const start = startDate ? parseDate(startDate) : null;
  const end = endDate ? parseDate(endDate) : null;
  const formattedStart = start?.isValid() ? formatDate(startDate) : '—';
  const formattedEnd = end?.isValid() ? formatDate(endDate) : formattedStart;

  return `${formattedStart} – ${formattedEnd}`;
};

const formatAreaValue = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return value;

  const roundedValue = Number(numericValue.toFixed(2));
  return Object.is(roundedValue, -0) ? 0 : roundedValue;
};

const buildTimelineGroups = (traceData) => {
  if (!traceData) return [];

  const officialLogs = Array.isArray(traceData.cultivationLogs) ? traceData.cultivationLogs : [];
  const dailyLogs = Array.isArray(traceData.dailyLogs) ? traceData.dailyLogs : [];
  const rawEntries = officialLogs.length
    ? officialLogs.map((log, index) => {
        const dailyLog = dailyLogs.find((item) => (
          item?.date && log?.activityDate && parseDate(item.date).isSame(parseDate(log.activityDate), 'day')
        )) || dailyLogs[index];
        const materials = Array.isArray(log.materials) ? log.materials : [];
        const materialsText = log.materialsText || materials
          .map((material) => {
            const name = getMaterialName(material);
            const quantity = getMaterialQuantity(material);
            const unit = getMaterialUnit(material);
            return quantity == null ? name : `${name}: ${quantity} ${unit}`.trim();
          })
          .join('; ');

        return {
          stage: log.cultivationStageName || dailyLog?.stage || log.stage || 'Giai đoạn canh tác',
          stageOrder: log.stageOrder ?? dailyLog?.stageOrder,
          taskName: log.cultivationTaskName || log.taskName || dailyLog?.activity || 'Hoạt động canh tác',
          taskOrder: log.taskOrder ?? dailyLog?.taskOrder,
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
          materialsText: formatMaterialText(materialsText),
          materials: materials.map((material) => normalizeMaterial(material, undefined, log.activityDate, log.cultivationTaskName || log.taskName)),
          images: (Array.isArray(log.images) ? log.images : []).map(getImageUrl).filter(Boolean),
        };
      })
    : dailyLogs.map((log) => ({
        stage: log.stage || 'Giai đoạn canh tác',
        stageOrder: log.stageOrder,
        taskName: log.taskName || log.activity || 'Hoạt động canh tác',
        taskOrder: log.taskOrder,
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
        materials: [],
        images: [],
      }));

  return rawEntries.reduce((groups, entry) => {
    let group = groups.find((item) => item.stage === entry.stage && item.stageOrder === entry.stageOrder);
    if (!group) {
      group = {
        stage: entry.stage,
        stageOrder: entry.stageOrder,
        startDate: entry.startDate,
        endDate: entry.endDate,
        entries: [],
      };
      groups.push(group);
    }

    const start = entry.startDate ? parseDate(entry.startDate) : null;
    const end = entry.endDate ? parseDate(entry.endDate) : null;
    if (start?.isValid() && (!group.startDate || start.isBefore(parseDate(group.startDate), 'day'))) {
      group.startDate = entry.startDate;
    }
    if (end?.isValid() && (!group.endDate || end.isAfter(parseDate(group.endDate), 'day'))) {
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
    const cultivationLogs = toArray(payload?.cultivationLogs ?? source.cultivationLogs);
    const logMaterials = cultivationLogs.flatMap((log) => {
      const directMaterials = toArray(log?.materials);
      if (directMaterials.length) {
        return directMaterials.map((material) => normalizeMaterial(
          material,
          undefined,
          log.activityDate,
          log.cultivationTaskName || log.taskName,
        ));
      }

      const fertilizerMaterials = toArray(log?.totalFertilizers || log?.fertilizers)
        .map((material) => normalizeMaterial(material, 'FERTILIZER', log.activityDate, log.cultivationTaskName || log.taskName));
      const pesticideMaterials = toArray(log?.totalPesticides || log?.pesticides)
        .map((material) => normalizeMaterial(material, 'PESTICIDE', log.activityDate, log.cultivationTaskName || log.taskName));

      return [...fertilizerMaterials, ...pesticideMaterials];
    });
    const journalMaterials = (logMaterials.length ? logMaterials : b.materials)
      .map((material) => normalizeMaterial(material));
    const logPhotos = cultivationLogs.flatMap((log) => (
      Array.isArray(log?.images) ? log.images.map((image) => ({
        url: getImageUrl(image),
        caption: image?.description || log.cultivationTaskName || log.description || '',
        date: log.activityDate,
      })) : []
    )).filter((photo) => photo.url);
    const journalAreas = cultivationLogs.map((log) => {
      const materials = Array.isArray(log?.materials) ? log.materials : [];
      const materialAreas = materials
        .map((material) => Number(material?.area))
        .filter((area) => Number.isFinite(area) && area > 0);
      const executedArea = Number(log?.executedArea);
      return {
        area: executedArea > 0 ? executedArea : (materialAreas.length ? Math.max(...materialAreas) : 0),
        areaUnit: materials.find((material) => material?.areaUnit)?.areaUnit || log?.areaUnit || '',
      };
    }).filter((entry) => entry.area > 0);
    const journalArea = journalAreas.length
      ? journalAreas.reduce((total, entry) => total + entry.area, 0)
      : null;
    const journalAreaUnit = journalAreas.find((entry) => entry.areaUnit)?.areaUnit || '';
    const areaValue = journalArea ?? payload?.area;
    const areaUnit = formatAreaUnit(journalAreaUnit || payload?.areaUnit);
    return {
      qrCode: payload?.traceCode || qrCode || '—',
      batchCode: b.batchCode || '—',
      cropName: payload?.cropName || b.cropName || b.cropType || '—',
      farmName: payload?.farmName || b.farmName || b.landPlotName || '—',
      harvestDate: payload?.harvestDate || b.harvestDate || null,
      startDate: b.startDate,
      area: areaValue != null ? [formatAreaValue(areaValue), areaUnit].filter(Boolean).join(' ') : '—',
      yield: b.quantity != null ? `${b.quantity} ${b.unit || ''}`.trim() : '—',
      dailyLogs: b.dailyLogs,
      certifications: b.certifications,

      displayOptions,

      materials: journalMaterials,

      photos: b.photos.length ? b.photos : logPhotos,
      cultivationLogs,
    };
  }, [traceability, qrCode, displayOptions]);

  const timelineGroups = useMemo(() => buildTimelineGroups(traceData), [traceData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spin size="large" description="Đang tải thông tin truy xuất..." />
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
                  {traceData.harvestDate ? formatDate(traceData.harvestDate) : '—'}
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
              <div className="space-y-9 px-1 sm:px-2">
                {timelineGroups.map((group) => (
                  <section key={`${group.stage}-${group.stageOrder ?? 'unknown'}`}>
                    <div className="mb-6">
                      <Text strong className="block text-base font-bold leading-6 text-slate-800 sm:text-lg">{group.stage}</Text>
                      <Text className="mt-1 block text-xs text-emerald-600 sm:text-sm">
                        <CalendarOutlined className="mr-1" />
                        <span className="font-medium">Thực tế:</span> {formatDateRange(group.startDate, group.endDate)}
                      </Text>
                    </div>

                    <div className="relative ml-2 border-l-2 border-emerald-300 pl-5 sm:pl-6">
                      {group.entries.map((entry, index) => (
                        <article key={`${entry.taskName}-${entry.startDate}-${index}`} className="relative pb-8 last:pb-0">
                          <span className="absolute -left-[27px] sm:-left-[29px] top-1.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 shadow-sm" />
                          <Text strong className="block text-sm font-bold leading-6 text-slate-800 sm:text-base">{entry.taskName}</Text>
                          <Text strong className="mt-1 block text-sm leading-6 text-slate-800">
                            {formatDateRange(entry.startDate, entry.endDate)}
                          </Text>
                          <Text className="mt-1.5 block text-xs leading-5 text-slate-500 sm:text-sm">
                            Cập nhật bởi {entry.updatedBy}
                          </Text>
                          {entry.description && (
                            <Paragraph className="!mb-1 !mt-2 text-slate-700 text-xs sm:text-sm whitespace-pre-wrap">
                              {entry.description}
                            </Paragraph>
                          )}
                          {(entry.materials.length > 0 || entry.materialsText) && (
                            <div className="mt-2 space-y-1">
                              {getMaterialLines(entry).map((material, materialIndex) => (
                                <div
                                  key={`${material.text}-${materialIndex}`}
                                  className={`text-sm font-medium leading-relaxed ${material.colorClass}`}
                                >
                                  {material.text}
                                </div>
                              ))}
                            </div>
                          )}
                          {traceData.displayOptions.showPhotos && entry.images.length > 0 && (
                            <Image.PreviewGroup items={entry.images}>
                              <div className="mt-3">
                                <Text className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-600">
                                  <FileImageOutlined /> Ảnh minh chứng ({entry.images.length})
                                </Text>
                                <div className="flex flex-wrap gap-2">
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
        {(traceData.displayOptions.showMaterials ?? traceData.displayOptions.showAutomation) && traceData.materials.length > 0 && (
          <Card className="rounded-2xl border-0 shadow-[0_12px_32px_rgba(15,23,42,0.07)]">
            <div className="mb-4 flex items-start gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <ExperimentOutlined className="text-lg" />
              </div>
              <div>
                <Title level={4} className="!mb-0.5 !text-base sm:!text-lg font-bold text-slate-900">
                  Phân bón và nông dược
                </Title>
                <Text className="text-xs text-slate-500">Các loại đã sử dụng trong nhật ký này</Text>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {traceData.materials.map((material, index) => (
                <div key={material.id || `${material.name}-${material.usedAt || index}`} className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3.5 sm:p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-2">
                      <Tag color={material.type === 'Nông dược' ? 'orange' : 'green'} className="m-0 rounded-md text-xs font-semibold">
                        {material.type}
                      </Tag>
                      <Text strong className="text-sm text-slate-900 sm:text-base">{material.name}</Text>
                    </div>
                    <div className="shrink-0 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 sm:text-right">
                      <Text className="block text-[11px] font-medium text-emerald-700">Số lượng đã dùng</Text>
                      <Text strong className="text-base text-emerald-800">{formatMaterialQuantity(material)}</Text>
                    </div>
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
                          {photo.date ? formatDate(photo.date) : '—'}
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
