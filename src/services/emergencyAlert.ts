import * as Linking from 'expo-linking';
import {
  buscarCuidador,
  buscarNomePaciente,
  alertasAtivos,
  normalizarTelefone,
} from './caregiver';

export interface DadosAlerta {
  nomeRemedio: string;
  dosagem: string;
  horarioPrevisto: string;
  horarioReal: string;
  vezesAdiado: number;
  motivo: 'nao_respondeu' | 'adiamentos_excessivos' | 'perdido';
}

/**
 * Verifica se deve enviar alerta e, se sim, abre o WhatsApp com mensagem pré-preenchida.
 * Retorna true se o alerta foi disparado, false se não havia cuidador ou alertas desativados.
 */
export async function dispararAlertaCuidador(dados: DadosAlerta): Promise<boolean> {
  const ativos = await alertasAtivos();
  if (!ativos) return false;

  const cuidador = await buscarCuidador();
  if (!cuidador) return false;

  const paciente = await buscarNomePaciente();
  const telefone = normalizarTelefone(cuidador.telefone);

  const mensagem = montarMensagem(paciente, cuidador.nome, dados);
  const url = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`;

  const podeAbrir = await Linking.canOpenURL(url);
  if (podeAbrir) {
    await Linking.openURL(url);
    return true;
  }

  // Fallback: tenta esquema nativo do WhatsApp
  const urlNativo = `whatsapp://send?phone=${telefone}&text=${encodeURIComponent(mensagem)}`;
  const podeNativo = await Linking.canOpenURL(urlNativo);
  if (podeNativo) {
    await Linking.openURL(urlNativo);
    return true;
  }

  return false;
}

function montarMensagem(
  paciente: string,
  nomeCuidador: string,
  dados: DadosAlerta
): string {
  const hora = new Date(dados.horarioPrevisto).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const data = new Date(dados.horarioPrevisto).toLocaleDateString('pt-BR');

  let emoji = '🚨';
  let motivoTexto = '';

  switch (dados.motivo) {
    case 'nao_respondeu':
      emoji = '⏰';
      motivoTexto = `não respondeu ao alarme do remédio`;
      break;
    case 'adiamentos_excessivos':
      emoji = '⚠️';
      motivoTexto = `adiou o remédio ${dados.vezesAdiado} vezes seguidas`;
      break;
    case 'perdido':
      emoji = '❌';
      motivoTexto = `perdeu o horário do remédio`;
      break;
  }

  return (
    `${emoji} *ALERTA MEDALERTA* ${emoji}

` +
    `Olá ${nomeCuidador},

` +
    `${paciente} ${motivoTexto} *"${dados.nomeRemedio}"* (${dados.dosagem || 'sem dosagem informada'}).

` +
    `📅 Data: ${data}
` +
    `⏰ Horário previsto: ${hora}
` +
    `${dados.vezesAdiado > 0 ? `🔄 Vezes adiado: ${dados.vezesAdiado}
` : ''}` +
    `
Por favor, verifique se ${paciente} está bem e se precisa de ajuda.

` +
    `_Mensagem automática enviada pelo app MedAlerta._`
  );
}

/**
 * Contador de adiamentos por remédio (persistido em memória durante a sessão).
 * Quando o app reinicia, o contador zera — isso é intencional, pois
 * o alerta de adiamentos excessivos se aplica à *sessão atual* de alarmes.
 */
const contadorAdiamentos: Record<string, number> = {};

export function incrementarAdiamento(medicamentoId: string): number {
  contadorAdiamentos[medicamentoId] = (contadorAdiamentos[medicamentoId] || 0) + 1;
  return contadorAdiamentos[medicamentoId];
}

export function resetarAdiamento(medicamentoId: string): void {
  delete contadorAdiamentos[medicamentoId];
}

export function obterAdiamentos(medicamentoId: string): number {
  return contadorAdiamentos[medicamentoId] || 0;
}

/** Limpa todos os contadores (útil ao reiniciar o app) */
export function limparTodosAdiamentos(): void {
  Object.keys(contadorAdiamentos).forEach((k) => delete contadorAdiamentos[k]);
}
