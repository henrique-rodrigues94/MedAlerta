import * as SQLite from 'expo-sqlite';
import { Medicamento, ProjecaoEstoque } from '../types';

const db = SQLite.openDatabaseSync('medalerta.db');

function ensureColumns() {
  const cols = db.getAllSync('PRAGMA table_info(medicamentos)') as any[];
  const add = (name: string, definition: string) => {
    if (!cols.some((c) => c.name === name)) db.execSync(`ALTER TABLE medicamentos ADD COLUMN ${name} ${definition}`);
  };
  add('unidadeEstoque', "TEXT DEFAULT 'unidades'");
  add('quantidadePorDose', 'REAL DEFAULT 1');
  add('estoqueMinimo', 'REAL DEFAULT 0');
  add('observacoes', 'TEXT');
}

export function inicializarEstoque() { ensureColumns(); }

export function salvarParametrosEstoque(id: string, unidade: string, quantidadePorDose: number, estoqueMinimo: number) {
  ensureColumns();
  db.runSync('UPDATE medicamentos SET unidadeEstoque=?, quantidadePorDose=?, estoqueMinimo=? WHERE id=?', [
    unidade || 'unidades', Math.max(0.01, Number(quantidadePorDose) || 1), Math.max(0, Number(estoqueMinimo) || 0), id,
  ]);
}

export function adicionarAoEstoque(id: string, quantidade: number) {
  ensureColumns();
  db.runSync('UPDATE medicamentos SET estoque=COALESCE(estoque,0)+? WHERE id=?', [Math.max(0, Number(quantidade) || 0), id]);
}

export function definirEstoque(id: string, quantidade: number) {
  ensureColumns();
  db.runSync('UPDATE medicamentos SET estoque=? WHERE id=?', [Math.max(0, Number(quantidade) || 0), id]);
}

function consumoDiario(m: Medicamento): number {
  const porDose = Math.max(0.01, Number((m as any).quantidadePorDose) || 1);
  return Math.max(0, m.horarios.length * porDose);
}

export function calcularProjecao(m: Medicamento): ProjecaoEstoque {
  const estoque = m.estoque == null ? null : Math.max(0, Number(m.estoque));
  const consumo = consumoDiario(m);
  const unidade = (m as any).unidadeEstoque || 'unidades';
  const minimo = Math.max(0, Number((m as any).estoqueMinimo) || 0);
  if (estoque == null || consumo <= 0) return { medicamentoId:m.id, estoqueAtual:estoque ?? 0, unidade, consumoDiario:consumo, diasRestantes:null, dataEstimadaFim:null, estoqueMinimo:minimo, diasAteEstoqueMinimo:null, status:'sem_dados' };
  const dias = estoque / consumo;
  const dataFim = new Date(); dataFim.setTime(dataFim.getTime() + dias * 86400000);
  const diasMin = minimo >= estoque ? 0 : (estoque - minimo) / consumo;
  let status: ProjecaoEstoque['status'] = 'normal';
  if (estoque <= 0) status = 'sem_estoque';
  else if (dias <= 3 || estoque <= minimo) status = 'critico';
  else if (dias <= 7 || estoque <= minimo + consumo * 7) status = 'atencao';
  return { medicamentoId:m.id, estoqueAtual:estoque, unidade, consumoDiario:consumo, diasRestantes:dias, dataEstimadaFim:dataFim.toISOString(), estoqueMinimo:minimo, diasAteEstoqueMinimo:diasMin, status };
}

export function listarProjecoes(): ProjecaoEstoque[] {
  ensureColumns();
  const rows = db.getAllSync('SELECT * FROM medicamentos WHERE ativo=1 ORDER BY nome COLLATE NOCASE') as any[];
  return rows.map((r) => calcularProjecao({
    id:r.id, nome:r.nome, dosagem:r.dosagem||'', fotoUri:r.fotoUri, horarios:JSON.parse(r.horarios), dataInicio:r.dataInicio,
    totalDias:r.totalDias, cor:r.cor, ativo:!!r.ativo, estoque:r.estoque == null ? undefined : Number(r.estoque),
    unidadeEstoque:r.unidadeEstoque||'unidades', quantidadePorDose:Number(r.quantidadePorDose||1), estoqueMinimo:Number(r.estoqueMinimo||0), observacoes:r.observacoes||undefined,
  }));
}

export function formatarDias(dias: number | null): string {
  if (dias == null) return 'Sem projeção';
  if (dias <= 0) return 'Acabou';
  if (dias < 1) return 'menos de 1 dia';
  return `${Math.ceil(dias)} dia${Math.ceil(dias) === 1 ? '' : 's'}`;
}
