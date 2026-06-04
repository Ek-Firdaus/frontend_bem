import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getRoleDashboard, ADMIN_ROLES } from '../../components/ProtectedRoute';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate   = useNavigate();

  const [form, setForm]       = useState({ npm: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.npm.trim() || !form.password.trim()) {
      setError('NPM dan password wajib diisi.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await login(form.npm.trim(), form.password);
      navigate(getRoleDashboard(user.role), { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || 'Terjadi kesalahan. Coba lagi.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-dark via-primary to-primary-light flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        {/* Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header strip */}
          <div className="bg-gradient-to-r from-primary-dark to-primary px-8 pt-10 pb-8">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-4">
              <span className="text-white font-extrabold text-lg">B</span>
            </div>
            <h1 className="text-2xl font-bold text-white leading-tight">Selamat Datang</h1>
            <p className="text-sm text-blue-200 mt-1">Masuk ke SIM-BEM FTI</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-8 space-y-5" noValidate>
            {/* Error alert */}
            {error && (
              <div className="alert-error animate-fade-in" role="alert">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            {/* NPM field */}
            <div className="form-group">
              <label htmlFor="npm" className="label">NPM</label>
              <input
                id="npm"
                name="npm"
                type="text"
                autoComplete="username"
                placeholder="Masukkan NPM Anda"
                value={form.npm}
                onChange={handleChange}
                disabled={loading}
                className={`input ${error ? 'input-error' : ''}`}
              />
            </div>

            {/* Password field */}
            <div className="form-group">
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Masukkan password"
                value={form.password}
                onChange={handleChange}
                disabled={loading}
                className={`input ${error ? 'input-error' : ''}`}
              />
            </div>

            {/* Submit */}
            <button
              id="btn-login"
              type="submit"
              disabled={loading}
              className="btn-primary w-full btn-lg mt-2"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" color="white" />
                  Masuk...
                </>
              ) : (
                'Masuk'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="px-8 pb-6 text-center">
            <p className="text-xs text-gray-400">
              SIM-BEM &copy; {new Date().getFullYear()} — BEM FTI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
