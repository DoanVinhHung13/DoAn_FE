/**
 * Users Management — Farm Manager / Land Manager
 * Route: /farm-manager/users OR /land-manager/farmers
 */
import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Dropdown, Badge, Row, Col, Card, Statistic, Popconfirm, Tooltip, Avatar, Select, message } from 'antd'
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
      Notice({ msg: 'Cập nhật trạng thái thành công (MSG-UM-04)', isSuccess: true })
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
      width: 200,
    },
    {
      title: 'Điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phone',
      render: (v) => v ? <span className="text-sm text-gray-600">{v}</span> : <span className="text-gray-300 text-sm">—</span>,
      width: 140,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive, record) => {
        const toggleUI = (
          <Popconfirm
            title="Thay đổi trạng thái"
            description="Bạn có chắc muốn thay đổi trạng thái người dùng này không? (MSG-UM-20)"
            onConfirm={(e) => {
              e.stopPropagation();
              if (isFarmManager) statusMutation.mutate({ id: record.id, isActive: !isActive });
            }}
            onCancel={(e) => e.stopPropagation()}
            okText="Xác nhận"
            cancelText="Hủy"
          >
            <div
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${isFarmManager ? 'cursor-pointer transition-all hover:bg-opacity-80' : 'cursor-default'
                } select-none
                  ${isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}
              onClick={(e) => e.stopPropagation()}
            >
              {isActive ? <><CheckCircleOutlined /><span>Hoạt động</span></> : <><StopOutlined /><span>Vô hiệu</span></>}
            </div>
          </Popconfirm>
        )

        if (isFarmManager) {
          return (
            <Tooltip title={isActive ? 'Nhấn để vô hiệu hóa' : 'Nhấn để kích hoạt'}>
              {toggleUI}
            </Tooltip>
          )
        }
        return toggleUI
      },
      width: 150,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (v) => <span className="text-xs text-gray-600">{formatDate(v)}</span>,
      width: 120,
    },
    {
      title: 'Hành động',
      key: 'actions',
      fixed: 'right',
      width: 80,
      align: 'center',
      render: (_, record) => {
        const items = []

        if (isFarmManager) {
          items.push(
            {
              key: 'edit',
              icon: <EditOutlined className="text-green-500" />,
              label: 'Chỉnh sửa',
              onClick: ({ domEvent }) => {
                domEvent.stopPropagation();
                setFormModal({ open: true, user: record });
              },
            },
            {
              key: 'roles',
              icon: <SafetyCertificateOutlined className="text-purple-500" />,
              label: 'Phân quyền',
              onClick: ({ domEvent }) => {
                domEvent.stopPropagation();
                setRolesModal({ open: true, user: record });
              },
            },
            {
              key: 'password',
              icon: <KeyOutlined className="text-orange-500" />,
              label: 'Đặt lại mật khẩu',
              onClick: ({ domEvent }) => {
                domEvent.stopPropagation();
                setPwdModal({ open: true, user: record });
              },
            },
            { type: 'divider' },
          )
        }

        return (
          <Dropdown trigger={['click']} menu={{ items }}>
            <Button
              type="text"
              icon={<MoreOutlined className="text-lg" />}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 m-auto"
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
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
    </div>
  )
}

export default UsersManagement