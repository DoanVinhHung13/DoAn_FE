import assert from 'node:assert/strict'
import test from 'node:test'
import { getApiData, getCatalogPrefill } from '../src/services/CatalogSuggestionService/response.js'
import {
  createFertilizerComponentRow,
  mapCatalogCompositionsToRows,
  normalizeFertilizerCatalogCompositions,
} from '../src/services/CatalogSuggestionService/compositions.js'
import { extractPesticideActiveIngredient, extractPesticideTarget } from '../src/utils/pesticideCatalogDisplay.js'

test('unwraps ApiResponse data to a fertilizer prefill object', () => {
  const prefill = { name: 'AC-Amino Bo', compositions: [{ name: 'N', value: 3, unit: '%' }] }
  assert.deepEqual(getCatalogPrefill({ success: true, data: prefill }), prefill)
  assert.deepEqual(getCatalogPrefill({ data: { success: true, data: prefill } }), prefill)
  assert.deepEqual(getApiData({ success: true, data: [{ id: '1' }] }), [{ id: '1' }])
})

test('normalizes camelCase and PascalCase compositions without creating placeholder values', () => {
  assert.deepEqual(normalizeFertilizerCatalogCompositions([
    { name: ' N ', value: 3, unit: ' % ' },
    { Name: 'P2O5', Value: 0, Unit: '%' },
    { name: '', value: 0, unit: '%' },
    { name: 'Invalid', value: 'not-a-number', unit: '%' },
  ]), [
    { name: 'N', value: 3, unit: '%' },
    { name: 'P2O5', value: 0, unit: '%' },
  ])
})

test('preserves the complete AN-OGR composition list', () => {
  const source = [
    { name: 'HC', value: 15, unit: '%' },
    { name: 'N', value: 6, unit: '%' },
    { name: 'P2O5', value: 3, unit: '%' },
    { name: 'K2O', value: 6, unit: '%' },
  ]
  assert.equal(normalizeFertilizerCatalogCompositions(source).length, source.length)
})

test('maps catalog compositions to keyed rows without placeholders', () => {
  const rows = mapCatalogCompositionsToRows([
    { name: 'HC', value: 15, unit: '%' },
    { name: 'N', value: 6, unit: '%' },
    { name: 'P2O5', value: 3, unit: '%' },
    { name: 'K2O', value: 6, unit: '%' },
  ])
  assert.equal(rows.length, 4)
  assert.equal(new Set(rows.map(row => row.id)).size, 4)
  assert.deepEqual(rows.map(({ name, value, unit }) => ({ name, value, unit })), [
    { name: 'HC', value: 15, unit: '%' },
    { name: 'N', value: 6, unit: '%' },
    { name: 'P2O5', value: 3, unit: '%' },
    { name: 'K2O', value: 6, unit: '%' },
  ])
  assert.equal(createFertilizerComponentRow().value, null)
})

test('extracts pesticide active ingredient and target from the catalog description', () => {
  const description = 'Amani 70WP là thuốc trừ ốc, chứa hoạt chất Niclosamide-olamine (min 98%). Sản phẩm được đăng ký cho các đối tượng phòng trừ/cây trồng sau: ốc bươu vàng/ lúa. Đơn vị đề nghị đăng ký trong dữ liệu nguồn: Công ty.'
  assert.equal(extractPesticideActiveIngredient(description), 'Niclosamide-olamine (min 98%)')
  assert.equal(extractPesticideTarget(description), 'ốc bươu vàng/ lúa')
})
