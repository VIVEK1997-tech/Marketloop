import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { userRepository } from '@/services/api/user.repository';

type PushRegistrationResult =
  | { registered: true; token: string }
  | { registered: false; reason: 'expo_go_unsupported' | 'permission_denied' | 'token_unavailable' | 'registration_failed' };

export const isExpoGo = () => Constants.appOwnership === 'expo';

const devLog = (message: string, details?: unknown) => {
  if (!__DEV__) return;
  if (details !== undefined) {
    console.info(`[push-registration] ${message}`, details);
    return;
  }
  console.info(`[push-registration] ${message}`);
};

export const registerDevicePushToken = async (): Promise<PushRegistrationResult> => {
  if (isExpoGo()) {
    devLog('Skipping remote push registration because Expo Go does not support it fully.');
    return { registered: false, reason: 'expo_go_unsupported' };
  }

  try {
    const Notifications = await import('expo-notifications');

    const existingPermissions = await Notifications.getPermissionsAsync();
    let finalStatus = existingPermissions.status;

    if (finalStatus !== 'granted') {
      const requestedPermissions = await Notifications.requestPermissionsAsync();
      finalStatus = requestedPermissions.status;
    }

    if (finalStatus !== 'granted') {
      devLog('Push permissions were not granted.');
      return { registered: false, reason: 'permission_denied' };
    }

    const devicePushToken = await Notifications.getDevicePushTokenAsync();
    if (!devicePushToken?.data) {
      devLog('Push token was unavailable after permission grant.');
      return { registered: false, reason: 'token_unavailable' };
    }

    const token = String(devicePushToken.data);

    await userRepository.registerPushToken({
      token,
      platform: Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'web',
      deviceName: `${Platform.OS}-device`
    });

    devLog('Registered device push token successfully.');
    return { registered: true, token };
  } catch (error) {
    devLog('Remote push registration failed.', error);
    return { registered: false, reason: 'registration_failed' };
  }
};
