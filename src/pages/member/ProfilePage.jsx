import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setProfileLoading(true);
        const res = await api.get('/users/profile');
        setProfile(res.data.data);
      } catch (err) {
        console.error('Gagal mengambil data profil:', err);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Semua input wajib diisi.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Password baru dan konfirmasi password tidak cocok.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password baru minimal harus 8 karakter.');
      return;
    }

    try {
      setLoading(true);
      await api.patch('/users/profile', {
        old_password: oldPassword,
        new_password: newPassword,
      });

      setSuccess('Password berhasil diperbarui.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memperbarui password.');
    } finally {
      setLoading(false);
    }
  };

  const displayName = profile?.name || user?.name || '';
  const displayRole = profile?.role || user?.role || '';
  const displayNpm = profile?.npm || user?.npm || '';
  const displayDivision = profile?.division || user?.division || '-';

  return (
    <div className="animate-fade-in max-w-4xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div className="flex items-start gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost btn-sm p-2 mt-0.5 shrink-0" aria-label="Kembali">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="page-header m-0">
            <h1 className="page-title">Profil Saya</h1>
            <p className="page-subtitle">Kelola informasi profil dan perbarui kata sandi akun Anda.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Card */}
        <div className="md:col-span-1 space-y-6">
          <div className="card text-center flex flex-col items-center py-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-dark to-primary flex items-center justify-center text-white font-bold text-2xl shadow-lg mb-4">
              {profileLoading ? (
                <LoadingSpinner size="sm" color="white" />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">
              {profileLoading ? 'Memuat...' : displayName}
            </h2>
            <p className="text-xs text-gray-400 capitalize mt-1">
              {profileLoading ? 'Memuat...' : displayRole.replace('_', ' ')}
            </p>

            <div className="w-full border-t border-gray-100 my-6"></div>

            <div className="w-full text-left space-y-4 px-2">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">NPM</p>
                <p className="text-sm font-medium text-gray-800 mt-0.5">
                  {profileLoading ? 'Memuat...' : displayNpm}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Divisi</p>
                <p className="text-sm font-medium text-gray-800 mt-0.5">
                  {profileLoading ? 'Memuat...' : displayDivision}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Status Akun</p>
                <div className="mt-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    Aktif
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="md:col-span-2">
          <div className="card">
            <h3 className="text-base font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100">
              Ubah Password
            </h3>

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
              <div className="form-group">
                <label className="label" htmlFor="old_password">Password Lama</label>
                <input
                  type="password"
                  id="old_password"
                  className="input"
                  placeholder="Masukkan password lama Anda"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="new_password">Password Baru</label>
                <input
                  type="password"
                  id="new_password"
                  className="input"
                  placeholder="Minimal 8 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="confirm_password">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  id="confirm_password"
                  className="input"
                  placeholder="Ulangi password baru Anda"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
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
                      Memperbarui...
                    </>
                  ) : (
                    'Perbarui Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
