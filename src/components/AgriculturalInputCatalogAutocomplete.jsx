import { AutoComplete, Spin, Typography } from "antd"
import React from "react"
import CatalogSuggestionService, {
  getApiData,
} from "src/services/CatalogSuggestionService"

const { Text } = Typography

const AgriculturalInputCatalogAutocomplete = ({
  catalogType,
  value,
  onChange,
  onSelectCatalog,
  disabled,
  placeholder,
  allowCreate = true,
}) => {
  const [keyword, setKeyword] = React.useState(value || "")
  const [debounced, setDebounced] = React.useState("")
  const [options, setOptions] = React.useState([])
  const [isFetching, setIsFetching] = React.useState(false)

  React.useEffect(() => {
    const timer = setTimeout(
      () => setDebounced(String(keyword || "").trim()),
      300,
    )
    return () => clearTimeout(timer)
  }, [keyword])

  React.useEffect(() => {
    setKeyword(value || "")
  }, [value])

  const isFertilizer = catalogType === "FERTILIZER"

  React.useEffect(() => {
    if (debounced.length === 0) {
      setOptions([])
      return
    }

    const controller = new AbortController()
    const signal = controller.signal

    setIsFetching(true)

    const fetchFn = isFertilizer
      ? CatalogSuggestionService.fertilizerSuggestions
      : CatalogSuggestionService.pesticideSuggestions

    fetchFn({ keyword: debounced, take: 10, signal })
      .then(data => {
        if (signal.aborted) return
        const suggestions = Array.isArray(getApiData(data))
          ? getApiData(data)
          : []
        const mapped = suggestions.map(item => ({
          value: item.id,
          label: (
            <div className="py-1">
              <div className="font-medium">{item.name}</div>
              <Text type="secondary" className="text-xs">
                Mã: {item.code} · {item.manufacturer || ""}
              </Text>
              <div className="text-xs">
                {[item.type, item.unit].filter(Boolean).join(" · ")}
              </div>
            </div>
          ),
          catalog: item,
        }))
        if (allowCreate && debounced && mapped.length === 0) {
          mapped.push({
            value: debounced,
            label: (
              <Text type="secondary">
                Không tìm thấy trong danh mục. Sử dụng "{debounced}" để tạo mới.
              </Text>
            ),
          })
        }
        setOptions(mapped)
      })
      .catch(() => {})
      .finally(() => {
        if (!signal.aborted) setIsFetching(false)
      })

    return () => controller.abort()
  }, [debounced, isFertilizer, allowCreate])

  return (
    <AutoComplete
      value={value}
      options={options}
      onChange={next => {
        onChange?.(next)
        setKeyword(next)
      }}
      onSelect={(_, option) => {
        if (option.catalog) {
          onChange?.(option.catalog.name)
          setKeyword(option.catalog.name)
          onSelectCatalog?.(option.catalog)
        }
      }}
      disabled={disabled}
      placeholder={placeholder}
      filterOption={false}
      notFoundContent={isFetching ? <Spin size="small" /> : null}
      style={{ width: "100%" }}
      optionLabelProp="value"
    />
  )
}

export default AgriculturalInputCatalogAutocomplete
