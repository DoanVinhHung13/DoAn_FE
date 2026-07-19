import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  FileSearchOutlined,
  ReloadOutlined,
  SearchOutlined,
  WarningOutlined,
} from '@ant-design/icons'
import { Button, Card, Input, Select, Space, Tag, Tooltip } from 'antd'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import CustomTable from 'src/components/Table/CustomTable'
import TitleCustom from 'src/components/TitleCustom'
import ROUTER from 'src/router/ROUTER'

const QUALITY_STATUS = {
  PENDING: { label: 'Chờ kiểm tra', color: 'default' },
  APPROVED: { label: 'Đạt chất lượng', color: 'success' },
  REJECTED: { label: 'Không đạt', color: 'error' },
}

const qualityInspectionRecords = []

const statusMeta = {
  [QUALITY_STATUS.PENDING]: {
    label: 'Chờ kiểm tra',
    color: 'gold',
    icon: <ClockCircleOutlined />,
  },
  [QUALITY_STATUS.REVIEWING]: {
    label: 'Đang kiểm tra',
    color: 'blue',
    icon: <FileSearchOutlined />,
  },
  [QUALITY_STATUS.PASSED]: {
    label: 'Đạt yêu cầu',
    color: 'green',
    icon: <CheckCircleOutlined />,
  },
  [QUALITY_STATUS.NEEDS_ACTION]: {
    label: 'Cần xử lý',
    color: 'red',
    icon: <WarningOutlined />,
  },
}

const QualityInspectionList = () => {
  const navigate = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState('ALL')
  const [crop, setCrop] = useState('ALL')

  const cropOptions = useMemo(
    () => [
      { value: 'ALL', label: 'Tất cả cây trồng' },
      ...[...new Set(qualityInspectionRecords.map((item) => item.cropName))].map(
        (name) => ({ value: name, label: name })
      ),
    ],
    []
  )

  const data = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase()
    return qualityInspectionRecords.filter((item) => {
      const matchesKeyword =
        !normalizedKeyword ||
        [
          item.logbookName,
          item.stageName,
          item.activityName,
          item.supervisorName,
          item.landPlotName,
        ].some((value) => value.toLowerCase().includes(normalizedKeyword))
      return (
        matchesKeyword &&
        (status === 'ALL' || item.status === status) &&
        (crop === 'ALL' || item.cropName === crop)
      )
    })
  }, [crop, keyword, status])

  const pendingCount = qualityInspectionRecords.filter(
    (item) => item.status === QUALITY_STATUS.PENDING
  ).length
  const needsActionCount = qualityInspectionRecords.filter(
    (item) => item.status === QUALITY_STATUS.NEEDS_ACTION
  ).length

  const columns = [
    {
      title: 'STT',
      width: 58,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Nhật ký canh tác',
      key: 'logbook',
      width: 300,
      render: (_, record) => (
        <div>
          <div className="font-semibold text-gray-800">
            {record.logbookName}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {record.stageName} · {record.activityName}
          </div>
        </div>
      ),
    },
    {
      title: 'Người ghi chép',
      dataIndex: 'supervisorName',
      width: 170,
    },
    {
      title: 'Cây trồng / Vùng trồng',
      key: 'crop',
      width: 230,
      render: (_, record) => (
        <div>
          <div className="font-medium text-gray-700">{record.cropName}</div>
          <div className="mt-1 text-xs text-gray-500">
            {record.landPlotName}
          </div>
        </div>
      ),
    },
    {
      title: 'Thời gian gửi',
      dataIndex: 'recordedAt',
      width: 150,
      render: (value) => (
        <div>
          <div>{dayjs(value).format('DD/MM/YYYY')}</div>
          <div className="text-xs text-gray-500">
            {dayjs(value).format('HH:mm')}
          </div>
        </div>
      ),
    },
    {
      title: 'Minh chứng',
      dataIndex: 'evidenceCount',
      width: 100,
      align: 'center',
      render: (value) => `${value} ảnh`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 150,
      render: (value) => {
        const meta = statusMeta[value]
        return (
          <Tag color={meta.color} icon={meta.icon}>
            {meta.label}
          </Tag>
        )
      },
    },
    {
      title: 'Hành động',
      width: 95,
      align: 'center',
      render: (_, record) => (
        <Tooltip title="Kiểm tra chất lượng">
          <Button
            type="text"
            className="text-green-600"
            icon={<EyeOutlined />}
            onClick={(event) => {
              event.stopPropagation()
              navigate(
                ROUTER.FM_QUALITY_INSPECTION_DETAIL.replace(':id', record.id)
              )
            }}
          />
        </Tooltip>
      ),
    },
  ]

  return (
    <div className="min-h-full bg-[#f6f8fa] p-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <TitleCustom>
            <FileSearchOutlined className="mr-2" />
            Kiểm tra chất lượng nhật ký
          </TitleCustom>
          <p className="mt-2 text-sm text-gray-500">
            Kiểm tra từng lần ghi chép do Farm Supervisor gửi lên.
          </p>
        </div>
        <Space size={10}>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2">
            <span className="text-xs text-amber-700">Chờ kiểm tra</span>
            <strong className="ml-2 text-amber-700">{pendingCount}</strong>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2">
            <span className="text-xs text-red-700">Cần xử lý</span>
            <strong className="ml-2 text-red-700">{needsActionCount}</strong>
          </div>
        </Space>
      </div>

      <Card className="overflow-hidden rounded-2xl border-0 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <Input
            allowClear
            prefix={<SearchOutlined className="text-gray-400" />}
            placeholder="Tìm nhật ký, giai đoạn, người ghi..."
            value={keyword}
            className="w-full md:w-80"
            onChange={(event) => setKeyword(event.target.value)}
          />
          <Select
            value={status}
            className="w-full md:w-48"
            onChange={setStatus}
            options={[
              { value: 'ALL', label: 'Tất cả trạng thái' },
              ...Object.entries(statusMeta).map(([value, meta]) => ({
                value,
                label: meta.label,
              })),
            ]}
          />
          <Select
            value={crop}
            className="w-full md:w-52"
            onChange={setCrop}
            options={cropOptions}
          />
          <Button
            icon={<ReloadOutlined />}
            onClick={() => {
              setKeyword('')
              setStatus('ALL')
              setCrop('ALL')
            }}
          >
            Đặt lại
          </Button>
          <span className="ml-auto text-sm text-gray-500">
            {data.length} bản ghi
          </span>
        </div>

        <CustomTable
          rowKey="id"
          columns={columns}
          dataSource={data}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          onRow={(record) => ({
            onClick: () =>
              navigate(
                ROUTER.FM_QUALITY_INSPECTION_DETAIL.replace(':id', record.id)
              ),
          })}
        />
      </Card>
    </div>
  )
}

export default QualityInspectionList
