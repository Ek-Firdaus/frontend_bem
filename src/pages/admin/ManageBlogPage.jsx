import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import api from '../../api/axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

// ── Helpers ────────────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit', month: 'short', year: 'numeric',
  }).format(new Date(dateStr));
}

function truncate(str, max = 80) {
  if (!str) return '-';
  return str.length > max ? str.slice(0, max) + '…' : str;
}

// ── Empty Form State ────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  title: '',
  content: '',
  status: 'published',
  image: null,
};

// ── Quill toolbar config ────────────────────────────────────────────────────────
const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['blockquote', 'code-block'],
    ['link'],
    ['clean'],
  ],
};

const QUILL_FORMATS = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'blockquote', 'code-block', 'link',
];

// ── Modal: Create / Edit ────────────────────────────────────────────────────────
function BlogFormModal({ mode, initialData, onClose, onSaved }) {
  const [form, setForm]         = useState(EMPTY_FORM);
  const [preview, setPreview]   = useState(null);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const fileRef                 = useRef(null);

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setForm({
        title:   initialData.title   || '',
        content: initialData.content || '',
        status:  initialData.status  || 'published',
        image:   null,
      });
      setPreview(initialData.cover_image || null);
    } else {
      setForm(EMPTY_FORM);
      setPreview(null);
    }
  }, [mode, initialData]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm((f) => ({ ...f, image: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim())   return setError('Judul tidak boleh kosong.');
    if (!form.content.trim()) return setError('Konten tidak boleh kosong.');

    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('title',   form.title.trim());
      fd.append('content', form.content.trim());
      fd.append('status',  form.status);
      if (form.image) fd.append('image', form.image);

      if (mode === 'edit') {
        await api.put(`/blogs/${initialData.id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/blogs', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan artikel.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">
            {mode === 'edit' ? 'Edit Artikel' : 'Tambah Artikel Baru'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Tutup"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {error && <div className="alert-error text-sm">{error}</div>}

          {/* Image upload */}
          <div>
            <label className="label">Gambar Cover</label>
            <div
              onClick={() => fileRef.current?.click()}
              className="relative cursor-pointer rounded-xl border-2 border-dashed border-gray-300 hover:border-primary transition-colors overflow-hidden"
              style={{ minHeight: '140px' }}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-40 object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-36 gap-2 text-gray-400">
                  <svg className="w-10 h-10 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">Klik untuk upload gambar</p>
                  <p className="text-xs">JPG, PNG, WebP — maks. 5 MB</p>
                </div>
              )}
              {preview && (
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white text-sm font-medium">Ganti Gambar</span>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
          </div>

          {/* Title */}
          <div className="form-group">
            <label className="label" htmlFor="blog-title">Judul Artikel <span className="text-red-500">*</span></label>
            <input
              id="blog-title"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="input"
              placeholder="Contoh: Tips Sukses Ospek 2025"
              maxLength={200}
              required
            />
          </div>

          {/* Status */}
          <div className="form-group">
            <label className="label" htmlFor="blog-status">Status Publikasi</label>
            <select
              id="blog-status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className="input"
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          {/* Content */}
          <div className="form-group">
            <label className="label">Konten <span className="text-red-500">*</span></label>
            <div className="rounded-xl border border-gray-200 overflow-hidden" style={{ minHeight: '280px' }}>
              <ReactQuill
                theme="snow"
                value={form.content}
                onChange={(value) => setForm((f) => ({ ...f, content: value }))}
                modules={QUILL_MODULES}
                formats={QUILL_FORMATS}
                placeholder="Tulis isi artikel di sini…"
                style={{ height: '240px' }}
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button type="button" onClick={onClose} className="btn-ghost btn-sm">
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="btn-primary btn-sm"
          >
            {saving ? (
              <>
                <LoadingSpinner size="sm" color="white" />
                Menyimpan…
              </>
            ) : (
              mode === 'edit' ? 'Simpan Perubahan' : 'Terbitkan Artikel'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Modal: Delete Confirm ───────────────────────────────────────────────────────
function DeleteConfirmModal({ blog, onClose, onDeleted }) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError]       = useState('');

  const handleDelete = async () => {
    setDeleting(true);
    setError('');
    try {
      await api.delete(`/blogs/${blog.id}`);
      onDeleted();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menghapus artikel.');
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-fade-in p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Hapus Artikel?</h3>
            <p className="text-sm text-gray-500 mt-0.5">Tindakan ini tidak dapat dibatalkan.</p>
          </div>
        </div>

        <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-4 py-3 border border-gray-200 mb-4">
          "<span className="font-semibold">{blog?.title}</span>"
        </p>

        {error && <div className="alert-error text-sm mb-4">{error}</div>}

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="btn-ghost btn-sm" disabled={deleting}>Batal</button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn-danger btn-sm"
          >
            {deleting ? (
              <>
                <LoadingSpinner size="sm" color="white" />
                Menghapus…
              </>
            ) : 'Ya, Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────────
export default function ManageBlogPage() {
  const navigate = useNavigate();

  const [blogs, setBlogs]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [search, setSearch]     = useState('');

  // Modal state
  const [modal, setModal]       = useState(null); // null | 'create' | 'edit' | 'delete'
  const [selected, setSelected] = useState(null); // blog being edited/deleted
  const [openMenuId, setOpenMenuId] = useState(null); // track open kebab menu

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/blogs');
      // Support both res.data (array) and res.data.data (wrapped)
      const raw = res.data?.data ?? res.data;
      setBlogs(Array.isArray(raw) ? raw : (raw?.blogs ?? []));
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data blog.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBlogs(); }, []);

  // ── Derived ────────────────────────────────────────────────────────────────
  const filtered = blogs.filter((b) =>
    b.title?.toLowerCase().includes(search.toLowerCase()) ||
    b.status?.toLowerCase().includes(search.toLowerCase())
  );

  // ── Handlers ───────────────────────────────────────────────────────────────
  const openCreate = () => { setSelected(null); setModal('create'); };
  const openEdit   = (b) => { setSelected(b);   setModal('edit');   };
  const openDelete = (b) => { setSelected(b);   setModal('delete'); };
  const closeModal = () => { setModal(null); setSelected(null); };

  const handleSaved = () => { closeModal(); fetchBlogs(); };
  const handleDeleted = () => { closeModal(); fetchBlogs(); };

  return (
    <div className="animate-fade-in">
      {/* ── Header ── */}
      <div className="page-header flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate(-1)}
            className="btn-ghost btn-sm p-2 mt-0.5 shrink-0"
            aria-label="Kembali"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="page-title">Kelola Blog</h1>
            <p className="page-subtitle">Artikel yang diterbitkan akan tampil di website BEM FTI.</p>
          </div>
        </div>
        <button onClick={openCreate} className="btn-primary btn-sm self-start sm:self-auto ml-10 sm:ml-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Tulis Artikel
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-3xl font-bold text-primary">{blogs.length}</p>
          <p className="text-sm text-gray-500 mt-1">Total Artikel</p>
        </div>
        <div className="card text-center">
          <p className="text-3xl font-bold text-teal-600">
            {blogs.filter((b) => b.status === 'published').length}
          </p>
          <p className="text-sm text-gray-500 mt-1">Published</p>
        </div>
        <div className="card text-center col-span-2 sm:col-span-1">
          <p className="text-3xl font-bold text-gray-400">
            {blogs.filter((b) => b.status === 'draft').length}
          </p>
          <p className="text-sm text-gray-500 mt-1">Draft</p>
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="card p-0 overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700">Semua Artikel</h2>
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari judul atau kategori…"
                className="input pl-9 py-1.5 text-xs w-52"
              />
            </div>
            {/* Refresh */}
            <button
              onClick={fetchBlogs}
              disabled={loading}
              className="btn-ghost btn-sm p-2"
              title="Refresh"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner size="lg" />
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="alert-error">{error}</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-gray-400">
            <svg className="w-12 h-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
            <p className="text-sm">
              {search
                ? 'Tidak ada artikel yang cocok.'
                : <>Belum ada artikel. <button onClick={openCreate} className="text-primary hover:underline font-medium">Tulis sekarang</button>.</>}
            </p>
          </div>
        ) : (
          <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((blog) => (
              <div
                key={blog.id}
                className="group flex flex-col rounded-2xl border border-gray-200 bg-white shadow-md hover:shadow-xl hover:shadow-gray-300/50 hover:-translate-y-1 transition-all duration-300 relative"
              >
                {/* Cover Image */}
                <div className="relative h-44 bg-gray-50 overflow-hidden rounded-t-2xl border-b border-gray-200">
                  {blog.cover_image ? (
                    <img
                      src={blog.cover_image}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
                      </svg>
                    </div>
                  )}

                  {/* Gradient Overlay for badges readability */}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent" />

                  {/* Date Badge (Floating top right) */}
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-2.5 py-1.5 rounded-xl shadow-sm text-center min-w-[3.25rem]">
                    <p className="text-lg font-bold text-gray-900 leading-none">
                      {new Date(blog.created_at).getDate()}
                    </p>
                    <p className="text-[10px] font-bold text-primary uppercase mt-1 tracking-wider">
                      {new Intl.DateTimeFormat('id-ID', { month: 'short' }).format(new Date(blog.created_at))}
                    </p>
                  </div>

                  {/* Status Badge (Floating top left) */}
                  <div className="absolute top-3 left-3">
                    {blog.status === 'published' ? (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500 text-white shadow-sm tracking-wide">
                        PUBLISHED
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-gray-500 text-white shadow-sm tracking-wide">
                        DRAFT
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-5 relative">
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <h3 className="font-bold text-gray-900 text-[15px] leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                      {blog.title}
                    </h3>
                    
                    {/* Kebab Menu */}
                    <div className="relative shrink-0">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === blog.id ? null : blog.id)}
                        className="p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                        </svg>
                      </button>
                      
                      {openMenuId === blog.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                          <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden z-20 animate-fade-in">
                            <button
                              onClick={() => { setOpenMenuId(null); openEdit(blog); }}
                              className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2.5 transition-colors"
                            >
                              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => { setOpenMenuId(null); openDelete(blog); }}
                              className="w-full text-left px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors border-t border-gray-50"
                            >
                              <svg className="w-4 h-4 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Hapus
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-[13px] text-gray-500 leading-relaxed line-clamp-3 mb-1 flex-1">
                    {blog.content ? blog.content.replace(/<[^>]+>/g, '') : 'Tidak ada konten.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {(modal === 'create' || modal === 'edit') && (
        <BlogFormModal
          mode={modal}
          initialData={selected}
          onClose={closeModal}
          onSaved={handleSaved}
        />
      )}
      {modal === 'delete' && (
        <DeleteConfirmModal
          blog={selected}
          onClose={closeModal}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
