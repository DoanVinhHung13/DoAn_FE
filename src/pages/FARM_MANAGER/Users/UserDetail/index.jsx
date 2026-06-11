import React from 'react'
import { Button, Avatar, Typography, Tag, Card, Row, Col, Spin, Divider } from 'antd'
import {
  UserOutlined, CheckCircleOutlined, StopOutlined, ArrowLeftOutlined,
  MailOutlined, PhoneOutlined, ClockCircleOutlined, CalendarOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import UserService from 'src/services/UserService'
import { formatDate, formatDateTime } from 'src/utils/dateFormatters'
import { getAvatarUrl, getInitialAvatar } from 'src/utils/helpers'
import { ROLE_CONFIG } from '../components/AssignRolesModal'
import TitleCustom from 'src/components/TitleCustom'

const { Text, Title } = Typography

const getRoleTag = (role) => {
  const cfg = ROLE_CONFIG[role] || { label: role, color: 'default' }
  return (
    <Tag key={role} color={cfg.color} className="rounded-full font-semibold text-[11px] border-0 m-0">
      {cfg.label}
    </Tag>
  )
}

const UserDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['user', id],
    queryFn: () => UserService.getUserById(id),
    enabled: !!id,
  })

  const user = response?.data

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spin size="large" />
      </div>
    )
  }

  if (isError || !user) {
    return (
      <div className="text-center py-20">
        <Title level={4} type="danger">Lỗi khi tải thông tin người dùng</Title>
        <Button onClick={() => navigate(-1)} className="mt-4">Quay lại</Button>
      </div>
    )
  }

  const displayName = user?.fullName || user?.email || '---';

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="rounded-xl h-10 px-4"
        >
          Quay lại
        </Button>
        <TitleCustom className="!mb-0">Chi tiết người dùng</TitleCustom>
      </div>

      <Row gutter={[24, 24]} align="stretch">
        {/* Cột trái: Thẻ tóm tắt giống AccountInfo */}
        <Col span={24} lg={8} className="flex">
          <Card bordered={false} className="shadow-sm rounded-[24px] text-center p-4 w-full h-full flex flex-col">
            <div className="relative inline-block mb-4">
              <Avatar
                size={100}
                src={getAvatarUrl(user.avatarUrl)}
                icon={!user.avatarUrl && <UserOutlined />}
                className="bg-green-50 text-green-600 border-4 border-white shadow-lg font-bold text-3xl"
              >
                {!user.avatarUrl && getInitialAvatar(displayName)}
              </Avatar>
            </div>

            <Title level={4} className="!mb-0">{displayName}</Title>

            <div className="flex justify-center flex-wrap gap-1 mt-2">
              {(user.roles || []).map(r => getRoleTag(r))}
            </div>

            <Divider className="my-6" />

            <div className="space-y-4 text-left px-2">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <Text type="secondary" className="text-[10px] uppercase font-bold block">Trạng thái</Text>
                  {user.isActive
                    ? <span className="text-green-600 font-bold text-sm"><CheckCircleOutlined className="mr-1" />Hoạt động</span>
                    : <span className="text-red-500 font-bold text-sm"><StopOutlined className="mr-1" />Vô hiệu hóa</span>
                  }
                </div>
              </div>

              {/* Nếu có dateOfBirth thì hiển thị, hiện API có thể chưa trả nhưng format sẵn để giống AccountInfo */}
              {user?.dateOfBirth && (
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400">
                    <CalendarOutlined />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Text type="secondary" className="text-[10px] uppercase font-bold block">Ngày sinh</Text>
                    <Text strong className="block truncate">{formatDate(user.dateOfBirth)}</Text>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </Col>

        {/* Cột phải: Thông tin chi tiết */}
        <Col span={24} lg={16} className="flex">
          <Card bordered={false} className="shadow-sm rounded-[24px] p-4 w-full h-full flex flex-col">
            <Title level={5} className="mb-6 flex items-center gap-2">
              <UserOutlined className="text-green-500" />
              Thông tin liên hệ & Hệ thống
            </Title>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
              <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <MailOutlined className="text-gray-400" />
                  <Text className="text-[11px] uppercase tracking-wider font-bold text-gray-500">Email</Text>
                </div>
                <div className="text-base font-medium text-gray-800 break-all">{user.email}</div>
              </div>

              <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <PhoneOutlined className="text-gray-400" />
                  <Text className="text-[11px] uppercase tracking-wider font-bold text-gray-500">Số điện thoại</Text>
                </div>
                <div className="text-base font-medium text-gray-800">{user.phoneNumber || '—'}</div>
              </div>

              <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarOutlined className="text-gray-400" />
                  <Text className="text-[11px] uppercase tracking-wider font-bold text-gray-500">Ngày tạo tài khoản</Text>
                </div>
                <div className="text-base font-medium text-gray-800">{formatDate(user.createdAt)}</div>
              </div>

              <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <ClockCircleOutlined className="text-gray-400" />
                  <Text className="text-[11px] uppercase tracking-wider font-bold text-gray-500">Đăng nhập lần cuối</Text>
                </div>
                <div className="text-base font-medium text-gray-800">{formatDateTime(user.lastLoginAt)}</div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default UserDetail
