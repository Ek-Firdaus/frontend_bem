import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useLocation, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import StatusBadge from '../../components/ui/StatusBadge';
import TokenDisplay from '../../components/ui/TokenDisplay';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(dateStr));
}

function formatDateShort(dateStr) {
  if (!dateStr) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).format(new Date(dateStr));
}

/** Countdown timer hook based on end_time */
function useCountdown(endTime, isActive) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!isActive || !endTime) { setTimeLeft(''); return; }

    const calc = () => {
      const diff = new Date(endTime) - new Date();
      if (diff <= 0) { setTimeLeft('Sesi berakhir'); return; }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setTimeLeft(
        [h > 0 ? `${h}j` : null, `${String(m).padStart(2, '0')}m`, `${String(s).padStart(2, '0')}d`]
          .filter(Boolean).join(' ')
      );
    };

    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [endTime, isActive]);

  return timeLeft;
}

export default function EventDetailPage() {
  const { id }       = useParams();
  const location     = useLocation();
  const navigate     = useNavigate();

  const [event, setEvent]             = useState(location.state?.event || null);
  const [attendances, setAttendances] = useState([]);
  const [loadingEvent, setLoadingEvent]           = useState(!location.state?.event);
  const [loadingAttendances, setLoadingAttendances] = useState(true);
  const [toggling, setToggling]       = useState(false);
  const [eventError, setEventError]   = useState('');
  const [toggleError, setToggleError] = useState('');
  const [toggleSuccess, setToggleSuccess] = useState('');

  const timeLeft = useCountdown(event?.end_time, event?.is_active);
  const successTimerRef = useRef(null);

  // Fetch event detail (fallback if no state)
  useEffect(() => {
    if (location.state?.event) return;
    (async () => {
      try {
        const res = await api.get(`/events/${id}`);
        setEvent(res.data.data);
      } catch {
        setEventError('Event tidak ditemukan.');
      } finally {
        setLoadingEvent(false);
      }
    })();
  }, [id, location.state?.event]);

  // Fetch attendances for this event
  const fetchAttendances = useCallback(async () => {
    try {
      setLoadingAttendances(true);
      const res = await api.get(`/attendances/${id}`);
      setAttendances(res.data.data.attendances || []);
    } catch {
      // ignore — attendances might be empty
      setAttendances([]);
    } finally {
      setLoadingAttendances(false);
    }
  }, [id]);

  useEffect(() => { fetchAttendances(); }, [fetchAttendances]);

  // Toggle is_active
  const handleToggle = async () => {
    if (!event) return;
    setToggling(true);
    setToggleError('');
    setToggleSuccess('');

    try {
      const newActive = !event.is_active;
      const res = await api.put(`/events/${event.id}`, { is_active: newActive });
      const updated = res.data.data;
      setEvent(updated);

      const msg = newActive ? 'Sesi absensi dibuka. Token baru telah dibuat.' : 'Sesi absensi ditutup.';
      setToggleSuccess(msg);

      // Refresh attendances after toggle
      fetchAttendances();

      // Auto-clear success message
      clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => setToggleSuccess(''), 5000);
    } catch (err) {
      setToggleError(err.response?.data?.message || 'Gagal mengubah status sesi.');
    } finally {
      setToggling(false);
    }
  };

  if (loadingEvent) {
    return (
      <div className="flex justify-center items-center py-24">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  if (eventError || !event) {
    return (
      <div className="max-w-lg mx-auto pt-12 text-center">
        <p className="text-gray-500 mb-4">{eventError || 'Event tidak ditemukan.'}</p>
        <Link to="/admin/dashboard" className="btn-secondary btn-sm">← Kembali ke Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6 max-w-4xl">
      {/* Page header */}
      <div className="flex items-start gap-3">
        <button onClick={() => navigate('/admin/dashboard')} className="btn-ghost btn-sm p-2 mt-0.5">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h1 className="page-title truncate">{event.name}</h1>
            <StatusBadge isActive={event.is_active} />
          </div>
          <p className="page-subtitle">
            {formatDate(event.start_time)} — {formatDate(event.end_time)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left — Token + Toggle */}
        <div className="lg:col-span-2 space-y-4">
          {/* Token card */}
          <div className="card">
            <TokenDisplay token={event.token} isActive={event.is_active} />

            {/* Countdown */}
            {event.is_active && timeLeft && (
              <div className="flex items-center justify-center gap-2 mt-2 mb-4">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-semibold text-emerald-700 font-mono">{timeLeft}</span>
                </div>
              </div>
            )}

            {/* Toggle button */}
            <div className="border-t border-gray-100 pt-4">
              {toggleError  && <p className="text-xs text-red-600 text-center mb-3">{toggleError}</p>}
              {toggleSuccess && <p className="text-xs text-emerald-700 text-center mb-3">{toggleSuccess}</p>}

              <button
                id="btn-toggle-session"
                onClick={handleToggle}
                disabled={toggling}
                className={`w-full btn btn-lg ${event.is_active ? 'btn-danger' : 'btn-success'}`}
              >
                {toggling ? (
                  <><LoadingSpinner size="sm" color="white" /> Memproses...</>
                ) : event.is_active ? (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 10h6m-3-3v6" />
                    </svg>
                    Tutup Sesi
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Buka Sesi
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Event info */}
          <div className="card space-y-3 text-sm">
            <h3 className="font-semibold text-gray-700 text-xs uppercase tracking-wide">Info Event</h3>
            {/* <div>
              <p className="text-xs text-gray-400">ID Event</p>
              <p className="font-mono text-xs text-gray-700 break-all mt-0.5">{event.id}</p>
            </div> */}
            <div>
              <p className="text-xs text-gray-400">Waktu Mulai</p>
              <p className="text-gray-800 mt-0.5">{formatDate(event.start_time)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Waktu Selesai</p>
              <p className="text-gray-800 mt-0.5">{formatDate(event.end_time)}</p>
            </div>
          </div>
        </div>

        {/* Right — Attendance log */}
        <div className="lg:col-span-3">
          <div className="card p-0 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-sm font-semibold text-gray-700">Log Absensi</h2>
                <p className="text-xs text-gray-400 mt-0.5">{attendances.length} peserta hadir</p>
              </div>
              <button
                onClick={fetchAttendances}
                disabled={loadingAttendances}
                className="btn-ghost btn-sm"
                title="Refresh"
              >
                <svg className={`w-4 h-4 ${loadingAttendances ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>

            {loadingAttendances ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner />
              </div>
            ) : attendances.length === 0 ? (
              <div className="flex flex-col items-center py-12 text-gray-400">
                <svg className="w-10 h-10 mb-2 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-sm">Belum ada peserta yang absen.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nama</th>
                      <th className="hidden sm:table-cell">NPM</th>
                      <th>Jam Presensi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendances.map((a, i) => (
                      <tr key={a.id}>
                        <td className="text-gray-400 text-xs">{i + 1}</td>
                        <td className="font-medium text-gray-900">{a.user_name}</td>
                        <td className="hidden sm:table-cell text-gray-500 font-mono text-xs">{a.npm}</td>
                        <td className="text-gray-600 text-xs">{formatDateShort(a.clock_in)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
