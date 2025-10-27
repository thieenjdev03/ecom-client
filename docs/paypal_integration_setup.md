# 💳 PayPal Payment Integration

This document provides setup instructions for the PayPal payment integration implemented according to the frontend payment requirements.

## 🚀 Features Implemented

### ✅ Core Features
- **PayPal Checkout Integration** - Full PayPal JS SDK integration
- **Payment Success/Error Pages** - Dedicated pages for payment outcomes
- **Email Confirmation** - Automatic order confirmation emails
- **File Upload Support** - Optional receipt/proof upload
- **Order History** - Complete order management system
- **Mock & Real Mode Support** - Development and production ready

### 📁 Components Created

1. **PayPal Payment Component** (`src/sections/checkout/components/paypal-payment.tsx`)
   - Integrated PayPal JS SDK
   - Backend API integration
   - Loading states and error handling
   - Email validation

2. **Payment Success Page** (`src/sections/checkout/view/payment-success-view.tsx`)
   - Order confirmation display
   - Receipt download functionality
   - Continue shopping flow

3. **Payment Error Page** (`src/sections/checkout/view/payment-error-view.tsx`)
   - Error handling and display
   - Retry functionality
   - Support contact integration

4. **Order History Component** (`src/sections/checkout/components/order-history.tsx`)
   - Order listing and details
   - Status tracking
   - Reorder functionality

5. **File Upload Modal** (`src/sections/checkout/components/file-upload-modal.tsx`)
   - Drag & drop file upload
   - Progress tracking
   - File validation

## 🔧 Setup Instructions

### 1. Environment Variables

Create a `.env.local` file with the following variables:

```bash
# PayPal Configuration
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_paypal_client_id_here
NEXT_PUBLIC_PAYPAL_CURRENCY=USD
NEXT_PUBLIC_PAYPAL_ENVIRONMENT=sandbox

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_API_URL=http://localhost:3001

# Email Configuration
NEXT_PUBLIC_EMAIL_FROM=noreply@yourstore.com
NEXT_PUBLIC_SUPPORT_EMAIL=support@yourstore.com
```

### 2. PayPal SDK Installation

The PayPal React SDK is already included. If you need to install it manually:

```bash
npm install @paypal/react-paypal-js
```

### 3. Backend API Endpoints

Ensure your backend has the following endpoints:

- `POST /api/paypal/create-order` - Create PayPal order
- `POST /api/paypal/capture-order/:orderId` - Capture approved order
- `POST /api/mail/order-confirmation` - Send confirmation email
- `POST /api/files/upload` - Upload files
- `GET /api/orders/history` - Get order history

### 4. Routes Added

The following routes have been added:

- `/checkout/success` - Payment success page
- `/checkout/error` - Payment error page
- `/orders` - Order history page

## 🎯 Usage

### Basic PayPal Integration

```tsx
import PayPalPayment from "src/sections/checkout/components/paypal-payment";

<PayPalPayment
  paypalEmail={email}
  onEmailChange={setEmail}
  totalAmount={total}
  onPaymentSuccess={handleSuccess}
  onPaymentError={handleError}
  orderItems={items}
  customerName="John Doe"
/>
```

### Order History

```tsx
import OrderHistory from "src/sections/checkout/components/order-history";

<OrderHistory customerEmail="customer@example.com" />
```

### File Upload

```tsx
import FileUploadModal from "src/sections/checkout/components/file-upload-modal";

<FileUploadModal
  open={showUpload}
  onClose={() => setShowUpload(false)}
  orderId="order123"
  onUploadSuccess={handleSuccess}
  onUploadError={handleError}
/>
```

## 🔄 Payment Flow

1. **Order Creation**: User fills checkout form and clicks PayPal button
2. **PayPal Redirect**: User is redirected to PayPal for payment approval
3. **Payment Capture**: After approval, payment is captured via backend API
4. **Email Confirmation**: Confirmation email is sent automatically
5. **Success Page**: User is redirected to success page with order details
6. **File Upload**: Optional receipt upload functionality

## 🛠️ Configuration

### PayPal Configuration (`src/config/paypal.ts`)

```typescript
export const PAYPAL_CONFIG = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
  currency: "USD",
  environment: "sandbox", // or "live"
  intent: "capture",
  // ... other settings
};
```

### Error Handling

The system includes comprehensive error handling for:
- Payment failures
- Network errors
- Authentication issues
- File upload errors
- Email sending failures

## 🧪 Testing

### Mock Mode
- Set `NEXT_PUBLIC_PAYPAL_ENVIRONMENT=sandbox`
- Use PayPal sandbox credentials
- Test with PayPal sandbox accounts

### Real Mode
- Set `NEXT_PUBLIC_PAYPAL_ENVIRONMENT=live`
- Use production PayPal credentials
- Test with real PayPal accounts

## 📱 Responsive Design

All components are fully responsive and work on:
- Desktop computers
- Tablets
- Mobile phones

## 🔒 Security

- JWT token authentication
- Secure API endpoints
- Input validation
- File type restrictions
- File size limits

## 🐛 Troubleshooting

### Common Issues

1. **"PayPal button not loading"**
   - Check PayPal client ID
   - Verify environment settings
   - Check network connectivity

2. **"Payment not captured"**
   - Verify backend API endpoints
   - Check authentication tokens
   - Review PayPal webhook configuration

3. **"Email not sent"**
   - Check email service configuration
   - Verify SMTP settings
   - Review email templates

## 📞 Support

For technical support or questions about the PayPal integration, please contact:
- Email: support@yourstore.com
- Documentation: [PayPal Developer Docs](https://developer.paypal.com/docs/)

## 🔄 Updates

This integration follows the PayPal API v2 specification and is regularly updated to maintain compatibility with the latest PayPal features and security requirements.
