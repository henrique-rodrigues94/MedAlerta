# MedAlerta — App de Lembrete de Remédios

App em React Native (Expo) para lembrar idosos (ou qualquer pessoa) de tomar
remédios no horário certo, com alarme em tela cheia e som próprio.

## O que já está pronto neste código

- Cadastro de remédio: nome, dosagem, foto (câmera/galeria), horários, dias de tratamento
- Banco de dados local (SQLite) — funciona sem internet
- Agendamento de alarmes (notifee) que dispara mesmo com o app fechado
- Tela de alarme em tela cheia, letras grandes, alto contraste
- Botões "Já tomei" e "Adiar 10 min"
- Canal de notificação Android com som e vibração próprios, configurado para
  ignorar o modo silencioso e o "Não perturbe"
- Integração com AdMob (banner na Home + intersticial esporádico)

## ⚠️ Antes de rodar: passos que exigem você

### 1. Instalar dependências
Este é um projeto Expo com **módulos nativos** (notifee, AdMob), então não
funciona no app "Expo Go" — precisa gerar um **dev client**.

**Importante**: não rode `npm install` direto na primeira vez. Deixe o Expo
escolher as versões corretas de cada pacote nativo (isso evita erros de
build tipo o do `bob`/`react-native-screens`):

```bash
npx expo install --fix
npx expo prebuild --clean
npx expo run:android    # ou: npx expo run:ios
```

Se mesmo assim der erro de instalação, apague tudo e comece limpo:
```bash
rmdir /s /q node_modules
del package-lock.json
npx expo install --fix
```

### 2. Som do alarme (obrigatório)
Você precisa escolher/criar um som de alarme diferenciado (ex: comprar um
efeito sonoro royalty-free ou compor um bipe próprio) e colocar em:

- **Android**: `android/app/src/main/res/raw/alarme_remedio.mp3`
- **iOS**: adicionar `alarme_remedio.wav` ao projeto Xcode (arraste para o
  target do app, marcando "Copy items if needed")

Sons no iOS **precisam ser `.wav`, `.aiff` ou `.caf`**, com no máximo 30 segundos.

### 3. AdMob
1. Crie uma conta em https://admob.google.com
2. Crie o app (Android e iOS são apps separados no AdMob)
3. Copie o **App ID** de cada plataforma e cole em `app.json`, na seção
   `react-native-google-mobile-ads`
4. Crie os blocos de anúncio (Banner e Intersticial) e copie os IDs para
   `src/services/ads.ts`, substituindo os `ca-app-pub-XXXX...`
5. Enquanto testa, deixe `TestIds` ativo (já configurado) para não arriscar
   banimento por clique acidental

### 4. iOS — som mesmo no modo silencioso (Critical Alerts)
A Apple **não libera por padrão** que apps toquem som ignorando o botão
físico de silencioso. Existe uma permissão especial chamada **Critical
Alerts**, usada por apps de saúde/segurança (é o mesmo mecanismo que apps de
monitoramento de glicose usam, por exemplo).

Para conseguir:
1. Acesse https://developer.apple.com/contact/request/critical-alert
2. Explique que é um app de lembrete de medicação para idosos
3. Aguarde aprovação da Apple (pode levar dias/semanas)
4. Depois de aprovado, ative a entitlement no seu Apple Developer Portal
   (o código já está preparado em `app.json` → `entitlements`)

**Sem essa aprovação**, o app funciona normalmente no iOS, com som e
notificação em tela cheia — só não vai tocar se o usuário tiver deixado o
celular no botão físico de silencioso. No Android isso não é um problema.

### 5. Ícone e splash screen
Substitua os arquivos de exemplo por artes reais em alta resolução:
- `assets/icon.png` (1024x1024)
- Tela de splash em `app.json`

Recomendo contratar um design simples e afetuoso — como o público é idoso,
evite ícones muito "tech"; algo com cores quentes e um símbolo de comprimido/coração funciona bem.

## Solução de problemas comuns

### Erro: `'bob' não é reconhecido` durante `npm install`
Acontece quando o `npm` tenta reconstruir um pacote nativo (geralmente
`react-native-screens`) usando uma ferramenta interna dele que não foi
instalada. É praticamente sempre causado por rodar `npm install` direto, sem
deixar o Expo alinhar as versões primeiro. Solução:
```bash
rmdir /s /q node_modules
del package-lock.json
npx expo install --fix
```
Isso reescreve o `package.json` com as versões de cada pacote nativo
testadas e compatíveis com a versão do Expo do projeto (SDK 51), já com
build pronto — não precisa compilar nada localmente.

### Erro: `@notifee/react-native does not contain a valid config plugin`
Esse erro era meu: o notifee **não é** um "config plugin" de Expo, é só uma
biblioteca nativa normal, que funciona via autolinking. Se você baixou uma
versão anterior deste projeto, remova a entrada `"@notifee/react-native"` de
dentro do array `"plugins"` no `app.json` — a versão mais recente deste
pacote já vem corrigida.

### Erro: `ENOENT ... assets/icon.png` no `expo prebuild`
Faltavam as imagens de ícone. **Já resolvido** neste pacote — os arquivos
`assets/icon.png`, `assets/adaptive-icon.png` e `assets/favicon.png` já vêm
prontos (um placeholder simples, com as cores do app). Troque depois por uma
arte definitiva antes de publicar.

Se aparecer de novo (por exemplo, se apagar a pasta `assets`), rode:
```bash
rm -rf android ios
npx expo prebuild
```
O prebuild recria as pastas nativas do zero usando os ícones da `assets/`.

### Erro: `Failed to resolve the Android SDK path` / `'adb' não é reconhecido`
Isso significa que o **Android Studio** (que traz o SDK e o `adb`) não está
instalado ou não está configurado no PATH do Windows. Você tem duas opções:

**Opção A — Instalar o Android Studio (build local, mais controle)**
1. Baixe em https://developer.android.com/studio
2. Na instalação, marque para instalar o "Android SDK" e o "Android Virtual Device"
3. Depois de instalado, configure as variáveis de ambiente no Windows:
   - Abra "Editar as variáveis de ambiente do sistema"
   - Crie uma variável `ANDROID_HOME` apontando para
     `C:\Users\SEU_USUARIO\AppData\Local\Android\Sdk`
   - Edite a variável `Path` e adicione:
     - `%ANDROID_HOME%\platform-tools`
     - `%ANDROID_HOME%\emulator`
4. Feche e abra o PowerShell de novo (as variáveis só valem em terminais novos)
5. Teste com `adb --version` — se responder, está certo
6. Rode `npx expo run:android` novamente

**Opção B — Usar o EAS Build (build na nuvem, não precisa instalar nada local)**
Essa é a opção mais simples se você só quer gerar o `.apk`/`.aab` para testar
ou publicar, sem lidar com SDK, emulador etc. no seu PC:
```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android --profile preview
```
O EAS compila na nuvem da Expo e te dá um link para baixar o `.apk` (perfil
`preview`) ou o `.aab` pronto pra Play Store (perfil `production`). É gratuito
até um certo número de builds por mês.

> Atenção: como o app usa notifee (som customizado, alarme em tela cheia), o
> **EAS Build também precisa do arquivo de som** (`alarme_remedio.mp3`) já
> commitado no projeto antes do build — sem ele o app compila, mas o alarme
> não vai tocar.

## Publicando nas lojas

**Google Play**
```bash
npx expo prebuild
cd android && ./gradlew bundleRelease
```
Gera o `.aab` em `android/app/build/outputs/bundle/release/`. Suba no
Google Play Console (custa USD 25, taxa única).

**App Store**
```bash
npx expo run:ios --configuration Release
```
Arquive pelo Xcode e envie via Transporter/App Store Connect. Requer conta
Apple Developer (USD 99/ano).

## Estrutura do projeto

```
medalerta/
├── App.tsx                          # navegação + escuta de alarmes
├── app.json                         # permissões e config nativa
├── src/
│   ├── types.ts
│   ├── db/database.ts               # SQLite local
│   ├── services/
│   │   ├── notifications.ts         # agendamento e canal de alarme
│   │   └── ads.ts                   # AdMob
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── AddMedicationScreen.tsx
│   │   ├── AlarmScreen.tsx          # tela de alarme em tela cheia
│   │   └── SettingsScreen.tsx
│   └── components/MedicationCard.tsx
```

## Ideias para evoluir depois
- Botão de emergência para avisar um familiar via WhatsApp se a pessoa não confirmar a tomada em X minutos
- Relatório semanal de adesão ao tratamento (para levar ao médico)
- Modo "cuidador": um familiar acompanha remotamente pelo celular dele
- Leitura em voz alta do nome do remédio (acessibilidade)
