# Spectrum AI Mobile

Aplicativo mobile (React Native + Expo) do projeto **Spectrum AI** — uma plataforma de comparação inteligente de veículos com apoio de IA. O app permite que o usuário pesquise veículos, compare especificações lado a lado, visualize resultados detalhados e gerencie o histórico de pesquisas.

## Integrantes

- **Caio Alexandre dos Santos** - RM: 558460
- **Leandro do Nascimento Souza** - RM: 558893
- **Rafael de Mônaco Maniezo** - RM: 556079
- **Vinicius Rozas Pannuci de Paula Cont** - RM: 555338

## Sobre o projeto

O Spectrum AI Mobile é o cliente mobile que consome a API do Spectrum AI (`https://spectrum-ai-api.onrender.com`) e oferece as seguintes funcionalidades principais:

- **Autenticação** com login e registro de usuários, com armazenamento seguro de credenciais (`expo-secure-store`).
- **Home** com perfil do usuário, estatísticas rápidas e pesquisas recentes.
- **Pesquisa de veículos** organizada por categorias.
- **Comparação de veículos** lado a lado, com detalhamento campo a campo.
- **Tela de resultados** alimentada por Server-Sent Events (SSE) para acompanhamento em tempo real do processamento da IA.
- **Histórico de sessões** persistido na API.

## Stack tecnológica

- **React Native 0.81** + **Expo 54** (nova arquitetura habilitada)
- **TypeScript**
- **React Navigation** (native stack)
- **TanStack Query** para gerenciamento de estado assíncrono e cache de requisições
- **Axios** para chamadas HTTP
- **react-native-sse** para Server-Sent Events
- **Expo Secure Store** + **AsyncStorage** para persistência local
- **FontAwesome** e **Expo Vector Icons** para ícones
- **Google Fonts (Sora)** via `@expo-google-fonts/sora`

## Estrutura do projeto

```
src/
├── components/    # Componentes reutilizáveis de UI
├── config/        # Configuração de ambiente (URL da API etc.)
├── constants/     # Constantes globais
├── contexts/      # Context providers (AuthProvider, SessionProvider)
├── hooks/         # Hooks customizados (ex.: useSearches)
├── mocks/         # Dados mockados para desenvolvimento
├── navigation/    # Configuração de navegação (RootNavigation)
├── screens/       # Telas da aplicação
│   ├── auth/      # LoginScreen, RegisterScreen
│   ├── home/      # HomeScreen
│   ├── search/    # CategoriesScreen, SearchScreen, ProcessingScreen
│   ├── compare/   # CompareScreen
│   └── result/    # ResultScreen, FieldDetailScreen
├── services/      # Camada de comunicação com a API (auth, searches, sse, etc.)
├── styles/        # Temas e estilos compartilhados
├── types/         # Tipagens compartilhadas
└── utils/         # Funções utilitárias
```

## Pré-requisitos

- **Node.js** 18 ou superior
- **npm** (ou yarn/pnpm)
- **Expo Go** instalado no celular (Android/iOS) **ou** um emulador Android / simulador iOS configurado

## Instalação

```bash
git clone https://github.com/<owner>/spectrum-ia-mobile.git
cd spectrum-ia-mobile
npm install
```

## Configuração de ambiente

A URL da API é controlada pela variável de ambiente `EXPO_PUBLIC_API_URL`. Caso não seja definida, o app aponta por padrão para `https://spectrum-ai-api.onrender.com`.

Para apontar para uma API local em desenvolvimento, crie um arquivo `.env` na raiz do projeto:

```env
EXPO_PUBLIC_API_URL=http://192.168.0.10:8000
```

> Em produção a URL **deve** usar HTTPS. Em desenvolvimento, são aceitas URLs `http://` apenas para `localhost`, `127.0.0.1`, `10.0.2.2` (emulador Android) e redes LAN privadas.

## Como executar

```bash
# Inicia o Metro bundler do Expo
npm start

# Executar diretamente em uma plataforma específica
npm run android
npm run ios
npm run web
```

Após executar `npm start`, escaneie o QR code com o app **Expo Go** ou pressione `a` (Android) / `i` (iOS) no terminal para abrir em um emulador.

## Scripts disponíveis

| Script             | Descrição                                      |
| ------------------ | ---------------------------------------------- |
| `npm start`        | Inicia o servidor de desenvolvimento Expo      |
| `npm run android`  | Abre o app no emulador / dispositivo Android   |
| `npm run ios`      | Abre o app no simulador / dispositivo iOS      |
| `npm run web`      | Executa a versão web do app                    |
