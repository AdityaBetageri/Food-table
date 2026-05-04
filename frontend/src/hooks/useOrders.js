import { useState, useEffect, useCallback } from 'react';
import { orderAPI } from '../services/api';
import { useSocketContext } from '../context/SocketContext';

/**
 * Hook to fetch and manage orders with status filtering
 * @param {string} status - Optional status filter
 * @returns {{ orders, loading, error, refetch, updateOrderStatus }}
 */
export function useOrders(status = '') {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = status ? `status=${status}` : '';
      const data = await orderAPI.getAll(params);
      setOrders(data.orders || data || []);
    } catch (err) {
      setError(err.message);
      // Use demo data when API is unavailable
      setOrders(getDemoOrders(status));
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const { subscribe } = useSocketContext();

  useEffect(() => {
    const unsubNew = subscribe('new_order', (order) => {
      // If we are filtering by status, only process if it matches
      if (!status || order.status === status) {
        setOrders(prev => {
          const exists = prev.some(o => o._id === order._id);
          if (exists) {
            // Replace existing order with updated one
            return prev.map(o => o._id === order._id ? order : o);
          }
          // Prepend new order
          return [order, ...prev];
        });
      }
    });

    const unsubStatus = subscribe('order_status_update', (data) => {
      setOrders(prev => {
        // If filtering by status and the new status doesn't match, remove it
        if (status && data.status !== status) {
          return prev.filter(o => o._id !== data.orderId);
        }
        // Otherwise update it
        const exists = prev.some(o => o._id === data.orderId);
        if (exists) {
          return prev.map(o => o._id === data.orderId ? { ...o, status: data.status } : o);
        } else if (!status || data.status === status) {
          // It moved into this tab from another tab
          return [data.order, ...prev].filter(Boolean);
        }
        return prev;
      });
    });

    return () => {
      unsubNew && unsubNew();
      unsubStatus && unsubStatus();
    };
  }, [subscribe, status]);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus);
      // We don't necessarily need to update local state immediately because 
      // the socket will broadcast 'order_status_update' back to us.
      // But for optimistic UI:
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      // Demo mode: update locally
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    }
  };

  return { orders, loading, error, refetch: fetchOrders, updateOrderStatus };
}

// Demo data for offline/development use
function getDemoOrders(statusFilter) {
  const demoOrders = [
    {
      _id: 'demo1',
      tableNumber: 5,
      status: 'new',
      items: [
        { name: 'Margherita Pizza', qty: 1, price: 299, notes: 'Extra cheese' },
        { name: 'Mango Juice', qty: 2, price: 89, notes: '' },
      ],
      total: 477,
      createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
      specialInstructions: 'Less spicy please',
    },
    {
      _id: 'demo2',
      tableNumber: 3,
      status: 'preparing',
      items: [
        { name: 'Classic Burger', qty: 2, price: 199, notes: '' },
        { name: 'French Fries', qty: 2, price: 129, notes: '' },
        { name: 'Caesar Salad', qty: 1, price: 179, notes: 'No croutons' },
      ],
      total: 835,
      createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
    },
    {
      _id: 'demo3',
      tableNumber: 7,
      status: 'ready',
      items: [
        { name: 'Pasta Alfredo', qty: 1, price: 249, notes: '' },
        { name: 'Garlic Bread', qty: 1, price: 99, notes: '' },
      ],
      total: 348,
      createdAt: new Date(Date.now() - 20 * 60000).toISOString(),
    },
    {
      _id: 'demo4',
      tableNumber: 12,
      status: 'new',
      items: [
        { name: 'Paneer Tikka', qty: 1, price: 219, notes: 'Extra spicy' },
        { name: 'Butter Naan', qty: 3, price: 49, notes: '' },
        { name: 'Dal Makhani', qty: 1, price: 189, notes: '' },
        { name: 'Lassi', qty: 2, price: 79, notes: '' },
      ],
      total: 713,
      createdAt: new Date(Date.now() - 1 * 60000).toISOString(),
    },
    {
      _id: 'demo5',
      tableNumber: 1,
      status: 'served',
      items: [
        { name: 'Chicken Biryani', qty: 2, price: 299, notes: '' },
        { name: 'Raita', qty: 2, price: 49, notes: '' },
      ],
      total: 696,
      createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
      paymentStatus: 'pending',
    },
  ];

  if (statusFilter) {
    return demoOrders.filter((o) => o.status === statusFilter);
  }
  return demoOrders;
}