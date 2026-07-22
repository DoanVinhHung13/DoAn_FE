// Products API — dùng chọn productId khi tạo harvest-batch (bước 6)
// Swagger: /api/products
// Không dựng màn CRUD Products (luồng phụ) — chỉ list/detail cho selection

export const apiGetProducts = '/products'
export const apiGetProductById = (id) => `/products/${id}`
