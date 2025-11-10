# Cart System với Variant Support - Requirement & Implementation

## ✅ **Cart Item Data Model (Chuẩn)**

Mỗi item trong giỏ hàng phải có:

```typescript
cartItem = {
  productId: string;        // ID sản phẩm
  variantId: string;        // QUAN TRỌNG để phân biệt variant
  sku: string;             // dùng để track variant trong kho
  quantity: number;

  // Optional hiển thị
  productName: string;
  variantName: string;     // "Red / Size M"
  thumbnailUrl: string;
  unitPrice: number;
  totalPrice: number;
}
```

---

## ✅ **Variant Structure Chuẩn**

Trong DB `product_variant` hoặc trong `items` khi trả API sản phẩm:

```json
{
  "id": "fc734035-40fe-441c-a989-92004dc368fb-variant-0",
  "sku": "fc734035-...-color-red-size-m",
  "color_id": "uuid-color-red",
  "size_id": "uuid-size-m",
  "price": 123.00,
  "stock": 15
}
```

**Nghĩa là:**
- FE phải có dropdown chọn **color** và **size**
- BE phải lưu `variantId` vào **cart** và **order.items**

---

## ✅ **API Add To Cart (POST /cart)**

### **Request**

```json
{
  "productId": "fc734035-40fe-441c-a989-92004dc368fb",
  "variantId": "fc734035-40fe-441c-a989-92004dc368fb-variant-0",
  "quantity": 1
}
```

### **Response**

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

---

## ✅ **API Get Cart (GET /cart)**

### **Response**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "cart-item-uuid",
        "productId": "...",
        "variantId": "...",
        "productName": "...",
        "variantName": "Red / M",
        "sku": "...",
        "unitPrice": "123.00",
        "quantity": 2,
        "totalPrice": "246.00",
        "thumbnailUrl": "..."
      }
    ],
    "subtotal": "246.00",
    "totalItems": 2
  }
}
```

---

## ✅ **API Update Cart Item (PATCH /cart/:itemId)**

### **Request**

```json
{
  "quantity": 3
}
```

### **Response**

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

---

## ✅ **API Delete Cart Item (DELETE /cart/:itemId)**

### **Response**

```json
{
  "success": true,
  "message": "Cart item deleted"
}
```

---

## ✅ **FE UI Logic Khi Chọn Variant**

1. Chọn **Color** → Filter list size theo color
2. Chọn **Size** → lấy đúng variantId tương ứng
3. Khi bấm Add to Cart → gọi API như trên

**Validation:**
- Nếu user bấm add khi **chưa chọn đủ** color/size:
  - Show toast: *"Vui lòng chọn màu và size trước"*

---

## ✅ **Cart Logic - Phân Biệt Variant**

**QUAN TRỌNG:** Cùng 1 product nhưng khác variant → **2 items khác nhau**

```typescript
// ❌ SAI - Chỉ check productId
if (item.productId === newItem.productId) {
  // Gộp lại → SAI!
}

// ✅ ĐÚNG - Check cả productId + variantId
if (item.productId === newItem.productId && item.variantId === newItem.variantId) {
  // Tăng quantity
} else {
  // Thêm item mới
}
```

---

## ✅ **Giải Quyết Case Nhiều Địa Chỉ**

Data user đã có `addresses[]`, vậy:

- Khi user checkout → FE cho chọn địa chỉ từ danh sách
- Nếu user chưa có địa chỉ → mở modal Add Address

Không cần parse từ notes nữa 👍

---

## ✅ **Implementation Plan**

### **Phase 1: Backend API (BE)**
1. ✅ Tạo Cart Entity/Model
2. ✅ Tạo Cart Controller + Service
3. ✅ Implement CRUD operations
4. ✅ Validate variantId exists

### **Phase 2: Frontend Types & API Client (FE)**
1. ✅ Update ICheckoutItem type với variantId
2. ✅ Tạo cart API client
3. ✅ Tạo cart hooks (useCart, useAddToCart, etc.)

### **Phase 3: Refactor Cart Logic (FE)**
1. ✅ Update CheckoutProvider để check variantId
2. ✅ Update add to cart logic
3. ✅ Update cart display components

### **Phase 4: UI Enhancement (FE)**
1. ✅ Validate color/size selection
2. ✅ Show variant info trong cart
3. ✅ Update checkout flow

---

## ✅ **Migration Notes**

**Từ localStorage → Backend API:**
- Migrate existing cart items từ localStorage
- Map variant từ color/size → variantId
- Handle missing variantId gracefully

