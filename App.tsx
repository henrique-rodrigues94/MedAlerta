import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Modal, View, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { AppModeProvider, useAppMode } from './src/context/AppModeContext';
import ModeSelectScreen from './src/screens/ModeSelectScreen';
import HomeScreen from './src/screens/HomeScreen';
import AddMedicationScreen from './src/screens/AddMedicationScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import AlarmScreen from './src/screens/AlarmScreen';
import MedicationHistoryScreen from './src/screens/MedicationHistoryScreen';
import AdherenceReportScreen from './src/screens/AdherenceReportScreen';
import PatientLinkScreen from './src/screens/PatientLinkScreen';
import CaregiverDashboard from './src/screens/CaregiverDashboard';
import CaregiverLinkScreen from './src/screens/CaregiverLinkScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import StockScreen from './src/screens/StockScreen';
import { iniciarBanco } from './src/db/database';
import { inicializarEstoque } from './src/services/stockProjection';
import { configurarCanalDeAlarme, registrarListenerDeAlarme, registrarBackgroundHandler } from './src/services/notifications';
import { configurarNotificacoesPush, registrarListenersPush, obterExpoPushToken } from './src/services/pushNotifications';
import { salvarCuidador, atualizarStatusPaciente, listarPacientes } from './src/services/sync';
import { iniciarAds } from './src/services/ads';
import { Medicamento, SyncPayload } from './src/types';

const Stack = createNativeStackNavigator();
const CHAVE_ONBOARDING = '@medalerta:onboarding_concluido';

function PacienteNavigator() {
  return <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Home" component={HomeScreen} />
    <Stack.Screen name="AddMedicamento" component={AddMedicationScreen} />
    <Stack.Screen name="Estoque" component={StockScreen} />
    <Stack.Screen name="Configuracoes" component={SettingsScreen} />
    <Stack.Screen name="HistoricoMedicamento" component={MedicationHistoryScreen} />
    <Stack.Screen name="RelatorioAdesao" component={AdherenceReportScreen} />
    <Stack.Screen name="VincularCuidador" component={PatientLinkScreen} />
  </Stack.Navigator>;
}
function CuidadorNavigator() { return <Stack.Navigator screenOptions={{ headerShown: false }}><Stack.Screen name="Dashboard" component={CaregiverDashboard} /><Stack.Screen name="VincularPaciente" component={CaregiverLinkScreen} /><Stack.Screen name="Configuracoes" component={SettingsScreen} /></Stack.Navigator>; }

function AppRoot() {
  const { mode, setMode, isLoading } = useAppMode();
  const [alarmeAtivo, setAlarmeAtivo] = useState<{ medicamento: Medicamento; notificationId: string; horarioPrevisto: string } | null>(null);
  const [onboardingConcluido, setOnboardingConcluido] = useState<boolean | null>(null);
  useEffect(() => {
    iniciarBanco(); inicializarEstoque(); configurarCanalDeAlarme(); configurarNotificacoesPush(); iniciarAds(); obterExpoPushToken();
    AsyncStorage.getItem(CHAVE_ONBOARDING).then(v => setOnboardingConcluido(v === 'true'));
    const unsubscribeForeground = registrarListenerDeAlarme((id, horario, notificationId) => abrirAlarme(id, horario, notificationId));
    registrarBackgroundHandler((id, horario, notificationId) => abrirAlarme(id, horario, notificationId));
    const unsubscribePush = registrarListenersPush((data: SyncPayload) => handlePushRecebido(data));
    Linking.getInitialURL().then(url => { if (url) handleDeepLink(url); });
    const deep = Linking.addEventListener('url', ({ url }) => handleDeepLink(url));
    return () => { unsubscribeForeground(); unsubscribePush(); deep.remove(); };
  }, []);
  function abrirAlarme(id: string, horario: string, notificationId: string) { const { buscarMedicamentoPorId } = require('./src/db/database'); const medicamento = buscarMedicamentoPorId(id); if (medicamento) setAlarmeAtivo({ medicamento, notificationId, horarioPrevisto: horario }); }
  async function handlePushRecebido(data: SyncPayload) {
    if (!data?.tipo) return;
    if (data.tipo === 'vinculacao' && data.cuidadorNome && data.cuidadorToken) { await salvarCuidador({ id:data.cuidadorId || `cuid-${Date.now()}`, nome:data.cuidadorNome, expoPushToken:data.cuidadorToken, vinculadoEm:new Date().toISOString() }); Alert.alert('Cuidador vinculado!', `${data.cuidadorNome} agora acompanha seus remédios.`); }
    if (data.tipo === 'status' || data.tipo === 'alerta') { const pacientes = await listarPacientes(); const paciente = pacientes.find(p => p.expoPushToken === data.pacienteId); if (paciente) await atualizarStatusPaciente(paciente.id, data.status || 'pendente', data.medicamentoNome); }
  }
  function handleDeepLink(url: string) { const { path } = Linking.parse(url); if (path === 'vincular' && !mode) setMode('cuidador'); }
  async function concluirOnboarding() { await AsyncStorage.setItem(CHAVE_ONBOARDING, 'true'); setOnboardingConcluido(true); }
  if (isLoading || onboardingConcluido === null) return <View style={{ flex:1, backgroundColor:'#F4F7FB' }} />;
  if (!onboardingConcluido) return <><StatusBar style="dark" /><OnboardingScreen onConcluir={concluirOnboarding} /></>;
  if (!mode) return <><StatusBar style="dark" /><ModeSelectScreen /></>;
  return <><StatusBar style="dark" /><NavigationContainer>{mode === 'paciente' ? <PacienteNavigator /> : <CuidadorNavigator />}</NavigationContainer>{mode === 'paciente' && <Modal visible={!!alarmeAtivo} animationType="slide" presentationStyle="fullScreen">{alarmeAtivo && <AlarmScreen medicamento={alarmeAtivo.medicamento} notificationId={alarmeAtivo.notificationId} horarioPrevisto={alarmeAtivo.horarioPrevisto} onFechar={() => setAlarmeAtivo(null)} />}</Modal>}</>;
}
export default function App() { return <AppModeProvider><AppRoot /></AppModeProvider>; }
