import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MedicationCard from '../components/MedicationCard';
import { listarMedicamentos, removerMedicamento } from '../db/database';
import { cancelarAlarmesDoMedicamento } from '../services/notifications';
import { BannerAd, BannerAdSize, BANNER_ID } from '../services/ads';
import { Medicamento } from '../types';

function proximoHorarioTexto(m: Medicamento): string {
  const agora = new Date();
  const horaAtual = agora.getHours() * 60 + agora.getMinutes();
  const emMinutos = m.horarios
    .map((h) => {
      const [hh, mm] = h.split(':').map(Number);
      return hh * 60 + mm;
    })
    .sort((a, b) => a - b);

  const proximo = emMinutos.find((min) => min >= horaAtual) ?? emMinutos[0];
  const hh = String(Math.floor(proximo / 60)).padStart(2, '0');
  const mm = String(proximo % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

export default function HomeScreen({ navigation }: any) {
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);

  useFocusEffect(
    useCallback(() => {
      setMedicamentos(listarMedicamentos());
    }, [])
  );

  function confirmarExclusao(m: Medicamento) {
    Alert.alert('Remover remédio', `Deseja parar os lembretes de "${m.nome}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          removerMedicamento(m.id);
          await cancelarAlarmesDoMedicamento(m.id);
          setMedicamentos(listarMedicamentos());
        },
      },
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Meus Remédios</Text>

      {medicamentos.length === 0 ? (
        <View style={styles.vazio}>
          <Text style={styles.vazioTexto}>Nenhum remédio cadastrado ainda.{'\n'}Toque no botão abaixo para começar.</Text>
        </View>
      ) : (
        <FlatList
          data={medicamentos}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => (
            <MedicationCard
              medicamento={item}
              proximoHorario={proximoHorarioTexto(item)}
              onPress={() => navigation.navigate('AddMedicamento', { medicamento: item })}
              onExcluir={() => confirmarExclusao(item)}
            />
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      <Pressable style={styles.botaoAdicionar} onPress={() => navigation.navigate('AddMedicamento')}>
        <Text style={styles.botaoAdicionarTexto}>+ Adicionar Remédio</Text>
      </Pressable>

      <View style={styles.bannerContainer}>
        <BannerAd unitId={BANNER_ID} size={BannerAdSize.BANNER} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB', padding: 20 },
  titulo: { fontSize: 30, fontWeight: '900', color: '#1E3A5F', marginBottom: 16, marginTop: 10 },
  vazio: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  vazioTexto: { fontSize: 18, color: '#5B6B7C', textAlign: 'center', lineHeight: 26 },
  botaoAdicionar: {
    backgroundColor: '#1E3A5F',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 10,
  },
  botaoAdicionarTexto: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
  bannerContainer: { alignItems: 'center' },
});
