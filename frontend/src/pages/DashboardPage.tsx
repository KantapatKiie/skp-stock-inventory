import { useQuery } from '@tanstack/react-query';
import { productService } from '@/services/product.service';
import { inventoryService } from '@/services/inventory.service';
import productionService from '@/services/production.service';
import { Layout } from '@/components/Layout';
import { Loading } from '@/components/Loading';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuthStore } from '@/store/authStore';

export const DashboardPage = () => {
  const { t } = useLanguage();
  const { user } = useAuthStore();
  
  // Fetch all products for total count
  const { data: productsData, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['products-dashboard'],
    queryFn: () => productService.getAll({ page: 1, limit: 1000 }),
  });

  const { data: lowStockProducts, isLoading: isLoadingLowStock } = useQuery({
    queryKey: ['lowStockProducts'],
    queryFn: () => productService.getLowStock(),
  });

  const { data: lowStockInventory, isLoading: isLoadingInventory } = useQuery({
    queryKey: ['lowStockInventory'],
    queryFn: () => inventoryService.getLowStock(),
  });

  // Fetch recent scan logs
  const { data: recentScans, isLoading: isLoadingScans } = useQuery({
    queryKey: ['recent-scans'],
    queryFn: () => productionService.getScanLogs({ limit: 10 }),
  });

  // Fetch production orders
  const { data: productionOrders, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['production-orders-dashboard'],
    queryFn: () => productionService.getProductionOrders(),
  });

  // Calculate statistics
  const totalProducts = productsData?.pagination?.total || 0;
  const lowStockCount = lowStockProducts?.length || 0;
  
  const totalValue = productsData?.products?.reduce((sum: number, product: any) => {
    const inventoryQty = product.inventory?.reduce((qty: number, inv: any) => qty + inv.quantity, 0) || 0;
    return sum + (product.price * inventoryQty);
  }, 0) || 0;

  const todayScans = recentScans?.filter((scan: any) => {
    const scanDate = new Date(scan.scannedAt);
    const today = new Date();
    return scanDate.toDateString() === today.toDateString();
  }).length || 0;

  const activeOrders = productionOrders?.filter((order: any) => 
    order.status === 'IN_PROGRESS'
  ).length || 0;

  if (isLoadingProducts || isLoadingLowStock || isLoadingInventory || isLoadingScans || isLoadingOrders) {
    return <Loading />;
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Header with Gradient */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-300 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 flex items-center gap-3">
            📈 {t('dashboard.title')}
          </h1>
          <p className="text-primary-100">{t('dashboard.welcome')}, {user?.firstName}!</p>
        </div>

        {/* Stats Cards - Enhanced */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-blue-100 text-sm font-medium mb-1">{t('dashboard.totalProducts')}</h3>
                <p className="text-4xl font-bold mb-1">
                  {totalProducts.toLocaleString()}
                </p>
                <p className="text-blue-100 text-xs">สินค้าทั้งหมดในระบบ</p>
              </div>
              <div className="text-5xl opacity-80">📦</div>
            </div>
          </div>
          
          <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-red-100 text-sm font-medium mb-1">{t('dashboard.lowStock')}</h3>
                <p className="text-4xl font-bold mb-1">
                  {lowStockCount}
                </p>
                <p className="text-red-100 text-xs">ต้องเตือนด่วน</p>
              </div>
              <div className="text-5xl opacity-80">⚠️</div>
            </div>
          </div>
          
          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-green-100 text-sm font-medium mb-1">{t('dashboard.totalValue')}</h3>
                <p className="text-3xl font-bold mb-1">
                  ฿{totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <p className="text-green-100 text-xs">มูลค่าสินค้าคงคลัง</p>
              </div>
              <div className="text-5xl opacity-80">💰</div>
            </div>
          </div>
          
          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-purple-100 text-sm font-medium mb-1">{t('dashboard.today')}</h3>
                <p className="text-4xl font-bold mb-1">
                  {todayScans}
                </p>
                <p className="text-purple-100 text-xs">การสแกนวันนี้</p>
              </div>
              <div className="text-5xl opacity-80">📷</div>
            </div>
          </div>
        </div>

        {/* Production Orders Summary - Enhanced */}
        {productionOrders && productionOrders.length > 0 && (
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                🏭 {t('nav.productionOrders') || 'Production Orders'}
              </h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                {activeOrders} กำลังดำเนินการ
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="text-center p-5 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border-2 border-yellow-200 hover:shadow-lg transition-all">
                <p className="text-sm text-gray-600 mb-2">รอดำเนินการ</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {productionOrders.filter((o: any) => o.status === 'PENDING').length}
                </p>
              </div>
              <div className="text-center p-5 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 hover:shadow-lg transition-all">
                <p className="text-sm text-gray-600 mb-2">กำลังผลิต</p>
                <p className="text-3xl font-bold text-blue-600">
                  {activeOrders}
                </p>
              </div>
              <div className="text-center p-5 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border-2 border-green-200 hover:shadow-lg transition-all">
                <p className="text-sm text-gray-600 mb-2">เสร็จสมบูรณ์</p>
                <p className="text-3xl font-bold text-green-600">
                  {productionOrders.filter((o: any) => o.status === 'COMPLETED').length}
                </p>
              </div>
              <div className="text-center p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 hover:shadow-lg transition-all">
                <p className="text-sm text-gray-600 mb-2">ทั้งหมด</p>
                <p className="text-3xl font-bold text-gray-900">
                  {productionOrders.length}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Low Stock Alert - Enhanced */}
        {lowStockInventory && lowStockInventory.length > 0 && (
          <div className="card bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-red-900 flex items-center gap-2">
                ⚠️ {t('dashboard.lowStockAlert')}
              </h2>
              <span className="px-3 py-1 bg-red-500 text-white rounded-full text-sm font-bold animate-pulse">
                {lowStockInventory.length} รายการ
              </span>
            </div>
            <div className="space-y-3">
              {lowStockInventory.slice(0, 5).map((item: any) => {
                const isCritical = item.quantity <= (item.products?.minStock || 0) * 0.5;
                return (
                  <div
                    key={item.id}
                    className={`p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all border-l-4 ${
                      isCritical ? 'border-red-500' : 'border-orange-500'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 mb-1">{item.products?.name || 'N/A'}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          🏭 {item.warehouses?.name || 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-bold ${
                          isCritical ? 'text-red-600' : 'text-orange-600'
                        }`}>
                          {item.quantity}
                        </p>
                        <p className="text-xs text-gray-500">
                          Min: {item.products?.minStock || 0}
                        </p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold ${
                          isCritical ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {isCritical ? '🚨 วิกฤต' : '⚠️ เตือน'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recent Activities - Enhanced */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              📋 {t('dashboard.recentActivities')}
            </h2>
            <span className="text-sm text-gray-500">กิจกรรมล่าสุด</span>
          </div>
          {recentScans && recentScans.length > 0 ? (
            <div className="space-y-3">
              {recentScans.slice(0, 8).map((scan: any) => (
                <div
                  key={scan.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    {scan.actionType === 'RECEIVE' && '📥'}
                    {scan.actionType === 'ISSUE' && '📤'}
                    {scan.actionType === 'RETURN' && '↩️'}
                    {scan.actionType === 'MOVE' && '🔄'}
                    {scan.actionType === 'INSPECT' && '🔍'}
                    {scan.actionType === 'COMPLETE' && '✅'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="font-semibold text-sm sm:text-base truncate">
                          {scan.product?.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-600">
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">
                            {scan.actionType}
                          </span>
                          <span>Qty: {scan.quantity}</span>
                          {scan.section && (
                            <span>📍 {scan.section.name}</span>
                          )}
                          {scan.warehouse && (
                            <span>🏢 {scan.warehouse.name}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          By {scan.scannedBy?.firstName} {scan.scannedBy?.lastName} • {new Date(scan.scannedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {scan.notes && (
                      <p className="text-xs text-gray-600 mt-2 italic">
                        💬 {scan.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm sm:text-base text-gray-600">{t('dashboard.noRecentActivities')}</p>
          )}
        </div>
      </div>
    </Layout>
  );
};
