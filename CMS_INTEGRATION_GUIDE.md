# CMS Integration Guide for Autohaus

This document provides a comprehensive guide for completing the CMS integration from the scaffold into the autohaus application.

## Progress So Far

### ✅ Completed Steps

1. **Enhanced BaseModel** - Added automatic form generation, list views, and detail serialization
2. **Authentication Models Added**:
   - `Account` - User accounts with CMS access flags
   - `Role` - Role definitions
   - `RolePermission` - Granular permissions per model
   - `AuditLog` - Audit trail for changes
   - `Setting` - Key-value configuration store
   - `CMSImage` - Image storage

3. **Utility Files Created**:
   - `/auto_app/utils/serial.py` - Serialization helpers
   - `/auto_app/utils/permissions.py` - Permission classes (ReadPermission, WritePermission, DeletePermission, OwnerPermission)

## Remaining Steps

### Step 1: Create CMS Form Builder

Create `/auto_app/cms_forms.py` by copying from:
```
/Users/calebkandoro/code/the_benjamins/scaffold/backend/backend/api/cms_forms.py
```

Key changes needed:
- Replace `apps.get_model(app_label="api", ...)` with `apps.get_model(app_label="auto_app", ...)`
- Add a simple `throw()` function or use Django's ValidationError

### Step 2: Install Required Packages

```bash
cd /Users/calebkandoro/code/autohaus
pip install djangorestframework-simplejwt
pip install django-cors-headers
pip install pillow  # If not already installed
```

### Step 3: Update Django Settings

In `/auto_app/settings.py` or wherever settings are:

```python
INSTALLED_APPS = [
    # ... existing apps
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Add near top
    # ... other middleware
]

# CORS Settings
CORS_ALLOW_ALL_ORIGINS = True  # For development only
CORS_ALLOW_CREDENTIALS = True

# REST Framework Settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
}

# JWT Settings
from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=5),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
}
```

### Step 4: Create CMS API Views

Create `/auto_app/views/cms_api.py` by adapting from:
```
/Users/calebkandoro/code/the_benjamins/scaffold/backend/backend/api/views/cms_api.py
```

Key views needed:
- `CMSListView` - List records with pagination
- `CMSCreateView` - Create new records
- `CMSUpdateView` - Update records
- `CMSDeleteView` - Delete records
- `CurrentUserRolePermissionsView` - Get user permissions
- `DashboardAPIView` - Dashboard stats
- `SearchInputView` - Autocomplete search

### Step 5: Create Authentication Views

Create `/auto_app/views/auth_views.py`:

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from auto_app.models import Account

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)

        if user:
            refresh = RefreshToken.for_user(user)
            account = getattr(user, 'account', None)

            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'is_cms_user': account.is_cms_user if account else False,
                }
            })
        return Response({'error': 'Invalid credentials'}, status=401)

class SignUpView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        # Implement signup logic
        pass
```

### Step 6: Update URL Routing

In `/auto_app/urls.py`:

```python
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from auto_app.views.auth_views import LoginView, SignUpView
from auto_app.views.cms_api import (
    CMSListView, CMSCreateView, CMSUpdateView, CMSDeleteView,
    CurrentUserRolePermissionsView, DashboardAPIView
)

urlpatterns = [
    # ... existing patterns

    # Authentication
    path('api/login/', LoginView.as_view()),
    path('api/signup/', SignUpView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),

    # CMS Operations
    path('api/cms/list/<str:entity>/', CMSListView.as_view()),
    path('api/cms/create/<str:entity>/', CMSCreateView.as_view()),
    path('api/cms/update/<str:entity>/<int:id>/', CMSUpdateView.as_view()),
    path('api/cms/delete/<str:entity>/<int:id>/', CMSDeleteView.as_view()),
    path('api/cms/current-user-permissions/', CurrentUserRolePermissionsView.as_view()),
    path('api/cms/dashboard-stats/', DashboardAPIView.as_view()),
]
```

### Step 7: Create and Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

### Step 8: Create Initial Roles Fixture

Create `/fixtures/roles.json`:

```json
[
  {
    "model": "auto_app.role",
    "pk": 1,
    "fields": {
      "name": "Administrator",
      "role_name": "Administrator",
      "group": null
    }
  },
  {
    "model": "auto_app.role",
    "pk": 2,
    "fields": {
      "name": "Dealer",
      "role_name": "Dealer",
      "group": null
    }
  }
]
```

Load it:
```bash
python manage.py loaddata fixtures/roles.json
```

### Step 9: Frontend - Install Dependencies

```bash
cd frontend/vite/autohaus
npm install zustand
npm install chart.js react-chartjs-2
npm install react-spinners
```

### Step 10: Update http.jsx with JWT Interceptors

In `/frontend/vite/autohaus/src/utils/http.jsx`:

```javascript
import axios from 'axios';
import { url } from '../constants';

const http = axios.create({
    baseURL: url
});

// Request interceptor to add JWT token
http.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh
http.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                const response = await axios.post(`${url}/api/token/refresh/`, {
                    refresh: refreshToken
                });

                const { access } = response.data;
                localStorage.setItem('access_token', access);
                originalRequest.headers.Authorization = `Bearer ${access}`;

                return http(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default http;
```

### Step 11: Create Zustand Store

Create `/frontend/vite/autohaus/src/store.js`:

```javascript
import { create } from 'zustand';

const useStore = create((set) => ({
    user: null,
    setUser: (user) => set({ user }),

    toast: null,
    showToast: (message, type = 'info') => set({
        toast: { message, type, timestamp: Date.now() }
    }),
    clearToast: () => set({ toast: null }),

    permissions: [],
    setPermissions: (permissions) => set({ permissions }),

    logout: () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        set({ user: null, permissions: [] });
    }
}));

export default useStore;
```

### Step 12: Copy CMS Components

Copy these directories from scaffold to autohaus:

```bash
# From scaffold frontend
cp -r /Users/calebkandoro/code/the_benjamins/scaffold/frontend/src/pages/cms \
      /Users/calebkandoro/code/autohaus/frontend/vite/autohaus/src/pages/

cp -r /Users/calebkandoro/code/the_benjamins/scaffold/frontend/src/components/cms \
      /Users/calebkandoro/code/autohaus/frontend/vite/autohaus/src/components/

cp -r /Users/calebkandoro/code/the_benjamins/scaffold/frontend/src/components/form \
      /Users/calebkandoro/code/autohaus/frontend/vite/autohaus/src/components/
```

Update imports in copied files:
- Change relative import paths to match autohaus structure
- Update API endpoint references if needed

### Step 13: Update Frontend Routing

In `/frontend/vite/autohaus/src/App.jsx`, add CMS routes:

```javascript
import CMSRoot from './components/cms/root';
import CMSHome from './pages/cms/home';
import Dashboard from './pages/cms/dashboard';
import ListPage from './pages/cms/list';
import CreatePage from './pages/cms/create';
import UpdatePage from './pages/cms/update';

// ... in your Routes
<Route path="/cms" element={<CMSRoot />}>
    <Route path="home" element={<CMSHome />} />
    <Route path="dashboard" element={<Dashboard />} />
    <Route path="list/:entity" element={<ListPage />} />
    <Route path="create/:entity" element={<CreatePage />} />
    <Route path="update/:entity/:id" element={<UpdatePage />} />
</Route>
```

### Step 14: Update Navbar to Show CMS Link

In your main navbar component:

```javascript
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/http';
import useStore from '../store';

function Navbar() {
    const user = useStore((state) => state.user);
    const [isCMSUser, setIsCMSUser] = useState(false);

    useEffect(() => {
        if (user) {
            // Check if user has CMS access
            axios.get('/api/cms/current-user-permissions/')
                .then(res => {
                    setIsCMSUser(res.data?.role != null);
                })
                .catch(() => setIsCMSUser(false));
        }
    }, [user]);

    return (
        <nav>
            {/* ... other nav items */}
            {isCMSUser && (
                <Link to="/cms/home">CMS Dashboard</Link>
            )}
        </nav>
    );
}
```

### Step 15: Create Admin User with CMS Access

```bash
python manage.py shell
```

```python
from django.contrib.auth.models import User
from auto_app.models import Account, Role

# Create superuser if not exists
user = User.objects.create_superuser('admin', 'admin@autohaus.com', 'password')

# Create or get admin role
admin_role = Role.objects.get(pk=1)  # Administrator role from fixture

# Create account
account = Account.objects.create(
    user=user,
    is_cms_user=True,
    role=admin_role,
    phone='+263123456789'
)
```

### Step 16: Set Up Role Permissions

```python
from django.contrib.contenttypes.models import ContentType
from auto_app.models import Role, RolePermission, Vehicle, Seller, Make, Model

admin_role = Role.objects.get(role_name='Administrator')

# Grant full permissions on all models
for model in [Vehicle, Seller, Make, Model]:
    content_type = ContentType.objects.get_for_model(model)
    RolePermission.objects.create(
        role=admin_role,
        entity=content_type,
        can_read=True,
        can_write=True,
        can_delete=True
    )
```

## Testing the Integration

1. Start the Django server:
```bash
python manage.py runserver
```

2. Start the React dev server:
```bash
cd frontend/vite/autohaus
npm run dev
```

3. Login with admin credentials
4. Navigate to `/cms/home`
5. You should see the CMS dashboard with menu items for managing vehicles, sellers, makes, models, etc.

## Key Files Reference

### Backend Files to Create/Modify:
- `/auto_app/cms_forms.py` - Form builder (copy from scaffold)
- `/auto_app/views/cms_api.py` - CMS API views (copy from scaffold)
- `/auto_app/views/auth_views.py` - Authentication views
- `/auto_app/urls.py` - Add CMS routes
- Settings file - Add JWT, CORS, REST Framework config

### Frontend Files to Copy:
- `/src/pages/cms/*` - All CMS pages
- `/src/components/cms/*` - CMS layout components
- `/src/components/form/*` - Form components
- `/src/store.js` - Global state
- `/src/utils/http.jsx` - HTTP client with JWT

## Additional Customizations

### Add Custom Dashboard Stats

In `DashboardAPIView`:
```python
def get(self, request):
    from auto_app.models import Vehicle, Seller, SavedListing

    return Response({
        'total_vehicles': Vehicle.objects.count(),
        'total_sellers': Seller.objects.count(),
        'total_dealers': Seller.objects.filter(is_dealer=True).count(),
        'total_saved_listings': SavedListing.objects.count(),
        # Add more stats as needed
    })
```

### Customize Model Forms

Override `form_fields()` in your models:
```python
class Vehicle(BaseModel):
    @classmethod
    def form_fields(cls):
        from auto_app.cms_forms import CMSFormBuilder
        builder = CMSFormBuilder(cls)
        builder.add_section()
        builder.add_field('make')
        builder.add_field('model')
        builder.add_column()
        builder.add_field('year')
        builder.add_field('price')
        builder.add_section()
        builder.add_field('description')
        builder.add_table("Photos", "vehiclephoto", ["photo", "is_main"])
        return builder.to_dict()
```

## Troubleshooting

### Issue: Import errors for cms_forms
- Make sure you've created `/auto_app/cms_forms.py`
- Check that `throw()` function is defined or replaced with ValidationError

### Issue: Permission denied errors
- Verify user has Account with a Role
- Check that RolePermissions exist for the models
- Ensure ContentType matches your app_label ('auto_app')

### Issue: CORS errors
- Verify CORS middleware is installed and configured
- Check CORS_ALLOW_ALL_ORIGINS is True for development

### Issue: Token refresh fails
- Check JWT settings in Django settings
- Verify tokens are being stored in localStorage
- Check token expiration times

## Next Steps

After completing the integration:

1. Add more models to CMS (City, FAQ, ContactEntry, etc.)
2. Customize dashboard with charts and analytics
3. Add role-based menu items
4. Implement dealer-specific views and permissions
5. Add bulk operations (import/export)
6. Add advanced filtering and search
7. Implement real-time notifications
8. Add audit log viewing in CMS

## Security Considerations

- Change CORS_ALLOW_ALL_ORIGINS to specific domains in production
- Use environment variables for SECRET_KEY
- Implement rate limiting on authentication endpoints
- Add HTTPS in production
- Regularly rotate JWT secret keys
- Implement proper password policies
- Add two-factor authentication for CMS users
