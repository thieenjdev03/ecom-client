# Cart API Specification

## Base URL
```
POST /cart
GET /cart
PATCH /cart/:itemId
DELETE /cart/:itemId
```

## Headers

| Key           | Value                   |
| ------------- | ----------------------- |
| Authorization | `Bearer <access_token>` |
| Accept        | `application/json`      |
| Content-Type  | `application/json`       |

---

## 1. Add Item to Cart

### **POST /cart**

### Request Body

```json
{
  "productId": "fc734035-40fe-441c-a989-92004dc368fb",
  "variantId": "fc734035-40fe-441c-a989-92004dc368fb-variant-0",
  "quantity": 1
}
```

### Response (Success - 200)

```json
{
  "success": true,
  "message": "Added to cart",
  "data": {
    "id": "cart-item-uuid",
    "productId": "fc734035-40fe-441c-a989-92004dc368fb",
    "variantId": "fc734035-40fe-441c-a989-92004dc368fb-variant-0",
    "productName": "Áo sơ mi nam1123",
    "variantName": "Red / M",
    "sku": "fc734035-...-color-red-size-m",
    "unitPrice": "123.00",
    "quantity": 1,
    "totalPrice": "123.00",
    "thumbnailUrl": "https://..."
  }
}
```

### Response (Error - 400)

```json
{
  "success": false,
  "message": "Variant not found or out of stock",
  "data": null
}
```

### Business Logic

- Nếu item với cùng `productId` + `variantId` đã tồn tại → **tăng quantity** (không tạo mới)
- Validate `variantId` exists và có stock
- Validate quantity không vượt quá stock available

---

## 2. Get Cart

### **GET /cart**

### Response (Success - 200)

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "cart-item-uuid-1",
        "productId": "fc734035-40fe-441c-a989-92004dc368fb",
        "variantId": "fc734035-40fe-441c-a989-92004dc368fb-variant-0",
        "productName": "Áo sơ mi nam1123",
        "variantName": "Red / M",
        "sku": "fc734035-...-color-red-size-m",
        "unitPrice": "123.00",
        "quantity": 2,
        "totalPrice": "246.00",
        "thumbnailUrl": "https://..."
      },
      {
        "id": "cart-item-uuid-2",
        "productId": "fc734035-40fe-441c-a989-92004dc368fb",
        "variantId": "fc734035-40fe-441c-a989-92004dc368fb-variant-1",
        "productName": "Áo sơ mi nam1123",
        "variantName": "Blue / L",
        "sku": "fc734035-...-color-blue-size-l",
        "unitPrice": "123.00",
        "quantity": 1,
        "totalPrice": "123.00",
        "thumbnailUrl": "https://..."
      }
    ],
    "subtotal": "369.00",
    "totalItems": 3
  }
}
```

---

## 3. Update Cart Item Quantity

### **PATCH /cart/:itemId**

### Request Body

```json
{
  "quantity": 3
}
```

### Response (Success - 200)

```json
{
  "success": true,
  "message": "Cart item updated",
  "data": {
    "id": "cart-item-uuid",
    "quantity": 3,
    "totalPrice": "369.00"
  }
}
```

### Response (Error - 400)

```json
{
  "success": false,
  "message": "Quantity exceeds available stock",
  "data": null
}
```

---

## 4. Delete Cart Item

### **DELETE /cart/:itemId**

### Response (Success - 200)

```json
{
  "success": true,
  "message": "Cart item deleted"
}
```

---

## Data Model

### Cart Item Entity

```typescript
{
  id: string;              // UUID
  userId: string;          // Foreign key to User
  productId: string;       // Foreign key to Product
  variantId: string;       // Foreign key to ProductVariant
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Response DTO

```typescript
{
  id: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  unitPrice: string;
  quantity: number;
  totalPrice: string;
  thumbnailUrl: string;
}
```

---

## Validation Rules

1. **Add to Cart:**
   - `productId` must exist
   - `variantId` must exist and belong to `productId`
   - `variantId` must have stock > 0
   - `quantity` must be > 0 and <= available stock

2. **Update Quantity:**
   - `quantity` must be > 0
   - `quantity` must not exceed available stock

3. **Delete:**
   - User can only delete their own cart items

---

## Notes

- Cart is **user-specific** (filtered by userId from JWT token)
- Same product with different variants = **different cart items**
- Cart items are automatically removed when variant is deleted
- Stock is checked in real-time (not reserved until checkout)

