'use client';

import { useTranslation } from '@/lib/i18n';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  ShoppingBag,
  RotateCw 
} from 'lucide-react';
import { formatPrice } from '@/lib/i18n/formatters';

interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productNameAr: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  thumbnail?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  currency: 'SAR';
  createdAt: string;
  estimatedDelivery?: string;
}

export default function OrderHistoryPage() {
  const { t, language } = useTranslation('profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch('/api/orders', {
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // });
      // const data = await response.json();
      
      // Mock data for now
      const mockOrders: Order[] = [
        {
          id: '1',
          orderNumber: 'ORD-2024-001',
          status: 'delivered',
          items: [
            {
              id: '1',
              productId: 'p1',
              productName: 'Wireless Headphones',
              productNameAr: 'سماعات لاسلكية',
              quantity: 1,
              unitPrice: 299,
              subtotal: 299
            },
            {
              id: '2',
              productId: 'p2',
              productName: 'Phone Case',
              productNameAr: 'حافظة هاتف',
              quantity: 2,
              unitPrice: 49,
              subtotal: 98
            }
          ],
          subtotal: 397,
          shippingCost: 25,
          discount: 0,
          total: 422,
          currency: 'SAR',
          createdAt: '2024-01-15T10:30:00Z',
          estimatedDelivery: '2024-01-20T00:00:00Z'
        },
        {
          id: '2',
          orderNumber: 'ORD-2024-002',
          status: 'shipped',
          items: [
            {
              id: '3',
              productId: 'p3',
              productName: 'Smart Watch',
              productNameAr: 'ساعة ذكية',
              quantity: 1,
              unitPrice: 899,
              subtotal: 899
            }
          ],
          subtotal: 899,
          shippingCost: 25,
          discount: 50,
          total: 874,
          currency: 'SAR',
          createdAt: '2024-01-20T14:20:00Z',
          estimatedDelivery: '2024-01-25T00:00:00Z'
        },
        {
          id: '3',
          orderNumber: 'ORD-2024-003',
          status: 'processing',
          items: [
            {
              id: '4',
              productId: 'p4',
              productName: 'Laptop Stand',
              productNameAr: 'حامل لابتوب',
              quantity: 1,
              unitPrice: 149,
              subtotal: 149
            }
          ],
          subtotal: 149,
          shippingCost: 25,
          discount: 0,
          total: 174,
          currency: 'SAR',
          createdAt: '2024-01-28T09:15:00Z'
        }
      ];

      setOrders(mockOrders);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setIsLoading(false);
    }
  };

  const handleReorder = async (order: Order) => {
    // TODO: Implement reorder functionality
    // Add all items from the order to cart
    console.log('Reorder:', order.orderNumber);
  };

  const getStatusColor = (status: Order['status']) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      returned: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gray-50 pb-24">
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="max-w-4xl mx-auto flex items-center gap-4">
            <Link href="/profile" className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
            </Link>
            <h1 className="text-xl font-bold">{t('orders.title')}</h1>
          </div>
        </div>
        <div className="max-w-4xl mx-auto p-4">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/profile" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-6 h-6 rtl:rotate-180" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">{t('orders.title')}</h1>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-4xl mx-auto p-4">
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {t('orders.empty')}
            </h2>
            <Link
              href="/"
              className="inline-block mt-4 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Order Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {t('orders.orderNumber', { number: order.orderNumber })}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {t('orders.date')}: {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {t(`orders.status.${order.status}`)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {t('orders.items', { count: order.items.length })}
                    </span>
                    <span className="font-semibold text-gray-900">
                      {t('orders.total')}: {formatPrice(order.total, language, order.currency)}
                    </span>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="p-4 bg-gray-50">
                  <div className="space-y-2">
                    {order.items.slice(0, 2).map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        {item.thumbnail && (
                          <img
                            src={item.thumbnail}
                            alt={language === 'ar' ? item.productNameAr : item.productName}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {language === 'ar' ? item.productNameAr : item.productName}
                          </p>
                          <p className="text-xs text-gray-600">
                            Qty: {item.quantity} × {formatPrice(item.unitPrice, language, order.currency)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-xs text-gray-600">
                        +{order.items.length - 2} more items
                      </p>
                    )}
                  </div>
                </div>

                {/* Order Actions */}
                <div className="p-4 flex gap-3">
                  <Link
                    href={`/profile/orders/${order.id}`}
                    className="flex-1 px-4 py-2 text-center border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {t('orders.viewDetails')}
                  </Link>
                  <button
                    onClick={() => handleReorder(order)}
                    className="flex-1 px-4 py-2 flex items-center justify-center gap-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                  >
                    <RotateCw className="w-4 h-4" />
                    {t('orders.reorder')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
