import { Form } from "antd"
import PropTypes from "prop-types"
import { RowTable } from "./components/RowTable"
import { TableFormListStyle } from "./styles"

const TableFormList = props => {
  const { FormListProps, columns = [], formTableName } = props

  return (
    <TableFormListStyle>
      <Form.List {...FormListProps}>
        {(fields, { add, remove }) => (
          <>
            <div
              style={{
                border: "0.5px solid #01638d",
                fontWeight: 600,
                minWidth: "fit-content",
              }}
            >
              <RowTable columns={columns} type="header" />
            </div>
            <div
              style={{
                backgroundColor: "#fff",
                border: "0.5px solid #f0f0f0",
                minWidth: "fit-content",
              }}
            >
              {fields.length > 0 ? (
                fields.map(({ key, name, ...restField }, idx) => (
                  <RowTable
                    formTableName={props?.formTableName}
                    columns={columns}
                    type="body"
                    idx={idx}
                    name={name}
                    add={add}
                    remove={remove}
                    restField={restField}
                    key={`RowTable${key}`}
                  />
                ))
              ) : (
                <RowTable
                  formTableName={formTableName || ""}
                  columns={columns}
                  type="body"
                  idx={0}
                  name={0}
                  add={() => {}}
                  remove={() => {}}
                  restField={{}}
                />
              )}
            </div>
          </>
        )}
      </Form.List>
    </TableFormListStyle>
  )
}

TableFormList.propTypes = {
  FormListProps: PropTypes.object,
  columns: PropTypes.array,
  formTableName: PropTypes.string,
}

TableFormList.defaultProps = {
  FormListProps: {},
  columns: {},
  formTableName: "",
}

export default TableFormList
