import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Medicamento } from '../types';

interface Props {
  medicamento: Medicamento;
  proximoHorario: string;
  onPress: () => void;
  onExcluir: () => void;
  onVerHistorico: () => void;
}

export default function MedicationCard({ medicamento, proximoHorario, onPress, onExcluir, onVerHistorico }: Props) {
  const estoqueBaixo = medicamento.estoque !== undefined && medicamento.estoque !== null && medicamento.estoque <= 3 && medicamento.estoque > 0;
  const semEstoque = medicamento.estoque !== undefined && medicamento.estoque !== null && medicamento.estoque <= 0;

  return (
    <Pressable onPress={onPress} style={[styles.card, { borderLeftColor: medicamento.cor }]}>
      {medicamento.fotoUri ? (
        <Image source={{ uri: medicamento.fotoUri }} style={styles.foto} />
      ) : (
        <View style={[styles.foto, styles.fotoPlaceholder]}>
          <Text style={{ fontSize: 28 }}>💊</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.nome}>{medicamento.nome}</Text>
        <Text style={styles.dosagem}>{medicamento.dosagem}</Text>
        <Text style={styles.horario}>Próximo: {proximoHorario}</Text>
        {estoqueBaixo && <Text style={styles.estoqueAlerta}>📦 Estoque baixo: {medicamento.estoque}</Text>}
        {semEstoque && <Text style={styles.estoqueCritico}>📦 Sem estoque!</Text>}
      </View>

      <View style={styles.acoes}>
        <Pressable onPress={onVerHistorico} style={styles.acaoBtn}>
          <Text style={styles.acaoTexto}>📋</Text>
        </Pressable>
        <Pressable onPress={onExcluir} style={styles.acaoBtn}>
          <Text style={styles.excluir}>✕</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderRadius: 18, padding: 14, marginBottom: 14, borderLeftWidth: 8,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  foto: { width: 60, height: 60, borderRadius: 12, marginRight: 14 },
  fotoPlaceholder: { backgroundColor: '#EEF2F7', alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  nome: { fontSize: 20, fontWeight: '800', color: '#1E3A5F' },
  dosagem: { fontSize: 16, color: '#5B6B7C', marginTop: 2 },
  horario: { fontSize: 16, color: '#2C4B76', marginTop: 4, fontWeight: '600' },
  estoqueAlerta: { fontSize: 13, color: '#F39C12', marginTop: 2, fontWeight: '700' },
  estoqueCritico: { fontSize: 13, color: '#E74C3C', marginTop: 2, fontWeight: '700' },
  acoes: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  acaoBtn: { padding: 6 },
  acaoTexto: { fontSize: 20 },
  excluir: { fontSize: 22, color: '#C0392B' },
});
