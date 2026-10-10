import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "../components/auth/ProtectedRoute";
import PublicRoute from "../components/auth/PublicRoute";
import AppLayout from "../layouts/AppLayout";
import Spinner from "../components/ui/Spinner";

// Code-split pages for high performance and fast initial load
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("../pages/auth/RegisterPage"));
const ForgotPasswordPage = lazy(() => import("../pages/auth/ForgotPasswordPage"));
const DashboardPage = lazy(() => import("../pages/dashboard/DashboardPage"));
const ProfilePage = lazy(() => import("../pages/profile/ProfilePage"));
const StudentsPage = lazy(() => import("../pages/StudentsPage"));
const StudentProfilePage = lazy(
  () => import("../pages/students/StudentProfilePage")
);
const SubjectsPage = lazy(() => import("../pages/subjects/SubjectsPage"));
const RequestsPage = lazy(() => import("../pages/requests/RequestsPage"));
const ChatPage = lazy(() => import("../pages/chat/ChatPage"));
const NotificationsPage = lazy(
  () => import("../pages/notifications/NotificationsPage")
);
const SettingsPage = lazy(() => import("../pages/settings/SettingsPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));

function PageLoader() {
  return (
    <div className="flex h-96 w-full items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Public Auth Routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterPage />
            </PublicRoute>
          }
        />

        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />

        {/* Protected App Routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/students/:id" element={<StudentProfilePage />} />
          <Route path="/profile/:id" element={<StudentProfilePage />} />
          <Route path="/subjects" element={<SubjectsPage />} />
          <Route path="/requests" element={<RequestsPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
