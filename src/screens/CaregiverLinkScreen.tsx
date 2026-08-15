import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import * as Linking from 'expo-linking';
import { obterExpoPushToken } from '../services/pushNotifications';
import { salvarPaciente, cuidadorConfirmarVinculacao } from '../services/sync';
import { gerarId } from '../utils/validators';

export default function CaregiverLinkScreen({ navigation }: any) {
  const [nomeCuidador, setNomeCuidador] = useState('');
  const [tokenPaciente, setTokenPaciente] = useState('');
  const [nomePaciente, setNomePaciente] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Tenta extrair dados do deep link se o app foi aberto por um
  React.useEffect(() => {
    Linking.getInitialURL().then((url) => {
      if (url) processarUrl(url);
    });
    const subscription = Linking.addEventListener('url', ({ url }) => {
      processarUrl(url);
    });
    return () => { subscription.remove(); };
  }, []);

  function processarUrl(url: string) {
    const { path, queryParams } = Linking.parse(url);
    if (path === 'vincular' && queryParams?.token) {
      setTokenPaciente(queryParams.token as string);
      if (queryParams.nome) setNomePaciente(queryParams.nome as string);
      Alert.alert('Link recebido!', `Dados do paciente ${queryParams.nome || ''} preenchidos automaticamente.`);
    }
  }

  async function vincular() {
    if (!nomeCuidador.trim()) {
      Alert.alert('Atenção', 'Informe seu nome.');
      return;
    }
    if (!tokenPaciente.trim()) {
      Alert.alert('Atenção', 'Cole o token do paciente ou use o link de vinculação.');
      return;
    }
    if (!nomePaciente.trim()) {
      Alert.alert('Atenção', 'Informe o nome do paciente.');
      return;
    }

    setSalvando(true);
    try {
      const meuToken = await obterExpoPushToken();
      if (!meuToken) {
        Alert.alert('Erro', 'Não foi possível obter seu token de notificação.');
        setSalvando(false);
        return;
      }

      // Salva paciente localmente
      const pacienteId = gerarId('pac');
      await salvarPaciente({
        id: pacienteId,
        nome: nomePaciente.trim(),
        expoPushToken: tokenPaciente.trim(),
        vinculadoEm: new Date().toISOString(),
      });

      // Envia confirmação para o paciente
      await cuidadorConfirmarVinculacao(tokenPaciente.trim(), nomeCuidador.trim(), meuToken);

      Alert.alert('✅ Vinculado!', `Você agora acompanha ${nomePaciente.trim()}.`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Não foi possível completar a vinculação.');
    } finally {
      setSalvando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <Text style={styles.titulo}>🔗 Vincular Paciente</Text>
        <Text style={styles.descricao}>
          Peça ao paciente para ir em Configurações → "Vincular Cuidador" e compartilhar o link com você.
        </Text>

        <Text style={styles.rotulo}>Seu nome *</Text>
        <TextInput
          style={styles.input}
          value={nomeCuidador}
          onChangeText={setNomeCuidador}
          placeholder="Ex: João (filho)"
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.rotulo}>Nome do paciente *</Text>
        <TextInput
          style={styles.input}
          value={nomePaciente}
          onChangeText={setNomePaciente}
          placeholder="Ex: Maria da Silva"
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.rotulo}>Token do paciente *</Text>
        <TextInput
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
          value={tokenPaciente}
          onChangeText={setTokenPaciente}
          placeholder="Cole aqui o token recebido..."
          placeholderTextColor="#9CA3AF"
          multiline
        />

        <Pressable style={[styles.botao, salvando && { opacity: 0.6 }]} onPress={vincular} disabled={salvando}>
          <Text style={styles.botaoTexto}>{salvando ? 'Vinculando...' : '✅ Confirmar Vinculação'}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB', padding: 20 },
  titulo: { fontSize: 26, fontWeight: '900', color: '#1E3A5F', marginTop: 10, marginBottom: 8 },
  descricao: { fontSize: 15, color: '#5B6B7C', marginBottom: 24, lineHeight: 22 },
  rotulo: { fontSize: 16, fontWeight: '700', color: '#1E3A5F', marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, fontSize: 16,
    borderWidth: 1, borderColor: '#DDE4EC', color: '#1E3A5F',
  },
  botao: {
    backgroundColor: '#118AB2', paddingVertical: 18, borderRadius: 18,
    alignItems: 'center', marginTop: 30,
  },
  botaoTexto: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
});
