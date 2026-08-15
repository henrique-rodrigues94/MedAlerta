import { useMemo } from 'react';
import { EstatisticasAdesao, Tomada } from '../types';

export function useAdherence(tomadas: Tomada[]): EstatisticasAdesao {
  return useMemo(() => {
    const totalTomadas = tomadas.length;
    const tomado = tomadas.filter((t) => t.status === 'tomado').length;
    const adiado = tomadas.filter((t) => t.status === 'adiado').length;
    const perdido = tomadas.filter((t) => t.status === 'perdido').length;
    const pendente = tomadas.filter((t) => t.status === 'pendente').length;
    const base = tomado + perdido + adiado;
    const taxaAdesao = base > 0 ? Math.round((tomado / base) * 100) : 0;
    const dias = new Set(tomadas.map((t) => t.horarioPrevisto.slice(0, 10)));
    return { totalTomadas, totalAdiadas: adiado, totalPerdidas: perdido, totalPendentes: pendente, taxaAdesao, diasComDados: dias.size };
  }, [tomadas]);
}
