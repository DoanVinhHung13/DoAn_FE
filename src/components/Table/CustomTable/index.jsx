import { Empty, Table } from "antd"
import PropTypes from "prop-types"
import { TableCustomStyled } from "./styled"
import AdminPaginationCard from "../AdminPaginationCard"

TableCustom.propTypes = {
  isPrimary: PropTypes.bool,
  isStickyScrroll: PropTypes.bool,
  textEmpty: PropTypes.node,
  dataSource: PropTypes.array,
  onRow: PropTypes.func,
}

TableCustom.defaultProps = {
  isPrimary: true,
  isStickyScrroll: true,
  textEmpty: "Không có dữ liệu",
  dataSource: [],
}

function TableCustom(props) {
  const {
    isPrimary,
    isStickyScrroll,
    textEmpty,
    dataSource,
    scroll,
    onRow,
    pagination,
    ...rest
  } = props
  return (
    <>
      <TableCustomStyled
        $isPrimary={isPrimary}
        $isStickyScrroll={isStickyScrroll}
        $hasRowClick={Boolean(onRow)}
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
          scroll={scroll || (dataSource?.length ? { x: "max-content" } : {})}
          dataSource={dataSource}
          onRow={onRow}
          pagination={pagination === undefined ? undefined : false}
          {...rest}
        />
      </TableCustomStyled>
      <AdminPaginationCard pagination={pagination} />
    </>
  )
}

export default TableCustom
