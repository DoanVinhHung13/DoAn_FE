import React, { Suspense } from 'react'
import { Navigate, useRoutes } from 'react-router-dom'
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
// const Register = React.lazy(() => import('../pages/ANONYMOUS/Register'))
const ForgotPassword = React.lazy(() => import('../pages/ANONYMOUS/ForgotPassword'))
const NotFound = React.lazy(() => import('../pages/SupportPage/NotFound'))
const Forbidden = React.lazy(() => import('../pages/ANONYMOUS/Forbidden'))
const NewsListAll = React.lazy(() => import('../pages/ANONYMOUS/News/NewsListAll'))
const NewsDetail = React.lazy(() => import('../pages/ANONYMOUS/News/NewsDetail'))
const TCVNReference = React.lazy(() => import('../pages/ANONYMOUS/Reference/TCVNReference'))

// Shared pages (accessible by all roles) - kept in USER/ for now
const AccountInfo = React.lazy(() => import('../pages/USER/AccountInfo'))
const ChangePassword = React.lazy(() => import('../pages/USER/ChangePassword'))
const Notifications = React.lazy(() => import('../pages/USER/Notifications'))
const NotificationDetail = React.lazy(() => import('../pages/USER/NotificationDetail'))
const JournalTrace = React.lazy(() => import('../pages/FARM_MANAGER/JournalTrace'))

// FARM_MANAGER pages
const FarmManagerDashboard = React.lazy(() => import('../pages/FARM_MANAGER/Dashboard'))
const FarmManagerUsers = React.lazy(() => import('../pages/FARM_MANAGER/Users'))
const FarmManagerUserDetail = React.lazy(() => import('../pages/FARM_MANAGER/Users/UserDetail'))
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
const FarmManagerProductionPlans = React.lazy(() => import('../pages/FARM_MANAGER/ProductionPlans'))
const FarmManagerProductionPlanCreate = React.lazy(() => import('../pages/FARM_MANAGER/ProductionPlans/ProductionPlanCreate'))
const FarmManagerProductionPlanDetail = React.lazy(() => import('../pages/FARM_MANAGER/ProductionPlans/ProductionPlanDetail'))
const FarmManagerQualityInspections = React.lazy(() => import('../pages/FARM_MANAGER/QualityInspections'))
const FarmManagerQualityInspectionDetail = React.lazy(() => import('../pages/FARM_MANAGER/QualityInspections/QualityInspectionDetail'))
const FarmManagerPlanTemplates = React.lazy(() => import('../pages/FARM_MANAGER/PlanTemplates'))
const FarmManagerPlanTemplateDetail = React.lazy(() => import('../pages/FARM_MANAGER/PlanTemplates/PlanTemplateDetail'))
const FarmManagerPlanTemplateCreate = React.lazy(() => import('../pages/FARM_MANAGER/PlanTemplates/PlanTemplateCreate'))
const FarmManagerTasks = React.lazy(() => import('../pages/FARM_MANAGER/Tasks'))
const FarmManagerTaskCreate = React.lazy(() => import('../pages/FARM_MANAGER/Tasks/TaskCreate'))
const FarmManagerTaskDetail = React.lazy(() => import('../pages/FARM_MANAGER/Tasks/TaskDetail'))
const FarmManagerTaskEdit = React.lazy(() => import('../pages/FARM_MANAGER/Tasks/TaskEdit'))
const FarmSupervisorPlans = React.lazy(() => import('../pages/FARM_SUPERVISOR/Plans'))
const FarmSupervisorPlanDetail = React.lazy(() => import('../pages/FARM_SUPERVISOR/Plans/PlanDetail'))
const FarmSupervisorTaskDetail = React.lazy(() => import('../pages/FARM_SUPERVISOR/Plans/TaskDetail'))
const FarmLeaderTasks = React.lazy(() => import('../pages/FARM_LEADER/Tasks'))
const FarmLeaderDailyLog = React.lazy(() => import('../pages/FARM_LEADER/Tasks/DailyLog'))
const FarmManagerLogbooks = React.lazy(() => import('../pages/FARM_MANAGER/Logbooks'))
const FarmManagerLogbookReview = React.lazy(() => import('../pages/FARM_MANAGER/Logbooks/LogbookReview'))

const FarmManagerBatches = React.lazy(() => import('../pages/FARM_MANAGER/Batches'))
const FarmManagerNotifications = React.lazy(() => import('../pages/FARM_MANAGER/Notifications'))
const FarmManagerViewFertilizers = React.lazy(() => import('../pages/FARM_MANAGER/ViewFertilizers'))
const FarmManagerFertilizerCreate = React.lazy(() => import('../pages/FARM_MANAGER/ViewFertilizers/FertilizerCreate'))
const FarmManagerFertilizerDetail = React.lazy(() => import('../pages/FARM_MANAGER/ViewFertilizers/FertilizerDetail'))
const FarmManagerFertilizerEdit = React.lazy(() => import('../pages/FARM_MANAGER/ViewFertilizers/FertilizerEdit'))
const FarmManagerViewCropProtections = React.lazy(() => import('../pages/FARM_MANAGER/ViewCropProtections'))
const FarmManagerCropProtectionCreate = React.lazy(() => import('../pages/FARM_MANAGER/ViewCropProtections/CropProtectionCreate'))
const FarmManagerCropProtectionDetail = React.lazy(() => import('../pages/FARM_MANAGER/ViewCropProtections/CropProtectionDetail'))
const FarmManagerCropProtectionEdit = React.lazy(() => import('../pages/FARM_MANAGER/ViewCropProtections/CropProtectionEdit'))
const FarmManagerReferenceFertilizers = React.lazy(() => import('../pages/FARM_MANAGER/Reference/FertilizerList'))
const FarmManagerReferencePesticides = React.lazy(() => import('../pages/FARM_MANAGER/Reference/PesticideList'))

// LAND_MANAGER pages - moved to FARM_SUPERVISOR
const LandManagerFieldLog = React.lazy(() => import('../pages/LAND_MANAGER/FieldLog'))
const LandManagerDashboard = React.lazy(() => import('../pages/LAND_MANAGER/Dashboard'))
const LandManagerFarmers = React.lazy(() => import('../pages/LAND_MANAGER/Farmers'))
const LandManagerLands = React.lazy(() => import('../pages/LAND_MANAGER/Lands'))
const LandManagerLandPlotDetail = React.lazy(() => import('../pages/LAND_MANAGER/Lands/LandPlotDetail'))
const LandManagerNotifications = React.lazy(() => import('../pages/LAND_MANAGER/Notifications'))

// FARMER pages (mapped to USER/ since FARMER folder doesn't exist)
const FarmerDashboard = React.lazy(() => import('../pages/USER/FarmerManagement'))
const FarmerTasks = React.lazy(() => import('../pages/FARM_MANAGER/Tasks'))
const FarmerLogbooks = React.lazy(() => import('../pages/FARM_MANAGER/Logbooks'))
const FarmerPlans = React.lazy(() => import('../pages/USER/ProductionProcess'))
const FarmerSupplies = React.lazy(() => import('../pages/FARM_MANAGER/Supplies'))
const FarmSupervisorLogbooks = React.lazy(() => import('../pages/FARM_SUPERVISOR/Logbooks'))
const FarmSupervisorLogbookDetail = React.lazy(() => import('../pages/FARM_SUPERVISOR/Logbooks/LogbookDetail'))
const FarmSupervisorStageLog = React.lazy(() => import('../pages/FARM_SUPERVISOR/Logbooks/StageLog'))

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
    ],
  },

  // ── Auth pages (guest only — redirect nếu đã login) ───────────────────────
  {
    path: ROUTER.LOGIN,
    element: <Lazy><GuestRoute><Login /></GuestRoute></Lazy>,
  },
  // {
  //   path: ROUTER.REGISTER,
  //   element: <Lazy><GuestRoute><Register /></GuestRoute></Lazy>,
  // },
  {
    path: ROUTER.FORGOT_PASSWORD,
    element: <Lazy><GuestRoute><ForgotPassword /></GuestRoute></Lazy>,
  },

  // ── Trace QR (standalone — không cần layout, không cần login) ────────────
  {
    path: ROUTER.TRACE,
    element: <Lazy><JournalTrace /></Lazy>,
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
          // Redirect /app → /farm-manager/dashboard
          { path: ROUTER.APP_REDIRECT, element: <Navigate to={ROUTER.FM_DASHBOARD} replace /> },

          // Shared routes (mọi role đã login đều thấy)
          { path: ROUTER.ACCOUNT_INFO, element: <Lazy><AccountInfo /></Lazy> },
          { path: ROUTER.CHANGE_PASSWORD, element: <Lazy><ChangePassword /></Lazy> },
          { path: ROUTER.NOTIFICATIONS, element: <Lazy><Notifications /></Lazy> },
          { path: ROUTER.NOTIFICATIONS_DETAIL, element: <Lazy><NotificationDetail /></Lazy> },
          { path: ROUTER.TCVN_AUTH, element: <Lazy><TCVNReference /></Lazy> },

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

              // Production Plan Management
              { path: ROUTER.FM_PRODUCTION_PLANS, element: <Lazy><FarmManagerProductionPlans /></Lazy> },
              { path: ROUTER.FM_PRODUCTION_PLAN_CREATE, element: <Lazy><FarmManagerProductionPlanCreate /></Lazy> },
              { path: ROUTER.FM_PRODUCTION_PLAN_EDIT, element: <Lazy><FarmManagerProductionPlanCreate /></Lazy> },
              { path: ROUTER.FM_PRODUCTION_PLAN_DETAIL, element: <Lazy><FarmManagerProductionPlanDetail /></Lazy> },

              // Quality inspection for Farm Supervisor log entries
              { path: ROUTER.FM_QUALITY_INSPECTIONS, element: <Lazy><FarmManagerQualityInspections /></Lazy> },
              { path: ROUTER.FM_QUALITY_INSPECTION_DETAIL, element: <Lazy><FarmManagerQualityInspectionDetail /></Lazy> },

              // Plan Template Management
              { path: ROUTER.FM_PLAN_TEMPLATES, element: <Lazy><FarmManagerPlanTemplates /></Lazy> },
              { path: ROUTER.FM_PLAN_TEMPLATE_CREATE, element: <Lazy><FarmManagerPlanTemplateCreate /></Lazy> },
              { path: ROUTER.FM_PLAN_TEMPLATE_EDIT, element: <Lazy><FarmManagerPlanTemplateCreate /></Lazy> },
              { path: ROUTER.FM_PLAN_TEMPLATE_DETAIL, element: <Lazy><FarmManagerPlanTemplateDetail /></Lazy> },

              // Task Management
              { path: ROUTER.FM_TASKS, element: <Lazy><FarmManagerTasks /></Lazy> },
              { path: ROUTER.FM_TASK_CREATE, element: <Lazy><FarmManagerTaskCreate /></Lazy> },
              { path: ROUTER.FM_TASK_DETAIL, element: <Lazy><FarmManagerTaskDetail /></Lazy> },
              { path: ROUTER.FM_TASK_EDIT, element: <Lazy><FarmManagerTaskEdit /></Lazy> },

              // Batches
              { path: ROUTER.FM_BATCHES, element: <Lazy><FarmManagerBatches /></Lazy> },

              // Notification Management
              { path: ROUTER.FM_NOTIFICATIONS, element: <Lazy><FarmManagerNotifications /></Lazy> },
              { path: ROUTER.FM_NOTIFICATION_DETAIL, element: <Lazy><NotificationDetail /></Lazy> },

              // Fertilizer Management
              { path: ROUTER.FM_VIEW_FERTILIZERS, element: <Lazy><FarmManagerViewFertilizers /></Lazy> },
              { path: ROUTER.FM_VIEW_FERTILIZER_CREATE, element: <Lazy><FarmManagerFertilizerCreate /></Lazy> },
              { path: ROUTER.FM_VIEW_FERTILIZER_DETAIL, element: <Lazy><FarmManagerFertilizerDetail /></Lazy> },
              { path: ROUTER.FM_VIEW_FERTILIZER_EDIT, element: <Lazy><FarmManagerFertilizerEdit /></Lazy> },

              // Crop Protection Management
              { path: ROUTER.FM_VIEW_CROP_PROTECTIONS, element: <Lazy><FarmManagerViewCropProtections /></Lazy> },
              { path: ROUTER.FM_VIEW_CROP_PROTECTION_CREATE, element: <Lazy><FarmManagerCropProtectionCreate /></Lazy> },
              { path: ROUTER.FM_VIEW_CROP_PROTECTION_DETAIL, element: <Lazy><FarmManagerCropProtectionDetail /></Lazy> },
              { path: ROUTER.FM_VIEW_CROP_PROTECTION_EDIT, element: <Lazy><FarmManagerCropProtectionEdit /></Lazy> },
              
              // Reference Management
              { path: ROUTER.FM_REF_FERTILIZER, element: <Lazy><FarmManagerReferenceFertilizers /></Lazy> },
              { path: ROUTER.FM_REF_PESTICIDE, element: <Lazy><FarmManagerReferencePesticides /></Lazy> },

              // Logbook Review (duyệt nhật ký canh tác)
              { path: ROUTER.FM_LOGBOOKS, element: <Lazy><FarmManagerLogbooks /></Lazy> },
              { path: ROUTER.FM_LOGBOOK_REVIEW, element: <Lazy><FarmManagerLogbookReview /></Lazy> },
            ],
          },

          // ── Farm Supervisor Routes ────────────────────────────────────────
          {
            element: <ProtectedRoute allowedRoles={[ROLES.FARM_SUPERVISOR]} />,
            children: [
              // Farm Supervisor - Plans & Tasks
              { path: ROUTER.FS_PLANS, element: <Lazy><FarmSupervisorPlans /></Lazy> },
              { path: ROUTER.FS_PLAN_DETAIL, element: <Lazy><FarmSupervisorPlanDetail /></Lazy> },
              { path: ROUTER.FS_TASK_DETAIL, element: <Lazy><FarmSupervisorTaskDetail /></Lazy> },
              { path: ROUTER.FS_STAGE_LOG, element: <Lazy><FarmSupervisorStageLog /></Lazy> },

              // Land Manager features moved to Farm Supervisor
              { path: ROUTER.LM_DASHBOARD, element: <Lazy><LandManagerDashboard /></Lazy> },
              { path: ROUTER.LM_FARMERS, element: <Lazy><LandManagerFarmers /></Lazy> },
              { path: ROUTER.LM_LANDS, element: <Lazy><LandManagerLands /></Lazy> },
              { path: ROUTER.LM_LAND_DETAIL, element: <Lazy><LandManagerLandPlotDetail /></Lazy> },
              { path: ROUTER.LM_FIELD_LOG, element: <Lazy><LandManagerFieldLog /></Lazy> },
              { path: ROUTER.LM_NOTIFICATIONS, element: <Lazy><LandManagerNotifications /></Lazy> },
              { path: ROUTER.LM_NOTIFICATION_DETAIL, element: <Lazy><NotificationDetail /></Lazy> },
            ],
          },

          // ── Farm Leader Routes ────────────────────────────────────────────
          // Guard tạm: cả FARM_SUPERVISOR + FARM_LEADER đều vào được (demo)
          {
            element: <ProtectedRoute allowedRoles={[ROLES.FARM_LEADER, ROLES.FARM_SUPERVISOR]} />,
            children: [
              { path: ROUTER.FL_TASKS, element: <Lazy><FarmLeaderTasks /></Lazy> },
              { path: ROUTER.FL_TASK_LOG, element: <Lazy><FarmLeaderDailyLog /></Lazy> },
            ],
          },

          // ── Farmer Routes ──────────────────────────────────────────────
          {
            element: <ProtectedRoute allowedRoles={[ROLES.FARMER]} />,
            children: [
              { path: ROUTER.FARMER_DASHBOARD, element: <Lazy><FarmerDashboard /></Lazy> },
              { path: ROUTER.FARMER_TASKS, element: <Lazy><FarmerTasks /></Lazy> },
              { path: ROUTER.FARMER_LOGBOOKS, element: <Lazy><FarmerLogbooks /></Lazy> },
              { path: ROUTER.FARMER_PLANS, element: <Lazy><FarmerPlans /></Lazy> },
              { path: ROUTER.FARMER_SUPPLIES, element: <Lazy><FarmerSupplies /></Lazy> },
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
