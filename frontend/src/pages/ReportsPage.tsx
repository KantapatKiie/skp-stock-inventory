import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuthStore } from "@/store/authStore";
import { productService } from "@/services/product.service";
import { inventoryService } from "@/services/inventory.service";
import { transactionService } from "@/services/transaction.service";

export const ReportsPage = () => {
  const { t } = useLanguage();
  const { user: currentUser } = useAuthStore();
  const [reportType, setReportType] = useState<
    "stock" | "transactions" | "lowstock"
  >("stock");

  const isAdmin = currentUser?.role === "ADMIN";

  // Real data queries
  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ["products-report"],
    queryFn: () => productService.getAll({ limit: 1000 }),
    enabled: isAdmin,
  });

  const { data: inventoryData, isLoading: loadingInventory } = useQuery({
    queryKey: ["inventory-report"],
    queryFn: () => inventoryService.getAll({ limit: 1000 }),
    enabled: isAdmin,
  });

  const { data: transactionsDataRaw, isLoading: loadingTransactions } =
    useQuery({
      queryKey: ["transactions-report"],
      queryFn: () => transactionService.getAll({ limit: 1000 }),
      enabled: isAdmin,
    });

  const { data: lowStockDataRaw, isLoading: loadingLowStock } = useQuery({
    queryKey: ["lowstock-report"],
    queryFn: () => inventoryService.getLowStock(),
    enabled: isAdmin && reportType === "lowstock",
  });

  // Process data for reports
  const stockReport = useMemo(() => {
    const products = productsData?.products || [];
    const inventory = inventoryData?.inventory || [];

    const totalValue = products.reduce(
      (sum: number, p: any) => sum + Number(p.price) * Number(p.minStock || 0),
      0
    );
    const totalItems = inventory.reduce(
      (sum: number, inv: any) => sum + inv.quantity,
      0
    );

    // Group by category
    const categoryCounts: any = {};
    products.forEach((p: any) => {
      const catName = p.categories?.name || "Uncategorized";
      if (!categoryCounts[catName]) {
        categoryCounts[catName] = { count: 0, value: 0 };
      }
      categoryCounts[catName].count++;
      categoryCounts[catName].value += Number(p.price);
    });

    const categories = Object.entries(categoryCounts).map(
      ([name, data]: [string, any]) => ({
        name,
        count: data.count,
        value: data.value,
      })
    );

    // Group by warehouse
    const warehouseCounts: any = {};
    inventory.forEach((inv: any) => {
      const whName = inv.warehouses?.name || "Unknown";
      if (!warehouseCounts[whName]) {
        warehouseCounts[whName] = { items: 0, quantity: 0 };
      }
      warehouseCounts[whName].items++;
      warehouseCounts[whName].quantity += inv.quantity;
    });

    const warehouses = Object.entries(warehouseCounts).map(
      ([name, data]: [string, any]) => ({
        name,
        items: data.items,
        quantity: data.quantity,
      })
    );

    return { totalValue, totalItems, categories, warehouses };
  }, [productsData, inventoryData]);

  const transactionsReport = useMemo(() => {
    const transactions = transactionsDataRaw?.transactions || [];

    const totalTransactions = transactions.length;
    const inTransactions = transactions.filter(
      (t: any) => t.type === "IN"
    ).length;
    const outTransactions = transactions.filter(
      (t: any) => t.type === "OUT"
    ).length;
    const transferTransactions = transactions.filter(
      (t: any) => t.type === "TRANSFER"
    ).length;
    const adjustmentTransactions = transactions.filter(
      (t: any) => t.type === "ADJUSTMENT"
    ).length;

    return {
      totalTransactions,
      inTransactions,
      outTransactions,
      transferTransactions,
      adjustmentTransactions,
      recentTransactions: transactions.slice(0, 10),
    };
  }, [transactionsDataRaw]);

  const lowStockReport = useMemo(() => {
    const lowStock = lowStockDataRaw || [];
    const criticalItems = lowStock.filter(
      (item: any) => item.quantity <= (item.product?.minStock || 0) * 0.5
    );
    const warningItems = lowStock.filter(
      (item: any) =>
        item.quantity > (item.product?.minStock || 0) * 0.5 &&
        item.quantity <= (item.product?.minStock || 0)
    );

    return {
      criticalCount: criticalItems.length,
      warningCount: warningItems.length,
      items: lowStock,
    };
  }, [lowStockDataRaw]);

  if (!isAdmin) {
    return (
      <Layout>
        <div className="p-4 sm:p-6">
          <div className="card text-center py-12">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t("common.accessDenied")}
            </h2>
            <p className="text-gray-600">{t("reports.adminOnly")}</p>
          </div>
        </div>
      </Layout>
    );
  }

  const isLoading =
    loadingProducts ||
    loadingInventory ||
    loadingTransactions ||
    loadingLowStock;

  const handleExport = (format: "pdf" | "excel") => {
    alert(`Exporting as ${format.toUpperCase()}... (Feature coming soon)`);
  };

  return (
    <Layout>
      <div className="w-full mx-auto">
        {/* Header with gradient background */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-primary-600 to-primary-300 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
            <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-3">
              📊 {t("reports.title")}
            </h1>
            <p className="text-primary-100">
              {t("reports.subtitle") || "รายงานและวิเคราะห์ข้อมูลแบบละเอียด"}
            </p>
          </div>

          {/* Report Type & Export - Modern tabs style */}
          <div className="mt-6 bg-white rounded-xl shadow-md p-4">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setReportType("stock")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    reportType === "stock"
                      ? "bg-primary-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  📦 {t("reports.stockReport")}
                </button>
                <button
                  onClick={() => setReportType("transactions")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    reportType === "transactions"
                      ? "bg-primary-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  📝 {t("reports.transactionsReport")}
                </button>
                <button
                  onClick={() => setReportType("lowstock")}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    reportType === "lowstock"
                      ? "bg-primary-600 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  ⚠️ {t("reports.lowStockReport")}
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleExport("pdf")}
                  className="btn btn-secondary px-4 py-2 flex items-center gap-2"
                >
                  📄 PDF
                </button>
                <button
                  onClick={() => handleExport("excel")}
                  className="btn btn-secondary px-4 py-2 flex items-center gap-2"
                >
                  📊 Excel
                </button>
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <>
            {/* Stock Report */}
            {reportType === "stock" && (
              <div className="space-y-6">
                {/* Summary Cards - Enhanced with animations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-blue-100 text-sm font-medium mb-1">
                          {t("reports.totalValue")}
                        </div>
                        <div className="text-3xl font-bold">
                          ฿{stockReport.totalValue.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-4xl opacity-80">💰</div>
                    </div>
                  </div>
                  <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-green-100 text-sm font-medium mb-1">
                          {t("reports.totalItems")}
                        </div>
                        <div className="text-3xl font-bold">
                          {stockReport.totalItems.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-4xl opacity-80">📦</div>
                    </div>
                  </div>
                  <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-purple-100 text-sm font-medium mb-1">
                          {t("reports.categories")}
                        </div>
                        <div className="text-3xl font-bold">
                          {stockReport.categories.length}
                        </div>
                      </div>
                      <div className="text-4xl opacity-80">📁</div>
                    </div>
                  </div>
                  <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-orange-100 text-sm font-medium mb-1">
                          {t("reports.warehouses")}
                        </div>
                        <div className="text-3xl font-bold">
                          {stockReport.warehouses.length}
                        </div>
                      </div>
                      <div className="text-4xl opacity-80">🏢</div>
                    </div>
                  </div>
                </div>

                {/* Categories Table - Enhanced with visual bars */}
                <div className="card">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      📊 {t("reports.categoryDistribution")}
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {stockReport.categories.map((cat: any, index: number) => {
                      const maxValue = Math.max(
                        ...stockReport.categories.map((c: any) => c.value)
                      );
                      const percentage = (cat.value / maxValue) * 100;
                      return (
                        <div
                          key={index}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">
                                {cat.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {cat.count} {t("nav.products").toLowerCase()}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-primary-600">
                                ฿{cat.value.toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-primary-500 to-primary-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Warehouses Comparison - Card Grid */}
                <div className="card">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      🏢 {t("reports.warehouseComparison")}
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {stockReport.warehouses.map((wh: any, index: number) => {
                      const colors = [
                        "blue",
                        "green",
                        "purple",
                        "orange",
                        "red",
                        "indigo",
                      ];
                      const color = colors[index % colors.length];
                      return (
                        <div
                          key={index}
                          className={`border-2 border-${color}-200 rounded-xl p-5 bg-gradient-to-br from-${color}-50 to-white hover:shadow-lg transition-all`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <h4 className="text-lg font-bold text-gray-900">
                              {wh.name}
                            </h4>
                            <span className="text-2xl">🏢</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-xs text-gray-600 mb-1">
                                {t("reports.items")}
                              </div>
                              <div className="text-2xl font-bold text-gray-900">
                                {wh.items}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-gray-600 mb-1">
                                {t("inventory.quantity")}
                              </div>
                              <div className="text-2xl font-bold text-primary-600">
                                {wh.quantity.toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Transactions Report */}
            {reportType === "transactions" && (
              <div className="space-y-6">
                {/* Summary Cards - Enhanced */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="card bg-gradient-to-br from-gray-500 to-gray-600 text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-gray-100 text-sm font-medium mb-1">
                          {t("reports.total")}
                        </div>
                        <div className="text-3xl font-bold">
                          {transactionsReport.totalTransactions}
                        </div>
                      </div>
                      <div className="text-4xl opacity-80">📋</div>
                    </div>
                  </div>
                  <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-green-100 text-sm font-medium mb-1">
                          {t("inventory.in")}
                        </div>
                        <div className="text-3xl font-bold">
                          {transactionsReport.inTransactions}
                        </div>
                      </div>
                      <div className="text-4xl opacity-80">📥</div>
                    </div>
                  </div>
                  <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-red-100 text-sm font-medium mb-1">
                          {t("inventory.out")}
                        </div>
                        <div className="text-3xl font-bold">
                          {transactionsReport.outTransactions}
                        </div>
                      </div>
                      <div className="text-4xl opacity-80">📤</div>
                    </div>
                  </div>
                  <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-blue-100 text-sm font-medium mb-1">
                          {t("inventory.transfer")}
                        </div>
                        <div className="text-3xl font-bold">
                          {transactionsReport.transferTransactions}
                        </div>
                      </div>
                      <div className="text-4xl opacity-80">🔄</div>
                    </div>
                  </div>
                  <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-yellow-100 text-sm font-medium mb-1">
                          {t("inventory.adjustment")}
                        </div>
                        <div className="text-3xl font-bold">
                          {transactionsReport.adjustmentTransactions}
                        </div>
                      </div>
                      <div className="text-4xl opacity-80">📝</div>
                    </div>
                  </div>
                </div>

                {/* Recent Transactions - Enhanced Cards */}
                <div className="card">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      🕒 {t("reports.recentTransactions") || "รายการล่าสุด"}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {t("reports.last10") || "รายการล่าสุด 10 รายการ"}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {transactionsReport.recentTransactions.map((tx: any) => (
                      <div
                        key={tx.id}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-primary-300 transition-all"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`px-3 py-1 text-xs font-bold rounded-full ${
                                  tx.type === "IN"
                                    ? "bg-green-100 text-green-700"
                                    : tx.type === "OUT"
                                    ? "bg-red-100 text-red-700"
                                    : tx.type === "TRANSFER"
                                    ? "bg-blue-100 text-blue-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {tx.type === "IN"
                                  ? "📥"
                                  : tx.type === "OUT"
                                  ? "📤"
                                  : tx.type === "TRANSFER"
                                  ? "🔄"
                                  : "📝"}{" "}
                                {tx.type}
                              </span>
                              <span
                                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                  tx.status === "COMPLETED"
                                    ? "bg-green-100 text-green-700"
                                    : tx.status === "PENDING"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {tx.status}
                              </span>
                            </div>
                            <div className="font-semibold text-gray-900">
                              {tx.products?.name || t("products.productName")}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {t("inventory.quantity")}:{" "}
                              <span className="font-medium text-gray-700">
                                {tx.quantity}
                              </span>{" "}
                              • {new Date(tx.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Low Stock Report */}
            {reportType === "lowstock" && (
              <div className="space-y-6">
                {/* Summary Cards - Enhanced */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-red-100 text-sm font-medium mb-1">
                          {t("reports.criticalItems")}
                        </div>
                        <div className="text-4xl font-bold">
                          {lowStockReport.criticalCount}
                        </div>
                        <div className="text-red-100 text-xs mt-2">
                          ≤50% {t("products.minStock")}
                        </div>
                      </div>
                      <div className="text-5xl opacity-80">🚨</div>
                    </div>
                  </div>
                  <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-orange-100 text-sm font-medium mb-1">
                          {t("reports.warningItems")}
                        </div>
                        <div className="text-4xl font-bold">
                          {lowStockReport.warningCount}
                        </div>
                        <div className="text-orange-100 text-xs mt-2">
                          &lt; {t("products.minStock")}
                        </div>
                      </div>
                      <div className="text-5xl opacity-80">⚠️</div>
                    </div>
                  </div>
                </div>

                {/* Low Stock Items - Enhanced Cards */}
                <div className="card">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      📦 {t("reports.lowStockItems")}
                    </h3>
                    <span className="text-sm text-gray-500">
                      {lowStockReport.items.length} {t("reports.items")}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {lowStockReport.items.length === 0 ? (
                      <div className="text-center py-12 text-gray-500">
                        <div className="text-5xl mb-3">✅</div>
                        <div className="text-lg font-medium">
                          {t("reports.allStockHealthy") ||
                            "ระดับสต็อกทั้งหมดปกติดี!"}
                        </div>
                      </div>
                    ) : (
                      lowStockReport.items.map((item: any) => {
                        const isCritical =
                          item.quantity <= (item.products?.minStock || 0) * 0.5;
                        const percentage = (
                          (item.quantity / (item.products?.minStock || 1)) *
                          100
                        ).toFixed(0);
                        return (
                          <div
                            key={item.id}
                            className={`border-2 rounded-lg p-4 hover:shadow-md transition-all ${
                              isCritical
                                ? "border-red-300 bg-red-50 hover:border-red-400"
                                : "border-orange-300 bg-orange-50 hover:border-orange-400"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span
                                    className={`px-3 py-1 text-xs font-bold rounded-full ${
                                      isCritical
                                        ? "bg-red-200 text-red-800"
                                        : "bg-orange-200 text-orange-800"
                                    }`}
                                  >
                                    {isCritical
                                      ? `🚨 ${t(
                                          "reports.critical"
                                        ).toUpperCase()}`
                                      : `⚠️ ${t(
                                          "reports.warning"
                                        ).toUpperCase()}`}
                                  </span>
                                  <span className="text-xs text-gray-600">
                                    {percentage}% {t("products.minStock")}
                                  </span>
                                </div>
                                <div className="font-bold text-gray-900 text-lg">
                                  {item.products?.name ||
                                    t("products.productName")}
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                  🏢{" "}
                                  {item.warehouses?.name ||
                                    t("inventory.warehouse")}
                                </div>
                                <div className="flex items-center gap-4 mt-3">
                                  <div>
                                    <div className="text-xs text-gray-500">
                                      {t("dashboard.currentStock")}
                                    </div>
                                    <div className="text-xl font-bold text-gray-900">
                                      {item.quantity}
                                    </div>
                                  </div>
                                  <div className="text-gray-400">→</div>
                                  <div>
                                    <div className="text-xs text-gray-500">
                                      {t("products.minStock")}
                                    </div>
                                    <div className="text-xl font-bold text-primary-600">
                                      {item.products?.minStock || 0}
                                    </div>
                                  </div>
                                  <div className="text-gray-400">→</div>
                                  <div>
                                    <div className="text-xs text-gray-500">
                                      {t("reports.needToOrder") ||
                                        "ต้องสั่งเพิ่ม"}
                                    </div>
                                    <div className="text-xl font-bold text-red-600">
                                      {Math.max(
                                        0,
                                        (item.products?.minStock || 0) -
                                          item.quantity
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};
