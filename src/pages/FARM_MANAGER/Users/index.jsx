/**
 * Users Management — Farm Manager / Land Manager
 * Route: /farm-manager/users OR /land-manager/farmers
 */
import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Dropdown, Badge, Row, Col, Card, Statistic, Popconfirm, Tooltip, Avatar, Select, message, Modal } from 'antd'
import {
  UserAddOutlined, SearchOutlined, EditOutlined, DeleteOutlined,
  KeyOutlined, SafetyCertificateOutlined, ReloadOutlined,
  CheckCircleOutlined, StopOutlined, MoreOutlined, TeamOutlined,
  UsergroupAddOutlined, EyeOutlined, CrownOutlined, UserOutlined
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSelector } from 'react-redux'
import dayjs from 'dayjs'

import UserService from 'src/services/UserService'
import { ROLES } from 'src/constants/roles'
import Notice from 'src/components/Notice'
import CustomTable from 'src/components/Table/CustomTable'
import { DEFAULT_PAGE_SIZE } from 'src/constants/constants'
import { PAGE_SIZE } from 'src/constants/pageSizeOptions'

import UserFormModal from './components/UserFormModal'
import AssignRolesModal, { ROLE_CONFIG } from './components/AssignRolesModal'
import ResetPasswordModal from './components/ResetPasswordModal'
import { getAvatarUrl, invalidCharsRegex } from 'src/utils/helpers'
import { formatDate } from 'src/utils/dateFormatters'
import TitleCustom from 'src/components/TitleCustom'
import ROUTER from 'src/router/ROUTER'
import CustomModal from 'src/components/Modal/CustomModal'

const getRoleTag = (role) => {
  const cfg = ROLE_CONFIG[role] || { label: role, color: 'default' }
  return (
    <span key={role} className={`px-2 py-0.5 rounded-full text-[11px] font-semibold bg-${cfg.color}-50 text-${cfg.color}-600 border border-${cfg.color}-100`}>
      {cfg.label}
    </span>
  )
}

const UsersManagement = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const currentUser = useSelector(state => state.appGlobal.userInfo)
  const isFarmManager = currentUser?.role === ROLES.FARM_MANAGER

  // ── State ──────────────────────────────────────────────────
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [roleFilter, setRoleFilter] = useState(undefined)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const [formModal, setFormModal] = useState({ open: false, user: null })
  const [rolesModal, setRolesModal] = useState({ open: false, user: null })
  const [pwdModal, setPwdModal] = useState({ open: false, user: null })
  const [statusModal, setStatusModal] = useState({ open: false, user: null })

  // ── Data fetching ──────────────────────────────────────────
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['users', { page, pageSize, search, roleFilter }],
    queryFn: () => UserService.getUsers({
      PageIndex: page,
      PageSize: pageSize,
      SearchKeyword: search || undefined,
      Role: roleFilter || undefined,
    }),
    keepPreviousData: true,
    select: (res) => res?.data || { items: [], totalItems: 0 },
  })
  const users = data?.items || []
  const totalItems = data?.totalItems || 0

  // ── Mutations (only for Farm Manager) ──────────────────────

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }) => UserService.changeUserStatus(id, { isActive }),
    onSuccess: (res) => {
      if (res?.success === false) return
      queryClient.invalidateQueries(['users'])
    },
  })

  // ── Handlers ───────────────────────────────────────────────
  const handleSearch = useCallback(() => {
    // Validate search input (E1: Invalid Search Input)
    if (invalidCharsRegex.test(searchInput)) {
      message.error('Ký tự tìm kiếm không hợp lệ');
      return;
    }
    setSearch(searchInput.trim())
    setPage(1)
  }, [searchInput])

  // ── Table columns ──────────────────────────────────────────
  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 50,
      align: 'center',
      render: (_, __, index) => (
        <span className="text-sm text-gray-400 font-medium">{(page - 1) * pageSize + index + 1}</span>
      ),
    },
    {
      title: 'Người dùng',
      key: 'user',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            src={getAvatarUrl(record.avatarUrl)}
            icon={!record.avatarUrl && <UserOutlined />}
            className="bg-gradient-to-br from-green-100 to-emerald-200 text-green-700 flex-shrink-0 font-bold"
          >
            {!record.avatarUrl && (record.fullName?.[0]?.toUpperCase() || 'U')}
          </Avatar>
          <div className="min-w-0">
            <div
              className="font-bold text-gray-800 text-sm truncate cursor-pointer hover:text-green-600 transition-colors"
            >
              {record.fullName}
            </div>
            <div className="text-xs text-gray-400 truncate">{record.email}</div>
          </div>
        </div>
      ),
      width: 240,
    },
    {
      title: 'Vai trò',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles) => (
        <div className="flex flex-wrap gap-1">
          {(roles || []).map(r => getRoleTag(r))}
        </div>
      ),
      width: 150,
    },
    {
      title: 'Điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phone',
      render: (v) => v ? <span className="text-sm text-gray-600">{v}</span> : <span className="text-gray-300 text-sm">—</span>,
      width: 140,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v) => <span className="text-xs text-gray-600">{formatDate(v)}</span>,
      width: 120,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => {
        return (
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold cursor-default select-none
                ${isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}
          >
            {isActive ? <><CheckCircleOutlined /><span>Hoạt động</span></> : <><StopOutlined /><span>Vô hiệu</span></>}
          </div>
        );
      },
      width: 150,
    },

    {
      title: 'Hành động',
      key: 'actions',
      fixed: 'right',
      width: 180,
      align: 'center',
      render: (_, record) => {
        if (!isFarmManager) return null;

        return (
          <div className="flex items-center justify-center gap-2">
            <Tooltip title="Chỉnh sửa">
              <Button
                type="text"
                icon={<EditOutlined className="text-green-500 text-lg" />}
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-green-50"
                onClick={(e) => {
                  e.stopPropagation();
                  setFormModal({ open: true, user: record });
                }}
              />
            </Tooltip>
            {/* <Tooltip title="Phân quyền">
              <Button
                type="text"
                icon={<SafetyCertificateOutlined className="text-purple-500 text-lg" />}
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
                icon={<KeyOutlined className="text-orange-500 text-lg" />}
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
                icon={record.isActive ? <StopOutlined className="text-red-500 text-lg" /> : <CheckCircleOutlined className="text-green-500 text-lg" />}
                className={`flex items-center justify-center w-8 h-8 rounded-lg ${record.isActive ? 'hover:bg-red-50' : 'hover:bg-green-50'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setStatusModal({ open: true, user: record });
                }}
              />
            </Tooltip>
          </div>
        )
      },
    },
  ]


  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <TeamOutlined className="text-green-600" />
            Quản lý người dùng
            <Badge
              count={totalItems}
              overflowCount={999}
              className="ml-1"
              style={{ backgroundColor: '#16a34a', fontSize: 11, fontWeight: 700 }}
            />
          </TitleCustom>
        </div>
        {isFarmManager && (
          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={() => setFormModal({ open: true, user: null })}
            className="h-10 px-5 rounded-xl bg-green-600 border-0 font-bold shadow-lg shadow-green-100 flex-shrink-0"
          >
            Thêm người dùng
          </Button>
        )}
      </div>



      {/* ── Table card ── */}
      <Card
        bordered={false}
        className="rounded-2xl shadow-sm"
        bodyStyle={{ padding: 0 }}
      >
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 p-5 border-b border-gray-100">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onPressEnter={handleSearch}
            placeholder="Tìm theo tên, email..."
            prefix={<SearchOutlined className="text-gray-300" />}
            className="h-10 rounded-xl w-64"
            allowClear
            onClear={() => { setSearchInput(''); setSearch(''); setPage(1) }}
          />
          <Select
            placeholder="Tất cả vai trò"
            className="h-10 rounded-xl min-w-[150px]"
            allowClear
            value={roleFilter}
            onChange={(val) => { setRoleFilter(val); setPage(1); }}
            options={Object.entries(ROLE_CONFIG).map(([val, cfg]) => ({ value: val, label: cfg.label }))}
          />
          <div className="flex gap-2 ml-auto">
            <Button
              onClick={handleSearch}
              icon={<SearchOutlined />}
              className="h-10 px-4 rounded-xl font-semibold bg-gray-50"
            >
              Tìm kiếm
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => queryClient.invalidateQueries(['users'])}
              loading={isFetching}
              className="h-10 px-3 rounded-xl bg-gray-50"
            />
          </div>
        </div>

        {/* Table */}
        <CustomTable
          dataSource={users}
          columns={columns}
          rowKey="id"
          loading={isLoading || isFetching}
          onRow={(record) => {
            return {
              onClick: () => {
                navigate(ROUTER.FM_USER_DETAIL.replace(':id', record.id))
              },
              className: 'cursor-pointer'
            }
          }}
          locale={{ emptyText: 'No data available' }}
          pagination={{
            current: page,
            pageSize: pageSize,
            total: totalItems,
            showSizeChanger: true,
            pageSizeOptions: PAGE_SIZE,
            showTotal: (total, range) => (
              <span className="text-xs text-gray-500">
                {range[0]}–{range[1]} / <strong>{total}</strong>
              </span>
            ),
            onChange: (p, ps) => { setPage(p); setPageSize(ps) },
          }}
          rowClassName="hover:bg-green-50/30 transition-colors"
        />
      </Card>

      {/* ── Modals ── */}
      <UserFormModal
        open={formModal.open}
        editingUser={formModal.user}
        onClose={() => setFormModal({ open: false, user: null })}
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
          <p className="text-gray-600">Bạn có chắc muốn thay đổi trạng thái người dùng này không? </p>
        </div>
        <div className="flex justify-end gap-3">
          <Button onClick={() => setStatusModal({ open: false, user: null })} className="h-10 px-6 rounded-xl">
            Hủy
          </Button>
          <Button
            type="primary"
            className="h-10 px-6 rounded-xl bg-orange-600 border-0 font-bold shadow-lg shadow-orange-100"
            onClick={() => {
              if (statusModal.user) {
                statusMutation.mutate({ id: statusModal.user.id, isActive: !statusModal.user.isActive });
                setStatusModal({ open: false, user: null });
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