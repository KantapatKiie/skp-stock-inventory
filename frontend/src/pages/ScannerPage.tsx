import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/product.service";
import productionService from "@/services/production.service";
import { Layout } from "@/components/Layout";
import { useLanguage } from "@/contexts/LanguageContext";
import Swal from "sweetalert2";

type ScanActionType =
  | "RECEIVE"
  | "ISSUE"
  | "RETURN"
  | "MOVE"
  | "INSPECT"
  | "COMPLETE";

interface ProductionSection {
  id: string;
  code: string;
  name: string;
  sequence: number;
}

export const ScannerPage = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [scannedProduct, setScannedProduct] = useState<any>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<ScanActionType>("ISSUE");
  const [quantity, setQuantity] = useState(1);
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [locationCode, setLocationCode] = useState("");
  const [notes, setNotes] = useState("");
  const [geolocation, setGeolocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // Fetch production sections
  const { data: sections = [] } = useQuery({
    queryKey: ["production-sections"],
    queryFn: productionService.getSections,
  });

  // Fetch warehouses
  const { data: warehouses = [] } = useQuery({
    queryKey: ["production-warehouses"],
    queryFn: productionService.getWarehouses,
  });

  // Get geolocation when component mounts
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGeolocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          console.log("Geolocation not available");
        }
      );
    }
  }, []);

  const findProductMutation = useMutation({
    mutationFn: (barcode: string) => productService.getByBarcode(barcode),
    onSuccess: (data) => {
      setScannedProduct(data);
      Swal.fire({
        icon: 'success',
        title: t("scanner.productFound"),
        showConfirmButton: false,
        timer: 1500
      });
      stopScanner();
    },
    onError: () => {
      Swal.fire({
        icon: 'error',
        title: t("scanner.productNotFound")
      });
    },
  });

  const createScanLogMutation = useMutation({
    mutationFn: productionService.createScanLog,
    onSuccess: () => {
      Swal.fire({
        icon: 'success',
        title: 'Scan log created successfully!',
        showConfirmButton: false,
        timer: 1500
      });
      queryClient.invalidateQueries({ queryKey: ["scan-logs"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setShowActionModal(false);
      resetForm();
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || "Failed to create scan log"
      });
    },
  });

  const resetForm = () => {
    setScannedProduct(null);
    setActionType("ISSUE");
    setQuantity(1);
    setSelectedSection("");
    setSelectedWarehouse("");
    setLocationCode("");
    setNotes("");
  };

  const handleSubmitScan = () => {
    if (!scannedProduct) return;

    createScanLogMutation.mutate({
      productId: scannedProduct.id,
      actionType,
      quantity,
      locationCode: locationCode || undefined,
      locationName: selectedSection
        ? sections.find((s) => s.id === selectedSection)?.name
        : undefined,
      sectionId: selectedSection || undefined,
      warehouseId: selectedWarehouse || undefined,
      latitude: geolocation?.lat,
      longitude: geolocation?.lng,
      notes: notes || undefined,
    });
  };

  useEffect(() => {
    // Cleanup when component unmounts
    return () => {
      if (html5QrCodeRef.current && isScanning) {
        html5QrCodeRef.current.stop().catch(console.error);
      }
    };
  }, [isScanning]);

  const startScanner = async () => {
    try {
      if (html5QrCodeRef.current) {
        await html5QrCodeRef.current.stop();
      }

      const html5QrCode = new Html5Qrcode("reader");
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          findProductMutation.mutate(decodedText);
        },
        () => {
          // Error callback - silent
        }
      );

      setIsScanning(true);
      Swal.fire({
        icon: 'success',
        title: t("scanner.startCamera"),
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: t("scanner.cameraError")
      });
      console.error(error);
      setIsScanning(false);
    }
  };

  const stopScanner = async () => {
    try {
      if (html5QrCodeRef.current) {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      }
      setIsScanning(false);
    } catch (error) {
      console.error("Error stopping scanner:", error);
      setIsScanning(false);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      findProductMutation.mutate(manualCode.trim());
      setManualCode("");
    }
  };

  return (
    <Layout>
      <div className="space-y-3 sm:space-y-6 max-w-6xl mx-auto px-2 sm:px-0">
        {/* Header with Gradient */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-8 text-white">
          <h1 className="text-2xl sm:text-4xl font-bold flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
            <span className="text-3xl sm:text-4xl">📷</span>
            <span>{t("scanner.title")}</span>
          </h1>
          <p className="text-purple-100 text-xs sm:text-base">
            สแกนบาร์โค้ดหรือค้นหาสินค้าเพื่อดูข้อมูลและอัพเดทสต็อก
          </p>
        </div>

        {/* Manual Entry */}
        <div className="card p-4 sm:p-8 shadow-lg hover:shadow-xl transition-shadow">
          <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-6 flex items-center gap-2 sm:gap-3 text-gray-800">
            <span className="text-2xl sm:text-3xl">⌨️</span>
            <span>{t("scanner.manualEntry")}</span>
          </h2>
          <form
            onSubmit={handleManualSearch}
            className="flex flex-col sm:flex-row gap-2 sm:gap-3"
          >
            <input
              type="text"
              placeholder={t("scanner.enterBarcode")}
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="input flex-1 text-base sm:text-lg px-4 sm:px-6 py-3 sm:py-4 border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg"
              autoFocus
            />
            <button
              type="submit"
              className="btn btn-primary w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-md hover:shadow-lg active:scale-95 sm:hover:-translate-y-0.5 transition-all text-center flex items-center justify-center gap-2"
              disabled={findProductMutation.isPending}
            >
              {findProductMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">🔄</span>
                  {t("scanner.scanning")}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <span>🔍</span>
                  {t("scanner.scan")}
                </span>
              )}
            </button>
          </form>
        </div>

        {/* Camera Scanner */}
        <div className="card p-4 sm:p-8 shadow-lg hover:shadow-xl transition-shadow">
          <h2 className="text-lg sm:text-2xl font-bold mb-3 sm:mb-6 flex items-center gap-2 sm:gap-3 text-gray-800">
            <span className="text-2xl sm:text-3xl">📸</span>
            <span>{t("scanner.scanBarcode")}</span>
          </h2>
          <div className="space-y-3 sm:space-y-4">
            <div
              id="reader"
              className="w-full mx-auto rounded-lg sm:rounded-xl overflow-hidden bg-gray-100 border-2 sm:border-4 border-gray-200"
            ></div>

            {!isScanning ? (
              <button
                onClick={startScanner}
                className="btn btn-primary w-full text-base sm:text-xl py-4 sm:py-5 flex items-center justify-center gap-2 sm:gap-3 shadow-md hover:shadow-lg active:scale-95 sm:hover:-translate-y-0.5 transition-all"
              >
                <span className="text-xl sm:text-2xl">📷</span>
                <span className="font-semibold">
                  {t("scanner.startCamera")}
                </span>
              </button>
            ) : (
              <button
                onClick={stopScanner}
                className="btn bg-red-600 hover:bg-red-700 text-white w-full text-base sm:text-xl py-4 sm:py-5 flex items-center justify-center gap-2 sm:gap-3 shadow-md hover:shadow-lg active:scale-95 sm:hover:-translate-y-0.5 transition-all"
              >
                <span className="text-xl sm:text-2xl">⏹️</span>
                <span className="font-semibold">{t("scanner.stopCamera")}</span>
              </button>
            )}
          </div>
        </div>

        {/* Scanned Product */}
        {scannedProduct && (
          <div className="card bg-gradient-to-br from-green-50 to-emerald-50 border-2 sm:border-4 border-green-400 p-4 sm:p-8 animate-fadeIn shadow-2xl">
            {/* Header */}
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b-2 border-green-300">
              <span className="text-3xl sm:text-4xl animate-pulse">✅</span>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg sm:text-2xl font-bold text-green-900 mb-1 truncate">
                  {t("scanner.productFound")}
                </h2>
                <p className="text-green-700 font-medium text-xs sm:text-base truncate">
                  {scannedProduct.sku} • {scannedProduct.name}
                </p>
              </div>
            </div>

            {/* Product Image Placeholder */}
            <div className="mb-4 sm:mb-6">
              <div className="w-full h-48 sm:h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg sm:rounded-xl flex items-center justify-center shadow-inner border-2 sm:border-4 border-white">
                <span className="text-7xl sm:text-9xl">📦</span>
              </div>
            </div>

            {/* Product Name */}
            <div className="mb-4 sm:mb-6 bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md">
              <p className="text-xs sm:text-sm text-gray-500 mb-1">
                {t("products.productName")}
              </p>
              <p className="font-bold text-xl sm:text-3xl text-gray-900 break-words">
                {scannedProduct.name}
              </p>
              {scannedProduct.description && (
                <p className="text-xs sm:text-sm text-gray-600 mt-2">
                  {scannedProduct.description}
                </p>
              )}
            </div>

            {/* Product Details Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
              {/* SKU */}
              <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md active:shadow-lg transition-shadow">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <span className="text-sm">🏷️</span>
                  {t("products.sku")}
                </p>
                <p className="font-bold text-base sm:text-lg text-gray-900 truncate">
                  {scannedProduct.sku}
                </p>
              </div>

              {/* Barcode */}
              <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md active:shadow-lg transition-shadow">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <span className="text-sm">📊</span>
                  {t("products.barcode")}
                </p>
                <p className="font-bold text-base sm:text-lg text-gray-900 truncate">
                  {scannedProduct.barcode || "-"}
                </p>
              </div>

              {/* Category */}
              <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md active:shadow-lg transition-shadow">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <span className="text-sm">📂</span>
                  {t("products.category")}
                </p>
                <p className="font-bold text-base sm:text-lg text-gray-900 truncate">
                  {scannedProduct.category?.name ||
                    scannedProduct.category ||
                    "-"}
                </p>
              </div>

              {/* Unit */}
              <div className="bg-white rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md active:shadow-lg transition-shadow">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                  <span className="text-sm">📏</span>
                  {t("products.unit")}
                </p>
                <p className="font-bold text-base sm:text-lg text-gray-900 truncate">
                  {scannedProduct.unit}
                </p>
              </div>

              {/* Price */}
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md active:shadow-lg transition-shadow text-white">
                <p className="text-xs text-green-100 mb-1 flex items-center gap-1">
                  <span className="text-sm">💰</span>
                  {t("products.price")}
                </p>
                <p className="font-bold text-xl sm:text-2xl truncate">
                  ฿{scannedProduct.price?.toLocaleString() || "0"}
                </p>
              </div>

              {/* Cost */}
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg sm:rounded-xl p-3 sm:p-4 shadow-md active:shadow-lg transition-shadow text-white">
                <p className="text-xs text-blue-100 mb-1 flex items-center gap-1">
                  <span className="text-sm">💵</span>
                  {t("products.cost")}
                </p>
                <p className="font-bold text-xl sm:text-2xl truncate">
                  ฿{scannedProduct.cost?.toLocaleString() || "0"}
                </p>
              </div>
            </div>

            {/* Stock Information */}
            {scannedProduct.inventory &&
              scannedProduct.inventory.length > 0 && (
                <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 shadow-lg mb-4 sm:mb-6">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <span className="text-xl sm:text-2xl">📦</span>
                    <h3 className="text-base sm:text-lg font-bold text-gray-800">
                      {t("scanner.stockInformation")}
                    </h3>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    {scannedProduct.inventory.map((inv: any) => {
                      const stockPercentage = scannedProduct.maxStock
                        ? (inv.quantity / scannedProduct.maxStock) * 100
                        : 0;
                      const isLowStock =
                        scannedProduct.minStock &&
                        inv.quantity <= scannedProduct.minStock;

                      return (
                        <div
                          key={inv.id}
                          className="bg-gray-50 rounded-lg p-3 sm:p-4 border-l-4 border-blue-500"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1 min-w-0 mr-2">
                              <p className="font-semibold text-sm sm:text-base text-gray-800 flex items-center gap-1 sm:gap-2 truncate">
                                <span className="text-sm sm:text-base">🏢</span>
                                <span className="truncate">{"Warehouse"}</span>
                              </p>
                              {inv.location && (
                                <p className="text-xs text-gray-500 mt-1 truncate">
                                  📍 {inv.location}
                                </p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p
                                className={`font-bold text-xl sm:text-2xl ${
                                  isLowStock
                                    ? "text-red-600 animate-pulse"
                                    : "text-green-600"
                                }`}
                              >
                                {inv.quantity}
                              </p>
                              <p className="text-xs text-gray-500">
                                {scannedProduct.unit}
                              </p>
                            </div>
                          </div>

                          {/* Stock Level Progress Bar */}
                          {scannedProduct.maxStock && (
                            <div className="mt-3">
                              <div className="flex justify-between text-xs text-gray-600 mb-1">
                                <span>Min: {scannedProduct.minStock || 0}</span>
                                <span>Max: {scannedProduct.maxStock}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    isLowStock
                                      ? "bg-gradient-to-r from-red-500 to-red-600"
                                      : stockPercentage > 80
                                      ? "bg-gradient-to-r from-green-500 to-emerald-600"
                                      : "bg-gradient-to-r from-yellow-500 to-orange-600"
                                  }`}
                                  style={{
                                    width: `${Math.min(stockPercentage, 100)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {isLowStock && (
                            <div className="mt-2 bg-red-50 border border-red-200 rounded px-3 py-2">
                              <p className="text-xs text-red-700 font-medium flex items-center gap-1">
                                <span>⚠️</span>
                                สต็อกต่ำกว่าระดับขั้นต่ำ - ควรสั่งซื้อเพิ่ม
                              </p>
                            </div>
                          )}

                          {inv.lastUpdated && (
                            <p className="text-xs text-gray-400 mt-2">
                              🕒 อัพเดทล่าสุด:{" "}
                              {new Date(inv.lastUpdated).toLocaleString(
                                "th-TH"
                              )}
                            </p>
                          )}
                        </div>
                      );
                    })}

                    {/* Total Stock Summary */}
                    <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4 border-2 border-purple-300">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-700 flex items-center gap-2">
                          <span className="text-xl">📊</span>
                          สต็อกรวมทั้งหมด
                        </span>
                        <span className="font-bold text-3xl text-purple-700">
                          {scannedProduct.inventory.reduce(
                            (sum: number, inv: any) => sum + inv.quantity,
                            0
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {/* No Stock Warning */}
            {(!scannedProduct.inventory ||
              scannedProduct.inventory.length === 0) && (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-5 mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">⚠️</span>
                  <div>
                    <p className="font-bold text-yellow-900 text-lg">
                      ไม่พบข้อมูลสต็อก
                    </p>
                    <p className="text-yellow-700 text-sm">
                      สินค้านี้ยังไม่มีในคลังสินค้า
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <button
                onClick={() => setShowActionModal(true)}
                className="btn btn-primary flex-1 py-3 sm:py-4 text-base sm:text-lg font-bold shadow-lg active:shadow-xl active:scale-95 sm:hover:shadow-xl sm:hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                <span className="text-lg sm:text-xl">📝</span>
                <span>{t("scanner.updateStock")}</span>
              </button>
              <button
                onClick={() => setScannedProduct(null)}
                className="btn btn-secondary flex-1 py-3 sm:py-4 text-base sm:text-lg font-bold shadow-lg active:shadow-xl active:scale-95 sm:hover:shadow-xl sm:hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
              >
                <span className="text-lg sm:text-xl">🔄</span>
                <span>{t("scanner.clearAndScanAgain")}</span>
              </button>
            </div>
          </div>
        )}

        {/* Action Modal */}
        {showActionModal && scannedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-3 sm:p-4 z-50">
            <div className="bg-white rounded-lg p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">📦 {t("scanner.recordScanAction")}</h2>
                <button
                  onClick={() => setShowActionModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Product Info */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="font-semibold text-lg">{scannedProduct.name}</p>
                  <p className="text-sm text-gray-600">
                    {t("products.sku")}: {scannedProduct.sku}
                  </p>
                </div>

                {/* Action Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("scanner.actionTypeRequired")}
                  </label>
                  <select
                    value={actionType}
                    onChange={(e) =>
                      setActionType(e.target.value as ScanActionType)
                    }
                    className="input w-full"
                  >
                    <option value="RECEIVE">
                      📥 {t("scanner.receive").toUpperCase()} - {t("scanner.receiveDesc")}
                    </option>
                    <option value="ISSUE">
                      📤 {t("scanner.issue").toUpperCase()} - {t("scanner.issueDesc")}
                    </option>
                    <option value="RETURN">
                      ↩️ {t("scanner.return").toUpperCase()} - {t("scanner.returnDesc")}
                    </option>
                    <option value="MOVE">
                      🔄 {t("scanner.move").toUpperCase()} - {t("scanner.moveDesc")}
                    </option>
                    <option value="INSPECT">
                      🔍 {t("scanner.inspect").toUpperCase()} - {t("scanner.inspectDesc")}
                    </option>
                    <option value="COMPLETE">
                      ✅ {t("scanner.complete").toUpperCase()} - {t("scanner.completeDesc")}
                    </option>
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("scanner.quantityRequired")}
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="input w-full"
                  />
                </div>

                {/* Production Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("scanner.productionSection")}
                  </label>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="input w-full"
                  >
                    <option value="">{t("scanner.selectSection")}</option>
                    {sections.map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.code} - {section.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Warehouse */}
                {(actionType === "RECEIVE" ||
                  actionType === "ISSUE" ||
                  actionType === "RETURN") && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t("scanner.warehouseRequired")}
                    </label>
                    <select
                      value={selectedWarehouse}
                      onChange={(e) => setSelectedWarehouse(e.target.value)}
                      className="input w-full"
                      required={
                        actionType === "RECEIVE" ||
                        actionType === "ISSUE" ||
                        actionType === "RETURN"
                      }
                    >
                      <option value="">{t("scanner.selectWarehouseOption")}</option>
                      {warehouses.map((warehouse: any) => (
                        <option key={warehouse.id} value={warehouse.id}>
                          {warehouse.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Location Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("scanner.locationCode")}
                  </label>
                  <input
                    type="text"
                    placeholder={t("scanner.locationCodePlaceholder")}
                    value={locationCode}
                    onChange={(e) => setLocationCode(e.target.value)}
                    className="input w-full"
                  />
                </div>

                {/* GPS Location */}
                {geolocation && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      📍 {t("scanner.gpsLocation")}
                    </p>
                    <p className="text-xs text-gray-600">
                      Lat: {geolocation.lat.toFixed(6)}, Lng:{" "}
                      {geolocation.lng.toFixed(6)}
                    </p>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t("scanner.notesLabel")}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="input w-full"
                    rows={3}
                    placeholder={t("scanner.notesPlaceholder")}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowActionModal(false)}
                    className="btn btn-secondary flex-1"
                    disabled={createScanLogMutation.isPending}
                  >
                    {t("common.cancel")}
                  </button>
                  <button
                    onClick={handleSubmitScan}
                    className="btn btn-primary flex-1"
                    disabled={
                      createScanLogMutation.isPending ||
                      !quantity ||
                      ((actionType === "RECEIVE" ||
                        actionType === "ISSUE" ||
                        actionType === "RETURN") &&
                        !selectedWarehouse)
                    }
                  >
                    {createScanLogMutation.isPending
                      ? t("scanner.saving")
                      : `✅ ${t("scanner.submitAction")}`}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
