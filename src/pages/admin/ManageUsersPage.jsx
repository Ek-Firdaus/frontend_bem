import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function ManageUsersPage() {
  // Tabs state
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'add'

  // Register Form States
  const [name, setName] = useState('');
  const [npm, setNpm] = useState('');
  const [password, setPassword] = useState('');
  const [division, setDivision] = useState('');
  const [role, setRole] = useState('member');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Users List States
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [listError, setListError] = useState('');

  // Edit User States
  const [editingUser, setEditingUser] = useState(null); // User object being edited
  const [editName, setEditName] = useState('');
  const [editNpm, setEditNpm] = useState('');
  const [editDivision, setEditDivision] = useState('');
  const [editRole, setEditRole] = useState('member');
  const [editPassword, setEditPassword] = useState(''); // Optional password reset
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    try {
      setUsersLoading(true);
      setListError('');
      const res = await api.get('/users');
      // Backend returns { data: { user: [...] } } (singular 'user')
      const rawUsers = res.data?.data?.user || res.data?.data?.users || [];
      // Ensure we have an array, then sort alphabetically by name
      const sortedUsers = (Array.isArray(rawUsers) ? rawUsers : []).sort((a, b) =>
        (a.name || '').localeCompare(b.name || '')
      );
      setUsers(sortedUsers);
    } catch (err) {
      setListError(err.response?.data?.message || 'Gagal memuat daftar anggota.');
    } finally {
      setUsersLoading(false);
    }
  }, []);

  // Fetch on mount or when switching to list tab
  useEffect(() => {
    if (activeTab === 'list') {
      fetchUsers();
    }
  }, [activeTab, fetchUsers]);

  // Handle register submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!name.trim() || !npm.trim() || !password.trim() || !division.trim() || !role) {
      setError('Semua field wajib diisi.');
      return;
    }

    try {
      setLoading(true);
      await api.post('/users', {
        name: name.trim(),
        npm: npm.trim(),
        password,
        division: division.trim(),
        role,
      });

      setSuccess(`Pengguna "${name}" berhasil ditambahkan!`);

      // Reset form
      setName('');
      setNpm('');
      setPassword('');
      setDivision('');
      setRole('member');

      // Refresh user list and switch to list tab
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menambahkan pengguna baru.');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete user — backend SQL doesn't return `id`, so we use `npm` as identifier
  const handleDeleteUser = async (userToDelete) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus pengguna "${userToDelete.name}" (NPM: ${userToDelete.npm})?`)) {
      return;
    }

    try {
      setListError('');
      // Use id if available, otherwise fall back to npm
      const identifier = userToDelete.id || userToDelete.npm;
      await api.delete(`/users/${identifier}`);
      // Remove from local state
      setUsers((prev) => prev.filter((u) => u.npm !== userToDelete.npm));
    } catch (err) {
      setListError(err.response?.data?.message || 'Gagal menghapus pengguna.');
    }
  };

  // Open edit modal
  const handleOpenEditModal = (targetUser) => {
    setEditingUser(targetUser);
    setEditName(targetUser.name || '');
    setEditNpm(targetUser.npm || '');
    setEditDivision(targetUser.division || '');
    setEditRole(targetUser.role || 'member');
    setEditPassword('');
    setEditError('');
  };

  // Close edit modal
  const handleCloseEditModal = () => {
    setEditingUser(null);
  };

  // Handle edit user submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');

    if (!editName.trim() || !editNpm.trim() || !editDivision.trim() || !editRole) {
      setEditError('Semua field wajib diisi.');
      return;
    }

    try {
      setEditLoading(true);
      const updateData = {
        name: editName.trim(),
        npm: editNpm.trim(),
        division: editDivision.trim(),
        role: editRole,
      };

      // Only send password if user filled it
      if (editPassword.trim()) {
        updateData.password = editPassword;
      }

      await api.put(`/users/${editingUser.id}`, updateData);

      // Refresh user list
      fetchUsers();
      handleCloseEditModal();
      
      // Show success alert
      alert(`Data pengguna "${editName}" berhasil diperbarui.`);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Gagal memperbarui data pengguna.');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Kelola User</h1>
        <p className="page-subtitle">Kelola akun anggota SIM BEM FTI. Pengguna tidak bisa mendaftar sendiri untuk menjaga keamanan data.</p>
      </div>

      {/* Tabs Nav */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('list')}
          className={`py-2.5 px-5 border-b-2 font-semibold text-sm transition-all duration-200 ${
            activeTab === 'list'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Daftar Anggota
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`py-2.5 px-5 border-b-2 font-semibold text-sm transition-all duration-200 ${
            activeTab === 'add'
              ? 'border-primary text-primary'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Tambah Anggota Baru
        </button>
      </div>

      {activeTab === 'list' ? (
        /* TAB 1: USER LIST */
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-semibold text-gray-700">Daftar Semua Anggota</h2>
              <p className="text-xs text-gray-400 mt-0.5">{users.length} total anggota terdaftar</p>
            </div>
            <button
              onClick={fetchUsers}
              disabled={usersLoading}
              className="btn-ghost btn-sm"
              title="Refresh daftar user"
            >
              <svg className={`w-4 h-4 ${usersLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {usersLoading && users.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <LoadingSpinner size="lg" />
            </div>
          ) : listError ? (
            <div className="p-6">
              <div className="alert-error">{listError}</div>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-gray-400">
              <svg className="w-12 h-12 mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm font-medium">Belum ada anggota terdaftar.</p>
              <button onClick={() => setActiveTab('add')} className="btn-primary btn-sm mt-3">Tambah Anggota</button>
            </div>
          ) : (
            <div className="table-wrapper rounded-none border-0">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>NPM</th>
                    <th className="hidden sm:table-cell">Divisi</th>
                    <th>Role</th>
                    <th className="text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.npm || u.id}>
                      <td>
                        <div className="font-semibold text-gray-900">{u.name}</div>
                        <div className="text-[10px] text-gray-400 sm:hidden mt-0.5">{u.division}</div>
                      </td>
                      <td className="font-mono text-xs text-gray-600">{u.npm}</td>
                      <td className="hidden sm:table-cell text-gray-600 text-sm">{u.division}</td>
                      <td>
                        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary capitalize">
                          {u.role?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(u)}
                            className="btn-ghost btn-sm text-blue-600 hover:text-blue-800 p-1"
                            title="Edit User"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u)}
                            className="btn-ghost btn-sm text-red-600 hover:text-red-800 p-1"
                            title="Hapus User"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* TAB 2: REGISTRATION FORM */
        <div className="max-w-2xl">
          <div className="card">
            <h2 className="text-base font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100">
              Buat Akun Baru
            </h2>

            {error && (
              <div className="alert-error mb-4 animate-fade-in">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="alert-success mb-4 animate-fade-in">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4" noValidate>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="label" htmlFor="name">Nama Lengkap <span className="text-red-500">*</span></label>
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
                  <label className="label" htmlFor="npm">NPM (Username) <span className="text-red-500">*</span></label>
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
                  <label className="label" htmlFor="password">Password Awal <span className="text-red-500">*</span></label>
                  <input
                    type="password"
                    id="password"
                    className="input"
                    placeholder="Minimal 8 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="label" htmlFor="division">Divisi / Bidang <span className="text-red-500">*</span></label>
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
                <label className="label" htmlFor="role">Role / Peran Akses <span className="text-red-500">*</span></label>
                <select
                  id="role"
                  className="input cursor-pointer bg-white"
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
      )}

      {/* EDIT USER DIALOG (MODAL) */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl animate-slide-up relative max-h-[90vh] overflow-y-auto">
            {/* Modal header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="text-lg font-bold text-gray-900">Ubah Data Anggota</h3>
              <button
                onClick={handleCloseEditModal}
                className="text-gray-400 hover:text-gray-600 p-1"
                aria-label="Tutup"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {editError && (
              <div className="alert-error mb-4 animate-fade-in">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-4" noValidate>
              <div className="form-group">
                <label className="label" htmlFor="edit-name">Nama Lengkap <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="edit-name"
                  className="input"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={editLoading}
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="edit-npm">NPM (Username) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="edit-npm"
                  className="input"
                  value={editNpm}
                  onChange={(e) => setEditNpm(e.target.value)}
                  disabled={editLoading}
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="edit-division">Divisi / Bidang <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="edit-division"
                  className="input"
                  value={editDivision}
                  onChange={(e) => setEditDivision(e.target.value)}
                  disabled={editLoading}
                />
              </div>

              <div className="form-group">
                <label className="label" htmlFor="edit-role">Role / Peran Akses <span className="text-red-500">*</span></label>
                <select
                  id="edit-role"
                  className="input cursor-pointer bg-white"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  disabled={editLoading}
                >
                  <option value="member">Member</option>
                  <option value="admin_psdm">Admin PSDM</option>
                  <option value="admin_sekre">Admin Sekretariat</option>
                  <option value="pilar">Pilar</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div className="form-group">
                <label className="label" htmlFor="edit-password">Reset Password (Opsional)</label>
                <input
                  type="password"
                  id="edit-password"
                  className="input"
                  placeholder="Kosongkan jika tidak ingin mereset password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  disabled={editLoading}
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-gray-100 mt-5">
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  disabled={editLoading}
                  className="btn-secondary flex-1"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="btn-primary flex-1"
                >
                  {editLoading ? (
                    <>
                      <LoadingSpinner size="sm" color="white" />
                      Menyimpan...
                    </>
                  ) : (
                    'Simpan Perubahan'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
