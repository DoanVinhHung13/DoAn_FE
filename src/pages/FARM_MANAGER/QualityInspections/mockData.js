export const QUALITY_STATUS = {
  PENDING: 'PENDING',
  REVIEWING: 'REVIEWING',
  PASSED: 'PASSED',
  NEEDS_ACTION: 'NEEDS_ACTION',
}

export const qualityInspectionRecords = [
  {
    id: 'qc-001',
    logbookName: 'Vụ Đông Xuân 2026 - Lúa ST25',
    stageName: 'Chuẩn bị đất & Xuống giống',
    activityName: 'Xử lý đất và gieo sạ',
    supervisorName: 'Trần Văn An',
    cropName: 'Lúa ST25',
    landPlotName: 'Khu vực A1 - Sóc Trăng',
    recordedAt: '2026-07-19T08:30:00',
    status: QUALITY_STATUS.PENDING,
    content:
      'Cày ải, phơi đất, bơm nước làm phẳng mặt ruộng và gieo giống lúa ST25 theo đúng mật độ kỹ thuật.',
    materials: ['Vôi nông nghiệp: 120 kg', 'Giống lúa ST25: 80 kg'],
    evidenceCount: 3,
  },
  {
    id: 'qc-002',
    logbookName: 'Vụ Đông Xuân 2026 - Lúa ST25',
    stageName: 'Chăm sóc đẻ nhánh',
    activityName: 'Bón phân thúc đợt 1',
    supervisorName: 'Trần Văn An',
    cropName: 'Lúa ST25',
    landPlotName: 'Khu vực A1 - Sóc Trăng',
    recordedAt: '2026-07-18T15:10:00',
    status: QUALITY_STATUS.REVIEWING,
    content:
      'Bón phân thúc đợt 1, kiểm tra mực nước ruộng và tình trạng sinh trưởng của cây.',
    materials: ['Phân Urê: 35 kg', 'Phân NPK 16-16-8: 50 kg'],
    evidenceCount: 2,
  },
  {
    id: 'qc-003',
    logbookName: 'Nhật ký trồng Ngô ngọt lai F1',
    stageName: 'Chăm sóc sau trồng',
    activityName: 'Phun phòng sâu keo mùa thu',
    supervisorName: 'Nguyễn Minh Đức',
    cropName: 'Ngô ngọt lai F1',
    landPlotName: 'Lô C1 - Cây lương thực',
    recordedAt: '2026-07-18T09:00:00',
    status: QUALITY_STATUS.NEEDS_ACTION,
    content:
      'Kiểm tra mật độ sâu và phun thuốc sinh học vào đầu buổi sáng theo khu vực phát hiện.',
    materials: ['Thuốc BVTV sinh học: 500 ml'],
    evidenceCount: 4,
  },
  {
    id: 'qc-004',
    logbookName: 'Quy trình Dâu tây Hana Nhật',
    stageName: 'Nuôi trái',
    activityName: 'Kiểm tra chất lượng nước tưới',
    supervisorName: 'Lê Thu Hà',
    cropName: 'Dâu tây Hana Nhật',
    landPlotName: 'Nhà màng B2',
    recordedAt: '2026-07-17T16:45:00',
    status: QUALITY_STATUS.PASSED,
    content:
      'Đo pH, EC nguồn nước và kiểm tra hệ thống lọc trước khi tưới nhỏ giọt.',
    materials: [],
    evidenceCount: 2,
  },
]

export const qualityCriteria = [
  {
    key: 'soil-heavy-metal',
    condition: 'Đất / giá thể',
    pollutant: 'Kim loại nặng',
    reference: 'Theo giới hạn QCVN hiện hành',
  },
  {
    key: 'water-heavy-metal',
    condition: 'Nước tưới',
    pollutant: 'Kim loại nặng',
    reference: 'Theo quy chuẩn nước tưới nông nghiệp',
  },
  {
    key: 'water-microorganism',
    condition: 'Nước tưới',
    pollutant: 'Vi sinh vật',
    reference: 'E. coli, Coliform và chỉ tiêu liên quan',
  },
  {
    key: 'product-heavy-metal',
    condition: 'Sản phẩm',
    pollutant: 'Kim loại nặng',
    reference: 'Theo giới hạn an toàn thực phẩm',
  },
  {
    key: 'product-pesticide',
    condition: 'Sản phẩm',
    pollutant: 'Dư lượng thuốc BVTV',
    reference: 'Không vượt MRL của hoạt chất',
  },
  {
    key: 'product-microorganism',
    condition: 'Sản phẩm',
    pollutant: 'Vi sinh vật',
    reference: 'Theo quy chuẩn an toàn thực phẩm',
  },
  {
    key: 'product-mycotoxin',
    condition: 'Sản phẩm',
    pollutant: 'Độc tố vi nấm trong sản phẩm',
    reference: 'Theo giới hạn tối đa cho phép',
  },
]

export const findInspection = (id) =>
  qualityInspectionRecords.find((record) => record.id === id) ||
  qualityInspectionRecords[0]
