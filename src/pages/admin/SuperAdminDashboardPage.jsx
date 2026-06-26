import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function SuperAdminDashboardPage() {
  const { user } = useAuth();

  const sections = [
    {
      title: 'Absensi',
      links: [
        {
          to: '/admin/events',
          label: 'Daftar Acara',
          desc: 'Pantau semua event dan kehadiran.',
          color: 'from-indigo-600 to-indigo-400',
          icon: (
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          ),
        },
        {
          to: '/admin/events/new',
          label: 'Buat Event',
          desc: 'Buat event absensi baru.',
          color: 'from-blue-600 to-blue-400',
          icon: (
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          ),
        },
        {
          to: '/admin/attend',
          label: 'Input Absensi',
          desc: 'Masukkan token untuk mencatat kehadiran.',
          color: 'from-primary-dark to-primary',
          icon: (
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        },
        {
          to: '/admin/history',
          label: 'Riwayat Absensi',
          desc: 'Lihat daftar kehadiranmu di semua event.',
          color: 'from-slate-700 to-slate-500',
          icon: (
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          ),
        },
      ],
    },
    {
      title: 'Inventaris',
      links: [
        {
          to: '/admin/inventory',
          label: 'Manajemen Inventaris',
          desc: 'Kelola data aset, tambah barang, dan scan QR.',
          color: 'from-emerald-600 to-emerald-400',
          icon: (
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          ),
        },
      ],
    },
    {
      title: 'Administrasi',
      links: [
        {
          to: '/admin/users',
          label: 'Kelola Pengguna',
          desc: 'Manajemen akun admin & member.',
          color: 'from-violet-600 to-violet-400',
          icon: (
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          ),
        },
        {
          to: '/admin/analytics',
          label: 'Lihat Analitik',
          desc: 'Overview metrik absensi & inventaris.',
          color: 'from-amber-600 to-amber-400',
          icon: (
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          ),
        },
      ],
    },
    {
      title: 'Profil',
      links: [
        {
          to: '/admin/profile',
          label: 'Profil Saya',
          desc: 'Lihat dan perbarui informasi profil.',
          color: 'from-gray-700 to-gray-500',
          icon: (
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          ),
        },
      ],
    },
  ];

  return (
    <div className="animate-fade-in space-y-6">
      {/* Greeting */}
      <div className="rounded-2xl bg-gradient-to-br from-primary-dark via-primary to-primary-light p-6 sm:p-8 text-white">
        <p className="text-sm text-blue-200 font-medium">Selamat datang,</p>
        <h1 className="text-2xl sm:text-3xl font-bold mt-1">{user?.name} 👋</h1>
        <div className="flex flex-wrap gap-3 mt-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-medium">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {user?.division}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-medium capitalize">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            {user?.role?.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Quick Links */}
      <div className="space-y-8">
        {sections.map((section, idx) => (
          <div key={idx}>
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">{section.title}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {section.links.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="group card-hover flex items-center gap-4 p-5 no-underline"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-105 transition-transform duration-200`}>
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-primary transition-colors">{item.label}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 ml-auto flex-shrink-0 group-hover:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
