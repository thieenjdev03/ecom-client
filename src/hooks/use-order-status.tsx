import { useState, useEffect, useCallback } from "react";
import { orderApi, type Order } from "src/api/order";

// ----------------------------------------------------------------------

interface OrderStatusHook {
  order: Order | null;
  isLoading: boolean;
  error: string | null;
  status: Order['status'];
  refreshOrder: () => Promise<void>;
  pollOrderStatus: (maxAttempts?: number) => Promise<void>;
}

interface OrderStatusProps {
  orderId: string;
  onStatusChange?: (status: Order['status']) => void;
  onOrderUpdate?: (order: Order) => void;
  autoPoll?: boolean;
  pollInterval?: number; // milliseconds
  maxPollAttempts?: number;
}

// Hook for managing order status
export const useOrderStatus = ({
  orderId,
  onStatusChange,
  onOrderUpdate,
  autoPoll = false,
  pollInterval = 10000, // 10 seconds
  maxPollAttempts = 30, // 5 minutes with 10-second intervals
}: OrderStatusProps): OrderStatusHook => {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pollAttempts, setPollAttempts] = useState(0);

  const fetchOrder = useCallback(async () => {
    if (!orderId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const orderData = await orderApi.getById(orderId);
      setOrder(orderData);
      
      if (onOrderUpdate) {
        onOrderUpdate(orderData);
      }
      
      if (onStatusChange && orderData.status !== order?.status) {
        onStatusChange(orderData.status);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch order';
      setError(errorMessage);
      console.error('Error fetching order:', err);
    } finally {
      setIsLoading(false);
    }
  }, [orderId, onOrderUpdate, onStatusChange, order?.status]);

  const pollOrderStatus = useCallback(async (maxAttempts: number = maxPollAttempts) => {
    if (!orderId) return;
    
    let attempts = 0;
    
    const poll = async (): Promise<void> => {
      try {
        const orderData = await orderApi.getById(orderId);
        setOrder(orderData);
        setPollAttempts(attempts);
        
        if (onOrderUpdate) {
          onOrderUpdate(orderData);
        }
        
        if (onStatusChange && orderData.status !== order?.status) {
          onStatusChange(orderData.status);
        }
        
        // Stop polling if payment is completed or failed
        if (['PAID', 'FAILED', 'CANCELLED'].includes(orderData.status)) {
          return;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, pollInterval);
        } else {
          console.warn('Order status polling timeout reached');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to poll order status';
        setError(errorMessage);
        console.error('Error polling order status:', err);
      }
    };
    
    poll();
  }, [orderId, maxPollAttempts, pollInterval, onOrderUpdate, onStatusChange, order?.status]);

  // Initial fetch
  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Auto-polling
  useEffect(() => {
    if (autoPoll && order && !['PAID', 'FAILED', 'CANCELLED'].includes(order.status)) {
      const interval = setInterval(() => {
        if (pollAttempts < maxPollAttempts) {
          fetchOrder();
        }
      }, pollInterval);
      
      return () => clearInterval(interval);
    }
  }, [autoPoll, order, pollAttempts, maxPollAttempts, pollInterval, fetchOrder]);

  return {
    order,
    isLoading,
    error,
    status: order?.status || 'PENDING',
    refreshOrder: fetchOrder,
    pollOrderStatus,
  };
};

// Component for displaying order status
interface OrderStatusDisplayProps {
  orderId: string;
  showDetails?: boolean;
  onStatusChange?: (status: Order['status']) => void;
}

export const OrderStatusDisplay = ({ 
  orderId, 
  showDetails = true, 
  onStatusChange 
}: OrderStatusDisplayProps) => {
  const { order, isLoading, error, status } = useOrderStatus({
    orderId,
    onStatusChange,
    autoPoll: true,
  });

  const getStatusColor = (status: Order['status']) => {
    const colors = {
      PENDING: '#ff9800',
      PAID: '#4caf50',
      PROCESSING: '#2196f3',
      SHIPPED: '#9c27b0',
      DELIVERED: '#4caf50',
      CANCELLED: '#f44336',
      FAILED: '#f44336',
      REFUNDED: '#9e9e9e',
    };
    return colors[status] || '#9e9e9e';
  };

  const getStatusText = (status: Order['status']) => {
    const texts = {
      PENDING: 'Payment Pending',
      PAID: 'Payment Completed',
      PROCESSING: 'Processing Order',
      SHIPPED: 'Order Shipped',
      DELIVERED: 'Order Delivered',
      CANCELLED: 'Order Cancelled',
      FAILED: 'Payment Failed',
      REFUNDED: 'Payment Refunded',
    };
    return texts[status] || status;
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div className="spinner" style={{ width: '16px', height: '16px', border: '2px solid #f3f3f3', borderTop: '2px solid #3498db', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <span>Loading order status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ color: '#f44336' }}>
        Error: {error}
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: showDetails ? '8px' : '0' }}>
        <div 
          style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            backgroundColor: getStatusColor(status) 
          }} 
        />
        <span style={{ fontWeight: 'bold', color: getStatusColor(status) }}>
          {getStatusText(status)}
        </span>
      </div>
      
      {showDetails && order && (
        <div style={{ fontSize: '14px', color: '#666' }}>
          {order.paidAt && (
            <div>Paid on: {new Date(order.paidAt).toLocaleDateString()}</div>
          )}
          <div>Order ID: {order.id}</div>
          <div>Total: {order.summary.currency} {order.summary.total.toFixed(2)}</div>
        </div>
      )}
    </div>
  );
};

// Utility function for checking order status from localStorage
export const checkPendingOrderStatus = async (): Promise<{
  success: boolean;
  orderId?: string;
  status?: Order['status'];
  order?: Order;
}> => {
  const pendingOrderId = localStorage.getItem('pendingOrderId');
  
  if (!pendingOrderId) {
    return { success: false };
  }
  
  try {
    const order = await orderApi.getById(pendingOrderId);
    
    if (order.status === 'PAID') {
      // Clean up localStorage
      localStorage.removeItem('pendingOrderId');
      localStorage.removeItem('paypalOrderId');
      return { success: true, orderId: pendingOrderId, status: order.status, order };
    }
    
    return { success: false, orderId: pendingOrderId, status: order.status, order };
  } catch (error) {
    console.error('Error checking pending order status:', error);
    return { success: false };
  }
};

// Utility function for polling order status with retry logic
export const pollOrderStatusWithRetry = async (
  orderId: string, 
  maxAttempts: number = 30,
  interval: number = 10000
): Promise<{
  success: boolean;
  orderId?: string;
  status?: Order['status'];
  order?: Order;
}> => {
  let attempts = 0;
  
  const poll = async (): Promise<{
    success: boolean;
    orderId?: string;
    status?: Order['status'];
    order?: Order;
  }> => {
    try {
      const order = await orderApi.getById(orderId);
      
      if (order.status === 'PAID') {
        localStorage.removeItem('pendingOrderId');
        localStorage.removeItem('paypalOrderId');
        return { success: true, orderId, status: order.status, order };
      }
      
      if (['FAILED', 'CANCELLED'].includes(order.status)) {
        return { success: false, orderId, status: order.status, order };
      }
      
      attempts++;
      if (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, interval));
        return poll();
      } else {
        return { success: false, orderId};
      }
    } catch (error) {
      console.error('Error polling order status:', error);
      return { success: false };
    }
  };
  
  return poll();
};

// CSS for spinner animation
const spinnerStyles = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

// Inject styles if not already present
if (typeof document !== 'undefined' && !document.getElementById('order-status-styles')) {
  const style = document.createElement('style');
  style.id = 'order-status-styles';
  style.textContent = spinnerStyles;
  document.head.appendChild(style);
}
