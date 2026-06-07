import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function AttendancePage() {
  const [form, setForm]       = useState({ event_id: '', token: '' });
  const [events, setEvents]   = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(null); // attendance object from response

  const fetchActiveEvents = async () => {
    try {
      setLoadingEvents(true);
      const res = await api.get('/events');
      // Filter only active events since members can only attend active ones
      const activeEvents = (res.data.data.events || []).filter(e => e.is_active);
      setEvents(activeEvents);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat daftar event aktif.');
    } finally {
      setLoadingEvents(false);
    }
  };

  useEffect(() => {
    fetchActiveEvents();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error)   setError('');
    if (success) setSuccess(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.event_id.trim() || !form.token.trim()) {
      setError('ID Event dan Token wajib diisi.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(null);

    try {
      const res = await api.post('/attendances', {
        event_id: form.event_id.trim(),
        token:    form.token.trim(),
      });
      setSuccess(res.data);
      setForm({ event_id: '', token: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mencatat absensi. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSuccess(null);
    setError('');
    setForm({ event_id: '', token: '' });
    fetchActiveEvents(); // refresh active events list
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            to="/member/dashboard"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 transition-colors duration-200 no-underline flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Kembali
          </Link>
          <h1 className="page-title !mb-0">Presensi</h1>
        </div>
        <p className="page-subtitle">Pilih event dan masukkan token yang diberikan oleh panitia.</p>
      </div>

      <div className="max-w-md">
        {/* Success state */}
        {success ? (
          <div className="card text-center space-y-5 animate-slide-up">
            {/* Checkmark animation */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
                <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Presensi Berhasil!</h2>
              <p className="text-sm text-gray-500 mt-1">{success.message}</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-800">
              Kehadiran kamu sudah tercatat. Terima kasih!
            </div>
            <button
              id="btn-absen-lagi"
              onClick={handleReset}
              className="btn-primary w-full"
            >
             Presensi Acara Lain
            </button>
          </div>
        ) : (
          <div className="card">
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Error */}
              {error && (
                <div className="alert-error animate-fade-in" role="alert">
                  <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Event Select Dropdown */}
              <div className="form-group">
                <label htmlFor="event_id" className="label">Nama Acara</label>
                {loadingEvents ? (
                  <div className="flex items-center gap-2 py-2 px-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-sm">
                    <LoadingSpinner size="sm" />
                    <span>Memuat daftar acara aktif...</span>
                  </div>
                ) : events.length === 0 ? (
                  <div className="flex flex-col gap-1">
                    <select
                      id="event_id"
                      name="event_id"
                      disabled
                      className="input bg-gray-50 text-gray-500 cursor-not-allowed"
                    >
                      <option value="">Tidak ada sesi Presensi aktif</option>
                    </select>
                    <p className="text-xs text-amber-600 mt-1">Hubungi admin PSDM untuk mengaktifkan sesi Presensi.</p>
                  </div>
                ) : (
                  <select
                    id="event_id"
                    name="event_id"
                    value={form.event_id}
                    onChange={handleChange}
                    disabled={loading}
                    className="input bg-white text-gray-900"
                  >
                    <option value="">-- Pilih Acara Aktif --</option>
                    {events.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Token */}
              <div className="form-group">
                <label htmlFor="token" className="label">Token Presensi</label>
                <input
                  id="token"
                  name="token"
                  type="text"
                  placeholder="Masukkan token"
                  value={form.token}
                  onChange={handleChange}
                  disabled={loading || events.length === 0}
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  maxLength={10}
                  className="input font-mono text-lg tracking-[0.2em] text-center uppercase"
                />
              </div>

              {/* Submit */}
              <button
                id="btn-submit-absen"
                type="submit"
                disabled={loading || !form.event_id.trim() || !form.token.trim() || events.length === 0}
                className="btn-primary w-full btn-lg"
              >
                {loading ? (
                  <><LoadingSpinner size="sm" color="white" /> Memproses...</>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Kirim Presensi
                  </>
                )}
              </button>
            </form>

            {/* Info hint */}
            <div className="alert-info mt-5">
              <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>Daftar di atas hanya menampilkan acara yang sedang aktif. Hubungi panitia jika acara yang Anda cari tidak ada.</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

