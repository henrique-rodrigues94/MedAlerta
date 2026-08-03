import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  Pressable,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import notifee from '@notifee/react-native';

const { width } = Dimensions.get('window');

interface Slide {
  emoji: string;
  titulo: string;
  texto: string;
  corFundo: string;
}

const SLIDES: Slide[] = [
  {
    emoji: '💊',
    titulo: 'Bem-vindo ao\nMedAlerta',
    texto: 'Um jeito simples de nunca esquecer a hora do seu remédio.',
    corFundo: '#1E3A5F',
  },
  {
    emoji: '📝',
    titulo: 'Cadastre seus\nremédios',
    texto: 'Coloque o nome, a foto e os horários. Leva menos de um minuto.',
    corFundo: '#118AB2',
  },
  {
    emoji: '⏰',
    titulo: 'O alarme toca\nna hora certa',
    texto: 'Mesmo com o celular no silencioso, o MedAlerta vai avisar bem alto, com letras grandes na tela.',
    corFundo: '#06D6A0',
  },
  {
    emoji: '🔔',
    titulo: 'Precisamos da sua\npermissão',
    texto: 'Para o alarme funcionar direitinho, toque em "Permitir" na próxima tela que vai aparecer.',
    corFundo: '#EF476F',
  },
];

interface Props {
  onConcluir: () => void;
}

export default function OnboardingScreen({ onConcluir }: Props) {
  const [indice, setIndice] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  function irParaSlide(novoIndice: number) {
    scrollRef.current?.scrollTo({ x: novoIndice * width, animated: true });
    setIndice(novoIndice);
  }

  function aoRolar(evento: NativeSyntheticEvent<NativeScrollEvent>) {
    const novoIndice = Math.round(evento.nativeEvent.contentOffset.x / width);
    if (novoIndice !== indice) setIndice(novoIndice);
  }

  async function finalizar() {
    // Pede a permissão de notificação já no fim do onboarding,
    // no momento em que o motivo já foi explicado pra pessoa.
    await notifee.requestPermission({ critical: true, sound: true, alert: true } as any);
    onConcluir();
  }

  const ultimoSlide = indice === SLIDES.length - 1;

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={aoRolar}
        scrollEventThrottle={16}
      >
        {SLIDES.map((slide, i) => (
          <View key={i} style={[styles.slide, { backgroundColor: slide.corFundo, width }]}>
            <Text style={styles.emoji}>{slide.emoji}</Text>
            <Text style={styles.titulo}>{slide.titulo}</Text>
            <Text style={styles.texto}>{slide.texto}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.rodape}>
        <View style={styles.pontos}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.ponto,
                i === indice && styles.pontoAtivo,
              ]}
            />
          ))}
        </View>

        {ultimoSlide ? (
          <Pressable style={styles.botaoPrincipal} onPress={finalizar}>
            <Text style={styles.botaoTexto}>COMEÇAR A USAR</Text>
          </Pressable>
        ) : (
          <View style={styles.linhaBotoes}>
            <Pressable onPress={finalizar} hitSlop={10}>
              <Text style={styles.botaoPular}>Pular</Text>
            </Pressable>

            <Pressable style={styles.botaoProximo} onPress={() => irParaSlide(indice + 1)}>
              <Text style={styles.botaoTexto}>PRÓXIMO</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1E3A5F' },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 36,
  },
  emoji: { fontSize: 90, marginBottom: 30 },
  titulo: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 18,
    lineHeight: 40,
  },
  texto: {
    fontSize: 20,
    color: '#EAF1F8',
    textAlign: 'center',
    lineHeight: 28,
  },
  rodape: {
    paddingHorizontal: 30,
    paddingBottom: 40,
    paddingTop: 20,
  },
  pontos: { flexDirection: 'row', justifyContent: 'center', marginBottom: 24, gap: 8 },
  ponto: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  pontoAtivo: {
    backgroundColor: '#FFFFFF',
    width: 26,
  },
  linhaBotoes: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  botaoPular: { fontSize: 18, color: '#EAF1F8', fontWeight: '600' },
  botaoProximo: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 34,
    borderRadius: 16,
  },
  botaoPrincipal: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    borderRadius: 18,
    alignItems: 'center',
  },
  botaoTexto: { color: '#1E3A5F', fontSize: 18, fontWeight: '900' },
});
