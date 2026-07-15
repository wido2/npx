# RBAC Implementation Plan

## Architecture: Full RBAC with spatie/laravel-permission

### 1. Backend

#### 1.1 Install
```
composer require spatie/laravel-permission
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
php artisan migrate
```

#### 1.2 Roles & Permissions Seeder

**Roles:**
| Role | Description |
|---|---|
| `super_admin` | Full access, including user management |
| `manager` | Full operational access, can manage user permissions (except super_admin) |
| `user` | Limited to own PO + basic operations |

**Permissions:**
| Group | Permissions |
|---|---|
| PO | `po.create`, `po.view_own`, `po.view_all`, `po.edit`, `po.delete`, `po.submit`, `po.approve`, `po.receive`, `po.cancel` |
| Master Data | `master.vendor.*`, `master.barang.*`, `master.client.*`, `master.project.*`, `master.unit.*`, `master.kategori.*` |
| Settings | `settings.view`, `settings.update` |
| Users | `users.view`, `users.manage` |
| Reports | `reports.view` |

#### 1.3 Endpoints
| Method | URL | Auth | Description |
|---|---|---|---|
| `POST` | `/api/register` | admin | Register new user |
| `GET` | `/api/users` | manage | List all users with roles |
| `PUT` | `/api/users/{id}` | manage | Update user |
| `DELETE` | `/api/users/{id}` | manage | Delete user |
| `GET` | `/api/users/{id}/roles` | manage | Get user roles |
| `PUT` | `/api/users/{id}/roles` | manage | Assign roles to user |
| `GET` | `/api/users/{id}/permissions` | manage | Get user permissions |
| `PUT` | `/api/users/{id}/permissions` | manage | Assign direct permissions |
| `GET` | `/api/roles` | manage | List all roles with permissions |
| `POST` | `/api/roles` | manage | Create role |
| `PUT` | `/api/roles/{id}` | manage | Update role |
| `DELETE` | `/api/roles/{id}` | manage | Delete role |
| `GET` | `/api/roles/{id}/permissions` | manage | Get role permissions |
| `PUT` | `/api/roles/{id}/permissions` | manage | Assign permissions to role |
| `GET` | `/api/permissions` | manage | List all permissions (grouped) |

#### 1.4 PO Visibility
In `PurchaseOrderController@index`:
```php
if (!$user->can('po.view_all')) {
    $query->where('dibuat_oleh', $user->id);
}
```

#### 1.5 Gate Registration
Register Gates in `AppServiceProvider` to check permission on PO actions (submit, approve, receive, cancel, edit, delete).

#### 1.6 Auth
Add register endpoint so manager can create users directly.

### 2. Frontend

#### 2.1 Auth Context
- After login, fetch `user.roles` and `user.permissions` from backend
- Store in React Context + localStorage
- Update `User` interface: add `roles`, `permissions`, `role` (primary role)

#### 2.2 User Management Page
- New route: `/settings/users`
- Table of users with role badges
- Inline assign roles & permissions
- Create new user form

#### 2.3 Conditional Rendering
- `can(permission)` utility function
- PO action buttons: check permission before showing
- Sidebar menu items: filter by permission
- PO list: show "own" or "all" based on `po.view_all`

#### 2.4 PO Filter
- API already filters by `dibuat_oleh` on backend
- Frontend: no additional changes needed (API handles it)
- But show a toggle/indicator if viewing own vs all POs
