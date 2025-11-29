import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import productionService, { ProductionOrder } from '@/services/production.service';
import { productService } from '@/services/product.service';
import toast from 'react-hot-toast';

export const ProductionOrdersPage = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    orderNo: '',
    productId: '',
    targetQuantity: 0,
    dueDate: '',
    notes: '',
  });

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['production-orders', selectedStatus],
    queryFn: () => productionService.getProductionOrders(selectedStatus || undefined),
  });

  const { data: productsData } = useQuery({
    queryKey: ['products-for-orders'],
    queryFn: () => productService.getAll({ page: 1, limit: 1000 }),
    enabled: showCreateModal,
  });

  const createOrderMutation = useMutation({
    mutationFn: productionService.createProductionOrder,
    onSuccess: () => {
      toast.success('Production order created successfully!');
      queryClient.invalidateQueries({ queryKey: ['production-orders'] });
      setShowCreateModal(false);
      setFormData({ orderNo: '', productId: '', targetQuantity: 0, dueDate: '', notes: '' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create order');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOrderMutation.mutate(formData);
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
          <h1 className="text-3xl font-bold text-gray-900">🏭 Production Orders</h1>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            ➕ Create New Order
          </button>
        </div>

        {/* Status Filter */}
        <div className="card p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Status
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input max-w-xs"
          >
            <option value="">All Status</option>
            <option value="PENDING">⏳ Pending</option>
            <option value="IN_PROGRESS">🔄 In Progress</option>
            <option value="COMPLETED">✅ Completed</option>
            <option value="ON_HOLD">⏸️ On Hold</option>
            <option value="CANCELLED">❌ Cancelled</option>
          </select>
        </div>

        {/* Orders List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-4xl mb-4">📋</p>
            <p className="text-gray-600 text-lg">No production orders found</p>
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
                        <p className="text-sm text-gray-600">Product</p>
                        <p className="font-semibold">{order.product?.name || 'N/A'}</p>
                        <p className="text-xs text-gray-500">{order.product?.sku}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600">Target Quantity</p>
                        <p className="font-semibold text-lg">
                          {order.targetQuantity.toLocaleString()} units
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-600">Completed</p>
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
                        <p className="text-sm text-gray-600">Due Date</p>
                        <p className="font-semibold">
                          {order.dueDate
                            ? new Date(order.dueDate).toLocaleDateString()
                            : 'Not set'}
                        </p>
                      </div>
                    </div>

                    {order.notes && (
                      <div className="mt-4 bg-gray-50 p-3 rounded">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold">Notes:</span> {order.notes}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-row lg:flex-col gap-2">
                    <button className="btn btn-primary text-sm">
                      👁️ View Details
                    </button>
                    <button className="btn btn-secondary text-sm">
                      📊 Processes
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
                <h2 className="text-xl font-bold">➕ Create Production Order</h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.orderNo}
                    onChange={(e) =>
                      setFormData({ ...formData, orderNo: e.target.value })
                    }
                    className="input w-full"
                    placeholder="PO-2025-001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product *
                  </label>
                  <select
                    required
                    value={formData.productId}
                    onChange={(e) =>
                      setFormData({ ...formData, productId: e.target.value })
                    }
                    className="input w-full"
                  >
                    <option value="">-- Select Product --</option>
                    {productsData?.products.map((product: any) => (
                      <option key={product.id} value={product.id}>
                        {product.sku} - {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Quantity *
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
                    Due Date
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
                    Notes
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
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary flex-1"
                    disabled={createOrderMutation.isPending}
                  >
                    {createOrderMutation.isPending ? 'Creating...' : '✅ Create Order'}
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
