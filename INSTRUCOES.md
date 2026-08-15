# 🚀 MedAlerta v3.0 — Guia de Atualização

## 🆕 O que há de novo na v3.0

### 👤 Modo Paciente + 👨‍⚕️ Modo Cuidador
O app agora funciona em **dois modos independentes** no mesmo aplicativo:

- **Modo Paciente:** cadastro de remédios, alarmes, relatórios, histórico
- **Modo Cuidador:** acompanha remotamente um ou mais pacientes em tempo real

### 🔗 Vinculação P2P (sem servidor)
- Paciente gera um **código de vinculação** e compartilha via WhatsApp/SMS
- Cuidador recebe o link, abre o app e confirma a vinculação
- **Sem necessidade de backend** — a comunicação é feita via Expo Push Notifications

### 🔔 Alertas em tempo real
O cuidador recebe notificações push quando:
- ✅ O paciente toma o remédio
- ⏰ O paciente adia o remédio (3x seguidas = alerta)
- ❌ O paciente perde o horário (30 min sem resposta)

### 📦 Controle de Estoque
- Cadastre quantos comprimidos/ml tem na caixa
- O app mostra aviso quando o estoque está acabando (≤3 unidades)
- Decrementa automaticamente ao marcar "Já tomei"

---

## 📦 Novas dependências

```bash
npx expo install expo-notifications expo-device expo-speech expo-file-system expo-sharing expo-linking
```

---

## 📁 Arquivos do pacote

```
MedAlerta-v3/
├── App.tsx                              ← Navegação com Modo Paciente/Cuidador
├── INSTRUCOES.md                        ← Este arquivo
└── src/
    ├── types.ts                         ← Tipos unificados (inclui AppMode, SyncPayload)
    ├── context/
    │   └── AppModeContext.tsx            ← Gerencia modo paciente/cuidador
    ├── utils/
    │   └── validators.ts                 ← Validações + gerador de código
    ├── hooks/
    │   └── useAdherence.ts               ← Estatísticas de adesão
    ├── db/
    │   └── database.ts                   ← SQLite + estoque + índices
    ├── services/
    │   ├── notifications.ts              ← Notifee (alarmes locais)
    │   ├── pushNotifications.ts          ← Expo Push (comunicação P2P)
    │   ├── sync.ts                       ← Lógica de vinculação e alertas
    │   ├── tts.ts                        ← Text-to-Speech
    │   └── ads.ts                        ← AdMob
    ├── components/
    │   └── MedicationCard.tsx            ← Card com estoque
    └── screens/
        ├── ModeSelectScreen.tsx          ← Escolha de modo
        ├── HomeScreen.tsx                ← Home do paciente
        ├── AddMedicationScreen.tsx       ← Cadastro com estoque
        ├── AlarmScreen.tsx               ← Alarme + alerta cuidador
        ├── SettingsScreen.tsx            ← Configurações do paciente
        ├── MedicationHistoryScreen.tsx   ← Histórico por remédio
        ├── AdherenceReportScreen.tsx     ← Relatório de adesão
        ├── PatientLinkScreen.tsx         ← Paciente compartilha código
        ├── CaregiverDashboard.tsx        ← Dashboard do cuidador
        └── CaregiverLinkScreen.tsx       ← Cuidador vincula paciente
```

---

## ⚙️ Configuração necessária

### 1. app.json / app.config.js

Adicione o scheme para deep links:

```json
{
  "expo": {
    "scheme": "medalerta",
    "plugins": [
      "expo-notifications"
    ]
  }
}
```

### 2. Expo Push Notifications

Para que o push funcione em produção, você precisa:
- Ter uma conta Expo (gratuita)
- Configurar o `projectId` no `app.json` ou usar EAS
- Em desenvolvimento, funciona no Expo Go com limitações

No arquivo `src/services/pushNotifications.ts`, ajuste:
```typescript
const tokenData = await Notifications.getExpoPushTokenAsync({
  projectId: 'SEU_PROJECT_ID_DO_EXPO', // <-- troque aqui
});
```

Para descobrir seu projectId, rode:
```bash
npx expo config --type public
```

### 3. Som do alarme

Continue colocando `alarme_remedio.mp3` em:
- Android: `android/app/src/main/res/raw/alarme_remedio.mp3`
- iOS: adicione `alarme_remedio.wav` no Xcode

---

## 🔄 Como fazer o commit

```bash
cd /caminho/do/seu/MedAlerta

# Copie os arquivos do pacote v3 para o projeto

# Instale dependências
npx expo install expo-notifications expo-device expo-speech expo-file-system expo-sharing expo-linking

# Commit
git add .
git commit -m "feat: MedAlerta v3.0 - modo paciente/cuidador, vinculação P2P, controle de estoque, alertas push"
git push origin main
```

---

## 📱 Fluxo de uso

### Para o Paciente:
1. Abre o app → "Sou o Paciente"
2. Cadastra remédios normalmente
3. Vai em Configurações → "Vincular cuidador"
4. Toque em "Compartilhar link de vinculação"
5. Envia para o cuidador via WhatsApp

### Para o Cuidador:
1. Instala o mesmo app
2. Abre → "Sou o Cuidador"
3. Toque em "Vincular Novo Paciente"
4. Cola o token recebido ou clica no link enviado pelo paciente
5. Confirma o nome e pronto!

### Alertas automáticos:
- Paciente toma remédio → cuidador recebe ✅
- Paciente adia 3x → cuidador recebe ⚠️
- Paciente não responde em 30min → cuidador recebe ❌

---

## ⚠️ Limitações conhecidas

1. **Push notifications só funcionam em dispositivos físicos** (não em simulador)
2. **Expo Go** suporta push em desenvolvimento, mas para produção é recomendado gerar um **development build**
3. O app precisa de conexão com internet para enviar/receber pushes entre paciente e cuidador
4. Alarmes locais (notifee) funcionam **sem internet**

---

## 🐛 Bugs corrigidos desde a v1.0

| Bug | Solução |
|---|---|
| Alarme não abria com app fechado | Background handler + fullScreenAction |
| Edição resetava data de início | Preserva data original |
| Sem validação de horários | Regex HH:MM |
| Agendamento lento | Promise.all paralelo |
| Teste de som usava canal errado | testarAlarmeReal() com canal correto |
| Sem controle de estoque | Campo estoque + decremento automático |
| Alerta só via WhatsApp | Agora via push notification direto no app |
