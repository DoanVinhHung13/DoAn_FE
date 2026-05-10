import { ClockCircleOutlined } from "@ant-design/icons"
import {
  Avatar,
  Button,
  Divider,
  Empty,
  Input,
  List,
  message,
  Radio,
  Spin,
  Typography,
} from "antd"
import { useEffect, useState } from "react"
import ButtonCustom from "src/components/MyButton/Button"
import Notify from "../../../../services/Notify"
import "./NotificationPopup.scss"

const { Text } = Typography

const NotificationPopup = () => {
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const fetchNotifications = async (page = 1, filters = {}) => {
    setLoading(true)
    try {
      const params = {
        textSearch: filters.textSearch || undefined,
      }

      if (filters.filterType === "unread") {
        params.isRead = false
      } else if (filters.filterType === "read") {
        params.isRead = true
      }

      const response = await Notify.getListNotify(params)

      if (response && response.isOk) {
        const apiData = response.Object || []
        const formattedNotifications = apiData.map(item => ({
          id: item.NotifyId,
          title: item.Title,
          content: item.Content,
          time: item.TimeAgo,
          isRead: item.IsRead,
          avatar: item.Logo,
          accountName: item.AccountName,
        }))
        setNotifications(formattedNotifications)
        setCurrentPage(page)
      } else {
        message.error(
          response?.Title ||
            response?.message ||
            "Không thể tải danh sách thông báo",
        )
        setNotifications([])
      }
    } catch (error) {
      console.error("Lỗi khi tải thông báo:", error)
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications(1)
  }, [])

  const markAsRead = async id => {
    const notificationToUpdate = notifications.find(n => n.id === id)
    if (!notificationToUpdate || notificationToUpdate.isRead) {
      return
    }

    const originalNotifications = [...notifications]
    setNotifications(prev =>
      prev.map(notif => (notif.id === id ? { ...notif, isRead: true } : notif)),
    )

    try {
      const response = await Notify.markOneAsRead(id)

      // Kiểm tra response thành công từ API
      if (!response?.isOk && !response?.success) {
        throw new Error(response?.message || "API trả về lỗi")
      }
    } catch (error) {
      console.error("Lỗi khi đánh dấu thông báo đã đọc:", error)
      setNotifications(originalNotifications)
    }
  }

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.isRead)
    if (unreadNotifications.length === 0) return

    const originalNotifications = [...notifications]
    setNotifications(prev => prev.map(notif => ({ ...notif, isRead: true })))

    try {
      const response = await Notify.markAllAsRead()

      if (!response?.isOk && !response?.success) {
        throw new Error(response?.message || "API trả về lỗi")
      }
      message.success("Đã đánh dấu tất cả thông báo là đã đọc")
    } catch (error) {
      console.error("Lỗi khi đánh dấu tất cả đã đọc:", error)
      setNotifications(originalNotifications)
    }
  }

  const deleteNotification = async id => {
    const originalNotifications = [...notifications]
    setNotifications(prev => prev.filter(notif => notif.id !== id))

    try {
      const response = await Notify.deleteNotifyForUser({ notificationId: id })

      if (!response?.isOk && !response?.success) {
        throw new Error(response?.message || "API xóa trả về lỗi")
      }
      message.success("Đã xóa thông báo")

      if (notifications.length === 1 && currentPage > 1) {
        fetchNotifications(currentPage - 1)
      }
    } catch (error) {
      console.error("Lỗi khi xóa thông báo:", error)
      setNotifications(originalNotifications)
    }
  }

  const deleteAllNotifications = async () => {
    if (notifications.length === 0) return
    const originalNotifications = [...notifications]
    setNotifications([])
    try {
      const response = await Notify.deleteNotifyForUser()
      if (!response?.isOk && !response?.success) {
        throw new Error(response?.message || "API xóa tất cả trả về lỗi")
      }

      message.success("Đã xóa tất cả thông báo")
    } catch (error) {
      console.error("Lỗi khi xóa tất cả thông báo:", error)
      setNotifications(originalNotifications)
    }
  }

  const handleSearch = value => {
    setSearchTerm(value)
    fetchNotifications(1, { textSearch: value, filterType: filter })
  }

  const handleFilterChange = e => {
    const newFilter = e.target.value
    setFilter(newFilter)
    fetchNotifications(1, { textSearch: searchTerm, filterType: newFilter })
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="notification-popup">
      {/* Header */}
      <div className="notification-header">
        <Text strong>Thông báo</Text>
        {unreadCount > 0 && (
          <ButtonCustom
            type="link"
            size="small"
            onClick={markAllAsRead}
            style={{ fontSize: "12px" }}
          >
            Đánh dấu tất cả đã đọc
          </ButtonCustom>
        )}
      </div>
      <Divider className="" />

      <div className="notification-controls">
        <Input.Search
          placeholder="Tìm kiếm..."
          onSearch={handleSearch}
          allowClear
          disabled={loading}
          onChange={e => setSearchTerm(e.target.value)}
          value={searchTerm}
        />
        <Radio.Group
          value={filter}
          onChange={handleFilterChange}
          size="small"
          disabled={loading}
        >
          <Radio.Button value="all">Tất cả</Radio.Button>
          <Radio.Button value="unread">
            Chưa đọc {unreadCount > 0 && `(${unreadCount})`}
          </Radio.Button>
          <Radio.Button value="read">Đã đọc</Radio.Button>
        </Radio.Group>
      </div>

      {/* Body */}
      <Spin spinning={loading} style={{ minHeight: 150, width: "100%" }}>
        {!loading && notifications.length === 0 ? (
          <Empty
            description="Không có thông báo"
            className="notification-empty"
          />
        ) : (
          <List
            className="notification-list"
            itemLayout="horizontal"
            dataSource={notifications}
            renderItem={item => (
              <List.Item
                className={`notification-item ${!item.isRead ? "unread" : ""}`}
                onClick={() => markAsRead(item.id)}
                // actions={
                //   <Button
                //     type="text"
                //     danger
                //     icon={<DeleteOutlined />}
                //     size="small"
                //     onClick={e => {
                //       e.stopPropagation()
                //       deleteNotification(item.id)
                //     }}
                //   />
                // }
              >
                <List.Item.Meta
                  avatar={<Avatar src={item.avatar} />}
                  title={
                    <div className="notification-item-title">
                      <Text strong={!item.isRead}>{item.title}</Text>
                      {!item.isRead && <div className="unread-dot" />}
                    </div>
                  }
                  description={
                    <>
                      <Text
                        type="secondary"
                        className="notification-item-content"
                      >
                        {item.content}
                      </Text>
                      <Text type="secondary" className="notification-item-time">
                        <ClockCircleOutlined /> {item.time}
                      </Text>
                      {item.accountName && (
                        <Text
                          type="secondary"
                          className="notification-item-user"
                        >
                          • {item.accountName}
                        </Text>
                      )}
                    </>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Spin>
      <Divider className="notification-divider" />

      {/* Footer */}
      <div className="notification-footer">
        <Button
          danger
          size="small"
          onClick={deleteAllNotifications}
          disabled={notifications.length === 0}
        >
          Xoá tất cả
        </Button>
      </div>
    </div>
  )
}

export default NotificationPopup
