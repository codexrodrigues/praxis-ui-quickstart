# Configuração exata (produção / Render) — API `praxis-api-quickstart`

Use os valores abaixo exatamente como estão (sem espaços extras). Depois, faça o redeploy no Render.

Variáveis obrigatórias (demo pública, cross‑origin com cookies)
- APP_SECURITY_CSRF_DISABLE
  - true
- APP_SESSION_COOKIE_NAME
  - PRAXIS_HEROES
- APP_SESSION_SAMESITE
  - None
- APP_SESSION_SECURE
  - true
- CORS_ALLOWED_ORIGINS
  - https://praxis-ui-4e602.web.app,https://praxis-ui-4e602.firebaseapp.com
- SPRING_PROFILES_ACTIVE
  - prod

Liberar leitura SEM autenticação (modo recomendado para a vitrine)
- APP_SECURITY_READ_OPEN
  - true
- APP_SECURITY_READ_OPEN_WHITELIST
  - /auth/**,/schemas/**,/api/**/schemas/**,/api/**/schema/**,/api/**/all,/api/**/filter,/api/**/options/**,/swagger-ui/**,/v3/api-docs/**,/swagger-ui.html

Observações importantes
- Os padrões usam curingas: `**` (dois asteriscos). Não use barras duplas (ex.: `/api//filter`) — isso não casa com nada.
- O endpoint de schemas agregados é fora de `/api`: por isso incluímos `/schemas/**` (necessário para `/schemas/filtered`).
- A lista acima libera: schemas (UI e agregador), listagem (`/all`), filtro (`/filter`), opções (`/options/**`) e documentação (Swagger UI + OpenAPI).

Alternativa — manter leitura restrita (não recomendado para demo)
- APP_SECURITY_READ_OPEN=false
- APP_SECURITY_READ_OPEN_WHITELIST (mesmo valor acima)
- E no `SecurityConfig`, garanta que POST seja permitido nos caminhos abertos (se sua implementação atual só libera GET). Exemplo:
  - requestMatchers(HttpMethod.POST, "/api/**/filter", "/api/**/options/**").permitAll()

Checklist de validação (depois do redeploy)
- GET /schemas/filtered?... → 200/304
- POST /api/human-resources/funcionarios/filter?page=0&size=5 → 200 (ou 204 + body paginado)
- GET /api/human-resources/funcionarios/all → 200
- GET /swagger-ui/index.html e /v3/api-docs → 200

Dicas
- Se ainda aparecer 403 em `/filter`, verifique se o navegador está bloqueando cookies third‑party. Para a vitrine, o modo `READ_OPEN=true` evita depender de sessão.
