import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const MANIFEST_FILENAME = 'denna-repo.denna-spec.json';

export function prepareManifest(cwd, newVersion) {
  const manifestPath = join(cwd, MANIFEST_FILENAME);
  if (!existsSync(manifestPath)) {
    throw new Error(`${MANIFEST_FILENAME} not found at ${cwd}`);
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf-8'));
  manifest.metadata.version = newVersion;
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
}

export async function prepare(pluginConfig, context) {
  const { nextRelease, cwd, logger } = context;
  logger.log(`Updating ${MANIFEST_FILENAME} version to ${nextRelease.version}`);
  prepareManifest(cwd, nextRelease.version);
}
