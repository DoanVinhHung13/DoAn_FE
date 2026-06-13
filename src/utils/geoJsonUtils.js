import booleanOverlap from '@turf/boolean-overlap'
import booleanContains from '@turf/boolean-contains'
import { polygon as turfPolygon } from '@turf/helpers'

export function leafletLatLngsToGeoJSON(leafletLatLngs) {
  return leafletLatLngs.map((latLng) => [latLng.lng, latLng.lat])
}

export function createGeoJSONPolygon(leafletLatLngs) {
  const geoJSONCoords = leafletLatLngsToGeoJSON(leafletLatLngs)
  const firstPoint = geoJSONCoords[0]
  const lastPoint = geoJSONCoords[geoJSONCoords.length - 1]
  const isClosed =
    firstPoint[0] === lastPoint[0] && firstPoint[1] === lastPoint[1]
  const ring = isClosed ? geoJSONCoords : [...geoJSONCoords, firstPoint]

  return {
    type: 'Polygon',
    coordinates: [ring],
  }
}

export function calculatePolygonArea(geoJSONCoords) {
  const ring = geoJSONCoords[0]
  if (!ring || ring.length < 4) return 0

  const R = 6371000
  let area = 0

  for (let i = 0; i < ring.length - 1; i++) {
    const [lng1, lat1] = ring[i]
    const [lng2, lat2] = ring[i + 1]
    area +=
      ((lng2 - lng1) * Math.PI) / 180 *
      (2 + Math.sin((lat1 * Math.PI) / 180) + Math.sin((lat2 * Math.PI) / 180))
  }

  return Math.abs((area * R * R) / 2)
}

export function formatArea(areaM2, unit = 'm2') {
  if (unit === 'ha' || areaM2 >= 10000) {
    return `${(areaM2 / 10000).toFixed(2)} ha`
  }
  return `${Math.round(areaM2).toLocaleString('vi-VN')} m²`
}

export function geoJSONToLeafletPositions(coordinates) {
  return coordinates[0].map(([lng, lat]) => [lat, lng])
}

export function parseBoundaryJson(boundaryJson) {
  if (!boundaryJson) return null
  if (typeof boundaryJson === 'object') return boundaryJson
  try {
    return JSON.parse(boundaryJson)
  } catch {
    return null
  }
}

export function getPolygonCenter(geoJSON) {
  const ring = geoJSON?.coordinates?.[0]
  if (!ring?.length) return null

  let sumLat = 0
  let sumLng = 0
  const points = ring[ring.length - 1][0] === ring[0][0] && ring[ring.length - 1][1] === ring[0][1]
    ? ring.slice(0, -1)
    : ring

  points.forEach(([lng, lat]) => {
    sumLng += lng
    sumLat += lat
  })

  return {
    latitude: sumLat / points.length,
    longitude: sumLng / points.length,
  }
}

export function areaToHectares(areaM2) {
  return Number((areaM2 / 10000).toFixed(4))
}

export function toTurfPolygon(geoJSON) {
  if (!geoJSON?.coordinates?.[0]?.length) return null
  try {
    return turfPolygon(geoJSON.coordinates)
  } catch {
    return null
  }
}

/**
 * Kiểm tra polygon mới có chồng lấn với lô đất đã tồn tại hay không.
 * Chỉ chặn overlap thực sự (không chặn chạm cạnh).
 */
export function findOverlappingPlot(newGeoJSON, existingPlots = [], excludePlotId = null) {
  if (!newGeoJSON?.coordinates) return null

  const newPoly = toTurfPolygon(newGeoJSON)
  if (!newPoly) return null

  for (const plot of existingPlots) {
    const plotId = plot?.id || plot?._id || plot?.landPlotId
    if (excludePlotId && plotId === excludePlotId) continue

    const existingGeoJSON = parseBoundaryJson(plot.boundaryJson)
    if (!existingGeoJSON?.coordinates) continue

    const existingPoly = toTurfPolygon(existingGeoJSON)
    if (!existingPoly) continue

    try {
      const overlaps =
        booleanOverlap(newPoly, existingPoly) ||
        booleanContains(newPoly, existingPoly) ||
        booleanContains(existingPoly, newPoly)

      if (overlaps) return plot
    } catch {
      continue
    }
  }

  return null
}
