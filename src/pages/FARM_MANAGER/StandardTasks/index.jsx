
import {
  CheckCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { Button, Card, Input, message, Popconfirm, Tooltip } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import CustomTable from 'src/components/Table/CustomTable'
import TitleCustom from 'src/components/TitleCustom'
import { DEFAULT_PAGE_SIZE } from 'src/constants/constants'
import { PAGE_SIZE } from 'src/constants/pageSizeOptions'
import ROUTER from 'src/router/ROUTER'

import StandardTaskService from 'src/services/StandardTaskService'
import { invalidCharsRegex } from 'src/utils/helpers'

// ── Main Component ────────────────────────────────────────────────────────────
const TasksManagement = () => {
  const navigate = useNavigate()
  // ── State: filters ──────────────────────────────────────────────────────────
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  // ── State: data ─────────────────────────────────────────────────────────────
  const [listData, setListData] = useState([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [loading, setLoading] = useState(false)

  // ── Fetch list (mock) ───────────────────────────────────────────────────────
  const getList = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        PageIndex: page,
        PageSize: pageSize,
        SearchKeyword: search || undefined,
      }
      const res = await StandardTaskService.getAll(params)
      if (res?.success === false) return
      setListData(res?.data?.items || [])
      setTotalRecords(res?.data?.totalItems || 0)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, search])

  useEffect(() => {
    getList()
  }, [getList])

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleSearch = useCallback(() => {
    if (invalidCharsRegex.test(searchInput)) {
      message.error('Ký tự tìm kiếm không hợp lệ')
      return
    }
    setSearch(searchInput.trim())
    setPage(1)
  }, [searchInput])

  const handleClearSearch = () => {
    setSearchInput('')
    setSearch('')
    setPage(1)
  }

  const handleOpenEdit = (record) => {
    navigate(ROUTER.FM_TASK_EDIT.replace(':id', record.id))
  }

  const handleDelete = async (record) => {
    try {
      const res = await StandardTaskService.remove(record.id)
      if (res?.success === false) {
        return
      }
      getList()
    } catch (err) {
    }
  }

  // ── Table columns ─────────────────────────────────────────────────────────────
  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 56,
      align: 'center',
      render: (_, __, index) => (
        <span className="text-sm font-medium text-gray-400">
          {(page - 1) * pageSize + index + 1}
        </span>
      ),
    },
    {
      title: 'Tên công việc',
      dataIndex: 'title',
      key: 'title',
      render: (v) => (
        <span className="text-sm font-semibold text-gray-800">{v || '—'}</span>
      ),
    },

    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      render: (v) => (
        <span className="text-sm font-semibold text-gray-800">{v || '—'}</span>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      fixed: 'right',
      width: 100,
      align: 'center',
      render: (_, record) => {
        return (
          <div className="flex items-center justify-center gap-2">
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                icon={<EditOutlined className="text-lg text-blue-500" />}
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-blue-50"
                onClick={(e) => {
                  e.stopPropagation()
                  handleOpenEdit(record)
                }}
              />
            </Tooltip>
            <Popconfirm
              title="Xóa công việc"
              description="Bạn có chắc chắn muốn xóa công việc này không?"
              onConfirm={(e) => {
                e.stopPropagation()
                handleDelete(record)
              }}
              onCancel={(e) => e.stopPropagation()}
              okText="Đồng ý"
              cancelText="Hủy"
              okButtonProps={{ danger: true }}
            >
              <Tooltip title="Xóa">
                <Button
                  type="text"
                  icon={<DeleteOutlined className="text-lg text-red-500" />}
                  className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-50"
                  onClick={(e) => e.stopPropagation()}
                />
              </Tooltip>
            </Popconfirm>
          </div>
        )
      },
    },
  ]

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* ── Header ── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <CheckCircleOutlined className="text-lg" />
            Danh mục công việc
          </TitleCustom>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate(ROUTER.FM_TASK_CREATE)}
          className="flex-shrink-0 h-10 px-5 font-bold bg-blue-600 border-0 shadow-lg rounded-xl shadow-blue-100"
        >
          Thêm mới
        </Button>
      </div>
      <Card
        bordered={false}
        className="shadow-sm rounded-2xl"
        bodyStyle={{ padding: 0 }}
      >
        {/* Toolbar */}
        <div className="flex flex-col gap-3 p-5 border-b border-gray-100 sm:flex-row sm:flex-wrap">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onPressEnter={handleSearch}
            placeholder="Tìm theo mã, tên công việc..."
            prefix={<SearchOutlined className="text-gray-300" />}
            className="flex-1 min-w-[200px] h-10 rounded-xl"
            allowClear
            onClear={handleClearSearch}
          />
          <div className="flex gap-2 ml-auto">
            <Button
              onClick={handleSearch}
              icon={<SearchOutlined />}
              className="h-10 px-4 font-semibold rounded-xl bg-gray-50"
            >
              Tìm kiếm
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => getList()}
              loading={loading}
              className="h-10 px-3 rounded-xl bg-gray-50"
            />
          </div>
        </div>

        {/* Table */}
        <CustomTable
          dataSource={listData}
          columns={columns}
          rowKey="id"
          loading={loading}
          scroll={{ x: 1000 }}
          onRow={(record) => ({
            onClick: () => navigate(ROUTER.FM_TASK_DETAIL.replace(':id', record.id)),
            className: 'cursor-pointer',
          })}
          locale={{ emptyText: 'Không có dữ liệu công việc.' }}
          pagination={{
            current: page,
            pageSize,
            total: totalRecords,
            showSizeChanger: true,
            pageSizeOptions: PAGE_SIZE,
            showTotal: (total, range) => (
              <span className="text-xs text-gray-500">
                {range[0]}–{range[1]} /{' '}
                <strong>{total}</strong>
              </span>
            ),
            onChange: (p, ps) => {
              setPage(p)
              setPageSize(ps)
            },
          }}
          rowClassName="hover:bg-blue-50/30 transition-colors"
        />
      </Card>
    </div>
  )
}

export default TasksManagement