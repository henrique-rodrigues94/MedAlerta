import React from 'react';
import { View, Text, Pressable, StyleSheet, Linking, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppMode } from '../context/AppModeContext';
import { testarAlarmeReal } from '../services/notifications';

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { setMode } = useAppMode();

  async function handleTestarAlarme() {
    try { await testarAlarmeReal(); } catch { Alert.alert('Erro', 'Não foi possível tocar o alarme de teste.'); }
  }

  async function trocarModo() {
    Alert.alert('Trocar modo', 'Deseja sair do modo Paciente e escolher outro modo?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Trocar', onPress: () => setMode(null) },
    ]);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>⚙️ Configurações</Text>

      <Pressable style={styles.item} onPress={handleTestarAlarme}>
        <Text style={styles.itemTexto}>🔊 Testar alarme completo</Text>
      </Pressable>

      <Pressable style={styles.item} onPress={() => Linking.openSettings()}>
        <Text style={styles.itemTexto}>📱 Abrir permissões do celular</Text>
      </Pressable>

      <Pressable style={styles.item} onPress={() => navigation.navigate('VincularCuidador')}>
        <Text style={styles.itemTexto}>👨‍⚕️ Vincular cuidador</Text>
        <Text style={styles.itemSubtexto}>Compartilhe seu código para que alguém acompanhe seus remédios</Text>
      </Pressable>

      <Pressable style={styles.item} onPress={() => navigation.navigate('RelatorioAdesao')}>
        <Text style={styles.itemTexto}>📊 Ver relatório de adesão</Text>
      </Pressable>

      <Pressable style={[styles.item, styles.itemDestaque]} onPress={trocarModo}>
        <Text style={[styles.itemTexto, { color: '#118AB2' }]}>🔄 Trocar para outro modo</Text>
      </Pressable>

      <Text style={styles.dica}>
        Dica: em alguns celulares (Xiaomi, Samsung, etc.) é preciso liberar manualmente
        a opção "Permitir em segundo plano" para o app tocar o alarme mesmo fechado.
      </Text>

      <Text style={styles.versao}>MedAlerta v3.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB', padding: 20 },
  titulo: { fontSize: 28, fontWeight: '900', color: '#1E3A5F', marginBottom: 20, marginTop: 10 },
  item: { backgroundColor: '#FFFFFF', padding: 18, borderRadius: 14, marginBottom: 12 },
  itemDestaque: { borderWidth: 2, borderColor: '#118AB2' },
  itemTexto: { fontSize: 18, fontWeight: '600', color: '#1E3A5F' },
  itemSubtexto: { fontSize: 13, color: '#5B6B7C', marginTop: 4 },
  dica: { fontSize: 14, color: '#5B6B7C', marginTop: 20, lineHeight: 20 },
  versao: { fontSize: 12, color: '#9CA3AF', marginTop: 30, textAlign: 'center' },
});
