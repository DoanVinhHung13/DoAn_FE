/**
 * Users Management — Farm Manager / Land Manager
 * Route: /farm-manager/users OR /land-manager/farmers
 */
import {
  CheckCircleOutlined,
  EditOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
  TeamOutlined,
  UserAddOutlined,
  UserOutlined,
} from "@ant-design/icons"

import {
  Avatar,
  Button,
  Card,
  Input,
  message,
  Select,
  Tooltip,
} from "antd"
import { useCallback, useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import CustomTable from "src/components/Table/CustomTable"
import { DEFAULT_PAGE_SIZE } from "src/constants/constants"
import { PAGE_SIZE } from "src/constants/pageSizeOptions"
import { ROLES } from "src/constants/roles"
import UserService from "src/services/UserService"

import CustomModal from "src/components/Modal/CustomModal"
import TitleCustom from "src/components/TitleCustom"
import { SYSTEM_KEY } from "src/constants/systemKey"
import { useSystemKey } from "src/hooks/useSystemKey"
import ROUTER from "src/router/ROUTER"
import { formatDate } from "src/utils/dateFormatters"
import { getAvatarUrl, invalidCharsRegex } from "src/utils/helpers"
import AssignRolesModal from "./components/AssignRolesModal"
import ResetPasswordModal from "./components/ResetPasswordModal"
import UserFormModal from "./components/UserFormModal"

const getRoleTag = (role, roleDesc) => {
  let color = "default"
  if (role === "FARM_MANAGER") color = "green"
  else if (role === "LAND_MANAGER") color = "blue"
  else if (role === "MATERIAL_MANAGER") color = "orange"
  else if (role === "FARMER") color = "cyan"

  return (
    <span
      key={role}
      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold bg-${color}-50 text-${color}-600 border border-${color}-100`}
    >
      {roleDesc || role}
    </span>
  )
}

const UsersManagement = () => {
  const navigate = useNavigate()
  const currentUser = useSelector(state => state.appGlobal.userInfo)
  const isFarmManager = currentUser?.role === ROLES.FARM_MANAGER

  const { getOptions, getDescription } = useSystemKey()

  const roleOptions = getOptions(SYSTEM_KEY.ROLE)
  const selectStatusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    ...getOptions(SYSTEM_KEY.STATUS),
  ]

  // ── State ──────────────────────────────────────────────────
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [roleFilter, setRoleFilter] = useState(undefined)
  const [statusFilter, setStatusFilter] = useState("all")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const [formModal, setFormModal] = useState({ open: false, user: null })
  const [rolesModal, setRolesModal] = useState({ open: false, user: null })
  const [pwdModal, setPwdModal] = useState({ open: false, user: null })
  const [statusModal, setStatusModal] = useState({ open: false, user: null })

  // ── Data fetching ──────────────────────────────────────────
  const [listData, setListData] = useState([])
  const [totalRecords, setTotalRecords] = useState(0)
  const [loading, setLoading] = useState(false)

  const getList = useCallback(async () => {
    try {
      setLoading(true)
      const res = await UserService.getUsers({
        PageIndex: page,
        PageSize: pageSize,
        SearchKeyword: search || undefined,
        Role: roleFilter || undefined,
        Status: statusFilter === "all" ? undefined : statusFilter,
      })
      if (res?.success === false) return
      setListData(res?.data?.items || [])
      setTotalRecords(res?.data?.totalItems || 0)
    } finally {
      setLoading(false)
    }
  }, [page, pageSize, roleFilter, search, statusFilter])

  useEffect(() => {
    getList()
  }, [getList])

  const [statusLoading, setStatusLoading] = useState(false)

  const handleStatusChange = async (id, isActive) => {
    try {
      setStatusLoading(true)
      const res = await UserService.changeUserStatus(id, { isActive })
      if (res?.success === false) return
      getList()
      setStatusModal({ open: false, user: null })
    } finally {
      setStatusLoading(false)
    }
  }

  const handleSearch = useCallback(() => {
    if (invalidCharsRegex.test(searchInput)) {
      message.error("Ký tự tìm kiếm không hợp lệ")
      return
    }
    setSearch(searchInput.trim())
    setPage(1)
  }, [searchInput])

  // ── Table columns ──────────────────────────────────────────
  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 50,
      align: "center",
      render: (_, __, index) => (
        <span className="text-sm font-medium text-gray-400">
          {(page - 1) * pageSize + index + 1}
        </span>
      ),
    },
    {
      title: "Người dùng",
      key: "user",
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            src={getAvatarUrl(record.avatarUrl)}
            icon={!record.avatarUrl && <UserOutlined />}
            className="flex-shrink-0 font-bold text-green-700 bg-gradient-to-br from-green-100 to-emerald-200"
          >
            {!record.avatarUrl && (record.fullName?.[0]?.toUpperCase() || "U")}
          </Avatar>
          <div className="min-w-0">
            <div className="text-sm font-bold text-gray-800 truncate transition-colors cursor-pointer hover:text-green-600">
              {record.fullName}
            </div>
            <div className="text-xs text-gray-400 truncate">{record.email}</div>
          </div>
        </div>
      ),
      width: 240,
    },
    {
      title: "Vai trò",
      dataIndex: "roles",
      key: "roles",
      render: roles => (
        <div className="flex flex-wrap gap-1">
          {(roles || []).map(r =>
            getRoleTag(r, getDescription(SYSTEM_KEY.ROLE, r)),
          )}
        </div>
      ),
      width: 150,
    },
    {
      title: "Điện thoại",
      dataIndex: "phoneNumber",
      key: "phone",
      render: v =>
        v ? (
          <span className="text-sm text-gray-600">{v}</span>
        ) : (
          <span className="text-sm text-gray-300">—</span>
        ),
      width: 140,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: v => (
        <span className="text-xs text-gray-600">{formatDate(v)}</span>
      ),
      width: 120,
    },
    {
      title: "Trạng thái",
      dataIndex: "isActive",
      key: "isActive",
      render: isActive => {
        // Ánh xạ boolean sang SystemKey value để lấy mô tả
        const sysVal = isActive ? "ACTIVE" : "INACTIVE"
        const statusDesc =
          getDescription(SYSTEM_KEY.STATUS, sysVal) ||
          (isActive ? "Hoạt động" : "Vô hiệu")

        return (
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold cursor-default select-none
                ${isActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}
          >
            {isActive ? (
              <>
                <CheckCircleOutlined />
                <span>{statusDesc}</span>
              </>
            ) : (
              <>
                <StopOutlined />
                <span>{statusDesc}</span>
              </>
            )}
          </div>
        )
      },
      width: 150,
    },

    {
      title: "Hành động",
      key: "actions",
      fixed: "right",
      width: 180,
      align: "center",
      render: (_, record) => {
        if (!isFarmManager) return null

        return (
          <div className="flex items-center justify-center gap-2">
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                icon={<EditOutlined className="text-lg text-green-500" />}
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-green-50"
                onClick={e => {
                  e.stopPropagation()
                  setFormModal({ open: true, user: record })
                }}
              />
            </Tooltip>
            {/* <Tooltip title="Phân quyền">
              <Button
                type="text"
                icon={<SafetyCertificateOutlined className="text-lg text-purple-500" />}
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-purple-50"
                onClick={(e) => {
                  e.stopPropagation();
                  setRolesModal({ open: true, user: record });
                }}
              />
            </Tooltip>
            <Tooltip title="Đặt lại mật khẩu">
              <Button
                type="text"
                icon={<KeyOutlined className="text-lg text-orange-500" />}
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-orange-50"
                onClick={(e) => {
                  e.stopPropagation();
                  setPwdModal({ open: true, user: record });
                }}
              />
            </Tooltip> */}
            <Tooltip title={record.isActive ? "Vô hiệu hóa" : "Kích hoạt"}>
              <Button
                type="text"
                icon={
                  record.isActive ? (
                    <StopOutlined className="text-lg text-red-500" />
                  ) : (
                    <CheckCircleOutlined className="text-lg text-green-500" />
                  )
                }
                className={`flex items-center justify-center w-8 h-8 rounded-lg ${record.isActive ? "hover:bg-red-50" : "hover:bg-green-50"}`}
                onClick={e => {
                  e.stopPropagation()
                  setStatusModal({ open: true, user: record })
                }}
              />
            </Tooltip>
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      {/* ── Header ── */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <TeamOutlined className="text-green-600" />
            Quản lý người dùng
 
          </TitleCustom>
        </div>
        {isFarmManager && (
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => setFormModal({ open: true, user: null })}
            className="flex-shrink-0 h-10 px-5 font-bold bg-green-600 border-0 shadow-lg rounded-xl shadow-green-100"
          >
            Thêm người dùng
          </Button>
        )}
      </div>

      {/* ── Table card ── */}
      <Card
        bordered={false}
        className="shadow-sm rounded-2xl"
        bodyStyle={{ padding: 0 }}
      >
        {/* Toolbar */}
        <div className="flex flex-col gap-3 p-5 border-b border-gray-100 sm:flex-row">
          <Input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onPressEnter={handleSearch}
            placeholder="Tìm theo tên, email..."
            prefix={<SearchOutlined className="text-gray-300" />}
            className="w-64 h-10 rounded-xl"
            allowClear
            onClear={() => {
              setSearchInput("")
              setSearch("")
              setPage(1)
            }}
          />
          <Select
            placeholder="Tất cả vai trò"
            className="h-10 rounded-xl min-w-[150px]"
            allowClear
            value={roleFilter}
            onChange={val => {
              setRoleFilter(val)
              setPage(1)
            }}
            options={roleOptions.map(opt => ({
              value: opt.codeValue || opt.value,
              label: opt.label || opt.description,
            }))}
          />
          <Select
            placeholder="Tất cả trạng thái"
            className="h-10 rounded-xl min-w-[150px]"
            allowClear
            value={statusFilter}
            onChange={value => {
              setStatusFilter(value)
              setPage(1)
            }}
            options={selectStatusOptions}
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
          onRow={record => {
            return {
              onClick: () => {
                navigate(ROUTER.FM_USER_DETAIL.replace(":id", record.id))
              },
              className: "cursor-pointer",
            }
          }}
          locale={{ emptyText: "No data available" }}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: totalRecords,
            showSizeChanger: true,
            pageSizeOptions: PAGE_SIZE,
            showTotal: (total, range) => (
              <span className="text-xs text-gray-500">
                {range[0]}–{range[1]} / <strong>{total}</strong>
              </span>
            ),
            onChange: (p, ps) => {
              setPage(p)
              setPageSize(ps)
            },
          }}
          rowClassName="hover:bg-green-50/30 transition-colors"
        />
      </Card>

      {/* ── Modals ── */}
      <UserFormModal
        open={formModal.open}
        editingUser={formModal.user}
        onClose={() => setFormModal({ open: false, user: null })}
        onSuccess={() => getList()}
      />
      <AssignRolesModal
        open={rolesModal.open}
        user={rolesModal.user}
        onClose={() => setRolesModal({ open: false, user: null })}
      />
      <ResetPasswordModal
        open={pwdModal.open}
        user={pwdModal.user}
        onClose={() => setPwdModal({ open: false, user: null })}
      />
      <CustomModal
        open={statusModal.open}
        onCancel={() => setStatusModal({ open: false, user: null })}
        title={
          <div className="flex items-center ">
            <span className="font-bold">Thay đổi trạng thái</span>
          </div>
        }
        footer={null}
        width={400}
      >
        <div className="mt-4 mb-6 ml-4">
          <p className="text-gray-600">
            Bạn có chắc muốn thay đổi trạng thái người dùng này không?{" "}
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <Button
            onClick={() => setStatusModal({ open: false, user: null })}
            className="h-10 px-6 rounded-xl"
          >
            Hủy
          </Button>
          <Button
            type="primary"
            className="h-10 px-6 font-bold bg-orange-600 border-0 shadow-lg rounded-xl shadow-orange-100"
            loading={statusLoading}
            onClick={() => {
              if (statusModal.user) {
                handleStatusChange(statusModal.user.id, !statusModal.user.isActive)
              }
            }}
          >
            Xác nhận
          </Button>
        </div>
      </CustomModal>
    </div>
  )
}

export default UsersManagement
