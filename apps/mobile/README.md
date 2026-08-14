# Mobile app

Expo / React Native citizen interface. Recommended feature folders:

```text
src/
  app/                   Expo Router routes
  features/
    auth/
    map/
    reports/
    quests/
    profile/
  components/
  lib/supabase/
  services/location/
  services/media/
```

Start with report creation, upload evidence before inserting `report_media`, and show upload/submission retry states. A Mapbox-enabled Expo development build is required; Expo Go is not sufficient for native Mapbox packages.
