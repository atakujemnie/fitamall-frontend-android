# Wersja 0.4.2

## Zmiany
- Ręcznie podlinkowano `react-native-image-picker` w konfiguracji Androida zgodnie z architekturą New Architecture, aby zapobiec nullowaniu się `ImagePickerManager`.
- Dodano ręczne zarejestrowanie `ImagePickerPackage` w `MainApplication` dla poprawnego działania `launchImageLibrary` na Androidzie.
