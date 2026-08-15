import React, { useEffect, useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, Share, Alert, ActivityIndicator,
} from 'react-native';
import * as Linking from 'expo-linking';
import { obterExpoPushToken } from '../services/pushNotifications';
import { gerarCodigoPaciente, obterCodigoPaciente, obterNomePaciente, listarCuidadores, removerCuidador } from '../services/sync';
import { CuidadorVinculado } from '../types';

export default function PatientLinkScreen() {
  const [codigo, setCodigo] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [nome, setNome] = useState('');
  const [cuidadores, setCuidadores] = useState<CuidadorVinculado[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);
    let cod = await obterCodigoPaciente();
    if (!cod) cod = await gerarCodigoPaciente();
    setCodigo(cod);

    const t = await obterExpoPushToken();
    setToken(t);

    const n = await obterNomePaciente();
    setNome(n);

    const c = await listarCuidadores();
    setCuidadores(c);
    setCarregando(false);
  }

  async function compartilharLink() {
    if (!token) {
      Alert.alert('Erro', 'Não foi possível obter o token de notificação. Tente novamente.');
      return;
    }

    const deepLink = Linking.createURL('vincular', {
      queryParams: {
        token,
        nome,
        codigo: codigo || '',
      },
    });

    const mensagem =
      `🏥 *MedAlerta - Vinculação de Cuidador*

` +
      `Paciente: *${nome}*
` +
      `Código: *${codigo}*

` +
      `Cuidador, instale o app MedAlerta, selecione "Modo Cuidador" e toque no link abaixo para se vincular:

` +
      `${deepLink}

` +
      `Ou, se o link não funcionar, copie este token e cole no app:
` +
      `${token}`;

    try {
      await Share.share({ message: mensagem });
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível compartilhar.');
    }
  }

  async function desvincular(cuidadorId: string) {
    await removerCuidador(cuidadorId);
    setCuidadores(await listarCuidadores());
  }

  if (carregando) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#1E3A5F" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>👨‍⚕️ Vincular Cuidador</Text>
      <Text style={styles.descricao}>
        Compartilhe o link abaixo com seu cuidador para que ele receba alertas quando você não tomar um remédio.
      </Text>

      <View style={styles.codigoBox}>
        <Text style={styles.codigoLabel}>Seu código</Text>
        <Text style={styles.codigoValor}>{codigo}</Text>
      </View>

      <Pressable style={styles.botaoCompartilhar} onPress={compartilharLink}>
        <Text style={styles.botaoTexto}>📤 Compartilhar link de vinculação</Text>
      </Pressable>

      <Text style={styles.secaoTitulo}>Cuidadores vinculados ({cuidadores.length})</Text>
      {cuidadores.length === 0 ? (
        <Text style={styles.vazio}>Nenhum cuidador vinculado ainda.</Text>
      ) : (
        cuidadores.map((c) => (
          <View key={c.id} style={styles.cuidadorItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cuidadorNome}>{c.nome}</Text>
              <Text style={styles.cuidadorData}>Vinculado em {new Date(c.vinculadoEm).toLocaleDateString('pt-BR')}</Text>
            </View>
            <Pressable onPress={() => desvincular(c.id)}>
              <Text style={styles.desvincular}>🗑️</Text>
            </Pressable>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB', padding: 20 },
  titulo: { fontSize: 26, fontWeight: '900', color: '#1E3A5F', marginTop: 10, marginBottom: 8 },
  descricao: { fontSize: 15, color: '#5B6B7C', marginBottom: 24, lineHeight: 22 },
  codigoBox: {
    backgroundColor: '#1E3A5F',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  codigoLabel: { fontSize: 14, color: '#DCE6F2', marginBottom: 6 },
  codigoValor: { fontSize: 36, fontWeight: '900', color: '#FFD166', letterSpacing: 4 },
  botaoCompartilhar: {
    backgroundColor: '#2ECC71',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 30,
  },
  botaoTexto: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  secaoTitulo: { fontSize: 18, fontWeight: '800', color: '#1E3A5F', marginBottom: 12 },
  vazio: { fontSize: 15, color: '#5B6B7C', fontStyle: 'italic' },
  cuidadorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  cuidadorNome: { fontSize: 16, fontWeight: '700', color: '#1E3A5F' },
  cuidadorData: { fontSize: 13, color: '#5B6B7C', marginTop: 2 },
  desvincular: { fontSize: 20, padding: 4 },
});
