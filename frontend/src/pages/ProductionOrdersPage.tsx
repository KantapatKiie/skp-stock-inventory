import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import productionService, { ProductionOrder } from '@/services/production.service';
import { productService } from '@/services/product.service';
import Swal from 'sweetalert2';

export const ProductionOrdersPage = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const getTodayDate = () => new Date().toISOString().split('T')[0];
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>(getTodayDate());
  const [dateTo, setDateTo] = useState<string>(getTodayDate());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [showProcessesModal, setShowProcessesModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<ProductionOrder | null>(null);
  const [formData, setFormData] = useState({
    productId: '',
    targetQuantity: 0,
    dueDate: '',
    notes: '',
  });

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['production-orders', selectedStatus, dateFrom, dateTo],
    queryFn: () => productionService.getProductionOrders(selectedStatus || undefined, dateFrom, dateTo),
  });

  const { data: productsData } = useQuery({
    queryKey: ['products-for-orders'],
    queryFn: () => productService.getAll({ page: 1, limit: 1000 }),
    enabled: showCreateModal,
  });

  const { data: sections = [] } = useQuery({
    queryKey: ['production-sections'],
    queryFn: () => productionService.getSections(),
  });

  const createOrderMutation = useMutation({
    mutationFn: productionService.createProductionOrder,
    onSuccess: () => {
      Swal.fire({
        icon: 'success',
        title: t('production.createSuccess'),
        showConfirmButton: false,
        timer: 1500
      });
      queryClient.invalidateQueries({ queryKey: ['production-orders'] });
      setShowCreateModal(false);
      setFormData({ productId: '', targetQuantity: 0, dueDate: '', notes: '' });
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || t('production.createFailed')
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status, completedQuantity }: { orderId: string; status: string; completedQuantity?: number }) =>
      productionService.updateOrderStatus(orderId, { status: status as any, completedQuantity }),
    onSuccess: () => {
      Swal.fire({
        icon: 'success',
        title: t('production.updateSuccess'),
        showConfirmButton: false,
        timer: 1500
      });
      queryClient.invalidateQueries({ queryKey: ['production-orders'] });
      setShowActionsModal(false);
      setSelectedOrder(null);
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || t('production.updateFailed')
      });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: productionService.deleteOrder,
    onSuccess: () => {
      Swal.fire({
        icon: 'success',
        title: t('production.deleteSuccess'),
        showConfirmButton: false,
        timer: 1500
      });
      queryClient.invalidateQueries({ queryKey: ['production-orders'] });
      setShowActionsModal(false);
      setSelectedOrder(null);
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || t('production.deleteFailed')
      });
    },
  });

  const updateProcessMutation = useMutation({
    mutationFn: ({ processId, data }: { processId: string; data: any }) =>
      productionService.updateProductionProcess(processId, data),
    onSuccess: () => {
      Swal.fire({
        icon: 'success',
        title: t('production.updateSuccess'),
        showConfirmButton: false,
        timer: 1500
      });
      queryClient.invalidateQueries({ queryKey: ['production-orders'] });
    },
    onError: (error: any) => {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || t('production.updateFailed')
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOrderMutation.mutate(formData);
  };

  const handleStatusChange = async (orderId: string, newStatus: string, confirmMsg: string) => {
    const result = await Swal.fire({
      title: confirmMsg,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: t('production.confirm') || 'Confirm',
      cancelButtonText: t('production.cancel') || 'Cancel',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#ef4444'
    });
    
    if (result.isConfirmed) {
      // If status is COMPLETED, set completedQuantity to targetQuantity
      const order = orders.find(o => o.id === orderId);
      const payload: any = { orderId, status: newStatus };
      
      if (newStatus === 'COMPLETED' && order) {
        payload.completedQuantity = order.targetQuantity;
      }
      
      updateStatusMutation.mutate(payload);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    const result = await Swal.fire({
      title: t('production.confirmDelete'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: t('production.confirm') || 'Confirm',
      cancelButtonText: t('production.cancel') || 'Cancel',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280'
    });
    
    if (result.isConfirmed) {
      deleteOrderMutation.mutate(orderId);
    }
  };

  const handleProcessStatusChange = async (processId: string | null, sectionId: string, orderId: string, newStatus: string, confirmMsg: string) => {
    // If process doesn't exist, show error
    if (!processId) {
      Swal.fire({
        icon: 'warning',
        title: 'Process not created',
        text: 'Please wait for the order to be fully initialized with all processes.'
      });
      return;
    }

    const result = await Swal.fire({
      title: confirmMsg,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: t('production.confirm') || 'Confirm',
      cancelButtonText: t('production.cancel') || 'Cancel',
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280'
    });
    
    if (result.isConfirmed) {
      updateProcessMutation.mutate({ 
        processId, 
        data: { 
          status: newStatus,
          quantity: selectedOrder?.targetQuantity 
        } 
      });
    }
  };

  const openActionsModal = (order: ProductionOrder) => {
    setSelectedOrder(order);
    setShowActionsModal(true);
  };

  const openProcessesModal = (order: ProductionOrder) => {
    // Get fresh data from orders list to ensure processes are included
    const freshOrder = orders.find((o: ProductionOrder) => o.id === order.id) || order;
    setSelectedOrder(freshOrder);
    setShowProcessesModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'ON_HOLD':
        return 'bg-orange-100 text-orange-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return '⏳';
      case 'IN_PROGRESS':
        return '🔄';
      case 'COMPLETED':
        return '✅';
      case 'ON_HOLD':
        return '⏸️';
      case 'CANCELLED':
        return '❌';
      default:
        return '📋';
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">🏭 {t('production.title')}</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            ➕ {t('production.createNewOrder')}
          </button>
        </div>

        {/* Filters */}
        <div className="card p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('common.from') || 'From Date'}
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('common.to') || 'To Date'}
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('production.filterByStatus')}
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="input w-full"
              >
                <option value="">{t('production.allStatus')}</option>
                <option value="PENDING">⏳ {t('production.pending')}</option>
                <option value="IN_PROGRESS">🔄 {t('production.inProgress')}</option>
                <option value="COMPLETED">✅ {t('production.completed')}</option>
                <option value="ON_HOLD">⏸️ {t('production.onHold')}</option>
                <option value="CANCELLED">❌ {t('production.cancelled')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">{t('production.loadingOrders')}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-4xl mb-4">📋</p>
            <p className="text-gray-600 text-lg">{t('production.noOrders')}</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {orders.map((order: ProductionOrder) => (
              <div key={order.id} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {order.orderNo}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {getStatusIcon(order.status)} {order.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-sm text-gray-600">{t('production.product')}</p>
                        <p className="font-semibold">{order.product?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{order.product?.sku}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600">{t('production.targetQuantity')}</p>
                        <p className="font-semibold text-lg">
                          {order.targetQuantity.toLocaleString()} {t('production.units')}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600">{t('production.completedQuantity')}</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all"
                              style={{
                                width: `${(order.completedQuantity / order.targetQuantity) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-semibold">
                            {order.completedQuantity} / {order.targetQuantity}
                          </span>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600">{t('production.dueDate')}</p>
                        <p className="font-semibold">
                          {order.dueDate
                            ? new Date(order.dueDate).toLocaleDateString()
                            : t('production.notSet')}
                        </p>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="mt-4 bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">{t('production.notes')}:</span> {order.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row lg:flex-col gap-2">
                    <button 
                      onClick={() => openActionsModal(order)}
                      className="btn btn-primary text-sm"
                    >
                      ⚙️ {t('common.actions')}
                    </button>
                    <button 
                      onClick={() => openProcessesModal(order)}
                      className="btn btn-secondary text-sm"
                    >
                      📊 {t('production.viewProcesses')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">➕ {t('production.createOrder')}</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                  <p className="text-sm text-blue-800">
                    💡 <span className="font-semibold">Order Number</span> will be auto-generated (format: PO-YYYYMMDD-XXXX)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('production.product')} *
                  </label>
                  <select
                    required
                    value={formData.productId}
                    onChange={(e) =>
                      setFormData({ ...formData, productId: e.target.value })
                    }
                    className="input w-full"
                  >
                    <option value="">{t('production.selectProduct')}</option>
                    {productsData?.products.map((product: any) => (
                      <option key={product.id} value={product.id}>
                        {product.sku} - {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('production.targetQty')} *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.targetQuantity || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        targetQuantity: parseInt(e.target.value) || 0,
                      })
                    }
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('production.dueDateOptional')}
                  </label>
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                    className="input w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('production.notesOptional')}
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    className="input w-full"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn btn-secondary flex-1"
                    disabled={createOrderMutation.isPending}
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                    disabled={createOrderMutation.isPending}
                  >
                    {createOrderMutation.isPending ? t('production.creating') : `✅ ${t('production.createOrder')}`}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Actions Modal */}
        {showActionsModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">⚙️ {t('common.actions')}</h2>
                <button
                  onClick={() => setShowActionsModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div className="mb-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600">{t('production.orderNo')}</p>
                  <p className="font-bold">{selectedOrder.orderNo}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('production.status')}: <span className={`font-semibold ${
                      selectedOrder.status === 'PENDING' ? 'text-yellow-600' :
                      selectedOrder.status === 'IN_PROGRESS' ? 'text-blue-600' :
                      selectedOrder.status === 'COMPLETED' ? 'text-green-600' :
                      selectedOrder.status === 'ON_HOLD' ? 'text-orange-600' :
                      'text-red-600'
                    }`}>{selectedOrder.status}</span>
                  </p>
                </div>

                {selectedOrder.status === 'PENDING' && (
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, 'IN_PROGRESS', t('production.confirmStart'))}
                    className="btn btn-primary w-full"
                    disabled={updateStatusMutation.isPending}
                  >
                    ▶️ {t('production.startProduction')}
                  </button>
                )}

                {selectedOrder.status === 'IN_PROGRESS' && (
                  <>
                    <button
                      onClick={() => handleStatusChange(selectedOrder.id, 'ON_HOLD', t('production.confirmPause'))}
                      className="btn btn-secondary w-full"
                      disabled={updateStatusMutation.isPending}
                    >
                      ⏸️ {t('production.pauseProduction')}
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedOrder.id, 'COMPLETED', t('production.confirmComplete'))}
                      className="btn bg-green-600 hover:bg-green-700 text-white w-full"
                      disabled={updateStatusMutation.isPending}
                    >
                      ✅ {t('production.completeOrder')}
                    </button>
                  </>
                )}

                {selectedOrder.status === 'ON_HOLD' && (
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, 'IN_PROGRESS', t('production.confirmResume'))}
                    className="btn btn-primary w-full"
                    disabled={updateStatusMutation.isPending}
                  >
                    ▶️ {t('production.resumeProduction')}
                  </button>
                )}

                {selectedOrder.status !== 'COMPLETED' && selectedOrder.status !== 'CANCELLED' && (
                  <button
                    onClick={() => handleStatusChange(selectedOrder.id, 'CANCELLED', t('production.confirmCancel'))}
                    className="btn bg-orange-600 hover:bg-orange-700 text-white w-full"
                    disabled={updateStatusMutation.isPending}
                  >
                    ❌ {t('production.cancelOrder')}
                  </button>
                )}

                <div className="border-t pt-3 mt-3">
                  <button
                    onClick={() => handleDeleteOrder(selectedOrder.id)}
                    className="btn bg-red-600 hover:bg-red-700 text-white w-full"
                    disabled={deleteOrderMutation.isPending}
                  >
                    🗑️ {t('production.deleteOrder')}
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <button
                  onClick={() => setShowActionsModal(false)}
                  className="btn btn-secondary w-full"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Processes Modal */}
        {showProcessesModal && selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
            <div className="bg-white rounded-lg p-4 sm:p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-bold">📊 {t('production.viewProcesses')}</h2>
                <button
                  onClick={() => setShowProcessesModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl sm:text-2xl"
                >
                  ✕
                </button>
              </div>

              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">{t('production.orderNo')}</p>
                    <p className="font-bold text-base sm:text-lg">{selectedOrder.orderNo}</p>
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-600">{t('production.product')}</p>
                    <p className="font-semibold text-sm sm:text-base">{selectedOrder.product?.name}</p>
                    <p className="text-xs text-gray-500">{selectedOrder.product?.sku}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('production.targetQuantity')}</p>
                    <p className="font-semibold">{selectedOrder.targetQuantity.toLocaleString()} {t('production.units')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">{t('production.status')}</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedOrder.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      selectedOrder.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                      selectedOrder.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                      selectedOrder.status === 'ON_HOLD' ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {getStatusIcon(selectedOrder.status)} {selectedOrder.status}
                    </span>
                  </div>
                </div>
              </div>

              <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">🔄 {t('production.progress')} ({sections.length} {t('production.sections')})</h3>

              {sections.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-4xl mb-2">📋</p>
                  <p>{t('production.noSections')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sections.map((section, index) => {
                    const process = selectedOrder.processes?.find((p: any) => p.sectionId === section.id);
                    const isCompleted = process?.status === 'COMPLETED';
                    const isInProgress = process?.status === 'IN_PROGRESS';
                    const isPending = !process || process.status === 'PENDING';
                    
                    return (
                      <div
                        key={section.id}
                        className={`border rounded-lg p-3 sm:p-4 ${
                          isCompleted ? 'bg-green-50 border-green-300' :
                          isInProgress ? 'bg-blue-50 border-blue-300' :
                          'bg-gray-50 border-gray-300'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base ${
                              isCompleted ? 'bg-green-600' :
                              isInProgress ? 'bg-blue-600' :
                              'bg-gray-400'
                            }`}>
                              {isCompleted ? '✓' : index + 1}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-sm sm:text-lg">{section.code} - {section.name}</h4>
                              {section.description && (
                                <p className="text-xs sm:text-sm text-gray-600">{section.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            {isCompleted && (
                              <div>
                                <span className="inline-block px-2 sm:px-3 py-1 bg-green-600 text-white rounded-full text-xs font-semibold mb-1">
                                  ✅ {t('production.completed')}
                                </span>
                                {process?.quantity > 0 && (
                                  <p className="text-xs sm:text-sm text-gray-600">
                                    {t('production.quantity')}: {process.quantity.toLocaleString()}
                                  </p>
                                )}
                              </div>
                            )}
                            {isInProgress && (
                              <div>
                                <span className="inline-block px-2 sm:px-3 py-1 bg-blue-600 text-white rounded-full text-xs font-semibold mb-1">
                                  🔄 {t('production.inProgress')}
                                </span>
                                {process?.quantity > 0 && (
                                  <p className="text-xs sm:text-sm text-gray-600">
                                    {t('production.quantity')}: {process.quantity.toLocaleString()}
                                  </p>
                                )}
                              </div>
                            )}
                            {isPending && (
                              <span className="inline-block px-2 sm:px-3 py-1 bg-gray-400 text-white rounded-full text-xs font-semibold">
                                ⏳ {t('production.pending')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Process Action Buttons */}
                        {!isCompleted && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {isPending && (
                              <button
                                onClick={() => handleProcessStatusChange(
                                  process?.id || null,
                                  section.id,
                                  selectedOrder.id,
                                  'IN_PROGRESS',
                                  t('production.confirmStart')
                                )}
                                className="px-3 py-1.5 sm:py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors"
                              >
                                ▶️ {t('production.startProduction')}
                              </button>
                            )}
                            {isInProgress && (
                              <button
                                onClick={() => handleProcessStatusChange(
                                  process.id,
                                  section.id,
                                  selectedOrder.id,
                                  'COMPLETED',
                                  t('production.confirmComplete')
                                )}
                                className="px-3 py-1.5 sm:py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium transition-colors"
                              >
                                ✅ {t('production.completeOrder')}
                              </button>
                            )}
                          </div>
                        )}

                        {process?.notes && (
                          <div className="mt-3 p-2 bg-white rounded border border-gray-200">
                            <p className="text-sm text-gray-700">
                              <span className="font-semibold">{t('production.processNotes')}:</span> {process.notes}
                            </p>
                          </div>
                        )}

                        {process && (
                          <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-600">
                            {process.startTime && (
                              <div>
                                <span className="font-semibold">{t('production.startTime')}:</span> {new Date(process.startTime).toLocaleString()}
                              </div>
                            )}
                            {process.endTime && (
                              <div>
                                <span className="font-semibold">{t('production.endTime')}:</span> {new Date(process.endTime).toLocaleString()}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowProcessesModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};
