# Mobile app flow & navigation map

Reference doc for the citizen mobile app's screen flow. Use it as the checklist when adding new screens: find the row, create the file at the listed path, wire the `router.push`/`router.replace` calls described, then flip the status.

## Tech note: this is Expo Router, not React Navigation

The mobile app is built on **Expo Router** (`apps/mobile/app/`, file-based routing) — there is no `@react-navigation/*` package installed, and none should be added. Expo Router is built on top of React Navigation internally, so every concept below (stack, nested stack inside a tab, modal, route params) still applies — it's just expressed as a folder/file instead of a `createStackNavigator()` call. A route group in parentheses (`(tabs)`, `(auth)`) creates a navigator without adding a path segment; a plain folder adds one.

Because of this, "QuestDetailScreen must be reusable from Map / QuestList / RecommendedQuests" is close to free: it's one file (`app/(tabs)/quests/[id].tsx`), and every caller just does `router.push({ pathname: "/quests/[id]", params: { id } })`.

## Status legend

- ✅ built — screen/route exists and is wired up
- 🚧 partial — file exists but flow/UI is incomplete, or it exists under a different name/shape than the target
- ⬜ planned — not created yet

## Current vs. target root flow

Target:

```text
Splash -> check Supabase session
  no session  -> AuthGroup (Welcome -> Login/Register) -> MainTabs
  has session -> MainTabs directly
```

Today: **the full navigation shape is wired — splash, welcome/login/register, and the session gate — but the session itself is still a placeholder, not Supabase.** `app/_layout.tsx`'s `RootNavigator` shows `SplashScreen` while `src/lib/auth.tsx`'s `AuthProvider` resolves `isLoading` (currently an immediate async no-op standing in for `supabase.auth.getSession()`), then redirects between `(auth)` and the rest of the app based on `isAuthenticated` — an in-memory `useState(false)` that `signIn()` flips to `true`. Swap the state source in `auth.tsx` for a real Supabase session (`getSession`/`onAuthStateChange`) without touching the navigation structure.

| Screen | Target path | Status |
| --- | --- | --- |
| Splash / session gate | `app/_layout.tsx` (`RootNavigator`) → [SplashScreen.tsx](../apps/mobile/src/components/SplashScreen.tsx) shown while `isLoading` | 🚧 splash + gate wired; backing state is a placeholder, not a real Supabase session |
| Welcome | `app/(auth)/welcome.tsx` → [WelcomeScreen.tsx](../apps/mobile/src/features/auth/WelcomeScreen.tsx) | ✅ "Get Started" → Register; "Log In" → Login |
| Login | `app/(auth)/login.tsx` → [LoginScreen.tsx](../apps/mobile/src/features/auth/LoginScreen.tsx) | ✅ UI + fields wired; "Log In"/"Sign up" both sign in directly (no real Supabase call yet) |
| Register | `app/(auth)/register.tsx` → [RegisterScreen.tsx](../apps/mobile/src/features/auth/RegisterScreen.tsx) | ✅ UI wired (name/email/password); "Create Account" signs in directly (no real Supabase call yet) |
| Auth group layout | `app/(auth)/_layout.tsx` | ✅ |

## Bottom tabs

The target 5-tab IA (Map, Quests, Report, Rewards, Profile) with a center Report "+" action is **already the shape of the existing tab bar** — [BottomNavBar.tsx](../apps/mobile/src/components/BottomNavBar.tsx) renders Map/Quests/Rewards/Profile plus a center create button that pushes `/report/new`. The "Wallet" tab label was renamed to "Rewards"; the route path (`/wallet`) is unchanged.

| Target tab | Existing file | Status |
| --- | --- | --- |
| Map | `app/(tabs)/index.tsx` | ✅ live Mapbox map mounted (was a paused placeholder) |
| Quests | `app/(tabs)/quests/index.tsx` | ✅ list UI with Community/Personal + Active/Completed/Expired filters, AI Advisor entry button |
| Report (center "+") | `app/report/new.tsx` → `app/report-issue/*`, opened as a modal outside the tab bar | ✅ full wizard: category → details → media → review → duplicate-check → success/existing-issue |
| Rewards | `app/(tabs)/wallet/index.tsx` (tab labeled "Rewards") | ✅ points/XP/level/badges/leaderboard; "View Wallet" drills into `wallet/history.tsx` |
| Profile | `app/(tabs)/profile/index.tsx` | ✅ avatar/level/XP/stats/badges, menu to Edit/Impact/Settings, logout |

## 1. Map flow

| Screen | Target path | Status |
| --- | --- | --- |
| MapScreen | `app/(tabs)/index.tsx` → [HomeMapView.tsx](../apps/mobile/src/features/map/HomeMapView.tsx) | ✅ Mapbox 3D map, GPS location (`useUserLocation`), avatar (`PlayerMarker`), issue + quest markers, `MapControls` (locate/compass/3D toggle) all mounted |
| Web fallback | [HomeMapView.web.tsx](../apps/mobile/src/features/map/HomeMapView.web.tsx) | ✅ `@rnmapbox/maps` has no web target; web renders `HomeMapFallback` instead. |
| IssueDetailScreen | `app/issue/[id].tsx` → [IssueDetailScreen.tsx](../apps/mobile/src/features/map/IssueDetailScreen.tsx) | ✅ tapping an issue marker routes here (was routing to `/report/new?issueId=...`) |
| QuestDetailScreen (from map marker) | `app/(tabs)/quests/[id].tsx` (shared, see Quest flow) | ✅ tapping a quest marker (`kind: "quest"` in `mockIssues.ts`) routes here |

Camera continuously following the user's live position (vs. flying to it once on load/recenter) is still 🚧 — `MapControls`' locate button calls `HomeMapView`'s `recenter()`, but there's no persistent follow mode yet.

## 2. Report issue flow

| Screen | Target path | Status |
| --- | --- | --- |
| ReportIssueScreen | `app/report/new.tsx` → `app/report-issue/{category,details,media}.tsx` | ✅ multi-step wizard (category, details, media) — ported from the standalone root app via re-export shims, unchanged |
| ReviewReportScreen | `app/report-issue/review.tsx` | ✅ submit now continues into duplicate-check instead of a mock `Alert` |
| DuplicateCheckScreen | `app/report-issue/duplicate-check.tsx` | ✅ mock category+GPS-proximity check against a canned "existing issue" (stands in for a real similarity backend) |
| ExistingIssueScreen | `app/report-issue/existing-issue.tsx` | ✅ shows the matching mock issue; "Confirm & Support" or "Submit as New" |
| ReportSuccessScreen | `app/report-issue/success.tsx` | ✅ shows report ID, "Back to Map" returns to `/` |

Flow: `report/new` → `category` → `details` → `media` → `review` → `duplicate-check` → either `success` (no duplicate) or `existing-issue` (possible duplicate → confirm/support existing, or continue as new → `success`) → back to Map. These 5 new screens live in the root standalone app's `app/report-issue/` folder (same place as the ported wizard) with one-line re-export shims into `apps/mobile/app/report-issue/`, keeping the pattern already established for `category`/`details`/`media`/`review`.

Duplicate detection and the map-marker refresh after submission are mocked client-side only — no Supabase insert or real GPS/text/image-similarity backend yet (out of scope for this pass; see `docs/architecture.md`/`roadmap.md`).

## 3. Quest flow

| Screen | Target path | Status |
| --- | --- | --- |
| QuestListScreen | `app/(tabs)/quests/index.tsx` + [mockQuests.ts](../apps/mobile/src/features/quests/mockQuests.ts) | ✅ Community/Personal category filter + Active/Completed/Expired status filter; AI Advisor entry button |
| QuestDetailScreen | `app/(tabs)/quests/[id].tsx` → [QuestDetailScreen.tsx](../apps/mobile/src/features/quests/QuestDetailScreen.tsx) | ✅ image, title, description, tokens/XP, steps, safety note, Start Quest |
| ActiveQuestScreen | `app/(tabs)/quests/[id]/active.tsx` → [ActiveQuestScreen.tsx](../apps/mobile/src/features/quests/ActiveQuestScreen.tsx) | ✅ step checklist, "I'm Done — Submit Proof" |
| SubmitProofScreen | `app/quests/[id]/submit-proof.tsx` → [SubmitProofScreen.tsx](../apps/mobile/src/features/quests/SubmitProofScreen.tsx) | ✅ before/after photo slots, GPS, notes; submit now routes to Verification (was a mock `Alert`) |
| VerificationScreen | `app/quests/[id]/verification.tsx` | ✅ mock verification (deterministic per quest id, stands in for GPS/image-similarity + manual review) routes to Completed or VerificationStatus |
| VerificationStatusScreen (pending/rejected) | `app/quests/[id]/verification-status.tsx` | ✅ pending → "Back to Quests"; rejected → reason + "Retry Submission" |
| QuestCompletedScreen | `app/quests/[id]/completed.tsx` | ✅ "Claim Reward" |
| RewardEarnedScreen | `app/quests/[id]/reward.tsx` | ✅ shows tokens/XP earned, "Back to Quests" |

Reminder from the spec, worth keeping visible here: verification/escalation quests, not DIY-repair quests, for anything involving electrical systems or road infrastructure — reflected in `mockQuests.ts`'s `safetyNote` field.

Verification outcomes are mocked (no real GPS-consistency/image-similarity/manual-review backend yet), and reward claims don't yet write back to a live points/XP store — `RewardsScreen`/`WalletScreen` show static mock data, not a store updated by completed quests.

## 4. AI Sustainability Advisor

Not a bottom tab — entry points are the Quests list header ("AI Advisor" button) and `QuestDetailScreen`/`RecommendedQuestsScreen` share the same detail route.

| Screen | Target path | Status |
| --- | --- | --- |
| AIAdvisorIntroScreen | `app/(tabs)/quests/advisor/index.tsx` | ✅ topic overview, "Start Chat" |
| AIChatScreen | `app/(tabs)/quests/advisor/chat.tsx` → [AIChatScreen.tsx](../apps/mobile/src/features/quests/AIChatScreen.tsx) | ✅ asks 4 fixed questions (transport, travel distance, electricity, waste) via quick-reply chips, stays scoped to sustainability topics |
| RecommendedQuestsScreen | `app/(tabs)/quests/advisor/recommended.tsx` | ✅ lists `aiSuggested` quests from `mockQuests.ts`; selecting one routes to the shared `quests/[id]` detail screen |

The chat doesn't call a real LLM yet — answers only drive which canned `aiSuggested` quests are shown (all of them, currently), not a live-generated recommendation. A real Gemini-backed chat exists on a separate `Sustainability-Advisor` branch and isn't wired in here (out of scope for this navigation pass).

## 5. Rewards flow

| Screen | Target path | Status |
| --- | --- | --- |
| RewardsScreen | `app/(tabs)/wallet/index.tsx` → [RewardsScreen.tsx](../apps/mobile/src/features/rewards/RewardsScreen.tsx) | ✅ points/XP/level, badges, leaderboard, link into Wallet |
| WalletScreen | `app/(tabs)/wallet/history.tsx` → [WalletScreen.tsx](../apps/mobile/src/features/rewards/WalletScreen.tsx) | ✅ balance + recent transactions |

Points/tokens are in-app XP-style rewards for this build, not crypto or guaranteed real money — keep that framing in any UI copy. Data is mock (`mockRewards.ts`), not yet backed by Supabase or updated live from completed quests/reports.

## 6. Profile flow

| Screen | Target path | Status |
| --- | --- | --- |
| ProfileScreen | `app/(tabs)/profile/index.tsx` → [ProfileScreen.tsx](../apps/mobile/src/features/profile/ProfileScreen.tsx) | ✅ avatar/level/XP, reports/verified/quests stats, badges, menu, logout |
| EditProfileScreen | `app/(tabs)/profile/edit.tsx` | ✅ name/bio form (local state only, no persistence) |
| ImpactScreen | `app/(tabs)/profile/impact.tsx` | ✅ mock CO₂/waste/water impact estimates |
| SettingsScreen | `app/(tabs)/profile/settings.tsx` | ✅ notification/location toggles (local state only), logout |

Logout (`useAuth().signOut()`) clears the placeholder session and the root gate redirects to `(auth)/welcome` — same Supabase-wiring gap noted at the top of this doc.

## Mobile vs. web

The two clients are already separate apps in the monorepo, each talking to the same Supabase backend:

- `apps/mobile` — this Expo Router citizen app.
- `apps/admin` — the Next.js authority dashboard (this is the "web dashboard" from the spec; the actual folder is named `admin`, not `web`). It owns report totals/verified/pending/resolved, category/severity breakdowns, hotspots, evidence review, resolution trends, and quest/impact analytics. Nothing from `apps/admin` belongs inside the mobile navigator, and nothing here should get pulled into it.

## What this doc is (and isn't)

This is a planning/reference doc only — no navigation code was generated from it. When a screen moves from ⬜/🚧 to done, update its row here so the doc keeps matching reality. See also [architecture.md](architecture.md) for the backend data flow and [roadmap.md](roadmap.md) for build sequencing (this doc assumes the reporting-loop-first order roadmap.md already lays out).
