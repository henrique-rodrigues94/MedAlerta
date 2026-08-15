import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  salvarCuidador,
  buscarCuidador,
  removerCuidador,
  salvarNomePaciente,
  buscarNomePaciente,
  alertasAtivos,
  setAlertasAtivos,
  validarTelefone,
  normalizarTelefone,
  Cuidador,
} from '../services/caregiver';
import { dispararAlertaCuidador } from '../services/emergencyAlert';

export default function CaregiverScreen() {
  const [nomePaciente, setNomePaciente] = useState('');
  const [nomeCuidador, setNomeCuidador] = useState('');
  const [telefone, setTelefone] = useState('');
  const [alertasOn, setAlertasOn] = useState(true);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    const paciente = await buscarNomePaciente();
    const cuidador = await buscarCuidador();
    const ativos = await alertasAtivos();
    setNomePaciente(paciente);
    setAlertasOn(ativos);
    if (cuidador) {
      setNomeCuidador(cuidador.nome);
      setTelefone(cuidador.telefone);
      setSalvo(true);
    }
  }

  async function salvar() {
    if (!nomePaciente.trim()) {
      Alert.alert('Atenção', 'Informe o nome do paciente.');
      return;
    }
    if (!nomeCuidador.trim()) {
      Alert.alert('Atenção', 'Informe o nome do cuidador.');
      return;
    }
    if (!telefone.trim()) {
      Alert.alert('Atenção', 'Informe o telefone do cuidador.');
      return;
    }
    if (!validarTelefone(telefone)) {
      Alert.alert(
        'Telefone inválido',
        'O telefone deve ter DDD + 9 dígitos.
Ex: 11999999999'
      );
      return;
    }

    await salvarNomePaciente(nomePaciente);
    await salvarCuidador({
      nome: nomeCuidador.trim(),
      telefone: normalizarTelefone(telefone),
    });
    await setAlertasAtivos(alertasOn);
    setSalvo(true);
    Alert.alert('✅ Salvo!', 'Os dados do cuidador foram salvos com sucesso.');
  }

  async function excluir() {
    Alert.alert('Remover cuidador', 'Tem certeza que deseja remover o cuidador?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Remover',
        style: 'destructive',
        onPress: async () => {
          await removerCuidador();
          setNomeCuidador('');
          setTelefone('');
          setSalvo(false);
        },
      },
    ]);
  }

  async function testarAlerta() {
    const enviado = await dispararAlertaCuidador({
      nomeRemedio: 'Paracetamol (TESTE)',
      dosagem: '1 comprimido',
      horarioPrevisto: new Date().toISOString(),
      horarioReal: new Date().toISOString(),
      vezesAdiado: 2,
      motivo: 'adiamentos_excessivos',
    });

    if (enviado) {
      Alert.alert('Mensagem enviada', 'O WhatsApp foi aberto com a mensagem de teste.');
    } else {
      Alert.alert(
        'Não foi possível enviar',
        'Verifique se:
• O cuidador está cadastrado
• Os alertas estão ativados
• O WhatsApp está instalado'
      );
    }
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text style={styles.titulo}>👨‍⚕️ Cuidador Responsável</Text>
        <Text style={styles.descricao}>
          Cadastre uma pessoa de confiança para ser avisada caso o remédio não seja tomado
          ou seja adiado várias vezes.
        </Text>

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Alertas ativados</Text>
          <Switch
            value={alertasOn}
            onValueChange={setAlertasOn}
            trackColor={{ false: '#DDE4EC', true: '#2ECC71' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <Text style={styles.rotulo}>Nome do paciente *</Text>
        <TextInput
          style={styles.input}
          value={nomePaciente}
          onChangeText={setNomePaciente}
          placeholder="Ex: Maria da Silva"
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.rotulo}>Nome do cuidador *</Text>
        <TextInput
          style={styles.input}
          value={nomeCuidador}
          onChangeText={setNomeCuidador}
          placeholder="Ex: João (filho)"
          placeholderTextColor="#9CA3AF"
        />

        <Text style={styles.rotulo}>Telefone do cuidador (com DDD) *</Text>
        <TextInput
          style={styles.input}
          value={telefone}
          onChangeText={setTelefone}
          placeholder="Ex: 11999999999"
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          maxLength={15}
        />
        <Text style={styles.dica}>
          💡 Digite apenas números com DDD. Ex: 11999999999
        </Text>

        <Pressable style={styles.botaoSalvar} onPress={salvar}>
          <Text style={styles.botaoSalvarTexto}>💾 Salvar Cuidador</Text>
        </Pressable>

        {salvo && (
          <>
            <Pressable style={[styles.botaoSalvar, styles.botaoTeste]} onPress={testarAlerta}>
              <Text style={styles.botaoSalvarTexto}>📤 Testar envio de alerta</Text>
            </Pressable>

            <Pressable style={[styles.botaoSalvar, styles.botaoRemover]} onPress={excluir}>
              <Text style={[styles.botaoSalvarTexto, { color: '#E74C3C' }]}>
                🗑️ Remover cuidador
              </Text>
            </Pressable>
          </>
        )}

        <View style={styles.infoBox}>
          <Text style={styles.infoTitulo}>📋 Quando o alerta é enviado?</Text>
          <Text style={styles.infoTexto}>
            • Após 3 adiamentos seguidos do mesmo remédio{'
'}
            • Se o alarme expirar (30 min) sem resposta{'
'}
            • A mensagem abre no WhatsApp — basta enviar
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB' },
  titulo: { fontSize: 26, fontWeight: '900', color: '#1E3A5F', marginBottom: 8 },
  descricao: {
    fontSize: 15,
    color: '#5B6B7C',
    marginBottom: 20,
    lineHeight: 22,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 14,
    marginBottom: 20,
  },
  switchLabel: { fontSize: 16, fontWeight: '700', color: '#1E3A5F' },
  rotulo: { fontSize: 16, fontWeight: '700', color: '#1E3A5F', marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#DDE4EC',
    color: '#1E3A5F',
  },
  dica: { fontSize: 13, color: '#5B6B7C', marginTop: 6 },
  botaoSalvar: {
    backgroundColor: '#1E3A5F',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 24,
  },
  botaoTeste: { backgroundColor: '#118AB2', marginTop: 12 },
  botaoRemover: { backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#E74C3C', marginTop: 12 },
  botaoSalvarTexto: { color: '#FFFFFF', fontSize: 18, fontWeight: '800' },
  infoBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginTop: 24,
    borderLeftWidth: 4,
    borderLeftColor: '#FFD166',
  },
  infoTitulo: { fontSize: 15, fontWeight: '800', color: '#1E3A5F', marginBottom: 8 },
  infoTexto: { fontSize: 14, color: '#5B6B7C', lineHeight: 22 },
});
