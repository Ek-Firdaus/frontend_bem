import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

// DUMMY DATA — ganti dengan fetch API jika backend sudah siap
const attendanceTrendData = [
  { name: 'Rapat', value: 65 },
  { name: 'Tes token', value: 70 },
  { name: 'Upgrading', value: 75 },
  { name: 'Diklat', value: 78 },
  { name: 'Musyawarah', value: 82 },
];

const inventoryCategoryData = [
  { name: 'Elektronik', count: 10 },
  { name: 'Furniture', count: 8 },
  { name: 'ATK', count: 6 },
];

const topAttendance = [
  { name: 'Hasnia', score: '12/12' },
  { name: 'Muhammad Firdaus', score: '11/12' },
  { name: 'John', score: '10/12' },
];

const lowAttendance = [
  { name: 'B', score: '3/12' },
  { name: 'John Doe', score: '5/12' },
  { name: 'Sekre', score: '6/12' },
];

export default function AdminAnalyticsPage() {
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button onClick={() => navigate(-1)} className="btn-ghost btn-sm p-2 mt-0.5 shrink-0" aria-label="Kembali">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="page-header m-0">
          <h1 className="page-title">Dashboard Analitik</h1>
          <p className="page-subtitle">Overview lintas modul absensi &amp; inventaris.</p>
        </div>
      </div>

      {/* SECTION ABSENSI */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-lg font-bold text-gray-800">Absensi</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-5">
            <p className="text-xs font-semibold text-gray-500 mb-1">Total event</p>
            <p className="text-2xl font-bold text-gray-900">12</p>
          </div>
          <div className="card p-5 border-l-4 border-l-emerald-500 bg-emerald-50/30">
            <p className="text-xs font-semibold text-emerald-700 mb-1">Sesi aktif</p>
            <p className="text-2xl font-bold text-emerald-800">2</p>
          </div>
          <div className="card p-5">
            <p className="text-xs font-semibold text-gray-500 mb-1">Sesi selesai</p>
            <p className="text-2xl font-bold text-gray-900">10</p>
          </div>
          <div className="card p-5">
            <p className="text-xs font-semibold text-gray-500 mb-1">Rata-rata hadir</p>
            <p className="text-2xl font-bold text-gray-900">78%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
              <h3 className="font-bold text-sm text-gray-800">Kehadiran tertinggi</h3>
            </div>
            <div className="space-y-3">
              {topAttendance.map((u, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-700">{u.name}</p>
                  <p className="text-sm text-gray-500 font-mono">{u.score}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="font-bold text-sm text-gray-800">Sering absen</h3>
            </div>
            <div className="space-y-3">
              {lowAttendance.map((u, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <p className="text-sm font-medium text-gray-700">{u.name}</p>
                  <p className="text-sm text-gray-500 font-mono">{u.score}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5 lg:col-span-3">
            <h3 className="font-bold text-sm text-gray-800 mb-6">Tren kehadiran 5 event terakhir</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceTrendData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} tickFormatter={(v) => `${v}%`} dx={-10} />
                  <RechartsTooltip contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Line type="monotone" dataKey="value" stroke="#10B981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION INVENTARIS */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h2 className="text-lg font-bold text-gray-800">Inventaris</h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="card p-5">
            <p className="text-xs font-semibold text-gray-500 mb-1">Total aset</p>
            <p className="text-2xl font-bold text-gray-900">24</p>
          </div>
          <div className="card p-5">
            <p className="text-xs font-semibold text-gray-500 mb-1">Tersedia</p>
            <p className="text-2xl font-bold text-gray-900">18</p>
          </div>
          <div className="card p-5">
            <p className="text-xs font-semibold text-gray-500 mb-1">Dipinjam</p>
            <p className="text-2xl font-bold text-gray-900">6</p>
          </div>
          <div className="card p-5 border-l-4 border-l-red-500 bg-red-50/30">
            <p className="text-xs font-semibold text-red-700 mb-1">Rusak/hilang</p>
            <p className="text-2xl font-bold text-red-800">2</p>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="font-bold text-sm text-gray-800 mb-6">Kategori aset</h3>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={inventoryCategoryData} margin={{ top: 0, right: 20, bottom: 0, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#E5E7EB" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#6B7280', fontSize: 12 }} dx={-10} />
                <RechartsTooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '0.5rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
