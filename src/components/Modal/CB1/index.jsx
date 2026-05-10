import SvgIcon from "src/components/SvgIcon"
import { ModalStyled, ModalWrapper } from "./styled"
export default function CB1({
  width = 600,
  title,
  titleHtml = "",
  icon = "warning-usb",
  okText = "Đồng ý",
  cancelText = "Đóng",
  onOk = e => e(),
  onCancel = e => e(),
  showCancel = true,
  okButtonProps = {},
  warningTitle = false,
  ...props
}) {
  ModalStyled.confirm({
    icon: null,
    okText,
    cancelText,
    width,
    onOk,
    onCancel,
    maskClosable: true,
    okButtonProps: {
      style: {
        // fontWeight: 700,
        padding: "16px, 16px, 16px, 16px",
        borderRadius: 4,
        height: 32,
        background: `#01638D`,
        ...okButtonProps,
      },
    },
    cancelButtonProps: {
      style: {
        // fontWeight: 700,
        borderRadius: 4,
        padding: "16px, 16px, 16px, 16px",
        height: 32,
        color: `#000`,
        border: "1px solid #F1F3F5",
        background: `#F1F3F5`,
      },
    },
    wrapClassName: "cb1",
    showCancel: showCancel,
    ...props,
    content: (
      <ModalWrapper className="d-flex justify-content-center align-items-center flex-column">
        {icon && (
          <div className="trashCan">
            <SvgIcon name={icon} />
          </div>
        )}
        {!!title && (
          <div
            className={`textTitle ${warningTitle ? "text-title-warming" : ""}`}
            dangerouslySetInnerHTML={{ __html: title }}
          />
        )}
        {titleHtml}
      </ModalWrapper>
    ),
  })
}
