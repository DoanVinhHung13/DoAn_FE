import { EyeOutlined, LockOutlined, SaveOutlined } from "@ant-design/icons"
import {
  Alert,
  Button,
  Image,
  Input,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from "antd"
import { useEffect, useMemo, useState } from "react"
import { formatAreaUnit } from "src/constants/measurementUnits"
import {
  loadLeaderCompileData,
  saveCompiledDescription,
  unwrap,
} from "./compileLogHelpers"

const { Text } = Typography
const { TextArea } = Input

const getMaterialId = item =>
  item?.fertilizerId || item?.pesticideId || item?.materialId || item?.id

const mapMaterialRows = (items = [], nameFallback) =>
  (Array.isArray(items) ? items : []).map((item, i) => ({
    key: item.id || item.taskId || String(i),
    materialId: getMaterialId(item),
    name:
      item.name ||
      item.fertilizerName ||
      item.pesticideName ||
      item.materialName ||
      `${nameFallback} ${i + 1}`,
    type: item.type || item.materialType || "",
    totalQuantity: item.totalQuantity ?? item.quantity ?? 0,
    unit: item.unit ?? item.quantityUnit ?? "",
    totalArea: item.totalArea ?? item.area ?? 0,
    areaUnit: formatAreaUnit(item.areaUnit),
    recommendationText: item.recommendationText,
    days: item.days ?? "—",
  }))

const fertColumns = [
  {
    title: "Phân bón",
    dataIndex: "name",
    key: "name",
    render: (v, r) => (
      <div className="flex items-center gap-2">
        <span className="font-medium text-gray-800">{v}</span>
        {r.type && (
          <Tag color="blue" className="rounded-full text-[11px] m-0">
            {r.type}
          </Tag>
        )}
      </div>
    ),
  },
  {
    title: "Tổng lượng",
    key: "qty",
    align: "right",
    render: (_, r) => (
      <span className="font-semibold text-blue-700">
        {r.totalQuantity}{" "}
        <span className="font-normal text-gray-500">{r.unit}</span>
      </span>
    ),
  },
  {
    title: "Diện tích",
    key: "area",
    align: "right",
    render: (_, r) =>
      r.totalArea > 0 ? (
        <span>
          {r.totalArea}{" "}
          <span className="text-gray-500">{formatAreaUnit(r.areaUnit)}</span>
        </span>
      ) : (
        <span className="text-gray-300">—</span>
      ),
  },
]

const pestColumns = [
  {
    title: "Nông dược",
    dataIndex: "name",
    key: "name",
    render: (v, r) => (
      <div className="flex items-center gap-2">
        <span className="font-medium text-gray-800">{v}</span>
        {r.type && (
          <Tag color="purple" className="rounded-full text-[11px] m-0">
            {r.type}
          </Tag>
        )}
      </div>
    ),
  },
  {
    title: "Tổng lượng",
    key: "qty",
    align: "right",
    render: (_, r) => (
      <span className="font-semibold text-purple-700">
        {r.totalQuantity}{" "}
        <span className="font-normal text-gray-500">{r.unit}</span>
      </span>
    ),
  },
  {
    title: "Diện tích",
    key: "area",
    align: "right",
    render: (_, r) =>
      r.totalArea > 0 ? (
        <span>
          {r.totalArea}{" "}
          <span className="text-gray-500">{formatAreaUnit(r.areaUnit)}</span>
        </span>
      ) : (
        <span className="text-gray-300">—</span>
      ),
  },
]

const otherColumns = [
  {
    title: "Vật tư",
    dataIndex: "name",
    key: "name",
    render: (v, r) => (
      <div className="flex items-center gap-2">
        <span className="font-medium text-gray-800">{v}</span>
        {r.type && (
          <Tag color="cyan" className="rounded-full text-[11px] m-0">
            {r.type}
          </Tag>
        )}
      </div>
    ),
  },
  {
    title: "Số lượng",
    key: "qty",
    align: "right",
    render: (_, r) => (
      <span className="font-semibold text-emerald-700">
        {r.totalQuantity}{" "}
        <span className="font-normal text-gray-500">{r.unit}</span>
      </span>
    ),
  },
]

/** Expand: thông tin Summary (ảnh, phân, thuốc, mô tả) + textarea Supervisor */
const SummaryCompilePanel = ({ task, stageId, onSaved, readOnly = false }) => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [leaderSummary, setLeaderSummary] = useState(null)
  const [description, setDescription] = useState("")

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      setLoading(true)
      try {
        const taskId =
          task?.taskId ||
          task?.id ||
          task?.cultivationTaskId ||
          task?.workTaskId
        const hasFullData =
          task &&
          (Array.isArray(task.fertilizers) ||
            Array.isArray(task.pesticides) ||
            Array.isArray(task.materials) ||
            Array.isArray(task.images) ||
            task.description ||
            task.descriptionSummary ||
            task.leaderSubmittedDescription ||
            task.draftDescription)

        let summaryObj = null
        let leaderDesc = ""

        if (hasFullData) {
          summaryObj = task.summary || task
          leaderDesc =
            summaryObj.leaderSubmittedDescription ||
            summaryObj.descriptionSummary ||
            summaryObj.description ||
            summaryObj.draftDescription ||
            ""
        } else if (taskId) {
          const fetched = await loadLeaderCompileData(taskId)
          if (cancelled) return
          summaryObj = fetched.summary
          leaderDesc =
            fetched.leaderSubmittedDescription ||
            fetched.summary?.descriptionSummary ||
            fetched.summary?.description ||
            ""
        }

        if (cancelled) return
        setLeaderSummary(summaryObj)

        setDescription(leaderDesc || summaryObj?.description || "")
      } catch {
        if (!cancelled) {
          setLeaderSummary(task)
          setDescription(task?.description || "")
          // axios interceptor handles error notification
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [task])

  const allMaterials = useMemo(() => {
    if (
      Array.isArray(leaderSummary?.materials) &&
      leaderSummary.materials.length > 0
    ) {
      return mapMaterialRows(leaderSummary.materials, "Vật tư")
    }
    return null
  }, [leaderSummary])

  const fertRows = useMemo(() => {
    if (allMaterials) {
      return allMaterials.filter(m => m.type.toLowerCase().includes("phân"))
    }
    return mapMaterialRows(leaderSummary?.fertilizers, "Phân")
  }, [allMaterials, leaderSummary])

  const pestRows = useMemo(() => {
    if (allMaterials) {
      return allMaterials.filter(m => m.type.toLowerCase().includes("thuốc"))
    }
    return mapMaterialRows(leaderSummary?.pesticides, "Nông dược")
  }, [allMaterials, leaderSummary])

  const fertilizerRecommendations = useMemo(
    () =>
      fertRows
        .map((row, index) => ({
          key: row.materialId || row.key || index,
          name: row.name,
          recommendation: row.recommendationText,
        }))
        .filter(item => item.recommendation),
    [fertRows],
  )

  const pesticideRecommendations = useMemo(
    () =>
      pestRows
        .map((row, index) => ({
          key: row.materialId || row.key || index,
          name: row.name,
          recommendation: row.recommendationText,
        }))
        .filter(item => item.recommendation),
    [pestRows],
  )

  const otherRows = useMemo(() => {
    if (allMaterials) {
      return allMaterials.filter(
        m =>
          !m.type.toLowerCase().includes("phân") &&
          !m.type.toLowerCase().includes("thuốc"),
      )
    }
    return []
  }, [allMaterials])

  const images = leaderSummary?.images || []
  const harvestQuantity = leaderSummary?.totalHarvestQuantity
  const harvestArea = Number(leaderSummary?.totalHarvestedArea || 0)

  const handleSave = async () => {
    const normalizedDescription = description?.trim() || ""
    if (!normalizedDescription) {
      message.error("Vui lòng nhập mô tả mới.")
      return
    }
    if (normalizedDescription.length > 200) {
      message.error("Mô tả tổng hợp không được vượt quá 200 ký tự.")
      return
    }
    try {
      setSaving(true)
      const targetStageId = stageId || task?.cultivationStageId || task?.stageId
      const taskId =
        task?.taskId || task?.cultivationTaskId || task?.workTaskId || task?.id
      if (!taskId) {
        message.error("Không xác định được công việc của bản tổng hợp.")
        return
      }

      await saveCompiledDescription(
        targetStageId,
        taskId,
        normalizedDescription,
      )
      onSaved?.()
    } catch {
      // axios interceptor handles error notification
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="py-8 text-center">
        <Spin tip="Đang tải bản tổng hợp..." />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="p-4 space-y-4 border border-gray-200 rounded-xl bg-gray-50/60">
        <div className="flex items-center justify-between">
          <Text strong className="text-gray-700">
            Thông tin bản tổng hợp (người phụ trách gửi)
          </Text>
          <Tag icon={<LockOutlined />} color="default" className="rounded-full">
            Chỉ đọc
          </Tag>
        </div>

        {images.length > 0 && (
          <div>
            <div className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Ảnh minh chứng ({images.length})
            </div>
            <Image.PreviewGroup
              items={images
                .map(img =>
                  typeof img === "string"
                    ? img
                    : img.url ||
                      img.imageUrl ||
                      img.fileUrl ||
                      img.path ||
                      img.src,
                )
                .filter(Boolean)}
            >
              <div className="flex flex-wrap gap-3">
                {images.map((img, idx) => {
                  const src =
                    typeof img === "string"
                      ? img
                      : img.url ||
                        img.imageUrl ||
                        img.fileUrl ||
                        img.path ||
                        img.src
                  const label = typeof img === "object" ? img.label : null
                  if (!src) return null
                  return (
                    <div
                      key={img.id || idx}
                      className="flex flex-col items-center"
                    >
                      <div className="h-20 w-20 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden cursor-pointer hover:border-green-400 hover:shadow-md transition-all duration-200 [&_.ant-image]:!h-full [&_.ant-image]:!w-full [&_.ant-image-img]:!h-full [&_.ant-image-img]:!w-full [&_.ant-image-img]:!object-cover">
                        <Image
                          src={src}
                          alt={label || `Ảnh ${idx + 1}`}
                          preview={{
                            src,
                            mask: (
                              <div className="flex items-center justify-center text-white text-[10px] font-semibold">
                                <EyeOutlined /> Xem
                              </div>
                            ),
                          }}
                        />
                      </div>
                      {label && (
                        <span className="mt-1 text-[11px] text-gray-500 max-w-[84px] truncate text-center font-medium">
                          {label}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </Image.PreviewGroup>
          </div>
        )}

        {(harvestQuantity != null || harvestArea > 0) && (
          <div className="p-3 border border-emerald-100 rounded-xl bg-emerald-50/70">
            <div className="mb-1 text-xs font-bold tracking-wide text-emerald-800 uppercase">
              Số liệu sản lượng
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              {harvestQuantity != null && (
                <span className="font-bold text-emerald-700">
                  {harvestQuantity} {leaderSummary?.harvestUnit || "kg"}
                </span>
              )}
              {harvestArea > 0 && (
                <span className="text-gray-600">· {harvestArea} m²</span>
              )}
            </div>
          </div>
        )}

        {fertRows.length > 0 && (
          <div>
            <div className="mb-2 font-semibold text-blue-800">
              Phân bón ({fertRows.length})
            </div>
            <Table
              columns={fertColumns}
              dataSource={fertRows}
              size="small"
              pagination={false}
              locale={{ emptyText: "Chưa ghi nhận phân bón" }}
              className="overflow-hidden border border-blue-100 rounded-xl"
            />
            {fertilizerRecommendations.length > 0 && (
              <Alert
                type="warning"
                className="mt-2 rounded-lg px-3 py-2 [&_.ant-alert-message]:text-sm [&_.ant-alert-description]:text-xs"
                message="Khuyến nghị lượng sử dụng phân bón"
                description={
                  <div className="space-y-0.5 leading-5">
                    {fertilizerRecommendations.map(item => (
                      <div key={item.key}>
                        {item.name}: nên dùng {item.recommendation}
                      </div>
                    ))}
                  </div>
                }
              />
            )}
          </div>
        )}

        {pestRows.length > 0 && (
          <div>
            <div className="mb-2 font-semibold text-purple-800">
              Nông dược ({pestRows.length})
            </div>
            <Table
              columns={pestColumns}
              dataSource={pestRows}
              size="small"
              pagination={false}
              locale={{ emptyText: "Chưa ghi nhận nông dược" }}
              className="overflow-hidden border border-purple-100 rounded-xl"
            />
            {pesticideRecommendations.length > 0 && (
              <Alert
                type="info"
                className="mt-3 rounded-xl"
                message="Khuyến nghị lượng sử dụng nông dược"
                description={
                  <div className="space-y-1">
                    {pesticideRecommendations.map(item => (
                      <div key={item.key}>
                        {item.name}: nên dùng {item.recommendation}
                      </div>
                    ))}
                  </div>
                }
              />
            )}
          </div>
        )}

        {otherRows.length > 0 && (
          <div>
            <div className="mb-2 font-semibold text-emerald-800">
              Vật tư khác ({otherRows.length})
            </div>
            <Table
              columns={otherColumns}
              dataSource={otherRows}
              size="small"
              pagination={false}
              locale={{ emptyText: "Chưa ghi nhận vật tư khác" }}
              className="overflow-hidden border rounded-xl border-emerald-100"
            />
          </div>
        )}

        {fertRows.length === 0 &&
          pestRows.length === 0 &&
          otherRows.length === 0 && (
            <div className="text-xs italic text-gray-400">
              Không có thông tin vật tư
            </div>
          )}

        <div>
          <div className="mb-1 text-xs font-semibold tracking-wide text-gray-500 uppercase">
            Mô tả từ người phụ trách
          </div>
          <div className="min-w-0 max-w-full p-3 text-sm font-medium text-blue-900 whitespace-pre-wrap break-words [overflow-wrap:anywhere] border border-blue-100 rounded-lg bg-blue-50">
            {leaderSummary?.leaderSubmittedDescription ||
              leaderSummary?.descriptionSummary ||
              leaderSummary?.description ||
              "—"}
          </div>
        </div>
      </div>

      <div className="p-4 border border-green-200 rounded-xl bg-green-50/30">
        <div className="flex items-center gap-2 mb-3">
          <span className="anticon anticon-edit text-green-600">
            <svg
              viewBox="64 64 896 896"
              focusable="false"
              data-icon="edit"
              width="1em"
              height="1em"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M257.7 752c2 0 4-.2 6-.5L431.9 722c2-.4 3.9-1.3 5.3-2.8l423.9-423.9a9.96 9.96 0 0 0 0-14.1L694.9 114.9a9.96 9.96 0 0 0-14.1 0L256.9 538.8c-1.5 1.4-2.4 3.3-2.8 5.3l-29.5 168.2a32.06 32.06 0 0 0 33.1 39.7zM306.1 574l42.2-42.2 97.4 97.4-42.2 42.2-97.4-97.4zm223.7-223.7l97.4 97.4-313 313-97.4-97.4 313-313zM290 224h240c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8H290c-116 0-210 94-210 210v288c0 116 94 210 210 210h288c116 0 210-94 210-210V500c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v166c0 73.9-60.1 134-134 134H290c-73.9 0-134-60.1-134-134V358c0-73.9 60.1-134 134-134z"></path>
            </svg>
          </span>
          <Text strong className="text-green-800">
            Viết lại mô tả (giám sát viên)
          </Text>
          {readOnly && (
            <Tag
              icon={<LockOutlined />}
              color="warning"
              className="rounded-full ml-auto"
            >
              Đã gửi — không thể chỉnh sửa
            </Tag>
          )}
        </div>
        <TextArea
          rows={5}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Nhập mô tả chuẩn để lưu vào nhật ký..."
          className="rounded-lg"
          disabled={readOnly}
        />
        {!readOnly && (
          <div className="flex justify-end mt-4">
            <Button
              type="primary"
              icon={<SaveOutlined />}
              loading={saving}
              onClick={handleSave}
              className="px-6 font-semibold bg-green-600 border-green-600 rounded-lg h-9 hover:!bg-green-700"
            >
              Lưu
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default SummaryCompilePanel
