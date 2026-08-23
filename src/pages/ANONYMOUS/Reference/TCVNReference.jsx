import React, { useMemo, useState, useEffect, useCallback } from "react"
import { Table, Input, Typography, Tag, Card, Button, Breadcrumb } from "antd"
import {
  SearchOutlined,
  BookOutlined,
  InfoCircleOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons"
import api from "src/services/01_axios"
import { useNavigate } from "react-router-dom"
import ROUTER from "src/router/ROUTER"
import TableCustom from "src/components/Table/CustomTable"

const { Title, Text, Paragraph } = Typography

const TCVNReference = () => {
  const navigate = useNavigate()
  const [searchText, setSearchText] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const [tcvns, setTcvns] = useState([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchTcvns = useCallback(async () => {
    setIsLoading(true)
    try {
      const { data } = await api.get(
        `/tcvn${searchText ? `?keyword=${searchText}` : ""}`,
      )
      setTcvns(data.data || [])
    } catch {
      setTcvns([])
    } finally {
      setIsLoading(false)
    }
  }, [searchText])

  useEffect(() => {
    fetchTcvns()
  }, [fetchTcvns])

  const visiblePage = Math.min(
    currentPage,
    Math.max(1, Math.ceil(tcvns.length / pageSize)),
  )

  const paginatedTcvns = useMemo(
    () => tcvns.slice((visiblePage - 1) * pageSize, visiblePage * pageSize),
    [pageSize, tcvns, visiblePage],
  )

  const columns = [
    {
      title: "Mã TCVN",
      dataIndex: "code",
      key: "code",
      render: text => (
        <Tag color="blue" className="font-bold">
          {text}
        </Tag>
      ),
      width: "150px",
    },
    {
      title: "Tên tiêu chuẩn",
      dataIndex: "name",
      key: "name",
      render: text => <Text className="font-bold">{text}</Text>,
    },
    {
      title: "Lĩnh vực",
      dataIndex: "category",
      key: "category",
      render: text => <Tag color="green">{text}</Tag>,
      width: "200px",
    },
    {
      title: "Nội dung tóm tắt",
      dataIndex: "summary",
      key: "summary",
      render: text => <Text className="text-gray-500 text-sm">{text}</Text>,
    },
  ]

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in duration-700">
      {/* Header section with Breadcrumb */}
      <div className="space-y-4">
        <Breadcrumb
          items={[
            {
              title: (
                <span
                  onClick={() => navigate(ROUTER.HOME)}
                  className="cursor-pointer hover:text-green-600 transition-colors"
                >
                  Trang chủ
                </span>
              ),
            },
            { title: "Tài liệu & Tiêu chuẩn" },
            { title: "Tra cứu TCVN" },
          ]}
        />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
              <BookOutlined className="text-3xl" />
            </div>
            <div>
              <Title level={2} className="!mb-1">
                Danh mục tiêu chuẩn TCVN
              </Title>
              <Text className="text-gray-500 font-medium">
                Truy xuất nguồn gốc sản phẩm nông nghiệp & thực phẩm
              </Text>
            </div>
          </div>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(ROUTER.HOME)}
            size="large"
            className="rounded-xl border-gray-200 text-gray-600 font-bold hover:text-green-600 transition-all"
          >
            Quay lại trang chủ
          </Button>
        </div>
      </div>

      {/* Search Input */}
      <Card
        className="shadow-sm border-gray-50 rounded-2xl overflow-hidden"
        bodyStyle={{ padding: "24px" }}
      >
        <Input
          placeholder="Tìm kiếm theo số hiệu (VD: 9988) hoặc tên tiêu chuẩn (VD: cá, thịt, cà phê...)"
          size="large"
          prefix={<SearchOutlined className="text-gray-400" />}
          allowClear
          onChange={e => setSearchText(e.target.value)}
          className="rounded-xl h-14 text-lg border-gray-200 focus:border-green-500 hover:border-green-400 transition-all shadow-sm"
        />
      </Card>

      {/* Standards Table */}
      <TableCustom
        columns={columns}
        dataSource={paginatedTcvns}
        rowKey="_id"
        loading={isLoading}
        expandable={{
          expandedRowRender: record => (
            <div className="bg-gray-50/50 p-8 rounded-2xl border border-gray-100 m-2 space-y-6">
              <div className="space-y-3">
                <Title
                  level={5}
                  className="flex items-center gap-2 !mb-0 !text-blue-600 uppercase text-xs tracking-widest font-bold"
                >
                  <InfoCircleOutlined /> Phạm vi áp dụng
                </Title>
                <div className="prose prose-sm max-w-none">
                  {record.scope.split("\n").map((line, i) => (
                    <Paragraph
                      key={i}
                      className="text-gray-700 leading-relaxed text-[15px] !mb-3"
                    >
                      {line}
                    </Paragraph>
                  ))}
                </div>
              </div>
              {record.notes && (
                <div className="pt-4 border-t border-gray-100 flex items-start gap-4 italic text-gray-500 text-sm bg-white/50 p-4 rounded-xl border border-dashed">
                  <Tag
                    color="gold"
                    className="uppercase font-bold text-[10px] m-0"
                  >
                    Ghi chú
                  </Tag>
                  {record.notes}
                </div>
              )}
            </div>
          ),
          expandRowByClick: true,
        }}
        className="custom-tcvn-table"
        pagination={{
          current: visiblePage,
          pageSize,
          total: tcvns.length,
          showSizeChanger: true,
          onChange: (page, size) => {
            setCurrentPage(page)
            setPageSize(size)
          },
        }}
      />

      {/* Footer Tip */}
      <div className="bg-green-600/5 border border-green-100 p-6 rounded-2xl flex items-center gap-6">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-green-600 shrink-0">
          <InfoCircleOutlined className="text-xl" />
        </div>
        <div>
          <Text className="block font-bold text-gray-800 mb-1">
            Mẹo tra cứu:
          </Text>
          <Text className="text-gray-600 text-[13px]">
            Bạn có thể ấn trực tiếp vào các dòng trong bảng để xem phạm vi áp
            dụng chi tiết của tiêu chuẩn đó. Tất cả các tiêu chuẩn này đều được
            cập nhật theo quy định mới nhất từ Bộ Khoa học và Công nghệ.
          </Text>
        </div>
      </div>
    </div>
  )
}

export default TCVNReference
