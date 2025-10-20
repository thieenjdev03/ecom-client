# 📘 Geoapify Address Autocomplete – API Usage Guide

**Mục tiêu:**\
Tự động gợi ý địa chỉ khi người dùng nhập vào ô “Địa chỉ giao hàng / billing address”, dựa trên API Geoapify.

---

## 🧭 1. Endpoint

```
GET https://api.geoapify.com/v1/geocode/autocomplete
```

### 🧩 Query Parameters

| Tham số        | Bắt buộc | Mô tả                                                                |
| -------------- | -------- | -------------------------------------------------------------------- |
| `text`         | ✅        | Chuỗi người dùng đang nhập (VD: "Ho Chi Minh", "123 Lý Thường Kiệt") |
| `apiKey`       | ✅        | Geoapify API key (lấy từ Dashboard)                                  |
| `lang`         | ❌        | Ngôn ngữ trả về (khuyến nghị `vi` cho Việt Nam)                      |
| `limit`        | ❌        | Giới hạn số gợi ý trả về (VD: `5`)                                   |
| `countryCodes` | ❌        | Giới hạn vùng quốc gia (VD: `vn` cho Việt Nam)                       |
| `filter`       | ❌        | Lọc theo khu vực hoặc tọa độ (VD: `circle:106.7,10.8,50000`)         |

---

## ⚙️ 2. Request Example

### 🧑‍💻 JavaScript (Frontend Fetch)

```js
const requestOptions = {
  method: 'GET',
};

const query = "Ho Chi Minh"; // text người dùng nhập
const apiKey = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;

fetch(`https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(query)}&lang=vi&limit=5&countryCodes=vn&apiKey=${apiKey}`, requestOptions)
  .then(response => response.json())
  .then(result => {
    console.log(result);
    // result.features -> danh sách gợi ý
    // result.features[0].properties.formatted -> địa chỉ đầy đủ
    // result.features[0].properties.lat / lon -> tọa độ
  })
  .catch(error => console.error("Geoapify error:", error));
```

---

### 🤰 cURL (Terminal)

```bash
curl -X GET \
  "https://api.geoapify.com/v1/geocode/autocomplete?text=Ho%20Chi%20Minh&lang=vi&limit=5&countryCodes=vn&apiKey=YOUR_API_KEY"
```

---

## 📦 3. Response Example

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "properties": {
        "country": "Vietnam",
        "country_code": "vn",
        "state": "Ho Chi Minh City",
        "city": "Ho Chi Minh City",
        "formatted": "Ho Chi Minh City, Vietnam",
        "lat": 10.7769,
        "lon": 106.7009
      }
    }
  ]
}
```

---

## 💡 4. Frontend Integration Notes

| Mục tiêu               | Hướng dẫn                                                                         |
| ---------------------- | --------------------------------------------------------------------------------- |
| **Debounce input**     | Gọi API sau khi người dùng dừng gõ \~300ms                                        |
| **Giới hạn quốc gia**  | Thêm `countryCodes=vn` để tránh kết quả ngoài Việt Nam                            |
| **Tối ưu hiệu năng**   | Cache kết quả gần đây trong localStorage                                          |
| **Xử lý chọn địa chỉ** | Khi người dùng chọn → lưu `formatted`, `lat`, `lon` vào state hoặc gửi về backend |
| **UI/UX**              | Hiển thị danh sách gợi ý dạng dropdown, chọn 1 item thì điền vào input            |

---

## 🚀 5. Backend Optional (Reverse Geocode)

Nếu cần lấy địa chỉ từ tọa độ (VD: user chọn trên map):

```bash
GET https://api.geoapify.com/v1/geocode/reverse?lat=10.7769&lon=106.7009&apiKey=YOUR_API_KEY
```

---

## 🧾 6. Env & Config

File `.env.local` (Next.js):

```bash
NEXT_PUBLIC_GEOAPIFY_KEY=your_api_key_here
```

---

## ✅ 7. Checklist cho FE dev

- [x] Tạo component AddressAutocomplete với Geoapify API
- [x] Tích hợp vào trang Account General (địa chỉ cá nhân)
- [x] Tích hợp vào trang Account Billing (address book)
- [x] Thêm debounce cho input (300ms)
- [x] Giới hạn kết quả cho Việt Nam (countryCodes=vn)
- [x] Hiển thị tọa độ khi chọn địa chỉ
- [x] Xử lý loading state và error handling
- [ ] Thêm NEXT_PUBLIC_GEOAPIFY_KEY vào .env.local
- [ ] Test chức năng autocomplete

## 🔧 8. Setup Environment Variable

Tạo file `.env.local` trong root project và thêm:

```bash
NEXT_PUBLIC_GEOAPIFY_KEY=your_geoapify_api_key_here
```

**Lưu ý:** Thay `your_geoapify_api_key_here` bằng API key thực từ Geoapify Dashboard.

