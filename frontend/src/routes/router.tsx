import { createBrowserRouter } from "react-router-dom";
import { AppShell } from "../components/layout/AppShell";
import { AuthLayout } from "../layouts/AuthLayout";
import { ProtectedRoute } from "./ProtectedRoute";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { ForgotPasswordPage } from "../pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "../pages/auth/ResetPasswordPage";
import { ExplorePage } from "../pages/ExplorePage";
import { DashboardPage } from "../pages/DashboardPage";
import { CreateExamPage } from "../pages/CreateExamPage";
import { ExamDetailsPage } from "../pages/ExamDetailsPage";
import { AttemptExamPage } from "../pages/AttemptExamPage";
import { ResultsPage } from "../pages/ResultsPage";
import { ResultDetailsPage } from "../pages/ResultDetailsPage";
import { AdminPage } from "../pages/AdminPage";
import { CreatorProfilePage } from "../pages/CreatorProfilePage";
import { NotificationsPage } from "../pages/NotificationsPage";
import { AiHubPage } from "../pages/AiHubPage";

export const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: "/login", element: <LoginPage /> },
      { path: "/register", element: <RegisterPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
      { path: "/reset-password/:token", element: <ResetPasswordPage /> }
    ]
  },
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <ExplorePage /> },
      { path: "exams/:examId", element: <ExamDetailsPage /> },
      { path: "creators/:creatorId", element: <CreatorProfilePage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: "dashboard", element: <DashboardPage /> },
          { path: "results", element: <ResultsPage /> },
          { path: "results/:resultId", element: <ResultDetailsPage /> },
          { path: "notifications", element: <NotificationsPage /> },
          { path: "ai", element: <AiHubPage /> },
          { path: "attempt/:examId", element: <AttemptExamPage /> }
        ]
      },
      {
        element: <ProtectedRoute roles={["teacher", "organization", "admin"]} />,
        children: [{ path: "create-exam", element: <CreateExamPage /> }]
      },
      {
        element: <ProtectedRoute roles={["admin"]} />,
        children: [{ path: "admin", element: <AdminPage /> }]
      }
    ]
  }
]);
