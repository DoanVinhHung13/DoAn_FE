// Mock data chi tiết cho các giai đoạn - Thông tin Supervisor ghi nhận
// Dùng để hiển thị trong StageDetailModal

export const STAGE_DETAILS_MAP = {
  'pp001-stage-001': {
    supervisorLogs: [
      {
        type: 'success',
        title: 'Hoàn thành làm đất',
        description: 'Đã làm đất xong 5 ha, san phẳng và tạo luống. Độ ẩm đất đạt 70%.',
        date: '22/02/2026 16:30',
        supervisor: 'Nguyễn Văn An',
        images: [
          'https://via.placeholder.com/200x150/4ade80/ffffff?text=Ruộng+1',
          'https://via.placeholder.com/200x150/4ade80/ffffff?text=Ruộng+2',
        ],
      },
      {
        type: 'blue',
        title: 'Bón phân lót',
        description: 'Đã bón phân chuồng 3 tấn/ha, phân NPK 16-16-8 liều lượng 100kg/ha.',
        date: '20/02/2026 10:15',
        supervisor: 'Nguyễn Văn An',
      },
      {
        type: 'blue',
        title: 'Bắt đầu chuẩn bị đất',
        description: 'Khởi động công việc chuẩn bị đất, kiểm tra máy móc và nhân công.',
        date: '15/02/2026 08:00',
        supervisor: 'Nguyễn Văn An',
      },
    ],
    photos: [
      {
        url: 'https://via.placeholder.com/300x200/22c55e/ffffff?text=Ruộng+sau+làm+đất',
        caption: 'Ruộng sau khi làm đất',
        uploadedAt: '22/02/2026',
      },
      {
        url: 'https://via.placeholder.com/300x200/16a34a/ffffff?text=Bón+phân',
        caption: 'Bón phân lót cho ruộng',
        uploadedAt: '20/02/2026',
      },
      {
        url: 'https://via.placeholder.com/300x200/15803d/ffffff?text=San+phẳng',
        caption: 'San phẳng mặt ruộng',
        uploadedAt: '18/02/2026',
      },
    ],
    issues: [],
  },

  'pp001-stage-002': {
    supervisorLogs: [
      {
        type: 'success',
        title: 'Hoàn thành gieo sạ',
        description: 'Đã gieo xong 5 ha với mật độ 120kg/ha. Tỷ lệ nảy mầm dự kiến đạt 85-90%.',
        date: '25/02/2026 17:00',
        supervisor: 'Nguyễn Văn An',
      },
      {
        type: 'warning',
        title: 'Thời tiết khô',
        description: 'Thời tiết khô hạn, cần bơm nước duy trì mực nước 3-5cm cho ruộng.',
        date: '24/02/2026 14:20',
        supervisor: 'Nguyễn Văn An',
      },
      {
        type: 'blue',
        title: 'Ngâm ủ hạt giống',
        description: 'Bắt đầu ngâm ủ hạt giống lúa Jasmine 85, dự kiến gieo sau 24h.',
        date: '22/02/2026 09:00',
        supervisor: 'Nguyễn Văn An',
      },
    ],
    photos: [
      {
        url: 'https://via.placeholder.com/300x200/3b82f6/ffffff?text=Gieo+sạ',
        caption: 'Quá trình gieo sạ',
        uploadedAt: '25/02/2026',
      },
      {
        url: 'https://via.placeholder.com/300x200/2563eb/ffffff?text=Hạt+giống',
        caption: 'Hạt giống đã ngâm ủ',
        uploadedAt: '23/02/2026',
      },
    ],
    issues: [
      {
        title: 'Thời tiết khô hạn',
        description: 'Cần theo dõi mực nước và bơm thêm nếu cần thiết.',
        resolvedAt: null,
      },
    ],
  },

  'pp001-stage-003': {
    supervisorLogs: [
      {
        type: 'blue',
        title: 'Phun thuốc trừ sâu',
        description: 'Đã phun thuốc sinh học BT phòng sâu cuốn lá. Nồng độ 2ml/lít nước.',
        date: '05/07/2026 08:30',
        supervisor: 'Nguyễn Văn An',
        images: [
          'https://via.placeholder.com/200x150/f59e0b/ffffff?text=Phun+thuốc',
        ],
      },
      {
        type: 'success',
        title: 'Bón phân thúc lần 1',
        description: 'Đã bón phân đạm urê 50kg/ha. Cây đẻ nhánh tốt, cao khoảng 25cm.',
        date: '25/03/2026 15:00',
        supervisor: 'Nguyễn Văn An',
      },
      {
        type: 'blue',
        title: 'Kiểm tra cây đẻ nhánh',
        description: 'Cây con cao 15-20cm, bắt đầu giai đoạn đẻ nhánh. Màu lá xanh tốt.',
        date: '15/03/2026 10:00',
        supervisor: 'Nguyễn Văn An',
      },
    ],
    photos: [
      {
        url: 'https://via.placeholder.com/300x200/84cc16/ffffff?text=Cây+lúa+đẻ+nhánh',
        caption: 'Cây lúa giai đoạn đẻ nhánh',
        uploadedAt: '05/07/2026',
      },
      {
        url: 'https://via.placeholder.com/300x200/65a30d/ffffff?text=Bón+phân',
        caption: 'Bón phân thúc',
        uploadedAt: '25/03/2026',
      },
    ],
    issues: [
      {
        title: 'Phát hiện sâu cuốn lá nhẹ',
        description: 'Khoảng 5% diện tích có dấu hiệu sâu cuốn lá. Đã phun thuốc sinh học.',
        resolvedAt: '05/07/2026',
      },
    ],
  },

  'pp002-stage-001': {
    supervisorLogs: [
      {
        type: 'success',
        title: 'Hoàn thành ươm cây',
        description: 'Đã ươm xong 2000 cây con cà chua. Tỷ lệ nảy mầm 92%, cây khỏe mạnh.',
        date: '28/03/2026 16:00',
        supervisor: 'Trần Thị Bình',
        images: [
          'https://via.placeholder.com/200x150/ef4444/ffffff?text=Cây+con',
          'https://via.placeholder.com/200x150/dc2626/ffffff?text=Khay+ươm',
        ],
      },
      {
        type: 'blue',
        title: 'Chuyển sang giá thể',
        description: 'Cây con đã có 2 lá thật, chuyển sang khay ươm 50 lỗ.',
        date: '15/03/2026 09:00',
        supervisor: 'Trần Thị Bình',
      },
      {
        type: 'blue',
        title: 'Gieo hạt vào khay',
        description: 'Bắt đầu gieo hạt cà chua Cherry F1 vào giá thể cocopeat.',
        date: '01/03/2026 08:00',
        supervisor: 'Trần Thị Bình',
      },
    ],
    photos: [
      {
        url: 'https://via.placeholder.com/300x200/f87171/ffffff?text=Cây+con+khỏe',
        caption: 'Cây con cà chua 25 ngày tuổi',
        uploadedAt: '28/03/2026',
      },
      {
        url: 'https://via.placeholder.com/300x200/fca5a5/ffffff?text=Khay+ươm',
        caption: 'Khay ươm xốp 50 lỗ',
        uploadedAt: '15/03/2026',
      },
    ],
    issues: [],
  },

  'pp002-stage-003': {
    supervisorLogs: [
      {
        type: 'blue',
        title: 'Phun phân bón lá',
        description: 'Phun phân bón lá NPK 20-20-20 nồng độ 1g/lít. Cây phát triển tốt.',
        date: '08/07/2026 07:00',
        supervisor: 'Trần Thị Bình',
      },
      {
        type: 'warning',
        title: 'Nhiệt độ cao',
        description: 'Nhiệt độ trong nhà lưới lên tới 36°C. Đã mở màn che phủ và tăng tưới.',
        date: '05/07/2026 14:00',
        supervisor: 'Trần Thị Bình',
      },
      {
        type: 'success',
        title: 'Cắm cọc và buộc dây',
        description: 'Đã cắm cọc tre và buộc cây. Chiều cao cây 30-35cm.',
        date: '15/04/2026 10:30',
        supervisor: 'Trần Thị Bình',
      },
    ],
    photos: [
      {
        url: 'https://via.placeholder.com/300x200/fb923c/ffffff?text=Cây+non',
        caption: 'Cây cà chua non đã cắm cọc',
        uploadedAt: '08/07/2026',
      },
    ],
    issues: [
      {
        title: 'Nhiệt độ cao trong nhà lưới',
        description: 'Cần theo dõi nhiệt độ, tưới nhiều hơn và che phủ thêm nếu cần.',
        resolvedAt: null,
      },
    ],
  },
}

/**
 * Lấy thông tin chi tiết của một giai đoạn
 * @param {string} stageId - ID của giai đoạn
 * @returns {object} Chi tiết giai đoạn (logs, photos, issues)
 */
export const getStageDetails = (stageId) => {
  return STAGE_DETAILS_MAP[stageId] || {
    supervisorLogs: [],
    photos: [],
    issues: [],
  }
}
