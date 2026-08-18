import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  listSystemKey: [], // config hệ thống (dropdown, loại…)
  userInfo: {}, // thông tin user đang đăng nhập
  numberNotify: 0, // số thông báo chưa đọc
}

export const appGlobalSlice = createSlice({
  name: "appGlobal",
  initialState,
  reducers: {
    getListSystemKey: (state, action) => {
      state.listSystemKey = action.payload || []
    },
    setUserInfo: (state, action) => {
      state.userInfo = action.payload
    },
    setNumberNotify: (state, action) => {
      state.numberNotify = action.payload
    },
  },
})

export const { getListSystemKey, setUserInfo, setNumberNotify } =
  appGlobalSlice.actions

export default appGlobalSlice.reducer
