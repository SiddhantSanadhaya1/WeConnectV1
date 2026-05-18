# WeConnectV1 Project Context

Created: 2026-05-15

Use this file as a compact handoff for future Codex/AI sessions. It summarizes what the app is, where the important code lives, how the main workflows are wired, and which project quirks matter before changing code.

## Critical Instructions

- Read `AGENTS.md` before editing. This repo explicitly warns that this is a newer Next.js version with breaking changes.
- Before writing Next.js code, read the relevant local docs under `node_modules/next/dist/docs/`.
- This is a Next.js App Router project. Pages and route handlers live under `app/`.
- Prefer existing patterns in `components/concierge`, `lib/session-store.ts`, and `lib/domains/*` over introducing new workflow abstractions.
- Use `rg`/`rg --files` for search.
- Do not revert unrelated user changes. The worktree may be dirty.

## Product Summary

WeConnectV1, also called WEC-Guardian POC, is a seller verification and supplier trust demo. It lets sellers register a business, prefill organization details from registry/web discovery, complete self verification with documents and webcam ID, issue a blockchain-anchored self-verification certificate, and optionally submit a paid Digital Certification request.

The app also includes buyer discovery, public certificate verification, admin review, fraud/analytics views, and assessor pages.

## Current Tech Stack

- Framework: Next.js `16.2.3`, App Router
- React: `19.2.4`
- Language: TypeScript
- Styling: Tailwind CSS v4
- Icons: `lucide-react`
- Animation: `framer-motion`
- Charts: `recharts`
- QR codes: `qrcode.react`
- PDFs: `pdf-lib`
- AI: Google Gemini via `@google/generative-ai`
- Blockchain: `viem`, Base Sepolia/demo anchoring
- Tests: Vitest

## Key Commands

```bash
npm run dev
npm run build
npm run lint
npm test
```

Important verification status at the time this context file was created:

- `npm run build` passes.
- Focused lint on the changed seller-dashboard files has no errors, but there are hook dependency warnings in shared hooks.
- Full `npm run lint` has pre-existing errors outside the seller dashboard, especially React compiler/purity rules and old `any` usage.
- Full `npm test` has pre-existing failures unrelated to the seller-dashboard workflow:
  - Vitest cannot resolve some `@/lib/voice-agent/*` aliases in test files.
  - `lib/enrichment.test.ts` founder-name extraction expectation fails.
  - `lib/web-search.test.ts` expects Bedrock behavior while current `lib/web-search.ts` uses Google SerpAPI plus DuckDuckGo fallback.

## Important Environment Variables

See `.env.example`.

Gemini:

- `GEMINI_API_KEY`
- `GEMINI_MODEL`, optional, defaults to `gemini-2.5-flash`
- `GEMINI_MODEL_FALLBACKS`, optional
- `GEMINI_CALL_TIMEOUT_MS`, optional
- `GEMINI_QUOTA_COOLDOWN_MS`, optional

Company discovery:

- `SERPAPI_API_KEY` is used by current `lib/web-search.ts` for Google SerpAPI search.
- The README still mentions Bedrock variables (`AWS_BEARER_TOKEN_BEDROCK`, `CLAUDE_MODEL`, `BEDROCK_AWS_REGION`), and tests still expect Bedrock. Treat that as stale or partially migrated unless code is changed back.

Blockchain:

- `CHAIN_MODE`: `demo`, `auto`, or `real`
- `CHAIN_RPC_URL`
- `CHAIN_PRIVATE_KEY`
- `CHAIN_ID`, defaults to `84532`
- `CHAIN_CONTRACT_ADDRESS`, optional

## High-Level Directory Map

- `app/`: App Router pages and API route handlers.
- `app/[lang]/(dashboard)/dashboard/page.tsx`: localized seller dashboard route.
- `app/[lang]/profile/page.tsx`: localized seller profile/status route.
- `app/dashboard/page.tsx`: redirects to `/en/dashboard`.
- `app/profile/page.tsx`: redirects to `/en/profile`.
- `app/api/*/route.ts`: backend endpoints.
- `components/ConciergeClient.tsx`: main seller dashboard orchestrator.
- `components/concierge/*`: seller workflow UI components and hooks.
- `components/seller/SellerProfileClient.tsx`: seller profile/status UI.
- `components/admin/*`: admin panels.
- `components/register/*`: separate voice registration UI.
- `components/auth/*`: local demo auth/session handling.
- `lib/registration.ts`: registration draft shape, normalization, prefill mapping, validation.
- `lib/session-store.ts`: in-memory sessions, certificates, AI assessment reports.
- `lib/registry.ts` and `lib/registry-kb.json`: static registry lookup.
- `lib/web-search.ts`: current web discovery provider logic.
- `lib/enrichment.ts`: extracts company hints from fetched public pages/snippets.
- `lib/code-classification.ts`: NAICS/UNSPSC classification.
- `lib/gemini.ts`: Gemini agent, vision, document verification, attestation helpers.
- `lib/vision-gate.ts`: ID verification gating.
- `lib/blockchain.ts`: demo/real chain anchoring.
- `lib/verification-readiness.ts`: server-side certificate issuance readiness gate.
- `lib/domains/*`: buyer intelligence, compliance, trust reports, workflow contracts.
- `lib/store/*`: in-memory buyer catalog and domain state.

## Main Seller Dashboard Flow

The seller dashboard is implemented in `components/ConciergeClient.tsx` and rendered by `app/[lang]/(dashboard)/dashboard/page.tsx`.

The visible workflow is currently three steps:

1. Seller Registration
2. Self Verification
3. Digital Certification

### Step 1: Seller Registration

Main files:

- `components/concierge/IntakeSection.tsx`
- `components/concierge/RegistrationReview.tsx`
- `components/concierge/StepperUI.tsx`
- `components/concierge/useDiscovery.ts`
- `app/api/discover/route.ts`
- `lib/registration.ts`
- `lib/web-search.ts`

Behavior:

- User enters seller name, business name, or URL.
- `useDiscovery` calls `POST /api/discover`.
- `/api/discover` first searches static registry via `lookupRegistry`.
- If no static match, it calls `searchCompanyOnWeb`.
- Current `searchCompanyOnWeb` tries Google SerpAPI if `SERPAPI_API_KEY` exists, then DuckDuckGo fallback.
- The result is enriched through `enrichCompanyCandidate`, classified via `resolveCompanyCodes`, mapped into a `RegistrationDraft`, and saved to the session.
- Seller can edit prefilled details in `RegistrationReview`.
- `confirmRegistration` in `ConciergeClient` validates required fields, saves registration with `cert_type: "self"`, switches workflow to self, and moves stage to `doc_upload`.

Required fields are defined in `lib/registration.ts`:

- `business_name`
- `country`
- `naics_codes`
- `unspsc_codes`
- `owner_details`
- `business_description`

Validation also checks NAICS/UNSPSC formats and ownership total.

### Step 2: Self Verification

Main files:

- `components/concierge/VerificationDisplay.tsx`
- `components/concierge/useVerification.ts`
- `components/concierge/CertificateDisplay.tsx`
- `components/WebcamCapture.tsx`
- `app/api/document-verify/route.ts`
- `app/api/vision/route.ts`
- `app/api/certificate/anchor/route.ts`
- `app/api/certificate/[certId]/document/route.ts`
- `lib/verification-readiness.ts`

Behavior:

- Stage `doc_upload`: seller uploads up to 3 supporting documents, currently PDF/DOC/DOCX.
- `useVerification.verifyDocuments` sends files to `POST /api/document-verify`.
- `/api/document-verify` runs Gemini document verification and stores a document assessment on the session.
- On verified documents, UI advances to stage `vision_id`.
- Stage `vision_id`: seller records a short webcam ID clip using `WebcamCapture`.
- `useVerification.sendVision` sends the clip to `POST /api/vision`.
- `/api/vision` runs Gemini vision and `decideVisionGate`, then stores `visionChecks.idPassed`.
- If ID passes, stage becomes `voice_attestation`. The UI says self verification is ready for blockchain certificate issuance.
- `CertificateDisplay` lets the seller issue the self certificate.
- `useAnchoring.anchorCert` calls `POST /api/certificate/anchor`.
- `/api/certificate/anchor` sets stage `anchoring`, checks `verificationReadiness`, submits real/demo anchor tx, issues certificate, updates buyer catalog, and sets stage `complete`.
- Certificate can be downloaded via `GET /api/certificate/[certId]/document`.

Important readiness gate:

`lib/verification-readiness.ts` currently requires:

- valid registration fields
- company on session
- supporting documents submitted
- documents verified
- webcam ID passed for self or digital paths
- session stage must be `anchoring`

This means self certificates should not be issued with only documents or only ID.

### Step 3: Digital Certification

Main files:

- `components/concierge/UpgradePortal.tsx`
- `components/ConciergeClient.tsx`
- `app/api/workflow/transition/route.ts`
- `app/api/session/registration/route.ts`
- `components/admin/DigitalCertificationRequests.tsx`
- `app/api/admin/digital-cert-requests/route.ts`

Behavior:

- After self certificate issuance, seller is recommended to apply for paid Digital Certification.
- `UpgradePortal` collects email, phone, and mock card details.
- `onUpgrade` in `ConciergeClient`:
  - sets registration `cert_type: "digital"`
  - saves registration with `paid: true`
  - calls workflow transition to select digital
  - records payment state `hold_placed`
  - tells the seller review takes 72 hours and rejected requests are refunded
- `app/api/session/registration/route.ts` now syncs both self and digital pending suppliers into the buyer/admin catalog. Digital pending items appear in admin digital certification request views.

Refund behavior:

- Payment refund state exists in `lib/domains/workflow.ts` as `refunded`.
- Certificate revocation route can mark payment refunded.
- The actual paid-review approval/rejection workflow is still demo-level, not a full payment integration.

## Session and Workflow Model

Session stages are defined in `lib/types.ts`:

- `idle`
- `discovered`
- `voice_confirm`
- `doc_upload`
- `vision_id`
- `voice_attestation`
- `anchoring`
- `complete`

In-memory sessions live in `lib/session-store.ts`. Important fields:

- `registration`
- `paid`
- `companyId`
- `companySnapshot`
- `visionChecks`
- `aiAssessmentReport`
- `certId`
- `discoveryMeta`
- `selectedCandidate`
- `lastAnchorError`

Domain workflow state lives in `lib/store/domain-store.ts` and is manipulated by:

- `lib/domains/workflow.ts`
- `app/api/workflow/transition/route.ts`
- compliance/trust/certificate APIs

Trust and certification contracts live in `lib/domains/contracts.ts`:

- `CertificationType`: `none`, `self`, `digital`
- `TrustLevel`: `self_declared`, `self_certified`, `digitally_certified`
- `PaymentState`: `not_started`, `hold_placed`, `captured`, `refunded`

## Important API Routes

Seller flow:

- `POST /api/session`: create or restore session
- `GET /api/session?id=...`: read session
- `PATCH /api/session`: update stage
- `POST /api/session/registration`: save registration and paid state
- `POST /api/discover`: company discovery and prefill
- `POST /api/document-verify`: supporting document verification
- `POST /api/vision`: webcam ID verification
- `POST /api/workflow/transition`: certification type, stage, questionnaire, payment state
- `POST /api/compliance/check`: compliance result
- `POST /api/trust-report`: trust report
- `POST /api/certificate/anchor`: issue blockchain-anchored certificate
- `GET /api/certificate/[certId]/document`: certificate PDF

Buyer/admin/public:

- `GET /api/certificate`: list certificates
- `GET /api/certificate/[certId]`: certificate details
- `POST /api/certificate/revoke`: revoke certificate and refund workflow state
- `GET /api/buyer/search`: buyer supplier search
- `POST /api/buyer/rfp`: buyer RFP action
- `GET /api/admin/digital-cert-requests`: digital pending request list
- `GET /api/admin/health`: demo health/config
- `POST /api/admin/revocation-tick`: simulate registry watcher revocation tick
- `GET /verify/[certId]`: public verification page

## Frontend Route Map

- `/`: marketing/product entry
- `/login`: local demo role login
- `/en/dashboard`: seller dashboard
- `/en/profile`: seller profile/status page
- `/dashboard`: redirects to `/en/dashboard`
- `/profile`: redirects to `/en/profile`
- `/buyer-portal`: buyer discovery and supplier actions
- `/admin`: admin dashboard
- `/admin/review`: review queue
- `/admin/analytics`: analytics dashboard
- `/admin/fraud`: fraud monitoring
- `/assessor`: assessor page
- `/demo`: split-screen demo
- `/documentation`: docs/API page
- `/ecosystem`: ecosystem page
- `/verify/[certId]`: public certificate verification

## Authentication

This is demo auth, not production auth.

- `components/auth/session.ts` stores a local browser session.
- `components/auth/AuthGate.tsx` gates pages by role.
- Seller dashboard allows `seller` and `admin`.

## Data Persistence Caveat

Most state is in memory:

- sessions
- certificates
- buyer catalog
- domain workflow state

Server restart loses runtime sessions/certificates unless regenerated. This is fine for POC but not production.

## Styling and UX Notes

- UI is Tailwind-driven.
- The dashboard components use white panels, restrained borders, and lucide icons.
- Keep cards at `rounded-lg` or similarly small radii unless matching existing components.
- Avoid nested card layouts where possible.
- For operational dashboards, keep information dense, clear, and workflow-focused.

## Recent Seller Dashboard Changes

The seller dashboard was changed from a six-part concierge flow into the requested three-step seller workflow.

Seller navigation/profile changes:

- Seller login now opens `/en/profile`.
- Seller navbar shows Seller Registration, Profile, and Ecosystem; Buyer Portal is hidden for seller role.
- `/en/profile` redirects sellers to `/en/dashboard` when no enterprise is registered.
- Registered sellers see enterprise details.
- Self verified sellers see a Self verified badge, certificate download, public verification link, and paid Digital Certification option.
- Digital pending sellers see 72-hour review/payment-hold status.
- Digital certified sellers see a Digital certified badge, certificate download, validity, and a future renewal payment option.
- Profile state is backed by `GET /api/seller/profile` and the active demo seller session id stored in localStorage under `weconnect.seller.sessionId`.
- The profile API should only use the latest registered seller as a fallback when no seller identifier is provided; when `sessionId`, `email`, or `companyName` is present and no match is found, return `not_registered` so the seller is sent to registration instead of seeing another seller's enterprise.
- Demo seller data is also persisted in browser localStorage:
  - `weconnect.seller.session.v1` stores the active dashboard session id, registration draft, payment flag, and stage.
  - `weconnect.seller.profile.v1` stores profile snapshots keyed by session id, seller email, and company name.
- The Profile tab supports editing enterprise details. Saves post back to `/api/session/registration` and mirror the changes into both browser caches so Profile and Seller Registration stay aligned after refreshes/dev server resets.

Changed files:

- `app/[lang]/profile/page.tsx`
- `app/profile/page.tsx`
- `app/api/seller/profile/route.ts`
- `components/seller/SellerProfileClient.tsx`
- `components/layout/Navbar.tsx`
- `components/auth/session.ts`
- `app/login/page.tsx`
- `components/ConciergeClient.tsx`
- `components/concierge/IntakeSection.tsx`
- `components/concierge/RegistrationReview.tsx`
- `components/concierge/StepperUI.tsx`
- `components/concierge/VerificationDisplay.tsx`
- `components/concierge/CertificateDisplay.tsx`
- `components/concierge/UpgradePortal.tsx`
- `components/concierge/useVerification.ts`
- `components/concierge/useDiscovery.ts`
- `components/concierge/useAnchoring.ts`
- `components/concierge/useConciergeSession.ts`
- `components/concierge/useConciergeWorkflow.ts`
- `components/concierge/useReports.ts`
- `app/api/session/registration/route.ts`
- `lib/domains/workflow.ts`
- `lib/verification-readiness.ts`
- `lib/i18n/en.ts`

Deleted:

- `components/concierge/SelfVerificationAdvanced.tsx`

Reason for deletion:

- The advanced questionnaire/report control panel was no longer part of the user-requested three-step seller registration dashboard. Compliance and trust report calls still exist and run from hooks when needed.

## Known Project Inconsistencies

- README and tests mention Bedrock discovery, but current `lib/web-search.ts` uses SerpAPI Google search and DuckDuckGo fallback.
- Full lint is not clean due to existing unrelated React compiler and lint issues.
- Full tests are not clean due to existing unrelated test/implementation drift.
- Camera and speech features need a browser context with permissions. HTTPS is preferred in deployed environments.
- `npm run dev` binds to `0.0.0.0`; local sandboxed environments may need approval to bind ports.

## Suggested Future Work

- Decide whether discovery should be Bedrock web-search or Google SerpAPI, then align README, `.env.example`, code, and tests.
- Add persistent storage for sessions/certificates/catalog before production.
- Replace mock payment card fields with a real payment provider if Digital Certification becomes production-facing.
- Add an admin accept/reject action for digital certification that captures or refunds payment state.
- Add focused tests for:
  - confirm registration moves to `doc_upload`
  - documents verified moves to `vision_id`
  - self certificate readiness blocks without docs or ID
  - digital upgrade creates a pending admin request with `hold_placed`
