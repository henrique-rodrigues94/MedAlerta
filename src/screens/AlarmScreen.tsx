import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Dimensions, Vibration, Alert } from 'react-native';
import { useKeepAwake } from 'expo-keep-awake';
import { Medicamento } from '../types';
import { pararAlarme, agendarAlarmeUnico } from '../services/notifications';
import { registrarTomada, decrementarEstoque } from '../db/database';
import { falar, pararFala } from '../services/tts';
import {
  alertarCuidadores,
  notificarTomada,
  incrementarAdiamento,
  resetarAdiamento,
  obterAdiamentos,
} from '../services/sync';

interface Props {
  medicamento: Medicamento;
  notificationId: string;
  horarioPrevisto: string;
  onFechar: () => void;
}

const { width } = Dimensions.get('window');
const TEMPO_LIMITE_MS = 30 * 60 * 1000;
const LIMITE_ADIAMENTOS = 3;

export default function AlarmScreen({ medicamento, notificationId, horarioPrevisto, onFechar }: Props) {
  useKeepAwake();
  const [tempoRestante, setTempoRestante] = useState(TEMPO_LIMITE_MS);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [falou, setFalou] = useState(false);
  const [adiamentosAtuais, setAdiamentosAtuais] = useState(0);

  useEffect(() => {
    setAdiamentosAtuais(obterAdiamentos(medicamento.id));

    const vibracao = setInterval(() => {
      Vibration.vibrate([500, 500, 500], true);
    }, 2000);

    const inicio = Date.now();
    timerRef.current = setInterval(() => {
      const decorrido = Date.now() - inicio;
      const restante = Math.max(0, TEMPO_LIMITE_MS - decorrido);
      setTempoRestante(restante);
      if (restante <= 0) handleTempoEsgotado();
    }, 1000);

    const ttsTimer = setTimeout(() => {
      falar(`Hora de tomar ${medicamento.nome}. ${medicamento.dosagem || ''}`);
      setFalou(true);
    }, 1500);

    return () => {
      clearInterval(vibracao);
      Vibration.cancel();
      if (timerRef.current) clearInterval(timerRef.current);
      clearTimeout(ttsTimer);
      pararFala();
    };
  }, []);

  async function handleTempoEsgotado() {
    if (timerRef.current) clearInterval(timerRef.current);
    Vibration.cancel();
    pararFala();

    registrarTomada({
      id: `${medicamento.id}-${horarioPrevisto}`,
      medicamentoId: medicamento.id,
      horarioPrevisto,
      horarioReal: null,
      status: 'perdido',
    });

    await alertarCuidadores({
      medicamentoNome: medicamento.nome,
      dosagem: medicamento.dosagem || '',
      horario: horarioPrevisto,
      motivo: 'perdido',
      vezesAdiado: obterAdiamentos(medicamento.id),
    });

    await pararAlarme(notificationId);
    onFechar();
  }

  async function marcarComoTomado() {
    if (timerRef.current) clearInterval(timerRef.current);
    Vibration.cancel();
    pararFala();
    resetarAdiamento(medicamento.id);

    registrarTomada({
      id: `${medicamento.id}-${horarioPrevisto}`,
      medicamentoId: medicamento.id,
      horarioPrevisto,
      horarioReal: new Date().toISOString(),
      status: 'tomado',
    });

    // Decrementa estoque se houver
    if (medicamento.estoque && medicamento.estoque > 0) {
      const novoEstoque = decrementarEstoque(medicamento.id);
      if (novoEstoque !== null && novoEstoque <= 3 && novoEstoque > 0) {
        Alert.alert('📦 Estoque baixo', `Restam apenas ${novoEstoque} unidades de ${medicamento.nome}.`);
      }
    }

    await notificarTomada(medicamento.nome, medicamento.dosagem || '', horarioPrevisto);
    await pararAlarme(notificationId);
    onFechar();
  }

  async function adiarDezMinutos() {
    if (timerRef.current) clearInterval(timerRef.current);
    Vibration.cancel();
    pararFala();

    const vezesAdiado = incrementarAdiamento(medicamento.id);
    setAdiamentosAtuais(vezesAdiado);

    registrarTomada({
      id: `${medicamento.id}-${horarioPrevisto}`,
      medicamentoId: medicamento.id,
      horarioPrevisto,
      horarioReal: null,
      status: 'adiado',
    });
    await pararAlarme(notificationId);

    if (vezesAdiado >= LIMITE_ADIAMENTOS) {
      await alertarCuidadores({
        medicamentoNome: medicamento.nome,
        dosagem: medicamento.dosagem || '',
        horario: horarioPrevisto,
        motivo: 'adiamentos_excessivos',
        vezesAdiado,
      });

      Alert.alert(
        '⚠️ Cuidador avisado',
        `Você adiou este remédio ${vezesAdiado}x. Uma notificação foi enviada ao cuidador.`,
        [{ text: 'OK', onPress: onFechar }]
      );
      return;
    }

    await agendarAlarmeUnico(medicamento.id, medicamento.nome, medicamento.dosagem || '', 10);
    onFechar();
  }

  const minutosRestantes = Math.ceil(tempoRestante / 60000);
  const mostrarAvisoAdiamento = adiamentosAtuais >= 2;

  return (
    <View style={styles.container}>
      <Text style={styles.horaTitulo}>⏰ ESTÁ NA HORA!</Text>

      {medicamento.fotoUri ? (
        <Image source={{ uri: medicamento.fotoUri }} style={styles.foto} />
      ) : (
        <View style={[styles.foto, styles.fotoPlaceholder]}>
          <Text style={styles.fotoPlaceholderTexto}>💊</Text>
        </View>
      )}

      <Text style={styles.nomeRemedio}>{medicamento.nome}</Text>
      <Text style={styles.dosagem}>{medicamento.dosagem || 'Verifique a posologia'}</Text>

      {medicamento.estoque !== undefined && medicamento.estoque !== null && (
        <Text style={styles.estoque}>📦 Estoque: {medicamento.estoque} unidades</Text>
      )}

      {falou && <Text style={styles.ttsInfo}>🔊 Nome do remédio foi lido em voz alta</Text>}

      {mostrarAvisoAdiamento && (
        <View style={styles.avisoBox}>
          <Text style={styles.avisoTexto}>
            ⚠️ Você já adiou {adiamentosAtuais}x. Na próxima, o cuidador será avisado.
          </Text>
        </View>
      )}

      <Text style={styles.timerTexto}>
        {tempoRestante > 0 ? `Marque como tomado em até ${minutosRestantes} min` : 'Tempo esgotado'}
      </Text>

      <View style={styles.botoes}>
        <Pressable style={[styles.botao, styles.botaoTomei]} onPress={marcarComoTomado}>
          <Text style={styles.botaoTexto}>✓ JÁ TOMEI</Text>
        </Pressable>
        <Pressable style={[styles.botao, styles.botaoAdiar]} onPress={adiarDezMinutos}>
          <Text style={styles.botaoTexto}>⏰ ADIAR 10 MIN</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E3A5F', alignItems: 'center', justifyContent: 'center', padding: 24 },
  horaTitulo: { fontSize: 32, fontWeight: '800', color: '#FFD166', marginBottom: 20, letterSpacing: 1 },
  foto: { width: width * 0.55, height: width * 0.55, borderRadius: 24, marginBottom: 24, borderWidth: 4, borderColor: '#FFFFFF' },
  fotoPlaceholder: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#2C4B76' },
  fotoPlaceholderTexto: { fontSize: 90 },
  nomeRemedio: { fontSize: 44, fontWeight: '900', color: '#FFFFFF', textAlign: 'center', marginBottom: 8 },
  dosagem: { fontSize: 26, color: '#DCE6F2', marginBottom: 8 },
  estoque: { fontSize: 16, color: '#06D6A0', marginBottom: 12, fontWeight: '600' },
  ttsInfo: { fontSize: 14, color: '#06D6A0', marginBottom: 16 },
  avisoBox: { backgroundColor: 'rgba(231, 76, 60, 0.2)', borderRadius: 12, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E74C3C' },
  avisoTexto: { fontSize: 14, color: '#FFD166', textAlign: 'center', fontWeight: '600' },
  timerTexto: { fontSize: 16, color: '#FFD166', marginBottom: 30, fontWeight: '600' },
  botoes: { width: '100%', gap: 16 },
  botao: { paddingVertical: 22, borderRadius: 20, alignItems: 'center' },
  botaoTomei: { backgroundColor: '#2ECC71' },
  botaoAdiar: { backgroundColor: '#F39C12' },
  botaoTexto: { fontSize: 24, fontWeight: '800', color: '#FFFFFF' },
});
