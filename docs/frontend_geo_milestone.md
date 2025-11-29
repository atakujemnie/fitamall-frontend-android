# Frontend Geo Milestone (trainer panel)

## Wersja dokumentu
0.2.0

## Panel trenera
- Komponent: `src/app/screens/TrainerDashboardScreen.tsx` (ekran „Panel trenera”).
- Nawigacja: zdefiniowany w `TrainerStack` w `src/app/navigation/AppNavigator.tsx` z route name `TrainerDashboard`, wpięty w bottom tab `Trainer` w `AppTabParamList`.

## Dane osobowe
- Komponent formularza: `src/app/screens/trainer/TrainerPersonalDataScreen.tsx`.
- Nawigacja: ekran `TrainerPersonalData` w stacku `TrainerStack` (`src/app/navigation/AppNavigator.tsx`). Przejście z panelu trenera następuje przez `navigation.navigate(tile.route)` z wartości `TrainerPersonalData` w `dashboardTiles` w `TrainerDashboardScreen.tsx`.

## Lokalizacja trenera
- Karta: „Lokalizacja” w `dashboardTiles` w `src/app/screens/TrainerDashboardScreen.tsx`.
- Route: `TrainerLocation` w stacku `TrainerStack` (`src/app/navigation/AppNavigator.tsx`).
- Komponent ekranu: `src/app/screens/trainer/TrainerLocationScreen.tsx` (placeholder z nagłówkiem „Lokalizacja trenera”).

## Warstwa API
- Klient API: `src/shared/api/trainer.api.ts` (funkcje `getTrainerPersonalData` i `updateTrainerPersonalData`).
- Endpointy: `GET /api/trainer/personal-data`, `PUT /api/trainer/personal-data`.

## Shape odpowiedzi GET /api/trainer/personal-data
Na podstawie użycia w `TrainerPersonalDataScreen.tsx`:
```ts
{
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
}
```
