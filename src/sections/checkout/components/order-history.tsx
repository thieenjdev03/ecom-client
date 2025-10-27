"use client";

import { useState, useEffect } from "react";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

import Iconify from "src/components/iconify";
import { fCurrency } from "src/utils/format-number";
import { paypalApiService } from "src/services/paypal-api";

// ----------------------------------------------------------------------

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
  variant?: string;
}

interface Order {
  id: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  total: number;
  currency: string;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
  customerEmail: string;
  customerName: string;
  paymentMethod: string;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
}

interface OrderHistoryProps {
  customerEmail?: string;
}

export default function OrderHistory({ customerEmail }: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchOrderHistory();
  }, [customerEmail]);

  const fetchOrderHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await paypalApiService.getOrderHistory();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch order history');
      }

      setOrders(result.data?.orders || []);
    } catch (err) {
      console.error('Error fetching order history:', err);
      setError('Failed to load order history');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'PENDING':
        return 'warning';
      case 'CANCELLED':
        return 'error';
      case 'REFUNDED':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'eva:checkmark-circle-fill';
      case 'PENDING':
        return 'eva:clock-fill';
      case 'CANCELLED':
        return 'eva:close-circle-fill';
      case 'REFUNDED':
        return 'eva:refresh-fill';
      default:
        return 'eva:help-circle-fill';
    }
  };

  const handleExpandOrder = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleDownloadInvoice = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/invoice`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to download invoice');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading invoice:', err);
    }
  };

  const handleReorder = (order: Order) => {
    // Add items to cart and redirect to checkout
    const items = order.items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image,
      variant: item.variant,
    }));

    localStorage.setItem('reorderItems', JSON.stringify(items));
    window.location.href = '/checkout';
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
        <Button onClick={fetchOrderHistory} sx={{ ml: 2 }}>
          Retry
        </Button>
      </Alert>
    );
  }

  if (orders.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Iconify icon="eva:shopping-bag-outline" sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" sx={{ mb: 1 }}>
          No Orders Found
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          You haven't placed any orders yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      {orders.map((order) => (
        <Card key={order.id} sx={{ p: 3 }}>
          <Stack spacing={2}>
            {/* Order Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack spacing={1}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Order #{order.id}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                </Typography>
              </Stack>
              
              <Stack direction="row" spacing={2} alignItems="center">
                <Chip
                  icon={<Iconify icon={getStatusIcon(order.status)} />}
                  label={order.status}
                  color={getStatusColor(order.status) as any}
                  variant="outlined"
                />
                <IconButton
                  onClick={() => handleExpandOrder(order.id)}
                  size="small"
                >
                  <Iconify 
                    icon={expandedOrder === order.id ? "eva:chevron-up-fill" : "eva:chevron-down-fill"} 
                  />
                </IconButton>
              </Stack>
            </Stack>

            {/* Order Summary */}
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {order.items.length} item{order.items.length !== 1 ? 's' : ''}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {fCurrency(order.total)} {order.currency}
              </Typography>
            </Stack>

            {/* Expandable Details */}
            <Collapse in={expandedOrder === order.id}>
              <Divider sx={{ my: 2 }} />
              
              <Stack spacing={3}>
                {/* Order Items */}
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                    Order Items
                  </Typography>
                  <Stack spacing={2}>
                    {order.items.map((item, index) => (
                      <Stack key={index} direction="row" spacing={2} alignItems="center">
                        <Avatar
                          src={item.image || "/assets/images/product/product_1.jpg"}
                          variant="rounded"
                          sx={{ width: 50, height: 50 }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.name}
                          </Typography>
                          {item.variant && (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              {item.variant}
                            </Typography>
                          )}
                        </Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          x{item.quantity}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {fCurrency(item.price * item.quantity)}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>

                {/* Order Details */}
                <Stack spacing={2}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Order Details
                  </Typography>
                  
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Payment Method:
                      </Typography>
                      <Typography variant="body2">
                        {order.paymentMethod}
                      </Typography>
                    </Stack>
                    
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Customer:
                      </Typography>
                      <Typography variant="body2">
                        {order.customerName}
                      </Typography>
                    </Stack>
                    
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Email:
                      </Typography>
                      <Typography variant="body2">
                        {order.customerEmail}
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>

                {/* Action Buttons */}
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleDownloadInvoice(order.id)}
                    startIcon={<Iconify icon="eva:download-fill" />}
                  >
                    Download Invoice
                  </Button>
                  
                  {order.status === 'COMPLETED' && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleReorder(order)}
                      startIcon={<Iconify icon="eva:shopping-cart-fill" />}
                    >
                      Reorder
                    </Button>
                  )}
                </Stack>
              </Stack>
            </Collapse>
          </Stack>
        </Card>
      ))}
    </Stack>
  );
}
