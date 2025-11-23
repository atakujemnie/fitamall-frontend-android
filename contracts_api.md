# Fit'am all – API Contract (Frontend & Backend)

## Trainer Discovery API v1 – wspólny kontrakt

Dokument opisuje uzgodnioną strukturę danych i endpointy obsługujące wyszukiwanie trenerów. Obowiązuje zarówno dla backendu (Laravel 12), jak i frontendu mobilnego (React Native). Każda zmiana tego kontraktu wymaga aktualizacji w obu repozytoriach.

---

## 1. Endpoint: licznik trenerów

**GET** `/api/trainers/stats`
**Dostęp:** publiczny

### Response 200

```
{
  "total_public_trainers": 10
}
```

### Zasady

* Backend filtruje: `is_public_trainer = true`, `is_active = true`.
* Front używa tego endpointu do wyświetlenia licznika na stronie głównej.

---

## 2. Endpoint: lista miast

**GET** `/api/trainers/filters`
**Dostęp:** publiczny

### Response 200

```
{
  "cities": ["Gdańsk", "Kraków", "Warszawa", "Wrocław"]
}
```

### Zasady

* Backend zwraca obiekt z kluczem `cities`.
* Front oczekuje tablicy stringów.

### Struktura TS

```
interface TrainerFiltersResponse {
  cities: string[];
}
```

---

## 3. Endpoint: lista trenerów po mieście

**GET** `/api/trainers?city={CITY_NAME}`
**Dostęp:** publiczny

### Response 200

```
[
  {
    "id": 1,
    "first_name": "Trener",
    "last_name": "Testowy",
    "city": "Warszawa"
  }
]
```

### Zasady

* Backend zwraca tablicę obiektów, nawet gdy jest pusta.
* Front renderuje listę trenerów po wyborze miasta.

### Struktura TS

```
interface TrainerListItem {
  id?: string | number;
  first_name: string;
  last_name: string;
  city: string;
}
```

---

## 4. Zasady kompatybilności

* Backend może dodawać nowe pola (np. avatar_url, rating) – front traktuje je jako opcjonalne.
* Niedozwolone bez synchronizacji:

  * zmiana nazwy istniejących pól,
  * zmiana struktury odpowiedzi,
  * zmiana typów pól,
  * zmiana ścieżek endpointów.
* Każda zmiana wymaga aktualizacji tego dokumentu w dwóch repo.

---

## 5. Przyszłe rozszerzenia

Nowe funkcje trenerów (profil, kalendarz, usługi) muszą otrzymać własne sekcje w tym pliku.

---

**Status kontraktu:** stabilny, obowiązujący od wdrożenia wyszukiwarki trenerów.
