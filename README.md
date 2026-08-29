# Spectrum AI Mobile

Aplicativo mobile (React Native + Expo) do projeto **Spectrum AI** — uma plataforma de comparação inteligente de veículos com apoio de IA. O app permite que o usuário pesquise veículos, compare especificações lado a lado, visualize resultados detalhados e gerencie o histórico de pesquisas.

## Integrantes

- **Caio Alexandre dos Santos** - RM: 558460
- **Leandro do Nascimento Souza** - RM: 558893
- **Rafael de Mônaco Maniezo** - RM: 556079
- **Vinicius Rozas Pannuci de Paula Cont** - RM: 555338

## Sobre o projeto

O Spectrum AI Mobile é o cliente mobile que consome a API do Spectrum AI (`https://spectrum-ai-api-rest-production.up.railway.app`) e oferece as seguintes funcionalidades principais:

- **Autenticação** com login e registro de usuários, com armazenamento seguro de credenciais (`expo-secure-store`).
- **Home** com perfil do usuário, estatísticas rápidas e pesquisas recentes.
- **Sessões de análise**: toda pesquisa pertence a uma sessão (nome livre, vinculada ao tenant e ao usuário criador). É possível criar sessões pela Home, pela aba Sessões ou no meio do fluxo de pesquisa.
- **Pesquisa de veículos** organizada por categorias, sempre vinculada a uma sessão.
- **Comparação de veículos** lado a lado, com destaque do melhor valor por linha.
  A tela ainda roda sobre dados de demonstração (`src/mocks/compareData.ts`) e exibe
  um aviso explícito disso, enquanto o backend não expõe o endpoint de comparativo.
- **Tela de resultados** alimentada por Server-Sent Events (SSE) para acompanhamento em tempo real do processamento da IA.
- **Histórico de sessões** persistido na API, com nome, data de criação e as pesquisas de cada sessão.
- **Perfil** com identificação do usuário, papel no tenant e saída da conta.
- **Exportação de dados** em dois escopos: a ficha técnica de uma pesquisa (tela de resultados) ou o comparativo com todos os veículos da sessão em um único CSV (tela de detalhe da sessão). O PDF já aparece no menu, mas ainda não é gerado pelo backend.

## Stack tecnológica

- **React Native 0.81** + **Expo 54** (nova arquitetura habilitada)
- **TypeScript**
- **React Navigation** (native stack)
- **TanStack Query** para gerenciamento de estado assíncrono e cache de requisições
- **Axios** para chamadas HTTP
- **react-native-sse** para Server-Sent Events
- **Expo Secure Store** + **AsyncStorage** para persistência local
- **FontAwesome** e **Expo Vector Icons** para ícones
- **Google Fonts (Sora)** via `@expo-google-fonts/sora` (pesos 300–800)
- **react-native-svg** para os elementos gráficos da marca (degradês, anéis, malha)

## Estrutura do projeto

```
src/
├── components/
│   ├── ui/        # DESIGN SYSTEM — primitivos usados por todas as telas:
│   │              #   Txt, Icon, Button, Card, Badge, Field, Sheet, Stepper,
│   │              #   Screen/ScreenHeader, Feedback (skeleton/vazio/erro) e
│   │              #   Spectrum (SpectrumRay, ScanGrid, BrandMark, Progress*)
│   └── *.tsx      # componentes de domínio (SearchCard, SessionCard, SpecTable…)
├── config/        # Configuração de ambiente (URL da API etc.)
├── constants/     # Constantes globais
├── contexts/      # Context providers (AuthProvider, SessionProvider)
├── hooks/         # Hooks customizados (useSearches, useSessions, useVehicles…)
├── mocks/         # Catálogos fixos ainda sem endpoint (categorias, comparativo)
├── navigation/    # Configuração de navegação (RootNavigation)
├── screens/       # Telas da aplicação
│   ├── auth/      # AuthLayout, LoginScreen, RegisterScreen
│   ├── home/      # HomeScreen
│   ├── search/    # SearchScreen, CategoriesScreen, ProcessingScreen
│   ├── sessions/  # SessionsScreen, SessionDetailScreen
│   ├── result/    # ResultScreen, FieldDetailScreen
│   ├── compare/   # CompareScreen
│   └── profile/   # ProfileScreen
├── services/      # Camada de comunicação com a API (auth, searches, sse, etc.)
├── styles/        # theme.ts — todos os tokens de design
├── types/         # Tipagens compartilhadas
└── utils/         # Funções utilitárias
```

## Design system

A interface inteira sai de `src/styles/theme.ts` e de `src/components/ui`. Nenhuma
tela declara cor, fonte ou espaçamento solto — se um valor não existe no tema, ele
entra no tema primeiro.

**A ideia da marca.** *Spectrum* é o produto que varre um espectro de fontes e faz
tudo convergir num dado só. Três elementos carregam essa ideia na interface:

| Elemento | O que é | Onde aparece |
| --- | --- | --- |
| **Spectrum Ray** | Faixa em degradê `#001881 → #2E5BF0 → #83C0FF → #2CE5D5` | Costura entre header e corpo, barras de progresso, aba ativa, feixe da fonte em consulta |
| **Spectrum Flow** | Degradê azul que se desloca devagar (`<SpectrumFlow>`) | Fundo dos atalhos da Home |
| **Scan Grid** | Malha e arcos concêntricos discretos | Fundo de todo header escuro |
| **Procedência como luz** | Oficial / Review / Estimado lidos por intensidade | Ficha técnica, resumo do resultado, detalhe do campo |

**Cores.** `#001881` é o ponto fixo da identidade e a rampa `brand.50…950` foi
construída a partir dele. `#83C0FF` (sky) é o segundo tom oficial; `#2CE5D5` (aqua)
é o acento de assinatura, usado com parcimônia. Os neutros são levemente azulados
para casarem com o azul da marca.

**Tipografia.** Sora, pesos 300 a 800. O peso vem sempre da família (`fontFamily`),
nunca de `fontWeight` — peso sintético sobre fonte custom desanda no Android. Use
sempre `<Txt variant="…">`; `<Text>` direto fica sem a fonte da marca.

**Cor por categoria.** Cada categoria de pesquisa tem matiz próprio
(`theme.hues`), resolvido junto com o ícone por `categoryIdentity(nome)` — a
mesma função serve a tela de categorias, a de resultado e a de comparação, então
"Segurança" é sempre o mesmo verde com o mesmo escudo em qualquer lugar. O azul
segue dono da moldura (headers, botões, navegação); os matizes vivem só dentro do
conteúdo, onde 14 blocos idênticos em azul transformavam a escolha em leitura de
texto em vez de reconhecimento visual. Selecionado, o bloco assume a cor da
categoria no ícone, na moldura e no halo.

Sobre fundo escuro (a tela de processamento) a mesma cor passa por
`liftForDark()`, que sobe só o L em HSL. Misturar com branco resolveria o
contraste mas lavaria o matiz — o laranja de "Motor" viraria salmão e deixaria de
ser reconhecível como a mesma categoria.

**Procedência do dado.** `OFFICIAL` é verde, `REVIEW` é o azul da marca e
`ESTIMATED` é âmbar — deliberadamente não é vermelho: um dado inferido não é um
erro, e vermelho aqui treinaria o usuário a ignorar os alertas de verdade.

**Estados.** Carregamento usa *skeleton* (`SkeletonList`), não spinner; vazio e erro
usam `EmptyState` / `ErrorState`, com ação de saída sempre que houver uma.

**Destaques.** Dicas, avisos e explicações passam por `<Callout>`: selo de ícone
sólido e fundo tingido com moldura no mesmo matiz. Nunca vermelho — dica não é
erro. Use `compact` para hints de uma linha ao lado de um campo.

**Confirmações.** Use `<ConfirmSheet>`, nunca `Alert.alert`. No React Native Web
o `Alert` é literalmente um no-op (`static alert() {}`), então toda confirmação
montada sobre ele — sair da conta, cancelar a pesquisa — simplesmente não
acontecia na versão web.

**Hierarquia dos botões.** `primary` (azul-marinho `#001881`) é sempre o próximo
passo do fluxo, e só existe um por tela. `accent` (azure `#2E5BF0`) é para ações
fortes que não continuam o fluxo — comparar, por exemplo. Depois vêm `secondary`,
`ghost` e `danger`.

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

A URL da API é controlada pela variável de ambiente `EXPO_PUBLIC_API_URL`. Caso não seja definida, o app aponta por padrão para `https://spectrum-ai-api-rest-production.up.railway.app`.

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
