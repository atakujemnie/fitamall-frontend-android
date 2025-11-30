# Frontend Geo Milestone (trainer panel)

## Wersja dokumentu
0.4.0

## Panel trenera
- Komponent: `src/app/screens/TrainerDashboardScreen.tsx` (ekran „Panel trenera”).
- Nawigacja: zdefiniowany w `TrainerStack` w `src/app/navigation/AppNavigator.tsx` z route name `TrainerDashboard`, wpięty w bottom tab `Trainer` w `AppTabParamList`.

## Dane osobowe
- Komponent formularza: `src/app/screens/trainer/TrainerPersonalDataScreen.tsx`.
- Nawigacja: ekran `TrainerPersonalData` w stacku `TrainerStack` (`src/app/navigation/AppNavigator.tsx`). Przejście z panelu trenera następuje przez `navigation.navigate(tile.route)` z wartości `TrainerPersonalData` w `dashboardTiles` w `TrainerDashboardScreen.tsx`.

## Lokalizacja trenera
- Karta: „Lokalizacja” w `dashboardTiles` w `src/app/screens/TrainerDashboardScreen.tsx`.
- Route: `TrainerLocation` w stacku `TrainerStack` (`src/app/navigation/AppNavigator.tsx`).
- Komponent ekranu: `src/app/screens/trainer/TrainerLocationScreen.tsx`.
- Pobieranie danych: używa `getTrainerPersonalData` z `src/shared/api/trainer.api.ts` (autoryzacja przez `setAuthToken` z `AuthContext`).
- Pola lokalizacji: miasto, ulica + numer (`address`), kod pocztowy (`postal_code`), kraj (`country`) – pobierane z `user` lub `service_provider` (pierwsza dostępna wartość).
- Stany ekranu:
  - loading – spinner `ActivityIndicator` z komunikatem „Ładowanie lokalizacji...”,
  - error – komunikat o błędzie z przyciskiem „Spróbuj ponownie” do ponownego wywołania GET,
  - success – sekcja informacyjna + karta z adresem używanym w wyszukiwarce.
- Współrzędne: jeżeli `trainer_profile` (lub pola `latitude`/`longitude`) są dostępne w odpowiedzi, wyświetlany jest status (obecne vs brak współrzędnych). Same wartości liczbowe nie są pokazywane.
- CTA edycji adresu: przycisk „Edytuj adres w danych osobowych” na ekranie Lokalizacji, który nawiguję do route `TrainerPersonalData` w `TrainerStack` (identyczny flow jak kafelek „Dane osobowe” w panelu trenera).
- Odświeżanie danych po powrocie: ekran Lokalizacji korzysta z `useFocusEffect` do ponownego wywołania `GET /api/trainer/personal-data` przy każdym wejściu, co obejmuje powrót z formularza danych osobowych.

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

## GEO V2 – założenia UX

### Panel trenera

#### Zakładka „Dane osobowe”
- Zarządza wyłącznie danymi kontaktowymi.
- Utrzymuje pola country i city jako ogólne miejsce działania.
- Dokładne adresy (ulica, numer, kod) są zarządzane wyłącznie w zakładce „Lokalizacje”.

#### Zakładka „Lokalizacje”
- Lista maksymalnie 3 lokalizacji.
- Każdą lokalizację można dodać, edytować lub usunąć.
- Brak wyboru „głównej” lokalizacji – backend sam wybierze najbliższą.

### Strona klienta – ekran „FindTrainer”
- Pierwsza ścieżka: „użyj mojej lokalizacji” (uprawnienia OS, lat/lng → `GET /api/trainers`).
- Fallback: ręczne podanie miasta/adresu, jeżeli użytkownik nie udostępni lokalizacji.
- Wyszukiwarka nie opiera się domyślnie tylko na polu „Miasto” – jest to tryb rezerwowy.
