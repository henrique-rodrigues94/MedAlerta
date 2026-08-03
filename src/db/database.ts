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
      ativo INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS tomadas (
      id TEXT PRIMARY KEY NOT NULL,
      medicamentoId TEXT NOT NULL,
      horarioPrevisto TEXT NOT NULL,
      horarioReal TEXT,
      status TEXT NOT NULL DEFAULT 'pendente',
      FOREIGN KEY (medicamentoId) REFERENCES medicamentos(id)
    );
  `);
}

export function salvarMedicamento(m: Medicamento) {
  db.runSync(
    `INSERT OR REPLACE INTO medicamentos
      (id, nome, dosagem, fotoUri, horarios, dataInicio, totalDias, cor, ativo)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      m.id,
      m.nome,
      m.dosagem,
      m.fotoUri,
      JSON.stringify(m.horarios),
      m.dataInicio,
      m.totalDias,
      m.cor,
      m.ativo ? 1 : 0,
    ]
  );
}

export function listarMedicamentos(): Medicamento[] {
  const rows = db.getAllSync<any>('SELECT * FROM medicamentos WHERE ativo = 1');
  return rows.map((r) => ({
    ...r,
    horarios: JSON.parse(r.horarios),
    ativo: !!r.ativo,
  }));
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
  return db.getAllSync<Tomada>(
    'SELECT * FROM tomadas WHERE medicamentoId = ? ORDER BY horarioPrevisto DESC',
    [medicamentoId]
  );
}
