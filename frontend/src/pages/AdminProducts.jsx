import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Layers,
  ArrowUpDown,
  Image as ImageIcon,
  DollarSign,
  Tag,
  LayoutDashboard,
  ShieldCheck,
  X,
  AlertTriangle,
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Preset fashion sample images for quick selection in admin form
const SAMPLE_IMAGES = [
  { label: 'T-Shirt', url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80' },
  { label: 'Oversized Tee', url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=800&q=80' },
  { label: 'Hoodie', url: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80' },
  { label: 'Denim Jacket', url: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=800&q=80' },
  { label: 'Shirt', url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80' },
  { label: 'Dress', url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=800&q=80' },
  { label: 'Jeans / Pants', url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=800&q=80' },
  { label: 'Backpack', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80' },
];

export default function AdminProducts() {
  const { user } = useAuth();
  const location = useLocation();

  // Data states
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: string }

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all'); // 'all' | 'active' | 'inactive'

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // null = Create mode, object = Edit mode
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Delete / Deactivate confirmation dialog
  const [deactivatingProduct, setDeactivatingProduct] = useState(null);
  const [deactivateLoading, setDeactivateLoading] = useState(false);

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    price: '',
    description: '',
    image_url: '',
    is_active: true,
  });
  const [variants, setVariants] = useState([
    { size: 'M', colour: 'Black', stock: 10 },
  ]);

  // Show notification helper
  const showToast = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/categories`);
      if (res.data?.success) {
        setCategories(res.data.data || []);
      }
    } catch (err) {
      console.warn('Failed to fetch categories:', err.message);
    }
  }, []);

  // Fetch admin products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/admin/products`, {
        params: {
          search: searchQuery || undefined,
          category: selectedCategory || undefined,
          status: selectedStatus !== 'all' ? selectedStatus : undefined,
        },
      });

      if (res.data?.success) {
        setProducts(res.data.data || []);
      } else {
        throw new Error(res.data?.message || 'Failed to fetch products');
      }
    } catch (err) {
      console.error('Error fetching admin products:', err);
      const msg = err.response?.data?.message || err.message || 'Error fetching products';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedStatus]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Open modal for Create
  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setFormError(null);
    setFormData({
      name: '',
      category_id: categories.length > 0 ? categories[0].id : '',
      price: '',
      description: '',
      image_url: SAMPLE_IMAGES[0].url,
      is_active: true,
    });
    setVariants([
      { size: 'S', colour: 'Black', stock: 15 },
      { size: 'M', colour: 'Black', stock: 25 },
      { size: 'L', colour: 'Black', stock: 20 },
    ]);
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setFormError(null);
    setFormData({
      name: product.name || '',
      category_id: product.category?.id || '',
      price: product.price || '',
      description: product.description || '',
      image_url: product.image_url || '',
      is_active: product.is_active !== undefined ? product.is_active : true,
    });
    setVariants(
      product.variants && product.variants.length > 0
        ? product.variants.map((v) => ({
            id: v.id,
            size: v.size,
            colour: v.colour,
            stock: v.stock,
          }))
        : [{ size: 'M', colour: 'Black', stock: 10 }]
    );
    setIsModalOpen(true);
  };

  // Variant management handlers
  const handleAddVariantRow = () => {
    setVariants((prev) => [...prev, { size: 'M', colour: 'White', stock: 10 }]);
  };

  const handleUpdateVariantRow = (index, field, value) => {
    setVariants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleRemoveVariantRow = (index) => {
    if (variants.length <= 1) {
      showToast('A product should have at least one variant.', 'error');
      return;
    }
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  // Form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Client validation
    if (!formData.name.trim()) {
      setFormError('Product name is required.');
      return;
    }

    if (!formData.category_id) {
      setFormError('Please select a product category.');
      return;
    }

    const priceNum = parseFloat(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setFormError('Please enter a valid price greater than 0.');
      return;
    }

    // Validate variants
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.size?.trim() || !v.colour?.trim()) {
        setFormError(`Variant #${i + 1} must have both size and colour specified.`);
        return;
      }
      const st = parseInt(v.stock, 10);
      if (isNaN(st) || st < 0) {
        setFormError(`Variant #${i + 1} (${v.size}/${v.colour}) must have a stock of 0 or greater.`);
        return;
      }
    }

    setFormSubmitting(true);

    const payload = {
      name: formData.name.trim(),
      category_id: parseInt(formData.category_id, 10),
      price: priceNum,
      description: formData.description.trim() || null,
      image_url: formData.image_url.trim() || null,
      is_active: formData.is_active,
      variants: variants.map((v) => ({
        id: v.id || undefined,
        size: v.size.trim(),
        colour: v.colour.trim(),
        stock: parseInt(v.stock, 10),
      })),
    };

    try {
      if (editingProduct) {
        // PUT update
        const res = await axios.put(`${API_BASE_URL}/api/admin/products/${editingProduct.id}`, payload);
        if (res.data?.success) {
          showToast(`Product "${payload.name}" updated successfully!`);
          setIsModalOpen(false);
          fetchProducts();
        } else {
          throw new Error(res.data?.message || 'Update failed');
        }
      } else {
        // POST create
        const res = await axios.post(`${API_BASE_URL}/api/admin/products`, payload);
        if (res.data?.success) {
          showToast(`Product "${payload.name}" created successfully!`);
          setIsModalOpen(false);
          fetchProducts();
        } else {
          throw new Error(res.data?.message || 'Creation failed');
        }
      }
    } catch (err) {
      console.error('Save product error:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to save product';
      setFormError(msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Safe Deactivate / Delete Action
  const handleConfirmDeactivate = async () => {
    if (!deactivatingProduct) return;
    setDeactivateLoading(true);

    try {
      const res = await axios.delete(`${API_BASE_URL}/api/admin/products/${deactivatingProduct.id}`);
      if (res.data?.success) {
        showToast(res.data.message || 'Product deactivated successfully.');
        setDeactivatingProduct(null);
        fetchProducts();
      } else {
        throw new Error(res.data?.message || 'Action failed');
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to deactivate product';
      showToast(msg, 'error');
    } finally {
      setDeactivateLoading(false);
    }
  };

  // Quick toggle active / reactivate
  const handleToggleActive = async (product) => {
    try {
      const newActive = !product.is_active;
      const res = await axios.put(`${API_BASE_URL}/api/admin/products/${product.id}`, {
        is_active: newActive,
      });
      if (res.data?.success) {
        showToast(`Product "${product.name}" is now ${newActive ? 'Active' : 'Deactivated'}.`);
        fetchProducts();
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update product status';
      showToast(msg, 'error');
    }
  };

  // Format currency
  const formatCurrency = (val) => {
    return `LKR ${Number(val || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-20 right-5 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div
            className={`flex items-center space-x-3 px-4 py-3 rounded-2xl shadow-xl border text-sm font-semibold ${
              notification.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            {notification.type === 'error' ? (
              <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            )}
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-gray-400 hover:text-gray-600 p-0.5 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs font-semibold text-indigo-100">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                <span>UrbanThread Admin Portal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Product Catalog Management
              </h1>
              <p className="text-sm text-indigo-200">
                Manage clothing catalog, SKU variants, stock allocations, and pricing.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-bold rounded-xl shadow-md transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Product</span>
              </button>
            </div>
          </div>

          {/* Admin Subnav Tabs */}
          <div className="flex items-center space-x-2 mt-6 pt-4 border-t border-indigo-700/50">
            <Link
              to="/admin"
              className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                location.pathname === '/admin'
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'text-indigo-200 hover:bg-white/10'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Overview</span>
            </Link>
            <Link
              to="/admin/products"
              className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                location.pathname === '/admin/products'
                  ? 'bg-white text-indigo-900 shadow-sm'
                  : 'text-indigo-200 hover:bg-white/10'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Products</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        {/* Filter and Search Bar Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-center">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors text-gray-700"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Dropdown */}
            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors text-gray-700"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>

            {/* Status Indicator & Refresh */}
            <div className="flex items-center justify-between sm:justify-end space-x-3">
              <span className="text-xs font-semibold text-gray-500">
                {products.length} {products.length === 1 ? 'product' : 'products'}
              </span>
              <button
                onClick={() => fetchProducts()}
                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors border border-gray-200"
                title="Refresh products"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Products Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-sm font-medium text-gray-500">Loading catalog items...</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center space-y-4">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <div>
                <h3 className="text-base font-bold text-gray-900">Failed to load products</h3>
                <p className="text-xs text-rose-600 mt-1">{error}</p>
              </div>
              <button
                onClick={() => fetchProducts()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl"
              >
                Try Again
              </button>
            </div>
          ) : products.length === 0 ? (
            <div className="p-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                <Package className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">No products found</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Try adjusting your search query or status filter.
                </p>
              </div>
              <button
                onClick={handleOpenCreateModal}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Product</span>
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/75 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Product</th>
                    <th className="py-3.5 px-6">Category</th>
                    <th className="py-3.5 px-6">Base Price</th>
                    <th className="py-3.5 px-6">Variants</th>
                    <th className="py-3.5 px-6">Total Stock</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs">
                  {products.map((p) => {
                    const isOutOfStock = p.total_stock <= 0;
                    const isLowStock = p.total_stock > 0 && p.total_stock <= 10;

                    return (
                      <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                        {/* Product Image & Info */}
                        <td className="py-3.5 px-6">
                          <div className="flex items-center space-x-3.5">
                            <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden flex-shrink-0">
                              {p.image_url ? (
                                <img
                                  src={p.image_url}
                                  alt={p.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <ImageIcon className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-gray-900 block">{p.name}</span>
                              <span className="text-[11px] text-gray-400 font-mono">ID: #{p.id}</span>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-6">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-700">
                            {p.category?.name || 'Uncategorized'}
                          </span>
                        </td>

                        {/* Price */}
                        <td className="py-3.5 px-6 font-bold text-gray-900 whitespace-nowrap">
                          {formatCurrency(p.price)}
                        </td>

                        {/* Variants Preview */}
                        <td className="py-3.5 px-6 whitespace-nowrap">
                          <div className="space-y-1">
                            <span className="inline-flex items-center space-x-1 text-xs font-semibold text-gray-700">
                              <Layers className="w-3.5 h-3.5 text-indigo-500" />
                              <span>{p.variant_count || 0} variants</span>
                            </span>
                            <div className="flex flex-wrap gap-1 max-w-[200px]">
                              {(p.variants || []).slice(0, 3).map((v) => (
                                <span
                                  key={v.id || `${v.size}-${v.colour}`}
                                  className="text-[10px] px-1.5 py-0.5 bg-gray-100 rounded text-gray-600"
                                >
                                  {v.size}/{v.colour}
                                </span>
                              ))}
                              {(p.variants || []).length > 3 && (
                                <span className="text-[10px] text-gray-400">
                                  +{p.variants.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Stock */}
                        <td className="py-3.5 px-6 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              isOutOfStock
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : isLowStock
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {p.total_stock} in stock
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-6 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(p)}
                            title="Click to toggle active status"
                            className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                              p.is_active
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                p.is_active ? 'bg-emerald-500' : 'bg-gray-400'
                              }`}
                            />
                            <span>{p.is_active ? 'Active' : 'Inactive'}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-6 text-right whitespace-nowrap">
                          <div className="inline-flex items-center space-x-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(p)}
                              className="p-1.5 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Edit product"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeactivatingProduct(p)}
                              className="p-1.5 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Deactivate / Delete product"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* CREATE / EDIT PRODUCT MODAL                                  */}
      {/* ============================================================ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
              <div>
                <h2 className="text-xl font-black text-gray-900">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {editingProduct
                    ? `Updating "${editingProduct.name}" (ID #${editingProduct.id})`
                    : 'Create an item with sizes, colours, and inventory counts'}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {formError && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center space-x-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Basic Details Section */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  General Information
                </h3>

                {/* Name */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Product Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Classic Cotton T-Shirt"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  />
                </div>

                {/* Category & Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Category <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    >
                      <option value="">Select Category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Base Price (LKR) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="1"
                      required
                      placeholder="e.g. 2900"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Detailed item description, fabric details, sizing notes..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                  />
                </div>

                {/* Image URL & Preview */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Image URL
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="https://..."
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="flex-1 px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    />
                    <div className="w-11 h-11 rounded-xl border border-gray-200 overflow-hidden flex-shrink-0 bg-gray-100">
                      {formData.image_url ? (
                        <img
                          src={formData.image_url}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => (e.target.style.display = 'none')}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sample Presets */}
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] text-gray-400 font-semibold mr-1">Presets:</span>
                    {SAMPLE_IMAGES.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setFormData({ ...formData, image_url: preset.url })}
                        className="text-[10px] px-2 py-0.5 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-600 transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Active Status Toggle */}
                <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-2xl border border-gray-200">
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">Product Visibility</span>
                    <span className="text-[11px] text-gray-500">
                      Active products appear in the storefront catalog.
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>
              </div>

              {/* Variants Section */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                      Sizes, Colours & Stock Variants
                    </h3>
                    <p className="text-[11px] text-gray-500">
                      Specify available sizes, colourways, and initial warehouse quantities.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddVariantRow}
                    className="inline-flex items-center space-x-1 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition-colors border border-indigo-200"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Row</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {variants.map((v, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-12 gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-200 items-center text-xs"
                    >
                      <div className="col-span-4">
                        <label className="text-[10px] text-gray-500 font-bold block mb-0.5">Size</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. S, M, 32"
                          value={v.size}
                          onChange={(e) => handleUpdateVariantRow(idx, 'size', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="col-span-4">
                        <label className="text-[10px] text-gray-500 font-bold block mb-0.5">Colour</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Black"
                          value={v.colour}
                          onChange={(e) => handleUpdateVariantRow(idx, 'colour', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="text-[10px] text-gray-500 font-bold block mb-0.5">Stock</label>
                        <input
                          type="number"
                          min="0"
                          required
                          value={v.stock}
                          onChange={(e) => handleUpdateVariantRow(idx, 'stock', e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="col-span-1 flex justify-center pt-3">
                        <button
                          type="button"
                          onClick={() => handleRemoveVariantRow(idx)}
                          className="text-gray-400 hover:text-rose-600 p-1"
                          title="Remove variant"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={formSubmitting}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="inline-flex items-center space-x-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                >
                  {formSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingProduct ? 'Save Changes' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SAFE DEACTIVATE / DELETE CONFIRMATION MODAL                  */}
      {/* ============================================================ */}
      {deactivatingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-black text-gray-900">
                Deactivate Product?
              </h3>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Are you sure you want to remove <strong className="text-gray-800">{deactivatingProduct.name}</strong>?
                To protect historical orders and customer order details, this product will be safely deactivated from the storefront.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center space-x-3">
              <button
                type="button"
                onClick={() => setDeactivatingProduct(null)}
                disabled={deactivateLoading}
                className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeactivate}
                disabled={deactivateLoading}
                className="inline-flex items-center space-x-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
              >
                {deactivateLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Deactivate Product</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
