# Production host provisioning

This runbook is the administrator handoff for the official Quickstart host at `https://praxis-ui-4e602.web.app`. Application contributors do not need Google Cloud credentials, and releases must not use service-account keys or local `firebase deploy` commands.

## Fixed scope

| Setting | Value |
| --- | --- |
| Google Cloud project | `praxis-ui-4e602` |
| Google Cloud project number | `994812758115` |
| GitHub repository | `codexrodrigues/praxis-ui-quickstart` |
| Permitted branch | `refs/heads/main` |
| Workload Identity pool | `github-actions` |
| Provider | `praxis-ui-quickstart` |
| GitHub environment | `production` |

The project number is present in the published Firebase application configuration. An administrator must still verify it with `gcloud projects describe` before provisioning.

## Administrator prerequisites

- Authenticate `gcloud` with an account authorized to manage IAM, service accounts and Workload Identity Federation in this project.
- Review the commands before execution and retain the command output as operational evidence.
- Use a dedicated deployment service account. Do not reuse the landing-page identity from the separate `praxisui-dev` project.

## Provision keyless deployment

The following commands require PowerShell 7.3 or newer, intentionally stop on native-command errors and use fixed project and repository identities. The service-account ID can follow the proposed name unless the organization has a governed naming standard. If a create command reports that a resource already exists, stop and verify its policy instead of replacing it.

```powershell
$ErrorActionPreference = 'Stop'
$PSNativeCommandUseErrorActionPreference = $true
$quickstartProjectId = 'praxis-ui-4e602'
$quickstartProjectNumber = '994812758115'
$quickstartPoolId = 'github-actions'
$quickstartProviderId = 'praxis-ui-quickstart'
$quickstartRepository = 'codexrodrigues/praxis-ui-quickstart'
$quickstartServiceAccountId = 'firebase-hosting-deployer'
$quickstartServiceAccount = "$quickstartServiceAccountId@$quickstartProjectId.iam.gserviceaccount.com"

gcloud projects describe $quickstartProjectId --format='value(projectNumber)'
gcloud services enable iamcredentials.googleapis.com sts.googleapis.com firebasehosting.googleapis.com serviceusage.googleapis.com --project=$quickstartProjectId

gcloud iam service-accounts create $quickstartServiceAccountId --project=$quickstartProjectId --display-name='Praxis UI Quickstart Firebase Hosting deployer'

gcloud projects add-iam-policy-binding $quickstartProjectId --member="serviceAccount:$quickstartServiceAccount" --role='roles/firebasehosting.admin'
gcloud projects add-iam-policy-binding $quickstartProjectId --member="serviceAccount:$quickstartServiceAccount" --role='roles/serviceusage.apiKeysViewer'

gcloud iam workload-identity-pools create $quickstartPoolId --project=$quickstartProjectId --location='global' --display-name='GitHub Actions'

gcloud iam workload-identity-pools providers create-oidc $quickstartProviderId `
  --project=$quickstartProjectId `
  --location='global' `
  --workload-identity-pool=$quickstartPoolId `
  --issuer-uri='https://token.actions.githubusercontent.com' `
  --attribute-mapping='google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner,attribute.ref=assertion.ref' `
  --attribute-condition="assertion.repository == '$quickstartRepository' && assertion.repository_owner == 'codexrodrigues' && assertion.ref == 'refs/heads/main'"

$quickstartPrincipal = "principalSet://iam.googleapis.com/projects/$quickstartProjectNumber/locations/global/workloadIdentityPools/$quickstartPoolId/attribute.repository/$quickstartRepository"
gcloud iam service-accounts add-iam-policy-binding $quickstartServiceAccount --project=$quickstartProjectId --role='roles/iam.workloadIdentityUser' --member=$quickstartPrincipal
```

If the shared `github-actions` pool already exists, the pool creation command must not be repeated. Describe the existing pool and confirm its ownership before creating only the dedicated provider.

## Verify before configuring GitHub

```powershell
gcloud projects describe $quickstartProjectId --format='value(projectNumber)'
gcloud iam service-accounts describe $quickstartServiceAccount --project=$quickstartProjectId
gcloud iam workload-identity-pools providers describe $quickstartProviderId --project=$quickstartProjectId --location='global' --workload-identity-pool=$quickstartPoolId --format='yaml(name,state,attributeMapping,attributeCondition)'
gcloud iam service-accounts get-iam-policy $quickstartServiceAccount --project=$quickstartProjectId
```

The reported project number must equal `994812758115`; the provider condition must name only this repository and `main`; and the service-account policy must contain the repository-scoped principal set.

## Configure repository variables

These identifiers are not secrets. Set them only after the Google Cloud verification succeeds:

```powershell
$quickstartProviderName = "projects/$quickstartProjectNumber/locations/global/workloadIdentityPools/$quickstartPoolId/providers/$quickstartProviderId"
gh variable set GCP_WORKLOAD_IDENTITY_PROVIDER --repo=$quickstartRepository --body=$quickstartProviderName
gh variable set GCP_FIREBASE_DEPLOY_SERVICE_ACCOUNT --repo=$quickstartRepository --body=$quickstartServiceAccount
```

The `production` environment already restricts deployment to protected branches. Repository rules must keep `main` protected.

## Deploy and accept

1. Dispatch `Deploy Production` on `main` in GitHub Actions.
2. Confirm that authentication uses OIDC/WIF and that no credential file or long-lived key is introduced.
   The workflow temporarily pins `firebase-tools@14.27.0` because v15 has a confirmed ADC/WIF timeout regression ([firebase/firebase-tools#10726](https://github.com/firebase/firebase-tools/issues/10726)). Remove the pin only after an upstream-fixed version passes this same keyless deployment proof.
3. Confirm that the deployed SHA is the validated `main` revision.
4. Require the workflow's post-deploy `validate:hosted-manifest` step to pass.
5. Independently confirm that `https://praxis-ui-4e602.web.app/examples.manifest.json` returns `application/json` and package train `9.0.5-rc.10`.
6. Only then promote the corresponding landing-page documentation PR.

## Revoke or roll back access

If the repository, branch, project or service-account ownership is wrong, do not deploy. Remove the two GitHub variables, disable the provider, and remove the repository principal from the service-account policy before investigating. Deleting the last good Hosting release is not part of identity rollback; Firebase Hosting release rollback must follow the project's operational retention policy.

## Authoritative references

- [Google Cloud: Workload Identity Federation with deployment pipelines](https://cloud.google.com/iam/docs/workload-identity-federation-with-deployment-pipelines)
- [Google Cloud: Firebase Hosting roles and permissions](https://cloud.google.com/iam/docs/roles-permissions/firebasehosting)
- [Firebase: product-level predefined roles](https://firebase.google.com/docs/projects/iam/roles-predefined-product)
- [google-github-actions/auth: Workload Identity Federation](https://github.com/google-github-actions/auth#workload-identity-federation)
