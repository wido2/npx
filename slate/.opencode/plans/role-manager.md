# Role Manager Implementation Plan

## Overview
Add Role Manager tab to the User Management page with CRUD operations for roles using a Sheet component.

## Files to modify

### 1. `lib/user-admin-api.ts` — Add 3 API functions

```typescript
export async function createRole(name: string): Promise<RoleInfo>
// POST {API_BASE}/roles  body: { name }

export async function updateRole(roleId: number, name: string): Promise<RoleInfo>
// PUT {API_BASE}/roles/{roleId}  body: { name }

export async function deleteRole(roleId: number): Promise<void>
// DELETE {API_BASE}/roles/{roleId}
```

### 2. `components/role-manager-sheet.tsx` — New file

Pattern: same as `AddVendorSheet` (`Sheet` on side="right", `sm:max-w-md`)

**Props:**
```typescript
interface RoleManagerSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
  editItem?: RoleInfo | null
}
```

**Behavior:**
- Opens → fetches `fetchPermissions()` for grouped permission list
- Create mode (no `editItem`): empty name, no permissions selected
- Edit mode (has `editItem`): pre-fills name + checked permissions
- Save (create): `createRole(name)` → `syncRolePermissions(newRole.id, permissions)`
- Save (edit): `updateRole(roleId, name)` → `syncRolePermissions(roleId, permissions)`
- Render: `SheetHeader` with title, `FieldGroup` with name `Input`, grouped permission toggle buttons, `SheetFooter` with Cancel/Save

### 3. `app/settings/users/page.tsx` — Add tabs + Role Manager

**New imports:**
- `Tabs, TabsContent, TabsList, TabsTrigger` from `@/components/ui/tabs`
- `RoleManagerSheet` from `@/components/role-manager-sheet`
- `createRole, updateRole, deleteRole` from `@/lib/user-admin-api`
- `PlusIcon` from `lucide-react`

**New state:**
- `roles: RoleInfo[]`
- `rolesLoading: boolean`
- `roleSheetOpen: boolean`
- `editingRole: RoleInfo | null`

**Structure:**
```
Tabs defaultValue="users"
  TabsList
    TabsTrigger value="users">Users</TabsTrigger>
    TabsTrigger value="roles">Role Manager</TabsTrigger>
  </TabsList>

  TabsContent value="users"
    (existing user table + dialogs — unchanged)
  </TabsContent>

  TabsContent value="roles"
    Header: title + "Create Role" button
    Grid of role cards:
      Each card: role name, permission count badge, Edit button, Delete button
    Delete confirmation AlertDialog
    RoleManagerSheet (create/edit)
  </TabsContent>
</Tabs>
```

## UI Details

### Role Manager Tab
- Header row: "Role Manager" title + "Create Role" button (`PlusIcon`)
- Cards grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`
- Each card: `Card` with `CardHeader` (role name), `CardContent` (permission count badge), actions (Edit + Delete buttons)

### RoleManagerSheet
- `SheetContent side="right" className="sm:max-w-md"`
- `SheetHeader` with `SheetTitle`: "Create Role" or "Edit Role"
- Form fields:
  - `FieldLabel` "Role Name" + `Input` (controlled, `name` state)
  - `Separator` with "Permissions" label
  - Permission groups rendered as toggle buttons (same UI as `UserRoleEditor`)
- Footer: Cancel (`variant="outline"`) + Save buttons

## Data Flow
```
UsersPage mount → fetchRoles() → roles state
Create/Edit role → RoleManagerSheet opens
  → fetches permissions, populates form
  → on save: createRole/updateRole + syncRolePermissions
  → onSuccess callback → fetchRoles() → UI updates
Delete role → confirm dialog → deleteRole(id) → fetchRoles()
```
