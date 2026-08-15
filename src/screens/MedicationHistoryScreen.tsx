import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { historicoDoMedicamento, buscarMedicamentoPorId } from '../db/database';
import { Tomada, Medicamento } from '../types';
import { formatarData, formatarHorario } from '../utils/validators';

export default function MedicationHistoryScreen() {
  const route = useRoute<any>();
  const { medicamentoId } = route.params;
  const [tomadas, setTomadas] = useState<Tomada[]>([]);
  const [medicamento, setMedicamento] = useState<Medicamento | null>(null);

  useEffect(() => {
    setMedicamento(buscarMedicamentoPorId(medicamentoId));
    setTomadas(historicoDoMedicamento(medicamentoId));
  }, [medicamentoId]);

  function corStatus(status: string): string {
    switch (status) { case 'tomado': return '#2ECC71'; case 'adiado': return '#F39C12'; case 'perdido': return '#E74C3C'; default: return '#5B6B7C'; }
  }

  function textoStatus(status: string): string {
    switch (status) { case 'tomado': return '✓ Tomado'; case 'adiado': return '⏰ Adiado'; case 'perdido': return '✗ Perdido'; default: return '⏳ Pendente'; }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>📋 Histórico</Text>
      {medicamento && <Text style={styles.subtitulo}>{medicamento.nome} — {medicamento.dosagem}</Text>}

      {tomadas.length === 0 ? (
        <View style={styles.vazio}><Text style={styles.vazioTexto}>Nenhum registro ainda.</Text></View>
      ) : (
        <FlatList
          data={tomadas}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.item}>
              <View style={styles.itemHeader}>
                <Text style={styles.itemData}>{formatarData(item.horarioPrevisto)}</Text>
                <Text style={[styles.itemStatus, { color: corStatus(item.status) }]}>{textoStatus(item.status)}</Text>
              </View>
              <Text style={styles.itemHorario}>
                Previsto: {formatarHorario(item.horarioPrevisto)}
                {item.horarioReal ? `  •  Real: ${formatarHorario(item.horarioReal)}` : ''}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB', padding: 20 },
  titulo: { fontSize: 28, fontWeight: '900', color: '#1E3A5F', marginTop: 10 },
  subtitulo: { fontSize: 16, color: '#5B6B7C', marginBottom: 16 },
  vazio: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  vazioTexto: { fontSize: 18, color: '#5B6B7C' },
  item: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 14, marginBottom: 10 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  itemData: { fontSize: 16, fontWeight: '700', color: '#1E3A5F' },
  itemStatus: { fontSize: 14, fontWeight: '700' },
  itemHorario: { fontSize: 14, color: '#5B6B7C' },
});
