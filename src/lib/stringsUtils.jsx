/* eslint-disable no-useless-escape */
import { Encoder } from "./encoder"

export const SYMBOLS_REGEX =
  /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|`|-|{|}|\||\\/g

export function generateRandomString() {
  return Math.random().toString(36).substr(7)
}
export const getRegexPassword = () => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/
  return regex
}
export function getRegexUsername() {
  const re = /^[a-zA-Z0-9_]{6,16}$/
  return re
}

export function generateCode(str, underscore = true) {
  if (!str) return ""
  str = str?.toLowerCase()
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i")
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
  str = str.replace(/đ/g, "d")
  str = str.replace(
    /!|@|%|\^|\*|\(|\)|\+|\=|\<|\>|\?|\/|,|\.|\:|\;|\'|\"|\&|\#|\[|\]|~|\$|_|`|-|{|}|\||\\/g,
    " ",
  )
  str = str.replace(/ + /g, " ")
  str = str.trim()
  str = str.toUpperCase()
  const matches = str.match(/\b(\w)/g)
  if (!matches) return ""
  const acronym = matches.join("")
  if (underscore) return `${acronym}_`
  return acronym
}

export function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function validatePhone(phone) {
  if (
    ((phone.startsWith("01") ||
      phone.startsWith("028") ||
      phone.startsWith("023") ||
      phone.startsWith("02")) &&
      phone.length === 11) ||
    ((phone.startsWith("03") ||
      phone.startsWith("05") ||
      phone.startsWith("07") ||
      phone.startsWith("08") ||
      phone.startsWith("09")) &&
      phone.length === 10)
  )
    return true
  return false
}

export function formatPhone(phone) {
  return phone.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3")
}

export function getMsgClient(message) {
  return message.indexOf("[!|") !== -1 && message.indexOf("|!]") !== -1
    ? message.split("[!|")[0].trim() + message.split("|!]")[1]
    : message
}

export function validateEmail(email) {
  const re = getRegexEmail()
  return re?.test(String(email)?.toLowerCase())
}

export function getRegexEmail() {
  const re = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/
  return re
}

export function validateMobile(mobile) {
  const re = getRegexMobile()
  return re?.test(String(mobile)?.toLowerCase())
}

export function getRegexPhoneNumber() {
  const re = /^(\+84|84|0)+(9|3|7|8|5)+([0-9]{8})\b/g
  return re
}

export function getRegexMobile() {
  const re = /^0[1-9][0-9]{8,9}$/
  return re
}

export const decodeHtml = textInput => {
  if (!textInput) return ""
  const removeHtml = textInput.replace(/<\/?[^>]+(>|$)/g, "")
  const decode = Encoder.htmlDecode(removeHtml)
  return decode
}

export const stripHtml = textInput => {
  if (!textInput) return ""
  return textInput.replace(/<\/?[^>]+(>|$)/g, "")
}

export const convertContent = text => {
  let content
  try {
    const parseText = JSON.parse(decodeHtml(text))
    content = [parseText?.ActionName, parseText?.ProcessedContent]
      .join(parseText?.ActionName && parseText?.ProcessedContent ? ": " : "")
      .concat(
        parseText?.SendReportHandle ? ` ${parseText?.SendReportHandle}` : "",
      )
  } catch (e) {
    content = text
  }
  return content
}

export const fixImplicateText = text => {
  if (!text) return ""
  return text
    ?.replace(/↵/g, " ")
    ?.replace(/(<div>|<p>)/g, "&nbsp;<span>")
    ?.replace(/(<\/div>|<\/p>)/g, "</span>")
    ?.replace(/(<div |<p )/g, "&nbsp;<span ")
    ?.replace(/(<br>|<br\/>|<\/br>|<br \/>)/g, " ")
}

export function getTimeSpent() {
  const re = /^(d[g|h]?)?(d{1}?[05][m|p])?$/
  return re
}

export function formatUserName(fullName, userName, deptName) {
  if (!userName) return `${fullName} - ${deptName}`
  if (!deptName) return ` ${userName} - ${fullName} `
  return `${fullName} - (${userName}) - ${deptName}`
}

export function getRegexIdentity() {
  const re = /^\d{12}$/
  return re
}

export const removeDiacritics = str => {
  // Chuyển các ký tự thường
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, "i")
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
  str = str.replace(/đ/g, "d")

  // Chuyển các ký tự in hoa
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, "A")
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, "E")
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, "I")
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, "O")
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, "U")
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, "Y")
  str = str.replace(/Đ/g, "D")

  // Trả về chuỗi đã xử lý
  return str
}
