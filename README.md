# Praxis UI Quickstart (Angular 20+)

Aplicação de demonstração oficial para o framework Praxis UI.

- Angular 20+ com componentes standalone e Material 3 (tema escuro)
- Padrão de edição contextual com side-sheet usando rota auxiliar
- Conexão com Praxis API Quickstart (Spring Boot)
- Estrutura de pastas por features, menus e rotas já configurados

## Requisitos
- Node.js 18+ e npm
- Angular CLI 20+ (`npm i -g @angular/cli@^20`)
- Backend: Praxis API Quickstart (Spring Boot) em `/mnt/d/Developer/praxis-api-quickstart`

## Como rodar
1. Instale as dependências:
   ```bash
   npm install
   ```
2. (Opcional) Ajuste o proxy se a API estiver em outra porta/host: `proxy.conf.js`.
   - Sobrescreva o alvo: `PAX_PROXY_TARGET=http://127.0.0.1:8088 npm start`
   - Liga debug do proxy: `PROXY_LOG_LEVEL=debug npm start`
   - Em WSL, o proxy tenta descobrir o IP do host (lê `/etc/resolv.conf`).
3. Inicie o backend (Praxis API Quickstart):
   - Abra o projeto em `/mnt/d/Developer/praxis-api-quickstart`
   - Rode via IDE ou `./mvnw spring-boot:run` (porta padrão 8088)
4. Inicie o frontend:
   ```bash
   npm start
   ```
   Acesse: http://localhost:4200

O projeto usa proxy para `/api` → `http://localhost:8088` (veja `proxy.conf.js`).

## Variáveis necessárias (Backend)
O projeto de backend (Praxis API Quickstart) utiliza as variáveis abaixo (todas com defaults em `application.properties`). Ajuste conforme o ambiente de deploy:

- `APP_JWT_SECRET` — segredo HMAC do JWT (obrigatório em produção)
- `APP_JWT_EXP_MIN` — expiração do token (minutos, default 60)
- `APP_SESSION_COOKIE_NAME` — nome do cookie de sessão (default `SESSION`)
- `APP_SESSION_SECURE` — `true` em produção (HTTPS), `false` em dev
- `APP_SESSION_SAMESITE` — `None` quando frontend e backend estão em domínios diferentes; `Lax` caso contrário
- `CORS_ALLOWED_ORIGINS` — origens permitidas (ex.: `https://<SEU_SITE>.web.app,https://<SEU_SITE>.firebaseapp.com,https://seu-dominio.com`)
- `PORT` — porta do backend (default 8088)

Observação para cookies cross-site: se o frontend (Firebase Hosting) e backend estiverem em domínios diferentes, habilite `APP_SESSION_SECURE=true` e `APP_SESSION_SAMESITE=None` e sirva o backend sob HTTPS.

## Variáveis e segredos (Frontend/CI)
Para builds de produção, o frontend injeta a URL base da API no arquivo `src/environments/environment.production.ts` via CI:

- `API_BASE_URL` (GitHub Secret) — URL base do backend incluindo `/api` (ex.: `https://api.suaempresa.com/api`)
  - Em dev, o app usa `/api` via proxy local; em produção, esta variável deve apontar para o host real.

## Estrutura
```
src/
  app/
    core/                  # Serviços, layout, guards
      layout/              # Shell com sidenav + side-sheet
      services/            # ApiClient + serviços de domínio
      guards/              # (placeholder) auth guard
    features/
      heroes/
        perfis/            # lista + editor (side-sheet auxiliar)
        habilidades/
        reputacoes/
      operacoes/
        missoes/
        ameacas/
        resumo/
      compliance/
        incidentes/
        indenizacoes/
        indicadores/
      shared/              # tipos e utilitários compartilhados
    app.routes.ts          # rotas raiz + rotas auxiliares
  assets/dashboards/
  styles.scss              # tema dark M3 + gradientes + glassmorphism
```

## Rotas principais
- `/heroes/perfis` (com editor contextual em rota auxiliar `aside`)
- `/heroes/habilidades`
- `/heroes/reputacoes`
- `/operacoes/missoes`
- `/operacoes/ameacas`
- `/operacoes/resumo`
- `/compliance/incidentes`
- `/compliance/indenizacoes`
- `/compliance/indicadores`

### Edição contextual (side-sheet)
O layout define um `router-outlet` nomeado `aside`. Ao acionar edição em Perfis, é feita a navegação para a rota auxiliar, por exemplo:
```
/(aside:heroes/perfis/123/editar)
```
Isso mantém a rota principal visível e abre a folha lateral (side-sheet) com o editor.

## Tema escuro (Material 3)
- Definido em `src/styles.scss` usando tokens do Material e `@use '@angular/material' as mat;`
- Gradiente de fundo + classe `glass-panel` para efeito glassmorphism (backdrop blur)

## Integração com API
- `ApiClientService` usa `environment.apiBaseUrl`.
- Serviços:
  - `HeroesService`: perfis, habilidades, reputações
  - `OperacoesService`: missões, ameaças, resumo
  - `ComplianceService`: incidentes, indenizações, indicadores

Endpoints esperados (exemplos):
- `GET /api/human-resources/habilidades`, `GET /api/human-resources/ameacas`, `GET /api/human-resources/vw-indicadores-incidentes` etc.
- Ajuste os serviços conforme a taxonomia real da API; por padrão, o app demonstra o fluxo e chamadas básicas.

Para um passo‑a‑passo de como alinhar os endpoints com a API real (incluindo mapeamentos de DTO → modelos locais e checagem de sessão), veja: `docs/ENDPOINTS-CONFIG.md`.

> Dica: ajuste `environment.development.ts` ou o `proxy.conf.json` conforme a porta/host da API.

## Próximos passos
- Ligar formulários do editor às entidades reais da API
- Adicionar autenticação/guard (quando necessário)
- Criar testes e validação de tipos mais detalhada

## Documentação de Integração do Praxis UI
- Guia passo‑a‑passo (tokens, providers, tema M3, shims e erros comuns):
  - `docs/PraxisUI-Integration-Guide.md`

---
Feito com ❤ para o ecossistema Praxis.

## CI no GitHub e Deploy no Firebase

Arquivos adicionados no repositório:

- Workflow de CI: `.github/workflows/ci.yml`
  - Faz build de produção em PRs e pushes, com cache de dependências.
  - Injeta `API_BASE_URL` (se definido em Secrets) substituindo o placeholder de `src/environments/environment.production.ts`.
  - Publica o artefato de build em `dist/`.

- Workflow de Deploy: `.github/workflows/deploy-firebase.yml`
  - Em pushes para `main`, compila e publica no Firebase Hosting (canal `live`).
  - Usa a ação oficial `FirebaseExtended/action-hosting-deploy`.
  - Projeto/Hosting definidos para: `projectId: praxis-ui-4e602` e `site: praxis-ui-4e602`.

- Config Firebase: `firebase.json` e `.firebaserc`
  - `public: dist/praxis-ui-quickstart`
  - Rewrites SPA → `index.html`
  - Cache longo para assets estáticos

### Passos de configuração
1) Projeto e site do Firebase
   - projectId: `praxis-ui-4e602`
   - site (Hosting): `praxis-ui-4e602`

2) Gerar chave de serviço (Service Account)
   - Console Firebase → Configurações do Projeto → Contas de serviço → Gerar nova chave privada
   - Salve o JSON e crie em GitHub Secrets:
     - `FIREBASE_SERVICE_ACCOUNT` — conteúdo JSON da chave

3) Definir a URL da API no GitHub
   - Em GitHub Secrets do repositório, adicione:
     - `API_BASE_URL` — ex.: `https://api.suaempresa.com/api`

4) Ajustar CORS no backend
   - Defina `CORS_ALLOWED_ORIGINS` com as origens do Firebase Hosting:
     - `https://<SEU_SITE>.web.app,https://<SEU_SITE>.firebaseapp.com` e/ou seu domínio customizado
   - Para cookie cross-site, habilite `APP_SESSION_SECURE=true` e `APP_SESSION_SAMESITE=None`.

5) Pipeline
   - Ao fazer push em `main`, o CI compila e o deploy roda automaticamente para Hosting (`channelId: live`).
   - Em PRs, o CI compila e anexa o artefato `dist` para inspeção.

### Build local de produção (opcional)
Se quiser simular o build de produção com uma API específica, substitua o placeholder manualmente:

```bash
sed -i "s#API_BASE_URL#https://api.suaempresa.com/api#g" src/environments/environment.production.ts
npm run build -- --configuration production
```
