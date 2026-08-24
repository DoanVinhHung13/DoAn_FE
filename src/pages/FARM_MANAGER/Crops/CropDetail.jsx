import React, { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import {
  Alert,
  Button,
  Card,
  Col,
  Descriptions,
  Empty,
  Row,
  Space,
  Spin,
  Typography,
} from "antd"
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  EditOutlined,
  StopOutlined,
} from "@ant-design/icons"
import { Sprout } from "lucide-react"

import TitleCustom from "src/components/TitleCustom"
import { CropIcon } from "src/assets/icon/menu/MenuIcons"
import CropManagementService from "src/services/CropManagementService"
import ROUTER from "src/router/ROUTER"
import { displayValue } from "src/utils/helpers"
import { useSystemKey } from "src/hooks/useSystemKey"
import { SYSTEM_KEY } from "src/constants/systemKey"

const { Text, Paragraph } = Typography

const CropDetail = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const { getDescription } = useSystemKey()

  const [cropDetail, setCropDetail] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  const fetchCropDetail = async () => {
    if (!id) return
    setIsLoading(true)
    setIsError(false)
    try {
      const response = await CropManagementService.getCropById(id, {
        errorHandling: "component",
      })
      const payload = response?.data
      setCropDetail(payload?.data ?? payload)
    } catch {
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCropDetail()
  }, [id])

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTER.FM_CROPS)}
            className="h-10"
          >
            Quay lại
          </Button>
          <TitleCustom className="!mb-0">Chi tiết cây trồng</TitleCustom>
        </div>
        <Alert
          type="error"
          message="Không thể tải thông tin cây trồng."
          action={
            <Button size="small" onClick={fetchCropDetail}>
              Thử lại
            </Button>
          }
        />
      </div>
    )
  }

  if (!cropDetail) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTER.FM_CROPS)}
            className="h-10"
          >
            Quay lại
          </Button>
          <TitleCustom className="!mb-0">Chi tiết cây trồng</TitleCustom>
        </div>
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không tìm thấy thông tin cây trồng."
          />
        </Card>
      </div>
    )
  }

  const isActive = Boolean(cropDetail.isActive)
  const catalogName = cropDetail.cropCatalogName || cropDetail.cropCatalog?.name

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTER.FM_CROPS)}
            className="h-10 rounded-lg"
          >
            Quay lại
          </Button>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <CropIcon style={{ fontSize: "24px", color: "#15803d" }} />
            Chi tiết cây trồng
          </TitleCustom>
        </div>
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => navigate(`${ROUTER.FM_CROPS}/${id}/edit`)}
            className="h-10 rounded-lg bg-green-500 font-semibold shadow-lg shadow-green-100"
          >
            Chỉnh sửa
          </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {/* Left Column - Basic Info & Description */}
        <Col xs={24} lg={14}>
          <Space direction="vertical" size={24} className="w-full">
            {/* Basic Information */}
            <Card
              title={
                <span className="flex items-center gap-2 text-lg font-semibold text-green-600">
                  <Sprout className="h-5 w-5" />
                  Thông tin cơ bản
                </span>
              }
              className="rounded-lg shadow-sm"
            >
              <Descriptions
                column={1}
                size="middle"
                className="[&_.ant-descriptions-item-label]:w-[180px]"
              >
                <Descriptions.Item label="Tên cây trồng">
                  <Text strong className="text-base text-gray-900">
                    {displayValue(cropDetail.name)}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Danh mục">
                  <span className="font-medium text-gray-800">
                    {displayValue(catalogName)}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <div
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                      isActive
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-600"
                    }`}
                  >
                    {isActive ? <CheckCircleOutlined /> : <StopOutlined />}
                    {getDescription(
                      SYSTEM_KEY.STATUS,
                      isActive ? "ACTIVE" : "INACTIVE",
                    )}
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {/* Description */}
            <Card
              title={
                <span className="text-lg font-semibold text-green-600">
                  Mô tả
                </span>
              }
              className="rounded-lg shadow-sm"
            >
              {cropDetail.description ? (
                <Paragraph className="mb-0 min-w-0 max-w-full whitespace-pre-wrap break-words [overflow-wrap:anywhere] text-gray-700">
                  {cropDetail.description}
                </Paragraph>
              ) : (
                <Text type="secondary" italic>
                  Chưa có mô tả cho cây trồng này.
                </Text>
              )}
            </Card>
          </Space>
        </Col>

        {/* Right Column - Crop Image */}
        <Col xs={24} lg={10}>
          <Card
            title={
              <span className="text-lg font-semibold text-green-600">
                Ảnh minh họa
              </span>
            }
            className="rounded-lg shadow-sm"
          >
            {cropDetail.imageUrl ? (
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <img
                  src={cropDetail.imageUrl}
                  alt={displayValue(cropDetail.name)}
                  className="h-[320px] w-full object-cover"
                />
              </div>
            ) : (
              <div className="flex h-[320px] items-center justify-center rounded-xl border border-gray-200 bg-green-50">
                <Sprout className="h-24 w-24 text-green-300" />
              </div>
            )}
          </Card>
        </Col>
      </Row>


    </div>
  )
}

export default CropDetail
