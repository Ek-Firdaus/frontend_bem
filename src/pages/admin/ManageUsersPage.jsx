import { useState } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function ManageUsersPage() {
  const [name, setName] = useState('');
  const [npm, setNpm] = useState('');
  const [password, setPassword] = useState('');
  const [division, setDivision] = useState('');
  const [role, setRole] = useState('member');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Keep track of recently added users during this session
  const [recentlyCreated, setRecentlyCreated] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name || !npm || !password || !division || !role) {
      setError('Semua field wajib diisi.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/users', {
        name,
        npm,
        password,
        division,
        role,
      });

      setSuccess(`User "${name}" berhasil ditambahkan!`);
      
      // Add to session list
      const newUser = res.data?.data || { name, npm, division, role, id: `temp-${Date.now()}` };
      setRecentlyCreated((prev) => [newUser, ...prev]);

      // Reset form
      setName('');
      setNpm('');
      setPassword('');
      setDivision('');
      setRole('member');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menambahkan user baru.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Kelola User</h1>
        <p className="page-subtitle">Daftarkan akun anggota baru SIM BEM FTI. Pengguna tidak bisa registrasi sendiri.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Registration Form */}
        <div className="lg:col-span-2">
          <div className="card">
            <h2 className="text-base font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100">
              Buat Akun Baru
            </h2>

            {error && (
              <div className="alert-error mb-4">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="alert-success mb-4">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="label" htmlFor="name">Nama Lengkap</label>
                  <input
                    type="text"
                    id="name"
                    className="input"
                    placeholder="Nama Lengkap Anggota"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="label" htmlFor="npm">NPM (Username)</label>
                  <input
                    type="text"
                    id="npm"
                    className="input"
                    placeholder="Contoh: 202043501234"
                    value={npm}
                    onChange={(e) => setNpm(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="label" htmlFor="password">Password Awal</label>
                  <input
                    type="password"
                    id="password"
                    className="input"
                    placeholder="Password Akun Baru"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="label" htmlFor="division">Divisi / Bidang</label>
                  <input
                    type="text"
                    id="division"
                    className="input"
                    placeholder="Contoh: PSDM / Sekretariat"
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="label" htmlFor="role">Role / Peran Akses</label>
                <select
                  id="role"
                  className="input cursor-pointer"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  disabled={loading}
                >
                  <option value="member">Member</option>
                  <option value="admin_psdm">Admin PSDM</option>
                  <option value="admin_sekre">Admin Sekretariat</option>
                  <option value="pilar">Pilar</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="btn-primary w-full md:w-auto"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" color="white" />
                      Membuat Akun...
                    </>
                  ) : (
                    'Daftarkan Anggota'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Recently Created list (Session history) */}
        <div className="lg:col-span-1">
          <div className="card h-full flex flex-col">
            <h2 className="text-base font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">
              Baru Saja Dibuat
            </h2>

            {recentlyCreated.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-gray-400 text-center">
                <svg className="w-12 h-12 mb-2 opacity-35" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <p className="text-xs">Belum ada akun yang dibuat dalam sesi ini.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[400px] lg:max-h-none">
                {recentlyCreated.map((u) => (
                  <div key={u.id || u.npm} className="p-3 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {u.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-gray-800 truncate">{u.name}</p>
                      <p className="text-[10px] text-gray-400">NPM: {u.npm}</p>
                      <p className="text-[10px] text-gray-400 truncate">Divisi: {u.division}</p>
                    </div>
                    <span className="inline-flex px-2 py-0.5 rounded-full text-[9px] font-semibold bg-primary/10 text-primary capitalize flex-shrink-0">
                      {u.role?.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
