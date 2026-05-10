import { Empty, Table } from "antd"
import PropTypes from "prop-types"
import { TableCustomStyled } from "./styled"

TableCustom.propTypes = {
  isPrimary: PropTypes.bool,
  isStickyScrroll: PropTypes.bool,
  textEmpty: PropTypes.node,
  dataSource: PropTypes.array,
}

TableCustom.defaultProps = {
  isPrimary: true,
  isStickyScrroll: true,
  textEmpty: "Không có dữ liệu",
  dataSource: [],
}

function TableCustom(props) {
  const { isPrimary, isStickyScrroll, textEmpty, dataSource, ...rest } = props
  return (
    <TableCustomStyled
      $isPrimary={isPrimary}
      $isStickyScrroll={isStickyScrroll}
    >
      <Table
        bordered
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={textEmpty}
            />
          ),
        }}
        scroll={dataSource?.length ? { x: "100%" } : {}}
        dataSource={dataSource}
        {...rest}
      />
    </TableCustomStyled>
  )
}

export default TableCustom

export const SELECTION_COLUMN = Table.SELECTION_COLUMN
