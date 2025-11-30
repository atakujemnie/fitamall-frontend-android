# Wersja 0.4.5

- Dodano dynamiczne ładowanie `react-native-image-crop-picker` z obsługą braku natywnego modułu, aby ekran zdjęć trenera renderował się bez błędów.
- Wyłączono akcje dodawania i zmiany zdjęć, wyświetlając komunikat, gdy picker jest niedostępny.
- Zapewniono bezpieczne inicjalizowanie ekranu (nawigacja nie otrzymuje niezainicjalizowanego komponentu) dzięki weryfikacji dostępności pickera.
