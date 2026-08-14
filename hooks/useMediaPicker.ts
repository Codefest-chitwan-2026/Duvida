import { useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

import { MediaItem } from '../types/issue';

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024;
const SUPPORTED_MIME_TYPES = ['image/jpeg', 'image/png', 'video/mp4'];
export const SUPPORTED_FORMATS_LABEL = 'JPG, PNG or MP4';

function showAlert(title: string, message: string) {
  // react-native-web's Alert.alert is a no-op, so fall back to window.alert on web.
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && typeof window.alert === 'function') {
      window.alert(`${title}\n\n${message}`);
    }
    return;
  }
  Alert.alert(title, message);
}

function inferMimeType(asset: ImagePicker.ImagePickerAsset): string {
  if (asset.mimeType) return asset.mimeType;
  const source = asset.fileName ?? asset.uri;
  const extension = source.split('.').pop()?.toLowerCase();
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
  if (extension === 'png') return 'image/png';
  if (extension === 'mp4') return 'video/mp4';
  return asset.type === 'video' ? 'video/mp4' : 'image/jpeg';
}

function toMediaItem(asset: ImagePicker.ImagePickerAsset): MediaItem | null {
  const mimeType = inferMimeType(asset);

  if (!SUPPORTED_MIME_TYPES.includes(mimeType)) {
    showAlert('Unsupported file type', `Please select a supported format: ${SUPPORTED_FORMATS_LABEL}.`);
    return null;
  }

  if (typeof asset.fileSize === 'number' && asset.fileSize > MAX_FILE_SIZE_BYTES) {
    showAlert('File too large', 'Each photo or video must be 25MB or smaller.');
    return null;
  }

  return {
    id: `${asset.assetId ?? asset.uri}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    uri: asset.uri,
    name: asset.fileName ?? asset.uri.split('/').pop() ?? 'media',
    mimeType,
    fileSize: asset.fileSize,
    mediaType: mimeType.startsWith('video') ? 'video' : 'image',
  };
}

function assetsToMediaItems(assets: ImagePicker.ImagePickerAsset[]): MediaItem[] {
  return assets
    .map(toMediaItem)
    .filter((item): item is MediaItem => item !== null);
}

export function useMediaPicker(onPicked: (items: MediaItem[]) => void) {
  const pickFromLibrary = useCallback(async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showAlert('Permission needed', 'Please allow access to your photo library to add media.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      allowsMultipleSelection: Platform.OS !== 'web',
      quality: 0.8,
    });

    if (result.canceled) return;

    const items = assetsToMediaItems(result.assets);
    if (items.length > 0) onPicked(items);
  }, [onPicked]);

  const pickFromCamera = useCallback(async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      showAlert('Permission needed', 'Please allow camera access to take a photo.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.8,
    });

    if (result.canceled) return;

    const items = assetsToMediaItems(result.assets);
    if (items.length > 0) onPicked(items);
  }, [onPicked]);

  const openPicker = useCallback(() => {
    // Camera capture isn't a supported flow on web, and react-native-web's
    // Alert can't render an action sheet, so go straight to the file picker.
    if (Platform.OS === 'web') {
      pickFromLibrary();
      return;
    }

    Alert.alert(
      'Add Photo or Video',
      'Choose a source',
      [
        { text: 'Take Photo', onPress: pickFromCamera },
        { text: 'Choose from Library', onPress: pickFromLibrary },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  }, [pickFromCamera, pickFromLibrary]);

  return { openPicker };
}
