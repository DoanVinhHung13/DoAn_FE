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
const FarmManagerCropCatalogDetail = React.lazy(() => import('../pages/FARM_MANAGER/CropCatalogs/CatalogDetail'))
const FarmManagerCropCatalogEdit = React.lazy(() => import('../pages/FARM_MANAGER/CropCatalogs/CatalogEdit'))
const FarmManagerCrops = React.lazy(() => import('../pages/FARM_MANAGER/Crops'))
const FarmManagerCropDetail = React.lazy(() => import('../pages/FARM_MANAGER/Crops/CropDetail'))
const FarmManagerCropEdit = React.lazy(() => import('../pages/FARM_MANAGER/Crops/CropEdit'))
const FarmManagerProductionPlans = React.lazy(() => import('../pages/FARM_MANAGER/ProductionPlans'))
const FarmManagerTasks = React.lazy(() => import('../pages/FARM_MANAGER/Tasks'))
const FarmManagerLogbooks = React.lazy(() => import('../pages/FARM_MANAGER/Logbooks'))
const FarmManagerBatches = React.lazy(() => import('../pages/FARM_MANAGER/Batches'))
const FarmManagerNotifications = React.lazy(() => import('../pages/FARM_MANAGER/Notifications'))
const FarmManagerViewFertilizers = React.lazy(() => import('../pages/FARM_MANAGER/ViewFertilizers'))
const FarmManagerViewCropProtections = React.lazy(() => import('../pages/FARM_MANAGER/ViewCropProtections'))

// LAND_MANAGER pages
const LandManagerDashboard = React.lazy(() => import('../pages/LAND_MANAGER/Dashboard'))
const LandManagerFarmers = React.lazy(() => import('../pages/LAND_MANAGER/Farmers'))
const LandManagerLands = React.lazy(() => import('../pages/LAND_MANAGER/Lands'))
const LandManagerLandPlotDetail = React.lazy(() => import('../pages/LAND_MANAGER/Lands/LandPlotDetail'))
const LandManagerProductionPlans = React.lazy(() => import('../pages/LAND_MANAGER/ProductionPlans'))
const LandManagerTasks = React.lazy(() => import('../pages/LAND_MANAGER/Tasks'))
const LandManagerLogbooks = React.lazy(() => import('../pages/LAND_MANAGER/Logbooks'))
const LandManagerBatches = React.lazy(() => import('../pages/LAND_MANAGER/Batches'))
const LandManagerNotifications = React.lazy(() => import('../pages/LAND_MANAGER/Notifications'))
const LandManagerViewCatalogs = React.lazy(() => import('../pages/LAND_MANAGER/ViewCatalogs'))
const LandManagerCatalogDetail = React.lazy(() => import('../pages/LAND_MANAGER/ViewCatalogs/CatalogDetail'))
const LandManagerCrops = React.lazy(() => import('../pages/LAND_MANAGER/Crops'))
const LandManagerCropDetail = React.lazy(() => import('../pages/LAND_MANAGER/Crops/CropDetail'))

// MATERIAL_MANAGER pages
const MaterialManagerDashboard = React.lazy(() => import('../pages/MATERIAL_MANAGER/Dashboard'))
const MaterialManagerFertilizers = React.lazy(() => import('../pages/MATERIAL_MANAGER/Fertilizers'))
const MaterialManagerCropProtections = React.lazy(() => import('../pages/MATERIAL_MANAGER/CropProtections'))
const MaterialManagerMachinery = React.lazy(() => import('../pages/MATERIAL_MANAGER/Machinery'))
const MaterialManagerMaterials = React.lazy(() => import('../pages/MATERIAL_MANAGER/Materials'))
const MaterialManagerMaterialCreate = React.lazy(() => import('../pages/MATERIAL_MANAGER/Materials/MaterialCreate'))
const MaterialManagerMaterialDetail = React.lazy(() => import('../pages/MATERIAL_MANAGER/Materials/MaterialDetail'))
const MaterialManagerMaterialEdit = React.lazy(() => import('../pages/MATERIAL_MANAGER/Materials/MaterialEdit'))
const MaterialManagerOtherMaterials = React.lazy(() => import('../pages/MATERIAL_MANAGER/OtherMaterials'))
const MaterialManagerPurchaseReqs = React.lazy(() => import('../pages/MATERIAL_MANAGER/PurchaseReqs'))
const MaterialManagerProductionPlans = React.lazy(() => import('../pages/MATERIAL_MANAGER/ProductionPlans'))
const MaterialManagerTasks = React.lazy(() => import('../pages/MATERIAL_MANAGER/Tasks'))

// FARMER pages (mapped to USER/ since FARMER folder doesn't exist)
const FarmerDashboard = React.lazy(() => import('../pages/USER/FarmerManagement'))
const FarmerTasks = React.lazy(() => import('../pages/FARM_MANAGER/Tasks'))
const FarmerLogbooks = React.lazy(() => import('../pages/FARM_MANAGER/Logbooks'))
const FarmerPlans = React.lazy(() => import('../pages/USER/ProductionProcess'))
const FarmerSupplies = React.lazy(() => import('../pages/FARM_MANAGER/Supplies'))

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
              { path: ROUTER.FM_DASHBOARD, element: <Lazy><FarmManagerDashboard /></Lazy> },
              { path: ROUTER.FM_USERS, element: <Lazy><FarmManagerUsers /></Lazy> },
              { path: ROUTER.FM_USER_DETAIL, element: <Lazy><FarmManagerUserDetail /></Lazy> },
              { path: ROUTER.FM_LANDS, element: <Lazy><FarmManagerLands /></Lazy> },
              { path: ROUTER.FM_LAND_CREATE, element: <Lazy><FarmManagerLandPlotCreate /></Lazy> },
              { path: ROUTER.FM_LAND_DETAIL, element: <Lazy><FarmManagerLandPlotDetail /></Lazy> },
              { path: ROUTER.FM_LAND_EDIT, element: <Lazy><FarmManagerLandPlotEdit /></Lazy> },
              { path: ROUTER.FM_CROP_CATALOGS, element: <Lazy><FarmManagerCropCatalogs /></Lazy> },
              { path: ROUTER.FM_CROP_CATALOG_DETAIL, element: <Lazy><FarmManagerCropCatalogDetail /></Lazy> },
              { path: ROUTER.FM_CROP_CATALOG_EDIT, element: <Lazy><FarmManagerCropCatalogEdit /></Lazy> },
              { path: ROUTER.FM_CROPS, element: <Lazy><FarmManagerCrops /></Lazy> },
              { path: ROUTER.FM_CROP_DETAIL, element: <Lazy><FarmManagerCropDetail /></Lazy> },
              { path: ROUTER.FM_CROP_EDIT, element: <Lazy><FarmManagerCropEdit /></Lazy> },
              { path: ROUTER.FM_PRODUCTION_PLANS, element: <Lazy><FarmManagerProductionPlans /></Lazy> },
              { path: ROUTER.FM_TASKS, element: <Lazy><FarmManagerTasks /></Lazy> },
              { path: ROUTER.FM_LOGBOOKS, element: <Lazy><FarmManagerLogbooks /></Lazy> },
              { path: ROUTER.FM_BATCHES, element: <Lazy><FarmManagerBatches /></Lazy> },
              { path: ROUTER.FM_NOTIFICATIONS, element: <Lazy><FarmManagerNotifications /></Lazy> },
              { path: ROUTER.FM_NOTIFICATION_DETAIL, element: <Lazy><NotificationDetail /></Lazy> },
              { path: ROUTER.FM_VIEW_FERTILIZERS, element: <Lazy><FarmManagerViewFertilizers /></Lazy> },
              { path: ROUTER.FM_VIEW_CROP_PROTECTIONS, element: <Lazy><FarmManagerViewCropProtections /></Lazy> },
            ],
          },

          // ── Land Manager Routes ────────────────────────────────────────────
          {
            element: <ProtectedRoute allowedRoles={[ROLES.LAND_MANAGER]} />,
            children: [
              { path: ROUTER.LM_DASHBOARD, element: <Lazy><LandManagerDashboard /></Lazy> },
              { path: ROUTER.LM_FARMERS, element: <Lazy><LandManagerFarmers /></Lazy> },
              { path: ROUTER.LM_LANDS, element: <Lazy><LandManagerLands /></Lazy> },
              { path: ROUTER.LM_LAND_DETAIL, element: <Lazy><LandManagerLandPlotDetail /></Lazy> },
              { path: ROUTER.LM_PRODUCTION_PLANS, element: <Lazy><LandManagerProductionPlans /></Lazy> },
              { path: ROUTER.LM_TASKS, element: <Lazy><LandManagerTasks /></Lazy> },
              { path: ROUTER.LM_LOGBOOKS, element: <Lazy><LandManagerLogbooks /></Lazy> },
              { path: ROUTER.LM_BATCHES, element: <Lazy><LandManagerBatches /></Lazy> },
              { path: ROUTER.LM_NOTIFICATIONS, element: <Lazy><LandManagerNotifications /></Lazy> },
              { path: ROUTER.LM_NOTIFICATION_DETAIL, element: <Lazy><NotificationDetail /></Lazy> },
              { path: ROUTER.LM_CROP_CATALOGS, element: <Lazy><LandManagerViewCatalogs /></Lazy> },
              { path: ROUTER.LM_CROP_CATALOG_DETAIL, element: <Lazy><LandManagerCatalogDetail /></Lazy> },
              { path: ROUTER.LM_CROPS, element: <Lazy><LandManagerCrops /></Lazy> },
              { path: ROUTER.LM_CROP_DETAIL, element: <Lazy><LandManagerCropDetail /></Lazy> },
            ],
          },

          // ── Material Manager Routes ────────────────────────────────────────
          {
            element: <ProtectedRoute allowedRoles={[ROLES.MATERIAL_MANAGER]} />,
            children: [
              { path: ROUTER.MM_DASHBOARD, element: <Lazy><MaterialManagerDashboard /></Lazy> },
              { path: ROUTER.MM_FERTILIZERS, element: <Lazy><MaterialManagerFertilizers /></Lazy> },
              { path: ROUTER.MM_CROP_PROTECTIONS, element: <Lazy><MaterialManagerCropProtections /></Lazy> },
              { path: ROUTER.MM_MACHINERY, element: <Lazy><MaterialManagerMachinery /></Lazy> },
              { path: ROUTER.MM_MATERIALS, element: <Lazy><MaterialManagerMaterials /></Lazy> },
              { path: ROUTER.MM_MATERIAL_CREATE, element: <Lazy><MaterialManagerMaterialCreate /></Lazy> },
              { path: ROUTER.MM_MATERIAL_DETAIL, element: <Lazy><MaterialManagerMaterialDetail /></Lazy> },
              { path: ROUTER.MM_MATERIAL_EDIT, element: <Lazy><MaterialManagerMaterialEdit /></Lazy> },
              { path: ROUTER.MM_OTHER_MATERIALS, element: <Lazy><MaterialManagerOtherMaterials /></Lazy> },
              { path: ROUTER.MM_PURCHASE_REQS, element: <Lazy><MaterialManagerPurchaseReqs /></Lazy> },
              { path: ROUTER.MM_PRODUCTION_PLANS, element: <Lazy><MaterialManagerProductionPlans /></Lazy> },
              { path: ROUTER.MM_TASKS, element: <Lazy><MaterialManagerTasks /></Lazy> },
            ],
          },

          // ── Farmer Routes ──────────────────────────────────────────────────
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
