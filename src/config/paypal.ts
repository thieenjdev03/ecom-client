const baseUrl = process.env.NEXT_PUBLIC_API_URL;

// PayPal Configuration
export const PAYPAL_CONFIG = {
  // PayPal Client ID from environment variables
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "AUTUidBwLAlKUay1EED_Fo-5q4Qd3VzQ_3CGmGhlIkytMYDRUKtkMJla9lTv2neCdPo-Zgti11qdOl7H",
  
  // Currency settings
  currency: process.env.NEXT_PUBLIC_PAYPAL_CURRENCY || "USD",
  
  // PayPal environment (sandbox or live)
  environment: process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT || "live",
  
  // Intent for payments
  intent: "capture",
  
  // Button styling
  buttonStyle: {
    layout: "vertical" as const,
    color: "blue" as const,
    shape: "rect" as const,
    height: 45,
  },
  
  // API endpoints - matching backend structure from document
  apiEndpoints: {
    createOrder: `${baseUrl}/paypal/create-order`,
    captureOrder: `${baseUrl}/paypal/capture-order`,
    orderDetails: `${baseUrl}/paypal/order`,
    mailConfirmation: `${baseUrl}/mail/order-confirmation`,
    fileUpload: `${baseUrl}/files/upload`,
    orderHistory: `${baseUrl}/orders/history`,
  },
  
  // File upload settings
  fileUpload: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    acceptedTypes: ['image/*', '.pdf', '.doc', '.docx'],
    folder: 'orders',
  },
  
  // Email settings
  email: {
    from: process.env.NEXT_PUBLIC_EMAIL_FROM || "noreply@yourstore.com",
    support: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@yourstore.com",
  },
};

// Validation helpers
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const formatCurrency = (amount: number, currency: string = "USD"): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Error handling helpers
export const getErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    PAYMENT_CANCELLED: 'Payment was cancelled by the user. No charges were made.',
    PAYMENT_FAILED: 'Payment processing failed. Please check your payment method and try again.',
    INSUFFICIENT_FUNDS: 'Insufficient funds in your account. Please use a different payment method.',
    CARD_DECLINED: 'Your card was declined. Please contact your bank or use a different payment method.',
    NETWORK_ERROR: 'Network error occurred. Please check your internet connection and try again.',
    TIMEOUT: 'Payment request timed out. Please try again.',
    AUTHENTICATION_FAILURE: 'Authentication failed. Please log in again and try the payment.',
    NO_ERROR_DETAILS: 'Unable to retrieve error details. Please contact support if the issue persists.',
  };
  
  return errorMessages[errorCode] || 'An unexpected error occurred during payment processing.';
};

export const getErrorSeverity = (errorCode: string): 'error' | 'warning' | 'info' => {
  switch (errorCode) {
    case 'PAYMENT_CANCELLED':
      return 'warning';
    case 'NO_ERROR_DETAILS':
      return 'info';
    default:
      return 'error';
  }
};
