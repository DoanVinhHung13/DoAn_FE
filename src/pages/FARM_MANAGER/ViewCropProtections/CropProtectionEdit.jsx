import { ArrowLeftOutlined, BugOutlined } from '@ant-design/icons'
import { Button, Card, message, Skeleton } from 'antd'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TitleCustom from 'src/components/TitleCustom'
import ROUTER from 'src/router/ROUTER'
import CropProtectionService from 'src/services/CropProtectionService'

import CropProtectionFormFields from './CropProtectionFormFields'

const CropProtectionEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [initialLoading, setInitialLoading] = useState(true)
  const [editingItem, setEditingItem] = useState(null)

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setInitialLoading(true)
        const res = await CropProtectionService.getCropProtectionById(id)
        if (res?.success === false) {
          message.error('Không tìm thấy thuốc BVTV')
          navigate(ROUTER.FM_VIEW_CROP_PROTECTIONS)
          return
        }
        setEditingItem(res?.data)
      } catch (err) {
        message.error('Lấy thông tin thuốc BVTV thất bại')
        navigate(ROUTER.FM_VIEW_CROP_PROTECTIONS)
      } finally {
        setInitialLoading(false)
      }
    }
    if (id) fetchDetail()
  }, [id, navigate])

  return (
    <div className="space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTER.FM_VIEW_CROP_PROTECTIONS)}>
            Quay lại
          </Button>
          <TitleCustom className="!mb-0 flex items-center gap-2">
            <BugOutlined className="text-emerald-600" />
            Chỉnh sửa thuốc BVTV
          </TitleCustom>
        </div>
      </div>
      <Card
        bordered={false}
        className="shadow-sm rounded-2xl"
        bodyStyle={{ padding: '24px' }}
      >
        {initialLoading ? (
          <Skeleton active paragraph={{ rows: 6 }} />
        ) : (
          <CropProtectionFormFields isEdit={true} editingItem={editingItem} />
        )}
      </Card>
    </div>
  )
}

export default CropProtectionEdit
