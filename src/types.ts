export interface Medicamento {
  id: string;
  nome: string;
  dosagem: string;
  fotoUri: string | null;
  horarios: string[];
  dataInicio: string;
  totalDias: number;
  cor: string;
  ativo: boolean;
  estoque?: number; // quantidade em comprimidos/ml
}

export interface Tomada {
  id: string;
  medicamentoId: string;
  horarioPrevisto: string;
  horarioReal: string | null;
  status: 'pendente' | 'tomado' | 'adiado' | 'perdido';
}

export interface EstatisticasAdesao {
  totalTomadas: number;
  totalAdiadas: number;
  totalPerdidas: number;
  totalPendentes: number;
  taxaAdesao: number;
  diasComDados: number;
}

export interface BackupDados {
  versao: string;
  dataExportacao: string;
  medicamentos: Medicamento[];
  tomadas: Tomada[];
}

/** Modo de operação do app */
export type AppMode = 'paciente' | 'cuidador' | null;

/** Dados de um cuidador vinculado (salvo no celular do paciente) */
export interface CuidadorVinculado {
  id: string;
  nome: string;
  expoPushToken: string;
  vinculadoEm: string;
}

/** Dados de um paciente vinculado (salvo no celular do cuidador) */
export interface PacienteVinculado {
  id: string;
  nome: string;
  expoPushToken: string;
  vinculadoEm: string;
  ultimoStatus?: 'tomado' | 'adiado' | 'perdido' | 'pendente';
  ultimoRemedio?: string;
  ultimaAtualizacao?: string;
}

/** Payload enviado via push notification entre paciente e cuidador */
export interface SyncPayload {
  tipo: 'vinculacao' | 'alerta' | 'status' | 'estoque_baixo';
  pacienteId?: string;
  pacienteNome?: string;
  cuidadorId?: string;
  cuidadorNome?: string;
  medicamentoNome?: string;
  dosagem?: string;
  horario?: string;
  status?: string;
  vezesAdiado?: number;
  estoqueAtual?: number;
  mensagem?: string;
}
