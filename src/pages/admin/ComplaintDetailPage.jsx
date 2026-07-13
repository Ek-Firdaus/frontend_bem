import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.toLocaleString('id-ID', { month: 'short' });
  const year = date.getFullYear();
  const time = date.toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
  return `${day} ${month} ${year}, ${time}`;
}

function getCategoryColor(category) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('fasilitas')) return 'bg-orange-50 text-orange-700 border-orange-200';
  if (cat.includes('akademik')) return 'bg-indigo-50 text-indigo-700 border-indigo-200';
  if (cat.includes('layanan')) return 'bg-cyan-50 text-cyan-700 border-cyan-200';
  if (cat.includes('kegiatan')) return 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200';
  if (cat.includes('lainnya')) return 'bg-rose-50 text-rose-700 border-rose-200';
  
  // Hash string to pick a color dynamically for unknown categories
  const colors = [
    'bg-pink-50 text-pink-700 border-pink-200',
    'bg-violet-50 text-violet-700 border-violet-200',
    'bg-sky-50 text-sky-700 border-sky-200',
    'bg-lime-50 text-lime-700 border-lime-200'
  ];
  const index = cat.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[index % colors.length];
}

// ── Status Config ─────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    badge: 'bg-yellow-100 text-yellow-800',
    dot: 'bg-yellow-500',
  },
  'on progress': {
    label: 'Diproses',
    badge: 'bg-blue-100 text-blue-800',
    dot: 'bg-blue-500',
  },
  done: {
    label: 'Selesai',
    badge: 'bg-emerald-100 text-emerald-800',
    dot: 'bg-emerald-500',
  },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, badge: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide ${cfg.badge}`}>
      {cfg.label}
    </span>
  );
}

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lightbox, setLightbox] = useState(null);

  // Status Update State
  const [updateStatus, setUpdateStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  useEffect(() => {
    if (complaint) {
      setUpdateStatus(complaint.status);
    }
  }, [complaint]);

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

  const handleUpdateStatus = async () => {
    if (updateStatus === complaint.status) return;
    setSaving(true);
    try {
      await api.patch(`/complaints/${complaint.id}`, { status: updateStatus });
      setComplaint((prev) => ({ ...prev, status: updateStatus }));
      // Optional: Update timestamp if you want to reflect it immediately
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memperbarui status.');
    } finally {
      setSaving(false);
    }
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
    <div className="max-w-3xl mx-auto animate-fade-in pb-12">
      
      {/* Back Button */}
      <button onClick={() => navigate('/admin/complaints')} className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Kembali
      </button>

      {/* Header: ID & Status */}
      <div className="flex justify-between items-end mb-6 px-2">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">ID Pengaduan</p>
          <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            #{complaint.id}
          </h1>
        </div>
        <StatusBadge status={complaint.status} />
      </div>

      <div className="space-y-4">
        
        {/* 1. Identitas Pengadu */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Identitas Pengadu</h2>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0 text-gray-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            {isAnonymous ? (
              <div>
                <p className="font-bold text-gray-900 text-lg">Anonim</p>
                <p className="text-sm text-gray-500 font-medium">{complaint.prodi || '-'}</p>
                <p className="text-xs text-gray-400 mt-2 italic">
                  * Nama dan NPM disembunyikan karena pengadu memilih opsi anonim.
                </p>
              </div>
            ) : (
              <div>
                <p className="font-bold text-gray-900 text-lg">{complaint.full_name}</p>
                <p className="text-sm text-gray-500 font-medium mt-0.5">
                  {complaint.npm || '-'} — {complaint.prodi || '-'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 2. Detail Aspirasi */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex justify-between items-start mb-4 gap-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest shrink-0">Detail Aspirasi</h2>
            <span className={`px-3 py-1 text-xs font-bold rounded-lg shrink-0 border ${getCategoryColor(complaint.category)}`}>
              {complaint.category || 'Lainnya'}
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-3">{complaint.title}</h3>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed mb-5">
            {complaint.description}
          </p>
          
          {complaint.suggestion && (
            <>
              <hr className="border-gray-100 my-4" />
              <p className="text-xs font-semibold text-gray-500 mb-2">Saran penyelesaian</p>
              <p className="text-sm text-gray-800 font-medium whitespace-pre-wrap leading-relaxed">
                {complaint.suggestion}
              </p>
            </>
          )}
        </div>

        {/* 3. Bukti Pendukung */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Bukti Pendukung</h2>
          {evidences.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {evidences.map((ev, i) => (
                <button
                  key={ev.file_public_id || ev.id || i}
                  onClick={() => ev.file_type?.startsWith('image') && setLightbox(ev.file_url)}
                  className={`group relative aspect-square rounded-2xl overflow-hidden border border-gray-200 transition-all duration-300 ${ev.file_type?.startsWith('image') ? 'cursor-pointer hover:border-primary hover:shadow-lg hover:-translate-y-1' : 'cursor-default'}`}
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
                    <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center gap-2 text-gray-400">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <span className="text-[10px] font-medium max-w-[80%] truncate text-center">
                        {ev.file_url.split('/').pop() || 'Dokumen'}
                      </span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Tidak ada bukti pendukung yang dilampirkan.</p>
          )}
        </div>

        {/* 4. Kontak */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Kontak</h2>
          {complaint.willing_to_contact ? (
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-green-50 border border-green-200 flex items-center justify-center shrink-0 text-green-500 shadow-sm">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </div>
              <div className="pt-0.5">
                <p className="font-bold text-gray-900 text-md mb-0.5">Bersedia dihubungi</p>
                <a 
                  href={`https://wa.me/${complaint.whatsapp_number.replace(/\D/g, '').replace(/^0/, '62')}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm font-semibold text-gray-500 hover:text-green-600 transition-colors hover:underline"
                  title="Hubungi via WhatsApp"
                >
                  {complaint.whatsapp_number}
                </a>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Pelapor tidak bersedia dihubungi via kontak pribadi.</p>
          )}
        </div>

        {/* 5. Tindak Lanjut */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">Tindak Lanjut</h2>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <select
              value={updateStatus}
              onChange={(e) => setUpdateStatus(e.target.value)}
              className="flex-1 w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-semibold"
            >
              <option value="pending">Pending (Menunggu)</option>
              <option value="on progress">Diproses</option>
              <option value="done">Selesai</option>
            </select>
            <button
              onClick={handleUpdateStatus}
              disabled={saving || updateStatus === complaint.status}
              className="btn-primary rounded-xl py-3 px-6 whitespace-nowrap w-full sm:w-auto font-bold shadow-md shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <LoadingSpinner size="sm" color="white" /> : 'Simpan status'}
            </button>
          </div>
          <p className="text-[11px] text-gray-400 mt-4">
            Dikirim {formatDate(complaint.created_at)}
            {complaint.updated_at && complaint.updated_at !== complaint.created_at && (
              <span className="inline-block ml-1">
                • Diperbarui {formatDate(complaint.updated_at)}
              </span>
            )}
          </p>
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
    </div>
  );
}
