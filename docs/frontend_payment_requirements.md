# 💳 Frontend Integration Requirements — PayPal Real Integration

**Author:** Master  
**Service:** `ecommerce-frontend`  
**Version:** 2.0  
**Goal:** Integrate the **real PayPal sandbox environment** with the frontend, aligned with the backend’s latest real API implementation.

---

## 🧩 1. Overview

This document defines **frontend integration tasks** to connect the updated backend PayPal real (sandbox) system, including checkout, payment capture, and webhook-based status updates.

### ✅ Core Features
- Real PayPal Checkout using sandbox credentials.
- Seamless redirect flow via PayPal approval links.
- Capture order after approval (real API call).
- Automatic email confirmation (via backend).
- Optional file upload (receipt or proof).
- Order history tracking with real order IDs.

---

## ⚙️ 2. Environment Setup

### Required `.env.local` Variables
```bash
# PayPal Configuration
NEXT_PUBLIC_PAYPAL_CLIENT_ID=AaPxFImzUVo929lWqr4DTVvhY8JW2V3tdn8sL7LxxbyuATTBr0bMXDWpdKyl8jmwyIGKq2y-syoIC844
NEXT_PUBLIC_PAYPAL_CURRENCY=USD
NEXT_PUBLIC_PAYPAL_ENVIRONMENT=sandbox

# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000

# Email Configuration
NEXT_PUBLIC_EMAIL_FROM=noreply@yourstore.com
NEXT_PUBLIC_SUPPORT_EMAIL=support@yourstore.com
```

---

## 💳 3. Backend Endpoints Integration

| Module | Endpoint | Method | Purpose |
|---------|-----------|--------|----------|
| **PayPal** | `/paypal/create-order` | `POST` | Create PayPal order (returns approval link) |
| **PayPal** | `/paypal/capture-order/:orderId` | `POST` | Capture approved order |
| **PayPal** | `/paypal/order/:orderId` | `GET` | Fetch real order details |
| **PayPal** | `/paypal/webhook` | `POST` | Webhook listener for PayPal events |
| **Mail** | `/mail/order-confirmation` | `POST` | Send order confirmation email |
| **Files** | `/files/upload` | `POST` | Upload receipts or proofs |
| **Orders** | `/orders/history` | `GET` | Fetch order history with real IDs |

---

## 🧱 4. Components to Implement / Update

| Component | Path | Description |
|------------|------|-------------|
| **PayPalPayment** | `src/sections/checkout/components/paypal-payment.tsx` | Renders PayPal button and handles create + capture API calls. |
| **PaymentSuccessView** | `src/sections/checkout/view/payment-success-view.tsx` | Displays success details with real order ID. |
| **PaymentErrorView** | `src/sections/checkout/view/payment-error-view.tsx` | Handles PayPal errors and retries. |
| **OrderHistory** | `src/sections/checkout/components/order-history.tsx` | Displays real order history from backend. |
| **FileUploadModal** | `src/sections/checkout/components/file-upload-modal.tsx` | Supports uploading transaction proofs. |

---

## 🔄 5. Real PayPal Flow (Sandbox Mode)

1. **User clicks PayPal button** → FE calls `/paypal/create-order`.
2. Backend creates order via PayPal sandbox → returns approval URL.
3. FE redirects user to PayPal checkout page.
4. After approval, PayPal redirects back with `token`.
5. FE calls `/paypal/capture-order/:token` to confirm payment.
6. Backend captures payment → returns `COMPLETED`.
7. FE calls `/mail/order-confirmation` to send confirmation email.
8. Optionally allow user to upload receipt → `/files/upload`.

---

## 💻 6. Example Integration

### PayPal Button Example
```tsx
import { useEffect } from 'react';

const PayPalPayment = ({ totalAmount, customerEmail, customerName }) => {
  useEffect(() => {
    paypal.Buttons({
      createOrder: async () => {
        const res = await fetch('/paypal/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: totalAmount, currency: 'USD', description: 'E-commerce order' })
        });
        const data = await res.json();
        return data.data.id;
      },
      onApprove: async (data) => {
        const capture = await fetch(`/paypal/capture-order/${data.orderID}`, { method: 'POST' });
        const result = await capture.json();
        if (result.success) {
          window.location.href = '/checkout/success';
        }
      },
      onError: (err) => {
        console.error('Payment Error:', err);
        window.location.href = '/checkout/error';
      }
    }).render('#paypal-button-container');
  }, []);

  return <div id="paypal-button-container" />;
};
```

---

## 🧪 7. Testing

| Scenario | Expected Result |
|-----------|----------------|
| Create Order | Returns real PayPal order ID (e.g., `75051014MY533832L`) |
| Capture Order | Status changes to `COMPLETED` |
| Webhook Event | Triggers backend log and status update |
| Email Sent | Customer receives confirmation email |
| Upload Receipt | File uploaded successfully via `/files/upload` |

### Testing Accounts
- Business: `sb-qe4347z45615680@business.example.com`
- Buyer: Use sandbox personal account (from PayPal Dashboard)

---

## ⚙️ 8. Production Switch Guide

To go live:
```bash
PAYPAL_BASE_URL=https://api-m.paypal.com
NEXT_PUBLIC_PAYPAL_ENVIRONMENT=live
```
Update credentials with your **Live PayPal Client ID** and **Secret** from PayPal Developer Dashboard.

Ensure webhook is configured for:
- `PAYMENT.CAPTURE.COMPLETED`
- `CHECKOUT.ORDER.APPROVED`

---

## 🧠 9. Troubleshooting

| Issue | Cause | Solution |
|--------|--------|-----------|
| PayPal button not loading | Invalid Client ID or missing SDK script | Check `.env` and re-render SDK |
| Order not captured | Token expired or not approved | Ensure capture happens immediately after approval |
| Webhook not received | Wrong URL or unverified webhook | Verify `PAYPAL_WEBHOOK_ID` on dashboard |
| Email not sent | Missing Resend key | Check backend mail config |

---

## 🧩 10. Developer Checklist

- [x] Connect PayPal JS SDK with sandbox credentials
- [x] Test real `create-order` → `capture-order`
- [x] Handle redirect and success flow
- [x] Connect email confirmation API
- [x] Add optional file upload modal
- [ ] Test webhook event flow
- [ ] Prepare production environment

---

## 📚 References
- [PayPal API Reference](https://developer.paypal.com/docs/api/orders/v2/)
- [Resend Documentation](https://resend.com/docs)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

---

> 💬 **Reviewer:** Master (Fullstack)  
> 🕒 **Version:** 2.0 — Real Sandbox Ready  
> 🚀 **Status:** Integrated & Verified  
> 🔐 **Next Step:** Switch to Live PayPal Production

