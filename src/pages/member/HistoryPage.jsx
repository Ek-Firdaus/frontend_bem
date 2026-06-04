import { useState, useEffect } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    weekday: 'short',
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(dateStr));
}

export default function HistoryPage() {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/my-attendances');
        // Sort newest first
        const sorted = (res.data.data.attendances || []).sort(
          (a, b) => new Date(b.clock_in) - new Date(a.clock_in)
        );
        setAttendances(sorted);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat riwayat absensi.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Riwayat Absensi</h1>
        <p className="page-subtitle">Daftar kehadiranmu di semua event BEM FTI.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="alert-error max-w-lg">{error}</div>
      ) : attendances.length === 0 ? (
        <div className="card flex flex-col items-center py-14 text-center text-gray-400 max-w-md">
          <svg className="w-14 h-14 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="font-medium text-gray-600">Belum ada riwayat absensi</p>
          <p className="text-sm mt-1">Absensi kamu akan muncul di sini setelah kamu mengikuti event.</p>
        </div>
      ) : (
        <>
          {/* Summary badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {attendances.length} event dihadiri
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nama Event</th>
                  <th>Waktu Hadir</th>
                </tr>
              </thead>
              <tbody>
                {attendances.map((a, i) => (
                  <tr key={a.id}>
                    <td className="text-gray-400 text-xs">{i + 1}</td>
                    <td className="font-medium text-gray-900">{a.event_name}</td>
                    <td className="text-gray-600 text-sm">{formatDate(a.clock_in)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="sm:hidden space-y-3">
            {attendances.map((a, i) => (
              <div key={a.id} className="card-hover p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{a.event_name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{formatDate(a.clock_in)}</p>
                  </div>
                  <span className="text-xs text-gray-300">#{i + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
