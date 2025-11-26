# AutoHaus CMS Frontend - Setup Guide

The CMS frontend has been successfully implemented! Here's everything you need to know to get started.

## What Was Built

### 1. Core Infrastructure
- **Zustand Store** (`src/store.js`): Global state management for user authentication, permissions, and toast notifications
- **JWT Authentication**: Automatic token refresh on 401 errors, seamless authentication flow
- **HTTP Interceptors**: Updated `src/utils/http.js` with Bearer token injection and refresh logic

### 2. CMS Components
- **CMSRoot** (`src/cms/components/CMSRoot.jsx`): Root layout with authentication checks
- **CMSNavbar** (`src/cms/components/CMSNavbar.jsx`): CMS-specific navigation with user menu
- **Toast** (`src/cms/components/Toast.jsx`): Toast notification system
- **RenderField** (`src/cms/components/RenderField.jsx`): Dynamic form field renderer supporting all Django field types

### 3. CMS Pages
- **Home** (`src/cms/pages/Home.jsx`): Dashboard landing page with model categories and recent activity
- **List** (`src/cms/pages/List.jsx`): Generic list view for any entity with pagination
- **Create** (`src/cms/pages/Create.jsx`): Generic create form with dynamic field generation
- **Update** (`src/cms/pages/Update.jsx`): Generic update/view form with permission-based editing
- **Dashboard** (`src/cms/pages/Dashboard.jsx`): Statistics dashboard with Chart.js visualizations

### 4. Styling
- **CMS Styles** (`src/cms/styles/cms.module.css`): Complete styling for all CMS components

### 5. Routing
- Updated `src/App.jsx` with CMS routes:
  - `/cms` - Home page
  - `/cms/dashboard` - Statistics dashboard
  - `/cms/list/:entity` - List view for any entity
  - `/cms/create/:entity` - Create form for any entity
  - `/cms/update/:entity/:id` - Update/view form for specific item

### 6. Main Navbar Integration
- Updated `src/components/nav.jsx` to show CMS link only for authorized users

## How to Use

### 1. Start the Backend
```bash
cd /Users/calebkandoro/code/autohaus
python manage.py runserver
```

### 2. Start the Frontend
```bash
cd frontend/vite/autohaus
npm run dev
```

### 3. Create a CMS User

You need to create a superuser or a user with CMS access:

**Option A: Create Superuser**
```bash
python manage.py createsuperuser
```

**Option B: Create User via Django Admin**
1. Go to http://localhost:8000/admin
2. Create a User
3. Create an Account linked to that user
4. Set `is_cms_user = True` and assign a Role
5. Create a Role with RolePermissions for the entities you want them to access

### 4. Login via JWT

The CMS uses JWT authentication. You have two options:

**Option A: Use Django Admin to create user, then login via API**
```bash
# Login and get tokens
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "your_username", "password": "your_password"}'
```

**Option B: Create a login page in your React app**
The store is already set up to handle JWT tokens. You just need to:
1. Call `/api/auth/login/` with username and password
2. Store the tokens using `setUser(user, accessToken, refreshToken)`
3. The tokens will automatically be injected in all requests

### 5. Access the CMS

Once logged in with a CMS user:
1. You'll see a "CMS" link in the main navbar
2. Click it to go to `/cms`
3. You'll see categorized models based on your permissions
4. Click any model to view/edit/delete items

## Features

### Permission-Based Access
- Only users with `is_cms_user=True` or `is_superuser=True` can access CMS
- Each page checks permissions before rendering
- Superusers have all permissions automatically
- Regular CMS users only see/edit content they have permissions for

### Dynamic Form Generation
Forms are automatically generated from Django model schemas:
- All Django field types supported (text, number, date, boolean, foreign key, etc.)
- Foreign key fields automatically fetch available options
- Image fields support file upload with preview
- Form validation based on Django model requirements

### Audit Logging
All CMS operations (create, update, delete) are automatically logged to the AuditLog model for compliance and tracking.

### Toast Notifications
Success/error messages appear as toast notifications in the top-right corner.

### Responsive Design
The CMS is fully responsive and works on mobile devices.

## Model Categories

Models are organized into logical categories on the home page:

1. **Vehicle Management**: Vehicles, Makes, Models, Photos
2. **User Management**: Sellers, Accounts, Roles
3. **Content Management**: FAQs, FAQ Categories, Contact Entries
4. **Configuration**: Cities, Currencies, Settings

## API Endpoints Used

The frontend calls these backend endpoints:

- `POST /api/auth/login/` - Login with JWT
- `POST /api/auth/signup/` - User registration
- `GET /api/auth/current-user/` - Get current user details
- `POST /api/token/refresh/` - Refresh access token
- `GET /api/cms/current-user-permissions/` - Get user permissions
- `GET /api/cms/list/:entity/` - List items
- `POST /api/cms/create/:entity/` - Create item
- `GET /api/cms/update/:entity/:id/` - Get item for editing
- `PUT /api/cms/update/:entity/:id/` - Update item
- `DELETE /api/cms/delete/:entity/:id/` - Delete item
- `GET /api/cms/dashboard-stats/` - Get dashboard statistics
- `GET /api/cms/search-input/` - Search for foreign key options

## Next Steps

1. **Create test users with different permission levels** to verify RBAC works correctly
2. **Customize the Dashboard** with your specific KPIs and charts
3. **Add more model categories** if needed
4. **Create a Login/Signup page** in the main app that uses JWT authentication
5. **Add custom validation** for specific forms if needed
6. **Implement file uploads** for vehicle photos via the CMS

## Troubleshooting

**Issue: Can't access /cms**
- Make sure you're logged in with a user that has `is_cms_user=True` or `is_superuser=True`
- Check browser console for authentication errors

**Issue: Can't see certain models**
- Check that your Role has RolePermissions with `can_read=True` for that entity
- Superusers bypass this check

**Issue: Token expired**
- Tokens automatically refresh. If you get logged out, just login again
- Access tokens last 5 hours, refresh tokens last 7 days

**Issue: Form fields not showing**
- Check that the backend model has a `form_fields()` classmethod
- Check browser console for API errors

## Files Created/Modified

### New Files
- `src/store.js`
- `src/cms/components/CMSRoot.jsx`
- `src/cms/components/CMSNavbar.jsx`
- `src/cms/components/Toast.jsx`
- `src/cms/components/RenderField.jsx`
- `src/cms/pages/Home.jsx`
- `src/cms/pages/List.jsx`
- `src/cms/pages/Create.jsx`
- `src/cms/pages/Update.jsx`
- `src/cms/pages/Dashboard.jsx`
- `src/cms/styles/cms.module.css`

### Modified Files
- `src/utils/http.js` - Added JWT interceptors
- `src/App.jsx` - Added CMS routes
- `src/components/nav.jsx` - Added CMS link for authorized users

Enjoy your new CMS! 🎉
