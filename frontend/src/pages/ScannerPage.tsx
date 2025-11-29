import { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import productionService from '@/services/production.service';
import { Layout } from '@/components/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import toast from 'react-hot-toast';

type ScanActionType = 'RECEIVE' | 'ISSUE' | 'RETURN' | 'MOVE' | 'INSPECT' | 'COMPLETE';

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
  const [manualCode, setManualCode] = useState('');
  const [scannedProduct, setScannedProduct] = useState<any>(null);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<ScanActionType>('ISSUE');
  const [quantity, setQuantity] = useState(1);
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [locationCode, setLocationCode] = useState('');
  const [notes, setNotes] = useState('');
  const [geolocation, setGeolocation] = useState<{ lat: number; lng: number } | null>(null);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // Fetch production sections
  const { data: sections = [] } = useQuery({
    queryKey: ['production-sections'],
    queryFn: productionService.getSections,
  });

  // Fetch warehouses
  const { data: warehouses = [] } = useQuery({
    queryKey: ['production-warehouses'],
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
          console.log('Geolocation not available');
        }
      );
    }
  }, []);

  const findProductMutation = useMutation({
    mutationFn: (barcode: string) => productService.getByBarcode(barcode),
    onSuccess: (data) => {
      setScannedProduct(data);
      toast.success(t('scanner.productFound'));
      stopScanner();
    },
    onError: () => {
      toast.error(t('scanner.productNotFound'));
    },
  });

  const createScanLogMutation = useMutation({
    mutationFn: productionService.createScanLog,
    onSuccess: () => {
      toast.success('Scan log created successfully!');
      queryClient.invalidateQueries({ queryKey: ['scan-logs'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setShowActionModal(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create scan log');
    },
  });

  const resetForm = () => {
    setScannedProduct(null);
    setActionType('ISSUE');
    setQuantity(1);
    setSelectedSection('');
    setSelectedWarehouse('');
    setLocationCode('');
    setNotes('');
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

      const html5QrCode = new Html5Qrcode('reader');
      html5QrCodeRef.current = html5QrCode;
      
      await html5QrCode.start(
        { facingMode: 'environment' },
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
      toast.success(t('scanner.startCamera'));
    } catch (error) {
      toast.error(t('scanner.cameraError'));
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
      toast.success(t('scanner.stopCamera'));
    } catch (error) {
      console.error('Error stopping scanner:', error);
      setIsScanning(false);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      findProductMutation.mutate(manualCode.trim());
      setManualCode('');
    }
  };

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          📷 {t('scanner.title')}
        </h1>

        {/* Manual Entry */}
        <div className="card p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
            <span>⌨️</span>
            <span>{t('scanner.manualEntry')}</span>
          </h2>
          <form onSubmit={handleManualSearch} className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder={t('scanner.enterBarcode')}
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              className="input flex-1 text-base"
              autoFocus
            />
            <button 
              type="submit" 
              className="btn btn-primary w-full sm:w-auto px-6"
              disabled={findProductMutation.isPending}
            >
              {findProductMutation.isPending ? t('scanner.scanning') : t('scanner.scan')}
            </button>
          </form>
        </div>

        {/* Camera Scanner */}
        <div className="card p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 flex items-center gap-2">
            <span>📸</span>
            <span>{t('scanner.scanBarcode')}</span>
          </h2>
          <div className="space-y-4">
            <div 
              id="reader" 
              className="w-full mx-auto rounded-lg overflow-hidden bg-gray-100"
            ></div>
            
            {!isScanning ? (
              <button 
                onClick={startScanner} 
                className="btn btn-primary w-full text-base sm:text-lg py-3 sm:py-4 flex items-center justify-center gap-2"
              >
                <span>📷</span>
                <span>{t('scanner.startCamera')}</span>
              </button>
            ) : (
              <button
                onClick={stopScanner}
                className="btn bg-red-600 hover:bg-red-700 text-white w-full text-base sm:text-lg py-3 sm:py-4 flex items-center justify-center gap-2"
              >
                <span>⏹️</span>
                <span>{t('scanner.stopCamera')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Scanned Product */}
        {scannedProduct && (
          <div className="card bg-green-50 border-2 border-green-300 p-4 sm:p-6 animate-fadeIn">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">✅</span>
              <h2 className="text-lg sm:text-xl font-bold text-green-900">
                {t('scanner.productFound')}
              </h2>
            </div>

            {/* Product Image Placeholder */}
            <div className="mb-4">
              <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-6xl">📦</span>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div>
                <p className="text-sm text-gray-600">{t('products.productName')}</p>
                <p className="font-bold text-lg sm:text-xl text-gray-900">
                  {scannedProduct.name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">{t('products.sku')}</p>
                  <p className="font-medium text-sm sm:text-base">{scannedProduct.sku}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">{t('products.barcode')}</p>
                  <p className="font-medium text-sm sm:text-base">{scannedProduct.barcode || '-'}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">{t('products.category')}</p>
                  <p className="font-medium text-sm sm:text-base">
                    {scannedProduct.category?.name || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">{t('products.unit')}</p>
                  <p className="font-medium text-sm sm:text-base">{scannedProduct.unit}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">{t('products.price')}</p>
                  <p className="font-bold text-base sm:text-lg text-green-700">
                    ฿{scannedProduct.price.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600">{t('products.cost')}</p>
                  <p className="font-medium text-sm sm:text-base">
                    ฿{scannedProduct.cost.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Stock Info */}
              {scannedProduct.inventory && scannedProduct.inventory.length > 0 && (
                <div className="bg-white rounded-lg p-3 sm:p-4">
                  <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">
                    {t('scanner.stockInformation')}
                  </p>
                  <div className="space-y-2">
                    {scannedProduct.inventory.map((inv: any) => (
                      <div key={inv.id} className="flex justify-between text-sm">
                        <span className="text-gray-600">{inv.warehouse?.name}</span>
                        <span className="font-bold">{inv.quantity} {scannedProduct.unit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button 
                onClick={() => setShowActionModal(true)}
                className="btn btn-primary flex-1 py-3 text-base font-semibold"
              >
                📝 {t('scanner.updateStock')}
              </button>
              <button 
                onClick={() => setScannedProduct(null)}
                className="btn btn-secondary flex-1 py-3 text-base font-semibold"
              >
                🔄 {t('scanner.clearAndScanAgain')}
              </button>
            </div>
          </div>
        )}

        {/* Action Modal */}
        {showActionModal && scannedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">📦 Record Scan Action</h2>
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
                  <p className="text-sm text-gray-600">SKU: {scannedProduct.sku}</p>
                </div>

                {/* Action Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Action Type *
                  </label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value as ScanActionType)}
                    className="input w-full"
                  >
                    <option value="RECEIVE">📥 RECEIVE - Receive raw materials/products</option>
                    <option value="ISSUE">📤 ISSUE - Issue for production/use</option>
                    <option value="RETURN">↩️ RETURN - Return to warehouse</option>
                    <option value="MOVE">🔄 MOVE - Move between sections</option>
                    <option value="INSPECT">🔍 INSPECT - Quality inspection</option>
                    <option value="COMPLETE">✅ COMPLETE - Complete production</option>
                  </select>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity *
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
                    Production Section
                  </label>
                  <select
                    value={selectedSection}
                    onChange={(e) => setSelectedSection(e.target.value)}
                    className="input w-full"
                  >
                    <option value="">-- Select Section --</option>
                    {sections.map((section) => (
                      <option key={section.id} value={section.id}>
                        {section.code} - {section.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Warehouse */}
                {(actionType === 'RECEIVE' || actionType === 'ISSUE' || actionType === 'RETURN') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Warehouse {(actionType === 'RECEIVE' || actionType === 'ISSUE' || actionType === 'RETURN') && '*'}
                    </label>
                    <select
                      value={selectedWarehouse}
                      onChange={(e) => setSelectedWarehouse(e.target.value)}
                      className="input w-full"
                      required={actionType === 'RECEIVE' || actionType === 'ISSUE' || actionType === 'RETURN'}
                    >
                      <option value="">-- Select Warehouse --</option>
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
                    Location Code (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., A-01-03"
                    value={locationCode}
                    onChange={(e) => setLocationCode(e.target.value)}
                    className="input w-full"
                  />
                </div>

                {/* GPS Location */}
                {geolocation && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-1">📍 GPS Location</p>
                    <p className="text-xs text-gray-600">
                      Lat: {geolocation.lat.toFixed(6)}, Lng: {geolocation.lng.toFixed(6)}
                    </p>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="input w-full"
                    rows={3}
                    placeholder="Additional notes..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowActionModal(false)}
                    className="btn btn-secondary flex-1"
                    disabled={createScanLogMutation.isPending}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitScan}
                    className="btn btn-primary flex-1"
                    disabled={
                      createScanLogMutation.isPending ||
                      !quantity ||
                      ((actionType === 'RECEIVE' || actionType === 'ISSUE' || actionType === 'RETURN') && !selectedWarehouse)
                    }
                  >
                    {createScanLogMutation.isPending ? 'Saving...' : '✅ Submit'}
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
