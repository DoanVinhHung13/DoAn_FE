import { AutoComplete, Spin, Typography } from 'antd'
import React from 'react'
import { useQuery } from '@tanstack/react-query'
import CatalogSuggestionService, { getApiData } from 'src/services/CatalogSuggestionService'

const { Text } = Typography

const AgriculturalInputCatalogAutocomplete = ({ catalogType, value, onChange, onSelectCatalog, disabled, placeholder, allowCreate = true }) => {
  const [keyword, setKeyword] = React.useState(value || '')
  const [debounced, setDebounced] = React.useState('')
  React.useEffect(() => { const timer = setTimeout(() => setDebounced(String(keyword || '').trim()), 300); return () => clearTimeout(timer) }, [keyword])
  React.useEffect(() => { setKeyword(value || '') }, [value])
  const isFertilizer = catalogType === 'FERTILIZER'
  const { data, isFetching } = useQuery({
    queryKey: ['agricultural-input-catalog-suggestions', catalogType, debounced.toLowerCase()],
    queryFn: ({ signal }) => isFertilizer
      ? CatalogSuggestionService.fertilizerSuggestions({ keyword: debounced, take: 10, signal })
      : CatalogSuggestionService.pesticideSuggestions({ keyword: debounced, take: 10, signal }),
    enabled: debounced.length > 0,
    staleTime: 30_000,
    retry: false,
  })
  const suggestions = Array.isArray(getApiData(data)) ? getApiData(data) : []
  const options = suggestions.map(item => ({
    value: item.id,
    label: <div className="py-1"><div className="font-medium">{item.name}</div><Text type="secondary" className="text-xs">Mã: {item.code} · {item.manufacturer || ''}</Text><div className="text-xs">{[item.type, item.unit].filter(Boolean).join(' · ')}</div></div>,
    catalog: item,
  }))
  if (allowCreate && debounced && !isFetching && options.length === 0) options.push({ value: debounced, label: <Text type="secondary">Không tìm thấy trong danh mục. Sử dụng “{debounced}” để tạo mới.</Text> })
  return <AutoComplete value={value} options={options} onChange={next => { onChange?.(next); setKeyword(next) }} onSelect={(_, option) => { if (option.catalog) { onChange?.(option.catalog.name); setKeyword(option.catalog.name); onSelectCatalog?.(option.catalog) } }} disabled={disabled} placeholder={placeholder} filterOption={false} notFoundContent={isFetching ? <Spin size="small" /> : null} style={{ width: '100%' }} optionLabelProp="value" />
}

export default AgriculturalInputCatalogAutocomplete
