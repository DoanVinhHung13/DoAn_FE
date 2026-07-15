// Mock data cho Plan Templates (Thư viện Kế hoạch Mẫu)
export const MOCK_PLAN_TEMPLATES = [
  {
    id: 'TPL-001',
    name: 'Mẫu canh tác lúa nước',
    cropType: 'crop-001',
    description: 'Quy trình canh tác lúa nước theo tiêu chuẩn VietGAP',
    stageCount: 5,
    status: true,
    createdAt: '2024-01-15',
    stages: [
      {
        id: 'stage-001',
        order: 1,
        title: 'Tiền sinh trưởng',
        description: 'Làm đất, bón phân lót, san phẳng mặt ruộng. Ngâm ruộng 3-5 ngày trước khi gieo sạ.',
        materials: ['Phân chuồng', 'Vôi bột', 'Phân NPK'],
      },
      {
        id: 'stage-002',
        order: 2,
        title: 'Sinh trưởng Sinh dưỡng',
        description: 'Gieo hạt giống đã ngâm ủ, mật độ 120-150kg/ha. Duy trì mực nước 3-5cm.',
        materials: ['Giống lúa', 'Phân đạm'],
      },
      {
        id: 'stage-003',
        order: 3,
        title: 'Sinh trưởng Sinh thực',
        description: 'Bón phân thúc lần 1 sau 15 ngày gieo sạ. Phun thuốc trừ sâu, cỏ dại. Duy trì mực nước 5-7cm.',
        materials: ['Phân đạm', 'Thuốc trừ sâu', 'Thuốc diệt cỏ'],
      },
      {
        id: 'stage-004',
        order: 4,
        title: 'Chín',
        description: 'Bón phân lần 2 trước trổ 7-10 ngày. Phun thuốc phòng bệnh đạo ôn. Duy trì mực nước 7-10cm.',
        materials: ['Phân lân', 'Thuốc phòng bệnh'],
      },
      {
        id: 'stage-005',
        order: 5,
        title: 'Kết thúc Vụ mùa',
        description: 'Thu hoạch khi 85-90% hạt chín vàng. Phơi khô đạt độ ẩm 14%.',
        materials: [],
      },
    ],
  },
  {
    id: 'TPL-002',
    name: 'Mẫu trồng cà chua công nghệ cao',
    cropType: 'crop-002',
    description: 'Quy trình trồng cà chua nhà lưới theo công nghệ Israel',
    stageCount: 6,
    status: true,
    createdAt: '2024-02-20',
    stages: [
      {
        id: 'stage-006',
        order: 1,
        title: 'Ươm cây giống',
        description: 'Ươm hạt trong khay xốp 50 lỗ, giá thể cocopeat. Thời gian ươm 25-30 ngày.',
        materials: ['Hạt giống cà chua', 'Khay ươm', 'Giá thể cocopeat'],
      },
      {
        id: 'stage-007',
        order: 2,
        title: 'Chuẩn bị đất và trồng',
        description: 'Làm luống cao 30cm, rộng 1.2m. Lót màng phủ đen. Khoảng cách trồng 40x50cm.',
        materials: ['Phân hữu cơ', 'Màng phủ đen', 'Dây dẫn tưới'],
      },
      {
        id: 'stage-008',
        order: 3,
        title: 'Chăm sóc cây non',
        description: 'Tưới nhỏ giọt 2 lần/ngày. Phun phân bón lá. Cắm cọc và buộc dây.',
        materials: ['Phân bón lá', 'Cọc tre', 'Dây nilon'],
      },
      {
        id: 'stage-009',
        order: 4,
        title: 'Thời kỳ ra hoa - đậu quả',
        description: 'Tỉa cành, tỉa lá già. Phun hormone kích thích đậu quả. Tưới phân qua hệ thống nhỏ giọt.',
        materials: ['Hormone 2,4-D', 'Phân NPK', 'Phân hữu cơ lỏng'],
      },
      {
        id: 'stage-010',
        order: 5,
        title: 'Phòng trừ sâu bệnh',
        description: 'Theo dõi sâu bệnh hàng ngày. Phun thuốc sinh học. Sử dụng bẫy dính vàng.',
        materials: ['Thuốc sinh học BT', 'Bẫy dính vàng', 'Neem oil'],
      },
      {
        id: 'stage-011',
        order: 6,
        title: 'Thu hoạch',
        description: 'Thu hái khi quả chín 70-80%. Thu hoạch sáng sớm hoặc chiều mát. Phân loại và đóng gói.',
        materials: ['Thùng nhựa', 'Bao bì'],
      },
    ],
  },
  {
    id: 'TPL-003',
    name: 'Mẫu trồng dưa lưới nhà màng',
    cropType: 'crop-003',
    description: 'Quy trình trồng dưa lưới trong nhà màng PE',
    stageCount: 5,
    status: true,
    createdAt: '2024-03-10',
    stages: [
      {
        id: 'stage-012',
        order: 1,
        title: 'Ươm giống',
        description: 'Ươm trong cốc giấy hoặc khay 32 lỗ, 20-25 ngày.',
        materials: ['Hạt giống dưa lưới F1', 'Cốc giấy', 'Giá thể ươm'],
      },
      {
        id: 'stage-013',
        order: 2,
        title: 'Chuẩn bị và trồng',
        description: 'Làm luống cao 40cm, phủ màng. Trồng cây con có 3-4 lá thật.',
        materials: ['Phân hữu cơ vi sinh', 'Màng phủ bạc đen'],
      },
      {
        id: 'stage-014',
        order: 3,
        title: 'Dẫn dây và tạo tán',
        description: 'Dẫn cây lên giàn. Tỉa ngọn, tỉa nhánh phụ. Để 1 dây chính.',
        materials: ['Dây nilon', 'Kẹp cài'],
      },
      {
        id: 'stage-015',
        order: 4,
        title: 'Thụ phấn và chăm sóc quả',
        description: 'Thụ phấn nhân tạo bằng cọ lông. Chọn lưa để 1 quả/nhánh. Đặt lưới chống rơi.',
        materials: ['Cọ lông', 'Lưới đỡ quả', 'Phân bón chuyên dụng'],
      },
      {
        id: 'stage-016',
        order: 5,
        title: 'Thu hoạch',
        description: 'Thu hoạch sau thụ phấn 45-50 ngày. Cắt cuống để 3-5cm.',
        materials: ['Kéo cắt', 'Hộp xốp'],
      },
    ],
  },
  {
    id: 'TPL-004',
    name: 'Mẫu trồng rau xà lách thủy canh',
    cropType: 'crop-004',
    description: 'Quy trình trồng xà lách thủy canh NFT',
    stageCount: 4,
    status: true,
    createdAt: '2024-04-05',
    stages: [
      {
        id: 'stage-017',
        order: 1,
        title: 'Ươm hạt',
        description: 'Ươm trong mút xốp hoặc giá thể rockwool, 10-12 ngày.',
        materials: ['Hạt giống xà lách', 'Mút xốp', 'Dung dịch dinh dưỡng pha loãng'],
      },
      {
        id: 'stage-018',
        order: 2,
        title: 'Chuyển sang bể thủy canh',
        description: 'Đặt cây vào khay thủy canh NFT. EC 1.2-1.5, pH 5.8-6.2.',
        materials: ['Dung dịch dinh dưỡng AB', 'Khay NFT', 'Bơm tuần hoàn'],
      },
      {
        id: 'stage-019',
        order: 3,
        title: 'Chăm sóc',
        description: 'Kiểm tra EC, pH hàng ngày. Thay dung dịch 7-10 ngày/lần. Đảm bảo ánh sáng đủ.',
        materials: ['EC meter', 'pH meter', 'Dung dịch điều chỉnh pH'],
      },
      {
        id: 'stage-020',
        order: 4,
        title: 'Thu hoạch',
        description: 'Thu hoạch sau 30-35 ngày trồng, khi cây đạt 200-300g.',
        materials: ['Túi PA', 'Băng dính'],
      },
    ],
  },
  {
    id: 'TPL-005',
    name: 'Mẫu trồng dâu tây sạch',
    cropType: 'crop-005',
    description: 'Quy trình trồng dâu tây trên giá thể',
    stageCount: 6,
    status: true,
    createdAt: '2024-05-12',
    stages: [
      {
        id: 'stage-021',
        order: 1,
        title: 'Chọn giống và xử lý',
        description: 'Chọn cây giống tơ khỏe mạnh. Cắt lá già, ngâm rễ trong dung dịch diệt nấm.',
        materials: ['Cây giống dâu tây', 'Thuốc diệt nấm'],
      },
      {
        id: 'stage-022',
        order: 2,
        title: 'Trồng trên giá thể',
        description: 'Trồng vào bầu xốp hoặc chậu nhựa, giá thể cocopeat + trấu hun. Mật độ 8-10 cây/m².',
        materials: ['Giá thể cocopeat', 'Trấu hun', 'Chậu/bầu'],
      },
      {
        id: 'stage-023',
        order: 3,
        title: 'Giai đoạn phục hồi',
        description: 'Tưới đủ ẩm, che nắng 7-10 ngày đầu. Phun phân bón lá pha loãng.',
        materials: ['Lưới che 70%', 'Phân bón lá'],
      },
      {
        id: 'stage-024',
        order: 4,
        title: 'Ra hoa và đậu quả',
        description: 'Tỉa bỏ hoa đợt 1. Bón phân bổ sung canxi,�붕붕 붕 hạt. Theo dõi sâu bệnh.',
        materials: ['Phân canxi', 'Phân lân', 'Phân NPK'],
      },
      {
        id: 'stage-025',
        order: 5,
        title: 'Chăm sóc quả',
        description: 'Lót rơm khô dưới gốc. Tưới nhỏ giọt 2 lần/ngày. Phòng trừ bệnh phấn trắng.',
        materials: ['Rơm khô', 'Lưu huỳnh', 'Thuốc sinh học'],
      },
      {
        id: 'stage-026',
        order: 6,
        title: 'Thu hoạch',
        description: 'Thu khi quả chín đỏ 80%. Hái nhẹ nhàng, bảo quản lạnh 2-4°C.',
        materials: ['Khay xốp', 'Túi PA'],
      },
    ],
  },
  {
    id: 'TPL-006',
    name: 'Mẫu trồng ớt hiểm',
    cropType: 'crop-006',
    description: 'Quy trình trồng ớt hiểm năng suất cao',
    stageCount: 5,
    status: true,
    createdAt: '2024-06-01',
    stages: [
      {
        id: 'stage-027',
        order: 1,
        title: 'Ươm cây giống',
        description: 'Ươm trong khay 50-88 lỗ, giá thể cocopeat + phân trùn. Thời gian 30-35 ngày.',
        materials: ['Hạt giống ớt hiểm', 'Khay ươm', 'Giá thể'],
      },
      {
        id: 'stage-028',
        order: 2,
        title: 'Trồng và bón lót',
        description: 'Trồng trên luống cao hoặc bầu lớn. Bón lót phân hữu cơ và NPK.',
        materials: ['Phân chuồng', 'Phân NPK 16-16-8', 'Vôi bột'],
      },
      {
        id: 'stage-029',
        order: 3,
        title: 'Chăm sóc cây non',
        description: 'Cắm cọc chống đổ. Tỉa cành dưới. Bón phân thúc đạm.',
        materials: ['Cọc tre', 'Phân đạm', 'Dây buộc'],
      },
      {
        id: 'stage-030',
        order: 4,
        title: 'Ra hoa - đậu quả',
        description: 'Tưới đủ ẩm, tránh úng. Bón phân lân, kali. Phun thuốc phòng bệnh thối quả.',
        materials: ['Phân lân', 'Phân kali', 'Trichoderma'],
      },
      {
        id: 'stage-031',
        order: 5,
        title: 'Thu hoạch',
        description: 'Hái khi quả chuyển màu đỏ. Thu 7-10 ngày/lần. Kéo dài 4-6 tháng.',
        materials: ['Rổ thu hoạch'],
      },
    ],
  },
  {
    id: 'TPL-007',
    name: 'Mẫu trồng su hào hữu cơ',
    cropType: 'crop-007',
    description: 'Quy trình trồng su hào theo tiêu chuẩn hữu cơ',
    stageCount: 4,
    status: true,
    createdAt: '2024-06-15',
    stages: [
      {
        id: 'stage-032',
        order: 1,
        title: 'Chuẩn bị đất',
        description: 'Bón phân hữu cơ 2-3 tấn/ha, nghỉ đất 15 ngày.',
        materials: ['Phân chuồng hoai mục', 'Vi sinh vật'],
      },
      {
        id: 'stage-033',
        order: 2,
        title: 'Gieo hạt',
        description: 'Gieo trực tiếp trên luống, khoảng cách 30x30cm. Phủ rơm mỏng.',
        materials: ['Hạt giống su hào', 'Rơm'],
      },
      {
        id: 'stage-034',
        order: 3,
        title: 'Chăm sóc',
        description: 'Tưới đủ ẩm. Bón phân hữu cơ lỏng 10 ngày/lần. Diệt cỏ thủ công.',
        materials: ['Phân hữu cơ lỏng', 'Chế phẩm EM'],
      },
      {
        id: 'stage-035',
        order: 4,
        title: 'Thu hoạch',
        description: 'Thu hoạch sau 60-70 ngày, khi củ đạt 8-10cm đường kính.',
        materials: [],
      },
    ],
  },
  {
    id: 'TPL-008',
    name: 'Mẫu trồng bắp cải xanh',
    cropType: 'crop-008',
    description: 'Quy trình trồng bắp cải trên đất cao',
    stageCount: 5,
    status: true,
    createdAt: '2024-07-01',
    stages: [
      {
        id: 'stage-036',
        order: 1,
        title: 'Ươm cây',
        description: 'Ươm trong khay xốp 88 lỗ, 20-25 ngày.',
        materials: ['Hạt giống bắp cải', 'Khay xốp', 'Đất ươm'],
      },
      {
        id: 'stage-037',
        order: 2,
        title: 'Làm đất và trồng',
        description: 'Làm luống cao 20-25cm, bón lót phân chuồng. Trồng khoảng cách 50x50cm.',
        materials: ['Phân chuồng', 'Phân NPK 16-16-8'],
      },
      {
        id: 'stage-038',
        order: 3,
        title: 'Chăm sóc cây non',
        description: 'Tưới nhẹ 2-3 ngày/lần. Bón phân thúc sau 15 ngày.',
        materials: ['Phân đạm', 'Thuốc trừ sâu sinh học'],
      },
      {
        id: 'stage-039',
        order: 4,
        title: 'Cuốn cải',
        description: 'Bón phân kali để cải cuốn chặt. Phòng bệnh thối lá.',
        materials: ['Phân kali', 'Chế phẩm đồng'],
      },
      {
        id: 'stage-040',
        order: 5,
        title: 'Thu hoạch',
        description: 'Thu hoạch sau 75-90 ngày khi cải cuốn chặt, cân nặng 1-1.5kg/cây.',
        materials: ['Dao thu hoạch'],
      },
    ],
  },
]

// Mock helper functions
export const getMockPlanTemplates = (params = {}) => {
  let filtered = [...MOCK_PLAN_TEMPLATES]

  // Filter by search
  if (params.SearchKeyword) {
    const keyword = params.SearchKeyword.toLowerCase()
    filtered = filtered.filter(
      (item) =>
        item.name.toLowerCase().includes(keyword) ||
        item.id.toLowerCase().includes(keyword) ||
        item.description?.toLowerCase().includes(keyword)
    )
  }

  // Filter by status
  if (params.Status !== undefined && params.Status !== 'all') {
    filtered = filtered.filter((item) => item.status === params.Status)
  }

  const pageIndex = params.PageIndex || 1
  const pageSize = params.PageSize || 10
  const startIndex = (pageIndex - 1) * pageSize
  const endIndex = startIndex + pageSize

  return {
    success: true,
    data: {
      items: filtered.slice(startIndex, endIndex),
      totalItems: filtered.length,
      pageIndex,
      pageSize,
    },
  }
}

export const getMockPlanTemplateById = (id) => {
  const template = MOCK_PLAN_TEMPLATES.find((t) => t.id === id)
  if (template) {
    return {
      success: true,
      data: template,
    }
  }
  return {
    success: false,
    message: 'Không tìm thấy kế hoạch mẫu',
  }
}
