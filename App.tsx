import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Modal, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen from './src/screens/HomeScreen';
import AddMedicationScreen from './src/screens/AddMedicationScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AlarmScreen from './src/screens/AlarmScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

import { iniciarBanco, listarMedicamentos } from './src/db/database';
import { configurarCanalDeAlarme, registrarListenerDeAlarme } from './src/services/notifications';
import { iniciarAds } from './src/services/ads';
import { Medicamento } from './src/types';

const Stack = createNativeStackNavigator();
const CHAVE_ONBOARDING = '@medalerta:onboarding_concluido';

export default function App() {
  const [alarmeAtivo, setAlarmeAtivo] = useState<{
    medicamento: Medicamento;
    notificationId: string;
    horarioPrevisto: string;
  } | null>(null);

  // null = ainda carregando, true = já viu, false = precisa ver agora
  const [onboardingConcluido, setOnboardingConcluido] = useState<boolean | null>(null);

  useEffect(() => {
    iniciarBanco();
    configurarCanalDeAlarme();
    iniciarAds();

    AsyncStorage.getItem(CHAVE_ONBOARDING).then((valor) => {
      setOnboardingConcluido(valor === 'true');
    });

    const unsubscribe = registrarListenerDeAlarme((medicamentoId, horarioPrevisto) => {
      const medicamento = listarMedicamentos().find((m) => m.id === medicamentoId);
      if (medicamento) {
        setAlarmeAtivo({
          medicamento,
          notificationId: `${medicamentoId}-${horarioPrevisto}`,
          horarioPrevisto,
        });
      }
    });

    return unsubscribe;
  }, []);

  async function concluirOnboarding() {
    await AsyncStorage.setItem(CHAVE_ONBOARDING, 'true');
    setOnboardingConcluido(true);
  }

  // Enquanto verifica o AsyncStorage, não mostra nada (evita "piscar" a tela)
  if (onboardingConcluido === null) {
    return <View style={{ flex: 1, backgroundColor: '#1E3A5F' }} />;
  }

  if (!onboardingConcluido) {
    return (
      <>
        <OnboardingScreen onConcluir={concluirOnboarding} />
        <StatusBar style="light" />
      </>
    );
  }

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#1E3A5F' }, headerTintColor: '#FFF' }}>
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'MedAlerta' }} />
          <Stack.Screen name="AddMedicamento" component={AddMedicationScreen} options={{ title: 'Remédio' }} />
          <Stack.Screen name="Configuracoes" component={SettingsScreen} options={{ title: 'Configurações' }} />
        </Stack.Navigator>
      </NavigationContainer>

      {/* A tela de alarme abre por cima de tudo, mesmo com o app em outra tela */}
      <Modal visible={!!alarmeAtivo} animationType="fade">
        {alarmeAtivo && (
          <AlarmScreen
            medicamento={alarmeAtivo.medicamento}
            notificationId={alarmeAtivo.notificationId}
            horarioPrevisto={alarmeAtivo.horarioPrevisto}
            onFechar={() => setAlarmeAtivo(null)}
          />
        )}
      </Modal>

      <StatusBar style="light" />
    </>
  );
}
