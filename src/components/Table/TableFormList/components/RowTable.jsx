import { Col, Form, Row } from "antd"
import PropTypes from "prop-types"

export const RowTable = ({
  formTableName = "",
  columns,
  type,
  idx,
  name,
  add,
  remove,
  restField,
}) => {
  switch (type) {
    case "header":
      return (
        <Row wrap={false} style={{ backgroundColor: "#01638d" }}>
          {!!columns?.length &&
            columns?.map((item, idx) => {
              return (
                <Col
                  span={item?.span ? item?.span : undefined}
                  flex={item?.width ? undefined : "auto"}
                  key={`${formTableName}_header${idx}`}
                  style={{
                    borderRight: "1px solid #fff",
                    padding: 8,
                    minWidth: item?.minWidth
                      ? item?.minWidth
                      : item?.width
                      ? item?.width
                      : 120,
                    maxWidth: item?.width,
                  }}
                >
                  <div
                    style={
                      item?.align === "center"
                        ? {
                            textAlign: "center",
                            height: "100%",
                          }
                        : {
                            height: "100%",
                          }
                    }
                    className={item?.align === "center" ? "d-flex-center" : ""}
                  >
                    {item?.title()}
                  </div>
                </Col>
              )
            })}
        </Row>
      )

    case "body":
      return (
        <Row wrap={false} key={`${formTableName}_form-list${idx}`}>
          {!!columns?.length &&
            columns?.map((item, idxCol) => {
              const {
                nameFormItem = "",
                labelFormItem = "",
                rulesFormItem = [],
                render = () => {},
              } = item
              return (
                <Col
                  span={item?.span ? item?.span : undefined}
                  flex={item?.width ? undefined : "auto"}
                  style={{
                    border: "0.5px solid #f0f0f0",
                    padding: 8,
                    minWidth: item?.minWidth
                      ? item?.minWidth
                      : item?.width
                      ? item?.width
                      : 120,
                    maxWidth: item?.width,
                  }}
                  key={`${formTableName}_cell${idx}_${idxCol}`}
                >
                  <div
                    className={item?.align === "center" ? "d-flex-center" : ""}
                  >
                    <Form.Item
                      {...restField}
                      style={{
                        margin: 0,
                      }}
                      name={[name, nameFormItem]}
                      label={!idx ? labelFormItem : undefined}
                      rules={rulesFormItem}
                    >
                      {render({ add, remove, name, idx })}
                    </Form.Item>
                  </div>
                </Col>
              )
            })}
        </Row>
      )
    default:
      return <></>
  }
}
RowTable.propTypes = {
  formTableName: PropTypes.string,
  columns: PropTypes.array,
  type: PropTypes.string,
  idx: PropTypes.number,
  name: PropTypes.string,
  add: PropTypes.func,
  remove: PropTypes.func,
  restField: PropTypes.object,
}

RowTable.defaultProps = {
  formTableName: "",
  columns: [],
  type: "",
  name: "",
  add: () => {},
  remove: () => {},
  restField: {},
}
