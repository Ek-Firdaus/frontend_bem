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
  const [showPassword, setShowPassword] = useState(false);

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
            <div className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center mb-4">
              <img src="/logo-bem.png" alt="Logo BEM FTI" className="w-full h-full object-contain" />
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
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Masukkan password"
                  value={form.password}
                  onChange={handleChange}
                  disabled={loading}
                  className={`input pr-11 ${error ? 'input-error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
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
