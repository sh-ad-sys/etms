# JWT Authentication Integration Guide

## Overview

Your ETMS now has complete JWT token handling integrated between the Next.js frontend and PHP backend. Tokens are automatically managed and attached to all API requests.

## Key Components

### 1. **JWT Utilities** (`src/lib/jwt-utils.ts`)
Handles token storage and decoding:
- `getToken()` - Retrieve JWT from localStorage
- `setToken(token)` - Store JWT in localStorage
- `removeToken()` - Clear JWT from storage
- `decodeJWT(token)` - Extract payload data
- `isTokenExpired(token)` - Check expiration
- `getBearerToken()` - Get formatted Authorization header

### 2. **Auth Module** (`src/lib/auth.ts`)
High-level authentication helpers:
- `getSessionUser()` - Get current logged-in user from token
- `isAuthenticated()` - Check if user has valid token
- `setAuthToken(token)` - Store token after login
- `clearAuth()` - Logout (clear token and session)
- `hasRole(role)` - Check user roles
- `isAdmin()`, `isManagerOrAdmin()`, `isHROrAdmin()` - Role checks

### 3. **API Client** (`src/lib/api-client.ts`)
Automatically adds JWT token to all API requests:
- `apiGet(endpoint)` - GET request with token
- `apiPost(endpoint, body)` - POST request with token
- `apiPut(endpoint, body)` - PUT request with token
- `apiPatch(endpoint, body)` - PATCH request with token
- `apiDelete(endpoint)` - DELETE request with token

### 4. **API Config** (`src/config/api.ts`)
Centralized API configuration and token management:
- `API_ENDPOINTS` - All backend endpoints
- `getAuthHeaders()` - Get headers with auto-injected token
- `setToken(token)` - Store token from login response
- `isTokenValid()` - Check if token is still valid
- `handleUnauthorized()` - Handle 401 responses

## Usage Examples

### Example 1: User Login (Already Implemented)
```typescript
// In login page (src/app/page.tsx)
const response = await fetch(API_ENDPOINTS.login, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});

const data = await response.json();
if (data.token) {
  setToken(data.token); // Token now stored and will be auto-attached to future requests
}
```

### Example 2: Get Current User
```typescript
import { getSessionUser, isAuthenticated } from '@/lib/auth';

// In any component
const user = getSessionUser();
if (user) {
  console.log(`Logged in as: ${user.name} (${user.role})`);
}

// Or just check if authenticated
if (isAuthenticated()) {
  // User has valid token
}
```

### Example 3: Make Authenticated API Request
```typescript
import { apiGet, apiPost } from '@/lib/api-client';

// GET request - token automatically added
const response = await apiGet('/controllers/get-profile.php');
console.log(response.data);

// POST request with body
const result = await apiPost('/controllers/supervisor-assignments.php', {
  department_id: 5,
  supervisor_id: 12,
});
```

### Example 4: Check User Role
```typescript
import { 
  isAdmin, 
  isManagerOrAdmin, 
  isHROrAdmin,
  hasRole 
} from '@/lib/auth';

// Role-based rendering
if (isAdmin()) {
  // Show admin panel
}

if (isManagerOrAdmin()) {
  // Show manager/admin features
}

// Check for specific roles (can pass array)
if (hasRole(['manager', 'admin'])) {
  // Show features for managers and admins
}
```

### Example 5: Logout
```typescript
import { clearAuth } from '@/lib/auth';

const handleLogout = () => {
  clearAuth(); // Clears token and redirects to login
  router.push('/');
};
```

## Token Flow

```
1. User logs in
   ↓
2. Backend returns JWT token + user data
   ↓
3. Token stored in localStorage (key: 'token')
   ↓
4. On each API request:
   - Token automatically attached as "Authorization: Bearer <token>"
   - Backend validates token and processes request
   - If token expired (401), user redirected to login
   ↓
5. User logout clears token from localStorage
```

## Token Structure (JWT Payload)

```json
{
  "user_id": 5,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "manager",
  "iat": 1712873400,
  "exp": 1712959800
}
```

## Backend Validation

Important: The frontend only **decodes** the token (reads payload), not validates it. The backend always validates:
- Token signature (HMAC-SHA256)
- Token expiration
- User permissions

This ensures security - a user cannot forge a token on the frontend.

## Environment Variables

Add to your `.env.local`:
```env
# Optional: Custom API base URL (defaults to http://localhost/etms/controllers)
NEXT_PUBLIC_API_URL=http://localhost/etms/controllers
```

## Protected Routes (Optional Setup)

To automatically redirect unauthenticated users, add middleware checks in your layout:

```typescript
// src/app/dashboard/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';

export default function DashboardLayout({ children }) {
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!getSessionUser()) {
      router.push('/');
      return;
    }
  }, [router]);

  return <>{children}</>;
}
```

## API Error Handling

When making API requests:
```typescript
try {
  const response = await apiGet('/controllers/get-profile.php');
  console.log(response.data);
} catch (error) {
  if (error.message === 'Unauthorized') {
    // User was logged out (token expired/invalid)
  } else if (error.message === 'Access forbidden') {
    // User doesn't have permission
  } else {
    // Other error occurred
  }
}
```

## Migration Notes

- Existing code using `getToken()` from `config/api.ts` continues to work
- New code should import from `lib/api-client.ts` for automatic token handling
- The `lib/auth.ts` module provides user/role info from token
- All token storage uses `localStorage` with key: `'token'`

## Summary

✅ **JWT token automatically obtained on login**
✅ **Token automatically attached to all API requests**
✅ **Token expiration checked and handled**
✅ **User info decoded from token for frontend use**
✅ **Role-based access helpers available**
✅ **Automatic redirect on 401 responses**
