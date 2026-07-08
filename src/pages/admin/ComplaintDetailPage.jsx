import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(dateStr));
}

// ── Status Config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending: {
    label: 'Menunggu',
    badge: 'bg-yellow-100 text-yellow-700',
    dot: 'bg-yellow-400',
  },
  'on progress': {
    label: 'Diproses',
    badge: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-400',
  },
  done: {
    label: 'Selesai',
    badge: 'bg-emerald-100 text-emerald-700',
    dot: 'bg-emerald-400',
  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, badge: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value || '-'}</p>
    </div>
  );
}

// ── Modal: Update Status ──────────────────────────────────────────────────────
function UpdateStatusModal({ complaint, onClose, onUpdated }) {
  const [status, setStatus] = useState(complaint?.status || 'pending');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      await api.patch(`/complaints/${complaint.id}`, { status });
      onUpdated(status);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memperbarui status.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-fade-in p-6">
        <h3 className="font-bold text-gray-900 mb-1">Update Status Pengaduan</h3>
        <p className="text-sm text-gray-500 mb-5 truncate">{complaint?.title}</p>

        {error && <div className="alert-error text-sm mb-4">{error}</div>}

        <div className="space-y-2 mb-6">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <label
              key={key}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                status === key ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <input type="radio" name="status" value={key} checked={status === key}
                onChange={() => setStatus(key)} className="sr-only" />
              <span className={`w-3 h-3 rounded-full flex-shrink-0 ${cfg.dot}`} />
              <span className={`text-sm font-semibold ${status === key ? 'text-primary' : 'text-gray-700'}`}>
                {cfg.label}
              </span>
            </label>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="btn-ghost btn-sm flex-1" disabled={saving}>Batal</button>
          <button
            onClick={handleSubmit}
            disabled={saving || status === complaint?.status}
            className="btn-primary btn-sm flex-1"
          >
            {saving ? <LoadingSpinner size="sm" color="white" /> : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightbox, setLightbox] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/complaints/${id}`);
      setComplaint(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat detail pengaduan');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdated = (newStatus) => {
    setComplaint((prev) => ({ ...prev, status: newStatus }));
    setIsUpdateModalOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" color="primary" />
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-red-100 text-center">
        <p className="text-red-500 mb-4">{error || 'Pengaduan tidak ditemukan'}</p>
        <button onClick={() => navigate('/admin/complaints')} className="btn-secondary">
          Kembali ke Daftar
        </button>
      </div>
    );
  }

  const evidences = Array.isArray(complaint.evidences) ? complaint.evidences : [];
  const isAnonymous = complaint.is_anonymous;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-10">
      {/* Top Bar: Back & Title */}
      <div className="page-header flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <button onClick={() => navigate('/admin/complaints')} className="btn-ghost btn-sm p-2 mt-0.5 shrink-0" aria-label="Kembali">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="page-title">Detail Pengaduan</h1>
            <p className="page-subtitle">Lihat dan tanggapi pengaduan #{complaint.id}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Header Content */}
        <div className="px-6 sm:px-8 py-6 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <StatusBadge status={complaint.status} />
              {isAnonymous && (
                <span className="px-2.5 py-1 bg-gray-200 text-gray-600 rounded-lg text-[10px] font-bold tracking-wide">
                  ANONIM
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
              {complaint.title}
            </h2>
            <p className="text-sm text-gray-500 mt-2 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Dilaporkan pada: {formatDate(complaint.created_at)}
            </p>
          </div>

          <div className="shrink-0">
            {complaint.status !== 'done' && (
              <button
                onClick={() => setIsUpdateModalOpen(true)}
                className="w-full sm:w-auto btn-primary shadow-md"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Tanggapi & Update
              </button>
            )}
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* Reporter Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-5 bg-gray-50 rounded-2xl border border-gray-100">
            <InfoRow label="Pelapor" value={isAnonymous ? '— Anonim —' : complaint.full_name} />
            <InfoRow label="NPM" value={isAnonymous ? '-' : complaint.npm} />
            <InfoRow label="Prodi" value={complaint.prodi} />
            <InfoRow label="Kategori" value={complaint.category} />
          </div>

          {/* Description */}
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              Isi Pengaduan
            </h3>
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {complaint.description}
            </div>
          </div>

          {/* Suggestion */}
          {complaint.suggestion && (
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Harapan / Saran
              </h3>
              <div className="p-5 bg-blue-50/50 text-blue-900 rounded-2xl border border-blue-100 whitespace-pre-wrap leading-relaxed">
                {complaint.suggestion}
              </div>
            </div>
          )}

          {/* Contact Details */}
          {complaint.willing_to_contact && (
            <div>
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Kontak Pelapor
              </h3>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-green-50 text-green-700 font-semibold rounded-lg border border-green-200">
                  {complaint.whatsapp_number}
                </div>
                <a
                  href={`https://wa.me/${complaint.whatsapp_number.replace(/\D/g, '').replace(/^0/, '62')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-success btn-sm"
                >
                  Hubungi via WhatsApp
                </a>
              </div>
            </div>
          )}

          {/* Evidences */}
          <div>
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
              </svg>
              Bukti Lampiran ({evidences.length})
            </h3>
            
            {evidences.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {evidences.map((ev, i) => (
                  <button
                    key={ev.file_public_id || ev.id || i}
                    onClick={() => setLightbox(ev.file_url)}
                    className="group relative aspect-square rounded-2xl overflow-hidden border border-gray-200 hover:border-primary hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    {ev.file_type?.startsWith('image') ? (
                      <>
                        <img src={ev.file_url} alt={`Bukti ${i + 1}`} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-2 text-gray-400 group-hover:text-primary group-hover:bg-primary/5 transition-colors">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span className="text-xs font-medium">File Lampiran</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                <p className="text-gray-400">Tidak ada file bukti yang dilampirkan.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox for images */}
      {lightbox && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in" onClick={() => setLightbox(null)}>
          <button className="absolute top-6 right-6 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img src={lightbox} alt="Bukti (Diperbesar)" className="max-w-full max-h-[90vh] rounded-xl shadow-2xl object-contain" />
        </div>
      )}

      {/* Update Modal */}
      {isUpdateModalOpen && (
        <UpdateStatusModal
          complaint={complaint}
          onClose={() => setIsUpdateModalOpen(false)}
          onUpdated={handleStatusUpdated}
        />
      )}
    </div>
  );
}
