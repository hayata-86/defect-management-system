import { BrowserRouter, Routes, Route } from "react-router-dom";

import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";

import { DashboardPage } from "./pages/dashboard/DashboardPage";
import { DefectListPage } from "./pages/defects/DefectListPage";
import { DefectCreatePage } from "./pages/defects/DefectCreatePage";
import { DefectEditPage } from "./pages/defects/DefectEditPage";
import { DefectDetailPage } from "./pages/defects/DefectDetailPage";
import { MonthlyReviewPage } from "./pages/monthly-review/MonthlyReviewPage";
import { AnalysisPage } from "./pages/analysis/AnalysisPage";

import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import { ConfirmRegisterPage } from "./pages/auth/ConfirmRegisterPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 認証不要 */}
        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          path="/register/confirm"
          element={<ConfirmRegisterPage />}
        />

        {/* 認証必須 */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route
              index
              element={<DashboardPage />}
            />

            <Route
              path="defects"
              element={<DefectListPage />}
            />

            <Route
              path="defects/new"
              element={<DefectCreatePage />}
            />

            <Route
              path="defects/:defectId"
              element={<DefectDetailPage />}
            />

            <Route
              path="defects/:defectId/edit"
              element={<DefectEditPage />}
            />

            <Route
              path="monthly-review"
              element={<MonthlyReviewPage />}
            />

            <Route
              path="analysis"
              element={<AnalysisPage />}
            />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}