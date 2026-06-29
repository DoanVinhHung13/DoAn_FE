const generateId = () => Math.random().toString(36).substring(2, 9) + Date.now().toString(36)

// Mock Data
let mockData = [
  {
    id: generateId(),
    code: 'CP-001',
    name: 'Thuốc trừ sâu sinh học A',
    manufacturer: 'Công ty TNHH Hóa Chất Nông Nghiệp',
    supplierId: 'SUP-001', // id nhà cung cấp
    minimumStock: 100,
    unit: 'lít',
    description: 'Thuốc trừ sâu phổ rộng, an toàn cho môi trường.',
    usages: [
      {
        id: generateId(),
        targetCrop: 'Lúa',
        targetPest: 'Rầy nâu',
        dilutionRatio: '1:500',
        dilutionUnit: 'lít',
        dosage: 500,
        dosageUnit: 'ml',
        areaUnit: 'ha',
        isolationDays: 14,
      },
    ],
    isActive: true,
  },
]

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const getCropProtections = async (params = {}) => {
  await delay(500)
  const { SearchKeyword, Status } = params

  let filtered = [...mockData]
  if (SearchKeyword) {
    const kw = SearchKeyword.toLowerCase()
    filtered = filtered.filter(
      (item) =>
        item.name?.toLowerCase().includes(kw) || item.code?.toLowerCase().includes(kw),
    )
  }

  if (Status === 'active') {
    filtered = filtered.filter((item) => item.isActive)
  } else if (Status === 'inactive') {
    filtered = filtered.filter((item) => !item.isActive)
  }

  return {
    data: {
      items: filtered,
      totalCount: filtered.length,
      pageIndex: params.PageIndex || 1,
      totalPages: 1,
    },
  }
}

const getCropProtectionById = async (id) => {
  await delay(500)
  const item = mockData.find((x) => x.id === id)
  return { data: item }
}

const createCropProtection = async (body) => {
  await delay(500)
  const newItem = {
    ...body,
    id: generateId(),
    isActive: true,
  }
  mockData.push(newItem)
  return { success: true, data: newItem }
}

const updateCropProtection = async (id, body) => {
  await delay(500)
  const idx = mockData.findIndex((x) => x.id === id)
  if (idx === -1) return { success: false, message: 'Not found' }

  mockData[idx] = { ...mockData[idx], ...body }
  return { success: true, data: mockData[idx] }
}

const deleteCropProtection = async (id) => {
  await delay(500)
  mockData = mockData.filter((x) => x.id !== id)
  return { success: true }
}

const toggleCropProtectionStatus = async (id, body) => {
  await delay(500)
  const idx = mockData.findIndex((x) => x.id === id)
  if (idx === -1) return { success: false, message: 'Not found' }

  mockData[idx].isActive = body.isActive
  return { success: true, data: mockData[idx] }
}

const CropProtectionService = {
  getCropProtections,
  getCropProtectionById,
  createCropProtection,
  updateCropProtection,
  deleteCropProtection,
  toggleCropProtectionStatus,
}

export default CropProtectionService
