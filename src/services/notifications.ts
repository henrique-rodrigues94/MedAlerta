import notifee, {
  AndroidImportance,
  AndroidCategory,
  AndroidVisibility,
  TriggerType,
  TimestampTrigger,
  EventType,
  AuthorizationStatus,
} from '@notifee/react-native';
import { addDays, setHours, setMinutes, isBefore } from 'date-fns';
import { Medicamento } from '../types';
import { marcarTomadasPerdidas } from '../db/database';

const CANAL_ALARME_ID = 'alarme-remedio';

export async function verificarPermissoes(): Promise<boolean> {
  const settings = await notifee.getNotificationSettings();
  if (settings.authorizationStatus === AuthorizationStatus.AUTHORIZED) return true;
  if (settings.authorizationStatus === AuthorizationStatus.DENIED) return false;
  const result = await notifee.requestPermission({ critical: true, sound: true, alert: true } as any);
  return result.authorizationStatus === AuthorizationStatus.AUTHORIZED;
}

export async function configurarCanalDeAlarme() {
  await notifee.createChannel({
    id: CANAL_ALARME_ID,
    name: 'Alarme de Remédio',
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PUBLIC,
    sound: 'alarme_remedio',
    vibration: true,
    vibrationPattern: [300, 500, 300, 500, 300, 900],
    bypassDnd: true,
  });
}

export async function agendarMedicamento(m: Medicamento): Promise<number> {
  const inicio = new Date(m.dataInicio);
  const agora = new Date();
  const promessas: Promise<void>[] = [];
  let agendados = 0;

  for (let dia = 0; dia < m.totalDias; dia++) {
    const dataBase = addDays(inicio, dia);
    for (const horario of m.horarios) {
      const [h, min] = horario.split(':').map(Number);
      let dataHora = setMinutes(setHours(dataBase, h), min);
      if (isBefore(dataHora, agora)) continue;

      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: dataHora.getTime(),
        alarmManager: { allowWhileIdle: true },
      };

      const notificationId = `${m.id}-${dataHora.getTime()}`;

      promessas.push(
        notifee.createTriggerNotification(
          {
            id: notificationId,
            title: `💊 Hora de tomar: ${m.nome}`,
            body: m.dosagem || 'Não esqueça do seu remédio!',
            data: { medicamentoId: m.id, horarioPrevisto: dataHora.toISOString(), notificationId },
            android: {
              channelId: CANAL_ALARME_ID,
              category: AndroidCategory.ALARM,
              fullScreenAction: { id: 'tela-cheia-alarme' },
              pressAction: { id: 'default' },
              ongoing: true,
              autoCancel: false,
              loopSound: true,
              timeoutAfter: 30 * 60 * 1000,
            },
            ios: {
              critical: true,
              criticalVolume: 1.0,
              sound: 'alarme_remedio.wav',
              interruptionLevel: 'critical',
            },
          },
          trigger
        ).then(() => { agendados++; })
      );
    }
  }

  await Promise.all(promessas);
  return agendados;
}

export async function cancelarAlarmesDoMedicamento(medicamentoId: string): Promise<number> {
  try {
    const agendados = await notifee.getTriggerNotifications();
    const idsParaCancelar = agendados
      .filter((n) => n.notification.data?.medicamentoId === medicamentoId)
      .map((n) => n.notification.id!)
      .filter(Boolean);
    if (idsParaCancelar.length) {
      await notifee.cancelTriggerNotifications(idsParaCancelar);
    }
    return idsParaCancelar.length;
  } catch (err) {
    console.error('Erro ao cancelar alarmes:', err);
    return 0;
  }
}

export function registrarListenerDeAlarme(
  aoDispararAlarme: (medicamentoId: string, horarioPrevisto: string, notificationId: string) => void
) {
  return notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.DELIVERED || type === EventType.PRESS) {
      const data = detail.notification?.data;
      if (data?.medicamentoId) {
        aoDispararAlarme(
          data.medicamentoId as string,
          data.horarioPrevisto as string,
          (data.notificationId as string) || detail.notification?.id || ''
        );
      }
    }
  });
}

export function registrarBackgroundHandler(
  aoDispararAlarme: (medicamentoId: string, horarioPrevisto: string, notificationId: string) => void
) {
  notifee.onBackgroundEvent(async ({ type, detail }) => {
    if (type === EventType.DELIVERED || type === EventType.PRESS) {
      const data = detail.notification?.data;
      if (data?.medicamentoId) {
        aoDispararAlarme(
          data.medicamentoId as string,
          data.horarioPrevisto as string,
          (data.notificationId as string) || detail.notification?.id || ''
        );
      }
    }
    if (type === EventType.DISMISSED) {
      marcarTomadasPerdidas();
    }
  });
}

export async function pararAlarme(notificationId: string) {
  try {
    await notifee.stopForegroundService();
    await notifee.cancelNotification(notificationId);
  } catch (err) {
    console.error('Erro ao parar alarme:', err);
  }
}

export async function agendarAlarmeUnico(
  medicamentoId: string,
  nome: string,
  dosagem: string,
  minutos: number
): Promise<string> {
  const dataHora = new Date(Date.now() + minutos * 60 * 1000);
  const id = `${medicamentoId}-adiado-${Date.now()}`;

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: dataHora.getTime(),
    alarmManager: { allowWhileIdle: true },
  };

  await notifee.createTriggerNotification(
    {
      id,
      title: `⏰ Lembrete adiado: ${nome}`,
      body: dosagem || 'Não esqueça do seu remédio!',
      data: { medicamentoId, horarioPrevisto: dataHora.toISOString(), notificationId: id },
      android: {
        channelId: CANAL_ALARME_ID,
        category: AndroidCategory.ALARM,
        fullScreenAction: { id: 'tela-cheia-alarme' },
        pressAction: { id: 'default' },
        ongoing: true,
        autoCancel: false,
        loopSound: true,
        timeoutAfter: 30 * 60 * 1000,
      },
      ios: {
        critical: true,
        criticalVolume: 1.0,
        sound: 'alarme_remedio.wav',
        interruptionLevel: 'critical',
      },
    },
    trigger
  );

  return id;
}

export async function testarAlarmeReal() {
  await notifee.displayNotification({
    id: 'teste-alarme',
    title: '🔔 Teste de alarme',
    body: 'É assim que o alarme vai soar e aparecer em tela cheia.',
    android: {
      channelId: CANAL_ALARME_ID,
      category: AndroidCategory.ALARM,
      fullScreenAction: { id: 'tela-cheia-alarme' },
      ongoing: true,
      autoCancel: false,
      loopSound: true,
      pressAction: { id: 'default' },
    },
    ios: {
      sound: 'alarme_remedio.wav',
      critical: true,
      criticalVolume: 1.0,
      interruptionLevel: 'critical',
    },
  });
}
