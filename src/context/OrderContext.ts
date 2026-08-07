import { createContext, useContext } from 'react';

export interface OrderItem {
  productId: string;
  productName: string;
  size: string;
  color: string;
  price: number;
  quantity: number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  date: string;
  userEmail?: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentStatus?: 'pending' | 'paid';
  trackingCode?: string;
  notes?: string;
  paymentMethod: 'pix' | 'card' | 'boleto';
  address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

export interface OrderContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'date' | 'status'>) => string;
  getOrderById: (id: string) => Order | undefined;
  updateOrderStatus: (id: string, status: OrderStatus) => void;
  updateOrderTracking: (id: string, trackingCode: string) => void;
  updateOrderNotes: (id: string, notes: string) => void;
  updateOrderPayment: (id: string, paymentStatus: 'pending' | 'paid') => void;
}

const STATUS_MAP: Record<OrderStatus, { label: string; color: string; icon: string }> = {
  pending: { label: 'Pendente', color: 'text-yellow-600 bg-yellow-50', icon: '⏳' },
  processing: { label: 'Processando', color: 'text-blue-600 bg-blue-50', icon: '⚙️' },
  shipped: { label: 'Enviado', color: 'text-purple-600 bg-purple-50', icon: '🚚' },
  delivered: { label: 'Entregue', color: 'text-green-600 bg-green-50', icon: '✅' },
  cancelled: { label: 'Cancelado', color: 'text-red-600 bg-red-50', icon: '❌' },
};

export function getOrderStatusInfo(status: OrderStatus) {
  return STATUS_MAP[status];
}

const PAYMENT_MAP: Record<'pending' | 'paid', { label: string; color: string }> = {
  pending: { label: 'Aguardando pagamento', color: 'text-orange-600 bg-orange-50' },
  paid: { label: 'Pago', color: 'text-green-600 bg-green-50' },
};

export function getPaymentStatusInfo(paymentStatus?: 'pending' | 'paid') {
  return PAYMENT_MAP[paymentStatus ?? 'pending'];
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: 'processing',
  processing: 'shipped',
  shipped: 'delivered',
};

export function getNextStatus(status: OrderStatus): OrderStatus | undefined {
  return NEXT_STATUS[status];
}

export const TRACKING_URL = 'https://rastreamento.correios.com.br/app/detalhes.php?objetos=';

export const OrderContext = createContext<OrderContextType | null>(null);

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
