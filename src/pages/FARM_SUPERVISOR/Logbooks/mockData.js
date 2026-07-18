export const MOCK_SUPERVISOR_PLAN = {
  id: 'mock-logbook-001',
  planName: 'Vụ Đông Xuân 2026 - Lúa ST25',
  supervisorName: 'Farm Supervisor',
  landPlotId: 'mock-land-001',
  landPlotName: 'Khu vực A1 - Sóc Trăng',
  cropName: 'Lúa gạo',
  cropCatalogName: 'Cây lương thực',
  startDate: '2026-07-15T00:00:00',
  expectedEndDate: '2026-10-20T00:00:00',
  status: 'IN_PROGRESS',
}

export const MOCK_SUPERVISOR_STAGES = [
  {
    id: 'mock-stage-001',
    cultivationLogbookId: MOCK_SUPERVISOR_PLAN.id,
    stageName: 'Chuẩn bị đất & Xuống giống',
    startDate: '2026-07-15T00:00:00',
    endDate: '2026-07-25T00:00:00',
    status: 'COMPLETED',
    note:
      'Cày ải, phơi đất, bơm nước và làm phẳng mặt ruộng. Sử dụng giống lúa ST25 cấp xác nhận, ngâm ủ đúng kỹ thuật và sạ thưa bằng máy.',
  },
  {
    id: 'mock-stage-002',
    cultivationLogbookId: MOCK_SUPERVISOR_PLAN.id,
    stageName: 'Chăm sóc đẻ nhánh',
    startDate: '2026-07-26T00:00:00',
    endDate: '2026-08-20T00:00:00',
    status: 'COMPLETED',
    note:
      'Bón phân đợt 1 và đợt 2. Duy trì mực nước nông, quản lý cỏ dại và kiểm tra ốc bươu vàng.',
  },
  {
    id: 'mock-stage-003',
    cultivationLogbookId: MOCK_SUPERVISOR_PLAN.id,
    stageName: 'Quản lý đòng trổ',
    startDate: '2026-08-21T00:00:00',
    endDate: '2026-09-25T00:00:00',
    status: 'IN_PROGRESS',
    note:
      'Bón phân đón đòng khi lúa có tim đèn. Theo dõi chặt chẽ sâu đục thân, rầy nâu và bệnh đạo ôn cổ bông.',
  },
  {
    id: 'mock-stage-004',
    cultivationLogbookId: MOCK_SUPERVISOR_PLAN.id,
    stageName: 'Chín & Thu hoạch',
    startDate: '2026-09-26T00:00:00',
    endDate: '2026-10-20T00:00:00',
    status: 'PENDING',
    note:
      'Rút nước trước thu hoạch, thu hoạch khi lúa chín 85-90% và vận chuyển nhanh về khu sơ chế.',
  },
]

export const MOCK_PRODUCTION_LOGS = [
  {
    id: 'mock-log-001',
    cultivationLogbookId: MOCK_SUPERVISOR_PLAN.id,
    cultivationStageId: 'mock-stage-003',
    activityDate: '2026-08-22T00:00:00',
    activityType: 'INSPECTION',
    description:
      'Hoàn tất cấy vét khu vực phía Bắc. Đất đạt độ tơi xốp yêu cầu, nhiệt độ ngoài trời 32°C, trời nắng ráo thuận lợi.',
    performedByName: 'Farm Supervisor Demo',
    materials: [
      {
        fertilizerId: 'mock-fertilizer-001',
        fertilizerName: 'Phân Urê',
        quantity: 5,
        unit: 'kg',
        note: 'Nồng độ pha loãng: 500 ml | Định mức: 1 kg/ha',
      },
      {
        materialId: 'mock-machinery-001',
        materialName: 'Máy cày',
        quantity: 1,
        unit: 'ca',
        note: 'Nhóm: MACHINERY',
      },
    ],
    images: [
      {
        id: 'mock-image-001',
        imageUrl:
          'https://images.unsplash.com/photo-1536633125620-8a3245c11ffa?auto=format&fit=crop&w=480&q=80',
      },
      {
        id: 'mock-image-002',
        imageUrl:
          'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=480&q=80',
      },
    ],
  },
  {
    id: 'mock-log-002',
    cultivationLogbookId: MOCK_SUPERVISOR_PLAN.id,
    cultivationStageId: 'mock-stage-003',
    activityDate: '2026-08-26T00:00:00',
    activityType: 'FERTILIZATION',
    description:
      'Bón phân đón đòng theo hướng dẫn kỹ thuật. Kiểm tra đồng ruộng chưa phát hiện sâu bệnh vượt ngưỡng.',
    performedByName: 'Farm Supervisor Demo',
    images: [],
  },
]

export const getMockStage = (stageId) =>
  MOCK_SUPERVISOR_STAGES.find((stage) => stage.id === stageId)
