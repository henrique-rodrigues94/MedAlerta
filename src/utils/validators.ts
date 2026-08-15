export function validarHorario(horario: string): boolean {
  if (!horario || typeof horario !== 'string') return false;
  const regex = /^([01]?\d|2[0-3]):([0-5]\d)$/;
  return regex.test(horario);
}

export function normalizarHorario(horario: string): string {
  const partes = horario.split(':');
  if (partes.length !== 2) return horario;
  const h = partes[0].padStart(2, '0');
  const m = partes[1].padStart(2, '0');
  return `${h}:${m}`;
}

export function formatarData(dataISO: string): string {
  const d = new Date(dataISO);
  if (isNaN(d.getTime())) return dataISO;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatarHorario(dataISO: string): string {
  const d = new Date(dataISO);
  if (isNaN(d.getTime())) return dataISO;
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function gerarId(prefixo: string = 'id'): string {
  return `${prefixo}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function gerarCodigoVinculacao(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let codigo = '';
  for (let i = 0; i < 6; i++) {
    codigo += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return codigo;
}
