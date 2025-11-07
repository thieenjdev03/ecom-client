Quá chuẩn 👌 — mày đã có phần backend upload Cloudinary hoàn thiện rồi, giờ cần phần frontend integration guide để team FE (Next.js / React) biết cách gọi API /files đúng cách.

Dưới đây là tài liệu hoàn chỉnh, viết theo format chuẩn cho FE dev, có thể lưu vào:
📁 docs/frontend/cloudinary_upload_integration.md

⸻


# 🎨 Cloudinary Upload Integration — Frontend (Lumé E-Commerce)

## 🎯 Objective
Tài liệu này hướng dẫn **frontend (Next.js/React)** tích hợp tính năng **upload hình ảnh lên Cloudinary** thông qua backend API.

Có 2 flow chính:
1. **Frontend upload trực tiếp lên Cloudinary** (với chữ ký do backend cấp).  
2. **Frontend upload qua backend** (backend upload tiếp lên Cloudinary).

---

## ⚙️ 1️⃣ Base API (đã có từ backend)

| Endpoint | Mục đích | Method |
|-----------|----------|--------|
| `/files/signature` | Lấy chữ ký (`signature`) để upload trực tiếp | `GET` |
| `/files/upload` | Upload file qua backend (multipart) | `POST` |
| `/files/upload-multiple` | Upload nhiều file (multipart) | `POST` |
| `/files/generate-url` | Tạo URL resize, crop | `POST` |
| `/files/:publicId` | Xóa ảnh | `DELETE` |

---

## 🧩 2️⃣ Option A — Upload **trực tiếp lên Cloudinary** (nhẹ, nhanh nhất)

### 💡 Flow tóm tắt
1. FE gọi `/files/signature` để lấy:
   - `signature`
   - `apiKey`
   - `cloudName`
   - `folder`
   - `timestamp`
2. FE gửi file trực tiếp đến Cloudinary endpoint  
   `https://api.cloudinary.com/v1_1/{cloudName}/image/upload`
3. Nhận `secure_url`, `public_id` từ Cloudinary  
4. Gửi `secure_url` về backend nếu cần lưu DB.

---

### 🧠 Code Implementation (Next.js / React)

```tsx
async function uploadToCloudinary(file: File) {
  // 1️⃣ Lấy chữ ký từ backend
  const res = await fetch('/api/files/signature');
  const { timestamp, folder, signature, apiKey, cloudName } = await res.json();

  // 2️⃣ Tạo form data
  const formData = new FormData();
  formData.append('file', file);
  formData.append('api_key', apiKey);
  formData.append('timestamp', timestamp);
  formData.append('signature', signature);
  formData.append('folder', folder);

  // 3️⃣ Gửi trực tiếp lên Cloudinary
  const cloudinaryRes = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  const data = await cloudinaryRes.json();
  return {
    url: data.secure_url,
    public_id: data.public_id,
    format: data.format,
  };
}


⸻

💬 Example usage

<input
  type="file"
  accept="image/*"
  onChange={async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await uploadToCloudinary(file);
    console.log('✅ Uploaded:', result);
  }}
/>

✅ Ưu điểm:
	•	Không qua backend upload (nhẹ, nhanh)
	•	Tận dụng CDN của Cloudinary

⚠️ Nhược điểm:
	•	FE phải gọi 2 API (1 backend + 1 Cloudinary)
	•	Không can thiệp validate file ở backend

⸻

🧩 3️⃣ Option B — Upload qua backend

Dành cho trường hợp muốn backend kiểm soát toàn bộ (validate, nén, rename,…).

🧠 Code Implementation (Next.js / React)

async function uploadViaBackend(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('/api/files/upload', {
    method: 'POST',
    body: formData,
  });

  const data = await res.json();
  return data;
}


⸻

💬 Example usage

<input
  type="file"
  onChange={async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const uploaded = await uploadViaBackend(file);
    console.log('✅ Uploaded via backend:', uploaded);
  }}
/>

✅ Ưu điểm:
	•	Bảo mật hơn (FE không biết API Key/Secret)
	•	Backend có thể xử lý resize / validation / rename
	•	Dễ audit log & tracking

❌ Nhược điểm:
	•	Tốc độ chậm hơn (upload qua 2 bước)

⸻

🧱 4️⃣ Upload nhiều ảnh

async function uploadMultiple(files: File[]) {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));

  const res = await fetch('/api/files/upload-multiple', {
    method: 'POST',
    body: formData,
  });

  return await res.json();
}


⸻

🧩 5️⃣ Xóa ảnh trên Cloudinary (qua backend)

async function deleteImage(publicId: string) {
  const res = await fetch(`/api/files/${publicId}`, { method: 'DELETE' });
  return await res.json();
}


⸻

🎨 6️⃣ Tạo URL ảnh tối ưu (resize/crop)

Backend đã có /files/generate-url

FE có thể gọi để tạo URL webp + resize:

async function getOptimizedUrl(publicId: string) {
  const res = await fetch('/api/files/generate-url', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ publicId, width: 500, height: 500, crop: 'fill' }),
  });
  const { optimizedUrl } = await res.json();
  return optimizedUrl;
}


⸻

⚡ 7️⃣ Performance Tips

Tình huống	Gợi ý
Upload avatar	Resize client-side trước khi gửi (canvas.toBlob)
Product gallery	Dùng upload-multiple để giảm số lần gọi API
Render danh sách ảnh	Luôn dùng Cloudinary URL có tham số f_auto,q_auto,w_600
SEO	Luôn thêm alt cho ảnh, và sử dụng định dạng WebP


⸻

🧾 8️⃣ Expected Upload Result

Response từ Cloudinary hoặc backend:

{
  "success": true,
  "public_id": "lume_ecom_uploads/products/abc123",
  "url": "https://res.cloudinary.com/lume/image/upload/v1729990123/lume_ecom_uploads/products/abc123.webp",
  "format": "webp",
  "bytes": 245231
}


⸻

✅ Summary

Mục đích	API	Hướng upload
Upload 1 ảnh nhẹ, nhanh	/files/signature → upload Cloudinary	Direct
Upload qua backend để kiểm soát	/files/upload	Server-side
Upload nhiều ảnh	/files/upload-multiple	Multipart
Xóa ảnh	/files/:publicId	Backend DELETE
Tạo URL tối ưu	/files/generate-url	Backend POST
