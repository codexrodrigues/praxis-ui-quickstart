**Objetivo**
- Orientar a configuração/ajuste dos endpoints do frontend para conversar corretamente com o Praxis API Quickstart.
- Baseado no workspace que já funciona: `/mnt/d/Developer/praxis/frontend-libs/praxis-ui-workspace`.

**Pré‑requisitos (Backend)**
- Projeto: `/mnt/d/Developer/praxis-api-quickstart`.
- Perfil: `SPRING_PROFILES_ACTIVE=dev`.
- Cookie de sessão: `APP_SESSION_COOKIE_NAME=praxis_heroes_dev`.
- CORS (dev): `CORS_ALLOWED_ORIGINS=http://localhost:4200,http://127.0.0.1:4200`.
- Porta padrão: `8088`.

**Proxy (Frontend)**
- Arquivo: `proxy.conf.js`.
- Rotas suportadas: `'/api'`, `'/auth'`, `'/schemas'` → alvo `http://127.0.0.1:8088`.
- O proxy já reescreve `Set-Cookie` para `Domain=localhost` e mantém same‑origin em dev.
- Dica: ligar logs com `PROXY_LOG_LEVEL=debug` e alterar alvo com `PAX_PROXY_TARGET`.

**Autenticação (Cookie HttpOnly)**
- Fluxo: `POST /auth/login` → 204 + `Set-Cookie: praxis_heroes_dev=...`.
- Requisições subsequentes devem enviar cookies: usar `withCredentials: true` (já há interceptor global).
- Checagem de sessão: prefira chamar um endpoint protegido real (ex.: `GET /api/human-resources/bases/all`) e considerar 2xx como autenticado. Evitar depender de `GET /auth/session` para guard.

**Padrão de Endpoints da API**
- Base: sempre sob `/api/human-resources/...` (conforme `ApiPaths.HumanResources`).
- Listagem simples: `GET {recurso}/all`.
- Filtragem/paginação: `POST {recurso}/filter`.
- Schemas (OpenAPI filtrado por recurso): `GET {recurso}/schemas` ou centralizado em `/schemas/filtered`.

**Serviços a ajustar no UI**
- Arquivo: `src/app/core/services/heroes.service.ts`
  - Perfis (view): `GET /api/human-resources/vw-perfil-heroi/all`
    - Mapear para `Perfil`: `funcionarioId → id`, `nomeCompleto → nome`, `codinome`, `scoreMedio → reputacao (string)`.
  - Habilidades: `GET /api/human-resources/habilidades/all`
    - Mapear para `Habilidade`: `id`, `nome`, `nivelPoder → nivel`.
  - Reputações: `GET /api/human-resources/reputacoes/all`
    - Mapear para `Reputacao`: `id`, `titulo` (ex.: "Funcionário {funcionarioId}"), `scorePublico → score`.
- Arquivo: `src/app/core/services/auth.service.ts`
  - `checkSession()`: usar `GET /api/human-resources/bases/all` para validar cookie (2xx = logado).
  - `login()`/`logout()`: podem chamar `'/auth/*'` diretamente ou `'/api/auth/*'` (o proxy reescreve para `'/auth/*'`).

**Placeholders comuns que precisam troca**
- Rotas/serviços que usam `/heroes/...` ou `/operacoes/...` são apenas exemplos; trocar para `/human-resources/...` correspondente.
- Exemplos para ajustes adicionais (se necessários):
  - Missões: `GET /api/human-resources/missoes/all`.
  - Ameaças: `GET /api/human-resources/ameacas/all`.
  - Indicadores: `GET /api/human-resources/vw-indicadores-incidentes/all`.

**Boas práticas**
- Manter `withCredentials: true` via interceptor global.
- Para POST/PUT/DELETE em prod, enviar `X-XSRF-TOKEN` a partir do cookie `XSRF-TOKEN` (já há interceptor). Em dev, o CSRF vem desabilitado por padrão.
- Evitar header `Authorization` quando a sessão é por cookie; não é necessário para esse fluxo.

**Diagnóstico rápido**
- 403 com `Allow: POST` geralmente indica uso de `GET` numa rota que espera `POST /filter` — prefira `.../all` para listagem simples.
- 401 após login sugere cookie não reconhecido: conferir `APP_SESSION_COOKIE_NAME` e refazer o login.
- CORS: em dev, use sempre same‑origin via proxy. Se vir `access-control-allow-origin: *` em respostas do backend, está chamando fora do proxy.

**Arquivos‑chave para tocar**
- `src/app/core/services/heroes.service.ts`
- `src/app/core/services/operacoes.service.ts` (se for alinhar Missões/Ameaças/Resumo)
- `src/app/core/services/compliance.service.ts` (se for alinhar Indicadores/Incidentes/Indenizações)
- `src/app/core/services/auth.service.ts` (checagem de sessão e base do auth)

Seguindo os pontos acima, você reproduz o comportamento já validado no workspace e evita 403/405 por método/rota incorretos e 401 por cookie não reconhecido.

