// Dữ liệu địa phương Việt Nam
export const vietnamProvinces = [
  { code: '01', name: 'Hà Nội' },
  { code: '79', name: 'Hồ Chí Minh' },
  { code: '31', name: 'Hải Phòng' },
  { code: '48', name: 'Đà Nẵng' },
  { code: '92', name: 'Cần Thơ' },
  { code: '02', name: 'Hà Giang' },
  { code: '04', name: 'Cao Bằng' },
  { code: '06', name: 'Bắc Kạn' },
  { code: '08', name: 'Tuyên Quang' },
  { code: '10', name: 'Lào Cai' },
  { code: '11', name: 'Điện Biên' },
  { code: '12', name: 'Lai Châu' },
  { code: '14', name: 'Sơn La' },
  { code: '15', name: 'Yên Bái' },
  { code: '17', name: 'Hoà Bình' },
  { code: '19', name: 'Thái Nguyên' },
  { code: '20', name: 'Lạng Sơn' },
  { code: '22', name: 'Quảng Ninh' },
  { code: '24', name: 'Bắc Giang' },
  { code: '25', name: 'Phú Thọ' },
  { code: '26', name: 'Vĩnh Phúc' },
  { code: '27', name: 'Bắc Ninh' },
  { code: '30', name: 'Hải Dương' },
  { code: '33', name: 'Hưng Yên' },
  { code: '34', name: 'Thái Bình' },
  { code: '35', name: 'Hà Nam' },
  { code: '36', name: 'Nam Định' },
  { code: '37', name: 'Ninh Bình' },
  { code: '38', name: 'Thanh Hóa' },
  { code: '40', name: 'Nghệ An' },
  { code: '42', name: 'Hà Tĩnh' },
  { code: '44', name: 'Quảng Bình' },
  { code: '45', name: 'Quảng Trị' },
  { code: '46', name: 'Thừa Thiên Huế' },
  { code: '49', name: 'Quảng Nam' },
  { code: '51', name: 'Quảng Ngãi' },
  { code: '52', name: 'Bình Định' },
  { code: '54', name: 'Phú Yên' },
  { code: '56', name: 'Khánh Hòa' },
  { code: '58', name: 'Ninh Thuận' },
  { code: '60', name: 'Bình Thuận' },
  { code: '62', name: 'Kon Tum' },
  { code: '64', name: 'Gia Lai' },
  { code: '66', name: 'Đắk Lắk' },
  { code: '67', name: 'Đắk Nông' },
  { code: '68', name: 'Lâm Đồng' },
  { code: '70', name: 'Bình Phước' },
  { code: '72', name: 'Tây Ninh' },
  { code: '74', name: 'Bình Dương' },
  { code: '75', name: 'Đồng Nai' },
  { code: '77', name: 'Bà Rịa - Vũng Tàu' },
  { code: '80', name: 'Long An' },
  { code: '82', name: 'Tiền Giang' },
  { code: '83', name: 'Bến Tre' },
  { code: '84', name: 'Trà Vinh' },
  { code: '86', name: 'Vĩnh Long' },
  { code: '87', name: 'Đồng Tháp' },
  { code: '89', name: 'An Giang' },
  { code: '91', name: 'Kiên Giang' },
  { code: '93', name: 'Hậu Giang' },
  { code: '94', name: 'Sóc Trăng' },
  { code: '95', name: 'Bạc Liêu' },
  { code: '96', name: 'Cà Mau' }
];

// Dữ liệu quận/huyện theo tỉnh (mẫu cho một số tỉnh chính)
export const vietnamDistricts = {
  '01': [ // Hà Nội
    'Ba Đình', 'Hoàn Kiếm', 'Tây Hồ', 'Long Biên', 'Cầu Giấy', 'Đống Đa', 
    'Hai Bà Trưng', 'Hoàng Mai', 'Thanh Xuân', 'Sóc Sơn', 'Đông Anh', 
    'Gia Lâm', 'Nam Từ Liêm', 'Bắc Từ Liêm', 'Thanh Trì', 'Hà Đông',
    'Sơn Tây', 'Ba Vì', 'Phúc Thọ', 'Đan Phượng', 'Hoài Đức', 'Quốc Oai',
    'Thạch Thất', 'Chương Mỹ', 'Thanh Oai', 'Thường Tín', 'Phú Xuyên',
    'Ứng Hòa', 'Mỹ Đức', 'Mê Linh'
  ],
  '79': [ // TP. Hồ Chí Minh
    'Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7',
    'Quận 8', 'Quận 9', 'Quận 10', 'Quận 11', 'Quận 12', 'Thủ Đức',
    'Gò Vấp', 'Bình Thạnh', 'Tân Bình', 'Tân Phú', 'Phú Nhuận', 'Bình Tân',
    'Củ Chi', 'Hóc Môn', 'Bình Chánh', 'Nhà Bè', 'Cần Giờ'
  ],
  '31': [ // Hải Phòng
    'Hồng Bàng', 'Ngô Quyền', 'Lê Chân', 'Hải An', 'Kiến An', 'Đồ Sơn',
    'Dương Kinh', 'Thuỷ Nguyên', 'An Dương', 'An Lão', 'Kiến Thuỵ',
    'Tiên Lãng', 'Vĩnh Bảo', 'Cát Hải', 'Bạch Long Vĩ'
  ],
  '48': [ // Đà Nẵng
    'Liên Chiểu', 'Thanh Khê', 'Hải Châu', 'Sơn Trà', 'Ngũ Hành Sơn',
    'Cẩm Lệ', 'Hòa Vang', 'Hoàng Sa'
  ],
  '92': [ // Cần Thơ
    'Ninh Kiều', 'Ô Môn', 'Bình Thuỷ', 'Cái Răng', 'Thốt Nốt',
    'Vĩnh Thạnh', 'Cờ Đỏ', 'Phong Điền', 'Thới Lai'
  ]
};

// Dữ liệu phường/xã theo quận/huyện (mẫu)
export const vietnamWards = {
  'Hoàn Kiếm': [
    'Phường Chương Dương', 'Phường Cửa Đông', 'Phường Cửa Nam', 'Phường Đồng Xuân',
    'Phường Hàng Bạc', 'Phường Hàng Bài', 'Phường Hàng Bồ', 'Phường Hàng Bông',
    'Phường Hàng Buồm', 'Phường Hàng Đào', 'Phường Hàng Gai', 'Phường Hàng Mã',
    'Phường Hàng Trống', 'Phường Lý Thái Tổ', 'Phường Phan Chu Trinh', 'Phường Phúc Tân',
    'Phường Trần Hưng Đạo', 'Phường Tràng Tiền'
  ],
  'Ba Đình': [
    'Phường Cống Vị', 'Phường Điện Biên', 'Phường Đội Cấn', 'Phường Giảng Võ',
    'Phường Kim Mã', 'Phường Liễu Giai', 'Phường Ngọc Hà', 'Phường Ngọc Khánh',
    'Phường Nguyễn Trung Trực', 'Phường Phúc Xá', 'Phường Quán Thánh', 'Phường Thành Công',
    'Phường Trúc Bạch', 'Phường Vĩnh Phúc'
  ],
  'Quận 1': [
    'Phường Bến Nghé', 'Phường Bến Thành', 'Phường Cầu Kho', 'Phường Cầu Ông Lãnh',
    'Phường Cô Giang', 'Phường Đa Kao', 'Phường Nguyễn Cư Trinh', 'Phường Nguyễn Thái Bình',
    'Phường Phạm Ngũ Lão', 'Phường Tân Định'
  ]
};

// Function helper để lấy districts theo province
export const getDistrictsByProvince = (provinceCode) => {
  return vietnamDistricts[provinceCode] || [];
};

// Function helper để lấy wards theo district
export const getWardsByDistrict = (districtName) => {
  return vietnamWards[districtName] || [];
};
