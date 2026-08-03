import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { salvarMedicamento } from '../db/database';
import { agendarMedicamento } from '../services/notifications';
import { mostrarInterstitialOcasional } from '../services/ads';
import { Medicamento } from '../types';

const CORES = ['#EF476F', '#FFD166', '#06D6A0', '#118AB2', '#7B61FF'];

export default function AddMedicationScreen({ navigation, route }: any) {
  const editando: Medicamento | undefined = route.params?.medicamento;

  const [nome, setNome] = useState(editando?.nome ?? '');
  const [dosagem, setDosagem] = useState(editando?.dosagem ?? '');
  const [fotoUri, setFotoUri] = useState<string | null>(editando?.fotoUri ?? null);
  const [horarios, setHorarios] = useState<string[]>(editando?.horarios ?? ['08:00']);
  const [totalDias, setTotalDias] = useState(String(editando?.totalDias ?? '7'));
  const [cor, setCor] = useState(editando?.cor ?? CORES[0]);

  async function escolherFoto() {
    const permissao = await ImagePicker.requestCameraPermissionsAsync();
    Alert.alert('Foto do remédio', 'Como deseja adicionar a foto?', [
      {
        text: 'Tirar foto',
        onPress: async () => {
          if (!permissao.granted) return;
          const resultado = await ImagePicker.launchCameraAsync({ quality: 0.6 });
          if (!resultado.canceled) setFotoUri(resultado.assets[0].uri);
        },
      },
      {
        text: 'Escolher da galeria',
        onPress: async () => {
          const resultado = await ImagePicker.launchImageLibraryAsync({ quality: 0.6 });
          if (!resultado.canceled) setFotoUri(resultado.assets[0].uri);
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  function atualizarHorario(index: number, valor: string) {
    const copia = [...horarios];
    copia[index] = valor;
    setHorarios(copia);
  }

  function adicionarHorario() {
    setHorarios([...horarios, '12:00']);
  }

  function removerHorario(index: number) {
    setHorarios(horarios.filter((_, i) => i !== index));
  }

  async function salvar() {
    if (!nome.trim()) {
      Alert.alert('Atenção', 'Informe o nome do remédio.');
      return;
    }
    const dias = parseInt(totalDias, 10) || 1;

    const medicamento: Medicamento = {
      id: editando?.id ?? `med-${Date.now()}`,
      nome: nome.trim(),
      dosagem: dosagem.trim(),
      fotoUri,
      horarios,
      dataInicio: new Date().toISOString(),
      totalDias: dias,
      cor,
      ativo: true,
    };

    salvarMedicamento(medicamento);
    await agendarMedicamento(medicamento);

    // Mostra anúncio esporádico só depois de concluir a ação principal,
    // nunca durante o alarme.
    mostrarInterstitialOcasional();

    navigation.goBack();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
      <Text style={styles.titulo}>{editando ? 'Editar Remédio' : 'Novo Remédio'}</Text>

      <Pressable style={styles.fotoArea} onPress={escolherFoto}>
        {fotoUri ? (
          <Image source={{ uri: fotoUri }} style={styles.foto} />
        ) : (
          <Text style={styles.fotoTexto}>📷 Adicionar foto</Text>
        )}
      </Pressable>

      <Text style={styles.rotulo}>Nome do remédio</Text>
      <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Losartana" />

      <Text style={styles.rotulo}>Dosagem</Text>
      <TextInput
        style={styles.input}
        value={dosagem}
        onChangeText={setDosagem}
        placeholder="Ex: 1 comprimido"
      />

      <Text style={styles.rotulo}>Horários</Text>
      {horarios.map((h, i) => (
        <View key={i} style={styles.linhaHorario}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={h}
            onChangeText={(v) => atualizarHorario(i, v)}
            placeholder="HH:MM"
          />
          {horarios.length > 1 && (
            <Pressable onPress={() => removerHorario(i)} style={styles.removerHorario}>
              <Text style={{ color: '#C0392B', fontSize: 20 }}>✕</Text>
            </Pressable>
          )}
        </View>
      ))}
      <Pressable onPress={adicionarHorario}>
        <Text style={styles.adicionarHorario}>+ adicionar outro horário</Text>
      </Pressable>

      <Text style={styles.rotulo}>Quantos dias vai tomar?</Text>
      <TextInput
        style={styles.input}
        value={totalDias}
        onChangeText={setTotalDias}
        keyboardType="number-pad"
        placeholder="Ex: 7"
      />

      <Text style={styles.rotulo}>Cor de identificação</Text>
      <View style={styles.cores}>
        {CORES.map((c) => (
          <Pressable
            key={c}
            onPress={() => setCor(c)}
            style={[styles.bolinha, { backgroundColor: c, borderWidth: cor === c ? 3 : 0 }]}
          />
        ))}
      </View>

      <Pressable style={styles.botaoSalvar} onPress={salvar}>
        <Text style={styles.botaoSalvarTexto}>Salvar Remédio</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB' },
  titulo: { fontSize: 26, fontWeight: '900', color: '#1E3A5F', marginBottom: 20 },
  fotoArea: {
    height: 160,
    borderRadius: 18,
    backgroundColor: '#EEF2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  foto: { width: '100%', height: '100%' },
  fotoTexto: { fontSize: 18, color: '#5B6B7C' },
  rotulo: { fontSize: 16, fontWeight: '700', color: '#1E3A5F', marginBottom: 6, marginTop: 14 },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    fontSize: 18,
    borderWidth: 1,
    borderColor: '#DDE4EC',
  },
  linhaHorario: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  removerHorario: { padding: 8 },
  adicionarHorario: { color: '#118AB2', fontSize: 16, fontWeight: '700', marginTop: 4 },
  cores: { flexDirection: 'row', gap: 12, marginTop: 6 },
  bolinha: { width: 40, height: 40, borderRadius: 20, borderColor: '#1E3A5F' },
  botaoSalvar: {
    backgroundColor: '#2ECC71',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 30,
  },
  botaoSalvarTexto: { color: '#FFFFFF', fontSize: 20, fontWeight: '800' },
});
