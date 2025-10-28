Codex Agents — Guia do Projeto

Escopo: Este arquivo orienta agentes (Codex CLI) que trabalham neste repositório UI Quickstart e aponta para projetos relacionados (API Java e libs Angular) usados durante o desenvolvimento e validação.

Diretórios relacionados

- UI Quickstart (Angular, este repo)
  - Raiz: .
  - Principais pontos: `src/app`, `src/assets`, `src/app/app.config.ts`, `src/app/app.routes.ts`.
  - Execução (dev): `npm start` (usa `proxy.conf.js`).
  - Build (prod): `npm run build` (lê `src/assets/app-config.prod.json`).

- Libs Angular (Praxis UI Workspace)
  - Workspace: /mnt/d/Developer/praxis/frontend-libs/praxis-ui-workspace
  - Artefatos usados (dist):
    - /mnt/d/Developer/praxis/frontend-libs/praxis-ui-workspace/dist/praxis-list
    - /mnt/d/Developer/praxis/frontend-libs/praxis-ui-workspace/dist/praxis-manual-form
  - Mapeamento TS: ver `tsconfig.json` (entradas `@praxisui/list` e `@praxisui/manual-form`).
  - Observação: mantenha a versão Angular das libs alinhada com a do host para evitar erros de compilação.

- API Java (Spring Boot – Quickstart)
  - Repo: /mnt/d/Developer/praxis-api-quickstart
  - Produção: Render Free; autenticação via cookies (SESSION, XSRF-TOKEN) + CSRF.
  - Na UI, base da API é resolvida por `AppConfigService` (evite hardcode de `/api` em produção).

- Lib Java (se aplicável)
  - Não informado neste contexto. Caso exista um módulo comum Java separado, adicione o caminho aqui para referência.

Integração entre projetos

- Base de API: `src/assets/app-config.json` (dev) e `src/assets/app-config.prod.json` (prod) definem `apiBaseUrl`.
- Cookies/CSRF: a UI usa `credentialsInterceptor` (withCredentials) e `xsrfInterceptor` (cabeçalho `X-XSRF-TOKEN`).
- Loader global: `loading.interceptor.ts` rastreia chamadas a `/api`, `/schemas` e `/auth` (relativas/absolutas).
- Proxy dev: `proxy.conf.js` reescreve `/api/*` para o backend durante `npm start`.

Diretrizes para agentes

- Use `apply_patch` para editar arquivos neste repo; não tente modificar diretórios externos (libs/API) a partir daqui.
- Siga o estilo existente e faça mudanças mínimas e focadas.
- Prefira `rg` para buscas e leia arquivos em blocos de até 250 linhas.
- Evite hardcode de URLs absolutas; use `AppConfigService` e/ou `ApiBaseService`.
- Ao depender de libs locais (dist), garanta compatibilidade de versão com o Angular do host; caso contrário, use os pacotes do NPM.

Atualizações futuras

- Se novos módulos (ex.: outros componentes/manual forms) forem adicionados, mantenha esta lista em sincronia.
- Se houver um repositório de "Lib Java" separado, inclua seu caminho nesta seção.

