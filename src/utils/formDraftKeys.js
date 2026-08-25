import authSession from "src/redux/authSession"
import { buildFormDraftKey } from "src/utils/formDraftStorage"

export const getCurrentUserId = () => {
  try {
    const user = authSession.getUser()
    return user?.id ?? user?.userId ?? user?.userID ?? null
  } catch {
    return null
  }
}

export const getFormDraftKey = (module, mode, entityId) =>
  buildFormDraftKey({
    userId: getCurrentUserId(),
    module,
    mode,
    entityId,
  })
