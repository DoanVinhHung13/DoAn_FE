import dayjs from 'dayjs';

// Mock data for Batch (Harvest Batch) testing
export const mockBatches = [
  {
    id: '1',
    batchCode: 'LOT-X01-2024',
    cropName: 'Gạo ST25',
    cropType: 'Lúa',
    area: 2.5,
    expectedHarvestDate: '2024-05-20',
    expectedYield: 18.5,
    status: 'Chờ thu hoạch',
    startDate: '2024-03-12',
    landPlotName: 'Ruộng A1',
    description: 'Lô lúa ST25 chất lượng cao, áp dụng quy trình VietGAP',
  },
  {
    id: '2',
    batchCode: 'LOT-B12-2024',
    cropName: 'Ngô ngọt Mỹ',
    cropType: 'Ngô',
    area: 1.8,
    expectedHarvestDate: dayjs().format('YYYY-MM-DD'), // Hôm nay
    expectedYield: 12.0,
    status: 'Đang thu hoạch',
    startDate: '2024-02-05',
    landPlotName: 'Ruộng B2',
    description: 'Ngô ngọt chất lượng cao xuất khẩu',
  },
  {
    id: '3',
    batchCode: 'LOT-A05-2024',
    cropName: 'Cà phê Robusta',
    cropType: 'Cà phê',
    area: 5.0,
    expectedHarvestDate: '2024-04-01', // Đã qua
    expectedYield: 42.5,
    status: 'Đã hoàn thành',
    startDate: '2024-01-15',
    landPlotName: 'Vườn C1',
    description: 'Cà phê Robusta chất lượng đặc biệt',
  },
  {
    id: '4',
    batchCode: 'LOT-C22-2024',
    cropName: 'Cải ngọt',
    cropType: 'Rau',
    area: 0.8,
    expectedHarvestDate: '2024-06-15',
    expectedYield: 3.2,
    status: 'Chờ thu hoạch',
    startDate: '2024-04-20',
    landPlotName: 'Ruộng D3',
    description: 'Cải ngọt hữu cơ không thuốc BVTV',
  },
  {
    id: '5',
    batchCode: 'LOT-D33-2024',
    cropName: 'Gạo Nàng Hoa 9',
    cropType: 'Lúa',
    area: 3.2,
    expectedHarvestDate: '2024-07-10',
    expectedYield: 24.0,
    status: 'Chờ thu hoạch',
    startDate: '2024-04-01',
    landPlotName: 'Ruộng E1',
    description: 'Lúa Nàng Hoa 9 thơm ngon',
  },
];

export const getMockBatchById = (id) => {
  return mockBatches.find(batch => batch.id === id);
};

export const getMockBatchByCode = (code) => {
  return mockBatches.find(batch => batch.batchCode === code);
};

export const filterMockBatches = (filters) => {
  let filtered = [...mockBatches];

  if (filters.batchCode) {
    filtered = filtered.filter(batch => 
      batch.batchCode.toLowerCase().includes(filters.batchCode.toLowerCase())
    );
  }

  if (filters.status) {
    filtered = filtered.filter(batch => batch.status === filters.status);
  }

  if (filters.expectedDate) {
    const dateStr = dayjs(filters.expectedDate).format('YYYY-MM-DD');
    filtered = filtered.filter(batch => batch.expectedHarvestDate === dateStr);
  }

  return filtered;
};

export default {
  mockBatches,
  getMockBatchById,
  getMockBatchByCode,
  filterMockBatches,
};
