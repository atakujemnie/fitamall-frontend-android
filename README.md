# Uruchamianie aplikacji Android (React Native 0.82)

Poniższy opis dokumentuje finalny, działający proces uruchomienia środowiska Android dla aplikacji mobilnej Fitamall.

## Wymagania

* Node.js (LTS)
* Java 17 (wymagana – nowsze wersje powodują błędy Gradle/RN)
* Android SDK (API 34–36)
* Emulator Android
* NPM lub PNPM

## Konfiguracja Java

React Native wspiera wyłącznie Java 17.

Ustawienia:

```
JAVA_HOME = C:\Program Files\Java\jdk-17
PATH      = %JAVA_HOME%\bin
```

## Reset projektu Android

Uszkodzony folder `android/` został odtworzony.

### Kroki

1. Usunięcie starego folderu:

```
Remove-Item -Recurse -Force .\android
```

2. Utworzenie projektu tymczasowego:

```
npx @react-native-community/cli init FitamallTemp
```

3. Skopiowanie nowego folderu:

```
robocopy C:\dev\FitamallTemp\android C:\dev\fitamall-frontend-android\android /MIR
```

4. Usunięcie projektu tymczasowego:

```
Remove-Item -Recurse -Force C:\dev\FitamallTemp
```

## Konfiguracja nazwy aplikacji

Plik `app.json`:

```
{
  "name": "FitamallTemp",
  "displayName": "FitamallTemp"
}
```

Plik `index.js`:

```
AppRegistry.registerComponent(appName, () => App);
```

## Uruchomienie Metro

```
npx react-native start --reset-cache
```

## Build Android

```
npx react-native run-android
```

## Problemy z ADB

Jeśli emulator był `offline`:

```
adb kill-server
adb start-server
adb devices
```

## Efekt końcowy

Projekt działa poprawnie. Na emulatorze widoczny jest ekran startowy React Native (0.82.1, Hermes).

Środowisko jest gotowe do implementacji logiki Fitamall.
