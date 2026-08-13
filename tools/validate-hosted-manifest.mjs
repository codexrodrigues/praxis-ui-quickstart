const baseUrl = String(process.env.HOSTED_QUICKSTART_URL ?? 'https://praxis-ui-4e602.web.app')
  .replace(/\/+$/, '');
const expectedTrain = process.env.EXPECTED_PRAXIS_TRAIN;

const response = await fetch(`${baseUrl}/examples.manifest.json`, {
  headers: { Accept: 'application/json' },
  signal: AbortSignal.timeout(15000),
});

if (!response.ok) {
  throw new Error(`[hosted-manifest] HTTP ${response.status} from ${response.url}`);
}

const manifest = await response.json();
if (manifest.schemaVersion !== 'praxis.quickstart-examples/v1') {
  throw new Error(`[hosted-manifest] Unsupported schemaVersion: ${manifest.schemaVersion}`);
}
if (manifest.owner !== 'praxis-ui-quickstart') {
  throw new Error(`[hosted-manifest] Unexpected owner: ${manifest.owner}`);
}
if (!Array.isArray(manifest.examples) || manifest.examples.length === 0) {
  throw new Error('[hosted-manifest] The published inventory has no examples.');
}
if (expectedTrain && manifest.packageTrain !== expectedTrain) {
  throw new Error(
    `[hosted-manifest] Expected PraxisUI ${expectedTrain}, received ${manifest.packageTrain}.`,
  );
}

console.log(
  `[hosted-manifest] OK: ${manifest.examples.length} examples published with PraxisUI ${manifest.packageTrain}.`,
);
