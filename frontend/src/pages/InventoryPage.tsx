import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { inventoryService } from "@/services/inventory.service";
import { productService } from "@/services/product.service";
import productionService from "@/services/production.service";
import Swal from "sweetalert2";
import { useLanguage } from "@/contexts/LanguageContext";

export const InventoryPage = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [quantity, setQuantity] = useState("");
  const [type, setType] = useState<"IN" | "OUT" | "ADJUSTMENT">("IN");
  const [notes, setNotes] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch inventory data
  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ["inventory-list"],
    queryFn: () => inventoryService.getAll({ limit: 1000 }),
  });

  // Fetch products
  const { data: productsData } = useQuery({
    queryKey: ["products-inventory"],
    queryFn: () => productService.getAll({ limit: 1000 }),
  });

  // Fetch warehouses
  const { data: warehouses = [] } = useQuery({
    queryKey: ["warehouses-inventory"],
    queryFn: productionService.getWarehouses,
  });

  // Adjust stock mutation
  const adjustMutation = useMutation({
    mutationFn: (data: any) => inventoryService.adjustStock(data),
    onSuccess: () => {
      Swal.fire({
        icon: 'success',
        title: 'Stock adjusted successfully!',
        showConfirmButton: false,
        timer: 1500
      });
      queryClient.invalidateQueries({ queryKey: ["inventory-list"] });
      queryClient.invalidateQueries({ queryKey: ["products-inventory"] });
      resetForm();
      setShowModal(false);
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || "Failed to adjust stock"
      });
    },
  });

  const resetForm = () => {
    setSelectedProduct("");
    setWarehouse("");
    setQuantity("");
    setType("IN");
    setNotes("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedProduct || !warehouse || !quantity) {
      Swal.fire({
        icon: 'error',
        title: t("common.fillRequired")
      });
      return;
    }

    adjustMutation.mutate({
      productId: selectedProduct,
      warehouseId: warehouse,
      quantity: parseInt(quantity),
      type,
      notes,
    });
  };

  const products = productsData?.products || [];
  const inventoryList = inventoryData?.inventory || [];
  // Filter inventory by search term
  const filteredInventory = inventoryList.filter((inv: any) => {
    const searchLower = searchTerm.toLowerCase();
    if (!searchLower) return true;
    return (
      inv.products?.name?.toLowerCase().includes(searchLower) ||
      inv.products?.sku?.toLowerCase().includes(searchLower) ||
      inv.warehouses?.name?.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            📦 {t("inventory.title")}
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="w-full sm:w-auto btn btn-primary"
          >
            ➕ {t("inventory.adjustStock")}
          </button>
        </div>

        {/* Search */}
        <div className="card p-4">
          <input
            type="text"
            placeholder={t("inventory.searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input w-full"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="card p-4">
            <h3 className="text-sm text-gray-600">{t("inventory.totalItems")}</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">
              {inventoryList.length}
            </p>
          </div>
          <div className="card p-4">
            <h3 className="text-sm text-gray-600">{t("inventory.totalQuantity")}</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {inventoryList
                .reduce((sum: number, inv: any) => sum + (inv.quantity || 0), 0)
                .toLocaleString()}
            </p>
          </div>
          <div className="card p-4">
            <h3 className="text-sm text-gray-600">{t("inventory.available")}</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {inventoryList
                .reduce(
                  (sum: number, inv: any) => sum + (inv.availableQty || 0),
                  0
                )
                .toLocaleString()}
            </p>
          </div>
        </div>

        {/* Inventory List */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t("products.productName")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t("products.sku")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t("inventory.warehouse")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t("inventory.quantity")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t("inventory.available")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t("inventory.reserved")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t("products.minStock")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t("reports.status")}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t("common.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-12 text-center text-gray-500"
                    >
                      {t("inventory.noRecords")}
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((inv: any) => {
                    const isLowStock =
                      inv.quantity <= (inv.products?.minStock || 0);
                    return (
                      <tr key={inv.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {inv.products?.name || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {inv.products?.sku || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                            {inv.warehouses?.name || "N/A"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold">
                          {inv.quantity || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-green-600 font-semibold">
                          {inv.availableQty || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-orange-600">
                          {inv.reservedQty || 0}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {inv.products?.minStock || 0}
                        </td>
                        <td className="px-6 py-4">
                          {isLowStock ? (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-semibold">
                              ⚠️ {t("inventory.lowStock")}
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                              ✅ {t("inventory.normal")}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedProduct(inv.productId);
                                setWarehouse(inv.warehouseId);
                                setType("IN");
                                setQuantity("10");
                                setShowModal(true);
                              }}
                              className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-xs font-medium transition-colors"
                              title={t("scanner.addStock")}
                            >
                              ➕ {t("scanner.addStock")}
                            </button>
                            <button
                              onClick={() => {
                                setSelectedProduct(inv.productId);
                                setWarehouse(inv.warehouseId);
                                setType("OUT");
                                setQuantity("10");
                                setShowModal(true);
                              }}
                              className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-medium transition-colors"
                              title={t("scanner.removeStock")}
                            >
                              ➖ {t("scanner.removeStock")}
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
        </div>

        {/* Adjust Stock Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold mb-4">
                📝 {t("inventory.adjustStock")}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("products.productName")}
                  </label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="input"
                    required
                  >
                    <option value="">{t("common.select")}</option>
                    {products.map((product: any) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("inventory.warehouse")}
                  </label>
                  <select
                    value={warehouse}
                    onChange={(e) => setWarehouse(e.target.value)}
                    className="input"
                    required
                  >
                    <option value="">{t("common.select")}</option>
                    {warehouses.map((wh: any) => (
                      <option key={wh.id} value={wh.id}>
                        {wh.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("inventory.transactionType")}
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="input"
                  >
                    <option value="IN">📥 {t("inventory.in")} - {t("inventory.receiveStock")}</option>
                    <option value="OUT">📤 {t("inventory.out")} - {t("inventory.issueStock")}</option>
                    <option value="ADJUSTMENT">
                      📝 {t("inventory.adjustment")} - {t("inventory.adjustQuantity")}
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("inventory.quantity")}
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="input"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t("inventory.notes")}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="input"
                    rows={3}
                  />
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
                    disabled={adjustMutation.isPending}
                    className="flex-1 btn btn-primary"
                  >
                    {adjustMutation.isPending
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
