import React, { Suspense } from "react"
import { Navigate, useRoutes } from "react-router-dom"
import SpinCustom from "src/components/SpinCustom"
import ROUTER from "./ROUTER"

// Layouts
import LayoutCommon from "src/components/Common/LayoutCommon"
import LayoutAdmin from "src/components/Layout/LayoutAdmin"
import LayoutUser from "src/components/Layout/LayoutUser"

// Public Pages
const Home = React.lazy(() => import("src/pages/ANONYMOUS/Home"))
const ForgotPassword = React.lazy(
  () => import("src/pages/ANONYMOUS/ForgotPassword"),
)
const ResetPassword = React.lazy(
  () => import("src/pages/ANONYMOUS/ResetPassword"),
)
const VerifyOTP = React.lazy(() => import("src/pages/ANONYMOUS/VerifyOTP"))
const NotFound = React.lazy(() => import("src/pages/ANONYMOUS/NotFound"))
const Unauthorized = React.lazy(
  () => import("src/pages/ANONYMOUS/Unauthorized"),
)
const Forbidden = React.lazy(() => import("src/pages/ANONYMOUS/Forbidden"))

// Admin Pages
const AdminDashboard = React.lazy(() => import("src/pages/ADMIN/Dashboard"))
const AdminJournal = React.lazy(
  () => import("src/pages/ADMIN/JournalManagement"),
)
const AdminInventory = React.lazy(() => import("src/pages/ADMIN/Inventory"))
const AdminUsers = React.lazy(() => import("src/pages/ADMIN/UserManagement"))
const AdminFormTemplate = React.lazy(
  () => import("src/pages/ADMIN/FormTemplate"),
)
const AdminSupplies = React.lazy(() => import("src/pages/ADMIN/Supplies"))

// User Pages
const UserDashboard = React.lazy(() => import("src/pages/USER/Dashboard"))
const UserJournal = React.lazy(() => import("src/pages/USER/Journal"))
const UserProductionProcess = React.lazy(
  () => import("src/pages/USER/ProductionProcess"),
)
const UserWarehouse = React.lazy(() => import("src/pages/USER/Warehouse"))

const Profile = React.lazy(() => import("src/pages/USER/Profile"))
const Settings = React.lazy(() => import("src/pages/USER/Settings"))
const Notifications = React.lazy(() => import("src/pages/USER/Notifications"))
const ChangePassword = React.lazy(() => import("src/pages/USER/ChangePassword"))

// Route Guards
import { GuestRoute, ProtectedRoute } from "./guards"

function LazyLoadingComponent({ children }) {
  return (
    <Suspense
      fallback={
        <div
          className="loading-center"
          style={{
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <SpinCustom />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

const routes = [
  // Public & Guest Routes
  {
    element: <GuestRoute />,
    children: [
      {
        path: ROUTER.FORGOT_PASSWORD,
        element: (
          <LazyLoadingComponent>
            <ForgotPassword />
          </LazyLoadingComponent>
        ),
      },
      {
        path: ROUTER.RESET_PASSWORD,
        element: (
          <LazyLoadingComponent>
            <ResetPassword />
          </LazyLoadingComponent>
        ),
      },
      {
        path: ROUTER.VERIFY_OTP,
        element: (
          <LazyLoadingComponent>
            <VerifyOTP />
          </LazyLoadingComponent>
        ),
      },
      {
        path: ROUTER.LOGIN,
        element: <Navigate to={`${ROUTER.HOME}?auth=login`} replace />,
      },
      {
        path: ROUTER.REGISTER,
        element: <Navigate to={`${ROUTER.HOME}?auth=register`} replace />,
      },
    ],
  },
  {
    path: ROUTER.HOME,
    element: (
      <LazyLoadingComponent>
        <LayoutCommon>
          <Home />
        </LayoutCommon>
      </LazyLoadingComponent>
    ),
  },

  // Admin Routes
  {
    path: "/admin",
    element: (
      <ProtectedRoute roles={["admin"]}>
        <LayoutAdmin />
      </ProtectedRoute>
    ),
    children: [
      {
        path: ROUTER.ADMIN_DASHBOARD,
        element: (
          <LazyLoadingComponent>
            <AdminDashboard />
          </LazyLoadingComponent>
        ),
      },
      {
        path: ROUTER.ADMIN_JOURNAL,
        element: (
          <LazyLoadingComponent>
            <AdminJournal />
          </LazyLoadingComponent>
        ),
      },
      {
        path: ROUTER.ADMIN_INVENTORY,
        element: (
          <LazyLoadingComponent>
            <AdminInventory />
          </LazyLoadingComponent>
        ),
      },
      {
        path: ROUTER.ADMIN_USERS,
        element: (
          <LazyLoadingComponent>
            <AdminUsers />
          </LazyLoadingComponent>
        ),
      },
      {
        path: ROUTER.ADMIN_FORM_TEMPLATE,
        element: (
          <LazyLoadingComponent>
            <AdminFormTemplate />
          </LazyLoadingComponent>
        ),
      },
      {
        path: ROUTER.ADMIN_SUPPLIES,
        element: (
          <LazyLoadingComponent>
            <AdminSupplies />
          </LazyLoadingComponent>
        ),
      },
    ],
  },

  // User/Seller Routes
  {
    path: "/",
    element: (
      <ProtectedRoute roles={["user", "seller"]}>
        <LayoutUser />
      </ProtectedRoute>
    ),
    children: [
      {
        path: ROUTER.USER_DASHBOARD,
        element: (
          <LazyLoadingComponent>
            <UserDashboard />
          </LazyLoadingComponent>
        ),
      },
      {
        path: ROUTER.USER_JOURNAL,
        element: (
          <LazyLoadingComponent>
            <UserJournal />
          </LazyLoadingComponent>
        ),
      },
      {
        path: ROUTER.USER_PRODUCTION_PROCESS,
        element: (
          <LazyLoadingComponent>
            <UserProductionProcess />
          </LazyLoadingComponent>
        ),
      },
      {
        path: ROUTER.USER_WAREHOUSE,
        element: (
          <LazyLoadingComponent>
            <UserWarehouse />
          </LazyLoadingComponent>
        ),
      },
      {
        path: ROUTER.PROFILE,
        element: (
          <LazyLoadingComponent>
            <Profile />
          </LazyLoadingComponent>
        ),
      },
      {
        path: ROUTER.SETTINGS,
        element: (
          <LazyLoadingComponent>
            <Settings />
          </LazyLoadingComponent>
        ),
      },
      {
        path: ROUTER.NOTIFICATIONS,
        element: (
          <LazyLoadingComponent>
            <Notifications />
          </LazyLoadingComponent>
        ),
      },
      {
        path: ROUTER.CHANGE_PASSWORD,
        element: (
          <LazyLoadingComponent>
            <ChangePassword />
          </LazyLoadingComponent>
        ),
      },
    ],
  },

  // Error Pages
  {
    path: ROUTER.UNAUTHORIZED,
    element: (
      <LazyLoadingComponent>
        <Unauthorized />
      </LazyLoadingComponent>
    ),
  },
  {
    path: ROUTER.FORBIDDEN,
    element: (
      <LazyLoadingComponent>
        <Forbidden />
      </LazyLoadingComponent>
    ),
  },
  {
    path: "*",
    element: (
      <LazyLoadingComponent>
        <NotFound />
      </LazyLoadingComponent>
    ),
  },
]

const AppRouter = () => {
  return useRoutes(routes)
}

export default AppRouter

