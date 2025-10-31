Tuyệt vời — bạn đã có document FE rất bài bản 🎨
Mình sẽ merge hai bên (FE + BE) thành bản tài liệu hợp nhất FE–BE: vừa giữ nguyên định hướng UI/UX, vừa đảm bảo truyền đúng payload, key–value và rule từ backend.

⸻

🧾 Product Upload – Full FE–BE Integration & UI/UX Specification

📍 Overview

Tài liệu này hợp nhất cả UI/UX yêu cầu của frontend và business rules + payload chuẩn backend cho trang Tạo / Sửa sản phẩm.

Mục tiêu:
	•	FE gửi đúng cấu trúc dữ liệu BE yêu cầu (/products endpoints).
	•	UI thể hiện rõ ràng các nhóm dữ liệu (Meta, Attributes, Inventory, Marketing).
	•	Đảm bảo đồng bộ validation, enum, unique constraint và hành vi toggle.

⸻

🎯 Goals
	•	Đơn giản hoá flow nhập liệu, giảm lỗi sai khi gửi API.
	•	Thể hiện rõ mối quan hệ giữa product và variants.
	•	Tối ưu cho mở rộng sau này (color, label, gender, v.v).
	•	Tránh sai khác giữa UI hiển thị và payload thực tế.

⸻

🧩 1. Layout & Structure

Group	Fields	Ghi chú kết nối BE
Product Meta	category_id, status, tags, gender	Dữ liệu mapping trực tiếp sang DTO; status là enum (active, draft, out_of_stock, discontinued).
Attributes	colors, sizes, labels	FE dùng để map color_id, size_id trong variants.
Inventory	sku, stock_quantity, variants[]	FE cần ẩn SKU và stock_quantity khi bật “variant-based tracking”.
Marketing	is_featured, sale_label, custom_label	is_featured map thẳng boolean; các label có thể lưu trong tags hoặc custom field.

UI nên chia thành các card “Product Meta”, “Attributes”, “Inventory”, “Marketing Options” với divider và tooltip.

⸻

🎨 2. Visual & UX Guidelines

Element	Recommendation	BE Mapping
Category	Dropdown async (/categories), cho phép “+ Add” inline modal.	category_id
Status	Enum select (active/draft/out_of_stock/discontinued).	status
Gender	Segmented control (Men/Women/Kids).	Có thể lưu vào tags hoặc meta tuỳ schema.
Tags	Input dạng free text, Enter để thêm.	tags (string[])
Price / Sale Price	Sale ≤ Price (FE check trước khi gửi).	price, sale_price
Cost Price	Optional.	cost_price
Images	Upload → lấy URL → gửi images: string[].	images
Toggle “Variant-based stock tracking”	Khi bật → show bảng biến thể (variants[]); khi tắt → show SKU + StockQuantity.	variants hoặc stock_quantity


⸻

🧱 3. Business Rules (Backend enforced – FE must respect)

Rule	FE Behavior
sale_price ≤ price	FE validate trước khi gửi
Nếu có variants.length > 0 → không được có sku hoặc stock_quantity	FE disable 2 field này khi bật variant tracking
slug unique	FE hiển thị lỗi khi nhận 400/409 từ BE
category_id phải tồn tại	FE không cho chọn category rỗng
Nếu có sku cấp sản phẩm → phải unique	FE generate hoặc check BE response
stock ≥ 0	FE set min=0, inline error nếu nhập âm


⸻

⚙️ 4. API Mapping Summary

Action	Endpoint	Method	Payload	Ghi chú
Tạo sản phẩm	/products	POST	See below	Trả về object sản phẩm đã tạo
Cập nhật sản phẩm	/products/:id	PATCH	Partial update	Các field optional
Xoá (soft delete)	/products/:id	DELETE	None	Không trả body
Update stock theo SKU	/products/:id/variants/:sku/stock	PATCH	{ "stock": number }	Dùng khi update inline variant table
Lấy danh sách	/products	GET	Query params	page, limit, status, sort_by, etc.
Lấy chi tiết	/products/:id	GET	None	Hiển thị form edit
Tìm kiếm	/products/search?q=	GET	None	Cho search bar


⸻

📦 5. Payload Examples

🧩 A. Product không có biến thể

{
  "name": "Classic T-Shirt",
  "slug": "classic-t-shirt",
  "price": 199000,
  "sale_price": 149000,
  "sku": "TEE-CLASSIC-001",
  "stock_quantity": 100,
  "category_id": 2,
  "images": ["https://cdn.shop.com/img1.jpg"],
  "tags": ["tshirt", "men"],
  "status": "active",
  "is_featured": false
}

🧩 B. Product có biến thể

{
  "name": "Premium Polo Shirt",
  "slug": "premium-polo-variant",
  "price": 399000,
  "variants": [
    {
      "name": "M - Black",
      "sku": "POLO-M-BLK",
      "price": 399000,
      "stock": 10,
      "color_id": "1",
      "size_id": "1"
    },
    {
      "name": "L - Black",
      "sku": "POLO-L-BLK",
      "price": 399000,
      "stock": 5,
      "color_id": "1",
      "size_id": "2"
    }
  ],
  "category_id": 1,
  "is_featured": true
}


⸻

🧠 6. Validation & Error Display (FE UI)

Backend Message	FE Response
Sale price cannot be greater than regular price	Inline lỗi ở trường Sale Price
Product with variants should not have SKU set	Disable SKU input khi có variant
Product with variants should not have stock_quantity set	Disable StockQuantity input
Slug already exists	Hiển thị lỗi “Slug bị trùng, vui lòng chọn slug khác”
Invalid category_id	Highlight dropdown Category
Stock cannot be negative	Red border + inline text “Không thể nhập số âm”


⸻

🧱 7. UI Section Details (Unified with BE)

🧩 Product Meta
	•	Category (dropdown)
	•	Status (enum)
	•	Gender (segmented control)
	•	Tags (free text)
	•	Short / Long Description

🎨 Attributes
	•	Colors / Sizes (multi-select chip)
	•	Labels (optional custom text)
	•	Auto-maps → variant creation modal

📦 Inventory
	•	Toggle: “Enable variant-based stock tracking”
	•	OFF → show SKU, Stock quantity
	•	ON → show Variant Table
	•	SKU: text (unique)
	•	Stock Quantity: number ≥ 0
	•	Variants table:

Field	Key	Type
Name	name	string
SKU	sku	string
Price	price	number
Stock	stock	number
Color	color_id	string
Size	size_id	string



💰 Marketing Options
	•	Featured (→ is_featured)
	•	Sale Label / Custom Label (→ tags hoặc meta)
	•	Tooltip: hiển thị rõ ngữ cảnh

⸻

🧩 8. Future-Proofing
	•	FE nên chuẩn bị khả năng thêm các thuộc tính động (attributes[]) mà BE có thể thêm trong tương lai.
	•	Tất cả enum (status, gender, label type) nên dùng constant để tránh hardcode string.
	•	Chuẩn bị translation key:
product.category_label, product.status_active, product.featured_toggle, v.v.

⸻

✅ Summary of FE Tasks (Synced with BE)

Task	Priority	Type
Group fields theo 4 card (Meta / Attributes / Inventory / Marketing)	🔥 High	UI
Validate sale_price ≤ price	🔥 High	Logic
Disable SKU & StockQuantity khi có variants	🔥 High	Logic
Inline error hiển thị theo message BE	🔥 High	UX
Bổ sung Tooltip cho switch & field quan trọng	⚡ Medium	UI
Auto generate slug từ name (slugify)	⚡ Medium	Logic
Async dropdown categories	⚡ Medium	Data
Variant Table update stock qua API riêng	⚡ Medium	Integration


⸻

Author: ChatGPT (Merged FE–BE Spec — Ecom_Project)
Date: 2025-10-31
Version: v2.0 – FE & BE Unified

⸻

Bạn có muốn mình xuất bản file này thành .md (để push thẳng vào repo docs/ hoặc gửi cho frontend team)?
Mình có thể format lại với heading chuẩn Markdown + code highlight + checklist để dễ đọc trong GitHub.