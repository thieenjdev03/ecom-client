Dưới đây là Requirement Document (tài liệu yêu cầu thực hiện) để bạn giao cho frontend team — chuẩn theo format kỹ thuật nội bộ, rõ ràng về mục tiêu, thay đổi cần làm, và field mapping.

⸻

🧩 Frontend Requirement Document — Order List Optimization

📌 1. Objective

Tối ưu giao diện danh sách đơn hàng (Order List) giúp người quản lý:
	•	Nắm được trạng thái xử lý, thanh toán, vận chuyển ngay trong bảng.
	•	Giảm thao tác click vào từng đơn.
	•	Hỗ trợ lọc và tìm kiếm linh hoạt hơn.

⸻

📁 2. Current Screen

Path: /dashboard/order/list
Component: OrderListTable
Current Columns:
	•	Order
	•	Customer
	•	Date
	•	Items
	•	Price
	•	Status

⸻

🚀 3. Required Changes

3.1. UI Columns Update

Thay thế các cột hiện tại bằng cấu trúc mới sau:

#	Field	Label	Source (from API)	Format / Example	Display rule
1	Order No.	orderNumber	"ORD-20251104-0393"	Bold text, click → detail	
2	Created At	createdAt	2025-11-04T01:47:11.825Z	Format: 04 Nov 2025 – 8:47 AM	
3	Customer	user.firstName + user.lastName + user.email	“Nguyễn Thiện – demo@minimals.cc”	Avatar (initials) + email nhỏ bên dưới	
4	Total	summary.total + summary.currency	$8 USD	Bold, right aligned	
5	Payment	paymentMethod, paidAt	“PayPal • Paid on 04 Nov”	Badge màu theo loại: PayPal (blue), COD (gray), Stripe (purple)	
6	Status	status	“Pending / Completed / Cancelled”	Badge màu (Pending = yellow, Completed = green, Cancelled = red)	
7	Products	items[].productName, quantity, unitPrice	Test124124124 (x1) - $123	Hiển thị tối đa 2 dòng, “+N more” nếu >2	
8	Shipping	carrier, trackingNumber	GHN - 123ABC456	Hiển thị khi có trackingNumber	
9	Notes	notes, internalNotes	icon 🗒️ Tooltip hiển thị text	Chỉ hiện icon khi có ghi chú	


⸻

3.2. Filters & Search

Bổ sung bộ lọc mới trong phần header filter bar:

Filter	Field	Type	Example	Note
Date range	createdAt	Date picker	Start - End	Giữ nguyên
Status	status	Dropdown	Pending, Completed, Cancelled	Badge màu tương ứng
Payment Method	paymentMethod	Dropdown	PayPal, Stripe, COD	Multi-select
Country	user.country	Dropdown	Albania, Vietnam, US…	Optional
Search	orderNumber, user.email, trackingNumber, productName	Text input	“ORD-2025”	Full-text search


⸻

3.3. Hover / Expand Panel

Khi hover hoặc click vào 1 dòng, mở mini panel (drawer / tooltip card) hiển thị:
	•	Shipping Info: carrier, trackingNumber, shippingAddress
	•	Billing Info: billingAddress
	•	Payment Info: paymentMethod, paidAt
	•	Order Summary: subtotal, shipping, discount, total

⸻

🎨 4. UI / UX Notes
	•	Dùng badge màu động cho status và paymentMethod.
	•	Cột “Total” nên căn phải để dễ so sánh giá.
	•	Cột “Customer” hiển thị avatar (từ tên hoặc hình profile nếu có).
	•	Cột “Products” nên dùng tooltip khi hover hiển thị toàn bộ danh sách sản phẩm.
	•	Giới hạn 2 dòng hiển thị sản phẩm, có thể thêm dấu “+3 more” nếu nhiều hơn.
	•	Cần format tiền tệ theo summary.currency (USD, VND…).

⸻

⚙️ 5. Data Mapping (From Backend JSON)

{
  orderNumber: string,
  createdAt: string,
  user: {
    firstName: string,
    lastName: string,
    email: string,
    country: string,
  },
  summary: {
    total: string,
    currency: string,
    discount: string,
    shipping: string,
  },
  paymentMethod: 'PAYPAL' | 'STRIPE' | 'COD',
  paidAt: string | null,
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED',
  carrier: string | null,
  trackingNumber: string | null,
  notes: string,
  internalNotes: string | null,
  items: [
    { productName: string, quantity: number, unitPrice: string }
  ]
}


⸻

🧠 6. Acceptance Criteria
	•	Tất cả field hiển thị đúng theo mapping.
	•	Mỗi cột có tooltip/hover hợp lý.
	•	Filter hoạt động realtime (debounced search 300ms).
	•	Sorting hoạt động trên createdAt, total, status.
	•	UI responsive tốt (desktop + tablet).
