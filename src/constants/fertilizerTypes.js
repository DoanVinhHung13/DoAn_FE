export const FERTILIZER_TYPE_OPTIONS = [
  { value: 'PHÂN BÓN LÁ', label: 'PHÂN BÓN LÁ' },
  { value: 'PHÂN HỮU CƠ SINH HỌC', label: 'PHÂN HỮU CƠ SINH HỌC' },
  { value: 'PHÂN HỮU CƠ VI SINH', label: 'PHÂN HỮU CƠ VI SINH' },
  { value: 'PHÂN HỮU CƠ KHOÁNG', label: 'PHÂN HỮU CƠ KHOÁNG' },
  { value: 'PHÂN HỮU CƠ', label: 'PHÂN HỮU CƠ' },
  { value: 'PHÂN VI SINH VẬT', label: 'PHÂN VI SINH VẬT' },
  { value: 'CHẤT GIỮ ẨM, CẢI TẠO ĐẤT', label: 'CHẤT GIỮ ẨM, CẢI TẠO ĐẤT' },
]

export const normalizeFertilizerType = value => String(value ?? '').trim().toUpperCase()
