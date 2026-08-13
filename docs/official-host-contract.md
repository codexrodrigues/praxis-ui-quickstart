# Official host contract

`praxis-ui-quickstart` is the executable Angular adoption host. It is not the public documentation owner and it does not redefine Praxis metadata or configuration semantics.

## Ownership

| Surface | Canonical owner |
| --- | --- |
| Angular runtime and public packages | `praxis-ui-angular` |
| Schema, `x-ui`, actions, surfaces and capabilities | `praxis-metadata-starter` |
| Runtime configuration, authoring persistence and ETag | `praxis-config-starter` |
| Reference backend and operational data | `praxis-api-quickstart` |
| Executable Angular adoption examples | `praxis-ui-quickstart` |
| Public documentation, guides and playground discovery | `praxis-ui-landing-page` / `praxisui.dev` |

## Published example inventory

`public/examples.manifest.json` is the machine-readable inventory owned by this host. It records only executable examples that are present in this repository. The landing may synchronize and project this inventory, but must not maintain a competing hand-authored list.

An official example must declare its stable key, public route, source file, resource paths, runtime packages, category and executable status. The manifest also records the exact PraxisUI package train used by the deployed host.

Run `npm run validate:official-host` before build or deployment. The gate rejects missing routes or source files, duplicate identities, undeclared packages, mixed PraxisUI versions, mixed Angular runtime patches and non-HTTPS public endpoints.

Pull requests and `main` are checked by `.github/workflows/ci.yml`. A successful CI run on `main` may trigger `.github/workflows/deploy-production.yml`, which authenticates through Google Workload Identity Federation, deploys the validated revision and verifies the manifest from the public Firebase URL. A manual deployment fails closed when the required repository variables are absent.

## Publication flow

1. Implement and validate the example in this host.
2. Add it to `public/examples.manifest.json` in the same change.
3. Publish the quickstart through its official Firebase workflow.
4. Synchronize the manifest into the landing publication pipeline.
5. Publish documentation only after the hosted example and its backend dependency pass smoke validation.

Local `../praxis-ui-angular/dist` mappings are validation infrastructure only. Production builds and official example evidence must resolve published `@praxisui/*` packages.

## Performance baseline

The first production build on the aligned `9.0.5-rc.10` train produces a 10.40 MB initial raw bundle (about 1.75 MB estimated transfer). The Angular budget warns above 9 MB and fails above 11 MB. This is an explicit adoption-host baseline, not a performance target: subsequent work must reduce eager runtime imports and must not raise the failure ceiling without a measured architectural review.
