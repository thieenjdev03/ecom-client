# GET Order Detail API

## Endpoint

```
GET /orders/:orderId
```

## Headers

| Key           | Value                   |
| ------------- | ----------------------- |
| Authorization | `Bearer <access_token>` |
| Accept        | `application/json`      |

**Example:**

```bash
curl -X GET \
  'http://localhost:3000/orders/2313cdd6-e689-45da-947c-18c414a44dcf' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer <token>'
```

---

## Response Body (Success)

```json
{
  "data": {
    "id": "2313cdd6-e689-45da-947c-18c414a44dcf",
    "userId": "be51a8c8-0d30-46fe-82af-a1f53b46de06",
    "orderNumber": "ORD-20251105-0001",
    "status": "PAID",
    "paymentMethod": "PAYPAL",
    "paypalOrderId": "PAYPAL-1762451881791-0",
    "paypalTransactionId": "TXN-1762451881791-0",
    "paidAmount": "249000.00",
    "paidCurrency": "USD",
    "paidAt": "2025-11-04T17:58:01.791Z",

    "items": [
      {
        "sku": "TEE-WHITE-001",
        "quantity": 1,
        "productId": 1,
        "unitPrice": "249000.00",
        "totalPrice": "249000",
        "productName": "Basic White T-Shirt",
        "productSlug": "basic-white-tshirt"
      }
    ],

    "summary": {
      "tax": "24900",
      "total": "323900",
      "currency": "VND",
      "discount": "0.00",
      "shipping": "50000",
      "subtotal": "249000"
    },

    "shippingAddressId": "e058edac-42d8-4553-856a-ba7baaab6f07",
    "billingAddressId": "e058edac-42d8-4553-856a-ba7baaab6f07",
    "notes": "Please deliver in the morning",
    "internalNotes": null,
    "trackingNumber": null,
    "carrier": null,
    "shippedAt": null,
    "deliveredAt": null,
    "createdAt": "2025-11-04T17:58:01.791Z",
    "updatedAt": "2025-11-06T10:58:01.790Z",

    "user": {
      "id": "be51a8c8-0d30-46fe-82af-a1f53b46de06",
      "email": "buy@gmail.com",
      "firstName": "GKIM TEST",
      "lastName": "Thiện 1",
      "country": "Vietnam",
      "phoneNumber": "+84 826426888"
    },

    "shippingAddress": {
      "recipientName": "GKIM TEST Thiện 1",
      "recipientPhone": "+84 826426888",
      "label": "Home",
      "province": "Ho Chi Minh City",
      "district": "District 1",
      "ward": "Ben Nghe Ward",
      "streetLine1": "123 Nguyen Hue Street",
      "streetLine2": "Apartment 4B",
      "postalCode": "700000",
      "note": "Please ring the doorbell"
    },

    "billingAddress": {
      "recipientName": "GKIM TEST Thiện 1",
      "recipientPhone": "+84 826426888",
      "label": "Home",
      "province": "Ho Chi Minh City",
      "district": "District 1",
      "ward": "Ben Nghe Ward",
      "streetLine1": "123 Nguyen Hue Street",
      "streetLine2": "Apartment 4B",
      "postalCode": "700000",
      "note": "Please ring the doorbell"
    }
  },
  "message": "Success",
  "success": true
}
```

---

## Field Meaning

| Field                    | Description                                                                 |
| ------------------------ | --------------------------------------------------------------------------- |
| status                   | Trạng thái đơn hàng: `PENDING`, `PAID`, `SHIPPED`, `DELIVERED`, `CANCELLED` |
| summary                  | Chi tiết tính tiền gồm subtotal, shipping, discount, tax và total           |
| items                    | Danh sách sản phẩm trong đơn                                                |
| shippingAddress          | Địa chỉ giao hàng đầy đủ đã chuẩn hóa                                       |
| billingAddress           | Địa chỉ thanh toán                                                          |
| user                     | Thông tin người mua                                                         |
| notes                    | Ghi chú của khách                                                           |
| internalNotes            | Ghi chú nội bộ (admin mới thấy)                                             |
| trackingNumber + carrier | Dùng cho shipping/tracking                                                  |

---

## Usage (FE UI)

* Gọi API này để hiển thị trang **Order Detail**
* Không cần join thêm gì vì API trả **đầy đủ data** sẵn

---

## Error Responses

### 404 Not Found

```json
{
  "success": false,
  "message": "Order not found",
  "data": null
}
```

### 401 Unauthorized

```json
{
  "success": false,
  "message": "Unauthorized",
  "data": null
}
```

### 500 Internal Server Error

```json
{
  "success": false,
  "message": "Internal server error",
  "data": null
}
```

