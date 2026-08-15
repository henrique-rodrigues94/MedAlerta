import AsyncStorage from '@react-native-async-storage/async-storage';
import { CuidadorVinculado, PacienteVinculado, SyncPayload } from '../types';
import { gerarId, gerarCodigoVinculacao } from '../utils/validators';

const CHAVE_CUIDADORES = '@medalerta:cuidadores';
const CHAVE_PACIENTES = '@medalerta:pacientes';
const CHAVE_CODIGO_PACIENTE = '@medalerta:codigo_paciente';
const CHAVE_NOME_PACIENTE = '@medalerta:nome_paciente';

// ========== PACIENTE ==========

export async function salvarCuidador(cuidador: CuidadorVinculado): Promise<void> {
  const existentes = await listarCuidadores();
  const filtrados = existentes.filter((c) => c.id !== cuidador.id);
  filtrados.push(cuidador);
  await AsyncStorage.setItem(CHAVE_CUIDADORES, JSON.stringify(filtrados));
}

export async function listarCuidadores(): Promise<CuidadorVinculado[]> {
  const json = await AsyncStorage.getItem(CHAVE_CUIDADORES);
  return json ? JSON.parse(json) : [];
}

export async function removerCuidador(id: string): Promise<void> {
  const existentes = await listarCuidadores();
  const filtrados = existentes.filter((c) => c.id !== id);
  await AsyncStorage.setItem(CHAVE_CUIDADORES, JSON.stringify(filtrados));
}

export async function gerarCodigoPaciente(): Promise<string> {
  const codigo = gerarCodigoVinculacao();
  await AsyncStorage.setItem(CHAVE_CODIGO_PACIENTE, codigo);
  return codigo;
}

export async function obterCodigoPaciente(): Promise<string | null> {
  return AsyncStorage.getItem(CHAVE_CODIGO_PACIENTE);
}

export async function salvarNomePaciente(nome: string): Promise<void> {
  await AsyncStorage.setItem(CHAVE_NOME_PACIENTE, nome.trim());
}

export async function obterNomePaciente(): Promise<string> {
  return (await AsyncStorage.getItem(CHAVE_NOME_PACIENTE)) || 'Paciente';
}

// ========== CUIDADOR ==========

export async function salvarPaciente(paciente: PacienteVinculado): Promise<void> {
  const existentes = await listarPacientes();
  const filtrados = existentes.filter((p) => p.id !== paciente.id);
  filtrados.push(paciente);
  await AsyncStorage.setItem(CHAVE_PACIENTES, JSON.stringify(filtrados));
}

export async function listarPacientes(): Promise<PacienteVinculado[]> {
  const json = await AsyncStorage.getItem(CHAVE_PACIENTES);
  return json ? JSON.parse(json) : [];
}

export async function removerPaciente(id: string): Promise<void> {
  const existentes = await listarPacientes();
  const filtrados = existentes.filter((p) => p.id !== id);
  await AsyncStorage.setItem(CHAVE_PACIENTES, JSON.stringify(filtrados));
}

export async function atualizarStatusPaciente(
  pacienteId: string,
  status: string,
  remedio?: string
): Promise<void> {
  const pacientes = await listarPacientes();
  const idx = pacientes.findIndex((p) => p.id === pacienteId);
  if (idx >= 0) {
    pacientes[idx].ultimoStatus = status as any;
    pacientes[idx].ultimoRemedio = remedio;
    pacientes[idx].ultimaAtualizacao = new Date().toISOString();
    await AsyncStorage.setItem(CHAVE_PACIENTES, JSON.stringify(pacientes));
  }
}

// ========== ENVIO DE PUSH ==========

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

/**
 * Envia uma notificação push para um ou mais tokens Expo.
 * Usado tanto pelo paciente (alertar cuidador) quanto pelo cuidador (confirmar vinculação).
 */
export async function enviarPush(
  tokens: string[],
  title: string,
  body: string,
  data: SyncPayload
): Promise<boolean> {
  try {
    const messages = tokens.map((token) => ({
      to: token,
      sound: 'default',
      title,
      body,
      data,
      priority: 'high',
      channelId: 'medalerta-sync',
    }));

    const response = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const json = await response.json();
    return json.data?.every((item: any) => item.status === 'ok') ?? false;
  } catch (err) {
    console.error('Erro ao enviar push:', err);
    return false;
  }
}

/**
 * Paciente envia alerta para todos os cuidadores vinculados.
 */
export async function alertarCuidadores(payload: {
  medicamentoNome: string;
  dosagem: string;
  horario: string;
  motivo: 'nao_respondeu' | 'adiamentos_excessivos' | 'perdido';
  vezesAdiado?: number;
}): Promise<boolean> {
  const cuidadores = await listarCuidadores();
  if (cuidadores.length === 0) return false;

  const pacienteNome = await obterNomePaciente();
  const tokens = cuidadores.map((c) => c.expoPushToken);

  let titulo = '🚨 MedAlerta';
  let corpo = '';

  if (payload.motivo === 'adiamentos_excessivos') {
    titulo = '⚠️ Adiamentos Excessivos';
    corpo = `${pacienteNome} adiou "${payload.medicamentoNome}" ${payload.vezesAdiado}x seguidas.`;
  } else if (payload.motivo === 'perdido') {
    titulo = '❌ Remédio Perdido';
    corpo = `${pacienteNome} não respondeu ao alarme de "${payload.medicamentoNome}".`;
  } else {
    titulo = '⏰ Alarme Sem Resposta';
    corpo = `${pacienteNome} não confirmou a tomada de "${payload.medicamentoNome}".`;
  }

  return enviarPush(tokens, titulo, corpo, {
    tipo: 'alerta',
    pacienteNome,
    medicamentoNome: payload.medicamentoNome,
    dosagem: payload.dosagem,
    horario: payload.horario,
    status: payload.motivo === 'perdido' ? 'perdido' : 'adiado',
    vezesAdiado: payload.vezesAdiado,
  });
}

/**
 * Paciente notifica cuidadores que tomou o remédio.
 */
export async function notificarTomada(
  medicamentoNome: string,
  dosagem: string,
  horario: string
): Promise<boolean> {
  const cuidadores = await listarCuidadores();
  if (cuidadores.length === 0) return false;

  const pacienteNome = await obterNomePaciente();
  const tokens = cuidadores.map((c) => c.expoPushToken);

  return enviarPush(
    tokens,
    '✅ Remédio Tomado',
    `${pacienteNome} tomou "${medicamentoNome}" (${dosagem}) às ${new Date(horario).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}.`,
    {
      tipo: 'status',
      pacienteNome,
      medicamentoNome,
      dosagem,
      horario,
      status: 'tomado',
    }
  );
}

/**
 * Cuidador responde à vinculação enviando seus dados para o paciente.
 */
export async function cuidadorConfirmarVinculacao(
  pacienteToken: string,
  cuidadorNome: string,
  cuidadorToken: string
): Promise<boolean> {
  return enviarPush(
    [pacienteToken],
    '👨‍⚕️ Cuidador Vinculado',
    `${cuidadorNome} aceitou ser seu cuidador no MedAlerta.`,
    {
      tipo: 'vinculacao',
      cuidadorNome,
      cuidadorId: gerarId('cuid'),
      cuidadorToken,
    }
  );
}
