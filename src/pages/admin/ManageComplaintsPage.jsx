import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

function truncate(str, max = 60) {
  if (!str) return '-';
  return str.length > max ? str.slice(0, max) + '…' : str;
}

// ── Status Config — sesuai database constraint ────────────────────────────────
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
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${cfg.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ── Info Row Helper ───────────────────────────────────────────────────────────
function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-gray-800">{value || '-'}</p>
    </div>
  );
}

// ── Modal: Detail Pengaduan ───────────────────────────────────────────────────
function DetailModal({ complaint, loading = false, onClose, onUpdateStatus }) {
  const [lightbox, setLightbox] = useState(null);
  if (!complaint) return null;

  // evidences adalah array of { url, public_id, file_type }
  const evidences = Array.isArray(complaint.evidences) ? complaint.evidences : [];
  const isAnonymous = complaint.is_anonymous;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-gray-900">Detail Pengaduan</h2>
              {isAnonymous && (
                <span className="badge bg-gray-100 text-gray-500 text-[10px]">Anonim</span>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-0.5">#{complaint.id}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 transition-colors" aria-label="Tutup">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {/* Status + tanggal */}
          <div className="flex items-center justify-between">
            <StatusBadge status={complaint.status} />
            <span className="text-xs text-gray-400">{formatDate(complaint.created_at)}</span>
          </div>

          {/* Judul */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Judul</p>
            <p className="text-base font-semibold text-gray-900">{complaint.title}</p>
          </div>

          {/* Data Pelapor */}
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="Nama Lengkap" value={isAnonymous ? '— Anonim —' : complaint.full_name} />
            <InfoRow label="NPM" value={isAnonymous ? '-' : complaint.npm} />
            <InfoRow label="Program Studi" value={complaint.prodi} />
            <InfoRow label="Kategori" value={complaint.category} />
          </div>

          {/* Isi Pengaduan */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Isi Pengaduan</p>
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap border border-gray-100">
              {complaint.description}
            </div>
          </div>

          {/* Saran */}
          {complaint.suggestion && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Saran / Harapan</p>
              <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-800 leading-relaxed whitespace-pre-wrap border border-blue-100">
                {complaint.suggestion}
              </div>
            </div>
          )}

          {/* Kontak */}
          <div className="grid grid-cols-2 gap-4">
            <InfoRow
              label="Bersedia Dihubungi"
              value={complaint.willing_to_contact ? '✅ Ya' : '❌ Tidak'}
            />
            {complaint.willing_to_contact && (
              <InfoRow label="Nomor WhatsApp" value={complaint.whatsapp_number} />
            )}
          </div>

          {/* Bukti */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Bukti {!loading && `(${evidences.length} file)`}
            </p>
            {loading ? (
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="aspect-square rounded-xl bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : evidences.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {evidences.map((ev, i) => (
                  <button
                    key={ev.file_public_id || ev.id || i}
                    onClick={() => setLightbox(ev.file_url)}
                    className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 hover:border-primary hover:shadow-md transition-all"
                  >
                    {ev.file_type?.startsWith('image') ? (
                      <img src={ev.file_url} alt={`Bukti ${i + 1}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center gap-1 text-gray-400">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        <span className="text-[10px]">File</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Tidak ada bukti yang dilampirkan.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="btn-ghost btn-sm">Tutup</button>
          {complaint.status !== 'done' && (
            <button onClick={() => onUpdateStatus(complaint)} className="btn-primary btn-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Update Status
            </button>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Bukti" className="max-w-full max-h-full rounded-xl shadow-2xl" />
        </div>
      )}
    </div>
  );
}

// ── Modal: Update Status ──────────────────────────────────────────────────────
function UpdateStatusModal({ complaint, onClose, onUpdated }) {
  const [status, setStatus] = useState(complaint?.status || 'pending');
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      await api.patch(`/complaints/${complaint.id}`, { status });
      onUpdated();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memperbarui status.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-fade-in p-6">
        <h3 className="font-bold text-gray-900 mb-1">Update Status Pengaduan</h3>
        <p className="text-sm text-gray-500 mb-5 truncate">"{truncate(complaint?.title, 45)}"</p>

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
            {saving ? <><LoadingSpinner size="sm" color="white" /> Menyimpan…</> : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ManageComplaintsPage() {
  const navigate = useNavigate();

  const [complaints, setComplaints]     = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState('');
  const [search, setSearch]             = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [detailModal, setDetailModal]   = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [statusModal, setStatusModal]   = useState(null);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/complaints');
      const raw = res.data?.data ?? res.data;
      setComplaints(Array.isArray(raw) ? raw : (raw?.complaints ?? []));
    } catch (err) {
      // 404 = belum ada pengaduan, bukan error sejati
      if (err.response?.status === 404) {
        setComplaints([]);
      } else {
        setError(err.response?.data?.message || 'Gagal memuat data pengaduan.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, []);

  // ── Derived ───────────────────────────────────────────────────────────────
  const filtered = complaints.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      (c.full_name || '').toLowerCase().includes(q) ||
      (c.title || '').toLowerCase().includes(q) ||
      (c.description || '').toLowerCase().includes(q) ||
      (c.category || '').toLowerCase().includes(q) ||
      (c.npm || '').toLowerCase().includes(q);
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const countByStatus = (s) => complaints.filter((c) => c.status === s).length;

  // ── Handlers ──────────────────────────────────────────────────────────────
  // Fetch by ID agar evidences selalu lengkap
  const openDetail = async (c) => {
    setDetailLoading(true);
    setDetailModal(c); // tampilkan modal dengan data awal dulu
    try {
      const res = await api.get(`/complaints/${c.id}`);
      const full = res.data?.data ?? res.data;
      setDetailModal(full);
    } catch {
      // jika gagal, tetap tampilkan data dari list
    } finally {
      setDetailLoading(false);
    }
  };
  const closeDetail     = () => setDetailModal(null);
  const openStatusModal = (c) => { setStatusModal(c); setDetailModal(null); };
  const closeStatus     = () => setStatusModal(null);
  const handleUpdated   = () => { closeStatus(); fetchComplaints(); };

  return (
    <div className="animate-fade-in">
      {/* ── Header ── */}
      <div className="page-header flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost btn-sm p-2 mt-0.5 shrink-0" aria-label="Kembali">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="page-title">Kelola Pengaduan</h1>
            <p className="page-subtitle">Tinjau dan tanggapi pengaduan yang masuk dari mahasiswa.</p>
          </div>
        </div>
        <button onClick={fetchComplaints} disabled={loading} className="btn-secondary btn-sm self-start sm:self-auto ml-10 sm:ml-0">
          <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-3xl font-bold text-primary">{complaints.length}</p>
          <p className="text-sm text-gray-500 mt-1">Total</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-yellow-500">{countByStatus('pending')}</p>
          <p className="text-sm text-gray-500 mt-1">Menunggu</p>
        </div>
        <div className="card text-center col-span-2 sm:col-span-1">
          <p className="text-3xl font-bold text-blue-500">{countByStatus('diproses')}</p>
          <p className="text-sm text-gray-500 mt-1">Diproses</p>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="card p-0 overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Semua Pengaduan</h2>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input py-1.5 text-xs w-36"
            >
              <option value="all">Semua Status</option>
              {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                <option key={key} value={key}>{cfg.label}</option>
              ))}
            </select>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari nama, judul, NPM…"
                className="input pl-9 py-1.5 text-xs w-48"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20"><LoadingSpinner size="lg" /></div>
        ) : error ? (
          <div className="p-6"><div className="alert-error">{error}</div></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-gray-400">
            <svg className="w-12 h-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
            <p className="text-sm">
              {search || filterStatus !== 'all' ? 'Tidak ada pengaduan yang cocok.' : 'Belum ada pengaduan masuk.'}
            </p>
          </div>
        ) : (
          <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((c) => (
              <div
                key={c.id}
                className="flex flex-col rounded-xl border border-gray-200 bg-white hover:shadow-md hover:border-gray-300 transition-all duration-200 overflow-hidden"
              >
                {/* Accent bar status */}
                <div className={`h-1 w-full ${
                  c.status === 'done' ? 'bg-emerald-400' :
                  c.status === 'on progress' ? 'bg-blue-400' : 'bg-yellow-400'
                }`} />

                <div className="flex flex-col flex-1 p-4 gap-3">
                  {/* Title + Tanggal */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 flex-1">
                      {c.title}
                    </h3>
                    <span className="text-xs text-gray-400 whitespace-nowrap mt-0.5 flex-shrink-0">
                      {new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: '2-digit' }).format(new Date(c.created_at))}
                    </span>
                  </div>

                  {/* Badges — Kategori + Bukti + Status */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-100">
                      {c.category}
                    </span>
                    {c.evidence_count > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        Bukti {c.evidence_count}
                      </span>
                    )}
                    <StatusBadge status={c.status} />
                  </div>

                  {/* Preview deskripsi */}
                  <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-2 flex-1">
                    {c.description}
                  </p>

                  {/* Info pelapor */}
                  <div className="flex items-center gap-2.5 border-t border-gray-100 pt-2.5">
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      {c.is_anonymous ? (
                        <p className="text-xs text-gray-400 italic">Anonim</p>
                      ) : (
                        <p className="text-xs text-gray-700 font-medium truncate">
                          {c.full_name}
                          {c.npm && <span className="font-normal font-mono ml-1 text-gray-400"> · {c.npm}</span>}
                        </p>
                      )}
                      <p className="text-[11px] text-gray-400 mt-0.5">{c.prodi}</p>
                    </div>
                  </div>

                  {/* Aksi */}
                  <div className="flex items-center gap-2">
                    <button onClick={() => openDetail(c)} className="btn-secondary btn-sm flex-1 justify-center">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Detail
                    </button>
                    {c.status !== 'done' && (
                      <button onClick={() => openStatusModal(c)} className="btn-primary btn-sm flex-1 justify-center">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Update
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {detailModal && (
        <DetailModal
          complaint={detailModal}
          loading={detailLoading}
          onClose={closeDetail}
          onUpdateStatus={openStatusModal}
        />
      )}
      {statusModal && (
        <UpdateStatusModal complaint={statusModal} onClose={closeStatus} onUpdated={handleUpdated} />
      )}
    </div>
  );
}
