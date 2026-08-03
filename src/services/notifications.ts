import notifee, {
  AndroidImportance,
  AndroidCategory,
  AndroidVisibility,
  TriggerType,
  TimestampTrigger,
  EventType,
  AuthorizationStatus,
} from '@notifee/react-native';
import { addDays, parse, setHours, setMinutes, isBefore } from 'date-fns';
import { Medicamento } from '../types';

// IMPORTANTE (Android): usamos um canal com som próprio e "usage: ALARM".
// É esse atributo de áudio que faz o toque IGNORAR o modo silencioso/vibrar,
// exatamente como um despertador nativo faz. Sem isso, notificação comum
// respeita o silencioso.
const CANAL_ALARME_ID = 'alarme-remedio';

export async function configurarCanalDeAlarme() {
  await notifee.requestPermission({
    // No iOS isso pede permissão de notificação normal.
    // "criticalAlert: true" só funciona se a entitlement da Apple foi aprovada
    // (ver README). Sem aprovação, o iOS ignora essa flag silenciosamente.
    critical: true,
    sound: true,
    alert: true,
  } as any);

  await notifee.createChannel({
    id: CANAL_ALARME_ID,
    name: 'Alarme de Remédio',
    importance: AndroidImportance.HIGH,
    visibility: AndroidVisibility.PUBLIC,
    sound: 'alarme_remedio', // arquivo em android/app/src/main/res/raw/alarme_remedio.mp3
    vibration: true,
    vibrationPattern: [300, 500, 300, 500, 300, 900], // padrão próprio, diferente do padrão do celular
    bypassDnd: true, // ignora "Não perturbe"
  });
}

/** Gera todos os horários de alarme de um medicamento e agenda cada um. */
export async function agendarMedicamento(m: Medicamento) {
  const inicio = new Date(m.dataInicio);

  for (let dia = 0; dia < m.totalDias; dia++) {
    const dataBase = addDays(inicio, dia);

    for (const horario of m.horarios) {
      const [h, min] = horario.split(':').map(Number);
      let dataHora = setMinutes(setHours(dataBase, h), min);

      // não agenda coisas no passado
      if (isBefore(dataHora, new Date())) continue;

      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: dataHora.getTime(),
        alarmManager: {
          allowWhileIdle: true, // dispara mesmo com o celular economizando bateria
        },
      };

      await notifee.createTriggerNotification(
        {
          id: `${m.id}-${dataHora.getTime()}`,
          title: `💊 Hora de tomar: ${m.nome}`,
          body: m.dosagem,
          data: {
            medicamentoId: m.id,
            horarioPrevisto: dataHora.toISOString(),
          },
          android: {
            channelId: CANAL_ALARME_ID,
            category: AndroidCategory.ALARM,
            fullScreenAction: {
              id: 'tela-cheia-alarme', // abre a AlarmScreen em tela cheia, mesmo com celular bloqueado
            },
            pressAction: { id: 'default' },
            ongoing: true,
            autoCancel: false,
            loopSound: true,
          },
          ios: {
            critical: true,
            criticalVolume: 1.0,
            sound: 'alarme_remedio.wav', // arquivo adicionado ao projeto iOS
            interruptionLevel: 'critical',
          },
        },
        trigger
      );
    }
  }
}

export async function cancelarAlarmesDoMedicamento(medicamentoId: string) {
  const agendados = await notifee.getTriggerNotifications();
  const idsParaCancelar = agendados
    .filter((n) => n.notification.data?.medicamentoId === medicamentoId)
    .map((n) => n.notification.id!)
    .filter(Boolean);
  if (idsParaCancelar.length) {
    await notifee.cancelTriggerNotifications(idsParaCancelar);
  }
}

/** Registra o listener que abre a tela de alarme quando a notificação dispara. */
export function registrarListenerDeAlarme(
  aoDispararAlarme: (medicamentoId: string, horarioPrevisto: string) => void
) {
  return notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.DELIVERED || type === EventType.PRESS) {
      const data = detail.notification?.data;
      if (data?.medicamentoId) {
        aoDispararAlarme(data.medicamentoId as string, data.horarioPrevisto as string);
      }
    }
  });
}

export async function pararAlarme(notificationId: string) {
  await notifee.stopForegroundService();
  await notifee.cancelNotification(notificationId);
}
