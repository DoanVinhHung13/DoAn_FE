import { Breadcrumb } from "antd"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import LayoutCommon from "src/components/Common/LayoutCommon"
import { findParent, treeToList } from "src/lib/utils"
import { MenuItemBreadcrumbs } from "src/router/MenuItem"
import ROUTER from "src/router/ROUTER"
import styled from "styled-components"
const BreadcrumbHomeStyle = styled.div`
  .ant-breadcrumb-link {
    font-weight: 100 !important;
    cursor: pointer;
    font-size: 14px;
    color: #272727 !important;
    padding: 1px 8px;
    font-weight: 400 !important;

    &:hover {
      text-decoration: none;
      font-weight: 400 !important;
    }
  }

  li:last-child {
    .ant-breadcrumb-link {
      cursor: unset;
      font-weight: 600 !important;
      color: white;
    }
  }
  .breadcrumb-header {
    padding: 2px 8px;

    background-color: #ebebeb !important;
    /* background-color: #154398 !important; */

    box-shadow: unset;
  }
  .ant-breadcrumb-separator {
    color: #272727 !important ;
    margin: 0px 2px;
  }
`
const BreadcrumbHome = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const pathSpecial = [ROUTER.QUAN_LY_PHAN_QUYEN]?.find(i =>
    location?.pathname?.includes(i),
  )
  const locationPathName = pathSpecial ? pathSpecial : location?.pathname

  const treeLabel = tree => {
    if (tree?.length <= 0) return
    return tree?.map(i => ({
      ...i,
      title: i?.label,
      children: treeLabel(i?.children),
    }))
  }
  const [listParent, setListParent] = useState([])
  useEffect(() => {
    const items = treeLabel(MenuItemBreadcrumbs())
    const parents =
      findParent(
        { children: items },
        `${locationPathName}${location?.search}`,
      ) || findParent({ children: items }, `${locationPathName}`)
    setListParent(
      treeToList([parents], "key")
        .reverse()
        ?.filter(i => i?.label),
    )
  }, [location])

  return (
    <BreadcrumbHomeStyle>
      {listParent?.length > 0 && (
        <div className="box-breadcrumb-header">
          <div className="breadcrumb-header">
            <LayoutCommon>
              <Breadcrumb separator=">">
                <Breadcrumb.Item
                  style={{
                    cursor: "pointer",
                  }}
                  // href={ROUTER?.HOME}
                  onClick={() => {
                    navigate(ROUTER.HOME)
                  }}
                >
                  Trang chủ
                </Breadcrumb.Item>
                {listParent?.map((i, idx) => (
                  <Breadcrumb.Item
                    style={{
                      cursor:
                        !i?.key?.includes("subkey") &&
                        idx !== listParent?.length - 1
                          ? "pointer"
                          : "unset",
                    }}
                    onClick={() => {
                      if (i?.state) {
                        navigate(
                          i?.key?.includes("subkey") ||
                            idx === listParent?.length - 1
                            ? undefined
                            : i?.key,
                          i?.state,
                        )
                      } else {
                        navigate(
                          i?.key?.includes("subkey") ||
                            idx === listParent?.length - 1
                            ? undefined
                            : i?.key,
                        )
                      }
                    }}
                    key={i?.key}
                  >
                    {i?.label}
                  </Breadcrumb.Item>
                ))}
              </Breadcrumb>
            </LayoutCommon>
          </div>
        </div>
      )}
    </BreadcrumbHomeStyle>
  )
}

export default BreadcrumbHome
