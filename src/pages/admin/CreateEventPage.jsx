import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function CreateEventPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name:       '',
    start_time: '',
    end_time:   '',
    is_active:  false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim() || !form.start_time || !form.end_time) {
      setError('Semua field wajib diisi.');
      return;
    }
    if (new Date(form.end_time) <= new Date(form.start_time)) {
      setError('Waktu selesai harus lebih besar dari waktu mulai.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.post('/events', {
        name:       form.name.trim(),
        start_time: new Date(form.start_time).toISOString(),
        end_time:   new Date(form.end_time).toISOString(),
        is_active:  form.is_active,
      });
      const createdEvent = res.data.data;
      navigate(`/admin/events/${createdEvent.id}`, {
        state: { event: createdEvent },
        replace: true,
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal membuat event.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={() => navigate(-1)}
            className="btn-ghost btn-sm p-2 rounded-lg"
            aria-label="Kembali"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="page-title">Buat Event Baru</h1>
        </div>
        <p className="page-subtitle ml-10">Isi detail event absensi yang akan dibuat.</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {/* Error */}
          {error && (
            <div className="alert-error animate-fade-in" role="alert">
              <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Event name */}
          <div className="form-group">
            <label htmlFor="name" className="label">Nama Event <span className="text-red-500">*</span></label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="cth. Rapat Koordinasi BEM FTI"
              value={form.name}
              onChange={handleChange}
              disabled={loading}
              className="input"
            />
          </div>

          {/* Start & End time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label htmlFor="start_time" className="label">Waktu Mulai <span className="text-red-500">*</span></label>
              <input
                id="start_time"
                name="start_time"
                type="datetime-local"
                value={form.start_time}
                onChange={handleChange}
                disabled={loading}
                className="input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="end_time" className="label">Waktu Selesai <span className="text-red-500">*</span></label>
              <input
                id="end_time"
                name="end_time"
                type="datetime-local"
                value={form.end_time}
                onChange={handleChange}
                disabled={loading}
                className="input"
                min={form.start_time}
              />
            </div>
          </div>

          {/* is_active toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200">
            <div>
              <p className="text-sm font-medium text-gray-800">Langsung Aktifkan Sesi</p>
              <p className="text-xs text-gray-500 mt-0.5">Token absensi akan langsung dibuat saat event dibuat.</p>
            </div>
            <button
              id="toggle-is-active"
              type="button"
              role="switch"
              aria-checked={form.is_active}
              onClick={() => setForm({ ...form, is_active: !form.is_active })}
              disabled={loading}
              className={`
                relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent
                transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2
                ${form.is_active ? 'bg-emerald-500' : 'bg-gray-300'}
              `}
            >
              <span
                className={`
                  inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0
                  transition-transform duration-200 ease-in-out
                  ${form.is_active ? 'translate-x-5' : 'translate-x-0'}
                `}
              />
            </button>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={loading}
              className="btn-secondary flex-1"
            >
              Batal
            </button>
            <button
              id="btn-create-event"
              type="submit"
              disabled={loading}
              className="btn-primary flex-1"
            >
              {loading ? 'Menyimpan...' : 'Buat Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
