import {
  CheckCircleOutlined,
  EditOutlined,
  KeyOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
  UserAddOutlined,
  UserOutlined,
  DeleteOutlined,
} from "@ant-design/icons"
import { UserManagementIcon } from "src/assets/icon/menu/MenuIcons"
import { UI } from "src/constants/uiConfig"

import { Avatar, Button, Input, Select, Tooltip, Popconfirm } from "antd"
import { useCallback, useEffect, useState } from "react"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"

import CustomTable from "src/components/Table/CustomTable"
import {
  createSTTColumn,
  createStatusColumn,
} from "src/components/Table/columns.jsx"
import { createPaginationConfig } from "src/utils/tableUtils"
import { DEFAULT_PAGE_SIZE } from "src/constants/constants"
import { ROLES } from "src/constants/roles"
import UserService from "src/services/UserService"

import CustomModal from "src/components/Modal/CustomModal"
import TitleCustom from "src/components/TitleCustom"
import { SYSTEM_KEY } from "src/constants/systemKey"
import { useSystemKey } from "src/hooks/useSystemKey"
import { useListManagement } from "src/hooks/useListManagement"
import ROUTER from "src/router/ROUTER"
import { formatDate } from "src/utils/dateFormatters"
import { getAvatarUrl } from "src/utils/helpers"
import { getRoleLabel } from "src/utils/roleLabels"
import AssignRolesModal from "./components/AssignRolesModal"
import CreateAccountModal from "./components/CreateAccountModal"
import ResetPasswordModal from "./components/ResetPasswordModal"
import UserFormModal from "./components/UserFormModal"

const getUserListData = response => {
  const data = response?.data?.data ?? response?.data ?? response
  if (Array.isArray(data)) return { items: data, totalItems: data.length }
  return {
    items: data?.items ?? data?.Items ?? [],
    totalItems: data?.totalItems ?? data?.totalCount ?? data?.TotalItems ?? 0,
  }
}

const getRoleTag = (role, roleDesc) => {
  let color = "default"
  if (role === "FARM_MANAGER") color = "green"
  else if (role === "FARM_SUPERVISOR") color = "blue"
  else if (role === "FARMER_LEADER") color = "purple"
  else if (role === "FARMER") color = "cyan"

  return (
    <span
      key={role}
      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold bg-${color}-50 text-${color}-600 border border-${color}-100`}
    >
      {roleDesc || getRoleLabel(role)}
    </span>
  )
}

const UsersManagement = () => {
  const navigate = useNavigate()
  const currentUser = useSelector(state => state.appGlobal.userInfo)
  const currentRoles = currentUser?.roles?.length
    ? currentUser.roles
    : [currentUser?.role]
  const isFarmManager = currentRoles.includes(ROLES.FARM_MANAGER)
  const isFarmSupervisor = currentRoles.includes(ROLES.FARM_SUPERVISOR)
  const canManageUsers = isFarmManager || isFarmSupervisor
  const userDetailRoute = isFarmManager
    ? ROUTER.FM_USER_DETAIL
    : ROUTER.FS_USER_DETAIL

  const { getOptions, getDescription } = useSystemKey()

  const {
    searchInput,
    setSearchInput,
    search,
    handleSearch,
    handleClearSearch,
    page,
    setPage,
    pageSize,
    setPageSize,
    filters,
    updateFilter,
    listData,
    setListData,
    totalRecords,
    setTotalRecords,
    loading,
    setLoading,
  } = useListManagement({
    initialPageSize: DEFAULT_PAGE_SIZE,
    initialFilters: { role: undefined, status: "ACTIVE" },
  })

  const roleFilter = filters.role
  const statusFilter = filters.status

  const allowedRoles = Object.values(ROLES)
  const roleOptions = getOptions(SYSTEM_KEY.ROLE).filter(option => {
    const role = option.codeValue || option.value
    return (
      allowedRoles.includes(role) &&
      !(isFarmSupervisor && role === ROLES.FARM_SUPERVISOR)
    )
  })
  const selectStatusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    ...getOptions(SYSTEM_KEY.STATUS),
  ]

  const [formModal, setFormModal] = useState({ open: false, user: null })
  const [createAccountModalOpen, setCreateAccountModalOpen] = useState(false)
  const [accountCandidates, setAccountCandidates] = useState([])
  const [accountCandidatesLoading, setAccountCandidatesLoading] =
    useState(false)
  const [rolesModal, setRolesModal] = useState({ open: false, user: null })
  const [pwdModal, setPwdModal] = useState({ open: false, user: null })
  const [statusModal, setStatusModal] = useState({ open: false, user: null })
  const [statusLoading, setStatusLoading] = useState(false)

  const getList = useCallback(async () => {
    try {
      setLoading(true)
      const res = await UserService.getUsers({
        pageIndex: page,
        pageSize,
        searchKeyword: search || undefined,
        role: roleFilter || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      })
      const { items, totalItems } = getUserListData(res)
      setListData(items)
      setTotalRecords(totalItems)
    } finally {
      setLoading(false)
    }
  }, [
    page,
    pageSize,
    roleFilter,
    search,
    statusFilter,
    setLoading,
    setListData,
    setTotalRecords,
  ])

  const getAccountCandidates = useCallback(async () => {
    if (!canManageUsers) return
    try {
      setAccountCandidatesLoading(true)
      const res = await UserService.getUsers({
        PageIndex: 1,
        PageSize: 100,
        HasAccount: false,
      })
      const { items } = getUserListData(res)
      setAccountCandidates(
        items.filter(user => {
          const roles = Array.isArray(user?.roles) ? user.roles : [user?.role]
          return (
            user?.isActive !== false &&
            !(
              isFarmSupervisor &&
              roles.some(r => String(r).toUpperCase() === ROLES.FARM_SUPERVISOR)
            )
          )
        }),
      )
    } finally {
      setAccountCandidatesLoading(false)
    }
  }, [canManageUsers, isFarmSupervisor])

  useEffect(() => {
    getList()
  }, [getList])

  const handleStatusChange = async (id, isActive) => {
    try {
      setStatusLoading(true)
      await UserService.changeUserStatus(id, { isActive })
      getList()
      setStatusModal({ open: false, user: null })
    } finally {
      setStatusLoading(false)
    }
  }

  const handleDelete = async id => {
    try {
      await UserService.deleteUser(id)
      getList()
    } catch {
      // error handled by axios interceptor
    }
  }

  const columns = [
    createSTTColumn(page, pageSize),
    {
      title: "Người dùng",
      key: "user",
      width: 240,
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
    },
    {
      title: "Vai trò",
      dataIndex: "roles",
      key: "roles",
      width: 150,
      render: roles => (
        <div className="flex flex-wrap gap-1">
          {(roles || []).map(r =>
            getRoleTag(r, getDescription(SYSTEM_KEY.ROLE, r)),
          )}
        </div>
      ),
    },
    {
      title: "Điện thoại",
      dataIndex: "phoneNumber",
      key: "phone",
      width: 140,
      render: v =>
        v ? (
          <span className="text-sm text-gray-600">{v}</span>
        ) : (
          <span className="text-sm text-gray-300">—</span>
        ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
      render: v => (
        <span className="text-xs text-gray-600">{formatDate(v)}</span>
      ),
    },
    createStatusColumn({
      title: "Trạng thái",
      width: 150,
      getLabel: isActive => {
        const sysVal = isActive ? "ACTIVE" : "INACTIVE"
        return (
          getDescription(SYSTEM_KEY.STATUS, sysVal) ||
          (isActive ? "Hoạt động" : "Vô hiệu")
        )
      },
    }),
    {
      title: "Hành động",
      key: "actions",
      fixed: "right",
      width: 180,
      align: "center",
      render: (_, record) => {
        if (!isFarmManager) return null
        return (
          <div className={UI.rowActions}>
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                icon={<EditOutlined className="text-lg text-green-500" />}
                className={UI.btn.iconEdit}
                onClick={e => {
                  e.stopPropagation()
                  setFormModal({ open: true, user: record })
                }}
              />
            </Tooltip>
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
                className={
                  record.isActive ? UI.btn.iconDeactivate : UI.btn.iconActivate
                }
                onClick={e => {
                  e.stopPropagation()
                  setStatusModal({ open: true, user: record })
                }}
              />
            </Tooltip>
            {!record.isActive && (
              <Popconfirm
                title="Xóa người dùng"
                description="Bạn có chắc chắn muốn xóa người dùng này không?"
                onConfirm={e => {
                  e.stopPropagation()
                  return handleDelete(record.id)
                }}
                onCancel={e => e.stopPropagation()}
                okText="Đồng ý"
                cancelText="Hủy"
              >
                <Tooltip title="Xóa">
                  <Button
                    type="text"
                    icon={<DeleteOutlined className="text-lg text-red-500" />}
                    className={UI.btn.iconDelete}
                    onClick={e => e.stopPropagation()}
                  />
                </Tooltip>
              </Popconfirm>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <div className={UI.page.wrapper}>
      <div className={UI.page.header}>
        <div>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <UserManagementIcon style={UI.menuIcon} />
            Quản lý người dùng
          </TitleCustom>
        </div>
        {canManageUsers && (
          <div className="flex flex-wrap gap-2">
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => setFormModal({ open: true, user: null })}
              className={UI.btn.primary}
            >
              Thêm người dùng
            </Button>
            <Button
              icon={<KeyOutlined />}
              onClick={() => {
                setCreateAccountModalOpen(true)
                getAccountCandidates()
              }}
              className="flex-shrink-0 h-10 px-5 font-bold text-blue-600 border-blue-200 rounded-xl hover:text-blue-700 hover:border-blue-400 hover:bg-blue-50"
            >
              Tạo tài khoản
            </Button>
          </div>
        )}
      </div>

      <div className={UI.toolbar.card}>
        <div className={UI.toolbar.inner}>
          <Input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onPressEnter={handleSearch}
            placeholder="Tìm theo tên, email..."
            prefix={<SearchOutlined className="text-gray-300" />}
            className={UI.input.search}
            allowClear
            onClear={handleClearSearch}
          />
          <Select
            placeholder="Tất cả vai trò"
            className="h-10 min-w-[150px]"
            allowClear
            value={roleFilter}
            onChange={val => updateFilter("role", val)}
            options={roleOptions.map(opt => ({
              value: opt.codeValue || opt.value,
              label: getRoleLabel(opt.codeValue || opt.value),
            }))}
          />
          <Select
            placeholder="Tất cả trạng thái"
            className="h-10 min-w-[150px]"
            allowClear
            value={statusFilter}
            onChange={val => updateFilter("status", val)}
            options={selectStatusOptions}
          />
          <div className={UI.toolbar.actions}>
            <Button
              onClick={handleSearch}
              icon={<SearchOutlined />}
              className={UI.btn.search}
            >
              Tìm kiếm
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => getList()}
              loading={loading}
              className={UI.btn.reload}
            />
          </div>
        </div>
      </div>

      <CustomTable
        dataSource={listData}
        columns={columns}
        rowKey="id"
        loading={loading}
        onRow={record => ({
          onClick: () => navigate(userDetailRoute.replace(":id", record.id)),
          className: "cursor-pointer",
        })}
        locale={{ emptyText: "Không có dữ liệu người dùng." }}
        pagination={createPaginationConfig(
          page,
          pageSize,
          totalRecords,
          (p, ps) => {
            setPage(p)
            setPageSize(ps)
          },
        )}
        rowClassName={UI.row}
      />

      <UserFormModal
        open={formModal.open}
        editingUser={formModal.user}
        onClose={() => setFormModal({ open: false, user: null })}
        onSuccess={() => getList()}
      />
      <CreateAccountModal
        open={createAccountModalOpen}
        users={accountCandidates}
        loadingUsers={accountCandidatesLoading}
        canCreateSupervisor={isFarmManager}
        onClose={() => setCreateAccountModalOpen(false)}
        onSuccess={() => {
          getList()
          getAccountCandidates()
        }}
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
          <div className={UI.modal.titleClass}>
            <span className="font-bold">Thay đổi trạng thái</span>
          </div>
        }
        footer={null}
        width={420}
      >
        <div className={UI.modal.body}>
          <p className="text-gray-600">
            Bạn có chắc muốn thay đổi trạng thái người dùng này không?
          </p>
          {statusModal.user && (
            <p className="mt-2 text-sm font-semibold text-gray-800">
              {statusModal.user.fullName}
            </p>
          )}
        </div>
        <div className={UI.modal.footer}>
          <Button
            onClick={() => setStatusModal({ open: false, user: null })}
            className={UI.btn.cancel}
          >
            Hủy
          </Button>
          <Button
            type="primary"
            loading={statusLoading}
            onClick={() => {
              if (statusModal.user)
                handleStatusChange(
                  statusModal.user.id,
                  !statusModal.user.isActive,
                )
            }}
            className={UI.btn.confirm}
          >
            Xác nhận
          </Button>
        </div>
      </CustomModal>
    </div>
  )
}

export default UsersManagement
