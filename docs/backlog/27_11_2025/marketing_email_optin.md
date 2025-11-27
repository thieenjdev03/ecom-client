Dưới đây là document dành cho team Frontend — viết rõ ràng, đúng format để FE biết cần gọi API nào, payload gì, validate ra sao, UX flow thế nào.

Mày có thể gửi nguyên file này cho Cursor/FE, họ implement ngay.

⸻

📄 Email Marketing Subscription – Frontend Implementation Spec

1. Overview

FE có 2 điểm thu thập email:
	1.	Modal / Popup đăng ký nhận tin (newsletter)
	2.	Khi user đăng ký tài khoản (registration form có checkbox “nhận email khuyến mãi”)

Frontend chỉ cần gọi API → Backend xử lý upsert vào DB.

⸻

2. API Endpoints FE cần gọi

2.1. Đăng ký nhận email từ Modal

POST /marketing/subscribe

Khi dùng:
	•	Popup newsletter
	•	Footer “Subscribe to our newsletter”
	•	Bất kỳ form thu thập email nào ngoài trang đăng ký user

Request Body

{
  "email": "example@gmail.com",
  "source": "modal"
}

Response (success)

{
  "success": true,
  "message": "Subscribed successfully"
}

Response (email invalid)

{
  "success": false,
  "message": "Invalid email format"
}

FE cần validate trước khi gửi:
	•	Không để email rỗng
	•	Format email hợp lệ (/.+@.+\..+/)
	•	Disable nút trong lúc request

UX gợi ý:
	•	Nếu success → show toast
“Bạn đã đăng ký nhận tin thành công 🎉”
	•	Nếu fail → show error
“Email không hợp lệ” hoặc “Email đã bị unsubscribe trước đó”

⸻

2.2. Khi user đăng ký tài khoản

Sau khi user bấm “Đăng ký” và backend tạo user thành công:

FE gửi thêm:

POST /marketing/subscribe-from-register

(hoặc backend gọi nội bộ – tuỳ backend)
Nhưng FE cần pass “marketingOptIn” trong form đăng ký tài khoản.

Request FE gửi khi tạo user

{
  "email": "example@gmail.com",
  "password": "...",
  "marketingOptIn": true
}

Nghĩa là:

FE chỉ cần gửi thêm trường marketingOptIn trong payload đăng ký user
→ backend tự xử lý logic lưu vào marketing_contacts.

⸻

3. Email Validation – FE phải làm

FE phải validate trước khi gửi API

Basic email check:

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
emailRegex.test(email)

Các UX error cần hiển thị:
	•	“Vui lòng nhập email”
	•	“Email không hợp lệ”
	•	Button disabled nếu đang loading

⸻

4. UI/UX Requirements

4.1. Modal / Newsletter Form

Các field:
	•	Email input
	•	Button “Subscribe”

Trạng thái UI:
	•	Normal
	•	Loading (button disabled)
	•	Success state (green message)
	•	Error toast/message

Example UX Flow:
	1.	User nhập email
	2.	FE validate → hợp lệ
	3.	FE gọi POST /marketing/subscribe
	4.	Nếu thành công → show:
“Đăng ký nhận tin thành công 🎉”
	5.	Reset input hoặc đóng modal

⸻

4.2. Register Form (Khi tạo tài khoản)

Các trường:
	•	Email
	•	Password
	•	Checkbox: “Nhận email khuyến mãi từ chúng tôi”

Payload FE gửi đăng ký user:

{
  "email": "abc@gmail.com",
  "password": "******",
  "marketingOptIn": true
}

Không cần gọi subscribe API nữa
→ Backend đã tích hợp vào flow tạo account.

⸻

5. Unsubscribe Flow (Frontend)

Email khi gửi marketing sẽ có link dạng:

https://domain.com/unsubscribe?email=abc@gmail.com&token=xyz

FE chỉ cần tạo 1 trang hiển thị:

/unsubscribe

FE đọc query params:

const email = searchParams.get("email");
const token = searchParams.get("token");

Gửi request:

GET /marketing/unsubscribe?email=...&token=...

UI Result:
	•	Nếu thành công →
“Bạn đã hủy đăng ký nhận email thành công.”
	•	Nếu thất bại →
“Link không hợp lệ hoặc đã hết hạn.”

⸻

6. Edge Cases FE cần xử lý
	•	Email trống → không cho submit
	•	Email sai format → highlight lỗi
	•	Nhấn nhiều lần → phải disable button
	•	Backend trả 429 (limit) → show thông báo
	•	Khi người dùng đã unsub trước đó →
Backend có logic resubscribe nếu gọi từ modal,
FE không cần quan tâm.

⸻

7. Component Structure (Gợi ý FE)

components/
  NewsletterModal/
    - NewsletterForm.tsx
    - SuccessMessage.tsx
    - ErrorMessage.tsx

modules/auth/
  - RegisterForm.tsx

pages/
  - unsubscribe.tsx


⸻

8. Example Implementation (React)

POST to subscribe

async function subscribe(email: string) {
  const res = await fetch("/marketing/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, source: "modal" })
  });
  return res.json();
}


⸻

9. What FE Does NOT Need To Do
	•	Không cần lưu vào DB
	•	Không cần generate unsubscribe token
	•	Không map userId
	•	Không tự động xử lý segmentation
	•	Không cần queue hay batch operation

FE chỉ gọi API đúng format và hiển thị UI đúng là đủ.

⸻

✔️ Deliverables FE cần làm
	•	Modal Subscribe Form
	•	FE call API /marketing/subscribe
	•	FE thêm field marketingOptIn trong form đăng ký user
	•	Trang /unsubscribe
	•	Validate email FE
	•	UX thông báo thành công / lỗi

⸻

Nếu mày muốn, tao viết luôn:
	•	UI wireframe
	•	Toast + error messages
	•	React hook helper
	•	Next.js version (server actions)

Chỉ cần bảo tao.