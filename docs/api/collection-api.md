Dưới đây là document dành riêng cho team Frontend, viết theo đúng hướng “dễ hiểu – thực dụng – rõ ràng – có ví dụ”, dựa trên backend đã build hoàn chỉnh.

Giọng điệu vẫn thân thiện, sạch sẽ, không nhồi lý thuyết. Document này FE có thể dùng để:
	•	Render header Collections
	•	Làm trang Collection Detail
	•	Gắn sản phẩm vào collection
	•	Gọi API chuẩn
	•	Hiểu rõ cấu trúc dữ liệu trả về

⸻

🧭 Frontend Integration Guide – Collections Module

Version: 2025-12-08
Status: Stable – Production-ready
Backend: NestJS + PostgreSQL + Cursor Pagination

⸻

1. Collections là gì?

Collections là nhóm danh mục marketing đặc biệt như:
	•	“Fall 2025 Collection”
	•	“Lunar New Year Collection”
	•	“Trending Essentials”

Một sản phẩm có thể nằm trong nhiều collections.

Frontend sẽ dùng collections để:
	•	Hiển thị tab “Collections” trên header
	•	Có trang collection riêng với banner + danh sách sản phẩm
	•	Tạo landing page marketing (SEO-friendly)

⸻

2. API Summary (Frontend needs to call)

2.1. Lấy danh sách Collections (để hiển thị trên header)

GET /collections?limit=20&cursor=<optional>

Response sample

{
  "data": [
    {
      "id": "uuid",
      "name": "Fall 2025 Collection",
      "slug": "fall-2025-collection",
      "banner_image_url": "https://cdn.../banner.jpg",
      "is_active": true,
      "created_at": "2025-12-08T10:00:00Z"
    }
  ],
  "meta": {
    "next_cursor": "base64_token_or_null",
    "has_more": false
  }
}

Frontend cần chú ý:
	•	Nếu has_more = true, FE gửi thêm cursor=<next_cursor>
	•	FE không dùng page 1, page 2. Cursor pagination hoạt động kiểu “đi tiếp”, không quay lại.

⸻

3. Trang Collection Detail

URL chuẩn đề xuất:

/collections/:slug

API: Lấy thông tin chi tiết theo slug

GET /collections/slug/:slug

Response example

{
  "id": "uuid",
  "name": "Fall 2025 Collection",
  "slug": "fall-2025-collection",
  "description": "Seasonal picks for Fall 2025",
  "banner_image_url": "https://cdn/banner.jpg",
  "seo_title": "Fall 2025 Collection",
  "seo_description": "Top fashion items for Fall 2025",
  "is_active": true
}

FE dùng dữ liệu này để:
	•	Render banner đầu trang (nếu có)
	•	Set SEO meta tags (title, description)
	•	Render title + description

⸻

4. Lấy danh sách sản phẩm trong Collection

GET /collections/:collectionId/products?limit=20&cursor=<optional>

Response example

{
  "data": [
    {
      "id": "product-uuid",
      "name": "Luxury Silk Bra Set",
      "price": 129.0,
      "thumbnail_url": "https://cdn/img.jpg"
    }
  ],
  "meta": {
    "next_cursor": "base64_cursor_here",
    "has_more": true
  }
}

Frontend cần:
	•	Render danh sách sản phẩm giống Category page đang làm.
	•	Hỗ trợ load-more hoặc infinite-scroll theo cursor.

⸻

5. Lấy số lượng sản phẩm trong Collection

GET /collections/:collectionId/products/count

Response:

{ "count": 147 }

Dùng để:
	•	Render tổng số sản phẩm (nếu cần)
	•	Tối ưu pre-loading

⸻

6. Frontend Data Models

Collection model (FE suggest)

interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string;
  banner_image_url?: string;
  is_active: boolean;
  created_at: string;
}

Product inside collection

interface ProductSummary {
  id: string;
  name: string;
  price: number;
  thumbnail_url: string;
}


⸻

7. UI/UX Recommendation (Based on backend behaviors)

Header
	•	Show tất cả collections đang is_active = true
	•	Sắp xếp theo created_at DESC (backend trả mặc định theo thứ tự này)

Collection Page Layout

Structure gợi ý:
	1.	Banner (full-width)
	2.	Collection name (center)
	3.	Collection description (optional)
	4.	List products (grid)
	5.	Load more (cursor-based)

SEO

Sử dụng:
	•	seo_title → <title>
	•	seo_description → <meta name="description" />

⸻

8. Cursor Pagination – FE cần hiểu

Cursor pagination = backend trả 1 token cho FE để tiếp tục tải trang tiếp theo.

FE flow:
	1.	Gọi lần đầu → không cần cursor
	2.	Backend trả:

next_cursor = "Y3JlYXRlZF9hdD0yMDI1..."


	3.	FE gọi tiếp:

GET /collections?limit=20&cursor=Y3Jl...



Không có page=2, page=3.
Cursor đảm bảo dữ liệu luôn ổn định nếu có sản phẩm mới thêm vào.

⸻

9. Edge Cases FE cần xử lý
	•	Nếu is_active = false → không nên show collection trong header
	•	Nếu slug không tồn tại → chuyển về trang 404
	•	Nếu collection không có banner → dùng banner default hoặc bỏ hẳn section
	•	Nếu has_more = false → ẩn nút Load More
	•	Nếu SEO field rỗng → fallback từ name

⸻

10. Full API Reference (Copy cho FE)

1. Get all collections

GET /collections?limit=20&cursor=<cursor>

2. Get collection by slug

GET /collections/slug/:slug

3. Get collection by id

GET /collections/:id

4. Get products inside collection (paginated)

GET /collections/:id/products?limit=20&cursor=<cursor>

5. Get product count

GET /collections/:id/products/count


⸻

11. FE Implementation Checklist

✔ Render collections menu on header
✔ Create Collection Detail Page
✔ Banner rendering
✔ SEO tags
✔ Products load-more with cursor
✔ Error handling (collection not found)
✔ Use slug-based navigation

⸻

12. Kết luận

FE chỉ cần dùng đúng các API phía trên, backend đã xử lý:
	•	Slug
	•	Cursor pagination
	•	Relation product ↔ collection
	•	Data shape
	•	Performance indexes

FE có thể triển khai ngay để hoàn thiện phần Collection Landing Pages & Header.

Nếu cần, có thể viết luôn component React/Vue demo để FE xài.