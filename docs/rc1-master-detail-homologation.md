# Master-detail com pacotes publicados

Consumidor isolado: 22 pacotes `@praxisui/*` em `9.0.68-rc.1`.
Rota: `/examples/master-detail`, porta oficial 4301.

O artefato em `public/recipes/master-detail.ui-composition-plan.json` é uma variante de configuração derivada de `praxis-ui-angular/examples/ai-recipes/praxis-dynamic-page.ergon-archetype-master-detail.ui-composition-plan.artifact.json`, commit `572949f708c9a9061288944215b0bc952da18b5a`. SHA-256: `f575148c3444542bc9335a70c9ecc40e7fdac9e2ba0b2950bb6b586bd5e45477`. O hash identifica a cópia original. A única diferença semântica da variante é `widgets[master].inputs.config.behavior.selection.mode`: `row` → `both`, para expor o seletor explícito já suportado. Sincronizar a partir dessa fonte preservando essa diferença documentada; não evoluir uma semântica paralela neste host.

O host usa `preflightUiCompositionPlan` e o registro de metadados público antes de renderizar `DynamicPageBuilderComponent`. Seleção, transformações, estado e entrega ao detalhe pertencem ao runtime Core. Não há callback local ligando tabela e formulário.

O arquétipo preserva seu filtro separado. Esta é uma prova do artefato existente, não a composição final solicitada com filtros dentro da tabela. A autoria acompanha o toggle do host. O pedido `pageSaveRequested` é persistido por `ASYNC_CONFIG_STORAGE` com identidade estável; o adapter padrão é local. A ponte pública `providePraxisSettingsPanelBridge()` habilita os editores da rota.

Roteiro: estado inicial sem seleção; selecionar funcionário; trocar funcionário; verificar limpeza ao filtrar; recarregar e repetir seleção. Não submeter dados de negócio.

## Evidência de 9 de setembro de 2026

- Preflight aprovou o artefato com o catálogo público; o runtime renderizou tabela, filtro e detalhe vazio.
- Tony Stark → Pepper Potts: título, nome, email, telefone, cargo e departamento foram substituídos no detalhe.
- Com Tony selecionado, filtrar Bruce Wayne retornou 1 de 1 registros e Total selecionado: 0; detalhe voltou ao estado Selecione um funcionário. Selecionar Bruce apresentou seus dados.
- Recarregar voltou ao estado sem seleção e nova seleção de Tony carregou novamente o detalhe. Essa primeira rodada não certificava persistência; a prova complementar abaixo cobre esse caminho.
- `validate:official-host`: 10 exemplos aprovados. Build de produção aprovado; 11/11 testes existentes do host aprovados. Os testes não substituem este roteiro manual.

Limitação confirmada: no modo `selection.mode: row` deste artefato, Espaço não desmarca a linha. O pacote publicado encaminha `onRowKeydown` para `onRowClicked`, que seleciona a linha. A orientação inicial do host foi corrigida; não foi alterado o contrato da biblioteca nem introduzida limpeza via estado local. Limpeza explícita sem alterar filtros continua pendente de avaliação canônica.

Logs: `/private/tmp/rc1-master-detail-build.log` e `/private/tmp/rc1-master-detail-smoke.log`. Nenhum deploy ou nova publicação foi realizado.

## Limpeza direta com configuração existente

Com `selection.mode: both`, o controle Selecionar item 1 foi acionado e carregou Tony Stark. Espaço com foco nesse seletor marcou o controle como desmarcado, anunciou Total selecionado: 0 e restaurou o detalhe vazio. O caminho usa a seleção da tabela e os mesmos links canônicos; não há reset de estado implementado no host. Em `row`, Espaço na linha continua selecionando. A limpeza por teclado no seletor não deve ser descrita como comportamento universal de clique repetido em linha ou rádio.

Classificação: `local-pequena` (configuração e documentação do consumidor); aderência `ja-suportado-so-ux`. Nenhum contrato público novo. Ainda há oportunidade de uma ação de limpeza mais descobrível por ponteiro; este teste não adiciona tal ação.

## Persistência complementar de página

Configurações da página: espaçamento 16px → 20px, Salvar e fechar, Salvar página; confirmação Página salva; recarga e status Página restaurada; editor reaberto com 20px. Restaurado 16px e salvo. Nova seleção de Tony carregou Nome Completo Tony Stark após a restauração. Prova local, não remota. O validador é instanciado conforme o exemplo canônico, não injetado como provider inexistente.

Movimentação de campos no formulário independente: Nome Completo movido para a direita de CPF pelo menu da coluna; salvo; recarregado; ordem CPF → Nome Completo confirmada no runtime e no editor reaberto. Ordem original restaurada e salva. A prova cobre movimentação de coluna com campo no editor publicado, não drag-and-drop.
