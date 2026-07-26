# Splice+ Changelog

All notable changes to the Splice MVP (MedTechPreneurs co-founder matching platform).

---

## Phase 10 — Private Beta Readiness (July 2026)

**Goal:** Trust, polish, legal basics, user safety, and founder resources.

### Major features
- **Founder's Toolkit** (`/toolkit`) — static resource library with search and category filters
- **Account settings** (`/settings`) — account view, logout, placeholders for password/privacy/notifications/delete
- **Legal pages** — `/terms`, `/privacy`, `/cookies` with reusable `LegalDocument` component
- **User safety** — report profile flow with reason selection; reports stored in MongoDB; block user placeholder
- **Profile improvements** — edit founder role, building focus, stage, looking-for, and location; syncs compatibility inputs
- **Discover search** — lightweight search by name, company, or role via `GET /api/discovery/search`
- **Image upload abstraction** — `lib/storage/` local placeholder (Cloudinary/S3 ready)
- **Error handling** — app-scoped error page, retry actions on search/network failures

### API additions
- `POST /api/reports` — submit user report
- `GET /api/discovery/search?q=` — search eligible founders

### Database changes
- **`Report`** model — `reporterId`, `reportedUserId`, `reason`, `description`, `status`, `createdAt`

### Migration notes
- Run `npm run seed` (or `npm run seed -- --clear`) to seed demo reports
- No breaking changes to existing collections
- Service worker cache version bumped in Phase 9 follow-up (`splice-pwa-v2`)

---

## Phase 9 — Home Dashboard (July 2026)

### Major features
- Personalized `/home` dashboard with welcome, profile completion, compatibility insights, recent matches, unread messages, suggested founders, activity timeline, quick actions
- Profile completion calculator (7 fields)
- Activity synthesized from matches, discovery actions, messages, profile updates (no Activity collection)

### API additions
- Server-side `getHomeDashboard()` query layer (no new REST route)

---

## Phase 8 — Compatibility Engine (July 2026)

### Major features
- Weighted compatibility scoring (roles 30%, building 25%, stage 20%, looking-for 15%, location 10%)
- Dynamic scoring with request-scoped cache (not persisted)
- Compatibility display on Discovery, Matches, Home, Profile explainer

---

## Phase 7 — Messaging (July 2026)

### Major features
- Conversations auto-created on mutual match
- `/messages` inbox and `/messages/[conversationId]` chat thread
- 15s polling for new messages
- Seed message threads for demo accounts

### API additions
- `GET /api/conversations`
- `GET/POST /api/conversations/[conversationId]/messages`

### Database changes
- **`Conversation`** — participants, lastMessage, lastMessageAt, matchId
- **`Message`** — conversationId, senderId, content, isRead

---

## Phase 6 — Matching (July 2026)

### Major features
- Mutual match on reciprocal connect
- `/matches` page with compatibility-enriched cards
- Discovery excludes matched users
- Seed script with 22+ demo founders

### API additions
- `GET /api/matches`

### Database changes
- **`Match`** — userA, userB, status, matchedAt

---

## Phase 5 — Discovery / Swipe (July 2026)

### Major features
- Discover feed with pass/connect actions
- Founder cards with compatibility placeholders then real scoring

### API additions
- `GET /api/discovery`
- `POST /api/discovery/action`

### Database changes
- **`DiscoveryAction`** — viewerId, targetUserId, action

---

## Phase 4 — Profile (July 2026)

### Major features
- Profile editor (headline, bio, skills, links, placeholder photo)
- `GET/PATCH /api/profile`

---

## Phase 3 — App Shell & Navigation (July 2026)

### Major features
- Authenticated `(app)` layout with top/bottom navigation
- PWA manifest, service worker, offline page
- Toast, loading overlay, skeleton providers

---

## Phase 2 — Auth & Onboarding (July 2026)

### Major features
- Auth.js v5 credentials provider
- Register, login, logout
- Multi-step onboarding flow
- User model with founder fields

### API additions
- `POST /api/auth/register`
- `POST /api/onboarding`

---

## Phase 1 — Scaffold (July 2026)

### Major features
- Next.js App Router + TypeScript + Tailwind + shadcn/ui
- MongoDB/Mongoose connection
- Marketing landing page
- Brand tokens (deep blue, teal, coral, ink)

---

## Phase 0 — Project setup

- Repository scaffold, `SPLICE_DEV_REFERENCE.md`, dev tooling, ESLint, env templates
