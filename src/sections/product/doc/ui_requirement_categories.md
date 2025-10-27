# 🧭 UI REQUIREMENT: Product Categories Management

## 🎯 Mục tiêu
Tạo trang **Product Categories** trong Admin Dashboard cho phép quản lý danh mục sản phẩm (Category) dựa trên API `/categories`. Hệ thống hỗ trợ **thêm / sửa / xoá / xem** danh mục và có thể mở rộng để liên kết với **Color** và **Size** attributes.

---

## 🧱 1️⃣ Layout tổng thể

**Đường dẫn:** `/admin/categories`

**Cấu trúc trang:**
- Breadcrumb: `Dashboard / Products / Categories`
- Header: "Manage Categories"
- Body gồm:
  - Category List Table
  - Add / Edit Modal Form

---

## 🗂 2️⃣ Category List (GET /categories)

| Thành phần | Mô tả |
|-------------|-------|
| 🔍 Search box | Filter theo name hoặc slug (client filter hoặc call GET `/categories?search=...`) |
| 📋 Bảng danh mục | Hiển thị: `Name`, `Slug`, `Parent`, `Children Count`, `CreatedAt`, `Actions` |
| ✏️ Actions | Hai nút: **Edit** → mở modal PATCH, **Delete** → confirm rồi gọi DELETE |
| ➕ Button “Add Category” | Mở form thêm mới |
| 🔄 Refresh button | Gọi lại API GET `/categories` |

---

## 🪶 3️⃣ Add Category (POST /categories)

**Trigger:** Button “Add Category”

**Form field:**
- Name *(required)*
- Slug *(optional, auto từ name – có thể edit)*
- Parent *(dropdown từ `/categories` — cho phép chọn null)*

**Validation:**
- Không để trống name
- Slug unique → check khi API trả `409 Conflict`

**Submit action:**
- Gọi `POST /categories`
- Nếu thành công: đóng modal, reload bảng
- Nếu lỗi:
  - 409 → show toast “Slug already exists”
  - 404 → show toast “Parent category not found”

---

## 🧩 4️⃣ Edit Category (PATCH /categories/:id)

**Trigger:** Click nút ✏️ Edit trên từng dòng

**Form giống Add**, nhưng load dữ liệu từ `GET /categories/:id`

**Submit action:**
- Gọi `PATCH /categories/:id`
- Nếu thành công: toast success + reload list
- Nếu lỗi 409 / 404 / 400: hiển thị error tương ứng

---

## 🗑️ 5️⃣ Delete Category (DELETE /categories/:id)

**Trigger:** Nút 🗑 Delete trong bảng

**Confirm modal:**  
> “Bạn có chắc muốn xoá danh mục này không?  
> Hành động này không thể hoàn tác.”

**Submit action:**
- Gọi `DELETE /categories/:id`
- Thành công: reload list
- 404 → show “Category not found”

---

## 🧬 6️⃣ Data handling & UX flow

| Flow | Mô tả |
|------|-------|
| Create → Success | Đóng modal + toast success + reload list |
| Edit → Success | Đóng modal + toast success + update dòng đó |
| Delete → Success | Toast “Deleted successfully” + reload |
| Conflict / BadRequest | Hiển thị lỗi từ API dưới field tương ứng |
| Parent load | Gọi GET `/categories` để render dropdown “Parent Category” |

---

## 🎨 7️⃣ Liên kết mở rộng (Colors & Sizes)

Trang `/admin/categories` có thể:
- Có tab hoặc sidebar item mới: **Attributes**
- Tab 1: Categories (đang có)
- Tab 2: Attributes → gọi `/colors` và `/sizes`
- Khi thêm/sửa Category có thể có thêm field:

```ts
colors: Color[]
sizes: Size[]
```

→ Admin có thể chọn các màu/kích cỡ áp dụng cho danh mục đó.

---

## ⚙️ 8️⃣ Kỹ thuật đề xuất

| Thành phần | Công nghệ |
|-------------|-------------|
| Framework | Next.js (App Router) |
| UI | Tailwind + shadcn/ui + TanStack Table |
| Form | React Hook Form + Zod validation |
| API Fetching | React Query (TanStack Query) |
| Toast Notification | sonner hoặc shadcn/toast |
| Auth | Session/JWT admin |

---

## 🔖 9️⃣ Mapping API – UI Actions

| UI Action | API Endpoint | Method | Mô tả |
|------------|----------------|--------|-------|
| Load list | `/categories` | GET | Hiển thị tất cả danh mục |
| Add category | `/categories` | POST | Tạo danh mục mới |
| Edit category | `/categories/:id` | PATCH | Cập nhật danh mục |
| Delete category | `/categories/:id` | DELETE | Xoá danh mục |
| Load dropdown parent | `/categories` | GET | Lấy danh sách parent categories |

---

## ✅ 10️⃣ UX tiêu chuẩn
- Modal có nút **Cancel / Save** rõ ràng.
- Loading state khi submit form hoặc fetch list.
- Toast thông báo cho tất cả hành động CRUD.
- Bảng có pagination (10 items/page).
- Tự động cập nhật `updatedAt` khi edit.

---

**Tệp này liên kết trực tiếp với tài liệu API:** `categories-api.md`

> 📁 Đề xuất vị trí lưu: `ecom-client/docs/ui-requirement-categories.md`

