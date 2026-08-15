import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { listarPacientes, removerPaciente, atualizarStatusPaciente } from '../services/sync';
import { PacienteVinculado } from '../types';
import { formatarData, formatarHorario } from '../utils/validators';

export default function CaregiverDashboard({ navigation }: any) {
  const [pacientes, setPacientes] = useState<PacienteVinculado[]>([]);

  useFocusEffect(
    useCallback(() => {
      carregarPacientes();
    }, [])
  );

  async function carregarPacientes() {
    setPacientes(await listarPacientes());
  }

  function confirmarRemocao(p: PacienteVinculado) {
    Alert.alert('Desvincular', `Deseja parar de acompanhar ${p.nome}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Desvincular',
        style: 'destructive',
        onPress: async () => {
          await removerPaciente(p.id);
          carregarPacientes();
        },
      },
    ]);
  }

  function corStatus(status?: string): string {
    switch (status) {
      case 'tomado': return '#2ECC71';
      case 'adiado': return '#F39C12';
      case 'perdido': return '#E74C3C';
      default: return '#5B6B7C';
    }
  }

  function textoStatus(status?: string): string {
    switch (status) {
      case 'tomado': return '✓ Tomou o remédio';
      case 'adiado': return '⏰ Adiou';
      case 'perdido': return '❌ Perdeu o horário';
      default: return '⏳ Sem atualização';
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>👨‍⚕️ Painel do Cuidador</Text>
      <Text style={styles.subtitulo}>Acompanhe seus pacientes em tempo real</Text>

      {pacientes.length === 0 ? (
        <View style={styles.vazio}>
          <Text style={styles.vazioTexto}>
            Nenhum paciente vinculado.{"
"}Toque no botão abaixo para começar.
          </Text>
        </View>
      ) : (
        <FlatList
          data={pacientes}
          keyExtractor={(p) => p.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.nomePaciente}>{item.nome}</Text>
                <Pressable onPress={() => confirmarRemocao(item)}>
                  <Text style={styles.remover}>🗑️</Text>
                </Pressable>
              </View>

              <View style={[styles.statusBadge, { backgroundColor: corStatus(item.ultimoStatus) + '20' }]}>
                <Text style={[styles.statusTexto, { color: corStatus(item.ultimoStatus) }]}>
                  {textoStatus(item.ultimoStatus)}
                </Text>
              </View>

              {item.ultimoRemedio && (
                <Text style={styles.remedioInfo}>
                  Último remédio: <Text style={styles.remedioNome}>{item.ultimoRemedio}</Text>
                </Text>
              )}

              {item.ultimaAtualizacao && (
                <Text style={styles.horarioInfo}>
                  Atualizado: {formatarData(item.ultimaAtualizacao)} às {formatarHorario(item.ultimaAtualizacao)}
                </Text>
              )}
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}

      <Pressable style={styles.botao} onPress={() => navigation.navigate('VincularPaciente')}>
        <Text style={styles.botaoTexto}>+ Vincular Novo Paciente</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB', padding: 20 },
  titulo: { fontSize: 28, fontWeight: '900', color: '#1E3A5F', marginTop: 10 },
  subtitulo: { fontSize: 15, color: '#5B6B7C', marginBottom: 20 },
  vazio: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  vazioTexto: { fontSize: 18, color: '#5B6B7C', textAlign: 'center', lineHeight: 26 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  nomePaciente: { fontSize: 20, fontWeight: '800', color: '#1E3A5F' },
  remover: { fontSize: 20, padding: 4 },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 10,
  },
  statusTexto: { fontSize: 14, fontWeight: '700' },
  remedioInfo: { fontSize: 15, color: '#5B6B7C', marginBottom: 4 },
  remedioNome: { fontWeight: '700', color: '#1E3A5F' },
  horarioInfo: { fontSize: 13, color: '#9CA3AF' },
  botao: {
    backgroundColor: '#118AB2',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 10,
  },
  botaoTexto: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
});
