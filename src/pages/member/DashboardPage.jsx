import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function MemberDashboardPage({ basePath = '/member' }) {
  const { user } = useAuth();

  const getSections = () => {
    const sections = [];

    // ABSENSI
    const absensiLinks = [];
    if (user?.role === 'admin_psdm') {
      absensiLinks.push(
        {
          to: '/admin/events/new',
          label: 'Buat Acara',
          desc: 'Buat event absensi baru.',
          color: 'from-blue-600 to-blue-400',
          icon: (
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          ),
        },
        {
          to: '/admin/events',
          label: 'Daftar Acara',
          desc: 'Kelola daftar event dan pantau kehadiran.',
          color: 'from-indigo-600 to-indigo-400',
          icon: (
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          ),
        }
      );
    }

    absensiLinks.push(
      {
        to: `${basePath}/attend`,
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
        to: `${basePath}/history`,
        label: 'Riwayat Absensi',
        desc: 'Lihat daftar kehadiranmu di semua event.',
        color: 'from-slate-700 to-slate-500',
        icon: (
          <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        ),
      }
    );

    sections.push({ title: 'Absensi', links: absensiLinks });

    // INVENTARIS
    if (user?.role === 'admin_sekre') {
      sections.push({
        title: 'Inventaris',
        links: [
          {
            to: '/admin/inventory',
            label: 'Kelola Inventaris',
            desc: 'Manajemen data inventaris dan QR.',
            color: 'from-emerald-600 to-emerald-400',
            icon: (
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            )
          }
        ]
      });
    } else if (['member', 'pilar', 'executive'].includes(user?.role)) {
       sections.push({
        title: 'Inventaris',
        links: [
          {
            to: '/member/inventory',
            label: 'Katalog Inventaris',
            desc: 'Lihat daftar barang inventaris.',
            color: 'from-emerald-600 to-emerald-400',
            icon: (
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            )
          }
        ]
      });
    }

    // ADVOKASI (admin_advokes)
    if (user?.role === 'admin_advokes') {
      sections.push({
        title: 'Website',
        locked: true,
        links: [
          {
            to: '/admin/complaints',
            label: 'Kelola Pengaduan',
            desc: 'Tinjau dan tanggapi pengaduan dari mahasiswa.',
            color: 'from-rose-600 to-rose-400',
            icon: (
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            )
          }
        ]
      });
    }

    // KONTEN BLOG (admin_komdigi)
    if (user?.role === 'admin_komdigi') {
      sections.push({
        title: 'Website',
        locked: true,
        links: [
          {
            to: '/admin/blogs',
            label: 'Kelola Blog',
            desc: 'Buat, edit, dan hapus artikel website BEM.',
            color: 'from-teal-600 to-teal-400',
            icon: (
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            )
          }
        ]
      });
    }

    // PROFIL
    sections.push({
      title: 'Profil',
      links: [
        {
          to: `${basePath}/profile`,
          label: 'Profil Saya',
          desc: 'Lihat dan perbarui informasi profil.',
          color: 'from-gray-700 to-gray-500',
          icon: (
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )
        }
      ]
    });

    return sections;
  };

  const sections = getSections();

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
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-medium">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            NPM {user?.npm}
          </span>
        </div>
      </div>

      {/* Quick links */}
      <div className="space-y-8">
        {sections.map((section, idx) => (
          <div key={idx}>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{section.title}</h2>
              {section.locked && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-gray-200 text-gray-500">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  SEGERA HADIR
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {section.links.map((item) => (
                section.locked ? (
                  <div
                    key={item.label}
                    className="flex items-center gap-4 p-5 rounded-2xl border border-gray-100 bg-white opacity-60 grayscale cursor-not-allowed"
                    title="Fitur ini sedang dalam pengembangan"
                  >
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                      {item.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{item.desc}</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-300 ml-auto flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                ) : (
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
                )
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
