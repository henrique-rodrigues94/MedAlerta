# MedAlerta — Checklist de publicação

## Implementado no código

- [x] Cadastro/edição/exclusão de medicamentos
- [x] Horários e notificações
- [x] Alarme em tela cheia
- [x] Já tomei / adiar / perdido
- [x] Histórico e relatório de adesão
- [x] Funcionamento local/offline
- [x] Onboarding
- [x] Modo cuidador e vinculação
- [x] Backup/compartilhamento JSON
- [x] Leitura em voz alta
- [x] Projeção de estoque
- [x] Status normal/atenção/crítico/sem estoque
- [x] Estimativa de dias restantes
- [x] Data estimada de término do estoque
- [x] Reposição/ajuste manual de estoque
- [x] Acesso à projeção pela tela inicial
- [x] Política de privacidade incluída em `docs/PRIVACY_POLICY.html`
- [x] Tipos compartilhados preparados para quantidade por dose, unidade e estoque mínimo
- [x] Payload de cuidador preparado para token de vínculo

## Ainda depende de execução/ambiente

- [ ] Migrar o projeto Expo SDK 51 para SDK 57 e executar `npx expo install --fix`
- [ ] Regenerar `package-lock.json` depois da migração
- [ ] Rodar `npx expo-doctor`
- [ ] Rodar TypeScript sem erros
- [ ] Gerar build release Android
- [ ] Testar `.aab` em aparelho físico
- [ ] Validar alarmes com aplicativo fechado, bloqueado e após reinicialização
- [ ] Testar Android 13/14/15/16
- [ ] Testar economia de bateria dos principais fabricantes
- [ ] Configurar IDs reais do AdMob
- [ ] Validar consentimento e Data Safety do AdMob
- [ ] Substituir arte placeholder do ícone/splash por arte definitiva
- [ ] Publicar esta política em uma URL HTTPS pública e cadastrá-la no Play Console
- [ ] Preencher declaração de app de saúde no Play Console
- [ ] Preencher Data Safety
- [ ] Preencher classificação indicativa e público-alvo
- [ ] Criar screenshots e Feature Graphic
- [ ] Configurar e-mail de suporte
- [ ] Criar teste interno
- [ ] Criar teste fechado
- [ ] Para contas pessoais novas, manter pelo menos 12 testadores no teste fechado por 14 dias antes de solicitar acesso à produção
- [ ] Solicitar acesso à produção
- [ ] Enviar versão para revisão

## Bloqueadores técnicos antes do release

1. A versão atual do repositório ainda usa Expo SDK 51. Para novas submissões a partir de 31/08/2026, o Google Play exige target Android 16/API 36; o SDK 57 do Expo já usa target API 36.
2. O `package-lock.json` atual foi gerado para a árvore antiga e precisa ser regenerado após a atualização de dependências.
3. Os IDs do AdMob no `app.json` ainda são placeholders.
4. O alarme e as notificações precisam ser validados em build de produção, não apenas em desenvolvimento.
5. A política de privacidade precisa estar publicada em URL pública e ser vinculada no Play Console.

## Comandos finais

```bash
npm install
npx expo install expo@^57.0.0
npx expo install --fix
npx expo-doctor
npx tsc --noEmit
npx expo prebuild --clean
eas build --platform android --profile production
```

Depois do build, instalar o `.aab` pela faixa de teste do Google Play e executar o roteiro de testes antes da produção.
