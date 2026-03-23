# SKILTRIX Institute

## Current State
- Website with hero, about, courses, CTA sections
- Admission form modal (ApplyModal) with name, email, phone, course, address, photo fields
- Backend stores inquiries (name, email, phone, message) via `submitInquiry`
- No admin panel, no application status management

## Requested Changes (Diff)

### Add
- Application status field (pending/approved/rejected) to each submission
- Backend functions: `submitApplication`, `getAllApplications`, `approveApplication`, `rejectApplication`
- Admin panel page accessible at `/admin` route (login-gated via authorization component)
- Applications table in admin showing: Name, Email, Phone, Course, Date, Status
- Approve / Reject action buttons per application row
- Status badges (color-coded)

### Modify
- ApplyModal to call `submitApplication` instead of `submitInquiry`
- Backend to persist full admission data (name, email, phone, course, address, applicationId, date, status)

### Remove
- Nothing removed from public-facing site

## Implementation Plan
1. Update Motoko actor: add `Application` type with status, `submitApplication`, `getAllApplications`, `approveApplication`, `rejectApplication` functions
2. Wire authorization component for admin-only access
3. Create `AdminPanel` page component with applications table, status badges, approve/reject buttons
4. Add `/admin` route to App.tsx
5. Update `ApplyModal` to call `submitApplication`
6. Update query hooks for new backend functions
