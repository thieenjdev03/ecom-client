# 🧩 Frontend Task Breakdown – Product Create Page

**Module:** `pages/admin/products/create.tsx`  
**Scope:** Build the Product Create Page supporting both **Simple Product** and **Variant Product** modes.  
**Goal:** Provide a fully validated form for creating products based on backend API `/products (POST)`.

---

## ✅ Overview

This document breaks down tasks for the **Product Create Page (B)** feature into structured, step-by-step tasks.  
Each task contains clear objectives, dependencies, and expected outcomes for frontend engineers.

---

## 🧱 Task 1 – Page and Route Setup ✅ (Done)

**🎯 Objective:** Setup the new route `/admin/products/create`.

**Steps:**
- Create page file: `pages/admin/products/create.tsx`
- Wrap with `AdminLayout`.
- Page title: “Tạo sản phẩm mới”.
- Add breadcrumb: “Sản phẩm / Tạo mới”.
- Prepare empty `ProductForm` component inside.

**Dependencies:** Layout and routing available.  
**Result:** Navigating to `/dashboard/product/new` loads the create page with Vietnamese breadcrumbs and heading.

---

## 🧱 Task 2 – Build Base Product Form Layout 🚧 (In progress)

**🎯 Objective:** Render all main input fields for product information.

**Fields:**
- `name` (TextInput)
- `slug` (TextInput – auto-generate from name)
- `price` (NumberInput)
- `sale_price` (NumberInput)
- `description` (RichText / Textarea)
- `short_description` (Input)
- `category` (CategorySelect dropdown)
- `status` (Select – active/draft/out_of_stock/discontinued)
- `is_featured` (Switch)
- `images` (ImageUploader or MultiImageInput)
- `tags` (TagInput)

**UX:**
- Auto-fill slug from name (slugify) with edit option.
- Sale price must ≤ price (instant validation).

**Progress:**
- Added base fields (name, slug with auto-generation, description, short description, category, status, featured, tags).
- Added images input as URL list (max 5) and included in submission payload.
- Pricing fields (price, sale price with validation) completed.

**Next:** Integrate image uploader or keep URL-only per scope; finish any remaining base fields.

---

## 🧱 Task 3 – Add Stock Management Modes (Simple vs Variants)
✅ Done (UI & validation)

**Implementation:**
- Added toggle “Quản lý theo biến thể”. When OFF, show `SKU` and `Stock quantity` with validation. When ON, hide these and mark for later variant setup.
- Submit payload omits `sku`, `stockQuantity`, `productSku` when variant mode is ON.

**Next:** Build VariantTable (Task 4).

---

## 🧱 Task 4 – Implement VariantTable Component
✅ Done (MVP)

**Implementation:**
- Added inline Variant editor when variant mode is ON using `useFieldArray`.
- Columns: name, SKU, price, stock, delete.
- Validations: required fields, unique SKU across variants.

**Note:** Further polish (auto-scroll, barcode) can be added later if needed.

---

## 🧱 Task 5 – Image Upload Integration

**🎯 Objective:** Allow uploading 1–5 images per product.

**Steps:**
- Use existing `ImageUploader` or integrate Cloudinary upload widget.
- Support drag/drop or paste.
- Store image URLs in `images[]`.

**Validation:**
- Max 5 images.
- Each must be valid URL.

**Result:** Uploaded image URLs included in request body.

---

## 🧱 Task 6 – Category Selector

**🎯 Objective:** Fetch categories dynamically for dropdown.

**Steps:**
- Call `GET /categories/active`.
- Populate `CategorySelect` component.
- Support search within dropdown.

**Result:** User can select category before submitting.

---

## 🧱 Task 7 – Form Validation & State Handling
✅ Done

**Implementation:**
- Yup validations for base fields and conditional rules for simple vs variant mode.
- Debounced slug uniqueness check against `/products?slug=`; shows inline error if exists.
- Sale price validated to be ≤ price.

**Result:** Inline errors and disabled submit until valid.

---

## 🧱 Task 8 – Form Submission (POST /products)

**🎯 Objective:** Submit validated form to backend API.

**Steps:**
- On submit → call `POST /products`.
- Disable button during request.
- Handle success → redirect to list page `/admin/products` with toast “Tạo sản phẩm thành công”.
- Handle errors → display backend message (400, 422).

**Payload Example:**
```json
{
  "name": "Classic White Tee",
  "slug": "classic-white-tee",
  "price": 299000,
  "sale_price": 249000,
  "stock_quantity": 20,
  "sku": "TEE-WHT-01",
  "category_id": 2,
  "images": ["https://cdn.example.com/white-tee.jpg"],
  "status": "active"
}
```

**Result:** Product successfully created and visible in list.

---

## 🧱 Task 9 – UX & Visual Polish
✅ Done (initial)

**Implementation:**
- Sticky footer with Cancel + Save, Publish toggle.
- Slug helper localized to “Slug được dùng cho SEO…”.
- Toasts already wired on success/errors via snackbar.

**Result:** Improved clarity and actions are always accessible.

---

## 🧱 Task 10 – Integration Testing

**Checklist:**
- [ ] Can create simple product successfully.
- [ ] Can create variant product successfully.
- [ ] Image uploads store URLs correctly.
- [ ] Validation works (sale_price ≤ price, required fields).
- [ ] API returns 201 + product.
- [ ] Redirect to list after creation.
- [ ] Duplicate slug returns error toast.

**Result:** Page verified end-to-end.

---

## 📅 Suggested Order & Estimates

| Step | Task | Priority | Est. Time |
|------|------|-----------|-----------|
| 1 | Setup page & route | 🔹 High | 0.5d |
| 2 | Base form layout | 🔹 High | 1d |
| 3 | Stock management toggle | 🔹 High | 0.5d |
| 4 | VariantTable component | 🔹 High | 1.5d |
| 5 | Image upload | 🔸 Medium | 0.5d |
| 6 | Category selector | 🔸 Medium | 0.5d |
| 7 | Validation | 🔹 High | 1d |
| 8 | Form submit | 🔹 High | 0.5d |
| 9 | UX polish | 🔸 Medium | 0.5d |
| 10 | Integration testing | 🔹 High | 1d |

---

## 🧩 Deliverables

- Full page `/admin/products/create` integrated with API.  
- Dynamic toggle (simple ↔ variant).  
- Form validation and error handling.  
- Image and category selection integrated.  
- Smooth UX with success redirect and toast messages.

---
