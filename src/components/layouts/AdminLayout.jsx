import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../ui/LoadingSpinner';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut]   = useState(false);
  
  const [openSections, setOpenSections] = useState({
    'Menu Admin': true,
    'Menu Mandiri': true,
    'Section Absensi': true,
    'Section Inventaris': true,
  });

  const toggleSection = (title) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const getSidebarSections = () => {
    const icons = {
      dashboard: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
      users: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>,
      eventNew: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>,
      eventList: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>,
      inventory: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>,
      attend: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      history: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
      profile: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
      blog: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>,
      complaint: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>,
    };

    if (user?.role === 'super_admin') {
      return [
        {
          title: 'Menu Admin',
          items: [
            { to: '/admin/dashboard', label: 'Beranda', icon: icons.dashboard },
            { to: '/admin/analytics', label: 'Analitik', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
            { to: '/admin/users', label: 'Kelola User', icon: icons.users },
            { to: '/admin/events', label: 'Daftar Acara', icon: icons.eventList },
            { to: '/admin/events/new', label: 'Buat Event', icon: icons.eventNew },
            { to: '/admin/inventory', label: 'Inventaris', icon: icons.inventory },
          ]
        },
        {
          title: 'Menu Konten',
          items: [
            { to: '/admin/blogs', label: 'Kelola Blog', icon: icons.blog },
            { to: '/admin/complaints', label: 'Pengaduan', icon: icons.complaint },
          ]
        },
        {
          title: 'Menu Mandiri',
          items: [
            { to: '/admin/attend', label: 'Absen Mandiri', icon: icons.attend },
            { to: '/admin/history', label: 'Riwayat Pribadi', icon: icons.history },
            { to: '/admin/profile', label: 'Profil Saya', icon: icons.profile },
          ]
        }
      ];
    }

    if (user?.role === 'admin_psdm') {
      return [
        {
          title: 'Menu Absensi',
          items: [
            { to: '/admin/events/new', label: 'Buat Acara', icon: icons.eventNew },
            { to: '/admin/events', label: 'Lihat List Acara', icon: icons.eventList },
            { to: '/admin/attend', label: 'Absensi', icon: icons.attend },
          ]
        },
        {
          title: 'Menu Mandiri',
          items: [
            { to: '/admin/dashboard', label: 'Beranda', icon: icons.dashboard },
            { to: '/admin/history', label: 'Riwayat', icon: icons.history },
            { to: '/admin/profile', label: 'Profil Saya', icon: icons.profile },
          ]
        }
      ];
    }

    if (user?.role === 'admin_sekre') {
      return [
        {
          title: 'Menu Absensi',
          items: [
            { to: '/admin/attend', label: 'Absensi', icon: icons.attend },
          ]
        },
        {
          title: 'Menu Inventaris',
          items: [
            { to: '/admin/inventory', label: 'Kelola Inventaris', icon: icons.inventory },
          ]
        },
        {
          title: 'Menu Mandiri',
          items: [
            { to: '/admin/dashboard', label: 'Beranda', icon: icons.dashboard },
            { to: '/admin/history', label: 'Riwayat', icon: icons.history },
            { to: '/admin/profile', label: 'Profil Saya', icon: icons.profile },
          ]
        }
      ];
    }

    if (user?.role === 'admin_komdigi') {
      return [
        {
          title: 'Website',
          items: [
            { to: '/admin/blogs', label: 'Kelola Blog', icon: icons.blog },
          ]
        },
        {
          title: 'Menu Mandiri',
          items: [
            { to: '/admin/dashboard', label: 'Beranda', icon: icons.dashboard },
            { to: '/admin/attend', label: 'Absensi', icon: icons.attend },
            { to: '/admin/history', label: 'Riwayat', icon: icons.history },
            { to: '/admin/profile', label: 'Profil Saya', icon: icons.profile },
          ]
        }
      ];
    }

    if (user?.role === 'admin_advokes') {
      return [
        {
          title: 'Menu Advokasi',
          items: [
            { to: '/admin/complaints', label: 'Kelola Pengaduan', icon: icons.complaint },
          ]
        },
        {
          title: 'Menu Mandiri',
          items: [
            { to: '/admin/dashboard', label: 'Beranda', icon: icons.dashboard },
            { to: '/admin/attend', label: 'Absensi', icon: icons.attend },
            { to: '/admin/history', label: 'Riwayat', icon: icons.history },
            { to: '/admin/profile', label: 'Profil Saya', icon: icons.profile },
          ]
        }
      ];
    }

    return [];
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout();
    navigate('/login', { replace: true });
  };

  const sections = getSidebarSections();

  return (
    <div className="flex h-screen bg-gray-200 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar — desktop always visible, mobile drawer */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 flex-shrink-0
          bg-gradient-to-b from-primary-dark via-primary to-primary-light
          transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="px-6 py-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <img src="/logo-bem.png" alt="Logo BEM FTI" className="w-9 h-9 rounded-xl object-contain" />
              <div>
                <p className="font-bold text-white text-sm leading-tight">SIM-BEM</p>
                <p className="text-xs text-slate-400">Sistem Informasi</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
            {sections.map((section, idx) => (
              <div key={idx} className="space-y-1.5">
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white transition-colors"
                >
                  <span>{section.title}</span>
                  <svg
                    className={`w-3.5 h-3.5 transform transition-transform duration-200 ${openSections[section.title] ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {openSections[section.title] && (
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      section.locked ? (
                        <div
                          key={item.label}
                          className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg text-slate-400 opacity-60 cursor-not-allowed grayscale"
                          title="Menu sedang dalam pengembangan"
                        >
                          <div className="flex items-center gap-3">
                            {item.icon}
                            {item.label}
                          </div>
                          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      ) : (
                        <NavLink
                          key={item.to}
                          to={item.to}
                          end={item.to === '/admin/dashboard'}
                          onClick={() => setSidebarOpen(false)}
                          className={({ isActive }) =>
                            `sidebar-link ${isActive ? 'active' : ''}`
                          }
                        >
                          {item.icon}
                          {item.label}
                        </NavLink>
                      )
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* User info + logout */}
          <div className="px-4 py-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-400">{user?.division || '-'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-200 disabled:opacity-50"
            >
              {loggingOut ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              )}
              Keluar
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Buka menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-bold text-primary text-sm">SIM-BEM</span>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
