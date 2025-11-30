# CMS Implementation Analysis Report

**Date:** November 30, 2025
**Analyst:** Senior Engineer
**Project:** Autohaus - Vehicle Marketplace CMS

---

## Executive Summary

This document provides a comprehensive analysis of the CMS implementation for the Autohaus vehicle marketplace. The analysis covers user flows from signup to subscription, identifies critical bugs, missing features, and provides recommendations for improvements.

**Critical Finding:** The subscription payment flow is fundamentally broken - payments are initiated but never verified or activated, making the entire subscription system non-functional.

---

## 1. Current Architecture Overview

### 1.1 Technology Stack
- **Backend:** Django 5.1.3 + Django REST Framework
- **Frontend:** React 18 + Vite + Zustand (state management)
- **Authentication:** JWT (SimpleJWT - 5hr access, 7d refresh)
- **Payment Gateway:** Paynow (Zimbabwe)
- **Database:** SQLite (development)

### 1.2 Key Models

| Model | Purpose | Status |
|-------|---------|--------|
| `User` | Django auth user | Working |
| `Account` | Links User to CMS permissions (is_cms_user, role) | Working |
| `Seller` | Vehicle seller profile | Partial |
| `Role` | Role definitions with permission groups | Working |
| `RolePermission` | Per-model CRUD permissions | Working |
| `Subscription` | User subscriptions | **BROKEN** |
| `SubscriptionPlan` | Subscription tier definitions | Working |
| `SavedListing` | User's saved vehicles | Working |
| `SavedSearch` | User's search history | Working |

---

## 2. User Flow Analysis

### 2.1 User Signup Flow

**Current Implementation:** [auth_views.py:58-146](auto_app/views/auth_views.py#L58-L146)

```
User Submits Signup Form
         |
         v
    Validate Input
    (username, email, password)
         |
         v
    Create User Object
         |
         v
    Create Account Object
    (is_cms_user=False, role=None)
         |
         v
    Return JWT Tokens
```

**Issues Identified:**

1. **No Seller Created on Signup** - The signup process creates User + Account but NOT a Seller instance. The Seller is only created when the user posts their first vehicle listing.

2. **Seller-User Gap** - This creates a broken flow where:
   - Users can browse and save listings (via SavedListing)
   - But `update_account()` in [api.py:132-153](auto_app/views/api.py#L132-L153) assumes `request.user.seller` exists:
   ```python
   def update_account(request):
       seller = request.user.seller  # CRASHES if no seller!
   ```

3. **Account-Seller Disconnection** - Account links User to CMS access, but Seller links User to vehicle listings. These are separate entities but the relationship is unclear.

### 2.2 Saved Listings Flow

**Current Implementation:** [api.py:183-206](auto_app/views/api.py#L183-L206)

```
User Saves a Listing
         |
         v
    Check if already saved
         |
         v
    Create SavedListing(user, vehicle)
         |
         v
    Success Response
```

**Status:** Working correctly. Users can save, view, and remove saved listings.

### 2.3 Vehicle Creation (Selling) Flow

**Current Implementation:** [api.py:60-115](auto_app/views/api.py#L60-L115)

```
User Submits Vehicle
         |
         v
    Check if seller exists
    (by email OR phone)
         |
    +----+----+
    |         |
    v         v
  Exists   Not Exists
    |         |
    |         v
    |    Create Seller
    |    (no user link!)
    |         |
    +----+----+
         |
         v
    Create/Update Vehicle
```

**Issues Identified:**

1. **Seller Creation Without User Link** - In [api.py:76-86](auto_app/views/api.py#L76-L86):
   ```python
   seller = Seller.objects.create(
       name=data['name'],
       phone_number=data['phone'],
       email=data['email'],
       # ... fields
       # NOTE: 'user' field is NOT set!
   )
   ```
   The `user` field is never set, breaking the User-Seller relationship.

2. **Duplicate Seller Risk** - Sellers are matched by email OR phone, which could match wrong sellers.

3. **zip_code Field Doesn't Exist** - Line 84 references `zip_code` but the Seller model has no such field.

---

## 3. Subscription Flow Analysis

### 3.1 Subscription Checkout

**Current Implementation:** [billing/views.py:17-59](billing/views.py#L17-L59)

```
User Clicks Subscribe
         |
         v
    Create Subscription
    (status='pending_payment')
         |
         v
    Initialize Paynow Payment
         |
         v
    Redirect to Paynow
         |
         v
    User Pays on Paynow
         |
         v
    Paynow Redirects to successful_payment
         |
         v
    Return "Ok" (?!)
```

### 3.2 CRITICAL BUG: Payment Verification Missing

**Location:** [billing/views.py:85-86](billing/views.py#L85-L86)

```python
def successful_payment(request):
    return HttpResponse("Ok")  # DOES NOTHING!
```

**Impact:**
- Subscriptions are created with status `pending_payment`
- Payment happens on Paynow
- User is redirected back
- **NOTHING HAPPENS** - subscription remains pending forever
- User never gets access to CMS
- Money is taken but service not provided

### 3.3 Missing: Subscription Activation

The system is missing:

1. **Payment Verification Callback** - Paynow sends POST data to `result_url` with payment status, but this is ignored.

2. **Poll URL Usage** - Each subscription stores `payment_url` (poll URL) but it's never used to verify payment.

3. **Activation Logic** - No code to:
   - Set `status = 'active'`
   - Set `activated = today`
   - Link user to seller if not exists
   - Set `is_cms_user = True` on Account
   - Assign appropriate Role

### 3.4 Missing: Subscription Monitoring

**Required but not implemented:**

1. **Daily Subscription Check** - No scheduled task to:
   - Calculate `activation_date + plan.duration`
   - Compare with today
   - Mark expired subscriptions
   - Revoke CMS access

2. **Expiry Reminders** - No email notifications for:
   - 7 days before expiry
   - 3 days before expiry
   - 1 day before expiry
   - Expired notification

3. **Access Revocation** - When subscription expires:
   - `is_cms_user` should be set to False
   - User should lose CMS access
   - Listings could be unpublished (optional)

---

## 4. Additional Bugs Discovered

### 4.1 CRITICAL: Wrong Functions

**Location:** [api.py:166-174](auto_app/views/api.py#L166-L174)

```python
def reset_password(request):
    # BUG: This sets password on a Vehicle, not a User!
    vehicle = Vehicle.objects.get(pk=data['id'])
    vehicle.password = data['password']  # Vehicle has no password field!
    vehicle.save()
```

**Location:** [api.py:156-163](auto_app/views/api.py#L156-L163)

```python
def delete_account(request):
    # BUG: This deletes a Vehicle, not an account!
    vehicle = Vehicle.objects.get(pk=data['id'])
    vehicle.delete()
```

### 4.2 Undefined Variable

**Location:** [api.py:99](auto_app/views/api.py#L99)

```python
submitted_existing_photos = set([i['id'] for i in images if i.get('id')])
# BUG: 'images' is not defined in this scope!
```

### 4.3 SavedSearch Limitation

**Location:** [models.py:430-432](auto_app/models.py#L430-L432)

```python
class SavedSearch(BaseModel):
    user = models.OneToOneField("auth.User", on_delete=models.CASCADE)
    filters = models.TextField()
```

Using `OneToOneField` means each user can only have ONE SavedSearch record. The workaround is storing a JSON array, but this is awkward and limits query capabilities.

### 4.4 PaynowSettings Crash Risk

**Location:** [billing/views.py:31](billing/views.py#L31)

```python
settings = PaynowSettings.objects.first()
print(settings.paynow_id)  # CRASHES if no settings exist!
```

No null check - will crash if PaynowSettings hasn't been configured.

### 4.5 Subscription Status Mismatch

**Location:** [billing/models.py:28-32](billing/models.py#L28-L32)

```python
status = models.CharField(max_length=255, blank=True, choices=[
    ('active', 'Active'),
    ('expired', 'Expired'),
    ('pending_payment', 'Pending Payment')
], default='inactive')  # 'inactive' is not in choices!
```

Default value `'inactive'` is not in the valid choices list.

---

## 5. Permissions System Analysis

### 5.1 Current Implementation

The permission system is well-designed with:
- Role-based access control (RBAC)
- Per-model granular permissions (read, write, delete)
- Owner-based filtering for certain models

### 5.2 Gap: No Subscription Check

CMS access is controlled by:
- `is_cms_user` flag on Account
- Role assignment with permissions

**Missing:** No verification that the user has an active subscription. A user with `is_cms_user=True` but an expired subscription can still access the CMS.

---

## 6. Frontend Issues

### 6.1 Active Subscription Display

**Location:** [account.jsx:306-309](frontend/vite/autohaus/src/components/account.jsx#L306-L309)

```jsx
{activeSubscription && (<>
    <h5>Active Subscription</h5>
    // No content rendered!
</>)}
```

The active subscription section has no content - just a heading.

### 6.2 Missing Active Subscription Fetch

`activeSubscription` state is initialized but never populated - `getActiveSubscription()` is not called.

### 6.3 sell.jsx Subscription Check

**Location:** [sell.jsx:346-350](frontend/vite/autohaus/src/pages/sell.jsx#L346-L350)

```jsx
{context.user && !context?.user?.subscription && <div>
    <h5>Upgrade To Pro!</h5>
    // ... upgrade prompt
</div>}
```

But `context.user.subscription` is never populated in the user data.

---

## 7. Missing Components Summary

| Component | Priority | Description |
|-----------|----------|-------------|
| Payment Webhook Handler | CRITICAL | Verify payments and activate subscriptions |
| Subscription Activation | CRITICAL | Link user to seller, set CMS access |
| Daily Subscription Check | HIGH | Management command to check expiry |
| Expiry Email Reminders | HIGH | Notify users before subscription expires |
| Seller Creation on Signup | MEDIUM | Create Seller profile on registration |
| Password Reset | MEDIUM | Actual password reset functionality |
| Account Deletion | MEDIUM | Proper account deletion with cleanup |
| Subscription Status in JWT | LOW | Include subscription info in tokens |

---

## 8. Recommendations

### 8.1 Immediate Fixes (Critical)

1. **Fix Payment Verification:**
   ```python
   def successful_payment(request):
       poll_url = request.GET.get('pollurl')
       if poll_url:
           paynow = get_paynow_instance()
           status = paynow.check_transaction_status(poll_url)
           if status.paid:
               activate_subscription(poll_url)
       return redirect('/account/subscriptions/')
   ```

2. **Create Paynow Webhook Handler:**
   ```python
   @csrf_exempt
   def paynow_webhook(request):
       status = request.POST.get('status')
       poll_url = request.POST.get('pollurl')
       if status == 'Paid':
           activate_subscription(poll_url)
       return HttpResponse('OK')
   ```

3. **Implement activate_subscription():**
   ```python
   def activate_subscription(poll_url):
       sub = Subscription.objects.get(payment_url=poll_url)
       sub.status = 'active'
       sub.activated = date.today()
       sub.save()

       # Create seller if not exists
       if not hasattr(sub.user, 'seller'):
           Seller.objects.create(
               user=sub.user,
               name=sub.user.get_full_name(),
               email=sub.user.email,
               # ... other fields
           )

       # Enable CMS access
       account = sub.user.account
       account.is_cms_user = True
       account.role = Role.objects.get(role_name='Seller')
       account.save()
   ```

### 8.2 Management Command for Daily Check

Create `billing/management/commands/check_subscriptions.py`:

```python
from django.core.management.base import BaseCommand
from billing.models import Subscription
from datetime import date, timedelta

class Command(BaseCommand):
    help = 'Check subscription expiry and send reminders'

    def handle(self, *args, **options):
        today = date.today()

        # Mark expired subscriptions
        active_subs = Subscription.objects.filter(status='active')
        for sub in active_subs:
            expiry = sub.activated + timedelta(days=sub.plan.duration)
            days_left = (expiry - today).days

            if days_left <= 0:
                self.expire_subscription(sub)
            elif days_left in [7, 3, 1]:
                self.send_reminder(sub, days_left)

    def expire_subscription(self, sub):
        sub.status = 'expired'
        sub.save()
        sub.user.account.is_cms_user = False
        sub.user.account.save()
        # Send expiry email

    def send_reminder(self, sub, days):
        # Send reminder email
        pass
```

Schedule with cron: `0 6 * * * python manage.py check_subscriptions`

### 8.3 Fix User-Seller Flow

Modify signup to optionally create a Seller:

```python
# In SignUpView.post()
seller = Seller.objects.create(
    user=user,
    name=f"{first_name} {last_name}",
    email=email,
    phone_number=phone,
    address='',
    country='ZW',
)
```

### 8.4 Fix Broken Functions

```python
def reset_password(request):
    user = request.user
    new_password = request.data.get('new_password')
    user.set_password(new_password)
    user.save()
    return JsonResponse({"status": "success"})

def delete_account(request):
    user = request.user
    user.is_active = False  # Soft delete
    user.save()
    return JsonResponse({"status": "success"})
```

---

## 9. Data Flow Diagram (Proposed)

```
                    +------------------+
                    |    User Signup   |
                    +--------+---------+
                             |
                    +--------v---------+
                    |  Create User     |
                    |  Create Account  |
                    |  Create Seller   |
                    +--------+---------+
                             |
              +--------------+--------------+
              |                             |
     +--------v---------+         +---------v--------+
     |  Browse/Save     |         |   Subscribe      |
     |  Listings        |         |   (Paynow)       |
     +------------------+         +---------+--------+
                                           |
                                  +--------v---------+
                                  | Payment Verified |
                                  +--------+---------+
                                           |
                                  +--------v---------+
                                  | Activate Sub     |
                                  | Set is_cms_user  |
                                  | Assign Role      |
                                  +--------+---------+
                                           |
                                  +--------v---------+
                                  |  CMS Access      |
                                  |  Post Listings   |
                                  +------------------+
                                           |
                          +----------------+----------------+
                          |                                 |
                 +--------v---------+              +--------v--------+
                 | Daily Check      |              | Sub Expires     |
                 | Send Reminders   |              | Revoke Access   |
                 +------------------+              +-----------------+
```

---

## 10. Testing Checklist

Before deployment, verify:

- [ ] User can sign up and gets User + Account + Seller created
- [ ] User can save listings without subscription
- [ ] User can subscribe and payment reaches Paynow
- [ ] After payment, subscription becomes active
- [ ] After activation, user has CMS access
- [ ] User can create vehicle listings
- [ ] Subscription expiry revokes CMS access
- [ ] Email reminders sent at 7, 3, 1 days before expiry
- [ ] Expired subscription users cannot access CMS

---

## 11. Questions for Analyst

1. **Seller Profile Creation:** Should the Seller be created during signup, or only when the user actually wants to sell? Creating during signup adds friction but simplifies the flow.

2. **Subscription Requirement:** Should users be required to have an active subscription to post listings? Currently anyone can post.

3. **CMS Access Levels:** Should there be different subscription tiers with different CMS capabilities?

4. **Listing Visibility:** When a subscription expires, should existing listings be hidden or remain visible?

5. **Grace Period:** Should there be a grace period after subscription expiry before access is revoked?

---

## 12. Conclusion

The CMS system has a solid foundation with good permission management, but the subscription payment flow is completely broken. The payment is initiated but never verified, leaving users in perpetual "pending" status. Additionally, several critical functions (password reset, account deletion) are non-functional.

**Immediate priority:** Fix the payment verification and subscription activation flow before any further development.

---

## 13. Implementation Summary (COMPLETED)

Following the analysis and discussions with the analyst, the following changes were implemented:

### 13.1 Architecture Changes

**Account Model Merged into Seller**
- The `Account` model has been deprecated
- `is_cms_user` and `role` fields moved to `Seller` model
- Seller is now the single source of truth for user-CMS relationship
- Account model kept temporarily for migration purposes only

**New User Flow**
- Regular signups disabled - users must subscribe to create accounts
- Sellers only created after successful subscription payment
- User + Seller created atomically during subscription activation

### 13.2 Files Modified

| File | Changes |
|------|---------|
| [models.py](auto_app/models.py) | Added `is_cms_user`, `role`, `has_active_subscription()`, `get_active_subscription()` to Seller. Deprecated Account. |
| [auth_views.py](auto_app/views/auth_views.py) | Changed from Account to Seller. SignUp now returns 403 directing to subscription. |
| [permissions.py](auto_app/utils/permissions.py) | Changed Account references to Seller. Added `ActiveSubscriptionRequired` permission class. |
| [billing/models.py](billing/models.py) | Added `PendingRegistration` model. Added `expires_at` field to Subscription. Fixed status choices. Added helper methods. |
| [billing/views.py](billing/views.py) | Complete rewrite with payment verification, webhook handler, activation logic. |
| [billing/urls.py](billing/urls.py) | Added new endpoints for registration, webhook, payment status. |
| [api.py](auto_app/views/api.py) | Fixed all broken functions. Added subscription check for vehicle creation. |
| [cms_api.py](auto_app/views/cms_api.py) | Changed Account to Seller in permissions view. |
| [serializers.py](billing/serializers.py) | Added `days_remaining` and `is_expired` computed fields. |
| [Home.jsx](frontend/vite/autohaus/src/cms/pages/Home.jsx) | Removed Account from CMS menu. |

### 13.3 New Files Created

| File | Purpose |
|------|---------|
| [check_subscriptions.py](billing/management/commands/check_subscriptions.py) | Daily cron job to check subscription expiry and send email reminders |
| [billing/management/__init__.py](billing/management/__init__.py) | Package init |
| [billing/management/commands/__init__.py](billing/management/commands/__init__.py) | Package init |

### 13.4 New Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/billing/paynow-webhook/` | POST | Paynow payment callback |
| `/billing/payment-success/` | GET | Success redirect handler |
| `/billing/check-payment-status/` | GET | Poll payment status |

### 13.5 New User Flow

```
New User                                      Existing User (Renewal)
    |                                               |
    v                                               v
Register + Select Plan                         Login + Select Plan
    |                                               |
    v                                               v
Create PendingRegistration                     Create Subscription
    |                                          (pending_payment)
    v                                               |
Pay via Paynow  <----------------------------------|
    |
    v
Paynow Webhook / Success Redirect
    |
    v
Verify Payment (poll_url)
    |
    v
+---+-------------------+
|   Payment Confirmed   |
+---+-------------------+
    |
    +---> Create User
    |     Create Seller (is_cms_user=True, role=Seller)
    |     Create/Activate Subscription
    |     Return JWT tokens
    |
    v
CMS Access Granted
```

### 13.6 Daily Subscription Check (Cron Job)

Schedule with: `0 6 * * * python manage.py check_subscriptions`

Features:
- Marks expired subscriptions as `expired`
- Revokes `is_cms_user` flag on expired subscriptions
- Sends email reminders at 7, 3, and 1 days before expiry
- Sends expiry notification when subscription expires
- Supports `--dry-run` and `--verbose` flags

### 13.7 Remaining Tasks

1. **Run Migrations:**
   ```bash
   python manage.py makemigrations auto_app billing
   python manage.py migrate
   ```

2. **Create Seller Role Fixture:**
   - Add a "Seller" role to the database with appropriate permissions

3. **Configure Email Settings:**
   - Set up Django email backend for reminder notifications

4. **Update PaynowSettings:**
   - Set `result_url` to webhook endpoint

5. **Frontend Updates:**
   - Update subscription checkout page to use new registration flow
   - Add payment status polling on success page

---

## 14. Testing Checklist (Updated)

- [ ] Run migrations successfully
- [ ] Create Seller role with Vehicle CRUD permissions
- [ ] New user can register via subscription page
- [ ] Payment redirects to Paynow correctly
- [ ] Webhook receives and processes payment notification
- [ ] User + Seller created after successful payment
- [ ] User can login with returned JWT tokens
- [ ] User can access CMS after payment
- [ ] User can create vehicle listings
- [ ] Existing user can renew subscription
- [ ] Daily check command marks expired subscriptions
- [ ] Email reminders sent at correct intervals
- [ ] Expired users lose CMS access but listings remain visible

---

*Report generated by Senior Engineer analysis on 2025-11-30*
*Implementation completed on 2025-11-30*
