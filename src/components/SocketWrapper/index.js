import {
  HttpTransportType,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr"
// import { MessagePackHubProtocol } from "@microsoft/signalr-protocol-msgpack"; // Đã xóa import không cần thiết

/**
 * Lớp SignalRService quản lý kết nối đến Hub.
 * Được thiết kế theo mô hình Singleton để đảm bảo chỉ có một instance duy nhất.
 */
class SignalRService {
  constructor() {
    this.connection = null
    this.hubUrl = "https://api-qlhv.hhsk.h2qsolution.com/signalrServer" // URL của Hub
  }

  /**
   * Khởi tạo và bắt đầu kết nối đến SignalR Hub.
   * @returns {Promise<HubConnection>} Promise chứa đối tượng connection sau khi kết nối thành công.
   */
  startConnection = async () => {
    // Nếu đã có kết nối thì không tạo mới
    if (this.connection && this.connection.state === "Connected") {
      console.log("SignalR connection already established.")
      return this.connection
    }

    try {
      // Xây dựng kết nối
      const newConnection = new HubConnectionBuilder()
        .withUrl(this.hubUrl, {
          transport: HttpTransportType.LongPolling,
          // THÊM VÀO: Cung cấp token để xác thực
          accessTokenFactory: () => {
            // Lấy token từ nơi bạn lưu trữ nó, ví dụ: localStorage, sessionStorage, Redux store, etc.
            // Đoạn code này giả định bạn lưu token trong localStorage với key là 'your_auth_token'.
            // Vui lòng thay thế 'your_auth_token' bằng key thực tế mà bạn sử dụng.
            const token = sessionStorage.getItem("token-qlhv_hd")
            return token
          },
        })
        // .withHubProtocol(new MessagePackHubProtocol()) // FIX: Đã xóa dòng này để sử dụng giao thức JSON mặc định
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build()

      // Bắt đầu kết nối
      await newConnection.start()
      console.log("✅ Kết nối thành công đến SignalR Hub")

      this.connection = newConnection
      return this.connection
    } catch (err) {
      console.error("❌ Lỗi khi kết nối đến SignalR Hub: ", err)
      throw err
    }
  }

  /**
   * Dừng kết nối đến Hub.
   */
  stopConnection = async () => {
    if (this.connection && this.connection.state === "Connected") {
      try {
        await this.connection.stop()
        console.log("🧹 Ngắt kết nối SignalR.")
        this.connection = null
      } catch (err) {
        console.error("❌ Lỗi khi ngắt kết nối SignalR: ", err)
      }
    }
  }

  /**
   * Đăng ký một hàm callback để lắng nghe sự kiện từ Hub.
   * @param {string} eventName Tên sự kiện.
   * @param {function} callback Hàm sẽ được gọi khi có sự kiện.
   */
  on = (eventName, callback) => {
    if (!this.connection) {
      console.error(
        "SignalR connection not started. Cannot register event listener.",
      )
      return
    }
    this.connection.on(eventName, callback)
  }

  /**
   * Hủy đăng ký lắng nghe sự kiện từ Hub.
   * @param {string} eventName Tên sự kiện.
   * @param {function} callback Hàm đã đăng ký trước đó.
   */
  off = (eventName, callback) => {
    if (!this.connection) {
      return
    }
    this.connection.off(eventName, callback)
  }

  /**
   * Gọi một phương thức trên Hub.
   * @param {string} methodName Tên phương thức trên Hub.
   * @param  {...any} args Các tham số cho phương thức.
   * @returns {Promise<any>}
   */
  invoke = (methodName, ...args) => {
    if (!this.connection) {
      console.error("SignalR connection not started. Cannot invoke method.")
      return Promise.reject("Connection not established.")
    }
    return this.connection.invoke(methodName, ...args)
  }
}

// Tạo và export một instance duy nhất (Singleton)
const signalRService = new SignalRService()
export default signalRService
