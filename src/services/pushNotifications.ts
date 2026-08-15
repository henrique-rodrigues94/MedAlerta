import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAVE_PUSH_TOKEN = '@medalerta:push_token';

/**
 * Configura o comportamento das notificações push quando o app está em primeiro plano.
 */
export function configurarNotificacoesPush() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

/**
 * Solicita permissões e retorna o Expo Push Token do dispositivo.
 * Retorna null se não for possível obter (simulador sem notificações, etc.)
 */
export async function obterExpoPushToken(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('Push notifications só funcionam em dispositivos físicos.');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Permissão de notificações push negada.');
    return null;
  }

  try {
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: 'medalerta', // ajuste conforme seu projectId do Expo
    });
    const token = tokenData.data;
    await AsyncStorage.setItem(CHAVE_PUSH_TOKEN, token);
    return token;
  } catch (err) {
    console.error('Erro ao obter push token:', err);
    return null;
  }
}

export async function carregarPushTokenSalvo(): Promise<string | null> {
  return AsyncStorage.getItem(CHAVE_PUSH_TOKEN);
}

/**
 * Registra listeners para notificações push recebidas.
 * Retorna função de cleanup.
 */
export function registrarListenersPush(
  aoReceberNotificacao: (data: any) => void
) {
  // Notificação recebida com app em primeiro plano
  const subscriptionForeground = Notifications.addNotificationReceivedListener((notification) => {
    const data = notification.request.content.data;
    aoReceberNotificacao(data);
  });

  // Usuário tocou na notificação
  const subscriptionResponse = Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;
    aoReceberNotificacao(data);
  });

  return () => {
    subscriptionForeground.remove();
    subscriptionResponse.remove();
  };
}
