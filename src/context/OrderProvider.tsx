import { useState, useCallback, type ReactNode } from 'react';
import { OrderContext, type Order, type OrderStatus } from './OrderContext';

// Mock order history
const MOCK_ORDERS: Order[] = [
  {
    id: 'KR-2026-001',
    date: '2026-07-28T14:30:00Z',
    items: [
      { productId: 'tee-alien-joia-01', productName: 'Alien Joia Tee', size: 'M', color: 'Preto', price: 149.90, quantity: 1 },
      { productId: 'cap-piercings-01', productName: 'Piercings Kosmo Cap', size: 'Único', color: 'Preto', price: 89.90, quantity: 1 },
    ],
    total: 239.80,
    status: 'shipped',
    paymentMethod: 'pix',
    address: {
      street: 'Rua das Estrelas',
      number: '42',
      neighborhood: 'Jardim Cósmico',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
    },
  },
  {
    id: 'KR-2026-002',
    date: '2026-07-15T10:15:00Z',
    items: [
      { productId: 'tee-sorvete-cascao-01', productName: 'Sorvete Planet Cascão Tee', size: 'G', color: 'Preto', price: 139.90, quantity: 2 },
    ],
    total: 279.80,
    status: 'delivered',
    paymentMethod: 'card',
    address: {
      street: 'Av. da Galáxia',
      number: '1000',
      neighborhood: 'Centro',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipCode: '20000-000',
    },
  },
  {
    id: 'KR-2026-003',
    date: '2026-07-01T18:45:00Z',
    items: [
      { productId: 'tee-alien-verde-01', productName: 'Alien Verde Olhos Tee', size: 'P', color: 'Verde', price: 149.90, quantity: 1 },
    ],
    total: 179.80,
    status: 'delivered',
    paymentMethod: 'boleto',
    address: {
      street: 'Rua do Universo',
      number: '77',
      neighborhood: 'Vila Nebulosa',
      city: 'Belo Horizonte',
      state: 'MG',
      zipCode: '30000-000',
    },
  },
];

function loadOrders(): Order[] {
  try {
    const saved = localStorage.getItem('kosmo-orders');
    const savedOrders: Order[] = saved ? JSON.parse(saved) : [];
    const savedIds = new Set(savedOrders.map((o) => o.id));
    return [...savedOrders, ...MOCK_ORDERS.filter((m) => !savedIds.has(m.id))];
  } catch {
    return MOCK_ORDERS;
  }
}

function saveOrders(orders: Order[]) {
  // Persist user-created orders and any mock that was modified (status/tracking)
  const userOrders = orders.filter((o) => {
    const mock = MOCK_ORDERS.find((m) => m.id === o.id);
    if (!mock) return true;
    return mock.status !== o.status || mock.trackingCode !== o.trackingCode || mock.notes !== o.notes || mock.paymentStatus !== o.paymentStatus;
  });
  localStorage.setItem('kosmo-orders', JSON.stringify(userOrders));
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(loadOrders);

  const addOrder = useCallback((orderData: Omit<Order, 'id' | 'date' | 'status'>): string => {
    const id = `KR-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`;
    const newOrder: Order = {
      ...orderData,
      id,
      date: new Date().toISOString(),
      status: 'pending',
      paymentStatus: orderData.paymentMethod === 'card' ? 'paid' : 'pending',
    };
    setOrders((prev) => {
      const next = [newOrder, ...prev];
      saveOrders(next);
      return next;
    });
    return id;
  }, [orders.length]);

  const getOrderById = useCallback((id: string): Order | undefined => {
    return orders.find((o) => o.id === id);
  }, [orders]);

  const updateOrderStatus = useCallback((id: string, status: OrderStatus) => {
    setOrders((prev) => {
      const next = prev.map((o) => (o.id === id ? { ...o, status } : o));
      saveOrders(next);
      return next;
    });
  }, []);

  const updateOrderTracking = useCallback((id: string, trackingCode: string) => {
    setOrders((prev) => {
      const next = prev.map((o) => (o.id === id ? { ...o, trackingCode } : o));
      saveOrders(next);
      return next;
    });
  }, []);

  const updateOrderNotes = useCallback((id: string, notes: string) => {
    setOrders((prev) => {
      const next = prev.map((o) => (o.id === id ? { ...o, notes } : o));
      saveOrders(next);
      return next;
    });
  }, []);

  const updateOrderPayment = useCallback((id: string, paymentStatus: 'pending' | 'paid') => {
    setOrders((prev) => {
      const next = prev.map((o) => (o.id === id ? { ...o, paymentStatus } : o));
      saveOrders(next);
      return next;
    });
  }, []);

  return (
    <OrderContext.Provider value={{ orders, addOrder, getOrderById, updateOrderStatus, updateOrderTracking, updateOrderNotes, updateOrderPayment }}>
      {children}
    </OrderContext.Provider>
  );
}
