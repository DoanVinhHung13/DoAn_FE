// src/hooks/useUploadFile.js
import { useMutation, useQueryClient } from "@tanstack/react-query"
import FileService from "../services/FileService"

/**
 * useUploadFile: hook để upload một file
 * Trả về:
 *  - mutate: hàm gọi lên server, nhận vào FormData hoặc object tuỳ bạn
 *  - isLoading, isError, error, data (mà server trả về)
 */
const useUploadFile = () => {
  const queryClient = useQueryClient()

  return useMutation(
    // mutationFn: nhận vào body (FormData hoặc object), trả về Promise từ axios
    body => FileService.uploadFile(body).then(res => res.data),
    {
      // onSuccess: khi upload thành công
      onSuccess: data => {
        // Tuỳ trường hợp, nếu bạn muốn invalidate/refresh các query liên quan,
        // ví dụ có query nào dùng dữ liệu file mới này, bạn có thể:
        // queryClient.invalidateQueries(["someQueryKey"]);
        console.log("Upload file thành công:", data)
      },
      // onError: có lỗi khi upload
      onError: error => {
        console.error("Lỗi khi upload file:", error)
      },
      // onSettled: luôn chạy dù thành công hay thất bại
      onSettled: () => {
        // Ví dụ: luôn refetch một số queries
      },
    },
  )
}

export default useUploadFile
