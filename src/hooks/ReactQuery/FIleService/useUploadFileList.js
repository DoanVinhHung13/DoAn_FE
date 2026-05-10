// src/hooks/useUploadFileList.js
import { useMutation, useQueryClient } from "@tanstack/react-query"
import FileService from "../services/FileService"

/**
 * useUploadFileList: hook để upload danh sách file (multiple)
 */
const useUploadFileList = () => {
  const queryClient = useQueryClient()

  return useMutation(
    body => FileService.uploadFileList(body).then(res => res.data),
    {
      onSuccess: data => {
        console.log("Upload danh sách file thành công:", data)
        // Nếu có query liên quan đến list file, có thể invalidate tại đây
        // queryClient.invalidateQueries(["listFiles"]);
      },
      onError: error => {
        console.error("Lỗi khi upload danh sách file:", error)
      },
    },
  )
}

export default useUploadFileList
