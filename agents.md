# agents.md

Lista endpointów wraz z przykadami - patrz plik contracts_api.json

## Ustalenie dot. frontu mobilnego

* Projekt wykorzystuje **React Native** jako jeden wspólny front aplikacji mobilnej.
* Jedno repozytorium RN generuje dwie aplikacje: **Android** oraz **iOS**.
* **Kod aplikacji (JS/TS)** jest w 100% współdzielony między Androidem i iOS.
* Różnice platformowe ograniczane do minimalnego poziomu i umieszczane w plikach platformowych lub warstwie natywnej.

## Środowisko developerskie

* Na **Windowsie** możliwa jest pełna praca nad kodem RN i uruchamianie aplikacji na Androidzie (emulator fizyczny lub wirtualny).
* Windows **nie umożliwia** budowania ani uruchamiania aplikacji iOS, ponieważ wymaga to macOS i Xcode.
* Cała logika RN napisana na Windowsie będzie działać na iOS po wykonaniu builda na macOS.

## Build iOS

* Build i uruchamianie aplikacji iOS możliwe tylko na:

  * macOS + Xcode
  * lub CI/CD z runnerem macOS.
* Podstawowe kroki po sklonowaniu repo na macOS:

  * `cd ios && pod install`
  * uruchomienie przez `npx react-native run-ios` lub Xcode.

## Konsekwencje dla Codex-agenta

* Wszystkie generowane przez Codex elementy frontu mają być zgodne z React Native i neutralne platformowo.
* Kod musi być od początku pisany jako **cross‑platform**, bez zależności ograniczonych do jednej platformy.
* Zadania generowane dla frontu mają być kierowane do jednego repo RN, niezależnie od systemu docelowego.

## Finalne ustalenie

**React Native = jeden wspólny front dla Androida i iOS.**
