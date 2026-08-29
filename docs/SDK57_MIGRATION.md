# Migração para Expo SDK 57

## Estado

O MedAlerta foi preparado para Expo SDK 57, React Native 0.86 e React 19.2.3.

O SDK 57 usa Android compile/target SDK 36 e exige Node.js 22.13 ou superior. A arquitetura nova do React Native é obrigatória no SDK 57.

## Dependências principais

- Expo `~57.0.1`
- React Native `0.86.0`
- React `19.2.3`
- expo-sqlite `~57.0.0`
- expo-notifications `~57.0.14`
- expo-image-picker `~57.0.14`
- expo-linking `~57.0.2`
- expo-status-bar `~57.0.0`
- react-native-google-mobile-ads `16.4.0`

Alguns módulos Expo permanecem na série 56 porque a matriz oficial do SDK 57 os mantém nessa série.

## Instalação local

```bash
nvm use 22.13.0
npm install
npx expo install --check
npx expo-doctor
npm run typecheck
npx expo prebuild --clean
```

## Build de teste

```bash
npx eas build --profile preview --platform android
```

## Build de produção

```bash
npx eas build --profile production --platform android
```

O perfil de produção gera Android App Bundle (`.aab`).

## Antes de publicar

1. Substituir os IDs placeholder do AdMob em `app.json` pelos IDs reais.
2. Confirmar que o projeto AdMob está configurado para produção.
3. Testar notificações, alarmes exatos e tela cheia em aparelho físico.
4. Testar Android 13, 14, 15 e 16.
5. Confirmar política de privacidade e Data Safety.
6. Fazer upload do `.aab` no Play Console em teste interno.
7. Somente depois dos testes, promover para produção.

## Observação sobre Expo Go

O MedAlerta usa código nativo de AdMob e notificações. Portanto, o teste de produção deve ser feito em uma development/release build, não apenas no Expo Go.
