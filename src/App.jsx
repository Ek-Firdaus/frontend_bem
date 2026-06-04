import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute, { ADMIN_ROLES, MEMBER_ROLES } from './components/ProtectedRoute';

// Layouts
import AdminLayout  from './components/layouts/AdminLayout';
import MemberLayout from './components/layouts/MemberLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';

// Admin pages
import AdminDashboardPage from './pages/admin/DashboardPage';
import CreateEventPage    from './pages/admin/CreateEventPage';
import EventDetailPage    from './pages/admin/EventDetailPage';
import ManageUsersPage    from './pages/admin/ManageUsersPage';

// Member pages
import MemberDashboardPage from './pages/member/DashboardPage';
import AttendancePage      from './pages/member/AttendancePage';
import HistoryPage         from './pages/member/HistoryPage';
import ProfilePage         from './pages/member/ProfilePage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={ADMIN_ROLES}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard"    element={<AdminDashboardPage />} />
            <Route path="events/new"   element={<CreateEventPage />} />
            <Route path="events/:id"   element={<EventDetailPage />} />
            <Route
              path="users"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <ManageUsersPage />
                </ProtectedRoute>
              }
            />
            <Route path="attend"    element={<AttendancePage />} />
            <Route path="history"   element={<HistoryPage />} />
            <Route path="profile"   element={<ProfilePage />} />
          </Route>

          {/* Member routes */}
          <Route
            path="/member"
            element={
              <ProtectedRoute allowedRoles={MEMBER_ROLES}>
                <MemberLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/member/dashboard" replace />} />
            <Route path="dashboard" element={<MemberDashboardPage />} />
            <Route path="attend"    element={<AttendancePage />} />
            <Route path="history"   element={<HistoryPage />} />
            <Route path="profile"   element={<ProfilePage />} />
          </Route>

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* 404 fallback */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-4">
                <p className="text-6xl font-extrabold text-gray-200">404</p>
                <p className="text-lg font-semibold text-gray-700">Halaman tidak ditemukan</p>
                <a href="/" className="btn-primary btn-sm">Ke Beranda</a>
              </div>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
