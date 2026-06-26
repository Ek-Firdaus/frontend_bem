import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import QRScannerModal from '../../components/ui/QRScannerModal';

export default function ManageInventoryPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'add'

  // List States
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');
  const [listSuccess, setListSuccess] = useState('');

  // Form States (Add)
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [location, setLocation] = useState('');
  const [condition, setCondition] = useState('good');
  const [status, setStatus] = useState('available');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Edit States
  const [editingItem, setEditingItem] = useState(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editQuantity, setEditQuantity] = useState(1);
  const [editLocation, setEditLocation] = useState('');
  const [editCondition, setEditCondition] = useState('good');
  const [editStatus, setEditStatus] = useState('available');
  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);
  
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Action States (Delete / Detail)
  const [actionItem, setActionItem] = useState(null);
  const [actionTab, setActionTab] = useState('detail'); // 'detail' | 'delete'
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [toggleLoading, setToggleLoading] = useState(false);
  
  const [printLoading, setPrintLoading] = useState(false);
  const [printSingleLoading, setPrintSingleLoading] = useState(false);

  // Scanner Modal
  const [showScanner, setShowScanner] = useState(false);

  // Fetch Inventories
  const fetchInventories = useCallback(async () => {
    try {
      setLoading(true);
      setListError('');
      const res = await api.get('/inventories');
      const data = res.data?.data?.inventories || [];
      setInventories(data);
      setCurrentPage(1);
    } catch (err) {
      setListError(err.response?.data?.message || 'Gagal memuat data inventaris.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'list') {
      fetchInventories();
    }
  }, [activeTab, fetchInventories]);

  const handleFileChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      if (isEdit) {
        setEditImageFile(file);
        setEditImagePreview(previewUrl);
      } else {
        setImageFile(file);
        setImagePreview(previewUrl);
      }
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');

    if (!name.trim()) {
      setAddError('Nama barang wajib diisi.');
      return;
    }

    try {
      setAddLoading(true);
      const formData = new FormData();
      formData.append('name', name);
      formData.append('description', description);
      formData.append('category', category);
      formData.append('quantity', quantity);
      formData.append('location', location);
      formData.append('condition', condition);
      formData.append('status', status);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await api.post('/inventories', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setAddSuccess(`Barang "${name}" berhasil ditambahkan!`);
      // Reset form
      setName('');
      setDescription('');
      setCategory('');
      setQuantity(1);
      setLocation('');
      setCondition('good');
      setStatus('available');
      setImageFile(null);
      setImagePreview(null);
      // Optional: switch tab to list after short delay
      setTimeout(() => setActiveTab('list'), 1500);
    } catch (err) {
      setAddError(err.response?.data?.message || 'Gagal menambahkan inventaris.');
    } finally {
      setAddLoading(false);
    }
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setEditName(item.name || '');
    setEditDescription(item.description || '');
    setEditCategory(item.category || '');
    setEditQuantity(item.quantity || 1);
    setEditLocation(item.location || '');
    setEditCondition(item.condition || 'good');
    setEditStatus(item.status || 'available');
    setEditImageFile(null);
    setEditImagePreview(item.image_url || null);
    setEditError('');
  };

  const handleCloseEditModal = () => setEditingItem(null);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');
    if (!editName.trim()) {
      setEditError('Nama barang wajib diisi.');
      return;
    }
    try {
      setEditLoading(true);
      const formData = new FormData();
      formData.append('name', editName);
      formData.append('description', editDescription);
      formData.append('category', editCategory);
      formData.append('quantity', editQuantity);
      formData.append('location', editLocation);
      formData.append('condition', editCondition);
      formData.append('status', editStatus);
      if (editImageFile) {
        formData.append('image', editImageFile);
      }

      await api.put(`/inventories/${editingItem.id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      fetchInventories();
      handleCloseEditModal();
      setListSuccess(`Data inventaris "${editName}" berhasil diperbarui.`);
      setTimeout(() => setListSuccess(''), 4000);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Gagal memperbarui inventaris.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleOpenActionModal = (item) => {
    setActionItem(item);
    setActionTab('detail');
    setDeleteError('');
  };

  const handleCloseActionModal = () => setActionItem(null);

  const handleDeleteItem = async () => {
    if (!actionItem) return;
    try {
      setDeleteLoading(true);
      setDeleteError('');
      await api.delete(`/inventories/${actionItem.id}`);
      setInventories((prev) => prev.filter((i) => i.id !== actionItem.id));
      handleCloseActionModal();
      setListSuccess(`Barang "${actionItem.name}" berhasil dihapus.`);
      setTimeout(() => setListSuccess(''), 4000);
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Gagal menghapus inventaris.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!actionItem) return;
    try {
      setToggleLoading(true);
      const newStatus = actionItem.status === 'available' ? 'borrowed' : 'available';
      await api.patch(`/inventories/${actionItem.id}/status`, { status: newStatus });
      
      setActionItem((prev) => ({ ...prev, status: newStatus }));
      setListSuccess(`Status barang ${actionItem.name} berhasil diubah menjadi ${statusLabels[newStatus] || newStatus}.`);
      setTimeout(() => setListSuccess(''), 4000);
      fetchInventories();
    } catch (err) {
      setListError(err.response?.data?.message || 'Gagal mengubah status barang.');
      setTimeout(() => setListError(''), 4000);
    } finally {
      setToggleLoading(false);
    }
  };

  const handleScanSuccess = async (token) => {
    setShowScanner(false);
    try {
      // Lookup endpoint
      const res = await api.get(`/inventories/qr/${token}`);
      const item = res.data?.data;
      if (item) {
        setActionItem(item);
        setActionTab('detail');
      }
    } catch (err) {
      setListError('QR Token tidak valid atau barang tidak ditemukan.');
      setTimeout(() => setListError(''), 4000);
    }
  };

  const handlePrintAllQR = async () => {
    try {
      setPrintLoading(true);
      const res = await api.get('/inventories/print-qr', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: res.headers['content-type'] }));
      window.open(url, '_blank');
    } catch (err) {
      setListError('Gagal mencetak QR Code.');
      setTimeout(() => setListError(''), 4000);
    } finally {
      setPrintLoading(false);
    }
  };

  const handlePrintSingleQR = async () => {
    if (!actionItem) return;
    try {
      setPrintSingleLoading(true);
      const res = await api.get(`/inventories/${actionItem.id}/print-qr`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: res.headers['content-type'] }));
      window.open(url, '_blank');
    } catch (err) {
      alert('Gagal mencetak QR Code barang ini.');
    } finally {
      setPrintSingleLoading(false);
    }
  };

  const conditionLabels = {
    'good': 'Baik',
    'minor_damage': 'Rusak Ringan',
    'damaged': 'Rusak',
    'lost': 'Hilang',
  };

  const statusLabels = {
    'available': 'Tersedia',
    'borrowed': 'Dipinjam',
    'maintenance': 'Perbaikan',
  };

  const getStatusBadgeClass = (s) => {
    switch (s) {
      case 'available': return 'bg-emerald-100 text-emerald-700';
      case 'borrowed': return 'bg-amber-100 text-amber-700';
      case 'maintenance': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getConditionBadgeClass = (c) => {
    switch (c) {
      case 'good': return 'bg-blue-100 text-blue-700';
      case 'minor_damage': return 'bg-yellow-100 text-yellow-700';
      case 'damaged': return 'bg-red-100 text-red-700';
      case 'lost': return 'bg-gray-800 text-white';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = inventories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(inventories.length / itemsPerPage);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <button onClick={() => navigate(-1)} className="btn-ghost btn-sm p-2 mt-0.5 shrink-0" aria-label="Kembali">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="page-header m-0">
            <h1 className="page-title">Manajemen Inventaris</h1>
            <p className="page-subtitle">Kelola data aset BEM FTI, perbarui kondisi, dan generate QR Code.</p>
          </div>
        </div>
        <button
          onClick={() => setShowScanner(true)}
          className="btn-primary shrink-0 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm14 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          Scan QR (Lookup/Toggle)
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('list')}
          className={`py-2.5 px-5 border-b-2 font-semibold text-sm transition-all duration-200 ${
            activeTab === 'list' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Daftar Inventaris
        </button>
        <button
          onClick={() => setActiveTab('add')}
          className={`py-2.5 px-5 border-b-2 font-semibold text-sm transition-all duration-200 ${
            activeTab === 'add' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
          }`}
        >
          Tambah Barang Baru
        </button>
      </div>

      {activeTab === 'list' ? (
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-semibold text-gray-700">Daftar Aset</h2>
              <p className="text-xs text-gray-400 mt-0.5">{inventories.length} total barang</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handlePrintAllQR} disabled={printLoading || inventories.length === 0} className="btn-secondary btn-sm" title="Cetak Semua QR Code">
                {printLoading ? <LoadingSpinner size="sm" /> : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    <span className="hidden sm:inline">Cetak Semua QR</span>
                  </>
                )}
              </button>
              <button onClick={fetchInventories} disabled={loading} className="btn-ghost btn-sm" title="Refresh">
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          {listSuccess && (
            <div className="mx-5 mt-4 alert-success animate-fade-in">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{listSuccess}</span>
            </div>
          )}

          {loading && inventories.length === 0 ? (
            <div className="flex justify-center items-center py-20"><LoadingSpinner size="lg" /></div>
          ) : listError ? (
            <div className="p-6"><div className="alert-error">{listError}</div></div>
          ) : inventories.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-gray-400">
              <p className="text-sm font-medium">Belum ada inventaris.</p>
              <button onClick={() => setActiveTab('add')} className="btn-primary btn-sm mt-3">Tambah Barang</button>
            </div>
          ) : (
            <div className="table-wrapper rounded-none border-0">
              <table className="table">
                <thead>
                  <tr>
                    <th>Gambar & Nama</th>
                    <th>Kategori / Lokasi</th>
                    <th>Kondisi</th>
                    <th>Status</th>
                    <th className="text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-gray-900">{item.name}</div>
                            <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="text-sm font-medium text-gray-700">{item.category || '-'}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">{item.location || '-'}</div>
                      </td>
                      <td>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${getConditionBadgeClass(item.condition)}`}>
                          {conditionLabels[item.condition]}
                        </span>
                      </td>
                      <td>
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStatusBadgeClass(item.status)}`}>
                          {statusLabels[item.status]}
                        </span>
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleOpenEditModal(item)} className="btn-ghost btn-sm text-blue-600 hover:text-blue-800 p-1" title="Edit">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button onClick={() => handleOpenActionModal(item)} className="btn-ghost btn-sm text-gray-500 hover:text-gray-700 p-1" title="Detail / Hapus">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                               <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                               <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
        /* ADD TAB */
        <div className="max-w-3xl">
          <div className="card">
            <h2 className="text-base font-bold text-gray-900 mb-5 pb-3 border-b border-gray-100">Tambah Barang Baru</h2>
            {addError && <div className="alert-error mb-4">{addError}</div>}
            {addSuccess && <div className="alert-success mb-4">{addSuccess}</div>}

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="label">Nama Barang *</label>
                  <input type="text" className="input" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="label">Kategori</label>
                  <input type="text" className="input" value={category} onChange={(e) => setCategory(e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                  <label className="label">Deskripsi</label>
                  <textarea className="input min-h-[80px]" value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="label">Jumlah *</label>
                  <input type="number" min="1" className="input" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="label">Lokasi Penyimpanan</label>
                  <input type="text" className="input" value={location} onChange={(e) => setLocation(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="label">Kondisi</label>
                  <select className="input bg-white" value={condition} onChange={(e) => setCondition(e.target.value)}>
                    <option value="good">Baik</option>
                    <option value="minor_damage">Rusak Ringan</option>
                    <option value="damaged">Rusak</option>
                    <option value="lost">Hilang</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Status</label>
                  <select className="input bg-white" value={status} onChange={(e) => setStatus(e.target.value)}>
                    <option value="available">Tersedia</option>
                    <option value="borrowed">Dipinjam</option>
                    <option value="maintenance">Perbaikan</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                  <label className="label">Gambar Barang</label>
                  {imagePreview && (
                    <div className="mb-3">
                      <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-xl border border-gray-200" />
                    </div>
                  )}
                  <div className="flex gap-3">
                    <label className="btn-secondary text-sm px-4 py-2 cursor-pointer flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      Pilih File
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, false)} />
                    </label>
                    <label className="btn-primary text-sm px-4 py-2 cursor-pointer flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Ambil Foto
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFileChange(e, false)} />
                    </label>
                  </div>
              </div>
              <div className="pt-4">
                <button type="submit" disabled={addLoading} className="btn-primary w-full md:w-auto">
                  {addLoading ? <LoadingSpinner size="sm" color="white" /> : 'Tambah Barang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl animate-slide-up max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">Edit Inventaris</h3>
            {editError && <div className="alert-error mb-4">{editError}</div>}
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="form-group">
                <label className="label">Nama Barang</label>
                <input type="text" className="input" value={editName} onChange={(e) => setEditName(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="label">Jumlah</label>
                  <input type="number" min="1" className="input" value={editQuantity} onChange={(e) => setEditQuantity(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label className="label">Kategori</label>
                  <input type="text" className="input" value={editCategory} onChange={(e) => setEditCategory(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="label">Kondisi</label>
                  <select className="input bg-white" value={editCondition} onChange={(e) => setEditCondition(e.target.value)}>
                    <option value="good">Baik</option>
                    <option value="minor_damage">Rusak Ringan</option>
                    <option value="damaged">Rusak</option>
                    <option value="lost">Hilang</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Status</label>
                  <select className="input bg-white" value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                    <option value="available">Tersedia</option>
                    <option value="borrowed">Dipinjam</option>
                    <option value="maintenance">Perbaikan</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                  <label className="label">Ganti Gambar (opsional)</label>
                  {editImagePreview && (
                    <div className="mb-3">
                      <img src={editImagePreview} alt="Preview" className="w-32 h-32 object-cover rounded-xl border border-gray-200" />
                    </div>
                  )}
                  <div className="flex gap-3">
                    <label className="btn-secondary text-sm px-4 py-2 cursor-pointer flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      Pilih File
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, true)} />
                    </label>
                    <label className="btn-primary text-sm px-4 py-2 cursor-pointer flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      Ambil Foto
                      <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleFileChange(e, true)} />
                    </label>
                  </div>
              </div>
              <div className="flex gap-3 pt-3 mt-4 border-t border-gray-100">
                <button type="button" onClick={handleCloseEditModal} className="btn-secondary flex-1">Batal</button>
                <button type="submit" disabled={editLoading} className="btn-primary flex-1">
                  {editLoading ? <LoadingSpinner size="sm" color="white" /> : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL / DELETE MODAL */}
      {actionItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-xl flex flex-col sm:flex-row max-h-[90vh] overflow-hidden">
            <div className="sm:w-52 bg-gray-50 border-b sm:border-b-0 sm:border-r border-gray-200">
               <nav className="flex sm:flex-col p-2 gap-1 mt-4">
                <button onClick={() => setActionTab('detail')} className={`px-3 py-2 text-sm text-left font-medium rounded-lg ${actionTab === 'detail' ? 'bg-primary/10 text-primary' : 'text-gray-600'}`}>Detail Barang</button>
                <button onClick={() => setActionTab('delete')} className={`px-3 py-2 text-sm text-left font-medium rounded-lg ${actionTab === 'delete' ? 'bg-red-50 text-red-600' : 'text-gray-600'}`}>Hapus Barang</button>
               </nav>
            </div>
            <div className="flex-1 p-6 overflow-y-auto relative">
              <button onClick={handleCloseActionModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
              {actionTab === 'detail' ? (
                <div>
                  <h3 className="text-lg font-bold mb-4">Detail Inventaris</h3>
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-6">
                     {actionItem.image_url ? (
                        <img src={actionItem.image_url} alt={actionItem.name} className="w-32 h-32 object-cover rounded-xl border border-gray-200 shrink-0" />
                     ) : (
                        <div className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                           <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                        </div>
                     )}
                     <div className="flex-1 w-full text-center sm:text-left">
                        <h4 className="text-lg font-bold text-gray-900 mb-1">{actionItem.name}</h4>
                        <p className="text-sm text-gray-500 mb-3">{actionItem.description || 'Tidak ada deskripsi'}</p>
                        
                        {actionItem.qr_url && (
                           <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-auto">
                              <span className="text-[10px] font-mono bg-gray-100 px-2 py-1 rounded text-gray-500 border border-gray-200" title="Token QR">
                                {actionItem.asset_token || '-'}
                              </span>
                              <a href={actionItem.qr_url} download={`QR-${actionItem.name}.png`} target="_blank" rel="noreferrer" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg> Unduh Gambar
                              </a>
                              <button onClick={handlePrintSingleQR} disabled={printSingleLoading} className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1">
                                {printSingleLoading ? <LoadingSpinner size="xs" color="emerald-600" /> : <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>}
                                Cetak Label
                              </button>
                           </div>
                        )}
                     </div>
                  </div>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm mb-6">
                    <div><p className="text-gray-500 text-xs">Kategori</p><p className="font-medium">{actionItem.category || '-'}</p></div>
                    <div><p className="text-gray-500 text-xs">Jumlah</p><p className="font-medium">{actionItem.quantity}</p></div>
                    <div><p className="text-gray-500 text-xs">Lokasi</p><p className="font-medium">{actionItem.location || '-'}</p></div>
                    <div><p className="text-gray-500 text-xs">Kondisi</p><span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold mt-1 ${getConditionBadgeClass(actionItem.condition)}`}>{conditionLabels[actionItem.condition]}</span></div>
                    <div><p className="text-gray-500 text-xs">Status</p><span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold mt-1 ${getStatusBadgeClass(actionItem.status)}`}>{statusLabels[actionItem.status]}</span></div>
                  </div>

                  <div className="pt-5 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                     <div>
                       <p className="text-sm font-semibold text-gray-800">Perbarui Status Ketersediaan</p>
                       <p className="text-xs text-gray-500">Tandai barang jika dipinjam atau dikembalikan.</p>
                     </div>
                     <button 
                       onClick={handleToggleStatus} 
                       disabled={toggleLoading}
                       className="btn-secondary text-sm shrink-0"
                     >
                       {toggleLoading ? <LoadingSpinner size="sm" /> : `Jadikan ${actionItem.status === 'available' ? 'Dipinjam' : 'Tersedia'}`}
                     </button>
                  </div>
                </div>
              ) : (
                <div>
                   <h3 className="text-lg font-bold text-red-600 mb-2">Hapus Barang</h3>
                   <p className="text-sm text-gray-500 mb-4">Apakah Anda yakin ingin menghapus <b>{actionItem.name}</b>? Tindakan ini tidak dapat dibatalkan.</p>
                   {deleteError && <div className="alert-error mb-4">{deleteError}</div>}
                   <div className="flex gap-3">
                      <button onClick={handleCloseActionModal} className="btn-secondary flex-1">Batal</button>
                      <button onClick={handleDeleteItem} disabled={deleteLoading} className="btn-danger flex-1">{deleteLoading ? 'Menghapus...' : 'Ya, Hapus'}</button>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SCANNER MODAL */}
      {showScanner && (
        <QRScannerModal 
          onClose={() => setShowScanner(false)} 
          onScanSuccess={handleScanSuccess} 
        />
      )}
    </div>
  );
}
