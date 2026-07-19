/**
 * Farm Manager: Danh sách Nhật ký Canh tác chờ duyệt
 * Route: /farm-manager/logbooks  (ROUTER.FM_LOGBOOKS)
 */
import {
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  FileTextOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons'
import {
  Button,
  Card,
  Empty,
  Input,
  Select,
  Skeleton,
  Tag,
  Typography,
  message,
} from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import TitleCustom from 'src/components/TitleCustom'
import ROUTER from 'src/router/ROUTER'
import CultivationLogbookService from 'src/services/CultivationLogbookService'
import { formatDate } from 'src/utils/dateFormatters'

const { Text } = Typography

const statusConfig = {
  PENDING_REVIEW: { color: 'gold',    label: 'Chờ duyệt' },
  APPROVED:       { color: 'success', label: 'Đã duyệt' },
  REJECTED:       { color: 'error',   label: 'Từ chối' },
}

const FarmManagerLogbooks = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [logbooks, setLogbooks] = useState([])
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      try {
        setLoading(true)
        const res = await FakeCultivationService.getSubmittedLogbooks()
        const items = res?.data?.data || []
        if (mounted) setLogbooks(items.length ? items : MOCK_SUBMITTED_LOGBOOKS)
      } catch {
        if (mounted) setLogbooks(MOCK_SUBMITTED_LOGBOOKS)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [reloadKey])

  const visible = useMemo(() => {
    const kw = search.trim().toLowerCase()
    return logbooks.filter((lb) => {
      const matchKw = !kw || [lb.planName, lb.supervisorName, lb.landPlotName, lb.cropName]
        .filter(Boolean).some((v) => v.toLowerCase().includes(kw))
      const matchStatus = statusFilter === 'all' || lb.status === statusFilter
      return matchKw && matchStatus
    })
  }, [logbooks, search, statusFilter])

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <TitleCustom className="!mb-0 flex items-center gap-2">
          <FileTextOutlined className="text-green-600" />
          Duyệt nhật ký canh tác
        </TitleCustom>
        <Text type="secondary">Xem xét và phê duyệt nhật ký canh tác được gửi từ Farm Supervisor.</Text>
      </div>

      <Card bordered={false} className="shadow-sm rounded-2xl" bodyStyle={{ padding: 0 }}>
        <div className="flex flex-col gap-3 p-4 border-b border-gray-100">
          <div className="flex flex-wrap gap-2">
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onPressEnter={() => { setSearch(searchInput.trim()) }}
              onClear={() => { setSearchInput(''); setSearch('') }}
              placeholder="Tìm kiếm nhật ký..."
              prefix={<SearchOutlined className="text-gray-300" />}
              className="h-10 flex-1 min-w-48 rounded-xl"
              allowClear
            />
            <Select
              value={statusFilter}
              onChange={(v) => setStatusFilter(v)}
              className="h-10 min-w-40 rounded-xl"
              options={[
                { value: 'all', label: 'Tất cả trạng thái' },
                { value: 'PENDING_REVIEW', label: 'Chờ duyệt' },
                { value: 'APPROVED', label: 'Đã duyệt' },
                { value: 'REJECTED', label: 'Từ chối' },
              ]}
            />
            <Button icon={<ReloadOutlined />} onClick={() => setReloadKey((v) => v + 1)} loading={loading} className="h-10 px-3 rounded-xl bg-gray-50" />
          </div>
          <Text type="secondary" className="text-xs">Tìm thấy <strong>{visible.length}</strong> nhật ký</Text>
        </div>

        {loading ? (
          <div className="p-5"><Skeleton active paragraph={{ rows: 6 }} /></div>
        ) : visible.length ? (
          <div className="p-5 grid gap-4 xl:grid-cols-2">
            {visible.map((lb) => {
              const cfg = statusConfig[lb.status] || { color: 'default', label: lb.status }
              return (
                <Card
                  key={lb.id}
                  bordered={false}
                  className="overflow-hidden border border-gray-100 shadow-sm rounded-2xl hover:border-green-300 hover:shadow-md cursor-pointer transition"
                  bodyStyle={{ padding: 0 }}
                  onClick={() => navigate(ROUTER.FM_LOGBOOK_REVIEW.replace(':id', lb.id || lb.planId))}
                >
                  <div className="p-5 border-b bg-gradient-to-r from-green-50 to-white">
                    <div className="flex flex-wrap justify-between gap-2 mb-2">
                      <Tag color={cfg.color} className="rounded-full">{cfg.label}</Tag>
                      <Text type="secondary" className="text-xs">
                        <CalendarOutlined className="mr-1" />
                        Gửi: {lb.submittedAt ? formatDate(lb.submittedAt) : '—'}
                      </Text>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{lb.planName}</h3>
                    <Text type="secondary">{lb.cropName}</Text>
                  </div>
                  <div className="p-5 grid gap-3 text-sm sm:grid-cols-2">
                    <div>
                      <Text type="secondary">Vùng trồng</Text>
                      <div className="mt-1 font-semibold"><EnvironmentOutlined className="mr-1 text-green-600" />{lb.landPlotName || '—'}</div>
                    </div>
                    <div>
                      <Text type="secondary">Farm Supervisor</Text>
                      <div className="mt-1 font-semibold"><UserOutlined className="mr-1 text-green-600" />{lb.supervisorName || '—'}</div>
                    </div>
                    <div className="sm:col-span-2">
                      <Button
                        type="primary" icon={<EyeOutlined />} size="small"
                        onClick={(e) => { e.stopPropagation(); navigate(ROUTER.FM_LOGBOOK_REVIEW.replace(':id', lb.id || lb.planId)) }}
                        className="w-full h-9 font-semibold bg-green-600 rounded-lg"
                      >
                        Xem & Duyệt nhật ký
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="p-8">
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có nhật ký nào cần duyệt." />
          </div>
        )}
      </Card>
    </div>
  )
}

export default FarmManagerLogbooks