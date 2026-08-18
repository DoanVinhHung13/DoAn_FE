export const UI = {
  page: {
    wrapper:
      "admin-compact-list space-y-6 duration-500 animate-in fade-in slide-in-from-bottom-4",
    header: "flex flex-col justify-between gap-4 sm:flex-row sm:items-center",
  },

  toolbar: {
    card: "admin-filter-card rounded-lg shadow-sm",
    inner: "admin-toolbar flex flex-col gap-3 sm:flex-row sm:flex-wrap",
    actions: "flex gap-2 ml-auto",
  },

  btn: {
    primary: "flex-shrink-0 h-10 px-5 font-bold border-0 shadow-lg rounded-xl",
    search: "h-10 px-4 font-semibold rounded-xl bg-gray-50",
    reload: "h-10 px-3 rounded-xl bg-gray-50",
    icon: "flex items-center justify-center w-8 h-8 rounded-lg",
    iconEdit:
      "flex items-center justify-center w-8 h-8 rounded-lg hover:bg-green-50",
    iconDelete:
      "flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-50",
    iconActivate:
      "flex items-center justify-center w-8 h-8 rounded-lg hover:bg-green-50",
    iconDeactivate:
      "flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-50",
    iconImport:
      "flex items-center justify-center w-8 h-8 rounded-lg hover:bg-blue-50",
    iconLocked:
      "flex items-center justify-center w-8 h-8 rounded-lg opacity-40",
    confirm: "h-10 px-6 font-bold border-0 shadow-lg rounded-xl",
    cancel: "h-10 px-6 rounded-xl",
  },

  input: {
    search: "w-64 h-10 rounded-xl",
    select: "h-10 rounded-xl min-w-[160px]",
  },

  icon: {
    edit: locked => `text-lg ${locked ? "text-gray-300" : "text-green-500"}`,
    editBlue: "text-lg text-blue-500",
    delete: locked => `text-lg ${locked ? "text-gray-300" : "text-red-500"}`,
    stop: locked => `text-lg ${locked ? "text-gray-300" : "text-red-500"}`,
    check: locked => `text-lg ${locked ? "text-gray-300" : "text-green-500"}`,
    import: "text-lg text-blue-600",
  },

  row: "hover:bg-green-50/30 transition-colors",
  rowActions: "flex items-center justify-center gap-2",

  modal: {
    titleClass: "flex items-center",
    body: "mt-4 mb-6 ml-4",
    footer: "flex justify-end gap-3",
  },

  menuIcon: { fontSize: "24px", color: "var(--color-primary)" },
}
