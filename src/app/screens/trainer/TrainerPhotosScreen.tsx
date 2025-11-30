import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  deleteTrainerAvatar,
  deleteTrainerPhoto,
  getTrainerPhotos,
  getTrainerProfile,
  uploadTrainerAvatar,
  uploadTrainerPhoto,
} from '../../../shared/api/trainer.api';
import { useAuth } from '../../../features/auth/AuthContext';
import { httpClient, setAuthToken } from '../../../shared/api/httpClient';
import { mapApiError } from '../../../shared/utils/apiErrors';
import { colors, spacing } from '../../../shared/theme';

const MAX_PHOTOS = 5;

type TrainerPhoto = { id: string | number; url?: string; path?: string };

type TrainerPhotosResponse = {
  photos?: TrainerPhoto[];
};

type TrainerProfileResponse = {
  avatar?: string;
  avatarUrl?: string;
  avatar_url?: string;
};

type PickedImage = {
  path: string;
  mime?: string;
  width?: number;
  height?: number;
};

type CropImage = import('react-native-image-crop-picker').Image;
type ImagePickerModule = typeof import('react-native-image-crop-picker');

const normalizePhotos = (payload: TrainerPhoto[] | TrainerPhotosResponse): TrainerPhoto[] => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.photos)) {
    return payload.photos;
  }

  return [];
};

const resolveReachableUrl = (url?: string) => {
  if (!url) return url;

  const base = httpClient.defaults.baseURL; // 'http://10.0.2.2:8000'
  if (!base) return url;

  let resolved = url;

  // backend może zwrócić stare linki bez portu
  if (resolved.startsWith('http://localhost')) {
    // wycinamy hosta z portem z base
    const baseHost = base.replace(/\/+$/, ''); // bez trailing slash
    resolved = resolved.replace(/^http:\/\/localhost(:\d+)?/, baseHost);
  } else if (resolved.startsWith('http://127.0.0.1')) {
    const baseHost = base.replace(/\/+$/, '');
    resolved = resolved.replace(/^http:\/\/127\.0\.0\.1(:\d+)?/, baseHost);
  } else if (resolved.startsWith('/storage/')) {
    // na wszelki wypadek – ścieżka względna
    const baseHost = base.replace(/\/+$/, '');
    resolved = `${baseHost}${resolved}`;
  }

  return resolved;
};

const resolveAvatarUrlFromProfile = (profile: TrainerProfileResponse) => {
  return profile.avatarUrl ?? profile.avatar_url ?? profile.avatar;
};

const getFileFromPickedImage = (img: PickedImage | null) => {
  if (!img?.path) return null;

  return {
    uri: img.path,
    type: img.mime ?? 'image/jpeg',
    name: `photo-${Date.now()}.jpg`,
  } as any;
};

export const TrainerPhotosScreen: React.FC = () => {
  const { state } = useAuth();

  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [photos, setPhotos] = useState<TrainerPhoto[]>([]);

  const [isImagePickerAvailable, setIsImagePickerAvailable] = useState<boolean | null>(null);
  const imagePickerRef = useRef<ImagePickerModule | null>(null);

  const [loadingAvatar, setLoadingAvatar] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(true);

  const [avatarError, setAvatarError] = useState('');
  const [photosError, setPhotosError] = useState('');

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [deletingAvatar, setDeletingAvatar] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState<string | number | null>(null);

  useEffect(() => {
    if (state.token) {
      setAuthToken(state.token);
    }
  }, [state.token]);

  const resolveAvatarUrl = useCallback((profile: TrainerProfileResponse) => {
    return resolveAvatarUrlFromProfile(profile);
  }, []);

  const fetchAvatar = useCallback(async () => {
    if (!state.token) {
      setLoadingAvatar(false);
      return;
    }

    setAuthToken(state.token);
    setLoadingAvatar(true);
    setAvatarError('');

    try {
      const profile = await getTrainerProfile<TrainerProfileResponse>();
      setAvatarUrl(resolveReachableUrl(resolveAvatarUrl(profile)));
    } catch (error) {
      const mapped = mapApiError(error, {
        fallbackMessage: 'Nie udało się załadować avatara. Spróbuj ponownie.',
      });

      setAvatarError(mapped.message ?? 'Nie udało się załadować avatara. Spróbuj ponownie.');
    } finally {
      setLoadingAvatar(false);
    }
  }, [resolveAvatarUrl, state.token]);

  const fetchPhotos = useCallback(async () => {
    if (!state.token) {
      setLoadingPhotos(false);
      return;
    }

    setAuthToken(state.token);
    setLoadingPhotos(true);
    setPhotosError('');

    try {
      const response = await getTrainerPhotos<TrainerPhoto[] | TrainerPhotosResponse>();
      setPhotos(
        normalizePhotos(response).map(photo => ({
          ...photo,
          url: resolveReachableUrl(photo.url ?? photo.path),
          path: undefined,
        })),
      );
    } catch (error) {
      const mapped = mapApiError(error, {
        fallbackMessage: 'Nie udało się pobrać zdjęć. Spróbuj ponownie.',
      });

      setPhotosError(mapped.message ?? 'Nie udało się pobrać zdjęć. Spróbuj ponownie.');
      setPhotos([]);
    } finally {
      setLoadingPhotos(false);
    }
  }, [state.token]);

  useFocusEffect(
    useCallback(() => {
      fetchAvatar();
      fetchPhotos();
    }, [fetchAvatar, fetchPhotos]),
  );

  const showToast = useCallback((message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert('Informacja', message);
    }
  }, []);

  const handleUnavailablePicker = useCallback(() => {
    showToast('Dodawanie zdjęć jest niedostępne na tym urządzeniu.');
  }, [showToast]);

  const ensureImagePickerAvailable = useCallback(async (): Promise<ImagePickerModule | null> => {
    if (imagePickerRef.current?.openPicker) {
      setIsImagePickerAvailable(true);
      return imagePickerRef.current;
    }

    try {
      const pickerModule = await import('react-native-image-crop-picker');

      if (pickerModule?.openPicker) {
        imagePickerRef.current = pickerModule;
        setIsImagePickerAvailable(true);
        return pickerModule;
      }
    } catch (error: any) {
      console.log('DEBUG_IMAGE_PICKER_UNAVAILABLE', {
        message: error?.message ?? String(error),
      });
    }

    setIsImagePickerAvailable(false);
    return null;
  }, []);

  useEffect(() => {
    ensureImagePickerAvailable();
  }, [ensureImagePickerAvailable]);

  useEffect(() => {
    if (isImagePickerAvailable === false) {
      handleUnavailablePicker();
    }
  }, [handleUnavailablePicker, isImagePickerAvailable]);

  const pickImage = useCallback(async (): Promise<PickedImage | null> => {
    console.log('DEBUG_PICK_IMAGE_START', {
      baseURL: httpClient.defaults.baseURL,
      platform: Platform.OS,
    });

    const imagePicker = await ensureImagePickerAvailable();
    if (!imagePicker?.openPicker) {
      handleUnavailablePicker();
      return null;
    }

    try {
      const image = (await imagePicker.openPicker({
        mediaType: 'photo',
        cropping: false,
        compressImageQuality: 0.8,
        multiple: false,
      })) as CropImage | CropImage[] | null;

      if (!image || Array.isArray(image)) {
        return null;
      }

      console.log('DEBUG_PICK_IMAGE_SUCCESS', {
        uri: image.path,
        type: image.mime,
        width: image.width,
        height: image.height,
      });

      return {
        path: image.path,
        mime: image.mime,
        width: image.width,
        height: image.height,
      } satisfies PickedImage;
    } catch (error: any) {
      if (error?.code === 'E_PICKER_CANCELLED') {
        return null;
      }

      showToast('Nie udało się wybrać zdjęcia. Spróbuj ponownie.');
      throw error;
    }
  }, [ensureImagePickerAvailable, handleUnavailablePicker, showToast]);

  const handleUploadAvatar = useCallback(async () => {
    console.log('DEBUG_UPLOAD_AVATAR_START', {
      hasToken: Boolean(state.token),
      baseURL: httpClient.defaults.baseURL,
    });
    setAvatarError('');

    if (!state.token) {
      return;
    }

    setAuthToken(state.token);
    setUploadingAvatar(true);

    try {
      const pickedImage = await pickImage();
      if (!pickedImage) return;

      const file = getFileFromPickedImage(pickedImage);
      if (!file) {
        setAvatarError('Wybrane zdjęcie jest nieprawidłowe. Spróbuj ponownie.');
        return;
      }

      const formData = new FormData();
      formData.append('avatar', file);
      await uploadTrainerAvatar(formData);
      await fetchAvatar();
      showToast('Avatar został zaktualizowany.');
    } catch (error: any) {
      console.log('DEBUG_UPLOAD_AVATAR_ERROR', {
        code: error?.code,
        message: error?.message ?? String(error),
      });

      if (error?.code?.startsWith?.('E_PICKER')) {
        showToast('Nie udało się wybrać zdjęcia. Spróbuj ponownie.');
        return;
      }

      const mapped = mapApiError(error, {
        fallbackMessage: 'Nie udało się przesłać avatara. Spróbuj ponownie.',
      });

      setAvatarError(mapped.message ?? 'Nie udało się przesłać avatara. Spróbuj ponownie.');
    } finally {
      setUploadingAvatar(false);
    }
  }, [fetchAvatar, pickImage, showToast, state.token]);

  const handleDeleteAvatar = useCallback(async () => {
    setAvatarError('');
    if (!state.token) {
      return;
    }

    setAuthToken(state.token);
    setDeletingAvatar(true);

    try {
      await deleteTrainerAvatar();
      setAvatarUrl(undefined);
      showToast('Avatar został usunięty.');
    } catch (error) {
      const mapped = mapApiError(error, {
        fallbackMessage: 'Nie udało się usunąć avatara. Spróbuj ponownie.',
      });

      setAvatarError(mapped.message ?? 'Nie udało się usunąć avatara. Spróbuj ponownie.');
    } finally {
      setDeletingAvatar(false);
    }
  }, [showToast, state.token]);

  const handleAddPhoto = useCallback(async () => {
    console.log('DEBUG_ADD_PHOTO_START', {
      currentCount: photos.length,
      hasToken: Boolean(state.token),
      baseURL: httpClient.defaults.baseURL,
    });
    setPhotosError('');

    if (photos.length >= MAX_PHOTOS) {
      setPhotosError('Możesz dodać maksymalnie 5 zdjęć.');
      return;
    }

    if (!state.token) {
      return;
    }

    setAuthToken(state.token);
    setUploadingPhoto(true);

    try {
      const pickedImage = await pickImage();
      if (!pickedImage) return;

      const file = getFileFromPickedImage(pickedImage);
      if (!file) {
        setPhotosError('Wybrane zdjęcie jest nieprawidłowe. Spróbuj ponownie.');
        return;
      }

      const formData = new FormData();
      formData.append('photo', file);
      const uploaded = await uploadTrainerPhoto<TrainerPhoto>(formData);

      if (uploaded && (uploaded as TrainerPhoto).id) {
        const normalizedPhoto: TrainerPhoto = {
          ...uploaded,
          url: resolveReachableUrl(uploaded.url ?? uploaded.path),
        };
        setPhotos(current => [...current, normalizedPhoto]);
      } else {
        await fetchPhotos();
      }

      showToast('Zdjęcie zostało dodane.');
    } catch (error: any) {
      console.log('DEBUG_ADD_PHOTO_ERROR', {
        code: error?.code,
        message: error?.message ?? String(error),
      });

      if (error?.code?.startsWith?.('E_PICKER')) {
        showToast('Nie udało się wybrać zdjęcia. Spróbuj ponownie.');
        return;
      }

      const mapped = mapApiError(error, {
        fallbackMessage: 'Nie udało się przesłać zdjęcia. Spróbuj ponownie.',
      });

      setPhotosError(mapped.message ?? 'Nie udało się przesłać zdjęcia. Spróbuj ponownie.');
    } finally {
      setUploadingPhoto(false);
    }
  }, [fetchPhotos, photos.length, pickImage, showToast, state.token]);

  const handleDeletePhoto = useCallback(
    async (photoId: string | number) => {
      if (!state.token) {
        return;
      }

      setAuthToken(state.token);
      setPhotosError('');
      setDeletingPhotoId(photoId);

      try {
        await deleteTrainerPhoto(photoId);
        setPhotos(current => current.filter(photo => photo.id !== photoId));
        showToast('Zdjęcie zostało usunięte.');
      } catch (error) {
        const mapped = mapApiError(error, {
          fallbackMessage: 'Nie udało się usunąć zdjęcia. Spróbuj ponownie.',
        });

        setPhotosError(mapped.message ?? 'Nie udało się usunąć zdjęcia. Spróbuj ponownie.');
      } finally {
        setDeletingPhotoId(null);
      }
    },
    [showToast, state.token],
  );

  const availableSlots = useMemo(() => MAX_PHOTOS - photos.length, [photos.length]);
  const pickerUnavailable = isImagePickerAvailable === false;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Zdjęcia</Text>
        <Text style={styles.description}>
          Dodaj lub zaktualizuj zdjęcia, które najlepiej pokazują Twój styl pracy i efekty klientów.
          Możesz dodać maksymalnie pięć zdjęć profilowych.
        </Text>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.sectionTitle}>Avatar</Text>
              <Text style={styles.metaText}>Widoczny w wynikach wyszukiwania i na Twoim profilu.</Text>
            </View>
            {loadingAvatar ? <ActivityIndicator color={colors.primary} /> : null}
          </View>

          {avatarError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{avatarError}</Text>
            </View>
          ) : null}

          <View style={styles.avatarRow}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.placeholderText}>Brak avatara</Text>
              </View>
            )}
            <View style={styles.avatarActions}>
              <Pressable
                style={[
                  styles.button,
                  styles.primaryButton,
                  (uploadingAvatar || deletingAvatar || pickerUnavailable) && styles.disabledButton,
                ]}
                disabled={uploadingAvatar || deletingAvatar || pickerUnavailable}
                onPress={handleUploadAvatar}
              >
                <Text style={styles.buttonText}>
                  {uploadingAvatar ? 'Wysyłanie...' : 'Zmień avatar'}
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.button,
                  styles.secondaryButton,
                  (!avatarUrl || deletingAvatar || uploadingAvatar) && styles.disabledButton,
                ]}
                disabled={!avatarUrl || deletingAvatar || uploadingAvatar}
                onPress={handleDeleteAvatar}
              >
                <Text style={styles.buttonText}>{deletingAvatar ? 'Usuwanie...' : 'Usuń avatar'}</Text>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.sectionTitle}>Galeria</Text>
              <Text style={styles.metaText}>Dodaj zdjęcia przedstawiające Twoją pracę i efekty podopiecznych.</Text>
            </View>
            {loadingPhotos ? <ActivityIndicator color={colors.primary} /> : null}
          </View>

          {photosError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{photosError}</Text>
            </View>
          ) : null}

          <View style={styles.metaRow}>
            <Text style={styles.metaText}>Maksymalnie {MAX_PHOTOS} zdjęć.</Text>
            <Text style={styles.metaText}>
              Pozostało {availableSlots >= 0 ? availableSlots : 0} {availableSlots === 1 ? 'miejsce' : 'miejsca'}
            </Text>
          </View>

          <View style={styles.galleryHeader}>
            <Pressable
              style={[
                styles.button,
                styles.primaryButton,
                (uploadingPhoto || photos.length >= MAX_PHOTOS || pickerUnavailable) && styles.disabledButton,
              ]}
              disabled={uploadingPhoto || photos.length >= MAX_PHOTOS || pickerUnavailable}
              onPress={handleAddPhoto}
            >
              <Text style={styles.buttonText}>{uploadingPhoto ? 'Wysyłanie...' : 'Dodaj zdjęcie'}</Text>
            </Pressable>
          </View>

          {loadingPhotos ? (
            <View style={styles.loaderRow}>
              <ActivityIndicator color={colors.primary} />
              <Text style={styles.metaText}>Ładowanie zdjęć...</Text>
            </View>
          ) : photos.length === 0 ? (
            <Text style={styles.metaText}>Nie dodałeś jeszcze żadnych zdjęć.</Text>
          ) : (
            <View style={styles.photoGrid}>
              {photos.map(photo => {
                const isDeleting = deletingPhotoId === photo.id;
                const photoUrl = photo.url ?? photo.path;

                return (
                  <View key={photo.id} style={styles.photoItem}>
                    {photoUrl ? (
                      <Image source={{ uri: photoUrl }} style={styles.photo} />
                    ) : (
                      <View style={[styles.photo, styles.photoPlaceholder]}>
                        <Text style={styles.placeholderText}>Brak podglądu</Text>
                      </View>
                    )}

                    <Pressable
                      style={[styles.deleteBadge, isDeleting && styles.disabledButton]}
                      disabled={isDeleting}
                      onPress={() => handleDeletePhoto(photo.id)}
                    >
                      <Text style={styles.deleteBadgeText}>{isDeleting ? 'Usuwanie...' : photoUrl}</Text>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  description: {
    fontSize: 15,
    color: colors.mutedText,
    lineHeight: 21,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '700',
  },
  metaText: {
    color: colors.mutedText,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  errorBanner: {
    backgroundColor: '#3D1E1E',
    borderColor: '#FF6B6B',
    borderWidth: 1,
    borderRadius: 8,
    padding: spacing.md,
  },
  errorText: {
    color: '#FF9D9D',
    fontSize: 14,
  },
  avatarRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.border,
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: colors.mutedText,
    fontSize: 13,
  },
  avatarActions: {
    flex: 1,
    gap: spacing.sm,
  },
  button: {
    borderRadius: 8,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: colors.text,
    fontWeight: '600',
  },
  galleryHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  loaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  photoItem: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.border,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBadge: {
    position: 'absolute',
    bottom: spacing.xs,
    right: spacing.xs,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: 999,
  },
  deleteBadgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
});
