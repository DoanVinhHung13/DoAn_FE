import {
  ExperimentOutlined,
  FileImageOutlined,
  InboxOutlined,
} from "@ant-design/icons"
import { Image, Typography } from "antd"
import { formatDate } from "src/utils/dateFormatters"
import { getUserDisplayName } from "src/utils/userDisplayName"
import { asList } from "./reviewHelpers"

const { Paragraph } = Typography

const LogEntry = ({ log }) => {
  const summary = log.summary || log.officialLog || {}

  const taskName =
    log.cultivationTaskName ||
    log.taskName ||
    log.name ||
    summary.taskName ||
    summary.name ||
    ""

  const description =
    summary.supervisorDescription ||
    log.supervisorDescription ||
    summary.descriptionSummary ||
    log.descriptionSummary ||
    summary.description ||
    log.description ||
    ""

  const materialsText = summary.materialsText || log.materialsText || ""
  const isHarvestMaterialsText = /(?:sản lượng|thu hoạch)/i.test(materialsText)

  const workStartDate =
    log.workStartDate || summary.workStartDate || log.startDate
  const workEndDate = log.workEndDate || summary.workEndDate

  const editedBy = getUserDisplayName(
    summary.supervisorEditorName,
    log.supervisorEditorName,
  )
  const editedAt = summary.editedAt || log.editedAt || log.updatedAt

  const totalFertilizers = asList(
    summary.totalFertilizers ||
      summary.fertilizers ||
      log.totalFertilizers ||
      log.fertilizers,
  )
  const totalPesticides = asList(
    summary.totalPesticides ||
      summary.pesticides ||
      log.totalPesticides ||
      log.pesticides,
  )

  const rawImages = asList(summary.images).length
    ? asList(summary.images)
    : asList(log.images || log.attachmentImages)

  const images = rawImages
    .map(img => {
      if (typeof img === "string") return img
      return img.url || img.imageUrl || img.filePath || img.path || null
    })
    .filter(Boolean)

  return (
    <div className="flex gap-3">
      {/* ── Timeline Marker ── */}
      <div className="flex flex-col items-center shrink-0 w-6">
        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm mt-2 z-10" />
        <div className="w-0.5 flex-1 bg-emerald-300 mt-1" />
      </div>

      {/* ── Log Content ── */}
      <div className="flex-1 py-2 pb-4 transition-colors">
        {taskName && (
          <div className="mb-1 text-sm font-bold text-gray-800">{taskName}</div>
        )}

        {(workStartDate || workEndDate) && (
          <div className="mb-2 text-sm font-semibold text-gray-800">
            {workStartDate && formatDate(workStartDate)}
            {workEndDate && ` - ${formatDate(workEndDate)}`}
          </div>
        )}

        {(editedBy || editedAt) && (
          <div className="mb-2 text-xs text-gray-500">
            {editedBy && `Cập nhật bởi ${editedBy}`}
            {editedAt && ` · ${formatDate(editedAt)}`}
          </div>
        )}

        {description && (
          <Paragraph className="!mb-1 !mt-0 min-w-0 max-w-full text-sm text-gray-700 whitespace-pre-wrap break-words [overflow-wrap:anywhere] leading-relaxed">
            {description}
          </Paragraph>
        )}

        {materialsText && (
          <div
            className={`p-3 mb-3 rounded-lg ${
              isHarvestMaterialsText
                ? "border border-emerald-100 bg-emerald-50/70"
                : "border border-blue-100 bg-blue-50/50"
            }`}
          >
            <div
              className={`mb-1.5 flex items-center gap-1 text-[11px] font-bold uppercase ${
                isHarvestMaterialsText ? "text-emerald-800" : "text-blue-800"
              }`}
            >
              {isHarvestMaterialsText ? (
                <InboxOutlined className="text-emerald-600" />
              ) : (
                <ExperimentOutlined className="text-blue-600" />
              )}
              {isHarvestMaterialsText ? "Sản lượng:" : "Vật tư sử dụng:"}
            </div>
            <Paragraph
              className={`!mb-0 !mt-0 min-w-0 max-w-full text-sm whitespace-pre-wrap break-words [overflow-wrap:anywhere] leading-relaxed ${
                isHarvestMaterialsText ? "text-emerald-700" : "text-gray-700"
              }`}
            >
              {materialsText}
            </Paragraph>
          </div>
        )}

        {(totalFertilizers.length > 0 || totalPesticides.length > 0) && (
          <div className="p-3 my-2 bg-gray-50 border border-gray-200 rounded-lg">
            {totalFertilizers.length > 0 && (
              <div className="mb-2">
                <p className="mb-1 text-xs font-medium text-gray-500">
                  <ExperimentOutlined className="mr-1 text-blue-600" />
                  Phân bón:
                </p>
                <div className="space-y-1">
                  {totalFertilizers.map((fert, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-xs text-gray-700"
                    >
                      <span className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0" />
                      <span className="font-medium">
                        {fert.name || fert.fertilizerName || fert.materialName}
                      </span>
                      <span className="text-gray-400">-</span>
                      <span className="font-medium text-blue-700">
                        {fert.quantity || fert.totalQuantity}{" "}
                        {fert.unit || fert.quantityUnit || "kg"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {totalPesticides.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium text-gray-500">
                  <ExperimentOutlined className="mr-1 text-purple-600" />
                  Nông dược:
                </p>
                <div className="space-y-1">
                  {totalPesticides.map((pest, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-xs text-gray-700"
                    >
                      <span className="w-1.5 h-1.5 bg-purple-500 rounded-full shrink-0" />
                      <span className="font-medium">
                        {pest.name || pest.pesticideName || pest.materialName}
                      </span>
                      <span className="text-gray-400">-</span>
                      <span className="font-medium text-purple-700">
                        {pest.quantity || pest.totalQuantity}{" "}
                        {pest.unit || pest.quantityUnit || "lít"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {images.length > 0 && (
          <div className="mt-2">
            <p className="mb-1.5 text-xs font-semibold text-gray-500">
              <FileImageOutlined className="mr-1" />
              Ảnh minh chứng ({images.length})
            </p>
            <Image.PreviewGroup items={images}>
              <div className="flex flex-wrap gap-2">
                {images.map((src, i) => (
                  <div
                    key={i}
                    className="h-16 w-16 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden cursor-pointer hover:border-emerald-400 hover:shadow-md transition-all [&_.ant-image]:!h-full [&_.ant-image]:!w-full [&_.ant-image-img]:!h-full [&_.ant-image-img]:!w-full [&_.ant-image-img]:!object-cover"
                  >
                    <Image src={src} preview={{ src }} />
                  </div>
                ))}
              </div>
            </Image.PreviewGroup>
          </div>
        )}
      </div>
    </div>
  )
}

export default LogEntry
