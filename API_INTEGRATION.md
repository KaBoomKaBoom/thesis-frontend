# Backend API Integration

This project has been successfully connected to the backend API. Below is the complete documentation.

## 📁 API Structure

### Files Created

- `lib/api-config.ts` - API configuration and endpoint definitions
- `lib/types/auth.ts` - TypeScript types matching backend DTOs
- `lib/api/auth.ts` - Authentication API service functions
- `.env.local.example` - Environment variables template

### Environment Setup

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

## 🔐 Authentication Endpoints

All authentication endpoints are implemented and integrated:

### 1. Register (`POST /api/auth/register`)
**DTO:**
```typescript
{
  firstName: string
  lastName: string
  email: string
  password: string
  role: string  // "student" | "teacher" | "parent"
}
```

**Usage:** Registration form at `/register`
- Validates all required fields
- Sends registration request to backend
- On success, redirects to OTP verification page
- Displays error messages via toast notifications

### 2. Verify OTP (`POST /api/auth/verify-otp`)
**DTO:**
```typescript
{
  email: string
  otp: string  // 6-digit code
}
```

**Usage:** OTP verification form at `/verify`
- Receives email from registration via URL parameter
- Validates 6-digit OTP code
- Stores authentication tokens if returned
- Redirects to profile or login based on response

### 3. Login (`POST /api/auth/login`)
**DTO:**
```typescript
{
  email: string
  password: string
}
```

**Usage:** Login form at `/login`
- Validates email and password
- Stores `authToken` and `refreshToken` in localStorage
- Redirects to `/profile` on success
- Shows error messages for invalid credentials

### 4. Refresh Token (`POST /api/auth/refresh`)
**DTO:**
```typescript
{
  token: string  // refresh token
}
```

**Usage:** Available via `authApi.refreshToken()`
- Can be used to refresh expired access tokens
- Implement in API middleware for automatic token refresh

### 5. Health Checks
- `GET /api/auth/api-health` - Check API availability
- `GET /api/auth/db-health` - Check database connection

## 💾 Token Storage

The application stores authentication tokens in `localStorage`:

```typescript
// After successful login or OTP verification:
localStorage.setItem('authToken', response.token)
localStorage.setItem('refreshToken', response.refreshToken)

// To retrieve:
const authToken = localStorage.getItem('authToken')
const refreshToken = localStorage.getItem('refreshToken')
```

## 🚀 Using the API Service

Import and use the API service in your components:

```typescript
import { authApi, ApiException } from '@/lib/api/auth'

// Register a user
try {
  const response = await authApi.register({
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    password: "password123",
    role: "student"
  })
  // Handle success
} catch (error) {
  if (error instanceof ApiException) {
    // Handle API error
    console.error(error.message)
    console.error(error.status)
    console.error(error.errors) // Field-specific errors
  }
}
```

## ⚠️ Error Handling

All API calls use a consistent error handling pattern:

1. **Success**: Returns the response data
2. **API Error**: Throws `ApiException` with:
   - `message`: Error description
   - `status`: HTTP status code
   - `errors`: Field-specific validation errors (optional)

3. **Network Error**: Throws standard Error

Example error handling in forms:

```typescript
try {
  await authApi.login(data)
  toast({ title: "Success", description: "Logged in successfully" })
} catch (error) {
  if (error instanceof ApiException) {
    toast({
      title: "Login failed",
      description: error.message,
      variant: "destructive"
    })
    
    // Handle field-specific errors
    if (error.errors) {
      const fieldErrors = {}
      Object.entries(error.errors).forEach(([field, messages]) => {
        fieldErrors[field.toLowerCase()] = messages[0]
      })
      setErrors(fieldErrors)
    }
  }
}
```

## 🔧 Updated Components

The following components have been updated to use the backend API:

### 1. `components/auth/login-form.tsx`
- ✅ Calls `authApi.login()`
- ✅ Stores tokens in localStorage
- ✅ Shows toast notifications
- ✅ Handles field-specific errors

### 2. `components/auth/register-form.tsx`
- ✅ Calls `authApi.register()`
- ✅ Validates form data
- ✅ Shows toast notifications
- ✅ Redirects to OTP verification

### 3. `components/auth/otp-verification-form.tsx`
- ✅ Calls `authApi.verifyOtp()`
- ✅ Stores tokens if returned
- ✅ Shows toast notifications
- ✅ Handles resend functionality (note: backend doesn't have dedicated resend endpoint)

### 4. `app/layout.tsx`
- ✅ Added `<Toaster />` component for notifications

## 📝 Notes

### OTP Resend Functionality
The current backend API doesn't have a dedicated endpoint for resending OTP codes. The `handleResend` function in the OTP verification form is implemented but you may need to:
- Add a resend endpoint to your backend API, OR
- Implement resend logic by re-calling the register endpoint with the same email

### Token Refresh
The refresh token endpoint is available but not automatically integrated. Consider implementing:
- Axios/Fetch interceptors to automatically refresh tokens
- A middleware to handle 401 responses and retry with refreshed tokens

### Recommendations
1. **Add authentication context**: Create a React Context to manage auth state globally
2. **Protected routes**: Add middleware to protect authenticated routes
3. **Token expiration**: Implement automatic token refresh before expiration
4. **Logout functionality**: Add logout function to clear tokens
5. **CORS**: Ensure your backend allows requests from your frontend origin

## 🧪 Testing

Make sure your backend is running on `http://localhost:8080` before testing:

1. **Register**: Visit `/register` and create a new account
2. **Verify OTP**: Check your email for the code and enter it at `/verify`
3. **Login**: Visit `/login` and sign in with your credentials

## 🔐 Security Considerations

- **Never commit `.env.local`** to version control
- Consider using `httpOnly` cookies instead of localStorage for tokens
- Implement CSRF protection
- Add rate limiting for authentication endpoints
- Use HTTPS in production
