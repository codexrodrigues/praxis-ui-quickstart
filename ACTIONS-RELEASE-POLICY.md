# Actions no fechamento de versões


O padrão durante desenvolvimento é zero execuções remotas. Valide localmente o escopo alterado; commits, PRs, documentação interna e conclusão de tarefas não são motivos para iniciar Actions. Use os workflows manuais somente no fechamento autorizado de uma versão/publicação ou na prova necessária do host já implantado. Não use `[skip ci]` como mecanismo principal nem desabilite checks/proteções para economizar.

Antes de push, tag ou dispatch, confira os gatilhos reais de `.github/workflows/`. Tags de release publicam artefatos: não criá-las para testar a automação. Diagnostique localmente antes de repetir um job; conserve a evidência da revisão e dos artefatos usados. Monitores operacionais explicitamente mantidos são independentes do CI de commits. Consulte [ACTIONS-RELEASE-POLICY.md](ACTIONS-RELEASE-POLICY.md) para os pontos de entrada e recuperação.

## Fluxo deste repositório

Execute `Deploy Production` (`deploy-production.yml`) via dispatch em `main` somente para a publicação planejada. Ele chama o gate completo de `ci.yml`, que gera e sela o build. O deploy consome o artefato da mesma execução/SHA, confere repositório, lockfile e hashes e remove o predeploy somente da configuração temporária `.firebase.release.json`. O `firebase.json` original conserva o fluxo local. WIF, contrato do host e manifesto publicado continuam validados. Artefato ausente/expirado exige nova validação.
