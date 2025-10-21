# 🛒 Cart Preview (Right-Side Drawer)

## 🎯 Mục tiêu
Hiển thị **bản tóm tắt giỏ hàng** khi người dùng bấm vào biểu tượng "Cart" ở thanh điều hướng, giúp họ xem nhanh sản phẩm đã chọn mà không cần rời khỏi trang hiện tại.

---

## 🧩 1. Cấu trúc dữ liệu hiển thị

Cart preview sẽ dựa trên cấu trúc dữ liệu sản phẩm từ backend (product entity):

| Trường | Kiểu | Mô tả hiển thị |
|--------|------|----------------|
| `id` | Number | ID sản phẩm (dùng để cập nhật/tăng giảm/xóa) |
| `name` | String | Tên sản phẩm |
| `slug` | String | Liên kết tới trang chi tiết sản phẩm |
| `price` | Number/String | Giá gốc (hiển thị gạch ngang nếu có `sale_price`) |
| `sale_price` | Number/String | Giá khuyến mãi, nếu có |
| `images[0]` | String | Ảnh đại diện sản phẩm |
| `quantity` | Number | Số lượng người dùng chọn |
| `variant` *(optional)* | Object | Biến thể (màu sắc, kích cỡ, v.v.) |
| `subtotal` | Computed | `quantity * (sale_price || price)` |

---

## 🧱 2. Cấu trúc UI

### 🧭 Vị trí & Layout
- Modal trượt từ **cạnh phải màn hình** (right drawer).
- Kích thước: **~400px** trên desktop, **full width** trên mobile.
- Overlay nền mờ để tập trung vào modal.
- Click ra ngoài hoặc bấm **ESC / nút Close (x)** để đóng.

### 🧩 Các phần trong modal

#### A. Header
- **Tiêu đề:** “Giỏ hàng của bạn”
- **Nút đóng (X)** ở góc phải trên.

#### B. Danh sách sản phẩm
Mỗi item gồm:
- Ảnh (image thumbnail)
- Tên sản phẩm (click để vào trang chi tiết `/product/:slug`)
- Biến thể (nếu có)
- Giá hiển thị (ưu tiên `sale_price`)
- Bộ nút tăng/giảm số lượng (+ / –)
- Tổng tiền nhỏ cho item (`subtotal`)
- Nút 🗑 “Xóa khỏi giỏ”

#### C. Footer (Tổng kết)
- Tổng số sản phẩm (`total_items`)
- Tổng tiền (`total_price`)
- Nút **"Xem giỏ hàng"** → `/cart`
- Nút **"Thanh toán"** → `/checkout`

---

## ⚙️ 3. Yêu cầu chức năng

| Tính năng | Mô tả chi tiết |
|------------|----------------|
| **Mở/đóng modal** | Khi bấm icon giỏ hàng → modal trượt ra; click overlay hoặc nút “X” → đóng |
| **Tăng/giảm số lượng** | Gọi API `/cart/update` hoặc cập nhật local state → cập nhật `subtotal` và `total` |
| **Xóa sản phẩm** | Gọi API `/cart/remove` hoặc cập nhật local state |
| **Cập nhật tổng tiền** | Tính lại `total_price` sau mỗi hành động (tăng/giảm/xóa) |
| **Đi đến checkout** | Redirect đến `/checkout` (kèm dữ liệu giỏ hàng hiện tại) |
| **Responsive** | - Desktop: width 400px<br>- Mobile: full screen (slide từ phải hoặc từ dưới lên) |

---

## 🔄 4. Dữ liệu mẫu (mock)

```json
{
  "cart": [
    {
      "id": 14,
      "name": "Polo Basic Black",
      "slug": "polo-basic-black",
      "price": 299000,
      "sale_price": 259000,
      "quantity": 2,
      "images": [
        "https://www.victoriassecret.com/p/1000x1333/png/..._OM_S.jpg"
      ],
      "variant": {
        "color": "Black",
        "size": "M"
      },
      "subtotal": 518000
    }
  ],
  "total_items": 2,
  "total_price": 518000
}
```

---

## 🧠 5. Kỹ thuật triển khai

| Mục | Mô tả |
|-----|-------|
| **Component** | `CartPreviewDrawer.tsx` |
| **State** | Dùng `Zustand` hoặc `Context` để share state giỏ hàng |
| **Animation** | Dùng `framer-motion` hoặc CSS transition |
| **API endpoints** | `GET /cart`, `POST /cart/update`, `DELETE /cart/remove` |
| **UI Library (optional)** | ShadCN Drawer / Radix Dialog / Chakra Drawer |
| **Data sync** | Nếu user chưa login → lưu localStorage; nếu login → sync server |

---

## 🧾 6. Acceptance Criteria (Tiêu chí hoàn thành)
- [ ] Modal hiển thị khi click vào icon giỏ hàng.  
- [ ] Có thể tăng/giảm/xóa sản phẩm.  
- [ ] Tổng tiền cập nhật realtime.  
- [ ] Responsive đầy đủ (desktop + mobile).  
- [ ] Animation mượt, không giật.  
- [ ] Có nút chuyển đến `/checkout`.  

---

## 📘 7. Ghi chú
- Sử dụng font và màu sắc đồng nhất với theme tổng thể của trang.  
- Khi giỏ hàng rỗng → hiển thị icon trống + dòng “Giỏ hàng của bạn đang trống.”  

---

> **Tệp này dành cho Frontend team** để implement component `CartPreviewDrawer` theo đúng hành vi người dùng mong đợi.
