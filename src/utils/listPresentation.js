export const getListPresentationState = ({
  hasActiveFilters = false,
  isLoading = false,
  isError = false,
  items = [],
  visibleItems = [],
}) => {
  if (isLoading) return 'loading'
  if (isError) return 'error'
  if (visibleItems.length > 0) return 'content'

  return hasActiveFilters && items.length > 0 ? 'filtered-empty' : 'system-empty'
}
