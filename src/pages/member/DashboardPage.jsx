import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function MemberDashboardPage() {
  const { user } = useAuth();

  const quickLinks = [
    {
      to: '/member/attend',
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
      to: '/member/history',
      label: 'Riwayat Absensi',
      desc: 'Lihat daftar kehadiranmu di semua event.',
      color: 'from-slate-700 to-slate-500',
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {user?.role?.replace('_', ' ')}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-medium">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            NPM {user?.npm}
          </span>
        </div>
      </div>

      {/* Quick links */}
      <div>
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Menu Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quickLinks.map((item) => (
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
    </div>
  );
}
