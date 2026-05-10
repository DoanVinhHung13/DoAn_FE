import { Anchor } from "antd"
import { flatMap, forEach, isArray, isEmpty } from "lodash"
import moment from "moment"
import ButtonCircle from "src/components/MyButton/ButtonCircle"
import { DATE_FORMAT, formatDate } from "./dateFormatters"
import { fdtfM2 } from "./fdtf"
const { Link } = Anchor

export const removeKeyDown = () => {
  document.onkeydown = null
}
export const formatPrice = price => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price)
}

export const getSystemKeyDescription = (key, value, listSystemKey) => {
  if (!value || !listSystemKey) return ""

  const options = getListComboByKey(key, listSystemKey)
  const foundOption = options?.find(
    option => Number(option.CodeValue) === Number(value),
  )

  return foundOption?.Description || ""
}

// export const isValidValue = (value) => {
//   return value !== "" && value !== null && value !== undefined;
// };

export const getListComboByKey = (key, listSystemKey) => {
  const parent = listSystemKey?.find(x => x.CodeKey === key)
  if (parent)
    return listSystemKey
      ?.filter(x => x.ParentID === parent.ID)
      ?.sort((a, b) => {
        return a.SortOrder - b.SortOrder
      })
  return []
}

export const updateTreeData = (list, key, children) => {
  let arr = children.map(child => {
    return {
      ...child,
      title: child.regionName,
      key: child.regionID,
      isLeaf: child.regionLevel === 4,
    }
  })
  return list.map(node => {
    if (node.key === key) {
      return {
        ...node,
        children: arr,
      }
    }

    if (node?.children) {
      return {
        ...node,
        children: updateTreeData(node.children, key, children),
      }
    }
    return node
  })
}

export const hasPermission = (TabID, listTab) => {
  if (!TabID || TabID.length === 0) return true
  const IsVisitTab = listTab.some(item =>
    TabID.some(tab => tab === item.CategoryID && item.IsVistTab === true),
  )
  return IsVisitTab
}

export const renderStringTestForm = arr => {
  let array = []
  arr.forEach(item => {
    if (item === 1) {
      array.push(" Tại nhà")
    }
    if (item === 2) {
      array.push(" Bệnh viện/Phòng khám ")
    }
  })
  return array.toString()
}

export const loop = (a, b) => {
  let result = []
  a.forEach(a1 => {
    if (b.some(item => item.accountId === a1.accountId)) return
    result.push(a1)
  })
  return result
}

export const groupBy = (input, string) => {
  let result = []
  input.forEach(ele => {
    if (ele.level === 1) return
    if (result.find(item => item.serviceId === ele[string])) {
      const exitsItem = result.find(item => item.serviceId === ele[string])
      exitsItem.ltExamination.push(ele.key)
    } else {
      result.push({
        serviceId: ele[string],
        ltExamination: [ele.key],
      })
    }
  })
  return result
}

export const convertTreeDataUser = listData => {
  if (!listData || !listData.length) return []
  const listRoot = listData.filter(i => i.DeptLevel === 1)
  const listOther = listData.filter(i => i.DeptLevel !== 1)
  const treeDataConvert = convertChildrentUser(listRoot, listOther)
  return treeDataConvert
}

const convertChildrentUser = (listRoot, listOther) => {
  const newList = listRoot.map(root => {
    const newItem = {
      ...root,
      name: root.DeptName,
      label: root.DeptName,
      title: root.DeptName,
      key: root.DeptID,
      value: root.DeptID,
      id: root.DeptID,
    }
    const listChild = listOther.filter(i => i.DeptID === root.DeptID)
    const listOtherChild = listOther.filter(i => i.DeptID !== root.DeptID)
    if (listChild && listChild.length)
      return {
        ...newItem,
        children: convertChildrentUser(listChild, listOtherChild),
      }
    return newItem
  })
  return newList
}

export const convertTreeData = (listData, withAnchor = false) => {
  if (!listData || !listData.length) return []
  const listRoot = listData.filter(x => x.Level === 1)
  const listOther = listData.filter(y => y.Level !== 1)
  const treeDataConvert = convertChildrent(listRoot, listOther, withAnchor)

  return treeDataConvert
}
const convertChildrent = (listRoot, listOther, withAnchor) => {
  const newList = listRoot.map(root => {
    const newItem = {
      ...root,
      title: withAnchor ? (
        <Link href={`#${root.DepartmentID}`} title={root.DepartmentName} />
      ) : (
        root.DepartmentName
      ),
      key: root.DepartmentID,
      id: root.DepartmentID,
    }
    const listChild = listOther.filter(
      x => x.DepartmentParentID === root.DepartmentID,
    )
    const listOtherChild = listOther.filter(
      y => y.DepartmentParentID !== root.DepartmentID,
    )
    if (listChild && listChild.length)
      return {
        ...newItem,
        children: convertChildrent(listChild, listOtherChild, withAnchor),
      }
    return newItem
  })
  return newList
}

export const convertTreeRegion = listData => {
  if (!listData || !listData.length) return []
  const listRoot = listData.filter(x => x.regionLevel === 2)
  const listOther = listData.filter(y => y.regionLevel !== 2)
  const treeDataConvert = convertChildrentRegion(listRoot, listOther)

  return treeDataConvert
}

const convertChildrentRegion = (listRoot, listOther) => {
  const newList = listRoot.map(root => {
    const newItem = {
      ...root,
      title: root.regionName,
      key: root.regionID,
      isLeaf: root.regionLevel === 4,
    }
    const listChild = listOther.filter(x => x.parentID === root.regionID)
    const listOtherChild = listOther.filter(y => y.parentID !== root.regionID)
    if (listChild && listChild.length)
      return {
        ...newItem,
        children: convertChildrentRegion(listChild, listOtherChild),
      }
    return newItem
  })
  return newList
}

export const convertData = listRoot => {
  const newList = listRoot.map(root => {
    const newItem = {
      ...root,
      level: root.level,
      title: root.serviceName,
      price: root.price,
      note: root.note,
      serviceType: root.serviceType,
      key: root.serviceId,
      serviceId: root.serviceId,
      isLeaf: root.listService && root.listService.length > 0 ? false : true,
    }
    if (root.listService && root.listService.length)
      return {
        ...newItem,
        children: convertData(root.listService),
      }
    return newItem
  })
  return newList
}

export function submitFormWithCtrlS(formRef) {
  document.onkeydown = e => {
    if (e.ctrlKey && e.keyCode === 83) {
      e.preventDefault()
      formRef.current.submit()
    }
  }
}

export function submitFormWithCtrlKey(formRef, key = "s") {
  removeKeyDown()
  document.onkeydown = e => {
    if (e.ctrlKey && e.key === key.toLowerCase()) {
      e.preventDefault()
      formRef.current.submit()
    }
  }
}

export function findParent({ children = [], ...object }, key) {
  var result
  if (object.key === key) return object
  return (
    children.some(o => (result = findParent(o, key))) &&
    Object.assign({}, object, { children: [result] })
  )
}

export function convertTreeToList(root) {
  var stack = [],
    array = [],
    hashMap = {}
  stack.push(root)

  while (stack.length !== 0) {
    var node = stack.pop()
    if (!node.children) {
      visitNode(node, hashMap, array)
    } else {
      for (var i = node?.children?.length - 1; i >= 0; i--) {
        stack.push(node.children[i])
      }
    }
  }

  return array
}

function visitNode(node, hashMap, array) {
  if (!hashMap[node.key]) {
    hashMap[node.key] = true
    array.push(node)
  }
}

export function submitFormAntWithCtrlKey(form, key = 83) {
  document.onkeydown = e => {
    if (e.ctrlKey && e.keyCode === key) {
      e.preventDefault()
      form.submit()
    }
  }
}

export function handleCtrlKey(onHandle, key = "a") {
  const myFunc = e => {
    if (e.ctrlKey && e.key === key.toLowerCase()) {
      e.preventDefault()
      onHandle()
    }
  }
  document.addEventListener("keydown", myFunc)
  return myFunc
}

export function handlePressKey(onHandle, key = "a") {
  const myFunc = e => {
    if (e.key.toLowerCase() === key.toLowerCase()) {
      e.preventDefault()
      onHandle()
    }
  }
  document.addEventListener("keydown", myFunc)
  return myFunc
}

export function handleCtrlD(onSubmit) {
  document.onkeydown = e => {
    if (e.ctrlKey && e.keyCode === 68) {
      e.preventDefault()
      onSubmit()
    }
  }
}

export const isJsonString = str => {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}

export const trimData = data => {
  if (!data) return data
  const tempData = isArray(data) ? [] : {}
  forEach(data, (val, keyName) => {
    if (typeof val === "string") tempData[keyName] = val.trim()
    else if (typeof val === "object") tempData[keyName] = trimData(val)
    else tempData[keyName] = val
  })
  return tempData
}

export function submitFormUsingCtrlS(
  form,
  handleSubmit,
  isForm,
  formRef = null,
) {
  document.onkeydown = e => {
    if (e.ctrlKey && e.keyCode === 83) {
      e.preventDefault()
      if (formRef && formRef.current) {
        formRef.current.submit()
      } else if (isForm) {
        form.validateFields().then(values => {
          handleSubmit(values)
        })
      } else handleSubmit()
    }
  }
}

export const treeToListWithKey = (data = [], key = "value") => {
  let temVal = data
  forEach(data, item => {
    if (item.children) temVal = [...temVal, ...treeToList(item.children)]
  })
  return flatMap(temVal, item => item[key] || item)
}
export const treeToList = (data = []) => {
  let temVal = []
  forEach(data, item => {
    if (item.children) temVal = [...temVal, ...treeToList(item.children)]
    temVal = [...temVal, { ...item, children: undefined }]
  })
  return temVal?.filter(i => !isEmpty(i))
}
export const checkSafari = () =>
  /^((?!chrome|android).)*safari/i.test(navigator.userAgent)

export const checkTotalTime = (totalTime, workingDay) => {
  const dayOfWeek = moment(workingDay).day()
  const textTooltip = {
    enoughTime: "Ngày làm việc đủ thời lượng",
    lackOfTime: "Thiếu thời lượng của Ngày làm việc này",
    excessiveTime: "Thừa thời lượng của Ngày làm việc này",
  }
  const color = {
    enoughTime: "#212121",
    lackOfTime: "#BC2618",
    excessiveTime: "#18BC78",
  }
  const fontWeight = {
    enoughTime: "normal",
    lackOfTime: "bold",
    excessiveTime: "bold",
  }
  if (dayOfWeek === 0) return { text: "Ngày Chủ nhật", color: color.enoughTime }
  if (!totalTime) return
  if (dayOfWeek === 6) {
    if (totalTime >= 3.5 && totalTime <= 4) {
      return {
        text: textTooltip.enoughTime,
        color: color.enoughTime,
        fontWeight: fontWeight.enoughTime,
      }
    }
    if (totalTime < 3.5) {
      return {
        text: textTooltip.lackOfTime,
        color: color.lackOfTime,
        fontWeight: fontWeight.lackOfTime,
      }
    }
    if (totalTime > 4) {
      return {
        text: textTooltip.excessiveTime,
        color: color.excessiveTime,
        fontWeight: fontWeight.excessiveTime,
      }
    }
  } else {
    if (totalTime >= 7 && totalTime <= 8) {
      return {
        text: textTooltip.enoughTime,
        color: color.enoughTime,
        fontWeight: fontWeight.enoughTime,
      }
    }
    if (totalTime < 7) {
      return {
        text: textTooltip.lackOfTime,
        color: color.lackOfTime,
        fontWeight: fontWeight.lackOfTime,
      }
    }
    if (totalTime > 8) {
      return {
        text: textTooltip.excessiveTime,
        color: color.excessiveTime,
        fontWeight: fontWeight.excessiveTime,
      }
    }
  }
}

export const checkSumFunc = checkSum => {
  const statusSum = checkSum?.StatusSum
  const woringDayExcessive = checkSum?.WorkingDay_Thua?.map(item =>
    fdtfM2(item, "m2e"),
  )
  const workingDayLack = checkSum?.WorkingDay_Thieu?.map(item =>
    fdtfM2(item, "m2e"),
  )
  const status = {
    enough: 0,
    lack: 1,
    excessive: 2,
    lackExcessive: 3,
  }
  const color = {
    enough: "#212121",
    lack: "#BC2618",
    excessive: "#18BC78",
    lackExcessive: "#f2994b",
  }
  let result = {}
  switch (statusSum) {
    case status.enough:
      result = {
        color: color.enough,
        tooltip: "Đủ thời lượng",
        iconName: null,
        showIcon: false,
      }
      break
    case status.lack:
      result = {
        color: color.lack,
        tooltip: (
          <>
            - Có {workingDayLack?.length} Ngày làm việc thiếu thời lượng: <br />
            {workingDayLack?.join(", ")}{" "}
          </>
        ),
        iconName: "warning_red",
        showIcon: true,
      }
      break
    case status.excessive:
      result = {
        color: color.excessive,
        tooltip: (
          <>
            - Có {woringDayExcessive?.length} Ngày làm việc thừa thời lượng:{" "}
            <br />
            {woringDayExcessive?.join(", ")}
          </>
        ),
        iconName: "warning_green",
        showIcon: true,
      }
      break
    case status.lackExcessive:
      result = {
        color: color.lackExcessive,
        tooltip: (
          <>
            - Có {workingDayLack?.length} Ngày làm việc thiếu thời lượng: <br />
            {workingDayLack.join(", ")} <br />- Có {woringDayExcessive?.length}{" "}
            Ngày làm việc thừa thời lượng: <br />
            {woringDayExcessive.join(", ")}
          </>
        ),
        iconName: "warning_yellow",
        showIcon: true,
      }
      break
    default:
      break
  }
  return result
}

export const handleWorkingDay = (date, durationDate) => {
  let startDate = null
  let endDate = null
  const thisWeek = moment().startOf("week").toDate()
  const thisMonth = moment().startOf("months").toDate()
  const thisYear = moment().startOf("year").toDate()

  switch (date) {
    case 1:
      startDate = formatDate(thisWeek, DATE_FORMAT)
      endDate = formatDate(moment(), DATE_FORMAT)
      break
    case 2:
      startDate = formatDate(
        moment(thisWeek).subtract(1, "week").toDate(),
        DATE_FORMAT,
      )
      endDate = formatDate(moment(), DATE_FORMAT)
      break
    case 3:
      startDate = formatDate(thisMonth, DATE_FORMAT)
      endDate = formatDate(moment(), DATE_FORMAT)
      break
    case 4:
      startDate = formatDate(
        moment(thisMonth).subtract(1, "months").toDate(),
        DATE_FORMAT,
      )
      endDate = formatDate(moment(), DATE_FORMAT)
      break
    case 6:
      startDate = formatDate(moment(thisYear).toDate(), DATE_FORMAT)
      endDate = formatDate(moment(), DATE_FORMAT)
      break
    case 5:
      if (durationDate) {
        startDate = formatDate(durationDate[0], DATE_FORMAT)
        endDate = formatDate(durationDate[1], DATE_FORMAT)
      }
      break
    default:
      startDate = ""
      endDate = ""
  }

  return { startDate, endDate }
}

export const renderButtonCircle = (
  title,
  iconName,
  onClick,
  buttonCircle,
  btnType,
  fill,
  style,
) =>
  buttonCircle != null && (
    <ButtonCircle
      placement="bottomRight"
      title={title}
      iconName={iconName}
      onClick={onClick}
      enable={buttonCircle}
      btnType={btnType}
      fill={fill}
      style={style}
    />
  )

export const extracTreeData = (data, code, name) => {
  if (!data) return []
  return [
    {
      title: "Tất cả",
      value: "0",
      key: "0",
      children: data.map(item => {
        let title = `${item[code]} - ${item[name]}`
        if (!code) title = item[name]
        if (!name) title = item[code]
        return {
          title,
          value: item.id,
          children: [],
        }
      }),
    },
  ]
}

// contact list
export const nest = (items, id, link) =>
  items
    ?.filter(item => item[link] === id)
    .map(item => ({
      ...item,
      title: item.DepartmentName,
      value: item.DepartmentID,
      children: nest(items, item?.DepartmentID, link),
    }))

export const treeValue = (items, id, link) =>
  items
    .filter(item => item[link] === id)
    .map(item => ({
      ...item,
      title: item.departmentName,
      value: item.departmentId,
      key: item.departmentId,
      children: treeValue(items, item?.departmentId, link),
    }))

export const checkPermission = (user, menu, action) => {
  const { listTab } = user
  const { nameFromApi } = menu
  return listTab
    ?.filter(i => i?.description === nameFromApi)
    ?.filter(j => j?.button?.includes(action))?.length
}

export const formatMoney = money =>
  (Math.round(money * 100) / 100).toLocaleString()
export const getBase64 = file =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => reject(error)
  })

export const getRegexPassword = () => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/
  return regex
}

export const normFile = e => {
  if (Array.isArray(e)) {
    return e
  }
  return e?.fileList
}
export const arrayToTree = (items, id = null, parent = "parent_id", child) =>
  items
    .filter(item => item[parent] === id)
    .map(item => ({
      ...item,
      title: item?.DisplayName,
      value: item?.KeyID,
      children: arrayToTree(items, item[child], parent, child),
    }))

export const getRowSpans = (arr = [], key) => {
  let sameValueLength = 0
  const rowSpans = []
  for (let i = arr.length - 1; i >= 0; i--) {
    if (i === 0) {
      rowSpans[i] = sameValueLength + 1
      continue
    }
    if (arr[i][key] === arr[i - 1][key]) {
      rowSpans[i] = 0
      sameValueLength++
    } else {
      rowSpans[i] = sameValueLength + 1
      sameValueLength = 0
    }
  }
  return rowSpans
}

export const listDataFile = data =>
  data?.map(item => ({
    name: item?.FileName,
    url: item?.FileUrl,
    uid: item?.ObjectFileID,
    ...item,
  }))
export const listUidFile = data => {
  if (!!Array.isArray(data) && !!data?.length)
    return data?.map(item => {
      if (item?.ObjectFileID) return item?.ObjectFileID
      else return ""
    })
  else {
    return [""]
  }
}
export const scrollToTop = () => {
  const scrollContainer = document.querySelector(".main-content") || window
  if (scrollContainer === window) {
    window.scrollTo({ top: 0, behavior: "smooth" })
  } else {
    scrollContainer.scrollTo({ top: 0, behavior: "smooth" })
  }
}

export const validatorFileExtension = (fileName, acceptFile) => {
  const parts = fileName.split(".")
  let type = ""
  if (parts.length > 1) {
    type = parts.pop()
  }
  if (!!type && acceptFile.includes(type.toLowerCase())) return true
  return false
}


//- hàm tạo initial của name
export function generateInitials(name) {
  if (!name) return ""

  const words = name
    .trim()
    .split(/\s+/) // cắt khoảng trắng thừa
    .filter(Boolean)

  if (words.length === 0) return ""

  if (words.length === 1) {
    // Nếu chỉ có 1 từ -> chuẩn hóa (viết hoa chữ đầu, còn lại thường)
    const word = words[0].toLowerCase()
    return word.charAt(0).toUpperCase() + word.slice(1)
  }

  // Nếu có nhiều từ -> lấy chữ cái đầu của từ đầu + cuối (in hoa)
  const first = words[0][0]
  const last = words[words.length - 1][0]

  return (first + last).toUpperCase()
}

