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

Today: **the auth gate is wired, but the session behind it is a placeholder, not Supabase.** `app/_layout.tsx` now redirects between `(auth)` and the rest of the app based on `src/lib/auth.tsx`'s `AuthProvider` — an in-memory `useState(false)` that `signIn()` flips to `true`. There is still no `supabase` client file and no real session check; swap the state source in `auth.tsx` for a Supabase session (`getSession`/`onAuthStateChange`) without touching the navigation structure. Welcome/Login UI was ported from `origin/main`'s standalone `mobile/src/features/login/*` scaffold into `apps/mobile/src/features/auth/*`.

| Screen | Target path | Status |
| --- | --- | --- |
| Splash / session gate | `app/_layout.tsx` (`RootNavigator`, redirects on `isAuthenticated`) | 🚧 gate works; backing state is a placeholder, not a real Supabase session |
| Welcome | `app/(auth)/welcome.tsx` → [WelcomeScreen.tsx](../apps/mobile/src/features/auth/WelcomeScreen.tsx) | ✅ "Get Started" signs in directly (no Register step yet); "Log In" goes to Login |
| Login | `app/(auth)/login.tsx` → [LoginScreen.tsx](../apps/mobile/src/features/auth/LoginScreen.tsx) | ✅ UI + fields wired; "Log In"/"Sign up" both sign in directly (no real Supabase call yet) |
| Register | `app/(auth)/register.tsx` | ⬜ not part of the ported scaffold; Welcome's "Get Started" bypasses it for now |
| Auth group layout | `app/(auth)/_layout.tsx` | ✅ |

## Bottom tabs

The target 5-tab IA (Map, Quests, Report, Rewards, Profile) with a center Report "+" action is **already the shape of the existing tab bar** — [BottomNavBar.tsx](../apps/mobile/src/components/BottomNavBar.tsx) already renders Map/Quests/Wallet/Profile plus a center create button that pushes `/report/new`. Naming below tracks that reality rather than introducing a second tab bar.

| Target tab | Existing file | Status |
| --- | --- | --- |
| Map | `app/(tabs)/index.tsx` | ✅ (fallback shown on web, see below) |
| Quests | `app/(tabs)/quests.tsx` | 🚧 list UI TBD, currently placeholder-level |
| Report (center "+") | `app/report/new.tsx`, opened as a modal outside the tab bar, matching the spec's "center action" request | 🚧 collects fields; multi-step review flow not built |
| Rewards | `app/(tabs)/wallet.tsx` | 🚧 exists as "Wallet"; rename/relabel to "Rewards" or keep Wallet as the nested drill-in (see Rewards flow below) |
| Profile | `app/(tabs)/profile.tsx` | 🚧 placeholder-level |

## 1. Map flow

| Screen | Target path | Status |
| --- | --- | --- |
| MapScreen | `app/(tabs)/index.tsx` → [HomeMapView.tsx](../apps/mobile/src/features/map/HomeMapView.tsx) | ✅ Mapbox 3D map, GPS location, avatar (`PlayerMarker`), issue markers, recenter control all exist. Camera-follow-user and quest markers (currently only issue markers via `mockIssues.ts`) are 🚧. |
| Web fallback | [HomeMapView.web.tsx](../apps/mobile/src/features/map/HomeMapView.web.tsx) | ✅ `@rnmapbox/maps` has no web target; web renders `HomeMapFallback` instead. |
| IssueDetailScreen | `app/issue/[id].tsx` | ⬜ tap handler exists (`onIssuePress` in `index.tsx`) but currently routes to `/report/new?issueId=...` instead of a detail screen |
| QuestDetailScreen (from map marker) | `app/(tabs)/quests/[id].tsx` (shared, see Quest flow) | ⬜ no quest markers on the map yet |

## 2. Report issue flow

| Screen | Target path | Status |
| --- | --- | --- |
| ReportIssueScreen | `app/report/new.tsx` | 🚧 collects category, photo, GPS, description, severity per the spec's field list — but currently a single screen, not step 1 of a wizard |
| ReviewReportScreen | `app/report/review.tsx` | ⬜ |
| DuplicateCheckScreen | `app/report/duplicate-check.tsx` | ⬜ |
| ExistingIssueScreen | `app/report/existing-issue.tsx` | ⬜ |
| ReportSuccessScreen | `app/report/success.tsx` | ⬜ |

Flow once built: `report/new` → `review` → `duplicate-check` → either `success` (no duplicate, insert into Supabase) or `existing-issue` (possible duplicate → confirm/support existing, or continue as new) → back to Map.

## 3. Quest flow

| Screen | Target path | Status |
| --- | --- | --- |
| QuestListScreen | `app/(tabs)/quests.tsx` + [mockQuests.ts](../apps/mobile/src/features/quests/mockQuests.ts) | 🚧 mock data exists; Community vs. Personal split and Active/Completed/Expired status filters not built |
| QuestDetailScreen | `app/(tabs)/quests/[id].tsx` | ⬜ |
| ActiveQuestScreen | `app/(tabs)/quests/[id]/active.tsx` | ⬜ |
| SubmitProofScreen | `app/quests/[id]/submit-proof.tsx` → [SubmitProofScreen.tsx](../apps/mobile/src/features/quests/SubmitProofScreen.tsx) | ✅ before/after photo slots ([PhotoUploadSlot.tsx](../apps/mobile/src/components/PhotoUploadSlot.tsx)), GPS, notes, submit button all exist |
| VerificationScreen | `app/quests/[id]/verification.tsx` | ⬜ |
| VerificationStatusScreen (pending/rejected) | `app/quests/[id]/verification-status.tsx` | ⬜ |
| QuestCompletedScreen | `app/quests/[id]/completed.tsx` | ⬜ |
| RewardEarnedScreen | `app/quests/[id]/reward.tsx` | ⬜ |

Reminder from the spec, worth keeping visible here: verification/escalation quests, not DIY-repair quests, for anything involving electrical systems or road infrastructure.

## 4. AI Sustainability Advisor

Not a bottom tab — entry points are QuestListScreen and/or an assistant button.

| Screen | Target path | Status |
| --- | --- | --- |
| AIAdvisorIntroScreen | `app/(tabs)/quests/advisor/index.tsx` | ⬜ |
| AIChatScreen | `app/(tabs)/quests/advisor/chat.tsx` | ⬜ (asks ~3-4 questions: transport/vehicle use, daily travel distance, electricity/energy use, water habits, waste/recycling habits — stays scoped to sustainability/carbon topics) |
| RecommendedQuestsScreen | `app/(tabs)/quests/advisor/recommended.tsx` | ⬜ selecting a card routes to the same shared `quests/[id]` detail screen |

## 5. Rewards flow

| Screen | Target path | Status |
| --- | --- | --- |
| RewardsScreen | `app/(tabs)/wallet.tsx` (rename/relabel candidate) or new `app/(tabs)/rewards.tsx` | 🚧 total points/XP/badges/achievements/leaderboard not yet broken out |
| WalletScreen | `app/(tabs)/wallet/history.tsx` (if `wallet.tsx` becomes the Rewards landing screen) | 🚧 current `wallet.tsx` covers today's balance display; transaction history view is ⬜ |

Points/tokens are in-app XP-style rewards for this build, not crypto or guaranteed real money — keep that framing in any UI copy.

## 6. Profile flow

| Screen | Target path | Status |
| --- | --- | --- |
| ProfileScreen | `app/(tabs)/profile.tsx` | 🚧 placeholder-level; avatar/level/XP/badges/reports-submitted/issues-verified/quests-completed/impact/settings/logout not all present |
| EditProfileScreen | `app/(tabs)/profile/edit.tsx` | ⬜ |
| ImpactScreen | `app/(tabs)/profile/impact.tsx` | ⬜ |
| SettingsScreen | `app/(tabs)/profile/settings.tsx` | ⬜ |

Logout clears the Supabase session and returns to `(auth)/welcome` — blocked on the same auth-wiring gap noted at the top of this doc.

## Mobile vs. web

The citizen app and web tools are separate workspace sections that share the same backend contracts:

- `apps/mobile` — this Expo Router citizen app.
- `apps/web/admin` — the Next.js authority operations dashboard.
- `apps/web/dashboard` — the Next.js municipal analytics dashboard.

Nothing from `apps/web` belongs inside the mobile navigator, and mobile screens should remain in `apps/mobile`.

## What this doc is (and isn't)

This is a planning/reference document only; it does not generate navigation code. Update the status table whenever a screen is completed or moved.
