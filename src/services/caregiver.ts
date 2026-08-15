import AsyncStorage from '@react-native-async-storage/async-storage';

const CHAVE_CUIDADOR = '@medalerta:cuidador';
const CHAVE_PACIENTE = '@medalerta:paciente';
const CHAVE_ALERTAS_ATIVOS = '@medalerta:alertas_ativos';

export interface Cuidador {
  nome: string;
  telefone: string; // com DDD, ex: 5511999999999
}

/** Salva os dados do cuidador */
export async function salvarCuidador(cuidador: Cuidador): Promise<void> {
  await AsyncStorage.setItem(CHAVE_CUIDADOR, JSON.stringify(cuidador));
}

/** Busca os dados do cuidador */
export async function buscarCuidador(): Promise<Cuidador | null> {
  const json = await AsyncStorage.getItem(CHAVE_CUIDADOR);
  return json ? JSON.parse(json) : null;
}

/** Remove o cuidador */
export async function removerCuidador(): Promise<void> {
  await AsyncStorage.removeItem(CHAVE_CUIDADOR);
}

/** Salva o nome do paciente */
export async function salvarNomePaciente(nome: string): Promise<void> {
  await AsyncStorage.setItem(CHAVE_PACIENTE, nome.trim());
}

/** Busca o nome do paciente */
export async function buscarNomePaciente(): Promise<string> {
  return (await AsyncStorage.getItem(CHAVE_PACIENTE)) || 'O paciente';
}

/** Verifica se alertas estão ativados */
export async function alertasAtivos(): Promise<boolean> {
  const valor = await AsyncStorage.getItem(CHAVE_ALERTAS_ATIVOS);
  return valor !== 'false'; // padrão: true
}

export async function setAlertasAtivos(ativo: boolean): Promise<void> {
  await AsyncStorage.setItem(CHAVE_ALERTAS_ATIVOS, String(ativo));
}

/** Valida número de telefone brasileiro (com ou sem +55) */
export function validarTelefone(telefone: string): boolean {
  const limpo = telefone.replace(/\D/g, '');
  // Deve ter 11 dígitos (com DDD) ou 13 (com 55)
  return limpo.length === 11 || limpo.length === 13;
}

/** Normaliza telefone para formato internacional sem + */
export function normalizarTelefone(telefone: string): string {
  const limpo = telefone.replace(/\D/g, '');
  if (limpo.length === 11) return `55${limpo}`;
  return limpo;
}
