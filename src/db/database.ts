import * as SQLite from 'expo-sqlite';
import { Medicamento, Tomada } from '../types';

const db = SQLite.openDatabaseSync('medalerta.db');

export function iniciarBanco() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS medicamentos (
      id TEXT PRIMARY KEY NOT NULL,
      nome TEXT NOT NULL,
      dosagem TEXT,
      fotoUri TEXT,
      horarios TEXT NOT NULL,
      dataInicio TEXT NOT NULL,
      totalDias INTEGER NOT NULL,
      cor TEXT NOT NULL,
      ativo INTEGER NOT NULL DEFAULT 1,
      estoque INTEGER
    );
    CREATE TABLE IF NOT EXISTS tomadas (
      id TEXT PRIMARY KEY NOT NULL,
      medicamentoId TEXT NOT NULL,
      horarioPrevisto TEXT NOT NULL,
      horarioReal TEXT,
      status TEXT NOT NULL DEFAULT 'pendente',
      FOREIGN KEY (medicamentoId) REFERENCES medicamentos(id)
    );
    CREATE INDEX IF NOT EXISTS idx_tomadas_medicamento ON tomadas(medicamentoId);
    CREATE INDEX IF NOT EXISTS idx_tomadas_status ON tomadas(status);
  `);
}

export function salvarMedicamento(m: Medicamento) {
  db.runSync(
    `INSERT OR REPLACE INTO medicamentos
     (id, nome, dosagem, fotoUri, horarios, dataInicio, totalDias, cor, ativo, estoque)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [m.id, m.nome, m.dosagem, m.fotoUri, JSON.stringify(m.horarios), m.dataInicio, m.totalDias, m.cor, m.ativo ? 1 : 0, m.estoque ?? null]
  );
}

export function listarMedicamentos(): Medicamento[] {
  const rows = db.getAllSync('SELECT * FROM medicamentos WHERE ativo = 1 ORDER BY nome COLLATE NOCASE');
  return rows.map((r: any) => ({
    id: r.id, nome: r.nome, dosagem: r.dosagem, fotoUri: r.fotoUri,
    horarios: JSON.parse(r.horarios), dataInicio: r.dataInicio,
    totalDias: r.totalDias, cor: r.cor, ativo: !!r.ativo, estoque: r.estoque,
  }));
}

export function buscarMedicamentoPorId(id: string): Medicamento | null {
  const rows = db.getAllSync('SELECT * FROM medicamentos WHERE id = ? AND ativo = 1', [id]);
  if (rows.length === 0) return null;
  const r = rows[0] as any;
  return {
    id: r.id, nome: r.nome, dosagem: r.dosagem, fotoUri: r.fotoUri,
    horarios: JSON.parse(r.horarios), dataInicio: r.dataInicio,
    totalDias: r.totalDias, cor: r.cor, ativo: !!r.ativo, estoque: r.estoque,
  };
}

export function removerMedicamento(id: string) {
  db.runSync('UPDATE medicamentos SET ativo = 0 WHERE id = ?', [id]);
}

export function registrarTomada(t: Tomada) {
  db.runSync(
    `INSERT OR REPLACE INTO tomadas (id, medicamentoId, horarioPrevisto, horarioReal, status)
     VALUES (?, ?, ?, ?, ?)`,
    [t.id, t.medicamentoId, t.horarioPrevisto, t.horarioReal, t.status]
  );
}

export function historicoDoMedicamento(medicamentoId: string): Tomada[] {
  return db.getAllSync('SELECT * FROM tomadas WHERE medicamentoId = ? ORDER BY horarioPrevisto DESC', [medicamentoId]) as Tomada[];
}

export function listarTodasTomadas(): Tomada[] {
  return db.getAllSync(`SELECT t.*, m.nome as medicamentoNome FROM tomadas t JOIN medicamentos m ON t.medicamentoId = m.id ORDER BY t.horarioPrevisto DESC`) as Tomada[];
}

export function contarTomadasPorStatus(medicamentoId?: string): Record<string, number> {
  let query = 'SELECT status, COUNT(*) as total FROM tomadas';
  const params: any[] = [];
  if (medicamentoId) { query += ' WHERE medicamentoId = ?'; params.push(medicamentoId); }
  query += ' GROUP BY status';
  const rows = db.getAllSync(query, params) as any[];
  const resultado: Record<string, number> = { pendente: 0, tomado: 0, adiado: 0, perdido: 0 };
  for (const r of rows) resultado[r.status] = r.total;
  return resultado;
}

export function marcarTomadasPerdidas() {
  const limite = new Date(Date.now() - 30 * 60 * 1000);
  db.runSync(`UPDATE tomadas SET status = 'perdido' WHERE status = 'pendente' AND horarioPrevisto < ?`, [limite.toISOString()]);
}

export function decrementarEstoque(medicamentoId: string): number | null {
  db.runSync('UPDATE medicamentos SET estoque = estoque - 1 WHERE id = ? AND estoque > 0', [medicamentoId]);
  const rows = db.getAllSync('SELECT estoque FROM medicamentos WHERE id = ?', [medicamentoId]) as any[];
  return rows.length > 0 ? rows[0].estoque : null;
}
