# Authentication Migration to JWT

All authentication endpoints have been updated to use JWT authentication (`/api/auth/*`) instead of the old session-based authentication.

## Changes Made

### 1. Login Component (`src/components/login.jsx`)
**Changes:**
- Updated endpoint from `/api/login/` to `/api/auth/login/`
- Changed field from `email` to `username` (Django default)
- Now stores JWT tokens in Zustand store
- Maintains backward compatibility with localStorage for existing code
- Added better error handling with specific error messages
- Changed Content-Type from `application/x-www-form-urlencoded` to `application/json`

**New Flow:**
1. User enters username and password
2. POST to `/api/auth/login/`
3. Receives `{ success, access, refresh, user }` response
4. Stores tokens in Zustand store via `setUser(user, access, refresh)`
5. Also stores access token in localStorage for backward compatibility
6. Updates context user for existing components

### 2. Sign Up Component (`src/components/sign_up.jsx`)
**Changes:**
- Updated endpoint from `/api/sign-up/` to `/api/auth/signup/`
- Added `username` field (required)
- Now stores JWT tokens in Zustand store
- Added client-side password matching validation
- Simplified error handling
- Changed Content-Type to `application/json`
- Removed unused fields (country, city) from API call

**New Flow:**
1. User enters username, email, password, etc.
2. Client validates password match
3. POST to `/api/auth/signup/`
4. Receives `{ success, access, refresh, user }` response
5. Stores tokens in Zustand store
6. Updates context user and closes modal

### 3. App Component (`src/App.jsx`)
**Changes:**
- Added Zustand store import
- Updated user details endpoint from `/api/user-details/` to `/api/auth/current-user/`
- Enhanced error handling - clears invalid tokens
- Updated `signOut()` to also call Zustand `logout()`
- Maintains backward compatibility with existing Context API

**New Flow:**
- On app load, checks for token in localStorage
- If found, calls `/api/auth/current-user/` to restore session
- On logout, clears both localStorage and Zustand store

### 4. HTTP Client (`src/utils/http.js`)
**Already updated with:**
- JWT Bearer token injection
- Automatic token refresh on 401 errors
- Fallback to old Token auth for backward compatibility

## API Endpoints Used

### Authentication Endpoints
- `POST /api/auth/login/` - Login with username/password
  - Request: `{ username, password }`
  - Response: `{ success, access, refresh, user }`

- `POST /api/auth/signup/` - User registration
  - Request: `{ username, email, password, first_name, last_name, phone }`
  - Response: `{ success, access, refresh, user }`

- `GET /api/auth/current-user/` - Get current user details
  - Headers: `Authorization: Bearer <access_token>`
  - Response: `{ success, user }`

- `POST /api/token/refresh/` - Refresh access token
  - Request: `{ refresh }`
  - Response: `{ access }`

## User Object Structure

The JWT endpoints return a consistent user object:
```javascript
{
  id: 1,
  username: "john_doe",
  email: "john@example.com",
  first_name: "John",
  last_name: "Doe",
  is_cms_user: false,
  is_superuser: false,
  role: null,  // For CMS users
  phone: ""    // For CMS users
}
```

## Backward Compatibility

The migration maintains backward compatibility:
- Still stores access token in `localStorage.getItem('user_token')`
- Still updates the Context API user state
- HTTP client still checks for old Token auth if JWT not available
- Existing components continue to work without changes

## Testing Checklist

- [x] Login with username/password works
- [x] Sign up creates new user and logs them in
- [x] User session persists after page refresh
- [x] Logout clears all tokens and user data
- [x] Invalid credentials show error message
- [x] Duplicate username/email shows error
- [x] Password mismatch validation works
- [x] CMS link appears for CMS users after login
- [x] Token refresh works automatically on 401 errors

## Migration Notes

### For Developers

1. **Username is now required for login** (not email)
   - Users should use their username to log in
   - Email is still collected during signup

2. **JWT tokens expire**
   - Access tokens: 5 hours
   - Refresh tokens: 7 days
   - Auto-refresh happens transparently

3. **Two user states exist temporarily**
   - Context API user (for existing components)
   - Zustand store user (for CMS and new features)
   - Eventually migrate all components to use Zustand

### For Users

1. **Existing users need to use username to login**
   - If they forgot their username, they can create a new account
   - Admin can look up username in Django admin

2. **Sessions last 5 hours**
   - After 5 hours of inactivity, users auto-refresh
   - After 7 days, users must login again

## Next Steps

1. **Migrate all components to use Zustand store** instead of Context API
2. **Add "Forgot Password" functionality** using Django's password reset flow
3. **Add email verification** for new signups
4. **Implement social authentication** (Google, Facebook) with JWT
5. **Add user profile management** page

## Troubleshooting

**Issue: "Cannot login" error**
- Check that username is correct (not email)
- Verify backend is running on http://localhost:8000
- Check browser console for specific error messages

**Issue: User logged out after page refresh**
- Check that tokens are in localStorage and Zustand store
- Verify `/api/auth/current-user/` endpoint is accessible
- Check browser console for 401 errors

**Issue: CMS link not appearing**
- User must have `is_cms_user=True` or `is_superuser=True`
- Check that tokens were stored correctly after login
- Refresh page to trigger user state sync
