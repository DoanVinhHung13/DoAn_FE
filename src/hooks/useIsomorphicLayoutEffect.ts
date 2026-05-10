// - useIsomorphicLayoutEffect là một hook thường được sử dụng trong các ứng dụng React hoặc Next.js
// để xử lý các vấn đề liên quan đến việc thực thi mã trên cả client và server.

// - Vấn đề khi dùng useLayoutEffect trên server-side:
// Khi bạn chạy React trong môi trường server (như Next.js), nếu bạn sử dụng useLayoutEffect, React sẽ cảnh báo vì hook này dựa vào sự tồn tại của DOM, nhưng DOM không tồn tại trên server.

// - Cách useIsomorphicLayoutEffect giải quyết:
// useIsomorphicLayoutEffect là một giải pháp để thay thế useLayoutEffect khi bạn cần hỗ trợ cả server-side rendering (SSR) và client-side rendering (CSR). Nó hoạt động bằng cách sử dụng:

// useLayoutEffect trên client.
// useEffect trên server.
import { useEffect, useLayoutEffect } from "react"

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

export default useIsomorphicLayoutEffect
