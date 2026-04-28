# Security Specification - Controle de Acesso PRO

## Data Invariants
1. A **Contractor** must belong to a valid **Event**.
2. A **Staff** member must belong to a valid **Contractor** and **Event**.
3. A **Staff** member's PIN is immutable after registration.
4. A **Device** must have a unique Serial Number.
5. **Commands** can only be created by producers/admins, never by staff or contractors.
6. **AccessLogs** are append-only.

## The Dirty Dozen Payloads (Rejection Tests)
1. **Identity Spoofing**: Attempt to create a Staff member with `tenantId` of another client.
2. **Privilege Escalation**: Attempt to update a Staff member to `privilege=10` (Manager) via registration form.
3. **Ghost Field Injection**: Adding an `isVerified: true` field to a Staff registration.
4. **Orphaned Write**: Creating a Staff member for a non-existent `contractorId`.
5. **ID Poisoning**: Sending a 2KB string as a `deviceId` in a Command creation.
6. **Immutable Violation**: Attempting to change a Staff's `pin` after creation.
7. **Cross-Tenant Access**: Attempting to read `accessLogs` belonging to a different `tenantId`.
8. **PII Leak**: An unauthenticated user attempting to list all `staff` members.
9. **State Shortcutting**: Updating a Staff status directly from `DRAFT` to `ACTIVE` without `PENDING_APPROVAL`.
10. **Command Injection**: Attempting to create a `CONTROL DEVICE` command with `Operation=Reboot` as a Contractor.
11. **Timestamp Spoofing**: Sending a `createdAt` value from 1 year in the past.
12. **Malicious Device Registration**: Registering a device with an existing Serial Number but under a different owner.

## Security Rules Draft (Foundational Helpers)
- `isValidId(id)`: Regex and size check.
- `isAdmin()`: Check if UID exists in an `admins` collection.
- `isOwner(res)`: Check if `res.tenantId == auth.uid` (or similar mapping).
- `isValidStaff(data)`: Schema validation for staff.
