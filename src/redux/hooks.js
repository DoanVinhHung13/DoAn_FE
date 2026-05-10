import { useDispatch, useSelector } from "react-redux"

// Use throughout your app instead of plain `useDispatch` and `useSelector`
// export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppDispatch = useDispatch // Export a hook that can be reused to resolve types
export const useAppSelector = useSelector
