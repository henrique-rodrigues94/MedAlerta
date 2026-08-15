import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useAppMode } from '../context/AppModeContext';

export default function ModeSelectScreen() {
  const { setMode } = useAppMode();

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>💊 MedAlerta</Text>
      <Text style={styles.subtitulo}>Quem está usando o app agora?</Text>

      <Pressable style={[styles.card, styles.cardPaciente]} onPress={() => setMode('paciente')}>
        <Text style={styles.cardEmoji}>👤</Text>
        <Text style={styles.cardTitulo}>Sou o Paciente</Text>
        <Text style={styles.cardDesc}>
          Cadastro de remédios, alarmes e lembretes de medicação.
        </Text>
      </Pressable>

      <Pressable style={[styles.card, styles.cardCuidador]} onPress={() => setMode('cuidador')}>
        <Text style={styles.cardEmoji}>👨‍⚕️</Text>
        <Text style={styles.cardTitulo}>Sou o Cuidador</Text>
        <Text style={styles.cardDesc}>
          Acompanhe remotamente os remédios de quem você cuida.
        </Text>
      </Pressable>

      <Text style={styles.rodape}>
        Você pode trocar de modo a qualquer momento em Configurações.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB', alignItems: 'center', justifyContent: 'center', padding: 24 },
  logo: { fontSize: 42, fontWeight: '900', color: '#1E3A5F', marginBottom: 8 },
  subtitulo: { fontSize: 18, color: '#5B6B7C', marginBottom: 32 },
  card: {
    width: '100%',
    borderRadius: 20,
    padding: 28,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  cardPaciente: { backgroundColor: '#1E3A5F' },
  cardCuidador: { backgroundColor: '#118AB2' },
  cardEmoji: { fontSize: 48, marginBottom: 12 },
  cardTitulo: { fontSize: 22, fontWeight: '800', color: '#FFFFFF', marginBottom: 6 },
  cardDesc: { fontSize: 14, color: '#DCE6F2', textAlign: 'center', lineHeight: 20 },
  rodape: { fontSize: 13, color: '#9CA3AF', marginTop: 20, textAlign: 'center' },
});
