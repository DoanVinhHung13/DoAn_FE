import React, { useEffect, useRef, useCallback, useState } from 'react'
import PropTypes from 'prop-types'
import { Input, Spin } from 'antd'
import { EnvironmentOutlined, SearchOutlined } from '@ant-design/icons'
import L from 'src/lib/map/leafletGeoman'
import {
  calculatePolygonArea,
  createGeoJSONPolygon,
  findOverlappingPlot,
  formatArea,
  geoJSONToLeafletPositions,
  parseBoundaryJson,
} from 'src/utils/geoJsonUtils'
import { MSG_LM_25 } from 'src/pages/FARM_MANAGER/Lands/landPlotUtils'
import { searchAddress } from 'src/utils/geocodingUtils'
import './styles.css'

const DEFAULT_CENTER = [21.0285, 105.8542]
const DEFAULT_ZOOM = 13
const SEARCH_ZOOM = 16
const MAP_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

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

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [overlapError, setOverlapError] = useState('')
  const [showResults, setShowResults] = useState(false)

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
      const overlapping = findOverlappingPlot(
        geoJSON,
        overlapPlotsRef.current,
        excludePlotIdRef.current,
      )

      if (overlapping) {
        const plotLabel = overlapping.name || overlapping.code || 'lô đất khác'
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

    if (mode === 'draw' || mode === 'edit') {
      map.pm.addControls({
        position: 'topleft',
        drawMarker: false,
        drawCircleMarker: false,
        drawPolyline: false,
        drawRectangle: true,
        drawPolygon: true,
        drawCircle: false,
        editMode: mode === 'edit',
        dragMode: mode === 'edit',
        cutPolygon: false,
        removalMode: mode !== 'view',
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

      const handleCreate = (e) => {
        const { layer, shape } = e
        if (shape !== 'Polygon' && shape !== 'Rectangle') return

        clearActiveLayer()
        activeLayer.current = layer
        layer.setStyle({ color, fillColor: color, fillOpacity: 0.25 })

        const latLngs = layer.getLatLngs()[0]
        const geoJSON = createGeoJSONPolygon(latLngs)
        validatePolygon(geoJSON, layer, { isDraw: true })
      }

      const handleEdit = (e) => {
        const { layer } = e
        if (!layer?.getLatLngs) return
        const latLngs = layer.getLatLngs()[0]
        const geoJSON = createGeoJSONPolygon(latLngs)
        validatePolygon(geoJSON, layer)
      }

      const handleRemove = () => {
        activeLayer.current = null
        lastValidGeoJSON.current = null
        setOverlapError('')
        onPolygonChangeRef.current?.(null)
      }

      map.on('pm:create', handleCreate)
      map.on('pm:edit', handleEdit)
      map.on('pm:dragend', handleEdit)
      map.on('pm:remove', handleRemove)
    }

    mapInstance.current = map

    return () => {
      map.remove()
      mapInstance.current = null
      activeLayer.current = null
      searchMarkerRef.current = null
      locateMarkerRef.current = null
    }
  }, [mode, color, clearActiveLayer, validatePolygon])

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
          `${plot.name || plot.code || 'Lô đất khác'} (đã đăng ký)`,
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

    if (mode === 'edit') {
      layer.pm?.enable({
        allowSelfIntersection: false,
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

  const handleAddressSearch = async (value) => {
    const keyword = (value ?? searchQuery).trim()
    if (!keyword) {
      setSearchError('Vui lòng nhập địa chỉ cần tìm.')
      return
    }

    setSearchLoading(true)
    setSearchError('')
    setShowResults(true)

    try {
      const results = await searchAddress(keyword)
      setSearchResults(results)
      if (!results.length) {
        setSearchError('Không tìm thấy địa chỉ phù hợp. Hãy thử từ khóa khác.')
      }
    } catch (error) {
      setSearchResults([])
      setSearchError(error.message || 'Không thể tìm kiếm địa chỉ.')
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSelectResult = (result) => {
    setSearchQuery(result.label)
    setShowResults(false)
    setSearchResults([])
    flyToLocation(result.latitude, result.longitude, result.label)
    onAddressSelectRef.current?.({
      address: result.label,
      latitude: result.latitude,
      longitude: result.longitude,
    })
  }

  const handleLocate = () => {
    if (!navigator.geolocation || !mapInstance.current) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
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

  return (
    <div className={`land-plot-map ${className}`}>
      <div className="land-plot-map__toolbar">
        <div className="land-plot-map__search">
          <Input
            allowClear
            prefix={<SearchOutlined className="text-slate-400" />}
            placeholder="Tìm địa chỉ, xã, huyện, tỉnh..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setSearchError('')
              if (!e.target.value) {
                setSearchResults([])
                setShowResults(false)
              }
            }}
            onPressEnter={() => handleAddressSearch()}
            onFocus={() => {
              if (searchResults.length) setShowResults(true)
            }}
          />
          <button
            type="button"
            className="land-plot-map__search-btn"
            onClick={() => handleAddressSearch()}
            disabled={searchLoading}
          >
            {searchLoading ? 'Đang tìm...' : 'Tìm'}
          </button>
        </div>

        <button type="button" className="land-plot-map__locate" onClick={handleLocate}>
          <EnvironmentOutlined /> GPS
        </button>
      </div>

      {(mode === 'draw' || mode === 'edit') && (
        <div className="land-plot-map__hint-bar">
          Tìm địa chỉ để di chuyển bản đồ. Vùng nét đứt là lô đất đã có — không được vẽ chồng lên.
        </div>
      )}

      {overlapError && (
        <div className="land-plot-map__search-error">{overlapError}</div>
      )}

      {searchError && (
        <div className="land-plot-map__search-error">{searchError}</div>
      )}

      {showResults && searchResults.length > 0 && (
        <ul className="land-plot-map__search-results">
          {searchResults.map((result) => (
            <li key={result.id}>
              <button type="button" onClick={() => handleSelectResult(result)}>
                <EnvironmentOutlined />
                <span>{result.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {searchLoading && (
        <div className="land-plot-map__search-loading">
          <Spin size="small" /> Đang tìm địa chỉ...
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
