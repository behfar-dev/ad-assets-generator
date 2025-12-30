

# Ad Assets Generator - SAAS Platform v1.0 Roadmap

## Project Vision
Transform the ad assets generator into a full-featured SAAS platform with brutalist design, user management, and a credit-based system.

---

## Phase 1: Foundation & Setup

### 1.1 Project Architecture
- [x] Set up database schema (Prisma + PostgreSQL)
  - Users table (id, email, name, passwordHash, createdAt, updatedAt)
  - Credits table (id, userId, balance, createdAt, updatedAt)
  - CreditTransactions table (id, userId, amount, type, description, timestamp)
  - Projects table (id, userId, name, description, createdAt, updatedAt)
  - Assets table (id, projectId, userId, type, aspectRatio, url, prompt, createdAt)
  - Sessions table (for NextAuth)
- [x] Install and configure Prisma ORM
- [ ] Set up PostgreSQL database (local + production)
- [ ] Create database migration scripts
- [x] Set up environment variables structure (.env.example)

### 1.2 Authentication System
- [x] Install NextAuth.js
- [x] Configure email/password authentication
- [x] Add Google OAuth provider
- [x] Create signup page with email verification
- [x] Create login page
- [x] Create password reset flow
- [x] Add protected route middleware
- [x] Create user profile page
- [x] Add session management

---

## Phase 2: Brutalist Design System

### 2.1 Design Tokens & Foundation
- [x] Define brutalist color palette
  - Primary: Stark blacks, whites, and one accent color
  - High contrast ratios
  - Raw, unpolished aesthetic
- [x] Typography system
  - Bold, heavy sans-serif fonts (IBM Plex Mono, Space Grotesk)
  - Large, aggressive headings
  - Tight line-heights
  - Monospace for technical elements
- [x] Create design tokens file (colors, spacing, typography)
- [x] Update Tailwind config with brutalist theme
- [x] Design component primitives (borders, shadows, shapes)

### 2.2 Core UI Components (Brutalist Style)
- [x] Button variants (primary, secondary, danger, ghost)
  - Heavy borders (3-4px)
  - Sharp corners or extreme rounded
  - Bold hover states
- [x] Input fields with chunky borders
- [x] Card components with stark borders and shadows
- [x] Navigation components (aggressive, geometric)
- [x] Modal/Dialog components
- [x] Toast notifications (stark, bold)
- [x] Loading states (geometric spinners, bold progress bars)
- [ ] Badge components (sharp, high-contrast)
- [ ] Table components (grid-heavy, stark lines)

### 2.3 Layout Redesign
- [x] Create brutalist header/navigation
  - Bold logo treatment
  - Geometric menu items
  - High-contrast state indicators
- [x] Design dashboard layout
  - Grid-based structure
  - Asymmetric sections
  - Bold typography hierarchy
- [ ] Create sidebar navigation (if needed)
- [ ] Design footer with stark aesthetic
- [ ] Mobile responsive layouts (maintain brutalist aesthetic)

---

## Phase 3: Credit System

### 3.1 Credit Architecture
- [x] Define credit pricing model
  - Images: 1-2 credits each
  - Videos: 5-10 credits each
  - Ad copy generation: 0.5 credits
- [x] Create credit packages
  - Starter: 50 credits - $9.99
  - Pro: 200 credits - $29.99
  - Business: 500 credits - $59.99
  - Enterprise: Custom pricing
- [x] Implement credit balance tracking
- [x] Create credit transaction logging
- [ ] Add credit deduction logic to generation functions
- [ ] Implement credit refund logic (for failed generations)

### 3.2 Credit UI Components
- [x] Credit balance display (header/dashboard)
- [x] Credit usage history page
- [ ] Low credit warning notifications
- [x] Credit purchase modal/page
- [x] Credit transaction detail view
- [ ] Credit analytics (usage over time)

### 3.3 Payment Integration
- [ ] Set up Stripe account
- [ ] Install Stripe SDK
- [x] Create Stripe checkout sessions
- [x] Implement payment success/failure webhooks
- [x] Add credit top-up on successful payment
- [x] Create billing history page
- [ ] Add invoice generation
- [ ] Implement subscription tiers (optional for v1)

---

## Phase 4: User Management & Dashboard

### 4.1 User Dashboard
- [x] Create main dashboard page
  - Credit balance widget (large, prominent)
  - Recent projects grid
  - Quick stats (assets generated, credits used)
  - Recent activity feed
- [x] Projects overview section
- [x] Quick action buttons (New Project, Buy Credits)
- [ ] Usage analytics visualization
- [ ] Welcome onboarding for new users

### 4.2 User Profile & Settings
- [x] Profile information page
  - Avatar upload
  - Name, email editing
  - Bio/company info
- [x] Account settings
  - Password change
  - Email preferences (UI ready)
  - Notification settings (UI ready)
- [ ] API key management (store user's fal.ai key securely)
- [x] Account deletion flow
- [ ] Export user data (GDPR compliance)

### 4.3 Admin Panel (Basic)
- [ ] Admin authentication/authorization
- [ ] User management dashboard
  - View all users
  - Search/filter users
  - Grant/revoke credits
  - Ban/suspend users
- [ ] System analytics
  - Total users, active users
  - Credit usage statistics
  - Revenue tracking
- [ ] Manual credit adjustments

---

## Phase 5: Enhanced Asset Generation Features

### 5.1 Project Organization
- [x] Create project creation flow
- [x] Project detail page
  - Project name and description
  - Asset grid view
  - Project settings
- [ ] Move assets into projects (update data model)
- [x] Project deletion with asset cleanup
- [ ] Project duplication feature
- [ ] Project sharing (view-only links)

### 5.2 Asset Management Improvements
- [ ] Enhanced asset grid with filtering
  - Filter by type (image/video)
  - Filter by aspect ratio
  - Sort by date, type
- [ ] Asset detail modal
  - Large preview
  - Download options
  - Regenerate variant
  - Delete asset
  - View generation prompt
- [ ] Bulk operations
  - Select multiple assets
  - Bulk download (ZIP)
  - Bulk delete
  - Move to project
- [ ] Asset tagging system
- [ ] Favorite/star assets

### 5.3 Generation UI Improvements
- [ ] Redesigned upload interface (brutalist drag-n-drop)
- [ ] Better progress indicators with step-by-step feedback
- [ ] Queue management (show pending generations)
- [ ] Generation presets/templates
- [ ] Save custom generation settings
- [ ] Batch generation queue (generate multiple at once)

---

## Phase 6: Core Feature Enhancements

### 6.1 Generation Improvements
- [ ] Add generation history tracking (prompts, settings)
- [ ] Implement retry logic for failed generations
- [ ] Add generation queue system (background jobs)
- [ ] Credit check before generation starts
- [ ] Better error handling and user feedback
- [ ] Generation templates (save frequently used settings)
- [ ] A/B testing (generate multiple variants)

### 6.2 Export & Download Features
- [ ] Individual asset download
- [ ] Bulk ZIP download
- [ ] Export with metadata (JSON)
- [ ] Direct social media sharing (optional)
- [ ] Cloud storage integration (Google Drive, Dropbox - optional)
- [ ] Download history tracking

### 6.3 Collaboration Features (Optional for v1)
- [ ] Team workspaces
- [ ] Invite team members
- [ ] Role-based permissions (owner, editor, viewer)
- [ ] Shared credit pools
- [ ] Team activity feed

---

## Phase 7: API & Backend

### 7.1 API Routes
- [x] `/api/auth/*` - NextAuth routes
- [x] `/api/user/profile` - GET/PATCH user profile
- [x] `/api/credits` - GET credit balance
- [x] `/api/credits/purchase` - POST create checkout session
- [x] `/api/credits/history` - GET transaction history
- [x] `/api/projects` - CRUD operations
- [x] `/api/projects/[id]` - GET/PATCH/DELETE project
- [ ] `/api/assets` - GET user assets
- [ ] `/api/assets/[id]` - GET/DELETE specific asset
- [ ] `/api/generate/image` - POST image generation
- [ ] `/api/generate/video` - POST video generation
- [ ] `/api/generate/copy` - POST ad copy generation
- [x] `/api/webhooks/stripe` - POST Stripe webhooks

### 7.2 Backend Services
- [ ] Asset storage service (S3/Cloudflare R2)
- [ ] Background job queue (Bull/BullMQ)
- [ ] Email service (SendGrid/Resend)
- [ ] Logging service (Winston/Pino)
- [ ] Error tracking (Sentry)
- [ ] Analytics (PostHog/Plausible)

### 7.3 Security & Performance
- [ ] Rate limiting (per user, per IP)
- [ ] Input validation (Zod schemas)
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF protection
- [ ] Secure API key storage (encrypted)
- [ ] Image/video CDN setup
- [ ] Database query optimization
- [ ] Caching strategy (Redis - optional)

---

## Phase 8: Polish & Launch Prep

### 8.1 UI/UX Polish
- [ ] Review all pages for brutalist consistency
- [ ] Responsive design testing (mobile, tablet, desktop)
- [ ] Animation and micro-interactions
- [ ] Empty states design
- [ ] Error states design
- [ ] Loading states optimization
- [ ] Accessibility audit (WCAG AA)
- [ ] Browser compatibility testing

### 8.2 Content & Marketing Pages
- [ ] Landing page (brutalist hero, features, pricing)
- [ ] Pricing page (credit packages, comparison table)
- [ ] About page
- [ ] FAQ page
- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] Contact page
- [ ] Blog setup (optional)

### 8.3 Onboarding & Documentation
- [ ] First-time user onboarding flow
- [ ] Interactive product tour
- [ ] Help documentation/knowledge base
- [ ] Video tutorials
- [ ] Tooltips and contextual help
- [ ] Sample projects/templates

### 8.4 Testing & QA
- [ ] Unit tests for critical functions
- [ ] Integration tests for API routes
- [ ] E2E tests for main user flows
- [ ] Payment flow testing (test mode)
- [ ] Load testing
- [ ] Security audit
- [ ] Bug fixing sprint

### 8.5 Deployment & DevOps
- [ ] Set up production environment (Vercel/Railway/AWS)
- [ ] Configure production database
- [ ] Set up production Stripe account
- [ ] Configure environment variables
- [ ] Set up CI/CD pipeline
- [ ] Domain setup and SSL
- [ ] Database backup strategy
- [ ] Monitoring and alerting setup
- [ ] CDN configuration for assets

---

## Phase 9: Post-Launch

### 9.1 Monitoring & Analytics
- [ ] User analytics tracking
- [ ] Conversion funnel tracking
- [ ] Error monitoring
- [ ] Performance monitoring
- [ ] User feedback collection

### 9.2 Iteration & Growth
- [ ] User feedback analysis
- [ ] Feature prioritization based on usage
- [ ] A/B testing for conversion optimization
- [ ] Marketing campaign setup
- [ ] Customer support system

---

## Technical Stack Summary

### Frontend
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS (brutalist theme)
- Radix UI (restyled for brutalism)
- Framer Motion (animations)
- Zustand/Jotai (state management - optional)

### Backend
- Next.js API Routes
- Prisma ORM
- PostgreSQL
- NextAuth.js
- Stripe API
- fal.ai SDK
- Bull Queue (background jobs)

### Infrastructure
- Vercel (hosting)
- PostgreSQL (Supabase/Neon/Railway)
- S3/Cloudflare R2 (asset storage)
- Redis (caching - optional)
- SendGrid/Resend (emails)
- Sentry (error tracking)

---

## Success Metrics for v1.0

- [ ] User registration flow works smoothly
- [ ] Credit purchase and deduction works correctly
- [ ] Asset generation maintains current quality
- [ ] 95%+ uptime
- [ ] Page load times < 3s
- [ ] Mobile responsive on all major devices
- [ ] Payment success rate > 95%
- [ ] Brutalist design system fully implemented

---

## Timeline Estimate (Single Developer)

- **Phase 1**: 1 week
- **Phase 2**: 2 weeks
- **Phase 3**: 1.5 weeks
- **Phase 4**: 2 weeks
- **Phase 5**: 1.5 weeks
- **Phase 6**: 1 week
- **Phase 7**: 2 weeks
- **Phase 8**: 2 weeks
- **Phase 9**: Ongoing

**Total**: ~13 weeks (3 months) for MVP

---

## Priority for v1.0 MVP

### Must Have (P0)
- Authentication system
- Credit system with payment
- Brutalist design implementation
- Basic dashboard
- Project organization
- Asset generation (existing features)

### Should Have (P1)
- User profile management
- Asset management improvements
- Admin panel basics
- Email notifications

### Nice to Have (P2)
- Advanced analytics
- Collaboration features
- API access
- Advanced export options

---

## Notes

- Start with Phase 1-3 as foundation
- Brutalist design should be bold, unapologetic, and memorable
- Credit pricing should be validated with market research
- Consider free tier (5-10 credits on signup) for user acquisition
- Focus on core user flow: signup → buy credits → generate assets → download
