import { Upload } from "antd"
import axios from "axios"
import React, { useCallback, useEffect, useState } from "react"
import STORAGE, { getStorage } from "src/redux/storage"
import Notice from "../Notice"

const { Dragger } = Upload

const UploadCustom = ({
  params,
  api,
  beforeUpload,
  onOk,
  isDragger = false,
  nameFileUpload = "file",
  ...props
}) => {
  const [listFile, setListFile] = useState([])

  const onUpload = useCallback(() => {
    const formData = new FormData()
    listFile.forEach(file => {
      formData.append(nameFileUpload, file)
    })
    if (params) {
      const listValue = Object.entries(params)
      listValue?.forEach(i => formData.append(i[0], i[1]))
    }

    axios({
      method: "POST",
      url: `${window.env?.API_ROOT || import.meta.env.VITE_API_ROOT}/api/${api}`,
      headers: {
        Authorization: getStorage(STORAGE.TOKEN),
      },
      data: formData,
    })
      .then(resp => resp?.data)
      .then(res => {
        if (res?.isError)
          return Notice({
            isSuccess: false,
            msg: res?.Object,
          })
        if (onOk) onOk(res)
      })
      .finally(() => {
        setListFile([])
      })
  }, [api, listFile, nameFileUpload, onOk, params])

  useEffect(() => {
    if (listFile?.length) onUpload()
  }, [listFile, onUpload])

  const dragProps = {
    name: "file",
    multiple: false,
    itemRender: () => <div />,
    headers: {
      Authorization: getStorage(STORAGE.TOKEN),
    },
    fileList: [],

    onDrop() {},
    ...props,
    beforeUpload: (file, filelist) => {
      if (beforeUpload) beforeUpload(filelist)
      setListFile(filelist)
      return false
    },
  }

  return React.createElement(isDragger ? Dragger : Upload, { ...dragProps })
}

export default UploadCustom
