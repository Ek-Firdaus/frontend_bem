import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../hooks/useAuth';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(dateStr));
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const [exporting, setExporting] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/events');
      setEvents(res.data.data.events || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data event.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportAll = async () => {
    try {
      setExporting(true);
      setError('');
      const response = await api.get('/attendances/export', {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Laporan_Absensi_Semua_Event.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Gagal mengekspor laporan. Silakan coba lagi.');
      console.error(err);
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const activeCount   = events.filter((e) => e.is_active).length;
  const inactiveCount = events.length - activeCount;

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">
            Halo, <span className="font-semibold text-primary">{user?.name}</span> — kelola event absensi BEM FTI.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5 self-start sm:self-auto">
          <button
            onClick={handleExportAll}
            disabled={exporting}
            className="btn-secondary btn-sm"
          >
            {exporting ? (
              <>
                <LoadingSpinner size="sm" />
                Mengekspor...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export Excel Semua
              </>
            )}
          </button>
          {user?.role === 'super_admin' && (
            <Link to="/admin/users" className="btn-secondary btn-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              Kelola User
            </Link>
          )}
          <Link to="/admin/events/new" className="btn-primary btn-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Buat Event
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-3xl font-bold text-primary">{events.length}</p>
          <p className="text-sm text-gray-500 mt-1">Total Event</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-emerald-600">{activeCount}</p>
          <p className="text-sm text-gray-500 mt-1">Sesi Aktif</p>
        </div>
        <div className="card text-center col-span-2 sm:col-span-1">
          <p className="text-3xl font-bold text-gray-400">{inactiveCount}</p>
          <p className="text-sm text-gray-500 mt-1">Sesi Selesai</p>
        </div>
      </div>

      {/* Events Table */}
      <div className="card p-0 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Semua Event</h2>
          <button
            onClick={fetchEvents}
            disabled={loading}
            className="btn-ghost btn-sm"
            title="Refresh"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-16">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="alert-error">{error}</div>
          </div>
        ) : events.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <svg className="w-12 h-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Belum ada event. <Link to="/admin/events/new" className="text-primary hover:underline font-medium">Buat event pertama</Link>.</p>
          </div>
        ) : (
          <div className="table-wrapper rounded-none border-0">
            <table className="table">
              <thead>
                <tr>
                  <th>Nama Event</th>
                  <th className="hidden sm:table-cell">Mulai</th>
                  <th className="hidden md:table-cell">Selesai</th>
                  <th>Status</th>
                  <th className="text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => (
                  <tr key={event.id}>
                    <td>
                      <div className="font-medium text-gray-900">{event.name}</div>
                      <div className="text-xs text-gray-400 sm:hidden mt-0.5">{formatDate(event.start_time)}</div>
                    </td>
                    <td className="hidden sm:table-cell text-gray-600">{formatDate(event.start_time)}</td>
                    <td className="hidden md:table-cell text-gray-600">{formatDate(event.end_time)}</td>
                    <td><StatusBadge isActive={event.is_active} /></td>
                    <td className="text-right">
                      <Link
                        to={`/admin/events/${event.id}`}
                        state={{ event }}
                        className="btn-secondary btn-sm"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
