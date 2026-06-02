import React, { Suspense, useContext } from 'react'
import { Navigate, useRoutes } from 'react-router-dom'
import ROUTER from './ROUTER'
import { StoreContext } from 'src/contexts'

// ── Layouts ───────────────────────────────────────────────────────────────────
import LayoutCommon from 'src/components/Common/LayoutCommon'
import LayoutAdmin from 'src/components/Layout/LayoutAdmin'

// ── SUPPORTPAGES Guards (TabID system) ────────────────────────────────────────
const AdminRoutes   = React.lazy(() => import('src/pages/SUPPORTPAGES/AdminRouter'))
const PrivateRoutes = React.lazy(() => import('src/pages/SUPPORTPAGES/PrivateRoutes'))
const PublicRouters = React.lazy(() => import('src/pages/SUPPORTPAGES/PublicRouters'))
const GuestRoute    = React.lazy(() => import('src/pages/SUPPORTPAGES/GuestRoute'))

// ── Lazy-loaded pages ─────────────────────────────────────────────────────────
// ANONYMOUS
const Home            = React.lazy(() => import('../pages/ANONYMOUS/Home'))
const Login           = React.lazy(() => import('../pages/ANONYMOUS/Login'))
const Register        = React.lazy(() => import('../pages/ANONYMOUS/Register'))
const ForgotPassword  = React.lazy(() => import('../pages/ANONYMOUS/ForgotPassword'))
const ResetPassword   = React.lazy(() => import('../pages/ANONYMOUS/ResetPassword'))
const NotFound        = React.lazy(() => import('../pages/SUPPORTPAGES/NotFound'))
const Forbidden       = React.lazy(() => import('../pages/ANONYMOUS/Forbidden'))
const NewsListAll     = React.lazy(() => import('../pages/ANONYMOUS/News/NewsListAll'))
const NewsDetail      = React.lazy(() => import('../pages/ANONYMOUS/News/NewsDetail'))
const TCVNReference   = React.lazy(() => import('../pages/ANONYMOUS/Reference/TCVNReference'))

// ADMIN
const Dashboard             = React.lazy(() => import('../pages/ADMIN/Dashboard/index'))
const UserManagement        = React.lazy(() => import('../pages/ADMIN/UserManagement/index'))
const JournalManagement     = React.lazy(() => import('../pages/ADMIN/JournalManagement/index'))
const FormTemplate          = React.lazy(() => import('../pages/ADMIN/FormTemplate/index'))
const Inventory             = React.lazy(() => import('../pages/ADMIN/Inventory/index'))
const InventoryCategory     = React.lazy(() => import('../pages/ADMIN/InventoryCategory/index'))
const GroupManagement       = React.lazy(() => import('../pages/ADMIN/GroupManagement'))
const RolesManagement       = React.lazy(() => import('../pages/ADMIN/RolesManagement'))
const NewsManagement        = React.lazy(() => import('../pages/ADMIN/NewsManagement'))
const ConsultationManagement = React.lazy(() => import('../pages/ADMIN/ConsultationManagement'))
const Reports               = React.lazy(() => import('../pages/ADMIN/Reports'))
const SystemLogs            = React.lazy(() => import('../pages/ADMIN/SystemLogs'))
const BackupMgmt            = React.lazy(() => import('../pages/ADMIN/BackupMgmt'))
const ChatStats             = React.lazy(() => import('../pages/ADMIN/ChatStats'))
const AgricultureModels     = React.lazy(() => import('../pages/ADMIN/AgricultureModels'))
const AccountInfo           = React.lazy(() => import('../pages/ADMIN/AccountInfo'))
const GeminiTest            = React.lazy(() => import('../pages/ADMIN/GeminiTest'))
const OpenAITest            = React.lazy(() => import('../pages/ADMIN/OpenAITest'))
const GroqTest              = React.lazy(() => import('../pages/ADMIN/GroqTest'))
const RAGTest               = React.lazy(() => import('../pages/ADMIN/RAGTest'))

// USER
const ChangePassword        = React.lazy(() => import('../pages/USER/ChangePassword'))
const FarmerManagement      = React.lazy(() => import('../pages/USER/FarmerManagement'))
const HtxInventory          = React.lazy(() => import('../pages/USER/HtxInventory'))
const HtxJournal            = React.lazy(() => import('../pages/USER/HtxJournal'))
const HtxJournalApproval    = React.lazy(() => import('../pages/HTX/HtxJournalApproval'))
const HtxProductMgmt        = React.lazy(() => import('../pages/HTX/HtxProductMgmt'))
const HtxBatchMgmt          = React.lazy(() => import('../pages/HTX/HtxBatchMgmt'))
const HtxSupplyMgmt         = React.lazy(() => import('../pages/HTX/HtxSupplyMgmt'))
const HtxPortalSettings     = React.lazy(() => import('../pages/HTX/HtxPortalSettings'))
const JournalList           = React.lazy(() => import('../pages/USER/Journal/JournalList'))
const JournalEntry          = React.lazy(() => import('../pages/USER/Journal/JournalEntry'))
const JournalTrace          = React.lazy(() => import('../pages/USER/Journal/JournalTrace'))
const FarmerInventory       = React.lazy(() => import('../pages/USER/FarmerInventory'))
const FarmerSupplyMgmt      = React.lazy(() => import('../pages/Journal/FarmerSupplyMgmt'))
const ProductionTech        = React.lazy(() => import('../pages/USER/ProductionTech'))

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
      { path: ROUTER.HOME,        element: <Lazy><Home /></Lazy> },
      { path: ROUTER.NEWS,        element: <Lazy><NewsListAll /></Lazy> },
      { path: ROUTER.NEWS_DETAIL, element: <Lazy><NewsDetail /></Lazy> },
      { path: ROUTER.TCVN,        element: <Lazy><TCVNReference /></Lazy> },
    ],
  },

  // ── Auth pages (guest only — redirect nếu đã login) ───────────────────────
  {
    path: ROUTER.LOGIN,
    element: <Lazy><GuestRoute><Login /></GuestRoute></Lazy>,
  },
  {
    path: ROUTER.REGISTER,
    element: <Lazy><GuestRoute><Register /></GuestRoute></Lazy>,
  },
  {
    path: ROUTER.FORGOT_PASSWORD,
    element: <Lazy><GuestRoute><ForgotPassword /></GuestRoute></Lazy>,
  },
  {
    path: ROUTER.RESET_PASSWORD,
    element: <Lazy><GuestRoute><ResetPassword /></GuestRoute></Lazy>,
  },

  // ── Trace QR (standalone — không cần layout, không cần login) ────────────
  {
    path: ROUTER.TRACE,
    element: <Lazy><JournalTrace /></Lazy>,
  },

  // ── Authenticated app layout (LayoutAdmin bao ngoài Outlet) ──────────────
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
          // Redirect /app → /dashboard
          { path: ROUTER.APP_REDIRECT, element: <Navigate to={ROUTER.ADMIN_DASHBOARD} replace /> },

          // Shared (mọi role đã login đều thấy)
          { path: ROUTER.ADMIN_DASHBOARD,       element: <Lazy><Dashboard /></Lazy> },
          { path: ROUTER.ADMIN_DASHBOARD_ALIAS, element: <Lazy><Dashboard /></Lazy> },
          { path: ROUTER.ADMIN_REPORTS,         element: <Lazy><Reports /></Lazy> },
          { path: ROUTER.ACCOUNT_INFO,          element: <Lazy><AccountInfo /></Lazy> },
          { path: ROUTER.CHANGE_PASSWORD,       element: <Lazy><ChangePassword /></Lazy> },
          { path: ROUTER.ADMIN_AG_MODELS,       element: <Lazy><AgricultureModels /></Lazy> },
          { path: ROUTER.ADMIN_INVENTORY,       element: <Lazy><Inventory /></Lazy> },
          { path: ROUTER.ADMIN_INVENTORY_CATEGORY, element: <Lazy><InventoryCategory /></Lazy> },
          { path: ROUTER.ADMIN_INVENTORY_MODELS,   element: <Lazy><Inventory /></Lazy> },
          { path: ROUTER.TCVN_AUTH,             element: <Lazy><TCVNReference /></Lazy> },

          // Admin-only (TabID guard via AdminRoutes wraps these in LayoutAdmin)
          {
            element: <Lazy><AdminRoutes /></Lazy>,
            children: [
              { path: ROUTER.ADMIN_FORM_BUILDER,   element: <Lazy><FormTemplate /></Lazy> },
              { path: ROUTER.ADMIN_USERS,           element: <Lazy><UserManagement /></Lazy> },
              { path: ROUTER.ADMIN_JOURNALS,        element: <Lazy><JournalManagement /></Lazy> },
              { path: ROUTER.ADMIN_ACCOUNTS_MGMT,  element: <Lazy><AccountInfo /></Lazy> },
              { path: ROUTER.ADMIN_GROUPS,          element: <Lazy><GroupManagement /></Lazy> },
              { path: ROUTER.ADMIN_ROLES,           element: <Lazy><RolesManagement /></Lazy> },
              { path: ROUTER.ADMIN_NEWS,            element: <Lazy><NewsManagement /></Lazy> },
              { path: ROUTER.ADMIN_CONSULTATIONS,  element: <Lazy><ConsultationManagement /></Lazy> },
              { path: ROUTER.ADMIN_GEMINI,          element: <Lazy><GeminiTest /></Lazy> },
              { path: ROUTER.ADMIN_OPENAI,          element: <Lazy><OpenAITest /></Lazy> },
              { path: ROUTER.ADMIN_GROQ,            element: <Lazy><GroqTest /></Lazy> },
              { path: ROUTER.ADMIN_RAG,             element: <Lazy><RAGTest /></Lazy> },
              { path: ROUTER.ADMIN_CHAT_STATS,      element: <Lazy><ChatStats /></Lazy> },
              { path: ROUTER.ADMIN_LOGS,            element: <Lazy><SystemLogs /></Lazy> },
              { path: ROUTER.ADMIN_BACKUP,          element: <Lazy><BackupMgmt /></Lazy> },
            ],
          },

          // HTX routes
          { path: ROUTER.HTX_JOURNALS,       element: <Lazy><HtxJournal /></Lazy> },
          { path: ROUTER.HTX_FARMERS,        element: <Lazy><FarmerManagement /></Lazy> },
          { path: ROUTER.HTX_APPROVALS,      element: <Lazy><HtxJournalApproval /></Lazy> },
          { path: ROUTER.HTX_PRODUCTS,       element: <Lazy><HtxProductMgmt /></Lazy> },
          { path: ROUTER.HTX_BATCHES,        element: <Lazy><HtxBatchMgmt /></Lazy> },
          { path: ROUTER.HTX_SUPPLIES,       element: <Lazy><HtxSupplyMgmt /></Lazy> },
          { path: ROUTER.HTX_PORTAL_SETTINGS, element: <Lazy><HtxPortalSettings /></Lazy> },
          { path: ROUTER.HTX_INVENTORY,      element: <Lazy><HtxInventory /></Lazy> },
          { path: ROUTER.FARMERS,            element: <Lazy><FarmerManagement /></Lazy> },
          { path: ROUTER.JOURNAL_VIEW,       element: <Lazy><JournalEntry /></Lazy> },

          // Farmer routes — VietGAP, Hữu cơ, Thông minh
          {
            path: 'vietgap/:subCategory',
            children: [
              { index: true,            element: <Lazy><JournalList /></Lazy> },
              { path: 'new/:schemaId',  element: <Lazy><JournalEntry /></Lazy> },
              { path: 'edit/:id',       element: <Lazy><JournalEntry /></Lazy> },
            ],
          },
          {
            path: 'huuco/:subCategory',
            children: [
              { index: true,            element: <Lazy><JournalList /></Lazy> },
              { path: 'new/:schemaId',  element: <Lazy><JournalEntry /></Lazy> },
              { path: 'edit/:id',       element: <Lazy><JournalEntry /></Lazy> },
            ],
          },
          {
            path: 'thongminh/:subCategory',
            children: [
              { index: true,            element: <Lazy><JournalList /></Lazy> },
              { path: 'new/:schemaId',  element: <Lazy><JournalEntry /></Lazy> },
              { path: 'edit/:id',       element: <Lazy><JournalEntry /></Lazy> },
            ],
          },
          { path: ROUTER.PRODUCTION_TECH,   element: <Lazy><ProductionTech /></Lazy> },
          { path: ROUTER.FARMER_INVENTORY,  element: <Lazy><FarmerInventory /></Lazy> },
          { path: ROUTER.FARMER_SUPPLIES,   element: <Lazy><FarmerSupplyMgmt /></Lazy> },
        ],
      },
    ],
  },

  // ── Error pages (standalone, no layout) ──────────────────────────────────
  { path: ROUTER.FORBIDDEN, element: <Lazy><Forbidden /></Lazy> },
  { path: ROUTER.NOT_FOUND, element: <Lazy><NotFound /></Lazy> },
  { path: '*',              element: <Lazy><NotFound /></Lazy> },
]

const AppRouter = () => useRoutes(routes)
export default AppRouter
