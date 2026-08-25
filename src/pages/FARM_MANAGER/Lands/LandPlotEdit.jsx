import React, { useCallback, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Alert, Button, Card, Col, Form, Row, Space, Spin } from "antd"
import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons"

import TitleCustom from "src/components/TitleCustom"
import LandPlotMap from "src/components/LandPlotMap"
import LandPlotService from "src/services/LandPlotService"
import { findOverlappingPlot, parseBoundaryJson } from "src/utils/geoJsonUtils"
import {
  MSG_LM_25,
  buildLandPlotPayload,
  ensureBoundaryString,
  isOverlapApiError,
  isLandPlotActive,
  isLandPlotCultivationLocked,
  normalizeApiDetail,
  normalizeLandPlotResponse,
} from "src/utils/landPlotUtils"
import { useLandPlotAccess } from "./hooks/useLandPlotAccess"
import { useLandPlotForm } from "./hooks/useLandPlotForm"
import LandPlotFormFields from "./components/LandPlotFormFields"
import { MEASUREMENT_UNITS } from "src/constants/measurementUnits"
import useFormDraft from "src/hooks/useFormDraft"
import { getFormDraftKey } from "src/utils/formDraftKeys"

// ─── Component ────────────────────────────────────────────────────────────────

const LandPlotEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { canManage, routes } = useLandPlotAccess()
  const [form] = Form.useForm()
  const storageKey = getFormDraftKey("land-plot", "edit", id)
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

  // ── State riêng: chi tiết vùng trồng đang sửa ─────────────────────────────
  const [plot, setPlot] = useState(null)
  const [plotLoading, setPlotLoading] = useState(true)
  const [plotError, setPlotError] = useState(null)
  const [existingPlots, setExistingPlots] = useState([])
  const [existingPlotsLoading, setExistingPlotsLoading] = useState(true)

  // Nếu không có quyền thì về trang danh sách
  useEffect(() => {
    if (!canManage) navigate(routes.list, { replace: true })
  }, [canManage, navigate, routes.list])

  // ── Fetch: chi tiết vùng trồng cần sửa ────────────────────────────────────
  const fetchPlotDetail = useCallback(async () => {
    if (!id) return
    try {
      setPlotLoading(true)
      setPlotError(null)
      const response = await LandPlotService.getLandPlotById(id)
      setPlot(normalizeApiDetail(response))
    } catch (err) {
      setPlotError(err)
    } finally {
      setPlotLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchPlotDetail()
  }, [fetchPlotDetail])

  // Điền sẵn giá trị form khi có dữ liệu
  useEffect(() => {
    if (!plot) return
    if (!isLandPlotActive(plot)) {
      navigate(routes.detail(id), { replace: true })
      return
    }
    const serverValues = {
      name: plot.name,
      area: plot.area,
      areaUnit: MEASUREMENT_UNITS.SQUARE_METER,
      address: plot.address,
      description: plot.description,
    }
    const draft = restoreDraft()
    form.setFieldsValue({ ...serverValues, ...(draft?.data || {}) })
  }, [plot, form, restoreDraft, navigate, routes, id])

  // ── Fetch: vùng trồng khác (kiểm tra chồng lấn, loại trừ chính mình) ─────
  const fetchExistingPlots = useCallback(async () => {
    if (!id) return
    try {
      setExistingPlotsLoading(true)
      const response = await LandPlotService.getLandPlots({
        PageIndex: 1,
        PageSize: 100,
      })
      const allPlots = normalizeLandPlotResponse(response).items
      const filtered = allPlots.filter(
        item => String(item.id || item._id) !== String(id),
      )

      const needsDetailFetch = filtered.some(
        item => !item.boundaryJson && !item.boundary && !item.geometry,
      )

      if (needsDetailFetch) {
        const results = await Promise.allSettled(
          filtered.map(async item => {
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
          r.status === "fulfilled" ? r.value : filtered[i],
        )
        setExistingPlots(enriched)
      } else {
        setExistingPlots(filtered)
      }
    } catch {
      // Không ảnh hưởng UX chính
    } finally {
      setExistingPlotsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchExistingPlots()
  }, [fetchExistingPlots])

  const cultivationLocked = isLandPlotCultivationLocked(plot)

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (cultivationLocked) return

    try {
      const values = await form.validateFields()

      // Ưu tiên polygon mới vẽ; nếu chưa vẽ lại thì giữ ranh giới cũ
      const boundary = ensureBoundaryString(
        polygonData?.boundaryJson || plot?.boundaryJson,
      )
      if (!boundary) {
        setMapError("Vui lòng vẽ hoặc giữ ranh giới vùng trồng trên bản đồ.")
        return
      }

      // Kiểm tra chồng lấn
      const geoJSON = polygonData?.geoJSON || parseBoundaryJson(boundary)
      if (findOverlappingPlot(geoJSON, existingPlots, id)) {
        setMapError(MSG_LM_25)
        return
      }

      // Gọi API cập nhật
      setIsSubmitting(true)
      try {
        const payload = buildLandPlotPayload(
          values,
          polygonData || { boundaryJson: boundary },
        )
        await LandPlotService.updateLandPlot(id, payload)

        clearDraft()
        navigate(routes.detail(id))
      } finally {
        setIsSubmitting(false)
      }
    } catch (err) {
      if (isOverlapApiError(err)) setMapError(MSG_LM_25)
    }
  }

  // ── Guard & Loading ────────────────────────────────────────────────────────
  if (!canManage) return null
  if (plotLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }
  if (plotError || !plot) {
    return (
      <div className="space-y-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(routes.list)}
        >
          Quay lại
        </Button>
        <Alert
          type="error"
          message="Không thể tải thông tin vùng trồng để chỉnh sửa."
          action={
            <Button size="small" onClick={fetchPlotDetail}>
              Thử lại
            </Button>
          }
        />
      </div>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Tiêu đề & nút lưu */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(routes.detail(id))}
          >
            Quay lại
          </Button>
          <TitleCustom className="!mb-0">Cập nhật vùng trồng</TitleCustom>
        </div>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          loading={isSaving}
          disabled={cultivationLocked}
          onClick={handleSubmit}
        >
          Lưu
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {/* Cột trái: form thông tin */}
        <Col xs={24} xl={10}>
          <Card title="Thông tin vùng trồng">
            {cultivationLocked && (
              <Alert
                className="mb-4"
                type="warning"
                message="Không thể chỉnh sửa vùng trồng"
                description="Vùng trồng đang thuộc nhật ký kế hoạch hoặc đang trồng. Chỉ có thể chỉnh sửa khi không còn nhật ký đang sử dụng."
              />
            )}
            <Form
              form={form}
              layout="vertical"
              onFieldsChange={handleFieldsChange}
              onValuesChange={(_, allValues) => saveDraft(allValues)}
            >
              <LandPlotFormFields disabled={cultivationLocked} />
            </Form>
          </Card>
        </Col>

        {/* Cột phải: bản đồ GIS */}
        <Col xs={24} xl={14}>
          <Card title="Chỉnh sửa bản đồ ranh giới">
            {mapError && (
              <Alert className="mb-3" type="error" message={mapError} />
            )}
            {existingPlotsLoading ? (
              <div
                className="flex flex-col items-center justify-center bg-gray-50 border border-gray-200 rounded text-gray-500 gap-3"
                style={{ height: 520 }}
              >
                <Spin size="large" />
                <span>Đang tải dữ liệu bản đồ...</span>
              </div>
            ) : (
              <LandPlotMap
                mode={cultivationLocked ? "view" : "edit"}
                height={520}
                boundaryJson={plot.boundaryJson}
                excludePlotId={id}
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
          <Button onClick={() => navigate(routes.detail(id))}>Hủy</Button>
          <Button
            disabled={cultivationLocked}
            type="primary"
            icon={<SaveOutlined />}
            loading={isSaving}
            onClick={handleSubmit}
          >
            Lưu
          </Button>
        </Space>
      </div>
    </div>
  )
}

export default LandPlotEdit
