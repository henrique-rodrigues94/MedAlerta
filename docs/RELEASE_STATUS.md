# MedAlerta — Release Status

## Implementado no código

- Expo SDK 57
- React Native 0.86
- React 19.2.3
- Android target/compile 36 via Expo SDK 57
- Node.js 22.13+ requirement
- Android versionCode 2
- iOS buildNumber 2
- EAS production profile para `.aab`
- Expo Doctor/typecheck scripts
- CI para regenerar `package-lock.json` e validar o projeto
- Controle/projeção de estoque
- Política de privacidade e documentação de publicação

## Bloqueadores externos

- IDs reais do AdMob ainda precisam ser configurados no `app.json`.
- `package-lock.json` precisa ser regenerado pelo `npm install` no CI/local.
- Build Android de produção precisa ser executado no EAS.
- Alarmes/notificações precisam ser validados em aparelhos físicos.
- Play Console precisa ser preenchido e o `.aab` enviado para teste interno.
- Data Safety, classificação indicativa e declarações de saúde/anúncios precisam ser confirmados pelo proprietário do aplicativo.

O aplicativo não deve ser declarado publicado até esses itens serem validados.
