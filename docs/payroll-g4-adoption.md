# Payroll G4 adoption candidate

Baseline: origin/main `4ede8ca3f932ce5441bb1be6fe8320516fef3dc6`, fetched on 2026-10-21. Branch `feat/payroll-g4-ui`; isolated checkout `praxis-plataform/.worktrees/payroll-g4-ui`. Original dirty checkout is untouched. Package lock pins the published PraxisUI rc.34 train; no local library mappings are used.

Classification: public contract / transversal. Normative workspace sources are `docs/engineering/payroll-reactive-p0-p1-20261020/{DECISOES,FECHAMENTO-R1-R4}.md` and `payroll-reactive-p20-20261020/D4-REVISAO.md`. The Java host owns financial rules, request metadata, authorization and parent preconditions. Existing public Core/Dynamic Form APIs cover this adapter; no new generic Angular contract is proposed.

Plan before edits:

1. Add a host-specific event form bridge: read edit snapshot before mounting; preserve event ETag and jointly captured origin; capture destination ETag through configured public readers; materialize the schema's real FormArray with metadata; guard submit through a persistent root validator and verify serialization. Cancel obsolete reads, restore captured snapshots on reset without GET and preserve draft on conflict.
2. Expose event create/edit/move and payroll create/edit/preview; use actual runtime satisfaction and BRL for payroll projections. Preserve backend-owned preview definitions and separate the three payment dates.
3. Update the official example inventory/docs and run focused component tests, official-host validation and a consumer build against installed published packages. Authenticated HTTP/Neon/browser proof remains a separate gate.

Impact: the reactive determinations example page, new event bridge/spec, payroll chart projections, example manifest and adoption documentation. Backend DTO/schema, official landing and HTTP corpus changes belong to the coordinator. No framework library, public export, editor configuration or AI manifest changes are required by this adapter.

Implementation in this candidate:

- The event host mounts edit only after one official event GET validates target identity, strong event ETag, PENDENTE state and the jointly captured origin precondition. Its child has schema/submit URLs, initialValue, resourceId and explicit event ETag, with no resourcePath/readUrl that could trigger another entity GET.
- Readers use separate configured public GenericCrudService instances; the form has its own scoped CRUD instance. Destination reads are cancelled and checked against generation, form identity, entity cycle and current selection. Returning to origin preserves the original origin token.
- The schema must provide a hidden transport FormArray and typed item fields. Missing or visible transport metadata blocks capture. DynamicFormService builds real item groups; a persistent root validator checks capture identity and the official serialized preview. No submit-before event is used as cancellation. Obsolete groups remain invalid.
- Reset restores the captured original draft/tokens without GET, including create's original successful capture; reset cannot acquire a missing token or clear a conflict. Conflict keeps the draft for comparison until an explicit reload. Success closes the editor. Session/scope input changes cancel and discard capture; the parent removes live forms and diagnostics on logout. Corporate consumers must change operationalContext when their actual session/tenant/environment/API scope changes; this reference page has a fixed API and no tenant switcher.
- UI status consults the runtime's unsatisfied determinations; pending ending or a skipped/superseded event alone cannot report success. Payroll charts use BRL. The host does not calculate financial values, refresh tokens on submit or execute automatic retries.
- Payroll edit captures an authorized official detail GET and strong ETag before mounting, rejects unreconciled history or missing base facts, uses the PUT request schema and explicit resource version without a second entity GET, and loads operation-specific diagnostics. The captured read summary distinguishes forecast, scheduled and confirmed payment dates; only the request schema controls editable/submitted fields. Persistent root validation invalidates obsolete forms and keeps conflicts blocked across reset. Explicit reload preserves the prior draft for comparison; success closes the editor. Logout clears the financial snapshot and tokens; login starts a fresh create draft.

Final focused validation (all against installed published `@praxisui/* 10.0.0-rc.34`, Angular framework 21.2.20, Node 22.22.2/npm 10.9.7):

| Gate | Result |
| --- | --- |
| `npm ci --ignore-scripts --no-audit --no-fund` | Passed on the initial 21/10 baseline; dependencies preserved during 22/10 continuation; committed lockfile unchanged; no local library mappings |
| Focused ChromeHeadless component/consumer tests | 33 passed: 18 bridge cases, three real Dynamic Form integrations, one public currency-control boundary round-trip, three page cases, six payroll lifecycle cases and two content cases |
| `npm run validate:official-host` | Passed: 10 examples, one rc.34 train |
| `npm run build -- --progress=false` | Passed, production configuration; no budget changes |
| Source whitespace inspection | Passed |

Reproduce the focused test gate with `CHROME_BIN` set to the locally installed Chrome executable:

```sh
npx ng test --watch=false --progress=false --browsers=ChromeHeadless \
  --karma-config=tools/karma-isolated.conf.cjs \
  '--include=src/app/features/payroll-events/*.spec.ts' \
  '--include=src/app/pages/payroll-editor*.spec.ts' \
  --include=src/app/pages/reactive-determinations-example-page.component.spec.ts \
  --include=src/app/quickstart-content.spec.ts
```

Karma uses an OS-assigned ephemeral port. The first isolated bridge run used Karma's standard port and terminated; no application server or test process remains open. Evidence is in `docs/evidence/payroll-g4/` (custódia local histórica; excluído deste checkpoint). Test stdout has ANSI escapes and trailing whitespace removed only; evidence.json binds source hashes and dependency lock to the run.

The real Dynamic Form integration tests normalize representative schema fixtures, render the package runtime, receive actual formReady/payloadPreview events and inspect mocked HTTP POST/PUT. Edit/move proves a single detail GET, no origin refresh, both captured parents and only the event ETag as If-Match. Payroll edit proves the real package keeps failed determinations unsatisfied and blocks submit, applies mocked authoritative outputs after a new input, disables owned outputs and PUTs the captured ETag with base discounts and forecast; scheduled/confirmed dates do not enter the request. DOM assertions verify tokens are hidden, dates are distinct and status uses a live region. The actual public currency control preserves 0, 0.01, 100 and 999999999999.99 through hydration, keyboard editing and JSON. These are local consumer proofs with mocked transport; they do not certify the final backend-generated schema, credentials, ACL, tenant isolation, persisted state or real HTTP/Neon/UI journey. Screen-reader/manual visual certification and authenticated P5 remain pending. A read-only hosted manifest observation returned the older published rc.27 train; it is not candidate evidence or a deployment performed by this task.

Independent comprehensive review: pending with coordinator/root. Original dirty checkout is untouched; no push, Actions, deployment or release performed. The consumer code and snapshots do not establish G4 completion. The coordinator owns backend schema conformance, corpus/landing updates and the final operational gates.

Derived/editor/skills assessment: official example resourcePaths now include events; no framework editor, exported API or AI manifest changed. Existing canonical Reactive Determinations guidance is adequate for owner selection but needs the G4 operational bridge procedure and proofs (`atualizar-existente`), as already recorded by the workspace coordinator. Canonical skill publication and selective local synchronization remain pending under that work package; no installed skill was edited here.

Continuation on 22/10/2026: writer `/root/g4_ui_finish`, exclusive UI worktree; requested Sol/high for concurrency/UI scope, actual model identity is not exposed in this tool session. Root/coordinator owns independent comprehensive review and backend/corpus/skill integration. Source inspection confirmed final host event create/update annotations declare `formHidden=true` and `submitPolicy=include`; generated HTTP metadata still requires its own operational proof. The added payroll adapter is `ja-suportado-so-ux` / `ja-suportado-mal-materializado`: public read/version, form lifecycle, schema and reactive satisfaction APIs already exist, so no generic Angular contract was added. Canonical local skill checkout was inspected at `../praxis-codex-skills/codex-skills/praxis-form-runtime-submit/SKILL.md`; the Reactive Determinations skill is available installed but absent from that particular checkout, so canonical publication remains a coordinator gate rather than an inferred completed assessment.

Revisão de22/10: folha paga e destino de evento pago/não reconciliado bloqueados antes da confirmação;33testes focais e novo build produção passaram. Transporte permanece simulado; gate real HTTP/Neon não executado.

Follow-up de 22/10: a resposta inicial tardia dos schemas POST conserva o cache de
criação e só atualiza o formulário no modo/ciclo de criação vigente. Ela não
substitui o schema PUT já carregado na edição nem reidrata um ciclo encerrado;
destruir a página cancela essa leitura. Quatro novos interleavings cobrem edição
antes do POST, retorno à criação ainda pendente, ciclo encerrado e destruição.
Os 14 testes focais da página passaram, com transporte simulado; ver
`docs/evidence/payroll-g4/schema-cycle-tests.log` e `schemaCycleCorrection` no
receipt JSON. Os 33 testes/build anteriores continuam vinculados aos hashes
anteriores; não houve novo build, suite combinada de 37 ou jornada HTTP/browser
neste delta. Revisão independente do fix permanece separada da prova focal.

Follow-up UX de 22/10 (`local-pequena`, `ja-suportado-so-ux`): diagnostics só
materializam ausência de determinações após schema carregado e disponível.
Carregamento/503 e schema de edição ainda indisponível mostram um estado de
verificação indisponível; schema `{}` carregado preserva a ausência canônica.
Um schema PUT carregado independentemente permanece visível mesmo após falha do
POST inicial; retornar à criação sem schema mantém o diagnóstico indisponível.
Nenhum componente ou contrato canônico mudou. Passaram 16 testes focais da página
(incluindo os ciclos edit/create) e novo build de produção, registrados em
`diagnosticsAvailabilityCorrection` e nos logs `diagnostics-availability-*` do
diretório de evidência. Não houve HTTP/DB nem mudança de dependências neste delta;
a reprova negativa real pertence ao coordenador. Root revisou fonte/template e os
três cenários DOM após o ajuste por superfície, sem achado material; essa revisão
não certifica E2E positivo. A primeira tentativa do novo cenário falhou somente
porque a asserção comparava o InputSignal em vez de `schema()`; log e diagnóstico
foram preservados no receipt. A suite combinada de 39 não foi repetida neste delta.
Impacto nas skills: `existente-adequada`; nenhuma alteração de guidance necessária.

O coordenador executou depois a reprova negativa real: login, schema 503,
nenhum componente de diagnostics, dois títulos de indisponibilidade e logout 204.
Root inspecionou a captura e encerrou backend/ng serve ao final. Log/status privados
constam de `coordinatorNegativeBrowserEvidence`; essa evidência cobre somente UX
negativa UNCOMPOSED, sem aceite da jornada financeira positiva ou R3.


## Checkpoint de transporte — 24/10/2026

Este documento preserva o histórico da implementação. Caminhos `.worktrees/`, `/tmp/` e diretórios de evidência identificam a máquina de origem; seus logs/recibos brutos não integram o checkpoint e não constituem validação reproduzida nesta publicação. Consultar a passagem `docs/engineering/payroll-reactive-g4-20261021/PASSAGEM-20261024.md` no checkpoint backend. Fontes preservadas em PR draft; reconciliação com main, aceite funcional e integração continuam pendentes. Nenhum ensaio, deploy ou release foi autorizado nesta etapa.

Auditoria de transporte: o recibo inicial tem três fontes divergentes da árvore atual; a correção de schema tem uma. A correção diagnostics/availability possui quatro hashes de fonte correspondentes. Isso preserva o escopo de cada prova; não atesta suite combinada nem novo E2E.
