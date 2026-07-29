import { createBrowserRouter } from "react-router-dom";

import { ProtectedRoute } from "../components/ProtectedRoute";
import { AppLayout } from "../components/layout/AppLayout";
import { AnalysisPage } from "../pages/analysis/AnalysisPage";
import { ConfirmRegisterPage } from "../pages/auth/ConfirmRegisterPage";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { DefectCreatePage } from "../pages/defects/DefectCreatePage";
import { DefectDetailPage } from "../pages/defects/DefectDetailPage";
import { DefectEditPage } from "../pages/defects/DefectEditPage";
import { DefectListPage } from "../pages/defects/DefectListPage";
import { MonthlyReviewPage } from "../pages/monthly-review/MonthlyReviewPage";
import { NotFoundPage } from "../pages/not-found/NotFoundPage";

export const router = createBrowserRouter([
  // 認証不要
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/register/confirm",
    element: <ConfirmRegisterPage />,
  },

  // 認証が必要
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: "/",
            element: <DashboardPage />,
          },
          {
            path: "/defects",
            element: <DefectListPage />,
          },
          {
            path: "/defects/new",
            element: <DefectCreatePage />,
          },
          {
            path: "/defects/:defectId",
            element: <DefectDetailPage />,
          },
          {
            path: "/defects/:defectId/edit",
            element: <DefectEditPage />,
          },
          {
            path: "/monthly-review",
            element: <MonthlyReviewPage />,
          },
          {
            path: "/analysis",
            element: <AnalysisPage />,
          },
          {
            path: "*",
            element: <NotFoundPage />,
          },
        ],
      },
    ],
  },
]);