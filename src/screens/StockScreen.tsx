import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { listarMedicamentos } from '../db/database';
import { adicionarAoEstoque, definirEstoque, inicializarEstoque, listarProjecoes, formatarDias } from '../services/stockProjection';
import { Medicamento, ProjecaoEstoque } from '../types';

function dataBR(iso: string | null) { return iso ? new Date(iso).toLocaleDateString('pt-BR') : '—'; }
function corStatus(status: ProjecaoEstoque['status']) { return status === 'normal' ? '#2ECC71' : status === 'atencao' ? '#F39C12' : '#E74C3C'; }
function textoStatus(status: ProjecaoEstoque['status']) { return status === 'normal' ? 'Normal' : status === 'atencao' ? 'Atenção' : status === 'critico' ? 'Crítico' : status === 'sem_estoque' ? 'Sem estoque' : 'Sem dados'; }

export default function StockScreen() {
  const [projecoes, setProjecoes] = useState<ProjecaoEstoque[]>([]);
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
  const carregar = useCallback(() => { inicializarEstoque(); const ms = listarMedicamentos(); setMedicamentos(ms); setProjecoes(listarProjecoes()); }, []);
  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  function ajustar(m: Medicamento) {
    const atual = m.estoque ?? 0;
    Alert.alert(`Estoque — ${m.nome}`, `Atual: ${atual} ${(m as any).unidadeEstoque || 'unidades'}`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: '+ 10', onPress: () => { adicionarAoEstoque(m.id, 10); carregar(); } },
      { text: '+ 30', onPress: () => { adicionarAoEstoque(m.id, 30); carregar(); } },
      { text: 'Definir 0', style: 'destructive', onPress: () => { definirEstoque(m.id, 0); carregar(); } },
    ]);
  }

  const criticos = projecoes.filter(p => p.status !== 'normal' && p.status !== 'sem_dados').length;
  return <View style={styles.container}>
    <Text style={styles.title}>📦 Estoque dos medicamentos</Text>
    <Text style={styles.subtitle}>Projeção baseada nos horários cadastrados e no consumo por dose.</Text>
    {criticos > 0 && <View style={styles.alert}><Text style={styles.alertText}>⚠️ {criticos} medicamento(s) precisam de atenção.</Text></View>}
    <FlatList data={projecoes} keyExtractor={p => p.medicamentoId} contentContainerStyle={{ paddingBottom: 30 }} renderItem={({ item: p }) => {
      const m = medicamentos.find(x => x.id === p.medicamentoId); if (!m) return null;
      return <View style={styles.card}>
        <View style={styles.row}><View style={{ flex: 1 }}><Text style={styles.name}>{m.nome}</Text><Text style={styles.dose}>{m.dosagem || 'Dosagem não informada'}</Text></View><View style={[styles.badge, { backgroundColor: corStatus(p.status) }]}><Text style={styles.badgeText}>{textoStatus(p.status)}</Text></View></View>
        <View style={styles.metrics}><Text style={styles.metric}>Estoque{`\n`}<Text style={styles.value}>{p.estoqueAtual} {p.unidade}</Text></Text><Text style={styles.metric}>Consumo/dia{`\n`}<Text style={styles.value}>{p.consumoDiario} {p.unidade}</Text></Text><Text style={styles.metric}>Duração{`\n`}<Text style={styles.value}>{formatarDias(p.diasRestantes)}</Text></Text></View>
        <Text style={styles.projection}>📅 Previsão de término: <Text style={{ fontWeight: '800' }}>{dataBR(p.dataEstimadaFim)}</Text></Text>
        <Text style={styles.minimum}>Estoque mínimo: {p.estoqueMinimo} {p.unidade}</Text>
        <Pressable style={styles.adjust} onPress={() => ajustar(m)}><Text style={styles.adjustText}>+ Repor / ajustar estoque</Text></Pressable>
      </View>;
    }} ListEmptyComponent={<Text style={styles.empty}>Cadastre um medicamento para acompanhar o estoque.</Text>} />
  </View>;
}

const styles = StyleSheet.create({ container:{flex:1,backgroundColor:'#F4F7FB',padding:20}, title:{fontSize:28,fontWeight:'900',color:'#1E3A5F',marginTop:10}, subtitle:{fontSize:15,color:'#5B6B7C',lineHeight:21,marginTop:6,marginBottom:14}, alert:{backgroundColor:'#FFF3CD',borderRadius:12,padding:12,marginBottom:14}, alertText:{fontSize:15,fontWeight:'700',color:'#7A5700'}, card:{backgroundColor:'#FFF',borderRadius:18,padding:16,marginBottom:14,elevation:2}, row:{flexDirection:'row',alignItems:'flex-start'}, name:{fontSize:20,fontWeight:'900',color:'#1E3A5F'}, dose:{fontSize:14,color:'#667788',marginTop:3}, badge:{borderRadius:999,paddingHorizontal:10,paddingVertical:6}, badgeText:{color:'#FFF',fontSize:12,fontWeight:'800'}, metrics:{flexDirection:'row',justifyContent:'space-between',marginTop:16}, metric:{fontSize:12,color:'#667788'}, value:{fontSize:16,fontWeight:'800',color:'#1E3A5F'}, projection:{fontSize:15,color:'#34495E',marginTop:16}, minimum:{fontSize:13,color:'#667788',marginTop:6}, adjust:{marginTop:14,borderRadius:12,backgroundColor:'#EAF2F8',padding:13,alignItems:'center'}, adjustText:{color:'#118AB2',fontWeight:'800',fontSize:15}, empty:{textAlign:'center',fontSize:17,color:'#667788',marginTop:60} });
