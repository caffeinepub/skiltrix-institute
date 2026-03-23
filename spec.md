# SKILTRIX Institute

## Current State
Full-stack educational institute management platform with:
- Public website: Hero, About, Courses (with sample course fallback), Testimonials (hardcoded), CTA, Contact
- Admin panel: Application management, course CRUD, analytics, sub-admin management, ID card issuance
- Student dashboard: Application status, payment, certificate, ID card
- Backend: Applications, courses, ID cards, analytics, Stripe, sub-admins
- Some mobile responsiveness but not fully optimized
- Hero uses a generated background image with dark overlay
- Testimonials are hardcoded static data

## Requested Changes (Diff)

### Add
- Reviews system (backend): Review type with id, name, email, course, feedback, rating, createdAt fields
- submitReview() - one review per email (enforced by backend)
- getReviews() - public query
- updateReview() - admin only (frontend gate)
- deleteReview() - admin only
- addReview() - admin can add review directly
- ReviewPopup component: Appears after successful application form submission, asks user to leave a review
- Reviews tab in admin panel: View, edit, delete, add reviews
- Admin can edit/delete/add reviews from admin panel Reviews tab

### Modify
- CoursesSection: Remove SAMPLE_COURSES fallback — show only backend courses (empty state if none)
- TestimonialsSection: Load reviews from backend in real-time instead of hardcoded data; auto-refresh after new submission
- HeroSection: Add more premium, visually rich background (regenerate hero image)
- All components: Improve mobile responsiveness (responsive typography, stacked layouts, touch-friendly buttons, proper padding on small screens)
- App.tsx: Pass review popup trigger after application submission

### Remove
- SAMPLE_COURSES array from CoursesSection
- Hardcoded testimonials array from TestimonialsSection

## Implementation Plan
1. Add Review type and CRUD functions to Motoko backend
2. Generate new premium hero background image
3. Update frontend:
   a. CoursesSection: remove sample courses
   b. TestimonialsSection: fetch from backend, real-time updates
   c. Add ReviewPopup component
   d. Add useQueries hooks for reviews
   e. Wire ReviewPopup into App.tsx after application submission
   f. Add Reviews tab in AdminPanel
   g. Mobile-friendly improvements across Navbar, HeroSection, AboutSection, CoursesSection, TestimonialsSection, Footer, ApplyModal
