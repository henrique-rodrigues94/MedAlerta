import React from 'react';
import { View, Text, Pressable, StyleSheet, Linking, Alert, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppMode } from '../context/AppModeContext';
import { testarAlarmeReal } from '../services/notifications';

export default function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { setMode, modoFacil, setModoFacil } = useAppMode();
  async function handleTestarAlarme() { try { await testarAlarmeReal(); } catch { Alert.alert('Erro', 'Não foi possível tocar o alarme de teste.'); } }
  function trocarModo() { Alert.alert('Trocar modo', 'Deseja sair do modo atual e escolher outro modo?', [{ text: 'Cancelar', style: 'cancel' }, { text: 'Trocar', onPress: () => setMode(null) }]); }
  return <View style={styles.container}>
    <Text style={styles.titulo}>⚙️ Configurações</Text>
    <View style={styles.item}><View style={styles.row}><View style={styles.flex}><Text style={styles.itemTexto}>👵 Modo Fácil</Text><Text style={styles.itemSubtexto}>Textos maiores, botões maiores e interface simplificada.</Text></View><Switch value={modoFacil} onValueChange={setModoFacil} accessibilityLabel="Ativar modo fácil" /></View></View>
    <Pressable style={styles.item} onPress={handleTestarAlarme} accessibilityRole="button"><Text style={styles.itemTexto}>🔊 Testar alarme completo</Text><Text style={styles.itemSubtexto}>Confirme som, vibração e tela de alerta.</Text></Pressable>
    <Pressable style={styles.item} onPress={() => navigation.navigate('Estoque')} accessibilityRole="button"><Text style={styles.itemTexto}>📦 Estoque dos medicamentos</Text><Text style={styles.itemSubtexto}>Veja dias restantes e previsão de término.</Text></Pressable>
    <Pressable style={styles.item} onPress={() => Linking.openSettings()} accessibilityRole="button"><Text style={styles.itemTexto}>📱 Permissões do celular</Text></Pressable>
    <Pressable style={styles.item} onPress={() => navigation.navigate('VincularCuidador')} accessibilityRole="button"><Text style={styles.itemTexto}>👨‍⚕️ Vincular cuidador</Text><Text style={styles.itemSubtexto}>Compartilhe seu código para acompanhamento.</Text></Pressable>
    <Pressable style={styles.item} onPress={() => navigation.navigate('RelatorioAdesao')} accessibilityRole="button"><Text style={styles.itemTexto}>📊 Relatório de adesão</Text></Pressable>
    <Pressable style={[styles.item, styles.itemDestaque]} onPress={trocarModo}><Text style={[styles.itemTexto, { color: '#118AB2' }]}>🔄 Trocar modo</Text></Pressable>
    <Text style={styles.dica}>O MedAlerta é um lembrete e organizador de medicamentos. Não substitui orientação médica ou farmacêutica.</Text>
    <Text style={styles.versao}>MedAlerta v1.1.0</Text>
  </View>;
}
const styles = StyleSheet.create({ container:{flex:1,backgroundColor:'#F4F7FB',padding:20}, titulo:{fontSize:28,fontWeight:'900',color:'#1E3A5F',marginBottom:20,marginTop:10}, item:{backgroundColor:'#FFFFFF',padding:18,borderRadius:14,marginBottom:12}, itemDestaque:{borderWidth:2,borderColor:'#118AB2'}, itemTexto:{fontSize:18,fontWeight:'700',color:'#1E3A5F'}, itemSubtexto:{fontSize:13,color:'#5B6B7C',marginTop:5,lineHeight:19}, dica:{fontSize:14,color:'#5B6B7C',marginTop:12,lineHeight:21}, versao:{fontSize:12,color:'#9CA3AF',marginTop:20,textAlign:'center'}, row:{flexDirection:'row',alignItems:'center'}, flex:{flex:1,marginRight:10} });
