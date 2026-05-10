import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  listSystemKey: [],
  listTabs: [],
  userInfo: {},
  numberNotify: 0,
}

export const appGlobalSlice = createSlice({
  name: "appGlobal",
  initialState,
  reducers: {
    getListSystemKey: (state, action) => {
      state.listSystemKey = action.payload || []
    },
    setListTabs: (state, action) => {
      state.listTabs = action.payload
    },
    setUserInfo: (state, action) => {
      state.userInfo = action.payload
    },
    setNumberNotify: (state, action) => {
      state.numberNotify = action.payload
    },
    
  },
})

export const { getListSystemKey, setUserInfo, setListTabs ,setNumberNotify} =
  appGlobalSlice.actions

export default appGlobalSlice.reducer
