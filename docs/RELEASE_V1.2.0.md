# MedAlerta v1.2.0 — melhorias implementadas

## Núcleo
- Projeção de estoque por consumo diário.
- Data estimada de término do estoque.
- Estoque mínimo e estados normal/atenção/crítico/sem estoque.
- Alerta de estoque na tela inicial.
- Reposição/ajuste manual.
- Desconto automático da quantidade consumida ao confirmar uma dose.
- Quantidade por dose e unidade de estoque persistidas no SQLite.
- Migração automática das colunas de estoque para instalações existentes.

## Adesão
- Resumo de adesão na Home.
- Tomadas, adiamentos e perdas visíveis.
- Registro de quantidade consumida.

## Acessibilidade
- Modo Fácil persistente.
- Textos maiores.
- Botões de ação ampliados.
- Labels de acessibilidade nos controles críticos.
- Tela de alarme com ação principal em destaque.

## Alarme
- Botão para testar o alarme completo.
- Vibração e TTS no alerta.
- Adiamento limitado e comunicação ao cuidador após adiamentos excessivos.
- Alerta quando o estoque fica baixo ou chega a zero.

## Cadastro
- Unidade do estoque.
- Quantidade consumida por dose.
- Estoque mínimo.
- Observações.

## Release
- Versão do aplicativo: 1.2.0
- Android versionCode: 3
- iOS buildNumber: 3
- Expo SDK: 57

## Pendências externas antes da publicação
- Instalar dependências e regenerar package-lock em ambiente Node 22.13+.
- Executar `npx expo-doctor` e `npm run typecheck`.
- Executar build EAS de produção e testar o AAB em aparelho físico.
- Substituir IDs placeholder do AdMob pelos IDs reais da conta de produção.
- Validar notificações/alarmes em Android físico, inclusive aparelho bloqueado, reiniciado e com economia de bateria.
- Finalizar Play Console, Data Safety, política de privacidade pública, screenshots e demais metadados.
