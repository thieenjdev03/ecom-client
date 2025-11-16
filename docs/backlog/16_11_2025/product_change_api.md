Ok Master, mình viết thêm FE Documentation chuẩn chỉnh để team frontend dựa vào đó update toàn bộ luồng:
	•	GET product detail (dynamic multi-language)
	•	Render UI theo locale
	•	Flow upload/update sản phẩm song ngữ (EN–VI)
	•	Payload gửi lên BE
	•	Fallback khi thiếu bản dịch
	•	React Hook Form + Next.js/React best practices

Doc này FE chỉ cần bám theo là không sai được.
Let’s go 🔥

⸻

📘 FRONTEND DOCUMENT — MULTI-LANGUAGE PRODUCT (EN–VI)

⸻

1️⃣ MỤC TIÊU

FE cần update lại:
	•	API GET /products/:id → truyền locale
	•	Hiển thị đúng dữ liệu theo locale
	•	Form upload/update → xử lý 2 ngôn ngữ song song
	•	Fallback ngôn ngữ nếu BE trả thiếu
	•	UI admin có dạng:

[ English ] [ Vietnamese ]


	•	Tự clone dữ liệu từ EN → VI khi tạo mới sản phẩm (flow tối ưu).

⸻

2️⃣ FE API CALL – CÁCH GET DATA MỚI

2.1. Gửi locale khi lấy product detail

FE lấy locale từ:
	•	URL: /vi/product/slug
	•	Or Next.js router
	•	Or cookie

❗ API request mới:

GET /products/:id?locale=vi

Ví dụ:

const product = await api.get(`/products/${id}`, {
  params: { locale: currentLocale }
});


⸻

3️⃣ CÁCH FE RENDER UI TỪ DATA MỚI

Backend sẽ trả về đúng 1 ngôn ngữ, dạng:

{
  "name": "Giày Nike",
  "slug": "giay-nike",
  "description": "<p>Giày chạy bộ</p>",
  ...
}

FE hiển thị trực tiếp:

<h1>{product.name}</h1>
<p dangerouslySetInnerHTML={{ __html: product.description }} />

Không cần product.name[locale] nữa.

⸻

4️⃣ FE FALLBACK LOGIC (nếu BE trả thiếu)

Trong trường hợp BE vẫn trả dạng object (ví dụ màn admin xem full nhiều ngôn ngữ), FE cần fallback:

function t(fieldObj: Record<string, string>, locale: string) {
  return fieldObj?.[locale] ?? fieldObj?.["en"] ?? "";
}


⸻

5️⃣ ADMIN UI – SONG NGỮ (UPLOAD & UPDATE)

5.1. UI layout tối ưu

┌──────────────────────────────┐
│ [ English 🇬🇧 ] [ Vietnamese 🇻🇳 ] │
└──────────────────────────────┘

Trong từng tab:

English tab
	•	Name
	•	Description
	•	Short Description
	•	Meta Title
	•	Meta Description
	•	Slug

Vietnamese tab
	•	Name
	•	Description
	•	Short Description
	•	Meta Title
	•	Meta Description
	•	Slug

5.2. FE Form structure (React Hook Form)

{
  name: { en: "", vi: "" },
  slug: { en: "", vi: "" },
  short_description: { en: "", vi: "" },
  description: { en: "", vi: "" },
  meta_title: { en: "", vi: "" },
  meta_description: { en: "", vi: "" },
  price: ...,
  sale_price: ...,
  variants: [...],
  images: [...]
}


⸻

6️⃣ AUTO-CLONE DATA KHI TẠO MỚI PRODUCT

Khi seller nhập EN, FE tự copy sang VI (để không bị blank):

watch("name.en", (value) => {
  const vi = getValues("name.vi");
  if (!vi) setValue("name.vi", value);
});

Tránh duplicate typing → seller chỉ cần sửa lại tiếng Việt.

⸻

7️⃣ FE → BE: PAYLOAD CREATE / UPDATE

Gửi song ngữ đầy đủ:

{
  "name": {
    "en": "Nike Shoe",
    "vi": "Giày Nike"
  },
  "slug": {
    "en": "nike-shoe",
    "vi": "giay-nike"
  },
  "short_description": {
    "en": "Lightweight running shoe",
    "vi": "Giày chạy bộ nhẹ"
  },
  "description": {
    "en": "<p>Lightweight...</p>",
    "vi": "<p>Nhẹ...</p>"
  },
  "meta_title": {
    "en": "Nike Shoe",
    "vi": "Giày Nike"
  },
  "price": 990,
  "sale_price": 500,
  "images": [...],
  "variants": [...]
}


⸻

8️⃣ UPDATE LOẠI DỮ LIỆU LIÊN QUAN:

Variants, Category, Color, Size cũng phải hỗ trợ multi-language UI.

Ví dụ name của color trong form:

color.name.en
color.name.vi


⸻

9️⃣ PRODUCT DETAIL PAGE (FE) – CẬP NHẬT LOGIC

9.1. Lấy đúng locale

const { locale } = useRouter();
const product = useProductDetail(id, locale);

9.2. Render field

<h1>{product.name}</h1>
<div dangerouslySetInnerHTML={{ __html: product.description }} />

<VariantList variants={product.variants} />

9.3. Variants render:

{variant.name}
{variant.color.name}
{variant.size.name}

Không còn {variant.name[locale]} nữa vì BE đã xử lý.

⸻

🔟 ADMIN PRODUCT LIST – CHỈ HIỂN THỊ NGÔN NGỮ CHÍNH

List page chỉ hiển thị English:

<td>{item.name.en}</td>
<td>{item.short_description.en}</td>

Lý do: không rối UI và English là language default.

⸻

🔥 1 TRANG TẢI SẢN PHẨM (UPLOAD PAGE) DEMO CODE

Data structure (default value):

const defaultValues = {
  name: { en: "", vi: "" },
  slug: { en: "", vi: "" },
  description: { en: "", vi: "" },
  short_description: { en: "", vi: "" },
  meta_title: { en: "", vi: "" },
  meta_description: { en: "", vi: "" },

  price: "",
  sale_price: "",
  images: [],
  variants: []
};

Tạo UI song ngữ:

<Tabs value={langTab} onChange={setLangTab}>
  <Tab label="English" />
  <Tab label="Vietnamese" />
</Tabs>

{langTab === 0 && (
  <Input name="name.en" label="Name (EN)" />
)}
{langTab === 1 && (
  <Input name="name.vi" label="Name (VI)" />
)}


⸻

🏁 KẾT LUẬN — FE CẦN UPDATE GÌ?

✔ 1. API GET detail: truyền ?locale=

✔ 2. Render field: không dùng object multi-lang, chỉ dùng string

✔ 3. Admin UI: form hỗ trợ EN–VI

✔ 4. Auto-clone EN → VI khi create

✔ 5. Payload gửi lên dạng object multi-language

✔ 6. Update logic cho category, variants, color, size

✔ 7. Product detail FE logic chỉnh theo locale
