# Ralph Wiggum TODO: Ad Assets Generator SaaS

Build a production-ready SaaS application for generating ad assets with credit-based pricing and brutalist design.

## Phase 1: Foundation (Core Infrastructure)
- [ ] Install and configure Prisma ORM with PostgreSQL
- [ ] Create database schema (Users, Credits, CreditTransactions, Projects, Assets, Sessions)
- [ ] Run migrations and verify database connection
- [ ] Set up .env.example with all required variables
- [ ] Install and configure NextAuth.js
- [ ] Implement email/password authentication
- [ ] Create login and signup pages
- [ ] Add protected route middleware
- [ ] Test: Create user, login, access protected route

**Verification**: Run app, create account, login successfully, protected routes work.

---

## Phase 2: Brutalist Design Foundation
- [ ] Define brutalist color palette (stark blacks, whites, one accent)
- [ ] Update Tailwind config with brutalist theme tokens
- [ ] Create typography system (IBM Plex Mono, Space Grotesk)
- [ ] Build core UI components:
  - Buttons (heavy 3-4px borders, bold states)
  - Input fields (chunky borders)
  - Cards (stark borders and shadows)
  - Modal/Dialog components
  - Toast notifications
- [ ] Create brutalist header/navigation
- [ ] Design dashboard layout (grid-based, asymmetric)
- [ ] Make all layouts mobile responsive

**Verification**: All pages use brutalist theme consistently, responsive on mobile/tablet/desktop.

---

## Phase 3: Credit System Architecture
- [ ] Define credit pricing model in code
  - Images: 1-2 credits
  - Videos: 5-10 credits
  - Ad copy: 0.5 credits
- [ ] Implement credit balance tracking in database
- [ ] Create credit transaction logging
- [ ] Add credit deduction logic to generation functions
- [ ] Build credit balance display (header/dashboard)
- [ ] Create credit usage history page
- [ ] Install Stripe SDK
- [ ] Create Stripe checkout sessions for credit packages
- [ ] Implement payment webhooks (success/failure)
- [ ] Add credit top-up on successful payment
- [ ] Build billing history page

**Verification**: User can purchase credits, balance updates, transactions logged, webhooks work in test mode.

---

## Phase 4: User Dashboard & Profile
- [ ] Create main dashboard page with:
  - Credit balance widget (prominent)
  - Recent projects grid
  - Quick stats (assets generated, credits used)
  - Quick action buttons
- [ ] Build user profile page (avatar, name, email, bio)
- [ ] Add account settings (password change, preferences)
- [ ] Implement API key management (secure storage for fal.ai key)
- [ ] Create account deletion flow
- [ ] Add GDPR data export feature

**Verification**: Dashboard shows all data, profile editable, API keys stored securely, account deletion works.

---

## Phase 5: Project & Asset Management
- [ ] Create project creation flow
- [ ] Build project detail page (name, description, asset grid)
- [ ] Update data model: link assets to projects
- [ ] Implement project deletion with asset cleanup
- [ ] Add asset filtering (type, aspect ratio, date)
- [ ] Create asset detail modal (preview, download, delete, regenerate)
- [ ] Implement bulk operations (select, download ZIP, delete)
- [ ] Add asset tagging system
- [ ] Build favorite/star assets feature

**Verification**: Projects created, assets organized, filtering works, bulk operations functional.

---

## Phase 6: Enhanced Generation Features
- [ ] Redesign upload interface (brutalist drag-n-drop)
- [ ] Add generation progress indicators
- [ ] Implement queue management UI
- [ ] Add credit check before generation starts
- [ ] Create generation history tracking (prompts, settings)
- [ ] Implement retry logic for failed generations
- [ ] Build generation templates/presets
- [ ] Add batch generation queue

**Verification**: Generate multiple assets, queue works, failures retry, credits deducted correctly.

---

## Phase 7: API Routes & Backend Services
- [ ] Implement all API routes:
  - `/api/auth/*` (NextAuth)
  - `/api/user/*` (profile, credits)
  - `/api/credits/*` (purchase, history)
  - `/api/projects/*` (CRUD)
  - `/api/assets/*` (CRUD)
  - `/api/generate/*` (image, video, copy)
  - `/api/webhooks/stripe`
- [ ] Set up asset storage (S3/Cloudflare R2)
- [ ] Configure email service (SendGrid/Resend)
- [ ] Add rate limiting (per user, per IP)
- [ ] Implement input validation (Zod schemas)
- [ ] Add security protections (XSS, CSRF, SQL injection)
- [ ] Set up error tracking (Sentry)

**Verification**: All API routes work, security in place, rate limiting active, errors tracked.

---

## Phase 8: Content Pages & Polish
- [ ] Create landing page (brutalist hero, features, pricing)
- [ ] Build pricing page (credit packages, comparison)
- [ ] Add FAQ page
- [ ] Create Terms of Service and Privacy Policy
- [ ] Add first-time user onboarding flow
- [ ] Review all pages for brutalist consistency
- [ ] Run accessibility audit (WCAG AA)
- [ ] Test responsive design on all devices
- [ ] Optimize loading states and animations

**Verification**: All pages complete, accessible, responsive, brutalist theme consistent.

---

## Phase 9: Testing & Deployment
- [ ] Write unit tests for critical functions
- [ ] Create integration tests for API routes
- [ ] Add E2E tests for main user flows
- [ ] Test payment flows in Stripe test mode
- [ ] Run security audit
- [ ] Set up production environment (Vercel/Railway)
- [ ] Configure production database
- [ ] Set up production Stripe account
- [ ] Configure CI/CD pipeline
- [ ] Set up domain and SSL
- [ ] Configure monitoring and alerting

**Verification**: All tests pass, production deployed, payments work, monitoring active.

---

## Completion Criteria
When ALL of the following are true:
1. User can sign up, login, and manage account
2. Credit system fully functional (purchase, deduct, track)
3. Projects and assets can be created, organized, and managed
4. Asset generation works (images, videos, copy)
5. All API routes functional and secured
6. Brutalist design applied consistently across all pages
7. Application deployed to production
8. Payment system working (test mode verified)
9. All critical tests passing
10. Monitoring and error tracking active

Output: <promise>SAAS_COMPLETE</promise>

---

## Ralph Wiggum Usage

```bash
/ralph-loop "$(cat RALPH_TODO.md)" --completion-promise "SAAS_COMPLETE" --max-iterations 100
```

## Development Guidelines
- After each phase, run tests and verify functionality
- Fix any failures before moving to next phase
- If stuck for 3 iterations, document blockers and suggest alternatives
- Commit working code after each major feature
- Keep brutalist design consistent throughout
- Prioritize security and data protection
- Test credit deductions carefully to avoid billing issues
