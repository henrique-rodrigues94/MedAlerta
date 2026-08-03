import React from 'react';
import { View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import notifee from '@notifee/react-native';

export default function SettingsScreen() {
  async function testarAlarme() {
    await notifee.displayNotification({
      title: '🔔 Teste de alarme',
      body: 'É assim que o alarme vai soar e aparecer.',
      android: { channelId: 'alarme-remedio' },
      ios: { sound: 'alarme_remedio.wav', critical: true },
    });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Configurações</Text>

      <Pressable style={styles.item} onPress={testarAlarme}>
        <Text style={styles.itemTexto}>🔊 Testar som do alarme</Text>
      </Pressable>

      <Pressable
        style={styles.item}
        onPress={() => Linking.openSettings()}
      >
        <Text style={styles.itemTexto}>⚙️ Abrir permissões do celular</Text>
      </Pressable>

      <Text style={styles.dica}>
        Dica: em alguns celulares (Xiaomi, Samsung, etc.) é preciso liberar
        manualmente a opção "Permitir em segundo plano" para o app tocar o
        alarme mesmo fechado.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB', padding: 20 },
  titulo: { fontSize: 28, fontWeight: '900', color: '#1E3A5F', marginBottom: 20, marginTop: 10 },
  item: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 14,
    marginBottom: 12,
  },
  itemTexto: { fontSize: 18, fontWeight: '600', color: '#1E3A5F' },
  dica: { fontSize: 14, color: '#5B6B7C', marginTop: 20, lineHeight: 20 },
});
