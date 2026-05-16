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
      setOrders([]);
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
      // Optimistic UI update (socket will also broadcast the change)
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error('Failed to update order status:', err.message);
    }
  };

  return { orders, loading, error, refetch: fetchOrders, updateOrderStatus };
}