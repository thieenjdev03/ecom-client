Rồi, làm cái “spec cho FE” cho rõ ràng nha 👇

⸻

1. Mục tiêu & tổng quan
	•	Đây là mega navigation cho menu “Shop” (hoặc bất kỳ menu chính nào).
	•	Parent categories (category cha) hiển thị dọc bên trái.
	•	Khi hover / focus vào từng parent, panel bên phải sẽ hiển thị children categories (category con) tương ứng.
	•	Navigation này dùng font chung của site: Montserrat.

Think: layout giống sidebar bên trái (parent list) + content bên phải (children list).

⸻

2. Cấu trúc tổng thể

2.1. Khu vực kích hoạt
	•	Khi user hover/click vào menu “Shop” trên header:
	•	Hiện ra mega dropdown full chiều ngang (hoặc max width ~ 80–90% màn hình, canh giữa).
	•	Dropdown này có background màu trắng hoặc trắng-ngà (matching với design hiện tại).
	•	Có box-shadow nhẹ để tách khỏi background.

2.2. Chia layout thành 2 phần
	1.	Cột trái – Parent Categories
	•	Chiếm khoảng 20–25% width của mega menu.
	•	Hiển thị danh sách parent categories theo chiều dọc:
	•	Ví dụ: All, Bras, Panties, Bikinis & Swimwear, Another, …
	•	Mỗi item là một dòng, kiểu list đơn giản.
	2.	Khu vực phải – Children Panel
	•	Chiếm khoảng 75–80% width còn lại.
	•	Nội dung của panel sẽ thay đổi tuỳ theo parent đang được hover/active.
	•	Dạng nhiều cột (tùy số lượng children), mỗi cột có title và list link con bên dưới.

⸻

3. Thiết kế chi tiết – cột Parent Categories (bên trái)

3.1. Layout & spacing
	•	Cột trái có:
	•	Padding top/bottom: khoảng 24–32px.
	•	Padding left/right: khoảng 24px.
	•	Mỗi item parent:
	•	Chiều cao tối thiểu: 40–48px.
	•	Text canh trái, vertical align giữa.
	•	Khoảng cách giữa các parent items: 8–12px.

3.2. Style chữ
	•	Font: Montserrat (theo site).
	•	Size:
	•	Parent: 16–18px, weight 600 (semi-bold) để nhìn như tiêu đề.
	•	Màu:
	•	Normal: #222–#333 (gần màu text chính của site).
	•	Active/hover: dùng màu chủ đạo của brand (ví dụ màu xanh đậm site đang dùng) hoặc underline.

3.3. Trạng thái active/hover
	•	Khi hover lên một parent:
	•	Text đổi màu (brand color).
	•	Có thể thêm:
	•	Underline dưới chữ, hoặc
	•	Background highlight (màu xám nhạt / ngà nhạt) full chiều ngang item.
	•	Parent đang active (đang hiển thị children ở panel phải):
	•	Giữ nguyên trạng thái như hover, để người dùng biết mình đang ở category nào.
	•	Parent mặc định ban đầu:
	•	Khi mega menu mở, “All” sẽ là active mặc định (nếu còn dùng All).
	•	Panel phải tương ứng hiển thị toàn bộ children (hoặc mix nhiều nhóm).

3.4. Hành vi khi click
	•	Khi click parent:
	•	Ở trong mega menu: chỉ dùng như chọn tab → update content panel phải.
	•	Có thể cấu hình:
	•	Click vào text parent không đóng menu ngay, chỉ đổi nội dung bên phải.
	•	Nếu muốn, có thể có icon nhỏ “›” để đi đến trang listing của parent (tùy business).

⸻

4. Thiết kế chi tiết – Children Panel (bên phải)

4.1. Layout
	•	Panel phải có padding đều: khoảng 24–32px.
	•	Nội dung chia cột theo logic Business:

Ví dụ với parent “Bras”:
	•	Cột 1 title: “Bras”
	•	Children: Bralettes, Push-Up Bras, Sports Bras, Strapless Bras, Wireless Bras, …
	•	Nếu có nhiều group con hơn:
	•	Có thể phân thành 2–3 cột, mỗi cột một nhóm.

4.2. Cách chia cột
	•	FE nên dùng grid:
	•	Ví dụ: 2–4 cột tuỳ màn hình (desktop: 3–4, tablet: 2).
	•	Khoảng cách giữa các cột: 24–32px.

4.3. Style cho title & items
	•	Title của group (ví dụ: “Bras”, “Panties”, “Bikinis & Swimwear”):
	•	Font: Montserrat.
	•	Size: 18–20px.
	•	Weight: 700 (bold).
	•	Màu: gần #111–#222.
	•	Margin-bottom: khoảng 12–16px.
	•	Children items (link):
	•	Font-size: 14–16px.
	•	Weight: 400–500.
	•	Color: #333–#555.
	•	Line-height: 1.4–1.6.
	•	Spacing giữa items: 8–10px.

4.4. Hover/active cho children
	•	Hover children:
	•	Text đổi màu sang brand color.
	•	Option: thêm underline nhẹ hoặc opacity 0.8 → 1.
	•	Click children:
	•	Đóng mega menu, điều hướng đến trang listing tương ứng (filter theo category con đó).

⸻

5. Hành vi tương tác (Interaction / UX)

5.1. Mở / đóng mega menu
	•	Mega menu mở khi:
	•	Desktop: hover vào “Shop” (giữ một khoảng delay nhỏ ~150–200ms để tránh flick).
	•	Hỗ trợ mở bằng focus + phím Enter/Space (accessibility).
	•	Đóng mega menu khi:
	•	Mouse rời khỏi khu vực menu (header + dropdown) 1 khoảng thời gian ngắn (~200–300ms).
	•	User click ra ngoài (click outside).
	•	User scroll xuống quá một ngưỡng (tùy logic site).
	•	Trên mobile: khi bấm nút “X” hoặc back.

5.2. Hover parent → update children
	•	Khi hover / focus vào parent:
	•	Panel phải update ngay children tương ứng (không reload trang).
	•	Nếu chưa có children: hiển thị một empty state (xem 7).

5.3. Keyboard accessibility
	•	Có thể hỗ trợ:
	•	Tab để di chuyển qua các parent.
	•	Khi parent có focus: panel phải hiển thị children tương ứng.
	•	Arrow lên/xuống di chuyển giữa parent list (nếu làm thêm).

⸻

6. Responsive behavior

6.1. Desktop (≥ 1024px)
	•	Dùng layout như mô tả:
	•	Sidebar trái (parent dọc).
	•	Panel phải (children nhiều cột).
	•	Mega menu xuất hiện dưới header, full width hoặc giới hạn trong container.

6.2. Tablet (768–1023px)
	•	Vẫn có thể giữ:
	•	Parent list bên trái (chiều rộng nhỏ lại, ~25–30%).
	•	Panel phải 70–75%.

Hoặc phương án đơn giản hơn:
	•	Parent dạng tabs ngang trên cùng, children bên dưới (nếu vertical khó fit).
→ Tùy team, nhưng phải thống nhất trước.

6.3. Mobile (< 768px)
	•	Gợi ý behavior:
	•	Mega menu chuyển thành off-canvas menu (trượt từ bên trái).
	•	Cấu trúc:
	•	List parent (dọc).
	•	Khi bấm vào 1 parent:
	•	Hoặc expand accordion show children bên dưới.
	•	Hoặc chuyển sang màn hình con chỉ hiển thị children list + back.
	•	Không cần hover trên mobile → chỉ dùng click/tap.

⸻

7. Empty state / trường hợp đặc biệt
	1.	Parent không có children
	•	FE xử lý:
	•	Khi hover parent: panel phải có text dạng:
	•	“No subcategories available” / “Chưa có danh mục con”.
	•	Hoặc ẩn panel và parent đó trở thành direct link đến trang category.
	2.	Children nhiều quá
	•	Nếu children > 12–15 items:
	•	Chia thành nhiều cột.
	•	Hoặc dùng “View all …” ở cuối list, dẫn đến trang listing chi tiết.

⸻

8. Nguyên tắc mapping data (để FE dễ implement)
	•	Backend/FE nên thống nhất cấu trúc data:
	•	parentCategories: array.
	•	Mỗi phần tử: { id, name, slug, children: CategoryChild[] }
	•	CategoryChild: { id, name, slug, groupTitle? } (nếu muốn group theo title như “Bras”, “Panties”, …)
	•	FE chỉ cần:
	•	Render list parent bên trái.
	•	Giữ state activeParentId.
	•	Panel phải luôn đọc children tương ứng với activeParentId.

⸻

9. Visual nuances (những chi tiết nhỏ nhưng đẹp)
	•	Background của mega menu:
	•	Gradient rất nhẹ hoặc trắng-ngà (rất mờ) để giống screenshot hiện tại.
	•	Bo góc:
	•	Bo nhẹ 8–12px ở 4 góc menu.
	•	Shadow:
	•	Shadow mềm (blur lớn, opacity nhỏ) để cảm giác “float”.

⸻

Tóm lại: hãy coi nó như sidebar dọc (parent) + content panel (children), parent giống tab dọc, hover/active vào parent là đổi nội dung bên phải, children là list link con được chia thành cột rõ ràng.
Frontend chỉ cần bám đúng hành vi & layout ở trên là ra đúng UX mà bạn đang muốn.