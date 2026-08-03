import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { Medicamento } from '../types';

interface Props {
  medicamento: Medicamento;
  proximoHorario: string;
  onPress: () => void;
  onExcluir: () => void;
}

export default function MedicationCard({ medicamento, proximoHorario, onPress, onExcluir }: Props) {
  return (
    <Pressable style={[styles.card, { borderLeftColor: medicamento.cor }]} onPress={onPress}>
      {medicamento.fotoUri ? (
        <Image source={{ uri: medicamento.fotoUri }} style={styles.foto} />
      ) : (
        <View style={[styles.foto, styles.fotoPlaceholder]}>
          <Text style={{ fontSize: 30 }}>💊</Text>
        </View>
      )}

      <View style={styles.info}>
        <Text style={styles.nome}>{medicamento.nome}</Text>
        <Text style={styles.dosagem}>{medicamento.dosagem}</Text>
        <Text style={styles.horario}>Próximo: {proximoHorario}</Text>
      </View>

      <Pressable hitSlop={10} onPress={onExcluir}>
        <Text style={styles.excluir}>✕</Text>
      </Pressable>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    borderLeftWidth: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  foto: { width: 60, height: 60, borderRadius: 12, marginRight: 14 },
  fotoPlaceholder: { backgroundColor: '#EEF2F7', alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1 },
  nome: { fontSize: 20, fontWeight: '800', color: '#1E3A5F' },
  dosagem: { fontSize: 16, color: '#5B6B7C', marginTop: 2 },
  horario: { fontSize: 16, color: '#2C4B76', marginTop: 4, fontWeight: '600' },
  excluir: { fontSize: 22, color: '#C0392B', paddingHorizontal: 8 },
});
