import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons"
import { Alert, Button, Card, Col, Form, Row, Space, Spin } from "antd"
import { useCallback, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import LandPlotMap from "src/components/LandPlotMap"
import TitleCustom from "src/components/TitleCustom"
import { MEASUREMENT_UNITS } from "src/constants/measurementUnits"
import LandPlotService from "src/services/LandPlotService"
import { findOverlappingPlot } from "src/utils/geoJsonUtils"
import LandPlotFormFields from "./components/LandPlotFormFields"
import {
  buildLandPlotPayload,
  isOverlapApiError,
  MSG_LM_25,
  normalizeApiDetail,
  normalizeLandPlotResponse,
} from "src/utils/landPlotUtils"
import { useLandPlotAccess } from "./hooks/useLandPlotAccess"
import { useLandPlotForm } from "./hooks/useLandPlotForm"
import useFormDraft from "src/hooks/useFormDraft"
import { getFormDraftKey } from "src/utils/formDraftKeys"

// ─── Component ────────────────────────────────────────────────────────────────

const LandPlotCreate = () => {
  const navigate = useNavigate()
  const { canManage, routes } = useLandPlotAccess()
  const [form] = Form.useForm()
  const storageKey = getFormDraftKey("land-plot", "create")
  const { saveDraft, clearDraft, restoreDraft } = useFormDraft({
    form,
    storageKey,
  })

  // ── Hook: logic form chung ─────────────────────────────────────────────────
  const {
    polygonData,
    mapError,
    isSaving,
    hasFormErrors,
    handleFieldsChange,
    setMapError,
    setIsSubmitting,
    handlePolygonChange,
  } = useLandPlotForm(form)

  // ── State riêng: vùng trồng hiện có (kiểm tra chồng lấn) ─────────────────
  const [existingPlots, setExistingPlots] = useState([])
  const [loadingPlots, setLoadingPlots] = useState(true)

  useEffect(() => {
    form.setFieldValue("areaUnit", MEASUREMENT_UNITS.SQUARE_METER)
  }, [form])

  useEffect(() => {
    const draft = restoreDraft()
    if (draft?.data) {
      form.setFieldsValue({
        areaUnit: MEASUREMENT_UNITS.SQUARE_METER,
        ...draft.data,
      })
    }
  }, [form, restoreDraft])

  // Nếu không có quyền thì về trang danh sách
  useEffect(() => {
    if (!canManage) navigate(routes.list, { replace: true })
  }, [canManage, navigate, routes.list])

  // ── Fetch: vùng trồng hiện có (kiểm tra chồng lấn) ────────────────────────
  const fetchExistingPlots = useCallback(async () => {
    try {
      setLoadingPlots(true)
      const response = await LandPlotService.getLandPlots({
        PageIndex: 1,
        PageSize: 100,
      })
      const items = normalizeLandPlotResponse(response).items

      const needsDetailFetch = items.some(
        item => !item.boundaryJson && !item.boundary && !item.geometry,
      )

      if (needsDetailFetch) {
        const results = await Promise.allSettled(
          items.map(async item => {
            if (item.boundaryJson || item.boundary || item.geometry) {
              return item
            }
            if (item.id) {
              try {
                const res = await LandPlotService.getLandPlotById(item.id)
                const detail = normalizeApiDetail(res)
                return { ...item, ...detail }
              } catch {
                return item
              }
            }
            return item
          }),
        )
        const enriched = results.map((r, i) =>
          r.status === "fulfilled" ? r.value : items[i],
        )
        setExistingPlots(enriched)
      } else {
        setExistingPlots(items)
      }
    } catch {
      // Existing plots are best-effort data for overlap validation.
    } finally {
      setLoadingPlots(false)
    }
  }, [])

  useEffect(() => {
    fetchExistingPlots()
  }, [fetchExistingPlots])

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      if (!polygonData?.boundaryJson) {
        setMapError("Vui lòng vẽ ranh giới vùng trồng trên bản đồ.")
        return
      }
      if (findOverlappingPlot(polygonData.geoJSON, existingPlots)) {
        setMapError(MSG_LM_25)
        return
      }

      setIsSubmitting(true)
      try {
        const payload = buildLandPlotPayload(values, polygonData)
        await LandPlotService.createLandPlot(payload)

        clearDraft()
        navigate(routes.list)
      } finally {
        setIsSubmitting(false)
      }
    } catch (err) {
      if (isOverlapApiError(err)) setMapError(MSG_LM_25)
    }
  }

  // ── Guard ────────────────────────────────────────────────────────────────
  if (!canManage) return null

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Tiêu đề & nút lưu */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(routes.list)}
          >
            Quay lại
          </Button>
          <TitleCustom className="!mb-0">Tạo mới vùng trồng</TitleCustom>
        </div>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={isSaving}
          onClick={handleSubmit}
        >
          Xác nhận
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {/* Cột trái: form thông tin */}
        <Col xs={24} xl={10}>
          <Card title="Thông tin vùng trồng">
            <Form
              form={form}
              layout="vertical"
              onFieldsChange={handleFieldsChange}
              onValuesChange={(_, allValues) => saveDraft(allValues)}
            >
              <LandPlotFormFields showAreaPlaceholder />
            </Form>
          </Card>
        </Col>

        {/* Cột phải: bản đồ GIS */}
        <Col xs={24} xl={14}>
          <Card
            title={
              <span>
                Bản đồ ranh giới (GIS) <span className="text-red-500">*</span>
              </span>
            }
          >
            {mapError && (
              <Alert className="mb-3" type="error" message={mapError} />
            )}
            {loadingPlots ? (
              <div
                className="flex flex-col items-center justify-center bg-gray-50 border border-gray-200 rounded text-gray-500 gap-3"
                style={{ height: 520 }}
              >
                <Spin size="large" />
                <span>Đang tải dữ liệu bản đồ...</span>
              </div>
            ) : (
              <LandPlotMap
                mode="draw"
                height={520}
                overlapPlots={existingPlots}
                onPolygonChange={handlePolygonChange}
                onAddressSelect={({ address, latitude, longitude }) => {
                  if (address)
                    form.setFieldsValue({ address, latitude, longitude })
                }}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Nút hành động cuối trang */}
      <div className="flex justify-end">
        <Space>
          <Button onClick={() => navigate(routes.list)}>Hủy</Button>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            loading={isSaving}
            onClick={handleSubmit}
          >
            Xác nhận
          </Button>
        </Space>
      </div>
    </div>
  )
}

export default LandPlotCreate
