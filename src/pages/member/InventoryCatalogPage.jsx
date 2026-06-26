import { useState, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

export default function InventoryCatalogPage() {
  const [inventories, setInventories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  const fetchInventories = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/inventories');
      const data = res.data?.data?.inventories || [];
      setInventories(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat katalog inventaris.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInventories();
  }, [fetchInventories]);

  // Extract unique categories for filter
  const categories = ['All', ...new Set(inventories.map(item => item.category).filter(Boolean))];

  // Filter inventories based on search and category
  const filteredInventories = inventories.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'available':
        return <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">Tersedia</span>;
      case 'borrowed':
        return <span className="absolute top-3 right-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">Dipinjam</span>;
      case 'maintenance':
        return <span className="absolute top-3 right-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">Perbaikan</span>;
      default:
        return null;
    }
  };

  const conditionLabels = {
    'good': 'Baik',
    'minor_damage': 'Rusak Ringan',
    'damaged': 'Rusak',
    'lost': 'Hilang',
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Katalog Inventaris</h1>
        <p className="page-subtitle">Lihat daftar barang dan aset BEM FTI beserta ketersediaannya.</p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex-1 relative">
          <svg className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            className="input pl-10 bg-gray-50/50"
            placeholder="Cari nama barang atau deskripsi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48 shrink-0">
          <select 
            className="input bg-gray-50/50 cursor-pointer"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat === 'All' ? 'Semua Kategori' : cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      ) : error ? (
        <div className="alert-error">{error}</div>
      ) : filteredInventories.length === 0 ? (
        <div className="flex flex-col items-center py-20 bg-white rounded-2xl border border-gray-100">
          <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-gray-500 font-medium">Belum ada barang yang sesuai dengan pencarian Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredInventories.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
              <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden flex items-center justify-center">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <svg className="w-12 h-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                )}
                {getStatusBadge(item.status)}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-gray-900 leading-tight truncate" title={item.name}>{item.name}</h3>
                  <span className="shrink-0 text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">Qty: {item.quantity}</span>
                </div>
                <p className="text-[11px] font-medium text-primary uppercase tracking-wider mb-3">{item.category || 'Tanpa Kategori'}</p>
                
                <div className="space-y-2 mt-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span className="truncate">{item.location || 'Lokasi tidak diketahui'}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <svg className="w-4 h-4 mr-2 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>Kondisi: <strong className="text-gray-800 font-medium">{conditionLabels[item.condition]}</strong></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
