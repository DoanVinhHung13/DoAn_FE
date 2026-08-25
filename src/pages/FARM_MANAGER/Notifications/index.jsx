import React, { useMemo, useState, useEffect, useCallback } from "react"
import {
  Badge,
  Button,
  Card,
  Empty,
  Form,
  Pagination,
  Skeleton,
  Tabs,
  Typography,
  Upload,
  message,
} from "antd"
import {
  BellOutlined,
  CheckOutlined,
  PlusOutlined,
} from "@ant-design/icons"
import { useNavigate } from "react-router-dom"

import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  createNotification,
  getAllUsers,
  getSentNotifications,
} from "src/services/NotificationService"
import UploadService from "src/services/UploadService"
import TitleCustom from "src/components/TitleCustom"
import { NotificationIcon } from "src/assets/icon/menu/MenuIcons"
import ROUTER from "src/router/ROUTER"
import { NOTIFICATION_TYPE_LABELS } from "src/constants/notificationTypes"
import { useDebouncedValue } from "src/hooks/useDebouncedValue"
import {
  getNotificationActionUrl,
  getNotificationContext,
} from "src/utils/notificationUtils"

import {
  RECIPIENT_TYPE,
  getCategory,
  getUserId,
  hasRole,
  normalizeNotifications,
  normalizeUsers,
} from "./components/notificationConstants"
import NotificationItem from "./components/NotificationItem"
import NotificationFilterToolbar from "./components/NotificationFilterToolbar"
import CreateNotificationModal from "./components/CreateNotificationModal"

const { Text } = Typography

const FarmManagerNotifications = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [keyword, setKeyword] = useState("")
  const [status, setStatus] = useState("all")
  const [category, setCategory] = useState("all")
  const [isCreating, setIsCreating] = useState(false)
  const [recipientType, setRecipientType] = useState(RECIPIENT_TYPE.ALL)
  const [activeTab, setActiveTab] = useState("received")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const debouncedKeyword = useDebouncedValue(keyword, 400)
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [documents, setDocuments] = useState([])

  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isError, setIsError] = useState(false)

  const [sentData, setSentData] = useState(null)
  const [isSentLoading, setIsSentLoading] = useState(false)
  const [isSentError, setIsSentError] = useState(false)

  const [usersData, setUsersData] = useState(null)
  const [isUsersLoading, setIsUsersLoading] = useState(false)

  const [markAllPending, setMarkAllPending] = useState(false)
  const [createPending, setCreatePending] = useState(false)

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true)
    setIsError(false)
    try {
      const result = normalizeNotifications(
        await getNotifications({
          PageIndex: page,
          PageSize: pageSize,
          SearchKeyword: debouncedKeyword.trim() || undefined,
          IsRead: status === "all" ? undefined : status === "read",
          Type: category === "all" ? undefined : category,
        }),
      )
      setData(result)
    } catch {
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }, [page, pageSize, debouncedKeyword, status, category])

  const fetchSentNotifications = useCallback(async () => {
    setIsSentLoading(true)
    setIsSentError(false)
    try {
      const result = normalizeNotifications(
        await getSentNotifications({
          PageIndex: page,
          PageSize: pageSize,
          SearchKeyword: debouncedKeyword.trim() || undefined,
          IsRead: status === "all" ? undefined : status === "read",
          Type: category === "all" ? undefined : category,
        }),
      )
      setSentData(result)
    } catch (error) {
      console.warn("API /notifications/sent chưa được implement:", error)
      setSentData({ items: [], unreadCount: 0 })
    } finally {
      setIsSentLoading(false)
    }
  }, [page, pageSize, debouncedKeyword, status, category])

  const fetchUsers = useCallback(async () => {
    setIsUsersLoading(true)
    try {
      const result = normalizeUsers(
        await getAllUsers({
          PageIndex: 1,
          PageSize: 100,
          HasAccount: true,
        }),
      )
      setUsersData(result)
    } catch {
      setUsersData([])
    } finally {
      setIsUsersLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  useEffect(() => {
    const handler = () => fetchNotifications()
    window.addEventListener("app:notification-changed", handler)
    return () => window.removeEventListener("app:notification-changed", handler)
  }, [fetchNotifications])

  useEffect(() => {
    fetchSentNotifications()
  }, [fetchSentNotifications])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleMarkAllRead = async () => {
    setMarkAllPending(true)
    try {
      await markAllNotificationsAsRead()
      await fetchNotifications()
    } finally {
      setMarkAllPending(false)
    }
  }

  const accountUsers = useMemo(
    () =>
      (usersData || [])
        .filter(user => getUserId(user))
        .filter(user => !hasRole(user, "FARM_MANAGER")),
    [usersData],
  )

  const getRecipientUserIds = values => {
    if (recipientType === RECIPIENT_TYPE.SPECIFIC_USERS) {
      return values.recipientUserIds || []
    }

    if (recipientType === RECIPIENT_TYPE.BY_ROLE) {
      const selectedRoles = values.recipientRoles || []
      return accountUsers
        .filter(user => selectedRoles.some(role => hasRole(user, role)))
        .map(getUserId)
    }

    return accountUsers.map(getUserId)
  }

  const handleCreateNotification = async values => {
    const recipientUserIds = getRecipientUserIds(values)
    if (!recipientUserIds.length) {
      message.error(
        "Không tìm thấy người dùng có tài khoản phù hợp để nhận thông báo.",
      )
      return
    }
    setCreatePending(true)
    try {
      const payload = {
        title: values.title.trim(),
        content: values.message.trim(),
        type: "Announcement",
        actionUrl: values.actionUrl?.trim() || null,
        recipientUserIds,
        recipientRoles: [],
        attachments: documents.map(doc => doc.url),
      }
      await createNotification(payload)
      setIsCreating(false)
      form.resetFields()
      setRecipientType(RECIPIENT_TYPE.ALL)
      setDocuments([])
      await fetchNotifications()
      await fetchSentNotifications()
      setActiveTab("sent")
    } finally {
      setCreatePending(false)
    }
  }

  const handleDocumentUpload = async ({ file, onSuccess, onError }) => {
    setUploadingDoc(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await UploadService.uploadImage(formData)
      const payload = response?.data?.data || response?.data || {}
      const fileUrl =
        payload.imageUrl ||
        payload.url ||
        payload.secureUrl ||
        payload.fileUrl ||
        payload.path

      if (!fileUrl) {
        throw new Error("Không nhận được đường dẫn file sau khi upload.")
      }

      const newDoc = {
        uid: file.uid,
        name: file.name,
        url: fileUrl,
        size: file.size,
        type: file.type,
      }

      setDocuments(prev => [...prev, newDoc])
      onSuccess(response)
    } catch (error) {
      onError(error)
    } finally {
      setUploadingDoc(false)
    }
  }

  const beforeDocumentUpload = file => {
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/jpeg",
      "image/png",
      "image/webp",
    ]

    if (!validTypes.includes(file.type)) {
      message.error("Chỉ chấp nhận file PDF, Word, Excel hoặc ảnh.")
      return Upload.LIST_IGNORE
    }

    if (file.size / 1024 / 1024 > 10) {
      message.error("Dung lượng file không được vượt quá 10MB.")
      return Upload.LIST_IGNORE
    }

    return true
  }

  const handleRemoveDocument = uid => {
    setDocuments(prev => prev.filter(doc => doc.uid !== uid))
  }

  const categoryOptions = useMemo(() => {
    const categories = Object.entries(NOTIFICATION_TYPE_LABELS).map(
      ([value, label]) => ({ value, label }),
    )
    return [{ value: "all", label: "Tất cả danh mục" }, ...categories]
  }, [])

  const userOptions = useMemo(() => {
    if (!usersData) return []
    return usersData
      .filter(user => getUserId(user) && !hasRole(user, "FARM_MANAGER"))
      .map(user => ({
        value: getUserId(user),
        label: user.fullName || user.name || user.username || "Không tên",
      }))
  }, [usersData])

  const filteredNotifications = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLocaleLowerCase("vi")
    const sourceData = activeTab === "received" ? data : sentData

    return (sourceData?.items || []).filter(item => {
      const matchesKeyword =
        !normalizedKeyword ||
        [
          item.title,
          item.message,
          item.content,
          getCategory(item),
          getNotificationContext(item).logbookName,
          getNotificationContext(item).stageName,
        ]
          .filter(Boolean)
          .some(value =>
            String(value).toLocaleLowerCase("vi").includes(normalizedKeyword),
          )
      const matchesStatus =
        status === "all" ||
        (status === "read" && item.isRead) ||
        (status === "unread" && !item.isRead)
      const matchesCategory = category === "all" || item.type === category

      return matchesKeyword && matchesStatus && matchesCategory
    })
  }, [category, data, sentData, keyword, status, activeTab])

  const handleNotificationClick = async item => {
    const id = item._id || item.id
    if (!item.isRead && id) {
      await markNotificationAsRead(id).catch(() => undefined)
      await fetchNotifications()
    }

    const actionUrl = getNotificationActionUrl(item)
    if (actionUrl?.startsWith("/")) {
      navigate(actionUrl)
      return
    }

    const detailPath = ROUTER.FM_NOTIFICATION_DETAIL
    navigate(detailPath.replace(":id", id || "sent-detail"), {
      state: { isSent: activeTab === "sent", notificationItem: item },
    })
  }

  return (
    <div className="admin-compact-list space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <TitleCustom className="!mb-0 flex items-center gap-2">
          <NotificationIcon style={{ fontSize: "24px", color: "#15803d" }} />
          Thông báo
        </TitleCustom>

        <div className="flex flex-wrap gap-3">
          <Button
            icon={<CheckOutlined />}
            disabled={!data?.unreadCount}
            loading={markAllPending}
            onClick={handleMarkAllRead}
            className="h-10 rounded-lg font-semibold"
          >
            Đánh dấu tất cả đã đọc
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsCreating(true)}
            className="h-10 rounded-lg bg-green-500 font-semibold shadow-lg shadow-green-100"
          >
            Tạo thông báo
          </Button>
        </div>
      </div>

      <Tabs
        activeKey={activeTab}
        onChange={value => {
          setActiveTab(value)
          setPage(1)
        }}
        items={[
          {
            key: "received",
            label: (
              <span className="flex items-center gap-2">
                <BellOutlined />
                Nhận được
                {data?.unreadCount > 0 && (
                  <Badge count={data.unreadCount} className="ml-1" />
                )}
              </span>
            ),
          },
          {
            key: "sent",
            label: (
              <span className="flex items-center gap-2">
                <CheckOutlined />
                Đã gửi
              </span>
            ),
          },
        ]}
        className="bg-white rounded-lg shadow-sm px-6"
      />

      <NotificationFilterToolbar
        keyword={keyword}
        setKeyword={setKeyword}
        status={status}
        setStatus={setStatus}
        category={category}
        setCategory={setCategory}
        categoryOptions={categoryOptions}
        onResetPage={() => setPage(1)}
      />

      <Card
        variant="borderless"
        className="overflow-hidden rounded-lg shadow-sm"
        styles={{ body: { padding: 0 } }}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <Text strong>
            {activeTab === "received"
              ? "Danh sách thông báo nhận được"
              : "Danh sách thông báo đã gửi"}
          </Text>
          {activeTab === "received" && (
            <div className="flex items-center gap-2">
              <Badge status={data?.unreadCount ? "processing" : "default"} />
              <Text type="secondary" className="!text-sm">
                {data?.unreadCount || 0} chưa đọc
              </Text>
            </div>
          )}
        </div>

        {(activeTab === "received" ? isLoading : isSentLoading) ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3].map(item => (
              <Skeleton key={item} active avatar paragraph={{ rows: 2 }} />
            ))}
          </div>
        ) : (activeTab === "received" ? isError : isSentError) ? (
          <div className="py-16 text-center">
            <Text type="secondary" className="block">
              Không thể tải danh sách thông báo.
            </Text>
            <Button
              type="link"
              onClick={() =>
                activeTab === "received"
                  ? fetchNotifications()
                  : fetchSentNotifications()
              }
            >
              Thử lại
            </Button>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              activeTab === "sent"
                ? "Bạn chưa gửi thông báo nào hoặc API chưa được triển khai"
                : "Không có thông báo nào"
            }
            className="py-16"
          />
        ) : (
          <div className="space-y-4 p-5">
            {filteredNotifications.map(item => (
              <NotificationItem
                key={item._id || item.id}
                item={item}
                isSentTab={activeTab === "sent"}
                onClick={handleNotificationClick}
              />
            ))}
            <div className="flex justify-end border-t border-gray-100 pt-4">
              <Pagination
                current={page}
                pageSize={pageSize}
                total={
                  (activeTab === "sent" ? sentData : data)?.totalItems || 0
                }
                showSizeChanger
                onChange={(nextPage, nextPageSize) => {
                  setPage(nextPageSize !== pageSize ? 1 : nextPage)
                  setPageSize(nextPageSize)
                }}
              />
            </div>
          </div>
        )}
      </Card>

      <CreateNotificationModal
        open={isCreating}
        onClose={() => {
          setIsCreating(false)
          form.resetFields()
          setRecipientType(RECIPIENT_TYPE.ALL)
          setDocuments([])
        }}
        form={form}
        onSubmit={handleCreateNotification}
        loading={createPending}
        recipientType={recipientType}
        setRecipientType={setRecipientType}
        documents={documents}
        setDocuments={setDocuments}
        uploadingDoc={uploadingDoc}
        beforeDocumentUpload={beforeDocumentUpload}
        handleDocumentUpload={handleDocumentUpload}
        handleRemoveDocument={handleRemoveDocument}
        isUsersLoading={isUsersLoading}
        userOptions={userOptions}
      />
    </div>
  )
}

export default FarmManagerNotifications
