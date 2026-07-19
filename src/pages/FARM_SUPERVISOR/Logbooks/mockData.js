// ─────────────────────────────────────────────────────────────────────────────
// MOCK DATA - Toàn bộ luồng canh tác
// Farm Manager → Farm Supervisor → Farm Leader → Logbook Review
// ─────────────────────────────────────────────────────────────────────────────

// ── Plan (Logbook) ────────────────────────────────────────────────────────────
export const MOCK_SUPERVISOR_PLAN = {
  id: 'mock-logbook-001',
  planName: 'Vụ Đông Xuân 2026 - Lúa ST25',
  supervisorId: 'mock-supervisor-001',
  supervisorName: 'Nguyễn Thanh Giám Sát',
  landPlotId: 'mock-land-001',
  landPlotName: 'Khu vực A1 - Sóc Trăng',
  cropName: 'Lúa gạo ST25',
  cropCatalogName: 'Cây lương thực',
  area: 20,
  areaUnit: 'ha',
  startDate: '2026-07-15T00:00:00',
  expectedEndDate: '2026-10-20T00:00:00',
  status: 'IN_PROGRESS',
  logbookStatus: 'IN_PROGRESS', // DRAFT | IN_PROGRESS | SUBMITTED | APPROVED | REJECTED
  submittedAt: null,
  approvedAt: null,
  rejectionReason: null,
  revisionHistory: [],
}

// ── Stages ────────────────────────────────────────────────────────────────────
export const MOCK_SUPERVISOR_STAGES = [
  {
    id: 'mock-stage-001',
    cultivationLogbookId: MOCK_SUPERVISOR_PLAN.id,
    stageName: 'Chuẩn bị đất & Xuống giống',
    startDate: '2026-07-15T00:00:00',
    endDate: '2026-07-25T00:00:00',
    status: 'COMPLETED',
    note: 'Cày ải, phơi đất, bơm nước và làm phẳng mặt ruộng. Sử dụng giống lúa ST25 cấp xác nhận, ngâm ủ đúng kỹ thuật và sạ thưa bằng máy.',
    taskCount: 2,
    completedTaskCount: 2,
  },
  {
    id: 'mock-stage-002',
    cultivationLogbookId: MOCK_SUPERVISOR_PLAN.id,
    stageName: 'Chăm sóc đẻ nhánh',
    startDate: '2026-07-26T00:00:00',
    endDate: '2026-08-20T00:00:00',
    status: 'COMPLETED',
    note: 'Bón phân đợt 1 và đợt 2. Duy trì mực nước nông, quản lý cỏ dại và kiểm tra ốc bươu vàng.',
    taskCount: 2,
    completedTaskCount: 2,
  },
  {
    id: 'mock-stage-003',
    cultivationLogbookId: MOCK_SUPERVISOR_PLAN.id,
    stageName: 'Quản lý đòng trổ',
    startDate: '2026-08-21T00:00:00',
    endDate: '2026-09-25T00:00:00',
    status: 'IN_PROGRESS',
    note: 'Bón phân đón đòng khi lúa có tim đèn. Theo dõi chặt chẽ sâu đục thân, rầy nâu và bệnh đạo ôn cổ bông.',
    taskCount: 3,
    completedTaskCount: 1,
  },
  {
    id: 'mock-stage-004',
    cultivationLogbookId: MOCK_SUPERVISOR_PLAN.id,
    stageName: 'Chín & Thu hoạch',
    startDate: '2026-09-26T00:00:00',
    endDate: '2026-10-20T00:00:00',
    status: 'PENDING',
    note: 'Rút nước trước thu hoạch, thu hoạch khi lúa chín 85-90% và vận chuyển nhanh về khu sơ chế.',
    taskCount: 2,
    completedTaskCount: 0,
  },
]

// ── Team Members ──────────────────────────────────────────────────────────────
export const MOCK_TEAM_MEMBERS = [
  { id: 'mock-leader-001', name: 'Nguyễn Văn Leader', role: 'FARM_LEADER', avatar: null },
  { id: 'mock-leader-002', name: 'Trần Thị Leader', role: 'FARM_LEADER', avatar: null },
  { id: 'mock-farmer-001', name: 'Lê Văn Nông', role: 'FARMER', avatar: null },
  { id: 'mock-farmer-002', name: 'Phạm Thị Bình', role: 'FARMER', avatar: null },
  { id: 'mock-farmer-003', name: 'Hoàng Văn Cường', role: 'FARMER', avatar: null },
  { id: 'mock-farmer-004', name: 'Nguyễn Thị Dung', role: 'FARMER', avatar: null },
]

export const MOCK_LEADERS = MOCK_TEAM_MEMBERS.filter((m) => m.role === 'FARM_LEADER')
export const MOCK_FARMERS = MOCK_TEAM_MEMBERS.filter((m) => m.role === 'FARMER')

// ── Cultivation Tasks (Work Tasks per Stage) ──────────────────────────────────
export const MOCK_CULTIVATION_TASKS = [
  // ── Stage 001: Chuẩn bị đất ──
  {
    id: 'mock-ctask-001',
    planId: 'mock-logbook-001',
    stageId: 'mock-stage-001',
    stageName: 'Chuẩn bị đất & Xuống giống',
    name: 'Cày ải và làm phẳng đất',
    description: 'Sử dụng máy cày để cày ải toàn bộ 20ha. Sau đó bơm nước và làm phẳng bề mặt ruộng đảm bảo độ nghiêng < 2cm.',
    status: 'COMPLETED',
    progress: 100,
    farmLeaderId: 'mock-leader-001',
    farmLeaderName: 'Nguyễn Văn Leader',
    farmerIds: ['mock-farmer-001', 'mock-farmer-002'],
    farmerNames: ['Lê Văn Nông', 'Phạm Thị Bình'],
    startDate: '2026-07-15T00:00:00',
    leaderSummary: {
      totalFertilizers: [],
      totalPesticides: [],
      images: [
        { id: 'sum-img-001', url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=480&q=80' },
        { id: 'sum-img-002', url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=480&q=80' },
      ],
      descriptionSummary: 'Đã hoàn thành cày ải và làm phẳng toàn bộ 20ha. Mặt ruộng đạt yêu cầu kỹ thuật, độ nghiêng đồng đều. Thời tiết thuận lợi trong suốt quá trình thực hiện.',
      completedAt: '2026-07-18',
    },
    officialLog: {
      dataSentence: 'Đã hoàn thành cày ải và làm phẳng 20 ha trong 4 ngày (15/07/2026: 5 ha; 16/07/2026: 5 ha; 17/07/2026: 5 ha; 18/07/2026: 5 ha).',
      supervisorDescription: 'Công tác chuẩn bị đất được thực hiện theo đúng quy trình kỹ thuật. Toàn bộ diện tích 20 ha đã được cày ải, bơm nước và san phẳng mặt ruộng đảm bảo độ nghiêng đồng đều, đạt tiêu chuẩn trước khi xuống giống.',
      images: [
        { id: 'sum-img-001', url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=480&q=80' },
        { id: 'sum-img-002', url: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=480&q=80' },
      ],
      compiledAt: '2026-07-20',
    },
  },
  {
    id: 'mock-ctask-002',
    planId: 'mock-logbook-001',
    stageId: 'mock-stage-001',
    stageName: 'Chuẩn bị đất & Xuống giống',
    name: 'Xuống giống lúa ST25',
    description: 'Sử dụng giống lúa ST25 cấp xác nhận đã được ngâm ủ đúng kỹ thuật. Sạ thưa bằng máy với lượng giống 80-100 kg/ha.',
    status: 'COMPLETED',
    progress: 100,
    farmLeaderId: 'mock-leader-001',
    farmLeaderName: 'Nguyễn Văn Leader',
    farmerIds: ['mock-farmer-001', 'mock-farmer-002', 'mock-farmer-003'],
    farmerNames: ['Lê Văn Nông', 'Phạm Thị Bình', 'Hoàng Văn Cường'],
    startDate: '2026-07-19T00:00:00',
    leaderSummary: {
      totalFertilizers: [],
      totalPesticides: [],
      images: [
        { id: 'sum-img-003', url: 'https://images.unsplash.com/photo-1536633125620-8a3245c11ffa?auto=format&fit=crop&w=480&q=80' },
      ],
      descriptionSummary: 'Hoàn thành xuống giống 20ha. Lượng giống sử dụng 90 kg/ha, tổng 1800 kg. Tỷ lệ nảy mầm tốt, mật độ cây đều.',
      completedAt: '2026-07-25',
    },
    officialLog: null, // chưa biên soạn
  },

  // ── Stage 003: Quản lý đòng trổ (đang thực hiện) ──
  {
    id: 'mock-ctask-003',
    planId: 'mock-logbook-001',
    stageId: 'mock-stage-003',
    stageName: 'Quản lý đòng trổ',
    name: 'Bón phân đón đòng',
    description: 'Bón phân NPK đợt 3 (phân đón đòng) khi lúa có tim đèn. Tỷ lệ: 5kg Urê + 3kg KCl mỗi ha. Bón vào buổi chiều mát.',
    status: 'COMPLETED',
    progress: 100,
    farmLeaderId: 'mock-leader-001',
    farmLeaderName: 'Nguyễn Văn Leader',
    farmerIds: ['mock-farmer-001', 'mock-farmer-002'],
    farmerNames: ['Lê Văn Nông', 'Phạm Thị Bình'],
    startDate: '2026-08-21T00:00:00',
    leaderSummary: {
      totalFertilizers: [
        {
          name: 'Phân Urê 46%',
          totalQuantity: 100,
          quantityUnit: 'kg',
          totalArea: 20,
          areaUnit: 'ha',
          dailyBreakdown: [
            { date: '2026-08-21T00:00:00', quantity: 40, area: 8 },
            { date: '2026-08-22T00:00:00', quantity: 35, area: 7 },
            { date: '2026-08-23T00:00:00', quantity: 25, area: 5 },
          ],
        },
        {
          name: 'Phân KCl 60%',
          totalQuantity: 60,
          quantityUnit: 'kg',
          totalArea: 20,
          areaUnit: 'ha',
          dailyBreakdown: [
            { date: '2026-08-21T00:00:00', quantity: 24, area: 8 },
            { date: '2026-08-22T00:00:00', quantity: 21, area: 7 },
            { date: '2026-08-23T00:00:00', quantity: 15, area: 5 },
          ],
        },
      ],
      totalPesticides: [],
      images: [
        { id: 'sum-img-004', url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=480&q=80' },
        { id: 'sum-img-005', url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=480&q=80' },
        { id: 'sum-img-006', url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=480&q=80' },
      ],
      descriptionSummary: 'Đã hoàn thành bón phân đón đòng cho toàn bộ 20ha trong 3 ngày. Lúa có tim đèn đều, dự kiến trổ đều sau 7-10 ngày. Không phát hiện sâu bệnh vượt ngưỡng.',
      completedAt: '2026-08-23',
    },
    officialLog: null,
  },
  {
    id: 'mock-ctask-004',
    planId: 'mock-logbook-001',
    stageId: 'mock-stage-003',
    stageName: 'Quản lý đòng trổ',
    name: 'Phun thuốc phòng trừ đạo ôn cổ bông',
    description: 'Phun thuốc trừ bệnh đạo ôn cổ bông trước khi lúa trổ 5-7 ngày. Sử dụng Filia 525SE hoặc Beam 75WP. Phun ướt đều toàn bộ lá và bông.',
    status: 'ACTIVE',
    progress: 60,
    farmLeaderId: 'mock-leader-002',
    farmLeaderName: 'Trần Thị Leader',
    farmerIds: ['mock-farmer-003', 'mock-farmer-004'],
    farmerNames: ['Hoàng Văn Cường', 'Nguyễn Thị Dung'],
    startDate: '2026-09-01T00:00:00',
    leaderSummary: null,
    officialLog: null,
  },
  {
    id: 'mock-ctask-005',
    planId: 'mock-logbook-001',
    stageId: 'mock-stage-003',
    stageName: 'Quản lý đòng trổ',
    name: 'Kiểm tra và quản lý rầy nâu',
    description: 'Kiểm tra mật độ rầy nâu định kỳ 3 ngày/lần. Khi mật độ vượt 3 con/dảnh thì phun thuốc Actara 25WG hoặc Chess 50WG.',
    status: 'PENDING',
    progress: 0,
    farmLeaderId: null,
    farmLeaderName: null,
    farmerIds: [],
    farmerNames: [],
    startDate: null,
    leaderSummary: null,
    officialLog: null,
  },

  // ── Stage 004: Chín & Thu hoạch (chưa bắt đầu) ──
  {
    id: 'mock-ctask-006',
    planId: 'mock-logbook-001',
    stageId: 'mock-stage-004',
    stageName: 'Chín & Thu hoạch',
    name: 'Rút nước và chuẩn bị thu hoạch',
    description: 'Rút nước trước thu hoạch 7-10 ngày. Kiểm tra độ chín của lúa (85-90% hạt vàng). Chuẩn bị máy gặt và phương tiện vận chuyển.',
    status: 'PENDING',
    progress: 0,
    farmLeaderId: null,
    farmLeaderName: null,
    farmerIds: [],
    farmerNames: [],
    startDate: null,
    leaderSummary: null,
    officialLog: null,
  },
  {
    id: 'mock-ctask-007',
    planId: 'mock-logbook-001',
    stageId: 'mock-stage-004',
    stageName: 'Chín & Thu hoạch',
    name: 'Thu hoạch và vận chuyển lúa',
    description: 'Thu hoạch bằng máy gặt đập liên hợp khi lúa chín 85-90%. Vận chuyển nhanh về khu sơ chế trong vòng 4 tiếng sau khi gặt.',
    status: 'PENDING',
    progress: 0,
    farmLeaderId: null,
    farmLeaderName: null,
    farmerIds: [],
    farmerNames: [],
    startDate: null,
    leaderSummary: null,
    officialLog: null,
  },
]

// ── Daily Logs từ Farm Leader ─────────────────────────────────────────────────
export const MOCK_LEADER_DAILY_LOGS = [
  // ── Task 003: Bón phân đón đòng ──
  {
    id: 'mock-llog-001',
    taskId: 'mock-ctask-003',
    date: '2026-08-21T00:00:00',
    fertilizers: [
      { id: 'f1', name: 'Phân Urê 46%', quantity: 40, quantityUnit: 'kg', area: 8, areaUnit: 'ha' },
      { id: 'f2', name: 'Phân KCl 60%', quantity: 24, quantityUnit: 'kg', area: 8, areaUnit: 'ha' },
    ],
    pesticides: [],
    description: 'Bón phân buổi chiều khu vực phía Bắc (8ha). Thời tiết nắng ráo, gió nhẹ. Lúa đã có tim đèn đều.',
    images: [
      { id: 'llog-img-001', url: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=480&q=80' },
    ],
    progress: 35,
    isSummary: false,
  },
  {
    id: 'mock-llog-002',
    taskId: 'mock-ctask-003',
    date: '2026-08-22T00:00:00',
    fertilizers: [
      { id: 'f1', name: 'Phân Urê 46%', quantity: 35, quantityUnit: 'kg', area: 7, areaUnit: 'ha' },
      { id: 'f2', name: 'Phân KCl 60%', quantity: 21, quantityUnit: 'kg', area: 7, areaUnit: 'ha' },
    ],
    pesticides: [],
    description: 'Bón phân khu vực trung tâm (7ha). Phát hiện một số vùng bờ thửa bị rò nước, đã báo cáo để xử lý.',
    images: [
      { id: 'llog-img-002', url: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=480&q=80' },
    ],
    progress: 75,
    isSummary: false,
  },
  {
    id: 'mock-llog-003',
    taskId: 'mock-ctask-003',
    date: '2026-08-23T00:00:00',
    fertilizers: [
      { id: 'f1', name: 'Phân Urê 46%', quantity: 25, quantityUnit: 'kg', area: 5, areaUnit: 'ha' },
      { id: 'f2', name: 'Phân KCl 60%', quantity: 15, quantityUnit: 'kg', area: 5, areaUnit: 'ha' },
    ],
    pesticides: [],
    description: 'Hoàn thành bón phân khu vực phía Nam (5ha). Toàn bộ 20ha đã bón xong. Lúa sinh trưởng tốt, dự kiến trổ trong 7-10 ngày.',
    images: [
      { id: 'llog-img-003', url: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=480&q=80' },
    ],
    progress: 100,
    isSummary: false,
  },

  // ── Task 004: Phun thuốc đạo ôn (đang thực hiện) ──
  {
    id: 'mock-llog-004',
    taskId: 'mock-ctask-004',
    date: '2026-09-01T00:00:00',
    fertilizers: [],
    pesticides: [
      { id: 'p1', name: 'Filia 525SE', quantity: 400, quantityUnit: 'ml', area: 8, areaUnit: 'ha' },
    ],
    description: 'Phun thuốc phòng đạo ôn cổ bông buổi sáng sớm khu vực phía Bắc (8ha). Độ ẩm cao, thuốc bám tốt.',
    images: [
      { id: 'llog-img-004', url: 'https://images.unsplash.com/photo-1559181567-c3190bded89d?auto=format&fit=crop&w=480&q=80' },
    ],
    progress: 40,
    isSummary: false,
  },
  {
    id: 'mock-llog-005',
    taskId: 'mock-ctask-004',
    date: '2026-09-02T00:00:00',
    fertilizers: [],
    pesticides: [
      { id: 'p1', name: 'Filia 525SE', quantity: 250, quantityUnit: 'ml', area: 5, areaUnit: 'ha' },
    ],
    description: 'Phun tiếp khu vực trung tâm (5ha). Phát hiện một số ổ rầy nâu nhỏ, theo dõi thêm.',
    images: [],
    progress: 60,
    isSummary: false,
  },
]

// ── Supervisor Production Logs (ghi chép giai đoạn cũ) ───────────────────────
export const MOCK_PRODUCTION_LOGS = [
  {
    id: 'mock-log-001',
    cultivationLogbookId: MOCK_SUPERVISOR_PLAN.id,
    cultivationStageId: 'mock-stage-003',
    activityDate: '2026-08-22T00:00:00',
    activityType: 'FERTILIZATION',
    description: 'Hoàn tất cấy vét khu vực phía Bắc. Đất đạt độ tơi xốp yêu cầu, nhiệt độ ngoài trời 32°C, trời nắng ráo thuận lợi.',
    performedByName: 'Nguyễn Thanh Giám Sát',
    materials: [
      {
        fertilizerId: 'mock-fertilizer-001',
        fertilizerName: 'Phân Urê',
        quantity: 5,
        unit: 'kg',
        note: 'Định mức: 1 kg/ha',
      },
    ],
    images: [
      {
        id: 'mock-image-001',
        imageUrl: 'https://images.unsplash.com/photo-1536633125620-8a3245c11ffa?auto=format&fit=crop&w=480&q=80',
      },
    ],
  },
  {
    id: 'mock-log-002',
    cultivationLogbookId: MOCK_SUPERVISOR_PLAN.id,
    cultivationStageId: 'mock-stage-003',
    activityDate: '2026-08-26T00:00:00',
    activityType: 'INSPECTION',
    description: 'Kiểm tra đồng ruộng chưa phát hiện sâu bệnh vượt ngưỡng. Lúa sinh trưởng tốt.',
    performedByName: 'Nguyễn Thanh Giám Sát',
    materials: [],
    images: [],
  },
]

// ── Logbook chờ Manager duyệt ─────────────────────────────────────────────────
export const MOCK_SUBMITTED_LOGBOOKS = [
  {
    id: 'mock-submitted-001',
    planId: 'mock-logbook-001',
    planName: 'Vụ Đông Xuân 2026 - Lúa ST25',
    supervisorId: 'mock-supervisor-001',
    supervisorName: 'Nguyễn Thanh Giám Sát',
    landPlotName: 'Khu vực A1 - Sóc Trăng',
    cropName: 'Lúa gạo ST25',
    submittedAt: '2026-10-21T08:30:00',
    status: 'PENDING_REVIEW',
    revisionHistory: [
      {
        version: 1,
        editedAt: '2026-10-21T08:30:00',
        editedBy: 'Nguyễn Thanh Giám Sát',
        reason: 'Gửi lần đầu',
        changes: [],
      },
    ],
    stages: MOCK_SUPERVISOR_STAGES,
  },
]

// ── Fertilizer / Pesticide Options (cho form Leader) ─────────────────────────
export const MOCK_FERTILIZER_OPTIONS = [
  { id: 'fert-001', name: 'Phân Urê 46%', defaultUnit: 'kg' },
  { id: 'fert-002', name: 'Phân KCl 60%', defaultUnit: 'kg' },
  { id: 'fert-003', name: 'Phân DAP 64%', defaultUnit: 'kg' },
  { id: 'fert-004', name: 'Phân NPK 20-20-15', defaultUnit: 'kg' },
  { id: 'fert-005', name: 'Phân hữu cơ vi sinh', defaultUnit: 'kg' },
]

export const MOCK_PESTICIDE_OPTIONS = [
  { id: 'pest-001', name: 'Filia 525SE', defaultUnit: 'ml' },
  { id: 'pest-002', name: 'Beam 75WP', defaultUnit: 'g' },
  { id: 'pest-003', name: 'Actara 25WG', defaultUnit: 'g' },
  { id: 'pest-004', name: 'Chess 50WG', defaultUnit: 'g' },
  { id: 'pest-005', name: 'Regent 800WG', defaultUnit: 'g' },
]

// ── Unit options ──────────────────────────────────────────────────────────────
export const FERTILIZER_QUANTITY_UNITS = ['kg', 'g', 'tấn', 'lít', 'ml', 'bao']
export const PESTICIDE_QUANTITY_UNITS = ['ml', 'lít', 'g', 'kg', 'chai', 'gói']
export const AREA_UNITS = ['ha', 'm²', 'sào']

// ── Helpers ───────────────────────────────────────────────────────────────────
export const getMockStage = (stageId) =>
  MOCK_SUPERVISOR_STAGES.find((stage) => stage.id === stageId)

export const getMockTask = (taskId) =>
  MOCK_CULTIVATION_TASKS.find((task) => task.id === taskId)

export const getMockTasksByStage = (stageId) =>
  MOCK_CULTIVATION_TASKS.filter((task) => task.stageId === stageId)

export const getMockTasksByLeader = (leaderId) =>
  MOCK_CULTIVATION_TASKS.filter((task) => task.farmLeaderId === leaderId)

export const getMockDailyLogsByTask = (taskId) =>
  MOCK_LEADER_DAILY_LOGS.filter((log) => log.taskId === taskId)

// ── Fake API Service Layer ────────────────────────────────────────────────────
// Dùng tạm khi chưa có BE. Mỗi function trả về Promise giống axios response.
export const FakeCultivationService = {
  // Lấy tất cả tasks theo plan
  getTasksByPlan: async (planId) => {
    await new Promise((r) => setTimeout(r, 300))
    return { data: { data: MOCK_CULTIVATION_TASKS.filter((t) => t.planId === planId) } }
  },

  // Lấy tasks theo stage
  getTasksByStage: async (stageId) => {
    await new Promise((r) => setTimeout(r, 200))
    return { data: { data: getMockTasksByStage(stageId) } }
  },

  // Lấy tasks theo leader
  getTasksByLeader: async (leaderId) => {
    await new Promise((r) => setTimeout(r, 200))
    return { data: { data: getMockTasksByLeader(leaderId) } }
  },

  // Tạo task mới
  createTask: async (payload) => {
    await new Promise((r) => setTimeout(r, 400))
    const newTask = {
      id: `mock-ctask-${Date.now()}`,
      planId: payload.planId,
      stageId: payload.stageId,
      stageName: payload.stageName || '',
      name: payload.name,
      description: payload.description || '',
      status: 'PENDING',
      progress: 0,
      farmLeaderId: null,
      farmLeaderName: null,
      farmerIds: [],
      farmerNames: [],
      startDate: null,
      leaderSummary: null,
      officialLog: null,
    }
    MOCK_CULTIVATION_TASKS.push(newTask)
    return { data: { data: newTask } }
  },

  // Gán team cho task
  assignTeam: async (taskId, payload) => {
    await new Promise((r) => setTimeout(r, 300))
    const task = getMockTask(taskId)
    if (task) {
      task.farmLeaderId = payload.farmLeaderId
      task.farmLeaderName = payload.farmLeaderName
      task.farmerIds = payload.farmerIds || []
      task.farmerNames = payload.farmerNames || []
    }
    return { data: { success: true } }
  },

  // Kích hoạt task
  activateTask: async (taskId) => {
    await new Promise((r) => setTimeout(r, 300))
    const task = getMockTask(taskId)
    if (task) task.status = 'ACTIVE'
    return { data: { success: true } }
  },

  // Thêm nhật ký hàng ngày
  addDailyLog: async (payload) => {
    await new Promise((r) => setTimeout(r, 400))
    const newLog = {
      id: `mock-llog-${Date.now()}`,
      taskId: payload.taskId,
      date: payload.date,
      fertilizers: payload.fertilizers || [],
      pesticides: payload.pesticides || [],
      description: payload.description || '',
      images: payload.images || [],
      progress: payload.progress || 0,
      isSummary: false,
    }
    MOCK_LEADER_DAILY_LOGS.push(newLog)

    // Cập nhật progress của task
    const task = getMockTask(payload.taskId)
    if (task) task.progress = payload.progress || task.progress

    return { data: { data: newLog } }
  },

  // Gửi summary (báo cáo hoàn thành)
  submitSummary: async (taskId, summaryPayload) => {
    await new Promise((r) => setTimeout(r, 400))
    const task = getMockTask(taskId)
    if (task) {
      task.leaderSummary = summaryPayload
      task.status = 'COMPLETED'
      task.progress = 100
    }
    return { data: { success: true } }
  },

  // Supervisor biên soạn nhật ký chính thức
  compileOfficialLog: async (taskId, officialPayload) => {
    await new Promise((r) => setTimeout(r, 400))
    const task = getMockTask(taskId)
    if (task) task.officialLog = officialPayload
    return { data: { success: true } }
  },

  // Supervisor gửi logbook lên Manager
  submitLogbook: async (planId) => {
    await new Promise((r) => setTimeout(r, 600))
    return { data: { success: true, logbookId: `submitted-${planId}` } }
  },

  // Manager duyệt
  approveLogbook: async (logbookId) => {
    await new Promise((r) => setTimeout(r, 500))
    return { data: { success: true, qrCode: `QR-${logbookId}-${Date.now()}` } }
  },

  // Manager từ chối
  rejectLogbook: async (logbookId, reason) => {
    await new Promise((r) => setTimeout(r, 400))
    return { data: { success: true } }
  },

  // Lấy danh sách logbook chờ duyệt
  getSubmittedLogbooks: async () => {
    await new Promise((r) => setTimeout(r, 300))
    return { data: { data: MOCK_SUBMITTED_LOGBOOKS } }
  },
}
