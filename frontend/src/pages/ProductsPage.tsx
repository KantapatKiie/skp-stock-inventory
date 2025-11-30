import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import { Layout } from "@/components/Layout";
import { Loading } from "@/components/Loading";
import { useLanguage } from "@/contexts/LanguageContext";
import Swal from "sweetalert2";
import QRCodePrintModal from "@/components/QRCodePrintModal";

export const ProductsPage = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showQRModal, setShowQRModal] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [formData, setFormData] = useState({
    sku: "",
    barcode: "",
    name: "",
    description: "",
    categoryId: "",
    unit: "piece",
    minStock: 0,
    maxStock: 0,
    price: 0,
    cost: 0,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["products", search, page],
    queryFn: () => productService.getAll({ search, page, limit: 20 }),
    placeholderData: (previousData) => previousData,
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getAll(),
  });

  const categories = categoriesData?.data || [];

  const createMutation = useMutation({
    mutationFn: (data: any) => productService.create(data),
    onSuccess: () => {
      Swal.fire({
        icon: 'success',
        title: t("common.createSuccess"),
        showConfirmButton: false,
        timer: 1500
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      resetForm();
      setShowModal(false);
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || t("common.error")
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      productService.update(id, data),
    onSuccess: () => {
      Swal.fire({
        icon: 'success',
        title: t("common.updateSuccess"),
        showConfirmButton: false,
        timer: 1500
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      resetForm();
      setShowModal(false);
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || t("common.error")
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: () => {
      Swal.fire({
        icon: 'success',
        title: t("common.deleteSuccess"),
        showConfirmButton: false,
        timer: 1500
      });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || t("common.error")
      });
    },
  });

  const resetForm = () => {
    setFormData({
      sku: "",
      barcode: "",
      name: "",
      description: "",
      categoryId: "",
      unit: "piece",
      minStock: 0,
      maxStock: 0,
      price: 0,
      cost: 0,
    });
    setEditingProduct(null);
  };

  const handleAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      sku: product.sku,
      barcode: product.barcode || "",
      name: product.name,
      description: product.description || "",
      categoryId: product.categoryId || "",
      unit: product.unit,
      minStock: product.minStock,
      maxStock: product.maxStock,
      price: product.price,
      cost: product.cost,
    });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: t("products.confirmDelete"),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: t('common.confirm') || 'Confirm',
      cancelButtonText: t('common.cancel') || 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280'
    });
    
    if (result.isConfirmed) {
      deleteMutation.mutate(id);
    }
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((p: any) => p.id));
    }
  };

  const handlePrintQRCode = (productId?: string) => {
    if (productId) {
      setSelectedProducts([productId]);
    }
    setShowQRModal(true);
  };

  const handlePrintSelected = () => {
    if (selectedProducts.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: t('products.selectToPrint'),
        showConfirmButton: true,
      });
      return;
    }
    setShowQRModal(true);
  };

  if (isLoading) {
    return <Loading />;
  }

  const products = data?.products || [];

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {t("products.title")}
          </h1>
          <div className="flex gap-2 w-full sm:w-auto">
            {selectedProducts.length > 0 && (
              <button
                onClick={handlePrintSelected}
                className="btn bg-purple-600 hover:bg-purple-700 text-white flex items-center gap-2 flex-1 sm:flex-initial"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                {t("products.printSelected")} ({selectedProducts.length})
              </button>
            )}
            <button
              onClick={handleAdd}
              className="btn btn-primary flex-1 sm:flex-initial"
            >
              + {t("products.addProduct")}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="card p-4 sm:p-6">
          <input
            type="text"
            placeholder={t("common.search") + "..."}
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="input"
          />
        </div>

        {/* Products Table - Desktop */}
        <div className="hidden md:block card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedProducts.length === products.length && products.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("products.sku")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("products.productName")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("products.category")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("inventory.quantity")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("products.price")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("reports.status")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("common.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      {t("common.noData")}
                    </td>
                  </tr>
                ) : (
                  products.map((product) => {
                  const totalStock =
                    product.inventory?.reduce(
                      (sum, inv) => sum + inv.quantity,
                      0
                    ) || 0;

                  return (
                    <tr key={product.id} className={selectedProducts.includes(product.id) ? 'bg-blue-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {product.categories?.name || product.category?.name || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span
                          className={
                            totalStock <= product.minStock
                              ? "text-red-600 font-bold"
                              : ""
                          }
                        >
                          {totalStock} {product.unit}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ฿{product.price.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            product.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {product.isActive ? t("users.active") : t("users.inactive")}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => handlePrintQRCode(product.id)}
                            className="px-3 py-1 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded text-xs font-medium transition-colors"
                            title={t("products.printQRCode")}
                          >
                            📱 QR
                          </button>
                          <button
                            onClick={() => handleEdit(product)}
                            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs font-medium transition-colors"
                            title={t("common.edit")}
                          >
                            ✏️ {t("common.edit")}
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-medium transition-colors"
                            title={t("common.delete")}
                          >
                            🗑️ {t("common.delete")}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && data.pagination.pages > 1 && (
            <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="text-sm text-gray-600">
                {t("products.page")} {data.pagination.page} {t("products.of")} {data.pagination.pages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="btn btn-secondary text-sm"
                >
                  {t("products.previous")}
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === data.pagination.pages}
                  className="btn btn-secondary text-sm"
                >
                  {t("products.next")}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Products Cards - Mobile */}
        <div className="md:hidden space-y-3">
          {products.length === 0 ? (
            <div className="card p-8 text-center text-gray-500">
              {t("common.noData")}
            </div>
          ) : (
            products.map((product) => {
            const totalStock =
              product.inventory?.reduce((sum, inv) => sum + inv.quantity, 0) ||
              0;

            return (
              <div key={product.id} className={`card p-4 space-y-3 ${selectedProducts.includes(product.id) ? 'border-2 border-blue-500 bg-blue-50' : ''}`}>
                <div className="flex justify-between items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => handleSelectProduct(product.id)}
                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 mt-1"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {product.name}
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      SKU: {product.sku}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      product.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.isActive ? t("users.active") : t("users.inactive")}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600 text-xs">{t("products.category")}</p>
                    <p className="font-medium">
                      {product.categories?.name || product.category?.name || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">{t("inventory.quantity")}</p>
                    <p
                      className={`font-medium ${
                        totalStock <= product.minStock
                          ? "text-red-600 font-bold"
                          : ""
                      }`}
                    >
                      {totalStock} {product.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">{t("products.price")}</p>
                    <p className="font-medium">
                      ฿{product.price.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={() => handlePrintQRCode(product.id)}
                    className="flex-1 px-3 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded text-sm font-medium transition-colors"
                  >
                    📱 QR
                  </button>
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm font-medium transition-colors"
                  >
                    ✏️ {t("common.edit")}
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm font-medium transition-colors"
                  >
                    🗑️ {t("common.delete")}
                  </button>
                </div>
              </div>
            );
            })
          )}

          {/* Mobile Pagination */}
          {data && data.pagination.pages > 1 && (
            <div className="card p-4">
              <div className="text-sm text-gray-600 text-center mb-3">
                {t("products.page")} {data.pagination.page} {t("products.of")} {data.pagination.pages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="flex-1 btn btn-secondary text-sm"
                >
                  {t("products.previous")}
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === data.pagination.pages}
                  className="flex-1 btn btn-secondary text-sm"
                >
                  {t("products.next")}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add/Edit Product Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">
                {editingProduct
                  ? "✏️ " + t("products.editProduct")
                  : "➕ " + t("products.addProduct")}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("products.sku")} *
                    </label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) =>
                        setFormData({ ...formData, sku: e.target.value })
                      }
                      className="input"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("products.barcode")}
                      <span className="text-xs text-gray-500 ml-2">(Auto-generated if empty)</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.barcode}
                        onChange={(e) =>
                          setFormData({ ...formData, barcode: e.target.value })
                        }
                        placeholder={`AUTO-${Date.now().toString().slice(-8)}`}
                        className="input flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const timestamp = Date.now().toString();
                          const random = Math.random().toString(36).substring(2, 8).toUpperCase();
                          setFormData({ ...formData, barcode: `BC${timestamp.slice(-8)}${random}` });
                        }}
                        className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-sm font-medium transition-colors"
                        title="Generate Barcode"
                      >
                        🔄
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("products.productName")} *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("products.description")}
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="input"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("products.category")}
                    </label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) =>
                        setFormData({ ...formData, categoryId: e.target.value })
                      }
                      className="input"
                    >
                      <option value="">{t("common.select")}</option>
                      {categories.map((cat: any) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("products.unit")} *
                    </label>
                    <select
                      value={formData.unit}
                      onChange={(e) =>
                        setFormData({ ...formData, unit: e.target.value })
                      }
                      className="input"
                      required
                    >
                      <option value="piece">{t("products.unitPiece")}</option>
                      <option value="box">{t("products.unitBox")}</option>
                      <option value="set">{t("products.unitSet")}</option>
                      <option value="ream">{t("products.unitReam")}</option>
                      <option value="pack">{t("products.unitPack")}</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("products.minStock")} *
                    </label>
                    <input
                      type="number"
                      value={formData.minStock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          minStock: Number(e.target.value),
                        })
                      }
                      className="input"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("products.maxStock")} *
                    </label>
                    <input
                      type="number"
                      value={formData.maxStock}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxStock: Number(e.target.value),
                        })
                      }
                      className="input"
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("products.cost")} *
                    </label>
                    <input
                      type="number"
                      value={formData.cost}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cost: Number(e.target.value),
                        })
                      }
                      className="input"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t("products.price")} *
                    </label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: Number(e.target.value),
                        })
                      }
                      className="input"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 btn btn-secondary"
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={
                      createMutation.isPending || updateMutation.isPending
                    }
                    className="flex-1 btn btn-primary"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? t("common.loading")
                      : t("common.save")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* QR Code Print Modal */}
        <QRCodePrintModal
          isOpen={showQRModal}
          onClose={() => {
            setShowQRModal(false);
            setSelectedProducts([]);
          }}
          products={products.filter((p: any) => selectedProducts.includes(p.id))}
        />
      </div>
    </Layout>
  );
};
