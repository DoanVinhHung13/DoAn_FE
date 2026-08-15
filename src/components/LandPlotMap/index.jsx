import React, { useEffect, useRef, useCallback, useState } from 'react'
import PropTypes from 'prop-types'
import { Input, Spin } from 'antd'
import { EnvironmentOutlined, SearchOutlined } from '@ant-design/icons'
import L from 'src/lib/map/leafletGeoman'
import geomanVi from 'src/lib/map/geomanVi'
import {
  calculatePolygonArea,
  createGeoJSONPolygon,
  findOverlappingPlot,
  formatArea,
  geoJSONToLeafletPositions,
  parseBoundaryJson,
} from 'src/utils/geoJsonUtils'
import { MSG_LM_25 } from 'src/pages/FARM_MANAGER/Lands/landPlotUtils'
import { getPlaceDetail, isExternalAbortError, reverseGeocode, searchAddress } from 'src/utils/geocodingUtils'
import './styles.css'

const DEFAULT_CENTER = [21.0285, 105.8542]
const DEFAULT_ZOOM = 13
const SEARCH_ZOOM = 16
const MAP_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']
const MAX_AREA_M2 = 300_000

const LandPlotMap = ({
  mode = 'view',
  boundaryJson,
  color = '#22c55e',
  height = 420,
  className = '',
  onPolygonChange,
  onAddressSelect,
  overlapPlots = [],
  excludePlotId = null,
  onOverlapError,
}) => {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const activeLayer = useRef(null)
  const overlapLayers = useRef([])
  const searchMarkerRef = useRef(null)
  const locateMarkerRef = useRef(null)
  const lastValidGeoJSON = useRef(null)
  const overlapPlotsRef = useRef(overlapPlots)
  const excludePlotIdRef = useRef(excludePlotId)
  const onPolygonChangeRef = useRef(onPolygonChange)
  const onAddressSelectRef = useRef(onAddressSelect)
  const onOverlapErrorRef = useRef(onOverlapError)
  const searchControllerRef = useRef(null)
  const searchRequestIdRef = useRef(0)
  const debounceTimerRef = useRef(null)
  const detailControllerRef = useRef(null)
  const reverseGeocodeControllerRef = useRef(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [geocodingLoading, setGeocodingLoading] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [overlapError, setOverlapError] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [pickLocationMode, setPickLocationMode] = useState(false)

  useEffect(() => {
    overlapPlotsRef.current = overlapPlots
  }, [overlapPlots])

  useEffect(() => {
    excludePlotIdRef.current = excludePlotId
  }, [excludePlotId])

  useEffect(() => {
    onOverlapErrorRef.current = onOverlapError
  }, [onOverlapError])

  useEffect(() => {
    onPolygonChangeRef.current = onPolygonChange
  }, [onPolygonChange])

  useEffect(() => {
    onAddressSelectRef.current = onAddressSelect
  }, [onAddressSelect])

  useEffect(() => () => {
    searchControllerRef.current?.abort()
    detailControllerRef.current?.abort()
    reverseGeocodeControllerRef.current?.abort()
    clearTimeout(debounceTimerRef.current)
  }, [])

  const emitPolygonChange = useCallback((geoJSON) => {
    const areaM2 = calculatePolygonArea(geoJSON.coordinates)
    onPolygonChangeRef.current?.({
      geoJSON,
      areaM2,
      boundaryJson: JSON.stringify(geoJSON),
    })
  }, [])

  const validatePolygon = useCallback(
    (geoJSON, layer, { isDraw = false } = {}) => {
      // Kiểm tra diện tích tối đa 30 ha = 300,000 m²
      const areaM2 = calculatePolygonArea(geoJSON.coordinates)
      if (areaM2 > MAX_AREA_M2) {
        const message = `Diện tích vượt quá giới hạn cho phép (tối đa  ${MAX_AREA_M2.toLocaleString('vi-VN')} m²). Vui lòng vẽ lại nhỏ hơn.`
        setOverlapError(message)
        onOverlapErrorRef.current?.(message)

        if (isDraw && layer && mapInstance.current) {
          mapInstance.current.removeLayer(layer)
          activeLayer.current = null
          onPolygonChangeRef.current?.(null)
        } else if (layer && lastValidGeoJSON.current) {
          const positions = geoJSONToLeafletPositions(lastValidGeoJSON.current.coordinates)
          layer.setLatLngs(positions)
        }

        return false
      }

      const overlapping = findOverlappingPlot(
        geoJSON,
        overlapPlotsRef.current,
        excludePlotIdRef.current,
      )

      if (overlapping) {
        const plotLabel = overlapping.name || 'lô đất khác'
        const message = `${MSG_LM_25} (${plotLabel})`
        setOverlapError(message)
        onOverlapErrorRef.current?.(message)

        if (isDraw && layer && mapInstance.current) {
          mapInstance.current.removeLayer(layer)
          activeLayer.current = null
          onPolygonChangeRef.current?.(null)
        } else if (layer && lastValidGeoJSON.current) {
          const positions = geoJSONToLeafletPositions(lastValidGeoJSON.current.coordinates)
          layer.setLatLngs(positions)
        }

        return false
      }

      setOverlapError('')
      onOverlapErrorRef.current?.('')
      lastValidGeoJSON.current = geoJSON
      emitPolygonChange(geoJSON)
      return true
    },
    [emitPolygonChange],
  )

  const clearActiveLayer = useCallback(() => {
    if (activeLayer.current && mapInstance.current) {
      mapInstance.current.removeLayer(activeLayer.current)
      activeLayer.current = null
    }
  }, [])

  const clearSearchMarker = useCallback(() => {
    if (searchMarkerRef.current && mapInstance.current) {
      mapInstance.current.removeLayer(searchMarkerRef.current)
      searchMarkerRef.current = null
    }
  }, [])

  const clearLocateMarker = useCallback(() => {
    if (locateMarkerRef.current && mapInstance.current) {
      mapInstance.current.removeLayer(locateMarkerRef.current)
      locateMarkerRef.current = null
    }
  }, [])

  const renderPolygon = useCallback(
    (geoJSON, options = {}) => {
      if (!mapInstance.current || !geoJSON?.coordinates) return null

      const positions = geoJSONToLeafletPositions(geoJSON.coordinates)
      const layer = L.polygon(positions, {
        color: options.color || color,
        fillColor: options.color || color,
        fillOpacity: options.fillOpacity ?? 0.25,
        weight: options.weight ?? 2,
        dashArray: options.dashArray || null,
        pmIgnore: options.pmIgnore ?? false,
      }).addTo(mapInstance.current)

      if (options.fitBounds) {
        mapInstance.current.fitBounds(layer.getBounds(), { padding: [40, 40] })
      }

      return layer
    },
    [color],
  )

  const flyToLocation = useCallback(
    (latitude, longitude, label) => {
      if (!mapInstance.current) return

      mapInstance.current.flyTo([latitude, longitude], SEARCH_ZOOM, {
        duration: 1.2,
      })

      clearSearchMarker()
      searchMarkerRef.current = L.marker([latitude, longitude])
        .addTo(mapInstance.current)
        .bindPopup(label || 'Vị trí đã tìm')
        .openPopup()
    },
    [clearSearchMarker],
  )

  const handlePickLocation = useCallback(() => {
    if (!mapInstance.current) return
    setPickLocationMode(true)
    setSearchError('Click trên bản đồ để chọn vị trí chính xác')
    mapInstance.current.getContainer().style.cursor = 'crosshair'
  }, [])

  const handlePolygonGeocode = useCallback(async (layer) => {
    if (!layer?.getBounds) return
    const center = layer.getBounds().getCenter()
    if (!center || !Number.isFinite(center.lat) || !Number.isFinite(center.lng)) return

    const { lat, lng } = center

    reverseGeocodeControllerRef.current?.abort()
    const controller = new AbortController()
    reverseGeocodeControllerRef.current = controller

    setGeocodingLoading(true)
    try {
      const address = await reverseGeocode(lat, lng, { signal: controller.signal })
      if (address) {
        setSearchQuery(address)
        onAddressSelectRef.current?.({
          address,
          latitude: lat,
          longitude: lng,
        })
      }
    } catch (error) {
      if (!isExternalAbortError(error)) {
        const fallbackAddr = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        setSearchQuery(fallbackAddr)
        onAddressSelectRef.current?.({
          address: fallbackAddr,
          latitude: lat,
          longitude: lng,
        })
      }
    } finally {
      if (reverseGeocodeControllerRef.current === controller) {
        reverseGeocodeControllerRef.current = null
        setGeocodingLoading(false)
      }
    }
  }, [])

  const handleMapClick = useCallback(
    async (e) => {
      if (!pickLocationMode) return
      const { lat, lng } = e.latlng
      setPickLocationMode(false)
      mapInstance.current.getContainer().style.cursor = ''
      setSearchError('')

      clearSearchMarker()
      searchMarkerRef.current = L.marker([lat, lng])
        .addTo(mapInstance.current)
        .bindPopup(`Vị trí đã chọn<br/>${lat.toFixed(6)}, ${lng.toFixed(6)}`)
        .openPopup()

      setGeocodingLoading(true)
      try {
        const address = await reverseGeocode(lat, lng)
        if (address) {
          setSearchQuery(address)
          onAddressSelectRef.current?.({
            address,
            latitude: lat,
            longitude: lng,
          })
        }
      } catch {
        const fallbackAddr = `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        setSearchQuery(fallbackAddr)
        onAddressSelectRef.current?.({
          address: fallbackAddr,
          latitude: lat,
          longitude: lng,
        })
      } finally {
        setGeocodingLoading(false)
      }
    },
    [pickLocationMode, clearSearchMarker],
  )

  useEffect(() => {
    if (mapInstance.current || !mapRef.current) return

    const map = L.map(mapRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
    })

    const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 19,
    })
    const satellite = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { attribution: '© Esri', maxZoom: 19 },
    )
    osm.addTo(map)
    L.control.layers({ 'Bản đồ': osm, 'Vệ tinh': satellite }).addTo(map)
    map.pm.setLang('vi', geomanVi, 'en')

    if (mode === 'draw' || mode === 'edit') {
      map.pm.addControls({
        position: 'topleft',
        drawMarker: false,
        drawCircleMarker: false,
        drawPolyline: false,
        drawRectangle: false,
        drawPolygon: true,
        drawCircle: false,
        drawText: false,
        editMode: true,
        dragMode: true,
        cutPolygon: false,
        removalMode: true,
      })
      map.pm.setGlobalOptions({
        pathOptions: {
          color,
          fillColor: color,
          fillOpacity: 0.25,
          weight: 2,
        },
        allowSelfIntersection: false,
        snappable: true,
        snapDistance: 20,
      })

      // Helper: đăng ký sự kiện chỉnh sửa/kéo trên LAYER (không phải map)
      // Geoman chỉ fire pm:edit, pm:dragend trên layer cụ thể
      const attachLayerEditEvents = (layer) => {
        layer.on('pm:edit', () => {
          if (!layer?.getLatLngs) return
          const latLngs = layer.getLatLngs()[0]
          const geoJSON = createGeoJSONPolygon(latLngs)
          const isValid = validatePolygon(geoJSON, layer)
          if (isValid) {
            handlePolygonGeocode(layer)
          }
        })
        layer.on('pm:dragend', () => {
          if (!layer?.getLatLngs) return
          const latLngs = layer.getLatLngs()[0]
          const geoJSON = createGeoJSONPolygon(latLngs)
          const isValid = validatePolygon(geoJSON, layer)
          if (isValid) {
            handlePolygonGeocode(layer)
          }
        })
      }

      const handleCreate = (e) => {
        const { layer, shape } = e
        if (shape !== 'Polygon') return

        clearActiveLayer()
        activeLayer.current = layer
        layer.setStyle({ color, fillColor: color, fillOpacity: 0.25 })
        layer.pm?.enable({
          allowSelfIntersection: false,
        })

        // Đăng ký event edit/drag trên layer mới vẽ
        attachLayerEditEvents(layer)

        const latLngs = layer.getLatLngs()[0]
        const geoJSON = createGeoJSONPolygon(latLngs)
        const isValid = validatePolygon(geoJSON, layer, { isDraw: true })
        if (isValid) {
          handlePolygonGeocode(layer)
        }
      }

      const handleRemove = () => {
        activeLayer.current = null
        lastValidGeoJSON.current = null
        setOverlapError('')
        onPolygonChangeRef.current?.(null)
      }

      map.on('pm:create', handleCreate)
      map.on('pm:remove', handleRemove)
    }

    map.on('click', handleMapClick)

    mapInstance.current = map

    return () => {
      map.off('click', handleMapClick)
      map.remove()
      mapInstance.current = null
      activeLayer.current = null
      searchMarkerRef.current = null
      locateMarkerRef.current = null
    }
  }, [mode, color, clearActiveLayer, validatePolygon, handleMapClick, handlePolygonGeocode])

  useEffect(() => {
    if (!mapInstance.current) return

    overlapLayers.current.forEach((layer) => mapInstance.current.removeLayer(layer))
    overlapLayers.current = []

    overlapPlots.forEach((plot, index) => {
      const geoJSON = parseBoundaryJson(plot.boundaryJson)
      if (!geoJSON) return
      const layer = renderPolygon(geoJSON, {
        color: MAP_COLORS[(index + 1) % MAP_COLORS.length],
        fillOpacity: 0.15,
        weight: 2,
        dashArray: '6 4',
        pmIgnore: true,
      })
      if (layer) {
        layer.bindTooltip(
          `${plot.name || 'Lô đất khác'} (đã đăng ký)`,
          { permanent: false, direction: 'center' },
        )
        overlapLayers.current.push(layer)
      }
    })
  }, [overlapPlots, renderPolygon])

  useEffect(() => {
    if (!mapInstance.current) return

    clearActiveLayer()
    const geoJSON = parseBoundaryJson(boundaryJson)
    if (!geoJSON) return

    const layer = renderPolygon(geoJSON, { fitBounds: true })
    if (!layer) return

    activeLayer.current = layer

    if (mode === 'edit' || mode === 'draw') {
      layer.pm?.enable({
        allowSelfIntersection: false,
      })

      // Đăng ký event edit/drag trên layer được load từ boundaryJson
      layer.on('pm:edit', () => {
        if (!layer?.getLatLngs) return
        const latLngs = layer.getLatLngs()[0]
        const updatedGeoJSON = createGeoJSONPolygon(latLngs)
        validatePolygon(updatedGeoJSON, layer)
      })
      layer.on('pm:dragend', () => {
        if (!layer?.getLatLngs) return
        const latLngs = layer.getLatLngs()[0]
        const updatedGeoJSON = createGeoJSONPolygon(latLngs)
        validatePolygon(updatedGeoJSON, layer)
      })
    }

    lastValidGeoJSON.current = geoJSON
    validatePolygon(geoJSON, layer)
  }, [boundaryJson, mode, clearActiveLayer, renderPolygon, validatePolygon])

  useEffect(() => {
    if (!mapInstance.current?.pm) return
    mapInstance.current.pm.setGlobalOptions({
      pathOptions: { color, fillColor: color, fillOpacity: 0.25, weight: 2 },
    })
  }, [color])

  // ── Autocomplete: gọi khi user gõ (debounce 400ms) ─────────────────────────
  const triggerAutocomplete = useCallback((keyword) => {
    clearTimeout(debounceTimerRef.current)
    if (!keyword || keyword.length < 2) {
      setSearchResults([])
      setShowResults(false)
      return
    }

    debounceTimerRef.current = setTimeout(async () => {
      searchControllerRef.current?.abort()
      const controller = new AbortController()
      const requestId = searchRequestIdRef.current + 1
      searchRequestIdRef.current = requestId
      searchControllerRef.current = controller

      setSearchLoading(true)
      setSearchError('')
      setShowResults(true)

      try {
        const results = await searchAddress(keyword, { signal: controller.signal })
        if (requestId !== searchRequestIdRef.current) return
        setSearchResults(results)
        if (!results.length) {
          setSearchError('Không tìm thấy địa chỉ phù hợp. Hãy thử từ khóa khác.')
        }
      } catch (error) {
        if (isExternalAbortError(error) || requestId !== searchRequestIdRef.current) return
        setSearchResults([])
        setSearchError('Không thể tìm kiếm vị trí lúc này. Vui lòng thử lại.')
      } finally {
        if (requestId === searchRequestIdRef.current) {
          searchControllerRef.current = null
          setSearchLoading(false)
        }
      }
    }, 400)
  }, [])

  // ── Xử lý chọn gợi ý: nếu có place_id → fetch tọa độ; không thì dùng trực tiếp ──
  const handleSelectResult = useCallback(async (result) => {
    setSearchQuery(result.label)
    setShowResults(false)
    setSearchResults([])

    // Nếu đã có tọa độ (fallback Nominatim) → dùng luôn
    if (result.latitude != null && result.longitude != null) {
      flyToLocation(result.latitude, result.longitude, result.label)
      onAddressSelectRef.current?.({
        address: result.label,
        latitude: result.latitude,
        longitude: result.longitude,
      })
      return
    }

    // OpenMap.vn: cần gọi Place Detail để lấy tọa độ
    if (!result.place_id) return

    detailControllerRef.current?.abort()
    const controller = new AbortController()
    detailControllerRef.current = controller

    setSearchLoading(true)
    try {
      const detail = await getPlaceDetail(result.place_id, { signal: controller.signal })
      flyToLocation(detail.latitude, detail.longitude, detail.label || result.label)
      onAddressSelectRef.current?.({
        address: detail.label || result.label,
        latitude: detail.latitude,
        longitude: detail.longitude,
      })
    } catch (error) {
      if (!isExternalAbortError(error)) {
        setSearchError('Không thể lấy vị trí. Vui lòng thử lại.')
      }
    } finally {
      detailControllerRef.current = null
      setSearchLoading(false)
    }
  }, [flyToLocation])

  const handleLocate = () => {
    if (!navigator.geolocation || !mapInstance.current) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setSearchError('')
        mapInstance.current.flyTo([latitude, longitude], SEARCH_ZOOM)
        clearLocateMarker()
        locateMarkerRef.current = L.marker([latitude, longitude])
          .addTo(mapInstance.current)
          .bindPopup(
            `Vị trí hiện tại<br/>${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
          )
          .openPopup()
      },
      () => {
        setSearchError('Không thể định vị GPS. Hãy dùng tìm kiếm địa chỉ.')
      },
      { enableHighAccuracy: true, timeout: 10000 },
    )
  }

  const showToolbar = mode !== 'view'

  return (
    <div className={`land-plot-map ${className}`}>
      {showToolbar && (
        <div className="land-plot-map__toolbar">
          <div className="land-plot-map__search">
            <Input
              allowClear
              prefix={<SearchOutlined className="text-slate-400" />}
              placeholder="Tìm địa chỉ, xã, huyện, tỉnh..."
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value
                setSearchQuery(val)
                setSearchError('')
                setPickLocationMode(false)
                mapInstance.current.getContainer().style.cursor = ''
                triggerAutocomplete(val)
              }}
              onPressEnter={() => triggerAutocomplete(searchQuery)}
              onFocus={() => {
                if (searchResults.length) setShowResults(true)
              }}
            />
          </div>

          <button type="button" className="land-plot-map__locate" onClick={handlePickLocation}>
            <EnvironmentOutlined /> Chọn trên bản đồ
          </button>

          <button type="button" className="land-plot-map__locate" onClick={handleLocate}>
            <EnvironmentOutlined /> GPS
          </button>
        </div>
      )}

      {(mode === 'draw' || mode === 'edit') && (
        <div className="land-plot-map__hint-bar">
          {pickLocationMode
            ? 'Click vào bản đồ để chọn vị trí chính xác'
            : 'Tìm địa chỉ để di chuyển bản đồ. Vùng nét đứt là lô đất đã có — không được vẽ chồng lên.'}
        </div>
      )}

      {overlapError && (
        <div className="land-plot-map__search-error">{overlapError}</div>
      )}

      {showToolbar && searchError && (
        <div className="land-plot-map__search-error">{searchError}</div>
      )}

      {showToolbar && showResults && searchResults.length > 0 && (
        <ul className="land-plot-map__search-results">
          {searchResults.map((result) => (
            <li key={result.id}>
              <button type="button" onClick={() => handleSelectResult(result)}>
                <EnvironmentOutlined />
                <span className="land-plot-map__result-text">
                  <span className="land-plot-map__result-main">
                    {result.mainText || result.label}
                  </span>
                  {result.secondaryText && (
                    <span className="land-plot-map__result-sub">
                      {result.secondaryText}
                    </span>
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {showToolbar && (searchLoading || geocodingLoading) && (
        <div className="land-plot-map__search-loading">
          <Spin size="small" /> {geocodingLoading ? 'Đang tự động xác định địa chỉ...' : 'Đang tìm địa chỉ...'}
        </div>
      )}

      <div ref={mapRef} className="land-plot-map__canvas" style={{ height }} />

      {boundaryJson && mode === 'view' && (
        <div className="land-plot-map__meta">
          Diện tích ước tính:{' '}
          {formatArea(
            calculatePolygonArea(parseBoundaryJson(boundaryJson)?.coordinates || []),
          )}
        </div>
      )}
    </div>
  )
}

LandPlotMap.propTypes = {
  mode: PropTypes.oneOf(['view', 'draw', 'edit']),
  boundaryJson: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  color: PropTypes.string,
  height: PropTypes.number,
  className: PropTypes.string,
  onPolygonChange: PropTypes.func,
  onAddressSelect: PropTypes.func,
  overlapPlots: PropTypes.array,
  excludePlotId: PropTypes.string,
  onOverlapError: PropTypes.func,
}

export default LandPlotMap
