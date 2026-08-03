import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { Medicamento } from '../types';
import { pararAlarme, agendarMedicamento } from '../services/notifications';
import { registrarTomada } from '../db/database';

interface Props {
  medicamento: Medicamento;
  notificationId: string;
  horarioPrevisto: string;
  onFechar: () => void;
}

const { width } = Dimensions.get('window');

export default function AlarmScreen({ medicamento, notificationId, horarioPrevisto, onFechar }: Props) {
  // Mantém a tela ligada enquanto o alarme toca
  useKeepAwake();

  async function marcarComoTomado() {
    registrarTomada({
      id: `${medicamento.id}-${horarioPrevisto}`,
      medicamentoId: medicamento.id,
      horarioPrevisto,
      horarioReal: new Date().toISOString(),
      status: 'tomado',
    });
    await pararAlarme(notificationId);
    onFechar();
  }

  async function adiarDezMinutos() {
    registrarTomada({
      id: `${medicamento.id}-${horarioPrevisto}`,
      medicamentoId: medicamento.id,
      horarioPrevisto,
      horarioReal: null,
      status: 'adiado',
    });
    await pararAlarme(notificationId);

    // Reagenda um único disparo 10 minutos à frente
    const daquiA10Min = { ...medicamento, dataInicio: new Date(Date.now() + 10 * 60 * 1000).toISOString(), totalDias: 1, horarios: [
      new Date(Date.now() + 10 * 60 * 1000).toTimeString().slice(0, 5),
    ]};
    await agendarMedicamento(daquiA10Min);
    onFechar();
  }

  return (
    <View style={styles.container}>
      <Text style={styles.horaTitulo}>ESTÁ NA HORA!</Text>

      {medicamento.fotoUri ? (
        <Image source={{ uri: medicamento.fotoUri }} style={styles.foto} />
      ) : (
        <View style={[styles.foto, styles.fotoPlaceholder]}>
          <Text style={styles.fotoPlaceholderTexto}>💊</Text>
        </View>
      )}

      <Text style={styles.nomeRemedio}>{medicamento.nome}</Text>
      <Text style={styles.dosagem}>{medicamento.dosagem}</Text>

      <View style={styles.botoes}>
        <Pressable style={[styles.botao, styles.botaoTomei]} onPress={marcarComoTomado}>
          <Text style={styles.botaoTexto}>✓  JÁ TOMEI</Text>
        </Pressable>

        <Pressable style={[styles.botao, styles.botaoAdiar]} onPress={adiarDezMinutos}>
          <Text style={styles.botaoTexto}>⏰  ADIAR 10 MIN</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E3A5F',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  horaTitulo: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFD166',
    marginBottom: 20,
    letterSpacing: 1,
  },
  foto: {
    width: width * 0.55,
    height: width * 0.55,
    borderRadius: 24,
    marginBottom: 24,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  fotoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C4B76',
  },
  fotoPlaceholderTexto: { fontSize: 90 },
  nomeRemedio: {
    fontSize: 44,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  dosagem: {
    fontSize: 26,
    color: '#DCE6F2',
    marginBottom: 40,
  },
  botoes: { width: '100%', gap: 16 },
  botao: {
    paddingVertical: 22,
    borderRadius: 20,
    alignItems: 'center',
  },
  botaoTomei: { backgroundColor: '#2ECC71' },
  botaoAdiar: { backgroundColor: '#F39C12' },
  botaoTexto: { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },
});
