# SKILTRIX Institute

## Current State
The app has a Motoko backend with persistent storage for applications, courses, inquiries, and analytics. The admin panel uses email/password/MPIN credentials for login (frontend-only check via sessionStorage). However, all backend admin functions use `requireAdmin(caller)` which checks Internet Identity principal -- the anonymous caller from the frontend never passes this check, so `getAllApplications`, `getAnalytics`, and all mutation operations silently fail.

## Requested Changes (Diff)

### Add
- Course management in admin panel: create, update, delete courses with full fields (title, description, duration, fees, category, icon, skills, careerOpportunities)
- Application tracking stage: admin can update per-application stage (Application Received, Documents Under Review, Interview Scheduled, Enrolled, Completed, Rejected)
- Change admin credentials: admin can update email/password/MPIN from within the panel (requires old password + MPIN verification)
- Sub-admin management: admin can create new sub-admins with name/email/password/MPIN; sub-admins can also log in; admin can delete sub-admins
- New backend functions: `updateApplicationStage`, `getApplicationStages`, `createSubAdmin`, `getSubAdmins`, `deleteSubAdmin`, updated `setAdminCredentials`

### Modify
- Remove `requireAdmin(caller)` from ALL backend functions: `getAllApplications`, `getAnalytics`, `approveApplication`, `rejectApplication`, `issueCertificate`, `updatePaymentStatus`, `setStripeConfiguration`, `addCourse`, `updateCourse`, `deleteCourse`, `getAllInquiries`
- `setAdminCredentials` now takes old password + old MPIN for verification instead of requiring Internet Identity admin principal
- `verifyAdminCredentials` also checks sub-admin credentials
- Admin panel gets new sections/tabs: Applications, Courses, Settings

### Remove
- `requireAdmin` checks from all admin-facing backend functions (frontend enforces auth via login gate)

## Implementation Plan
1. Update `main.mo`: remove all `requireAdmin` checks from admin operations; add sub-admin storage and CRUD; add application stage storage and update function; fix `setAdminCredentials` to verify old password/mpin; update `verifyAdminCredentials` to check sub-admins
2. Update `backend.d.ts`: add `SubAdmin`, `SubAdminInfo`, `ApplicationStageInfo` types; add new function signatures
3. Update `useQueries.ts`: add hooks for `updateApplicationStage`, `getApplicationStages`, `createSubAdmin`, `getSubAdmins`, `deleteSubAdmin`, `setAdminCredentials`
4. Rebuild `AdminPanel.tsx` with three tabs: Applications (with stage update), Courses (CRUD), Settings (credentials + sub-admins)
