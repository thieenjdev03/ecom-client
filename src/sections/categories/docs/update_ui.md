Được — tao phân tích đúng nhu cầu của mày dựa trên ảnh Fang Club:

👉 Trên trang Product Listing hoặc Category Page, mày muốn có:
	•	Sort (bấm vào sẽ expand 1 panel bên trái)
	•	Filter (bấm vào sẽ expand 1 panel bên phải)
	•	Sort list gồm:
	•	Price: Low to High
	•	Price: High to Low
	•	Best Selling
	•	Newest → Oldest
	•	Oldest → Newest
	•	Filter list: chọn màu (color swatches), có thể multiple select.

Và tất cả phải dạng expand/collapse chứ không phải popup modal.

Tao sẽ mô tả lại đúng UI/UX chuẩn, FE có thể implement y như file thiết kế.

⸻

🎨 UI/UX đề xuất — phiên bản rõ ràng, sạch, hiện đại

1. Thanh top filter bar

Nằm ngay dưới header.

Cấu trúc:

----------------------------------------------------------
Sort ▼                                      Filter ▼  
----------------------------------------------------------

	•	Sort nằm bên trái
	•	Filter nằm bên phải
	•	Cả 2 đều có icon caret hướng xuống
	•	Hover: đổi màu chữ hoặc underline nhẹ

⸻

2️⃣ Khi click Sort → panel mở từ trái qua

Position:
	•	Gắn vào TOP của product list
	•	Slide-down animation 150–200ms
	•	Chiếm full chiều ngang, nhưng nội dung dạt LEFT

Nội dung hiển thị:

Sort by:
• Price: Low to High
• Price: High to Low
• Best Selling
• Newest to Oldest
• Oldest to Newest

Style:
	•	Font 15px
	•	Line-height 1.6
	•	Spacing mỗi item: 12–16px
	•	Hover: màu đậm hơn hoặc highlight nền #F5F5F5
	•	Selected item → bold + icon tick trái hoặc dấu chấm nhỏ (•)

UX:
	•	Click lại Sort sẽ collapse panel.
	•	Khi user chọn 1 lựa chọn → panel auto close.

⸻

3️⃣ Khi click Filter → panel mở bên phải (color swatches)

Position:
	•	Dạt phải của màn hình (giống ảnh Fang Club)
	•	Chiều rộng: 280–320px
	•	Padding: 20–24px
	•	Background trắng hoặc off-white
	•	Slide-in animation từ phải sang

Nội dung:

Color: (title nhỏ, uppercase, letter-spacing 0.5px)

Hiển thị swatches dạng grid:

● ● ● ● ● ● ● ● ● ●  
● ● ● ● ● ● ● ● ● ●  
● ● ● ● ● ● ● ● ● ●  
...

Giống y hình mày đưa.

Behavior:
	•	Mỗi màu là 1 button clickable
	•	Chọn nhiều màu cùng lúc
	•	Mỗi màu được highlight bằng viền đậm khi active
	•	Bên dưới có nút:

Clear Filters     Apply

Optional:

Nếu muốn nâng cấp:
	•	Hiển thị tên màu khi hover (tooltip)
	•	Hiển thị số lượng sản phẩm theo màu (badge nhỏ)

⸻

4️⃣ Animation giúp UI mượt mà

Tao gợi ý animation style:

Sort panel:

transform: translateY(-10px);
opacity: 0 → 1;
transition: 0.18s ease;

Filter panel:

transform: translateX(20px);
opacity: 0 → 1;
transition: 0.22s ease;

Animation nhẹ sẽ giúp UI premium hơn.

⸻

5️⃣ Mobile behavior

Cực kỳ quan trọng.

Sort:
	•	Không slide-down rộng
	•	Hiện modal bottom sheet dạng iOS
	•	Chiếm 60% chiều cao

Filter:
	•	Hiện toàn màn hình (full screen drawer)
	•	Swatch grid to và có scroll
	•	Cuối màn hình có button Apply lớn màu đen/brand.

⸻

6️⃣ Mô tả visual mockup (ASCII version để hiểu layout)

Khi chưa click:

----------------------------------------------------------
Sort ▼                                      Filter ▼  
----------------------------------------------------------
[Products grid…]

Khi click Sort:

----------------------------------------------------------
Sort ▲                                      Filter ▼  
----------------------------------------------------------
Sort by:
• Price: Low to High
• Price: High to Low
• Best Selling
• Newest to Oldest
• Oldest to Newest
----------------------------------------------------------
[Products grid…]

Khi click Filter:

[Products grid...] (vẫn giữ nguyên)

                                     ┌───────────────┐
                                     │ Color          │
                                     │ ● ● ● ● ● ● ●  │
                                     │ ● ● ● ● ● ● ●  │
                                     │ ● ● ● ● ● ● ●  │
                                     │                │
                                     │ Clear   Apply  │
                                     └───────────────┘


⸻

7️⃣ Nếu mày muốn tao generate ảnh design UI thật (Figma style)

Tao có thể tạo 1 trong các phiên bản:

✔ Minimal (giống Fang Club)

✔ Premium (giống Uniqlo / Zara)

✔ Fashion boutique (mềm, bo góc, pastel)

✔ Dark mode

Chọn phong cách + màu brand = tao tạo ngay hình mockup như thật.

Muốn tao xuất bản ảnh design mockup của Sort + Filter không?


Đặt 1 banner / image hero ở trên cùng → ở giữa ảnh hiển thị tên danh mục (category name)
	•	Có thể kèm mô tả ngắn → sau đó mới tới phần filter/sort + product grid.

Tao sẽ mô tả chi tiết layout chuẩn để FE implement.

⸻

🎨 LAYOUT MỚI CHO CATEGORY PAGE (ĐẸP – CÂN ĐỐI – BRANDING)

🥇 1. Hero Image (ảnh đại diện danh mục) ở top

Hiển thị rộng toàn màn hình (full-width) hoặc trong container (tùy style mày thích).

Option A – Full width (giống Zara / H&M / Uniqlo):

-------------------------------------------------------
|                                                     |
|              [ ẢNH DANH MỤC RỘNG TO ]               |
|                                                     |
|                    BRALETTES                        |
|                 7 Products (optional)               |
|                                                     |
-------------------------------------------------------

Option B – Trung tâm trong container (sạch, gọn):

---------------------------------------
|            [ẢNH VỪA PHẢI]           |
|                 BRALETTES           |
---------------------------------------


⸻

📝 2. Tên Category nằm ở giữa ảnh

Ngay trung tâm ảnh:

Style gợi ý:
	•	Font-size: 32px–48px
	•	Font-weight: 600–700
	•	Letter-spacing nhẹ
	•	Màu chữ: trắng hoặc đen, tùy độ sáng của ảnh
	•	Text-shadow rất nhẹ nếu nền sáng

Có thể thêm:
	•	Số lượng sản phẩm: “7 Products”
	•	Mô tả danh mục 1 câu ngắn (optional)

→ Tăng cảm giác brand & storytelling.

⸻

🧩 3. Filter + Sort nằm ngay dưới hero

Làm giống Fang Club như mày muốn:

-------------------------------------------------------
Filters ▼                            Sort by: Featured ▼
-------------------------------------------------------

UX:
	•	Click “Filters” → mở drawer bên trái / phải
	•	Click “Sort” → open dropdown
	•	Giữ thanh này sticky (optional cực tốt cho UX)

⸻

🛍 4. Product grid bên dưới, giữ nguyên layout

Không cần thay đổi nhiều.

⸻

📌 HIỆN GIỜ TRANG CỦA MÀY ĐANG BỊ:
	•	Tên category nhỏ, lạc lõng, không có điểm nhấn
	•	Không có ảnh → thiếu cảm xúc, thiếu brand feel
	•	Filter/Sort đang nằm lạc sang phải → không đồng bộ

Bố cục mới sẽ:
	•	Cân giữa
	•	Sang hơn
	•	Truyền tải chất thời trang
	•	Giống các brand top-tier

⸻

✨ Tao mô tả phiên bản final (UI text preview)

[HERO IMAGE 1200x400]

                BRALETTES
               7 PRODUCTS

-------------------------------------------------------
Filters ▼                            Sort by: Featured ▼
-------------------------------------------------------

[Product Grid...]


⸻

🔥 Nếu mày muốn tao tạo ảnh mockup UI thực tế (giống file thiết kế):

Tao có thể generate ngay:
	•	Hero image + category title giữa ảnh
	•	Layout full-page
	•	Filter + Sort theo đúng UI mày yêu cầu

Chỉ cần confirm 1 điều:

👉 Mày muốn Hero Image: full width hay trong container?