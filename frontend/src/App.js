import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./components/Toast";
import ProtectedRoute from "./components/ProtectedRoute";

// Layouts
import PublicLayout from "./layouts/PublicLayout";
import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";

// Public Pages
import LandingPage from "./pages/public/LandingPage";
import ExploreBooks from "./pages/public/ExploreBooks";
import LoginPage from "./pages/public/LoginPage";
import SignupPage from "./pages/public/SignupPage";
import ForgotPasswordPage from "./pages/public/ForgotPasswordPage";
import ResetPasswordPage from "./pages/public/ResetPasswordPage";

// User Pages
import UserDashboard from "./pages/user/UserDashboard";
import BrowseBooks from "./pages/user/BrowseBooks";
import UserBookDetails from "./pages/user/UserBookDetails";
import MyBooks from "./pages/user/MyBooks";
import BorrowRequests from "./pages/user/BorrowRequests";
import Reservations from "./pages/user/Reservations";
import Favorites from "./pages/user/Favorites";
import UserHistory from "./pages/user/UserHistory";
import UserNotifications from "./pages/user/UserNotifications";
import UserProfile from "./pages/user/UserProfile";
import MyFines from "./pages/user/MyFines";
import UserPayments from "./pages/user/UserPayments";
import PaymentCheckout from "./pages/user/PaymentCheckout";
import PaymentReceipt from "./pages/user/PaymentReceipt";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBooks from "./pages/admin/AdminBooks";
import AdminAuthors from "./pages/admin/AdminAuthors";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminBorrowing from "./pages/admin/AdminBorrowing";
import AdminReservations from "./pages/admin/AdminReservations";
import AdminFines from "./pages/admin/AdminFines";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminReports from "./pages/admin/AdminReports";
import AdminActivityLogs from "./pages/admin/AdminActivityLogs";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminProfile from "./pages/admin/AdminProfile";

function App() {
  console.log(">>> [Frontend] App component is rendering...");
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
          <Routes>
            {/* Public Visitor Routes */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="explore" element={<ExploreBooks />} />
              <Route path="book/:id" element={<ExploreBooks />} />
              <Route path="login" element={<LoginPage />} />
              <Route path="signup" element={<SignupPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="reset-password" element={<ResetPasswordPage />} />
            </Route>

            {/* Legacy compatibility redirect */}
            <Route path="/borrow" element={<Navigate to="/user/my-books" replace />} />

            {/* Authenticated User / Reader Portal */}
            <Route
              path="/user"
              element={
                <ProtectedRoute>
                  <UserLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/user/dashboard" replace />} />
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="books" element={<BrowseBooks />} />
              <Route path="books/:id" element={<UserBookDetails />} />
              <Route path="my-books" element={<MyBooks />} />
              <Route path="borrow-requests" element={<BorrowRequests />} />
              <Route path="reservations" element={<Reservations />} />
              <Route path="favorites" element={<Favorites />} />
              <Route path="fines" element={<MyFines />} />
              <Route path="payments" element={<UserPayments />} />
              <Route path="payments/checkout/:fineId" element={<PaymentCheckout />} />
              <Route path="payments/:paymentId/receipt" element={<PaymentReceipt />} />
              <Route path="history" element={<UserHistory />} />
              <Route path="notifications" element={<UserNotifications />} />
              <Route path="profile" element={<UserProfile />} />
            </Route>

            {/* Authenticated Admin Management Portal */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="ROLE_ADMIN">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="books" element={<AdminBooks />} />
              <Route path="authors" element={<AdminAuthors />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="borrowing" element={<AdminBorrowing />} />
              <Route path="reservations" element={<AdminReservations />} />
              <Route path="fines" element={<AdminFines />} />
              <Route path="payments" element={<AdminPayments />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="activity-log" element={<AdminActivityLogs />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="profile" element={<AdminProfile />} />
            </Route>

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  </Router>
  );
}

export default App;