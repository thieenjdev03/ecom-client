# 🔐 Me API

**Endpoint:** `GET /auth/me`  
**Auth:** Bearer JWT (required)  
**Returns:** Current authenticated user's profile (`UserResponseDto`)

---

## 📄 Description
Retrieve the profile of the currently authenticated user based on the JWT payload (`sub`).

---

## 🧭 Request
```http
GET /auth/me
Authorization: Bearer <accessToken>
```

### Headers
- `Authorization`: `Bearer <accessToken>`
- `Content-Type`: `application/json` (optional)

---

## ✅ Success Response
```json
{
  "data": {
    "id": "68b7ec4d-1d02-df24-e5d3-3793abcd1234",
    "email": "user@example.com",
    "phoneNumber": "+84 901234567",
    "role": "USER",
    "profile": "John Doe",
    "createdAt": "2025-10-12T08:30:00.000Z",
    "updatedAt": "2025-10-12T08:30:00.000Z",
    "addresses": [],
    "orders": [],
    "wishlists": [],
    "cart": [],
    "payments": []
  },
  "message": "OK",
  "success": true
}
```

> Note: The exact wrapper shape may follow your global response interceptor if configured.

---

## ❌ Error Responses
- `401 Unauthorized` – Missing/invalid token
- `403 Forbidden` – Token present but not allowed (unlikely for this route unless custom guards)

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

---

## 🧪 Examples

### curl
```bash
curl -X GET \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/auth/me
```

### fetch (TypeScript)
```typescript
const getMe = async (token: string) => {
  const res = await fetch('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch /auth/me');
  return res.json();
};

// Quick access to userProfile
const getUserProfile = async (token: string) => {
  const body = await getMe(token);
  const userProfile = body?.data?.profile; // string | undefined
  return userProfile;
};
```

### axios (TypeScript)
```typescript
import axios from 'axios';

const getMe = async (token: string) => {
  const { data } = await axios.get('/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return data;
};

// Quick access to userProfile
const getUserProfile = async (token: string) => {
  const body = await getMe(token);
  const userProfile = body?.data?.profile; // string | undefined
  return userProfile;
};
```

---

## 🧱 Contract
Response body maps to `UserResponseDto`:
- `id: string`
- `email: string`
- `phoneNumber?: string`
- `role: 'ADMIN' | 'USER'`
- `profile?: string`
- `createdAt: string`
- `updatedAt: string`
- `addresses?: any[]`
- `orders?: any[]`
- `wishlists?: any[]`
- `cart?: any[]`
- `payments?: any[]`

---

## 🔎 Notes for Frontend
- Ensure token is refreshed before expiry to avoid 401.
- Cache the `/auth/me` result per session to reduce calls; invalidate on logout.

---

**Last Updated:** 2025-10-16  
**API Version:** v1
