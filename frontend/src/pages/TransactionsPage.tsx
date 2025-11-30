import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { transactionService } from '@/services/transaction.service';

export const TransactionsPage = () => {
  const { t } = useLanguage();
  const getTodayDate = () => new Date().toISOString().split('T')[0];
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [dateFrom, setDateFrom] = useState<string>(getTodayDate());
  const [dateTo, setDateTo] = useState<string>(getTodayDate());
  const [page, setPage] = useState(1);

  // Real transactions query
  const { data, isLoading } = useQuery({
    queryKey: ['transactions', page, statusFilter, typeFilter, dateFrom, dateTo],
    queryFn: () =>
      transactionService.getAll({
        type: typeFilter !== 'ALL' ? typeFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        dateFrom,
        dateTo,
        page,
        limit: 20,
      }),
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'IN':
        return 'bg-green-100 text-green-800';
      case 'OUT':
        return 'bg-red-100 text-red-800';
      case 'TRANSFER':
        return 'bg-blue-100 text-blue-800';
      case 'ADJUSTMENT':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const transactions = data?.transactions || [];

  const getWarehouseDisplay = (transaction: any) => {
    if (transaction.type === 'TRANSFER') {
      const fromWarehouse = transaction.warehouses_transactions_fromWarehouseIdTowarehouses?.name || '';
      const toWarehouse = transaction.warehouses_transactions_toWarehouseIdTowarehouses?.name || '';
      return `${fromWarehouse} → ${toWarehouse}`;
    }
    return (
      transaction.warehouses_transactions_fromWarehouseIdTowarehouses?.name ||
      transaction.warehouses_transactions_toWarehouseIdTowarehouses?.name ||
      '-'
    );
  };

  return (
    <Layout>
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            📋 {t('transactions.title')}
          </h1>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">{t('common.from') || 'From'}</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="input w-full"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">{t('common.to') || 'To'}</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="input w-full"
              />
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input flex-1"
            >
              <option value="ALL">{t('transactions.allTypes')}</option>
              <option value="IN">{t('inventory.in')}</option>
              <option value="OUT">{t('inventory.out')}</option>
              <option value="TRANSFER">{t('inventory.transfer')}</option>
              <option value="ADJUSTMENT">{t('inventory.adjustment')}</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input flex-1"
            >
              <option value="ALL">{t('transactions.allStatus')}</option>
              <option value="COMPLETED">{t('transactions.completed')}</option>
              <option value="PENDING">{t('transactions.pending')}</option>
              <option value="CANCELLED">{t('transactions.cancelled')}</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block card overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t('transactions.type')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t('products.productName')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t('inventory.quantity')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t('inventory.warehouse')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t('transactions.status')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t('transactions.createdBy')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t('transactions.date')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transactions.map((transaction: any) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${getTypeColor(transaction.type)}`}>
                          {t(`inventory.${transaction.type.toLowerCase()}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{transaction.products?.name || '-'}</div>
                        <div className="text-xs text-gray-500">{transaction.products?.sku || ''}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                        {transaction.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {getWarehouseDisplay(transaction)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(transaction.status)}`}>
                          {t(`transactions.${transaction.status.toLowerCase()}`)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transaction.users ? `${transaction.users.firstName} ${transaction.users.lastName}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(transaction.createdAt).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {transactions.map((transaction: any) => (
                <div key={transaction.id} className="card">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${getTypeColor(transaction.type)}`}>
                      {t(`inventory.${transaction.type.toLowerCase()}`)}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${getStatusColor(transaction.status)}`}>
                      {t(`transactions.${transaction.status.toLowerCase()}`)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{transaction.products?.name || '-'}</h3>
                  <div className="text-xs text-gray-500 mb-2">{transaction.products?.sku || ''}</div>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>{t('inventory.quantity')}:</span>
                      <span className="font-semibold">{transaction.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('inventory.warehouse')}:</span>
                      <span>{getWarehouseDisplay(transaction)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('transactions.createdBy')}:</span>
                      <span>
                        {transaction.users ? `${transaction.users.firstName} ${transaction.users.lastName}` : '-'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('transactions.date')}:</span>
                      <span>
                        {new Date(transaction.createdAt).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                  {transaction.notes && (
                    <div className="mt-2 text-sm text-gray-500 border-t pt-2">
                      {transaction.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};
