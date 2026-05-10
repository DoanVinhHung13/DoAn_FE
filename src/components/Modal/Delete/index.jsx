import PropTypes from "prop-types"
import ButtonCustom from "src/components/MyButton/Button"
import SvgIcon from "src/components/SvgIcon"
import CustomModal from "../CustomModal"
import styles from "./styles.module.scss"

export default function Delete(props) {
  const { content, onCancel, onOk, isOpen, loading } = props

  return (
    <CustomModal
      visible={isOpen}
      closable
      destroyOnClose
      maskClosable={false}
      footer={null}
      width={614}
      style={{ top: 200 }}
      onCancel={onCancel}
    >
      <div className={styles.trashCan}>
        <SvgIcon name="delete-profile" />
      </div>
      {content && <div className={styles.textContent}>{content.title}</div>}
      <div className="d-flex justify-content-center">
        <ButtonCustom
          btnType="gray-style"
          className={styles.btnCancel}
          onClick={onCancel}
        >
          Đóng
        </ButtonCustom>
        {onOk && (
          <ButtonCustom loading={loading} onClick={onOk}>
            Đồng ý
          </ButtonCustom>
        )}
      </div>
    </CustomModal>
  )
}

Delete.propTypes = {
  isOpen: PropTypes.bool,
  content: PropTypes.shape({
    title: PropTypes.any,
    value: PropTypes.string,
  }),
  onOk: PropTypes.func,
  onCancel: PropTypes.func,
  loading: PropTypes.bool,
}

Delete.defaultProps = {
  isOpen: false,
  content: {
    title: "",
    value: "",
  },
  onOk: null,
  onCancel: null,
  loading: false,
}
