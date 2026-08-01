const textValue = (...values) => values.find(value => typeof value === 'string' && value.trim())?.trim() || ''

export const extractPesticideActiveIngredient = description => {
  const match = String(description ?? '').match(/chứa\s+hoạt\s+chất\s+(.+?)(?:\.\s*Sản phẩm được đăng ký|$)/iu)
  return textValue(match?.[1])
}

export const extractPesticideTarget = description => {
  const match = String(description ?? '').match(/đối tượng phòng trừ\/cây trồng sau:\s*(.+?)(?:\.\s*Đơn vị đề nghị|$)/iu)
  return textValue(match?.[1])
}
