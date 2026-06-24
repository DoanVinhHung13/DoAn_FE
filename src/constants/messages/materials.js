// Agricultural Materials Management Messages
// Based on UC-32 specifications

export const MATERIAL_MESSAGES = {
  // Confirmation messages
  STATUS_CONFIRM: 'Bạn có chắc muốn thay đổi trạng thái của vật tư này không?', // MSG-AMM-01
  
  // Success messages
  CREATE_SUCCESS: 'Tạo vật tư thành công.', // MSG-AMM-02
  UPDATE_SUCCESS: 'Cập nhật thông tin vật tư thành công.', // MSG-AMM-03
  STATUS_CHANGE_SUCCESS: 'Thay đổi trạng thái vật tư thành công.', // MSG-AMM-04
  LOAD_SUCCESS: 'Tải thông tin vật tư thành công.', // MSG-AMM-09
  
  // Validation errors (displayed under input fields)
  CODE_EXISTS: 'Mã vật tư đã tồn tại trong hệ thống.', // MSG-AMM-05
  NAME_EXISTS: 'Tên vật tư đã tồn tại trong hệ thống.', // MSG-AMM-06
  REQUIRED_FIELDS: 'Vui lòng điền đầy đủ các thông tin bắt buộc.', // MSG-AMM-07
  
  // Error messages
  NOT_FOUND: 'Không tìm thấy thông tin vật tư.', // MSG-AMM-08
  
  // Warning messages
  CANNOT_DEACTIVATE: 'Không thể vô hiệu hóa vật tư đang được sử dụng trong hoạt động sản xuất.', // MSG-AMM-10
  CANNOT_DELETE: 'Không thể xóa vật tư đã phát sinh dữ liệu trong hệ thống.', // MSG-AMM-11
  
  // Empty states
  NO_DATA: 'Không có dữ liệu phù hợp.', // MSG-AMM-12
};

export default MATERIAL_MESSAGES;
