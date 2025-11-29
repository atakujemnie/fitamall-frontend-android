# Wersja 0.4.0

## Zmiany
- Dodano CTA „Edytuj adres w danych osobowych” na ekranie Lokalizacji trenera, kierujące do route `TrainerPersonalData` w `TrainerStack`.
- Upewniono się, że po powrocie z edycji danych osobowych ekran Lokalizacji odświeża dane poprzez `useFocusEffect` i ponowne wywołanie GET `/api/trainer/personal-data`.
- Zaktualizowano dokumentację frontend_geo_milestone o trasę CTA i mechanizm odświeżania.
