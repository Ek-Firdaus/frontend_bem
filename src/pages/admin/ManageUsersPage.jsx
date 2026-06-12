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
  const [listSuccess, setListSuccess] = useState('');

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Edit User States
  const [editingUser, setEditingUser] = useState(null);
  const [editName, setEditName] = useState('');
  const [editNpm, setEditNpm] = useState('');
  const [editDivision, setEditDivision] = useState('');
  const [editRole, setEditRole] = useState('member');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Sensitive Action Modal States
  const [actionUser, setActionUser] = useState(null);
  const [actionTab, setActionTab] = useState('reset'); // 'reset' | 'delete'

  // Reset Password States
  const [resetNewPw, setResetNewPw] = useState('');
  const [resetConfirmPw, setResetConfirmPw] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');

  // Delete Confirmation States
  const [deleteConfirmNpm, setDeleteConfirmNpm] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

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
      setCurrentPage(1);
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

  // Open edit modal
  const handleOpenEditModal = (targetUser) => {
    setEditingUser(targetUser);
    setEditName(targetUser.name || '');
    setEditNpm(targetUser.npm || '');
    setEditDivision(targetUser.division || '');
    setEditRole(targetUser.role || 'member');
    setEditError('');
  };

  const handleCloseEditModal = () => setEditingUser(null);

  // Handle edit user submit (no password)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    if (!editName.trim() || !editNpm.trim() || !editDivision.trim() || !editRole) {
      setEditError('Semua field wajib diisi.');
      return;
    }
    try {
      setEditLoading(true);
      await api.put(`/users/${editingUser.id}`, {
        name: editName.trim(),
        npm: editNpm.trim(),
        division: editDivision.trim(),
        role: editRole,
      });
      fetchUsers();
      handleCloseEditModal();
      setListSuccess(`Data pengguna "${editName}" berhasil diperbarui.`);
      setTimeout(() => setListSuccess(''), 4000);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Gagal memperbarui data pengguna.');
    } finally {
      setEditLoading(false);
    }
  };

  // Open sensitive action modal
  const handleOpenActionModal = (targetUser) => {
    setActionUser(targetUser);
    setActionTab('reset');
    setResetNewPw('');
    setResetConfirmPw('');
    setResetError('');
    setDeleteConfirmNpm('');
    setDeleteError('');
  };

  const handleCloseActionModal = () => setActionUser(null);

  // Handle reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setResetError('');
    if (!resetNewPw || !resetConfirmPw) {
      setResetError('Semua field wajib diisi.');
      return;
    }
    if (resetNewPw.length < 8) {
      setResetError('Password minimal 8 karakter.');
      return;
    }
    if (resetNewPw !== resetConfirmPw) {
      setResetError('Password baru dan konfirmasi tidak cocok.');
      return;
    }
    try {
      setResetLoading(true);
      await api.put(`/users/${actionUser.id}`, { password: resetNewPw });
      handleCloseActionModal();
      setListSuccess(`Password pengguna "${actionUser.name}" berhasil direset.`);
      setTimeout(() => setListSuccess(''), 4000);
    } catch (err) {
      setResetError(err.response?.data?.message || 'Gagal mereset password.');
    } finally {
      setResetLoading(false);
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    if (!actionUser) return;
    try {
      setDeleteLoading(true);
      setDeleteError('');
      const identifier = actionUser.id || actionUser.npm;
      await api.delete(`/users/${identifier}`);
      setUsers((prev) => prev.filter((u) => u.npm !== actionUser.npm));
      handleCloseActionModal();
      setListSuccess(`Pengguna "${actionUser.name}" berhasil dihapus.`);
      setTimeout(() => setListSuccess(''), 4000);
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Gagal menghapus pengguna.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(users.length / itemsPerPage);

  // If we delete the last item on the current page and it becomes empty, go to previous page
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [users.length, totalPages, currentPage]);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Page Header */}
      <div className="page-header">
        <h1 className="page-title">Kelola Pengguna</h1>
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

          {listSuccess && (
            <div className="mx-5 mt-4 alert-success animate-fade-in">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{listSuccess}</span>
            </div>
          )}

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
                  {currentUsers.map((u) => (
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
                            onClick={() => handleOpenActionModal(u)}
                            className="btn-ghost btn-sm text-gray-500 hover:text-gray-700 p-1"
                            title="Aksi Sensitif"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length > 0 && totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 sm:py-3 border-t border-gray-100 bg-gray-50/50">
                  <span className="text-sm text-gray-500 text-center sm:text-left">
                    Menampilkan <span className="font-medium text-gray-900">{indexOfFirstItem + 1}</span> hingga{' '}
                    <span className="font-medium text-gray-900">{Math.min(indexOfLastItem, users.length)}</span> dari{' '}
                    <span className="font-medium text-gray-900">{users.length}</span> pengguna
                  </span>
                  <div className="flex flex-wrap justify-center items-center gap-1">
                    <button
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                      if (
                        page === 1 || 
                        page === totalPages || 
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                              currentPage === page
                                ? 'bg-primary text-white'
                                : 'text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      } else if (
                        page === currentPage - 2 ||
                        page === currentPage + 2
                      ) {
                        return <span key={page} className="px-1 text-gray-400">...</span>;
                      }
                      return null;
                    })}

                    <button
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
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
      {/* SENSITIVE ACTION MODAL WITH SIDEBAR */}
      {actionUser && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-xl animate-slide-up relative max-h-[90vh] overflow-hidden flex flex-col sm:flex-row">
            {/* Sidebar */}
            <div className="sm:w-52 flex-shrink-0 bg-gray-50 border-b sm:border-b-0 sm:border-r border-gray-200">
              <div className="px-4 py-4 border-b border-gray-200">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Aksi Sensitif 
                  <span className="text-xs font-bold text-gray-900 truncate mt-0.5">{actionUser.name}</span>
                </p>

              </div>
              <nav className="flex sm:flex-col p-2 gap-1">
                <button
                  onClick={() => { setActionTab('reset'); setResetError(''); }}
                  className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left ${
                    actionTab === 'reset'
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Reset Password
                </button>
                <button
                  onClick={() => { setActionTab('delete'); setDeleteError(''); setDeleteConfirmNpm(''); }}
                  className={`flex items-center gap-2.5 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-left ${
                    actionTab === 'delete'
                      ? 'bg-red-50 text-red-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Hapus Pengguna
                </button>
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {/* Close button */}
              <button onClick={handleCloseActionModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 z-10" aria-label="Tutup">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {actionTab === 'reset' ? (
                /* RESET PASSWORD TAB */
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Reset Password</h3>
                  <p className="text-sm text-gray-500 mb-5">Atur password baru untuk <span className="font-semibold text-gray-700">{actionUser.name}</span></p>

                  {resetError && (
                    <div className="alert-error mb-4 animate-fade-in">
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span>{resetError}</span>
                    </div>
                  )}

                  <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
                    <div className="form-group">
                      <label className="label" htmlFor="reset-pw">Password Baru <span className="text-red-500">*</span></label>
                      <input type="password" id="reset-pw" className="input" placeholder="Minimal 8 karakter" value={resetNewPw} onChange={(e) => setResetNewPw(e.target.value)} disabled={resetLoading} />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="reset-confirm">Konfirmasi Password <span className="text-red-500">*</span></label>
                      <input type="password" id="reset-confirm" className="input" placeholder="Ulangi password baru" value={resetConfirmPw} onChange={(e) => setResetConfirmPw(e.target.value)} disabled={resetLoading} />
                    </div>
                    <div className="flex gap-3 pt-3 border-t border-gray-100 mt-5">
                      <button type="button" onClick={handleCloseActionModal} disabled={resetLoading} className="btn-secondary flex-1">Batal</button>
                      <button type="submit" disabled={resetLoading || !resetNewPw || !resetConfirmPw} className="btn-danger flex-1">
                        {resetLoading ? (<><LoadingSpinner size="sm" color="white" /> Mereset...</>) : 'Reset Password'}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* DELETE USER TAB */
                <div>
                  <h3 className="text-lg font-bold text-red-600 mb-1">Hapus Pengguna</h3>
                  <p className="text-sm text-gray-500 mb-5">Tindakan ini <span className="font-semibold text-red-600">tidak dapat dibatalkan</span>.</p>

                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <p className="text-sm font-semibold text-red-800">Anda akan menghapus:</p>
                        <p className="text-sm text-red-700 mt-1">Nama: <span className="font-bold">{actionUser.name}</span></p>
                        <p className="text-sm text-red-700">NPM: <span className="font-mono font-bold">{actionUser.npm}</span></p>
                      </div>
                    </div>
                  </div>

                  {deleteError && (
                    <div className="alert-error mb-4 animate-fade-in">
                      <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span>{deleteError}</span>
                    </div>
                  )}

                  <div className="form-group mb-5">
                    <label className="label" htmlFor="delete-confirm-npm">Ketik NPM <span className="font-mono font-bold text-red-600">{actionUser.npm}</span> untuk konfirmasi</label>
                    <input type="text" id="delete-confirm-npm" className="input font-mono" placeholder={actionUser.npm} value={deleteConfirmNpm} onChange={(e) => setDeleteConfirmNpm(e.target.value)} disabled={deleteLoading} />
                  </div>

                  <div className="flex gap-3 pt-3 border-t border-gray-100">
                    <button type="button" onClick={handleCloseActionModal} disabled={deleteLoading} className="btn-secondary flex-1">Batal</button>
                    <button
                      type="button"
                      onClick={handleDeleteUser}
                      disabled={deleteLoading || deleteConfirmNpm !== actionUser.npm}
                      className="btn-danger flex-1"
                    >
                      {deleteLoading ? (<><LoadingSpinner size="sm" color="white" /> Menghapus...</>) : 'Hapus Pengguna'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
