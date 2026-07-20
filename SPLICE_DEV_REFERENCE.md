# Splice by MedTechPreneurs — Dev Reference

> Keep this file open in Cursor (or add it as a `.cursor/rules` context file) for the whole build. It's the single source of truth for stack, data models, and feature scope — condensed from the full PRD for implementation use.

---

## 1. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 14+ (App Router)** | Full-stack: pages + API routes in one project |
| Language | TypeScript | Non-negotiable at this data-sensitivity level |
| Database | **MongoDB** (Atlas) via **Mongoose** | Document model fits flexible profile/tag data well |
| Styling | **Tailwind CSS** | Utility-first, use CSS variables for brand tokens (below) |
| Components | **shadcn/ui** (Radix + Tailwind) | Owned, restylable components — not a locked-in design system |
| Motion | **Framer Motion** | Required for swipe-card drag/rotation and match-moment animation |
| Auth | **Auth.js (NextAuth v5)** | Email/mobile OTP + credentials provider |
| Real-time chat | **Pusher** or **Socket.io** (on a small Node process alongside Next.js) | Pick Pusher first — less infra to manage pre-scale |
| File storage | **Cloudflare R2** or **AWS S3** | Profile photos, verification docs |
| Validation | **Zod** | Shared schema between client forms and API routes |
| Forms | **React Hook Form + Zod resolver** | Pairs cleanly with shadcn form components |
| Deployment | **Vercel** (app) + **MongoDB Atlas** (DB) | Fastest path to a live MVP |

**Design tokens (from PRD brand direction):**
```css
--color-deep-blue: #0F2A47;
--color-teal: #0E7C7B;
--color-coral: #FF6B5B;   /* Like action, match moments, compatibility score only */
--color-bg-light: #F7FAFA;
```

---

## 2. Data Models (Mongoose)

```
User
  _id
  name, gender, email, mobile, age
  profession, specialisation
  category: 'healthcare' | 'engineer' | 'entrepreneur'
  lookingFor: ['engineer' | 'entrepreneur' | ...]   // excludes own category by default
  passwordHash / authProvider
  createdAt

Profile (1:1 with User)
  userId
  photoUrl, bio
  city, geo: { type: 'Point', coordinates: [lng, lat] }   // geo index for location scoring
  education, linkedinUrl
  skillTags: string[]        // e.g. ['clinical', 'regulatory'] or ['ai-ml', 'backend']
  visionTags: string[]       // e.g. ['diagnostics', 'remote-care']
  yearsExperience

PersonalityAssessment (1:1, optional)
  userId
  mbtiType / discProfile

Verification
  userId
  status: 'unverified' | 'pending' | 'verified'
  credentialType, sourceApi
  documentUrl (private bucket, signed URL only)
  verifiedAt

CompatibilityScore  (computed, cached — recompute on profile update via background job)
  userIdA, userIdB
  skillComplementarity, locationScore, visionAlignment, personalityScore
  composite   // 0–100, this is what renders as "94% Match"

Swipe
  actorId, targetId
  direction: 'like' | 'reject'
  createdAt
  // index on {actorId, direction} for fast Likes-window & Reset-Rejects queries

Match  (created when both sides record 'like' + one sends 'connect')
  userIdA, userIdB
  status: 'pending' | 'connected'
  createdAt

ChatThread
  matchId
  messages: [{ senderId, text, sentAt }]
  preMatchMessageCount: number   // enforce cap of 1 before Match.status === 'connected'

ToolkitResource
  type: 'equity-calculator' | 'pitch-deck-template' | 'legal-doc'
  title, fileUrl, description
```

---

## 3. Core Feature Scope (condensed)

- **Category logic**: onboarding captures `category` then `lookingFor` (must exclude own category by default — enforce in the API, not just the UI).
- **Discovery feed**: `GET /api/discovery` — returns candidate profiles filtered by `lookingFor`, excludes already-swiped users, sorted by `CompatibilityScore.composite` desc.
- **Swipe right**: writes a `Swipe(direction: 'like')`, does **not** create a Match yet — surfaces in the actor's "Likes" list with a one-message send button.
- **Swipe left**: writes a `Swipe(direction: 'reject')`; "Reset Rejects" bulk-deletes all of that actor's reject swipes.
- **Pre-match message**: allowed only if `preMatchMessageCount === 0` and `Match.status !== 'connected'`.
- **Match moment**: when the liked user responds with "Connect," flip `Match.status = 'connected'`, unlock unrestricted `ChatThread`.
- **Verification**: async job hits medical-registry / LinkedIn APIs, flips `Verification.status`, badge reflects on profile immediately via revalidation.
- **Founder Card**: photo, name, category badge, verified badge, tag chips (profession, experience, seeking), compatibility %, location, Pass/Connect buttons.

---

## 4. Suggested API Route Structure (App Router)

```
/app/api/auth/[...nextauth]/route.ts
/app/api/onboarding/route.ts
/app/api/profile/route.ts            GET, PATCH
/app/api/verification/route.ts       POST (submit), GET (status)
/app/api/discovery/route.ts          GET
/app/api/swipe/route.ts              POST { targetId, direction }
/app/api/swipe/reset-rejects/route.ts POST
/app/api/matches/route.ts            GET
/app/api/matches/[matchId]/messages/route.ts   GET, POST
/app/api/toolkit/route.ts            GET
```

---

## 5. Build Phases (do these as separate Cursor sessions/prompts, in order)

1. **Scaffold** — Next.js + TS + Tailwind + shadcn init, MongoDB connection util, brand tokens in `globals.css`, folder structure.
2. **Auth + Onboarding** — Auth.js setup, `User` model, "what defines you / who are you looking for" flow, core profile fields.
3. **Profile + Verification** — Profile CRUD, photo upload to R2/S3, Verification submit flow + status badge.
4. **Discovery + Swipe** — Founder Card component (Framer Motion drag), `/api/discovery`, `/api/swipe`, Likes window, Reset-Rejects.
5. **Matching Algorithm** — background job computing `CompatibilityScore`, weighting per PRD section 3.3.
6. **Match + Chat** — Match creation on mutual connect, real-time `ChatThread` via Pusher, pre-match one-message cap.
7. **Founder's Toolkit** — static/CMS-backed resource marketplace.
8. **Polish + Deploy** — animations, empty states, error handling, Vercel + Atlas production setup.

**Per-phase prompt pattern for Cursor:**
> "Using SPLICE_DEV_REFERENCE.md as context, implement Phase N: [name]. Build [specific models/routes/components]. Don't touch anything outside this phase's scope yet."

Keep phases in separate commits/branches so a bad generation in Phase 4 doesn't require re-reviewing Phase 1–3 code.
