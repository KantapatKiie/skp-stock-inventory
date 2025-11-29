import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import { Layout } from "@/components/Layout";
import { Loading } from "@/components/Loading";
import { useLanguage } from "@/contexts/LanguageContext";
import toast from "react-hot-toast";

export const ProductsPage = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
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
    queryFn: () => productService.getAll({ search, page, limit: 10 }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/categories`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.json();
    },
  });

  const categories = categoriesData?.data || [];

  const createMutation = useMutation({
    mutationFn: (data: any) => productService.create(data),
    onSuccess: () => {
      toast.success(t("common.createSuccess"));
      queryClient.invalidateQueries({ queryKey: ["products"] });
      resetForm();
      setShowModal(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t("common.error"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      productService.update(id, data),
    onSuccess: () => {
      toast.success(t("common.updateSuccess"));
      queryClient.invalidateQueries({ queryKey: ["products"] });
      resetForm();
      setShowModal(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t("common.error"));
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => productService.delete(id),
    onSuccess: () => {
      toast.success(t("common.deleteSuccess"));
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t("common.error"));
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

  const handleDelete = (id: string) => {
    if (window.confirm(t("products.confirmDelete"))) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  console.log("Products data:", data);
  console.log("Products array:", data?.products);
  console.log("Products length:", data?.products?.length);

  const products = data?.products || [];

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {t("products.title")}
          </h1>
          <button
            onClick={handleAdd}
            className="btn btn-primary w-full sm:w-auto"
          >
            + {t("products.addProduct")}
          </button>
        </div>

        {/* Search */}
        <div className="card p-4 sm:p-6">
          <input
            type="text"
            placeholder={t("common.search") + "..."}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
          />
        </div>

        {/* Products Table - Desktop */}
        <div className="hidden md:block card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
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
                    <tr key={product.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {product.sku}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {product.category?.name || "-"}
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
                          {product.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-primary-600 hover:text-primary-900 mr-3"
                        >
                          {t("common.edit")}
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          {t("common.delete")}
                        </button>
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
                Page {data.pagination.page} of {data.pagination.pages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="btn btn-secondary text-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === data.pagination.pages}
                  className="btn btn-secondary text-sm"
                >
                  Next
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
              <div key={product.id} className="card p-4 space-y-3">
                <div className="flex justify-between items-start">
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
                    {product.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600 text-xs">Category</p>
                    <p className="font-medium">
                      {product.category?.name || "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs">Stock</p>
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
                    <p className="text-gray-600 text-xs">Price</p>
                    <p className="font-medium">
                      ฿{product.price.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-200">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 btn btn-primary text-sm py-2"
                  >
                    {t("common.edit")}
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex-1 btn bg-red-600 hover:bg-red-700 text-white text-sm py-2"
                  >
                    {t("common.delete")}
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
                Page {data.pagination.page} of {data.pagination.pages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="flex-1 btn btn-secondary text-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === data.pagination.pages}
                  className="flex-1 btn btn-secondary text-sm"
                >
                  Next
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
                    </label>
                    <input
                      type="text"
                      value={formData.barcode}
                      onChange={(e) =>
                        setFormData({ ...formData, barcode: e.target.value })
                      }
                      className="input"
                    />
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
                      <option value="piece">Piece</option>
                      <option value="box">Box</option>
                      <option value="set">Set</option>
                      <option value="ream">Ream</option>
                      <option value="pack">Pack</option>
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
      </div>
    </Layout>
  );
};
