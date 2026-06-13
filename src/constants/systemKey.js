// src/constants/systemKey.js

/**
 * Định nghĩa các hằng số (constants) để lấy SystemKey.
 * Việc này giúp tránh gõ sai (typo) chuỗi (magic string) và hỗ trợ gợi ý code.
 */
export const SYSTEM_KEY = {
  STATUS: "STATUS",
  ROLE: "ROLE",
  GENDER: "GENDER",
  CROP_TYPE: "CROP_TYPE",           // Loại cây trồng (Cây rau, Cây củ, Cây ăn trái...)
  CROP_STATUS: "CROP_STATUS",       // Trạng thái cây trồng
  CROP_PROCESS: "CROP_PROCESS",     // Quy trình canh tác (VietGAP, Organic, GlobalGAP...)
}
