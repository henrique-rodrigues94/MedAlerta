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
  estoque?: number;
  unidadeEstoque?: string;
  quantidadePorDose?: number;
  estoqueMinimo?: number;
  observacoes?: string;
}

export interface Tomada {
  id: string;
  medicamentoId: string;
  horarioPrevisto: string;
  horarioReal: string | null;
  status: 'pendente' | 'tomado' | 'adiado' | 'perdido';
  quantidadeConsumida?: number;
}

export interface EstatisticasAdesao { totalTomadas:number; totalAdiadas:number; totalPerdidas:number; totalPendentes:number; taxaAdesao:number; diasComDados:number; }
export interface BackupDados { versao:string; dataExportacao:string; medicamentos:Medicamento[]; tomadas:Tomada[]; }
export type AppMode = 'paciente' | 'cuidador' | null;
export interface CuidadorVinculado { id:string; nome:string; expoPushToken:string; vinculadoEm:string; }
export interface PacienteVinculado { id:string; nome:string; expoPushToken:string; vinculadoEm:string; ultimoStatus?:'tomado'|'adiado'|'perdido'|'pendente'; ultimoRemedio?:string; ultimaAtualizacao?:string; }
export interface SyncPayload { tipo:'vinculacao'|'alerta'|'status'|'estoque_baixo'; pacienteId?:string; pacienteNome?:string; cuidadorId?:string; cuidadorNome?:string; cuidadorToken?:string; medicamentoNome?:string; dosagem?:string; horario?:string; status?:string; vezesAdiado?:number; estoqueAtual?:number; mensagem?:string; }
export interface ProjecaoEstoque { medicamentoId:string; estoqueAtual:number; unidade:string; consumoDiario:number; diasRestantes:number|null; dataEstimadaFim:string|null; estoqueMinimo:number; diasAteEstoqueMinimo:number|null; status:'normal'|'atencao'|'critico'|'sem_estoque'|'sem_dados'; }
