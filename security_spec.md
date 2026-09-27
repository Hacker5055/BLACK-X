# Security Specification & Audit Plan

## Data Invariants
1. Employee records can only be created, modified, or deleted by authenticated HR admins or managers.
2. Attendance entries must belong to an existing employee and record valid dates and hours.
3. Leave requests require start and end dates with positive day counts, and transitions to 'approved'/'rejected' must only be performed by managers.
4. Payroll records are read-only once marked 'paid', preventing retroactive pay tampering.
5. All IDs must adhere to safe regex `^[a-zA-Z0-9_-]+$` with length <= 128 to block ID poisoning.
6. Timestamp fields and strings must adhere to maximum length constraints to prevent resource exhaustion and denial of wallet attacks.

## The "Dirty Dozen" Threat Payloads
1. **Unauthenticated Read**: Attempting to read employees collection without being signed in.
2. **Ghost Fields Injection**: Injecting unexpected internal fields like `__adminOverride: true` or `isAdmin: true` during employee profile creation.
3. **ID Poisoning Attack**: Submitting an oversized 2KB malicious string as `employeeId` containing script tags or traversal characters.
4. **Forged Author/UID**: Setting `createdBy` to another user's UID rather than `request.auth.uid`.
5. **Overlong Payload Flooding**: Sending a 500KB text payload into the `notes` or `reason` field to inflate Firestore write/storage quotas.
6. **Self-Approval Exploit**: An employee attempting to directly update their own leave request status from 'pending' to 'approved'.
7. **Tampering with Terminal State**: Attempting to edit salary numbers on a payroll document whose status is already 'paid'.
8. **Negative Compensation Injection**: Submitting a negative `basicSalary` or unbounded deduction to manipulate accounting balances.
9. **Blanket Collection Scraping**: Querying collection without authenticated session or without constrained parameters.
10. **Privilege Escalation via Profile Update**: Attempting to update `role` in users or employees collection without managerial role.
11. **Spoofed Audit Log Entry**: Manually modifying or deleting past immutable audit trail records.
12. **Unverified Email Access**: Attempting administrative mutations with an unverified email token.
