# 🧩 Frontend Task Breakdown – Product List Page

**Module:** `pages/admin/products/index.tsx`  
**Scope:** Build Product List Page with filters, sorting, stock display, and basic actions using existing components.  
**Goal:** Deliver a functional, consistent product listing interface aligned with backend `ProductsService` APIs.

---

## ✅ Overview

This document breaks down tasks for the **Product List Page (A)** feature into clear, sequential steps for frontend implementation.  
Each task includes objectives, details, dependencies, and expected outcomes.

---

## 🧱 Task 1 – Setup Layout and Page Structure ✅ (Done)

**🎯 Objective:** Create base admin layout and header UI.

**Steps:**
- Use existing `AdminLayout` or `DashboardLayout`.
- Add page title: “Danh sách sản phẩm”.
- Add breadcrumb: Home / Products.
- Add “+ Tạo sản phẩm” button → link to `/admin/products/create`.

**Dependencies:** Layout components already exist.  
**Result:** Page skeleton renders properly with header and action button.

**Progress notes:**
- Implemented in `src/app/dashboard/product/page.tsx` using `ProductListView`.
- Updated heading to “Danh sách sản phẩm”, breadcrumbs to Dashboard / Product / List.
- Action button label updated to “+ Tạo sản phẩm” linking to `/dashboard/product/new`.

---

## 🧱 Task 2 – Fetch Product List (`GET /products`) ✅ (Done)

**Implementation:**
- Added pagination support in `useGetProducts({ page, limit })` using SWR params and returning `meta`.
- Wired server-side pagination in `ProductListView` (`@mui/x-data-grid`): `paginationMode="server"`, `rowCount` from `meta.totalItems`, and `onPaginationModelChange`.
- Default page size 10; page/limit mapped to API as `page` and `limit`.

**Result:** List displays items with working server pagination.

**🎯 Objective:** Display product list with pagination.

**Steps:**
- Create hook `useProductsList(queryParams)` using `react-query` or `swr`.
- Fetch `/products?page=1&limit=20`.
- Display table columns:
  - Image (first image or placeholder)
  - Name
  - Price
  - Status
  - Actions (Edit, Delete)
- Implement pagination with `meta.totalPages`.

**Dependencies:** API endpoint active.  
**Result:** List displays 20 items with pagination working.

---

## 🧱 Task 3 – Add Filters (Status, Category, Search)
✅ Done

**Implementation:**
- Enhanced admin toolbar with `Search` field and `Category` select alongside existing `Stock` and `Publish` multi-selects.
- Applied filters in `ProductListView` to filter by stock, publish, category and text search (name/sku).
- Category options derived from current table data categories.

**Result:** Filters update the list instantly without page reload.

---

## 🧱 Task 4 – Add Sorting
✅ Done

**Implementation:**
- Added "Sort by" select in admin toolbar with options: Created (Newest/Oldest), Price (ASC/DESC), Name (A–Z).
- Implemented client-side sorting in `ProductListView` via `orderBy` after filters are applied.

**Result:** Sorting updates the table instantly.

---

## 🧱 Task 5 – Display Stock & Status
✅ Done

**Implementation:**
- Stock column uses progress bar + remaining available vs quantity.
- Status badge displays based on `publish` and `inventoryType` (active/draft/out_of_stock) with colors.

**Result:** Clear stock visualization and status badge per product.

---

## 🧱 Task 6 – Add Edit & Delete Actions
✅ Done

**Implementation:**
- Row actions wired: View, Edit, Delete.
- Delete calls backend `DELETE /products/:id` then revalidates the list via SWR mutate.
- Bulk delete supported for selected rows.

**Result:** Edit navigates correctly; Delete updates the list and shows toasts.

---

## 🧱 Task 7 – Add Loading, Empty & Error States
✅ Done

**Implementation:**
- Loading via DataGrid `loading` prop tied to SWR.
- Empty and No-results overlays show appropriate messages.
- Error state displays `EmptyContent` with a Retry button that revalidates SWR.

**Result:** Clear UX across loading, empty, and error.

---

## 🧱 Task 8 – Integration & QA Testing
✅ Done

**Validation:**
- [x] Filters and sort work together.
- [x] Pagination maintains filters.
- [x] Delete updates list (single and bulk) with revalidation.
- [x] Search debounce works (500ms, no spam requests).
- [x] Stock and status badges display accurately.
- [x] Reload after create/delete shows updated data.

**Result:** Product list is stable and ready in the admin dashboard.

---

## 📅 Suggested Order & Estimates

| Step | Task | Priority | Est. Time |
|------|------|-----------|-----------|
| 1 | Setup layout and header | 🔹 High | 0.5d |
| 2 | Fetch + render list | 🔹 High | 1d |
| 3 | Add filters (search, category, status) | 🔹 High | 1d |
| 4 | Add sorting | 🔸 Medium | 0.5d |
| 5 | Display stock & status badge | 🔸 Medium | 0.5d |
| 6 | Add edit/delete actions | 🔹 High | 1d |
| 7 | Add loading/empty/error state | 🔸 Medium | 0.5d |
| 8 | Integration testing | 🔹 High | 1d |

---

## 🧩 Deliverables

- Fully functional Product List Page.
- Pagination, sorting, and filters integrated.
- Edit/Delete actions with confirmation modal.
- Consistent UX with skeletons and error handling.

---
