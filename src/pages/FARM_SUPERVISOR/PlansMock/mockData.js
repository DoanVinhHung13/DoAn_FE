export const mockPlanData = {
  id: '710177e6-6e61-4625-a2d0-cf9c2e765d9a',
  planName: 'Kế hoạch trồng dưa lưới vụ Đông Xuân 2024',
  cropCatalogName: 'Dưa lưới',
  cropCategoryName: 'Trái cây',
  cropName: 'Dưa lưới vỏ xanh ruột cam',
  landPlotId: 'land-123',
  landPlotName: 'Khu A - Lô 1',
  supervisorName: 'Nguyễn Văn Giám Sát',
  startDate: '2024-01-01T00:00:00Z',
  expectedEndDate: '2024-04-30T00:00:00Z',
  status: 'IN_PROGRESS'
}

export const mockStages = [
  { id: 'stage-1', name: 'Giai đoạn 1: Chuẩn bị đất', status: 'COMPLETED', startDate: '2024-01-01T00:00:00Z', endDate: '2024-01-10T00:00:00Z', note: 'Cày xới kỹ, phơi ải.' },
  { id: 'stage-2', name: 'Giai đoạn 2: Xuống giống', status: 'COMPLETED', startDate: '2024-01-11T00:00:00Z', endDate: '2024-01-15T00:00:00Z', note: 'Trồng theo luống, khoảng cách 50cm.' },
  { id: 'stage-3', name: 'Giai đoạn 3: Chăm sóc & Bón phân', status: 'IN_PROGRESS', startDate: '2024-01-16T00:00:00Z', endDate: '2024-03-15T00:00:00Z', note: 'Bón thúc NPK định kỳ 15 ngày/lần.' },
  { id: 'stage-4', name: 'Giai đoạn 4: Thu hoạch', status: 'PENDING', startDate: '2024-03-16T00:00:00Z', endDate: '2024-04-30T00:00:00Z', note: 'Thu hoạch khi quả đạt độ ngọt.' }
]

export const mockTasks = {
  'stage-1': [
    { 
      id: 'task-1-1', name: 'Làm cỏ lần 1', status: 'COMPLETED', description: 'Nhổ sạch cỏ dại', 
      assignedLeaderName: 'Trần Văn Lãnh Đạo',
      summary: { 
        status: 'APPROVED', 
        leaderDescription: 'Đã hoàn thành làm cỏ sạch 100% diện tích lô 1.',
        supervisorDescription: 'Nhật ký chính thức: Công việc làm cỏ lô 1 đã hoàn thiện, đảm bảo nền đất sạch cỏ dại.',
        aggregatedFertilizers: [],
        aggregatedPesticides: [],
        images: ['https://placehold.co/150x150/e2e8f0/475569?text=Co+Dai+1', 'https://placehold.co/150x150/e2e8f0/475569?text=Co+Dai+2']
      } 
    },
    { 
      id: 'task-1-2', name: 'Bón lót phân chuồng', status: 'COMPLETED', description: 'Bón 500kg phân chuồng ủ hoai', 
      assignedLeaderName: 'Trần Văn Lãnh Đạo',
      summary: { 
        status: 'PENDING_APPROVAL', 
        leaderDescription: 'Đã bón đủ lượng phân 500kg. Chờ sếp duyệt.', 
        supervisorDescription: '',
        aggregatedFertilizers: [
          { name: 'Phân chuồng ủ hoai', amount: 500, unit: 'kg', area: 1000, areaUnit: 'm2' }
        ],
        aggregatedPesticides: [],
        images: ['https://placehold.co/150x150/e2e8f0/475569?text=Phan+Chuong+1']
      } 
    }
  ],
  'stage-2': [
    { 
      id: 'task-2-1', name: 'Gieo hạt giống', status: 'COMPLETED', description: 'Gieo hạt trực tiếp', 
      assignedLeaderName: 'Trần Văn Lãnh Đạo',
      summary: { 
        status: 'APPROVED', 
        leaderDescription: 'Gieo 10.000 hạt giống dưa lưới. Hạt giống chất lượng tốt, nảy mầm nhanh.', 
        supervisorDescription: 'Nhật ký chính thức: Hoàn tất công tác gieo 10.000 hạt giống dưa lưới với tỷ lệ nảy mầm đạt chuẩn.',
        aggregatedFertilizers: [],
        aggregatedPesticides: [],
        images: []
      } 
    }
  ],
  'stage-3': [
    { 
      id: 'task-3-1', name: 'Tưới nước định kỳ tuần 1', status: 'COMPLETED', description: 'Tưới phun sương', 
      assignedLeaderName: 'Nguyễn Văn Lãnh Đạo B',
      summary: { 
        status: 'PENDING_APPROVAL', 
        leaderDescription: 'Đã tưới đủ nước tuần 1. Đất ẩm đều.', 
        supervisorDescription: '',
        aggregatedFertilizers: [],
        aggregatedPesticides: [],
        images: ['https://placehold.co/150x150/e2e8f0/475569?text=Tuoi+Nuoc']
      } 
    },
    { id: 'task-3-2', name: 'Bón phân NPK lần 1', status: 'ACTIVE', description: 'Bón 50kg NPK', assignedLeaderName: 'Nguyễn Văn Lãnh Đạo B', summary: null },
    { id: 'task-3-3', name: 'Phun thuốc ngừa sâu bệnh', status: 'PENDING', description: 'Phun thuốc BVTV sinh học', assignedLeaderName: 'Nguyễn Văn Lãnh Đạo B', summary: null }
  ],
  'stage-4': [
    { id: 'task-4-1', name: 'Cắt trái đợt 1', status: 'PENDING', description: 'Cắt khi cuống nứt', assignedLeaderName: 'Trần Văn Lãnh Đạo', summary: null }
  ]
}

export const mockDailyLogs = [
  { 
    id: 'log-1', logDate: '2024-01-16T08:00:00Z', farmerName: 'Nguyễn Văn Nông', taskId: 'task-3-2',
    description: 'Đã bắt đầu pha phân NPK theo tỉ lệ.', 
    fertilizers: [{ name: 'Phân NPK 15-15-15', amount: 20, unit: 'kg', area: 500, areaUnit: 'm2' }],
    pesticides: [],
    images: ['https://placehold.co/150x150/e2e8f0/475569?text=NPK+1']
  },
  { 
    id: 'log-2', logDate: '2024-01-17T09:30:00Z', farmerName: 'Nguyễn Văn Nông', taskId: 'task-3-2',
    description: 'Bón xong lô số 1 và 2. Cây phát triển tốt.', 
    fertilizers: [{ name: 'Phân NPK 15-15-15', amount: 30, unit: 'kg', area: 500, areaUnit: 'm2' }],
    pesticides: [],
    images: ['https://placehold.co/150x150/e2e8f0/475569?text=NPK+2']
  },
  { 
    id: 'log-3', logDate: '2024-01-02T08:00:00Z', farmerName: 'Trần Văn Cỏ', taskId: 'task-1-1',
    description: 'Nhổ cỏ khu vực A', 
    fertilizers: [], pesticides: [], images: []
  },
  { 
    id: 'log-4', logDate: '2024-01-03T14:00:00Z', farmerName: 'Trần Văn Cỏ', taskId: 'task-1-1',
    description: 'Nhổ cỏ khu vực B, cỏ mọc khá dày', 
    fertilizers: [], pesticides: [], images: ['https://placehold.co/150x150/e2e8f0/475569?text=Co+Dai+2']
  }
]
