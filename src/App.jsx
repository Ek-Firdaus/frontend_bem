import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute, { ADMIN_ROLES, MEMBER_ROLES } from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

// Layouts
import AdminLayout  from './components/layouts/AdminLayout';
import MemberLayout from './components/layouts/MemberLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';

// Admin pages
import SuperAdminDashboardPage from './pages/admin/SuperAdminDashboardPage';
import EventListPage from './pages/admin/EventListPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';
import CreateEventPage    from './pages/admin/CreateEventPage';
import EventDetailPage    from './pages/admin/EventDetailPage';
import ManageUsersPage    from './pages/admin/ManageUsersPage';
import ManageInventoryPage from './pages/admin/ManageInventoryPage';
import ManageBlogPage     from './pages/admin/ManageBlogPage';
import ManageComplaintsPage from './pages/admin/ManageComplaintsPage';

// Member pages
import MemberDashboardPage from './pages/member/DashboardPage';
import AttendancePage      from './pages/member/AttendancePage';
import HistoryPage         from './pages/member/HistoryPage';
import ProfilePage         from './pages/member/ProfilePage';
import InventoryCatalogPage from './pages/member/InventoryCatalogPage';

export default function App() {
  const AdminDashboardRouter = () => {
    const { user } = useAuth();
    if (user?.role === 'super_admin') return <SuperAdminDashboardPage />;
    return <MemberDashboardPage basePath="/admin" />;
  };

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
            <Route path="dashboard"    element={<AdminDashboardRouter />} />
            <Route path="events"       element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin_psdm']}>
                <EventListPage />
              </ProtectedRoute>
            } />
            <Route path="events/new"   element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin_psdm']}>
                <CreateEventPage />
              </ProtectedRoute>
            } />
            <Route path="events/:id"   element={
              <ProtectedRoute allowedRoles={['super_admin', 'admin_psdm']}>
                <EventDetailPage />
              </ProtectedRoute>
            } />
            <Route
              path="users"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <ManageUsersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="inventory"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'admin_sekre']}>
                  <ManageInventoryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="blogs"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'admin_komdigi']}>
                  <ManageBlogPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="complaints"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'admin_advokes']}>
                  <ManageComplaintsPage />
                </ProtectedRoute>
              }
            />
            <Route path="attend"    element={<AttendancePage />} />
            <Route path="history"   element={<HistoryPage />} />
            <Route path="profile"   element={<ProfilePage />} />
            <Route
              path="analytics"
              element={
                <ProtectedRoute allowedRoles={['super_admin']}>
                  <AdminAnalyticsPage />
                </ProtectedRoute>
              }
            />
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
            <Route path="inventory" element={<InventoryCatalogPage />} />
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
