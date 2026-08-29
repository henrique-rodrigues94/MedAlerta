import { addDays, differenceInCalendarDays, format } from 'date-fns';
import { Medicamento, ProjecaoEstoque } from '../types';

export function calcularProjecaoEstoque(medicamento: Medicamento, hoje = new Date()): ProjecaoEstoque {
  const estoqueAtual = Math.max(0, Number(medicamento.estoque ?? 0));
  const quantidadePorDose = Number(medicamento.quantidadePorDose ?? 0);
  const dosesPorDia = medicamento.horarios?.length ?? 0;
  const consumoDiario = quantidadePorDose > 0 && dosesPorDia > 0 ? quantidadePorDose * dosesPorDia : 0;
  const estoqueMinimo = Math.max(0, Number(medicamento.estoqueMinimo ?? 0));

  if (estoqueAtual <= 0) return { medicamentoId: medicamento.id, estoqueAtual, unidade: medicamento.unidadeEstoque || 'unid.', consumoDiario, diasRestantes: 0, dataEstimadaFim: format(hoje, 'dd/MM/yyyy'), estoqueMinimo, diasAteEstoqueMinimo: 0, status: 'sem_estoque' };
  if (consumoDiario <= 0) return { medicamentoId: medicamento.id, estoqueAtual, unidade: medicamento.unidadeEstoque || 'unid.', consumoDiario, diasRestantes: null, dataEstimadaFim: null, estoqueMinimo, diasAteEstoqueMinimo: null, status: 'sem_dados' };

  const diasRestantes = Math.max(0, Math.ceil(estoqueAtual / consumoDiario));
  const dataFim = addDays(hoje, Math.max(0, diasRestantes - 1));
  const diasAteMinimo = estoqueAtual > estoqueMinimo ? Math.ceil((estoqueAtual - estoqueMinimo) / consumoDiario) : 0;
  const status = estoqueAtual <= estoqueMinimo ? 'critico' : diasRestantes <= 3 ? 'critico' : diasRestantes <= 7 ? 'atencao' : 'normal';

  return { medicamentoId: medicamento.id, estoqueAtual, unidade: medicamento.unidadeEstoque || 'unid.', consumoDiario, diasRestantes, dataEstimadaFim: format(dataFim, 'dd/MM/yyyy'), estoqueMinimo, diasAteEstoqueMinimo, status };
}

export function calcularAdesao(tomado: number, adiado: number, perdido: number): number {
  const total = tomado + adiado + perdido;
  return total > 0 ? Math.round((tomado / total) * 100) : 0;
}
