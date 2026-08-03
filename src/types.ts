export interface Medicamento {
  id: string;
  nome: string;
  dosagem: string;       // ex: "1 comprimido", "10 ml"
  fotoUri: string | null;
  horarios: string[];    // ["08:00", "14:00", "20:00"]
  dataInicio: string;    // ISO date
  totalDias: number;     // quantos dias de tratamento
  cor: string;           // cor de destaque do card
  ativo: boolean;
}

export interface Tomada {
  id: string;
  medicamentoId: string;
  horarioPrevisto: string; // ISO datetime
  horarioReal: string | null;
  status: 'pendente' | 'tomado' | 'adiado' | 'perdido';
}
