# User Profile API Integration Summary

## ✅ Changes Implemented

### 1. **API Configuration** ([lib/api-config.ts](lib/api-config.ts))
Added new user endpoint:
```typescript
user: {
  profile: '/api/user/profile',
}
```

### 2. **Type Definitions** ([lib/types/user.ts](lib/types/user.ts))
Created `UserProfileDTO` interface matching your backend:
```typescript
interface UserProfileDTO {
  firstName: string
  lastName: string
  email: string
  phone?: string
  location?: string
  dateOfBirth?: string
  role: string
  gradeLevel?: string  // For students
  school?: string
  bio?: string
}
```

### 3. **User API Service** ([lib/api/user.ts](lib/api/user.ts))
Created `userApi.getProfile()` function with:
- ✅ Automatic Bearer token authentication
- ✅ Error handling with `ApiException`
- ✅ Checks for token existence
- ✅ Returns typed `UserProfileDTO`

### 4. **Profile Component** ([components/profile/profile-content.tsx](components/profile/profile-content.tsx))
Updated to:
- ✅ Fetch user data from backend on mount using `useEffect`
- ✅ Show loading spinner while fetching data
- ✅ Handle authentication errors (redirects to login)
- ✅ Display toast notifications for errors
- ✅ Use real data from backend instead of mock data

## 🔐 Authentication Flow

The profile page requires authentication:

1. **User logs in** → Token stored in `localStorage`
2. **User navigates to `/profile`**
3. **Profile component fetches data:**
   ```typescript
   GET /api/user/profile
   Headers: Authorization: Bearer {token}
   ```
4. **Backend extracts user ID from JWT** (handled automatically)
5. **Backend returns user data**
6. **Profile displays data**

If no token exists or token is invalid:
- Shows error toast
- Redirects to `/login`

## 📊 Data Mapping

Your backend returns additional fields that aren't in the database yet:

| Backend Field | Frontend Display | Current Status |
|--------------|------------------|----------------|
| `firstName` | User's first name | ✅ From DB |
| `lastName` | User's last name | ✅ From DB |
| `email` | User's email | ✅ From DB |
| `role` | User role badge | ✅ From DB |
| `gradeLevel` | Grade display (students) | ✅ From DB |
| `school` | School name | ✅ From DB |
| `phone` | Phone number | ⚠️ Mock data |
| `location` | User location | ⚠️ Mock data |
| `dateOfBirth` | Birth date | ⚠️ Mock data |
| `bio` | User bio | ⚠️ Mock data |

## 🧪 Testing Instructions

### 1. Start your backend
```bash
# Make sure it's running on http://localhost:8080
```

### 2. Start frontend dev server
```bash
npm run dev
```

### 3. Test the flow
1. **Register a new account** at `http://localhost:3000/register`
2. **Verify OTP** at the verification page
3. **Login** at `http://localhost:3000/login`
4. **Navigate to profile** at `http://localhost:3000/profile`
5. **Verify data loads** from the backend

### 4. Expected Behavior
- ✅ Loading spinner appears briefly
- ✅ Your name, email, and role display correctly
- ✅ Phone shows: "+373 69 123 456" (mock)
- ✅ Location shows: "Chisinau, Moldova" (mock)
- ✅ If student: grade level displays
- ✅ If student/teacher: school name displays
- ✅ Bio shows mock text

### 5. Error Testing
To test error handling:

**Test 401 (Unauthorized):**
```javascript
// In browser console:
localStorage.removeItem('authToken')
// Then refresh the page - should redirect to login
```

**Test with invalid token:**
```javascript
localStorage.setItem('authToken', 'invalid-token')
// Then refresh - should show error and redirect
```

## 🔍 Debugging Tips

### Check if token exists:
```javascript
// In browser console:
console.log(localStorage.getItem('authToken'))
```

### Check API request in Network tab:
1. Open DevTools → Network tab
2. Refresh profile page
3. Look for request to `/api/user/profile`
4. Check:
   - Request headers include `Authorization: Bearer ...`
   - Response status (should be 200)
   - Response body contains your data

### Common Issues:

| Issue | Solution |
|-------|----------|
| "No authentication token found" | Login again to get new token |
| "Invalid token" | Backend JWT secret might have changed, login again |
| "User not found" | User ID in JWT doesn't match database |
| CORS error | Backend needs to allow requests from localhost:3000 |
| Network error | Check if backend is running on port 8080 |

## 🎯 Next Steps

Consider implementing:

1. **Edit Profile Functionality**
   - Add `PUT /api/user/profile` endpoint in backend
   - Wire up the "Save" button to update user data

2. **Profile Picture Upload**
   - Add image upload endpoint
   - Store avatar URL in database
   - Display uploaded image

3. **Real Phone/Location/DOB**
   - Add these fields to your database models
   - Update backend to return real data
   - Add forms to let users update these fields

4. **Logout Functionality**
   - Add logout button
   - Clear tokens from localStorage
   - Redirect to login page

## 📝 Code Examples

### Accessing user data in other components:
```typescript
import { userApi } from '@/lib/api/user'

async function loadUserData() {
  try {
    const profile = await userApi.getProfile()
    console.log(`Welcome, ${profile.firstName}!`)
  } catch (error) {
    console.error('Failed to load profile')
  }
}
```

### Checking if user is authenticated:
```typescript
function isAuthenticated(): boolean {
  return !!localStorage.getItem('authToken')
}
```

### Creating a protected route:
```typescript
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ProtectedPage() {
  const router = useRouter()
  
  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      router.push('/login')
    }
  }, [router])
  
  return <div>Protected content</div>
}
```

## ✨ Summary

The profile page is now fully connected to your backend! It:
- ✅ Fetches real user data from `/api/user/profile`
- ✅ Authenticates using JWT tokens
- ✅ Shows appropriate loading and error states
- ✅ Redirects unauthenticated users to login
- ✅ Displays all data from your `UserProfileDTO`

The integration is complete and ready for testing! 🚀
