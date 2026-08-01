import React, { Suspense } from 'react'
import { useRoutes } from 'react-router-dom'
import ROUTER from './ROUTER'
// ── Layouts ───────────────────────────────────────────────────────────────────
import LayoutCommon from 'src/components/Common/LayoutCommon'
import LayoutAdmin from 'src/components/Layout/LayoutAdmin'

// ── SupportPage Guards ─────────────────────────────────────────────────────────
const PrivateRoutes = React.lazy(() => import('src/pages/SupportPage/PrivateRoutes'))
const GuestRoute = React.lazy(() => import('src/pages/SupportPage/GuestRoute'))
import { ProtectedRoute } from 'src/router/guards'
import { ROLES } from 'src/constants/roles'

// ── Lazy-loaded pages ─────────────────────────────────────────────────────────
// ANONYMOUS
const Home = React.lazy(() => import('../pages/ANONYMOUS/Home'))
const Login = React.lazy(() => import('../pages/ANONYMOUS/Login'))
const ForgotPassword = React.lazy(() => import('../pages/ANONYMOUS/ForgotPassword'))
const NotFound = React.lazy(() => import('../pages/SupportPage/NotFound'))
const Forbidden = React.lazy(() => import('../pages/ANONYMOUS/Forbidden'))
const NewsListAll = React.lazy(() => import('../pages/ANONYMOUS/News/NewsListAll'))
const NewsDetail = React.lazy(() => import('../pages/ANONYMOUS/News/NewsDetail'))
const TCVNReference = React.lazy(() => import('../pages/ANONYMOUS/Reference/TCVNReference'))
const SVG = React.lazy(() => import('../assets/icon/svg'))

// Shared pages (accessible by all roles)
const AccountInfo = React.lazy(() => import('../pages/USER/AccountInfo'))
const ChangePassword = React.lazy(() => import('../pages/USER/ChangePassword'))
const Notifications = React.lazy(() => import('../pages/USER/Notifications'))
const NotificationDetail = React.lazy(() => import('../pages/USER/NotificationDetail'))
const Trace = React.lazy(() => import('../pages/ANONYMOUS/Trace'))

// FARM_MANAGER pages
const FarmManagerDashboard = React.lazy(() => import('../pages/FARM_MANAGER/Dashboard'))
const FarmManagerUsers = React.lazy(() => import('../pages/FARM_MANAGER/Users'))
const FarmManagerUserDetail = React.lazy(() => import('../pages/FARM_MANAGER/Users/UserDetail'))
const FarmSupervisorUserDetail = React.lazy(() => import('../pages/FARM_MANAGER/Users/UserDetail'))
const FarmManagerLands = React.lazy(() => import('../pages/FARM_MANAGER/Lands'))
const FarmManagerLandPlotCreate = React.lazy(() => import('../pages/FARM_MANAGER/Lands/LandPlotCreate'))
const FarmManagerLandPlotDetail = React.lazy(() => import('../pages/FARM_MANAGER/Lands/LandPlotDetail'))
const FarmManagerLandPlotEdit = React.lazy(() => import('../pages/FARM_MANAGER/Lands/LandPlotEdit'))
const FarmManagerCropCatalogs = React.lazy(() => import('../pages/FARM_MANAGER/CropCatalogs'))
const FarmManagerCropCatalogCreate = React.lazy(() => import('../pages/FARM_MANAGER/CropCatalogs/CatalogCreate'))
const FarmManagerCropCatalogDetail = React.lazy(() => import('../pages/FARM_MANAGER/CropCatalogs/CatalogDetail'))
const FarmManagerCropCatalogEdit = React.lazy(() => import('../pages/FARM_MANAGER/CropCatalogs/CatalogEdit'))
const FarmManagerCrops = React.lazy(() => import('../pages/FARM_MANAGER/Crops'))
const FarmManagerCropCreate = React.lazy(() => import('../pages/FARM_MANAGER/Crops/CropCreate'))
const FarmManagerCropDetail = React.lazy(() => import('../pages/FARM_MANAGER/Crops/CropDetail'))
const FarmManagerCropEdit = React.lazy(() => import('../pages/FARM_MANAGER/Crops/CropEdit'))
const FarmManagerCultivationLogbooks = React.lazy(() => import('../pages/FARM_MANAGER/CultivationLogbooks'))
const FarmManagerCultivationLogbookCreate = React.lazy(() => import('../pages/FARM_MANAGER/CultivationLogbooks/CultivationLogbookCreate'))
const FarmManagerCultivationLogbookDetail = React.lazy(() => import('../pages/FARM_MANAGER/CultivationLogbooks/CultivationLogbookDetail'))
const FarmManagerPlanTemplates = React.lazy(() => import('../pages/FARM_MANAGER/PlanTemplates'))
const FarmManagerPlanTemplateDetail = React.lazy(() => import('../pages/FARM_MANAGER/PlanTemplates/PlanTemplateDetail'))
const FarmManagerPlanTemplateCreate = React.lazy(() => import('../pages/FARM_MANAGER/PlanTemplates/PlanTemplateCreate'))
const FarmManagerTasks = React.lazy(() => import('../pages/FARM_MANAGER/StandardTasks'))
const FarmManagerTaskCreate = React.lazy(() => import('../pages/FARM_MANAGER/StandardTasks/TaskCreate'))
const FarmManagerTaskDetail = React.lazy(() => import('../pages/FARM_MANAGER/StandardTasks/TaskDetail'))
const FarmManagerTaskEdit = React.lazy(() => import('../pages/FARM_MANAGER/StandardTasks/TaskEdit'))
const FarmSupervisorPlans = React.lazy(() => import('../pages/FARM_SUPERVISOR/Plans'))
const FarmSupervisorPlanDetail = React.lazy(() => import('../pages/FARM_SUPERVISOR/Plans/PlanDetail'))
const FarmLeaderTasks = React.lazy(() => import('../pages/FARM_LEADER/Tasks'))
const FarmLeaderDailyLog = React.lazy(() => import('../pages/FARM_LEADER/Tasks/DailyLog'))
const FarmManagerLogbooks = React.lazy(() => import('../pages/FARM_MANAGER/Logbooks'))
const FarmManagerLogbookReview = React.lazy(() => import('../pages/FARM_MANAGER/Logbooks/LogbookReview'))
const FarmManagerReports = React.lazy(() => import('../pages/FARM_MANAGER/Reports'))
const FarmManagerBatches = React.lazy(() => import('../pages/FARM_MANAGER/Batches'))
const FarmManagerBatchDetail = React.lazy(() => import('../pages/FARM_MANAGER/Batches/BatchDetail'))
const FarmManagerQRManagement = React.lazy(() => import('../pages/FARM_MANAGER/QRManagement'))
const FarmManagerNotifications = React.lazy(() => import('../pages/FARM_MANAGER/Notifications'))
const FarmManagerViewFertilizers = React.lazy(() => import('../pages/FARM_MANAGER/ViewFertilizers'))
const FarmManagerFertilizerCreate = React.lazy(() => import('../pages/FARM_MANAGER/ViewFertilizers/FertilizerCreate'))
const FarmManagerFertilizerDetail = React.lazy(() => import('../pages/FARM_MANAGER/ViewFertilizers/FertilizerDetail'))
const FarmManagerFertilizerEdit = React.lazy(() => import('../pages/FARM_MANAGER/ViewFertilizers/FertilizerEdit'))
const FarmManagerViewCropProtections = React.lazy(() => import('../pages/FARM_MANAGER/ViewCropProtections'))
const FarmManagerCropProtectionCreate = React.lazy(() => import('../pages/FARM_MANAGER/ViewCropProtections/CropProtectionCreate'))
const FarmManagerCropProtectionDetail = React.lazy(() => import('../pages/FARM_MANAGER/ViewCropProtections/CropProtectionDetail'))
const FarmManagerCropProtectionEdit = React.lazy(() => import('../pages/FARM_MANAGER/ViewCropProtections/CropProtectionEdit'))
const FarmManagerInventoryImportHistory = React.lazy(() => import('../pages/FARM_MANAGER/InventoryImportHistory'))
const FarmManagerReferenceFertilizers = React.lazy(() => import('../pages/FARM_MANAGER/Reference/FertilizerList'))
const FarmManagerReferencePesticides = React.lazy(() => import('../pages/FARM_MANAGER/Reference/PesticideList'))

// FARM_SUPERVISOR pages
const FarmSupervisorFarmers = React.lazy(() => import('../pages/FARM_SUPERVISOR/Farmers'))
const FarmSupervisorLands = React.lazy(() => import('../pages/FARM_SUPERVISOR/Lands'))
const FarmSupervisorLandPlotDetail = React.lazy(() => import('../pages/FARM_SUPERVISOR/Lands/LandPlotDetail'))

// ── Spinner fallback dùng chung ───────────────────────────────────────────────
function Lazy({ children }) {
  return (
    <Suspense
      fallback={
        <div style={{
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div className="w-12 h-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin" />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

// ── Route definitions ─────────────────────────────────────────────────────────
const routes = [
  // ── Public layout (Landing, News, Reference) ─────────────────────────────
  {
    element: <LayoutCommon />,
    children: [
      { path: ROUTER.HOME, element: <Lazy><Home /></Lazy> },
      { path: ROUTER.NEWS, element: <Lazy><NewsListAll /></Lazy> },
      { path: ROUTER.NEWS_DETAIL, element: <Lazy><NewsDetail /></Lazy> },
      { path: ROUTER.TCVN, element: <Lazy><TCVNReference /></Lazy> },
      { path: ROUTER.SVG, element: <Lazy><SVG /></Lazy> },
    ],
  },

  // ── Auth pages (guest only) ───────────────────────────────────────────────
  {
    path: ROUTER.LOGIN,
    element: <Lazy><GuestRoute><Login /></GuestRoute></Lazy>,
  },
  {
    path: ROUTER.FORGOT_PASSWORD,
    element: <Lazy><GuestRoute><ForgotPassword /></GuestRoute></Lazy>,
  },

  // ── Trace QR (standalone) ────────────────────────────────────────────────
  {
    path: ROUTER.TRACE,
    element: <Lazy><Trace /></Lazy>,
  },

  // ── Authenticated app layout ──────────────────────────────────────────────
  {
    element: (
      <Lazy>
        <PrivateRoutes />
      </Lazy>
    ),
    children: [
      {
        element: <LayoutAdmin />,
        children: [
          // Shared routes (mọi role đã login đều thấy)
          { path: ROUTER.ACCOUNT_INFO, element: <Lazy><AccountInfo /></Lazy> },
          { path: ROUTER.CHANGE_PASSWORD, element: <Lazy><ChangePassword /></Lazy> },
          { path: ROUTER.NOTIFICATIONS, element: <Lazy><Notifications /></Lazy> },
          { path: ROUTER.NOTIFICATIONS_DETAIL, element: <Lazy><NotificationDetail /></Lazy> },

          // ── Farm Manager Routes ────────────────────────────────────────────
          {
            element: <ProtectedRoute allowedRoles={[ROLES.FARM_MANAGER]} />,
            children: [
              // Dashboard
              { path: ROUTER.FM_DASHBOARD, element: <Lazy><FarmManagerDashboard /></Lazy> },

              // User Management
              { path: ROUTER.FM_USERS, element: <Lazy><FarmManagerUsers /></Lazy> },
              { path: ROUTER.FM_USER_DETAIL, element: <Lazy><FarmManagerUserDetail /></Lazy> },

              // Land Management
              { path: ROUTER.FM_LANDS, element: <Lazy><FarmManagerLands /></Lazy> },
              { path: ROUTER.FM_LAND_CREATE, element: <Lazy><FarmManagerLandPlotCreate /></Lazy> },
              { path: ROUTER.FM_LAND_DETAIL, element: <Lazy><FarmManagerLandPlotDetail /></Lazy> },
              { path: ROUTER.FM_LAND_EDIT, element: <Lazy><FarmManagerLandPlotEdit /></Lazy> },

              // Crop Catalog Management
              { path: ROUTER.FM_CROP_CATALOGS, element: <Lazy><FarmManagerCropCatalogs /></Lazy> },
              { path: ROUTER.FM_CROP_CATALOG_CREATE, element: <Lazy><FarmManagerCropCatalogCreate /></Lazy> },
              { path: ROUTER.FM_CROP_CATALOG_DETAIL, element: <Lazy><FarmManagerCropCatalogDetail /></Lazy> },
              { path: ROUTER.FM_CROP_CATALOG_EDIT, element: <Lazy><FarmManagerCropCatalogEdit /></Lazy> },

              // Crop Management
              { path: ROUTER.FM_CROPS, element: <Lazy><FarmManagerCrops /></Lazy> },
              { path: ROUTER.FM_CROP_CREATE, element: <Lazy><FarmManagerCropCreate /></Lazy> },
              { path: ROUTER.FM_CROP_DETAIL, element: <Lazy><FarmManagerCropDetail /></Lazy> },
              { path: ROUTER.FM_CROP_EDIT, element: <Lazy><FarmManagerCropEdit /></Lazy> },

              // Cultivation Logbook Management (Nhật ký canh tác)
              { path: ROUTER.FM_CULTIVATION_LOGBOOKS, element: <Lazy><FarmManagerCultivationLogbooks /></Lazy> },
              { path: ROUTER.FM_CULTIVATION_LOGBOOK_CREATE, element: <Lazy><FarmManagerCultivationLogbookCreate /></Lazy> },
              { path: ROUTER.FM_CULTIVATION_LOGBOOK_EDIT, element: <Lazy><FarmManagerCultivationLogbookCreate /></Lazy> },
              { path: ROUTER.FM_CULTIVATION_LOGBOOK_DETAIL, element: <Lazy><FarmManagerCultivationLogbookDetail /></Lazy> },

              // Plan Template Management
              { path: ROUTER.FM_PROCESS_TEMPLATES, element: <Lazy><FarmManagerPlanTemplates /></Lazy> },
              { path: ROUTER.FM_PROCESS_TEMPLATE_CREATE, element: <Lazy><FarmManagerPlanTemplateCreate /></Lazy> },
              { path: ROUTER.FM_PROCESS_TEMPLATE_EDIT, element: <Lazy><FarmManagerPlanTemplateCreate /></Lazy> },
              { path: ROUTER.FM_PROCESS_TEMPLATE_DETAIL, element: <Lazy><FarmManagerPlanTemplateDetail /></Lazy> },

              // Task Catalog Management
              { path: ROUTER.FM_TASK_CATALOGS, element: <Lazy><FarmManagerTasks /></Lazy> },
              { path: ROUTER.FM_TASK_CATALOG_CREATE, element: <Lazy><FarmManagerTaskCreate /></Lazy> },
              { path: ROUTER.FM_TASK_CATALOG_DETAIL, element: <Lazy><FarmManagerTaskDetail /></Lazy> },
              { path: ROUTER.FM_TASK_CATALOG_EDIT, element: <Lazy><FarmManagerTaskEdit /></Lazy> },

              // Harvest Batch Management
              { path: ROUTER.FM_HARVEST_BATCHES, element: <Lazy><FarmManagerBatches /></Lazy> },
              { path: ROUTER.FM_HARVEST_BATCH_DETAIL, element: <Lazy><FarmManagerBatchDetail /></Lazy> },
              { path: ROUTER.FM_QR_CODES, element: <Lazy><FarmManagerQRManagement /></Lazy> },

              // Notification Management
              { path: ROUTER.FM_NOTIFICATIONS, element: <Lazy><FarmManagerNotifications /></Lazy> },
              { path: ROUTER.FM_NOTIFICATION_DETAIL, element: <Lazy><NotificationDetail /></Lazy> },

              // Fertilizer Management
              { path: ROUTER.FM_FERTILIZERS, element: <Lazy><FarmManagerViewFertilizers /></Lazy> },
              { path: ROUTER.FM_FERTILIZER_CREATE, element: <Lazy><FarmManagerFertilizerCreate /></Lazy> },
              { path: ROUTER.FM_FERTILIZER_DETAIL, element: <Lazy><FarmManagerFertilizerDetail /></Lazy> },
              { path: ROUTER.FM_FERTILIZER_EDIT, element: <Lazy><FarmManagerFertilizerEdit /></Lazy> },

              // Crop Protection Management
              { path: ROUTER.FM_PESTICIDES, element: <Lazy><FarmManagerViewCropProtections /></Lazy> },
              { path: ROUTER.FM_PESTICIDE_CREATE, element: <Lazy><FarmManagerCropProtectionCreate /></Lazy> },
              { path: ROUTER.FM_PESTICIDE_DETAIL, element: <Lazy><FarmManagerCropProtectionDetail /></Lazy> },
              { path: ROUTER.FM_PESTICIDE_EDIT, element: <Lazy><FarmManagerCropProtectionEdit /></Lazy> },
              { path: ROUTER.FM_INVENTORY_IMPORT_HISTORY, element: <Lazy><FarmManagerInventoryImportHistory /></Lazy> },

              // Reference Management
              { path: ROUTER.FM_REF_FERTILIZER, element: <Lazy><FarmManagerReferenceFertilizers /></Lazy> },
              { path: ROUTER.FM_REF_PESTICIDE, element: <Lazy><FarmManagerReferencePesticides /></Lazy> },

              // Logbook Review (duyệt nhật ký canh tác)
              { path: ROUTER.FM_LOGBOOKS, element: <Lazy><FarmManagerLogbooks /></Lazy> },
              { path: ROUTER.FM_LOGBOOK_REVIEW, element: <Lazy><FarmManagerLogbookReview /></Lazy> },

              // Reports
              { path: ROUTER.FM_REPORTS, element: <Lazy><FarmManagerReports /></Lazy> },
            ],
          },

          // ── Farm Supervisor Routes ────────────────────────────────────────
          {
            element: <ProtectedRoute allowedRoles={[ROLES.FARM_SUPERVISOR]} />,
            children: [
              // Plans & Logbooks
              { path: ROUTER.FS_CULTIVATION_LOGBOOKS, element: <Lazy><FarmSupervisorPlans /></Lazy> },
              { path: ROUTER.FS_CULTIVATION_LOGBOOK_DETAIL, element: <Lazy><FarmSupervisorPlanDetail /></Lazy> },

              // Farmers
              { path: ROUTER.FS_FARMERS, element: <Lazy><FarmSupervisorFarmers /></Lazy> },
              { path: ROUTER.FS_USER_DETAIL, element: <Lazy><FarmSupervisorUserDetail /></Lazy> },

              // Lands
              { path: ROUTER.FS_LANDS, element: <Lazy><FarmSupervisorLands /></Lazy> },
              { path: ROUTER.FS_LAND_DETAIL, element: <Lazy><FarmSupervisorLandPlotDetail /></Lazy> },
            ],
          },

          // ── Farm Leader Routes ────────────────────────────────────────────
          {
            element: <ProtectedRoute allowedRoles={[ROLES.FARM_LEADER, ROLES.FARM_SUPERVISOR, ROLES.FARMER]} />,
            children: [
              { path: ROUTER.FL_TASKS, element: <Lazy><FarmLeaderTasks /></Lazy> },
              { path: ROUTER.FL_TASK_LOG, element: <Lazy><FarmLeaderDailyLog /></Lazy> },
            ],
          },
        ],
      },
    ],
  },

  // ── Error pages (standalone, no layout) ──────────────────────────────────
  { path: ROUTER.FORBIDDEN, element: <Lazy><Forbidden /></Lazy> },
  { path: ROUTER.NOT_FOUND, element: <Lazy><NotFound /></Lazy> },
  { path: '*', element: <Lazy><NotFound /></Lazy> },
]

const AppRouter = () => useRoutes(routes)
export default AppRouter
