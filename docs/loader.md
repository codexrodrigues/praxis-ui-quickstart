# Loader global de requisições

Onde está
- Interceptor: `src/app/core/interceptors/loading.interceptor.ts`
- Serviço/componente: `src/app/core/loading/*`
- Inclusão no layout: `src/app/core/layout/shell.component.html` (`<app-global-loading>`) 

Como funciona
- Conta requisições relevantes: `/api/*`, `/schemas*` e `/auth/*` (relativo/absoluto), ignorando assets e pedidos com header `X-Loader-Skip: true`.
- Regras anti‑flicker:
  - `delayMs = 350ms` para começar a exibir
  - `minVisibleMs = 600ms` para manter visível
  - `longWaitMs = 3000ms` para mostrar dica “servidor pode estar iniciando”
- Suporta concorrência: enquanto houver requisições pendentes, mantém o overlay.

Ajustes finos
- Editar `GlobalLoadingService`:
  - `delayMs`, `minVisibleMs`, `longWaitMs`
- Para não contar uma requisição específica, adicionar header `X-Loader-Skip: true`.

Por que no app (e não na lib)
- O comportamento de loading é responsabilidade da aplicação (varia por branding/UX, endpoints e políticas de visibilidade). As libs `@praxisui/*` funcionam sem acoplamento ao loader.

Validação
- Disparar `/api/.../filter` em rede lenta/Render (free tier) e observar:
  - Barra superior + overlay após ~350ms.
  - Dica de lentidão após ~3s.
  - Overlay encerra no mínimo após ~600ms do primeiro paint.

