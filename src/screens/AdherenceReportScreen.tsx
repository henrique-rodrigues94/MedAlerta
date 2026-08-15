import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { listarTodasTomadas } from '../db/database';
import { useAdherence } from '../hooks/useAdherence';
import { Tomada } from '../types';

export default function AdherenceReportScreen() {
  const [tomadas, setTomadas] = useState<Tomada[]>([]);

  useEffect(() => { setTomadas(listarTodasTomadas()); }, []);

  const stats = useAdherence(tomadas);
  const maxValor = Math.max(stats.totalTomadas, stats.totalAdiadas, stats.totalPerdidas, 1);

  const dados = [
    { label: 'Tomados', valor: stats.totalTomadas, cor: '#2ECC71' },
    { label: 'Adiados', valor: stats.totalAdiadas, cor: '#F39C12' },
    { label: 'Perdidos', valor: stats.totalPerdidas, cor: '#E74C3C' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.titulo}>📊 Relatório de Adesão</Text>
      <Text style={styles.subtitulo}>{stats.diasComDados} dias com registros</Text>

      <View style={styles.cardPrincipal}>
        <Text style={styles.taxaLabel}>Taxa de Adesão</Text>
        <Text style={styles.taxaValor}>{stats.taxaAdesao}%</Text>
        <View style={styles.barraFundo}>
          <View style={[styles.barraProgresso, { width: `${stats.taxaAdesao}%` }]} />
        </View>
        <Text style={styles.taxaDica}>
          {stats.taxaAdesao >= 90 ? '🎉 Excelente! Você está seguindo o tratamento muito bem.' :
           stats.taxaAdesao >= 70 ? '👍 Bom, mas ainda dá para melhorar.' :
           '⚠️ Atenção: procure organizar melhor seus horários.'}
        </Text>
      </View>

      <Text style={styles.secaoTitulo}>Resumo</Text>
      <View style={styles.resumoGrid}>
        <View style={[styles.resumoBox, { backgroundColor: '#E8F8F0' }]}>
          <Text style={[styles.resumoNumero, { color: '#2ECC71' }]}>{stats.totalTomadas}</Text>
          <Text style={styles.resumoTexto}>Tomados</Text>
        </View>
        <View style={[styles.resumoBox, { backgroundColor: '#FEF5E8' }]}>
          <Text style={[styles.resumoNumero, { color: '#F39C12' }]}>{stats.totalAdiadas}</Text>
          <Text style={styles.resumoTexto}>Adiados</Text>
        </View>
        <View style={[styles.resumoBox, { backgroundColor: '#FDEDEC' }]}>
          <Text style={[styles.resumoNumero, { color: '#E74C3C' }]}>{stats.totalPerdidas}</Text>
          <Text style={styles.resumoTexto}>Perdidos</Text>
        </View>
      </View>

      <Text style={styles.secaoTitulo}>Gráfico</Text>
      {dados.map((d) => (
        <View key={d.label} style={styles.graficoLinha}>
          <Text style={styles.graficoLabel}>{d.label}</Text>
          <View style={styles.graficoBarraContainer}>
            <View style={[styles.graficoBarra, { width: `${(d.valor / maxValor) * 100}%`, backgroundColor: d.cor, minWidth: d.valor > 0 ? 4 : 0 }]} />
          </View>
          <Text style={styles.graficoValor}>{d.valor}</Text>
        </View>
      ))}

      <Text style={styles.rodape}>
        💡 Dica: leve este relatório na próxima consulta médica para mostrar sua adesão ao tratamento.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB', padding: 20 },
  titulo: { fontSize: 28, fontWeight: '900', color: '#1E3A5F', marginTop: 10 },
  subtitulo: { fontSize: 14, color: '#5B6B7C', marginBottom: 20 },
  cardPrincipal: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 2 },
  taxaLabel: { fontSize: 16, color: '#5B6B7C', marginBottom: 8 },
  taxaValor: { fontSize: 56, fontWeight: '900', color: '#1E3A5F' },
  barraFundo: { width: '100%', height: 12, backgroundColor: '#EEF2F7', borderRadius: 6, marginTop: 12, overflow: 'hidden' },
  barraProgresso: { height: '100%', backgroundColor: '#2ECC71', borderRadius: 6 },
  taxaDica: { fontSize: 14, color: '#5B6B7C', marginTop: 14, textAlign: 'center', lineHeight: 20 },
  secaoTitulo: { fontSize: 18, fontWeight: '800', color: '#1E3A5F', marginBottom: 12, marginTop: 8 },
  resumoGrid: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  resumoBox: { flex: 1, borderRadius: 16, padding: 16, alignItems: 'center' },
  resumoNumero: { fontSize: 28, fontWeight: '900' },
  resumoTexto: { fontSize: 13, color: '#5B6B7C', marginTop: 4 },
  graficoLinha: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  graficoLabel: { width: 70, fontSize: 14, fontWeight: '600', color: '#1E3A5F' },
  graficoBarraContainer: { flex: 1, height: 20, backgroundColor: '#EEF2F7', borderRadius: 10, overflow: 'hidden', marginHorizontal: 10 },
  graficoBarra: { height: '100%', borderRadius: 10 },
  graficoValor: { width: 30, fontSize: 14, fontWeight: '700', color: '#1E3A5F', textAlign: 'right' },
  rodape: { fontSize: 13, color: '#118AB2', marginTop: 20, textAlign: 'center', lineHeight: 18 },
});
