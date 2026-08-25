import { message } from "antd"

export const unwrap = res => res?.data?.data ?? res?.data ?? res

export const getPublicTraceUrl = code => {
  if (!code) return ""
  return `${window.location.origin}/trace/${code}`
}

export const downloadQrAsPng = (svgElement, batchCode = "LOT", traceCode = "QR") => {
  if (!svgElement) return

  const svgData = new XMLSerializer().serializeToString(svgElement)
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  const img = new window.Image()

  img.onload = () => {
    canvas.width = img.width + 40
    canvas.height = img.height + 40
    if (ctx) {
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 20, 20)
    }
    const pngFile = canvas.toDataURL("image/png")
    const downloadLink = document.createElement("a")
    downloadLink.download = `QR_${batchCode}_${traceCode}.png`
    downloadLink.href = pngFile
    downloadLink.click()
    message.success("Tải xuống mã QR thành công!")
  }

  img.src =
    "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)))
}

export const printQrCode = (svgElement, batchCode = "N/A", traceCode = "") => {
  const printWindow = window.open("", "", "width=600,height=600")
  if (!printWindow) {
    message.error("Trình duyệt đã chặn cửa sổ pop-up in.")
    return
  }

  const svgHtml = svgElement ? svgElement.outerHTML : ""

  printWindow.document.write(`
    <html>
      <head>
        <title>In mã QR - ${batchCode}</title>
        <style>
          body { text-align: center; padding: 30px; font-family: Arial, sans-serif; }
          .qr-box { display: inline-block; padding: 20px; border: 2px solid #16a34a; border-radius: 12px; }
          .title { color: #166534; font-size: 20px; font-weight: bold; margin-bottom: 10px; }
          .code { font-weight: bold; margin-top: 15px; font-size: 16px; color: #15803d; }
          .sub { color: #6b7280; font-size: 13px; margin-top: 5px; }
        </style>
      </head>
      <body>
        <div class="qr-box">
          <div class="title">Truy Xuất Nguồn Gốc Nông Sản</div>
          <div>${svgHtml}</div>
          <div class="code">Mã lô: ${batchCode}</div>
          <div class="sub">Mã truy xuất: ${traceCode}</div>
        </div>
      </body>
    </html>
  `)
  printWindow.document.close()
  printWindow.print()
}
