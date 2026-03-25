import { readFileSync, existsSync, writeFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { loadManifest, reconcileEntries, MANIFEST_FILENAME } from './manifest-check.mjs';

const cwd = process.cwd();
const actionPath = dirname(new URL(import.meta.url).pathname);

// 1. Load and validate manifest
const manifest = loadManifest(cwd);
if (!manifest) {
  console.error(`ERROR: ${MANIFEST_FILENAME} not found at repo root.`);
  process.exit(1);
}
console.log(`Found ${MANIFEST_FILENAME}: ${manifest.metadata.id} v${manifest.metadata.version}`);

// 2. Entries reconciliation
const { glob } = await import('glob');
const allFiles = await glob('**/*.denna-spec.json', {
  ignore: ['**/node_modules/**'],
  nodir: true,
  cwd
});
const dataFiles = allFiles.filter(f => f !== MANIFEST_FILENAME);

const errors = reconcileEntries(manifest, dataFiles);
if (errors.length > 0) {
  console.error('Entries reconciliation failed:');
  for (const err of errors) {
    console.error(`  ${err}`);
  }
  process.exit(1);
}
console.log(`Entries reconciliation passed (${dataFiles.length} files).`);

// 3. Generate .releaserc.json with absolute plugin path
const releasercTemplate = JSON.parse(readFileSync(join(actionPath, 'releaserc.json'), 'utf-8'));
const releasercStr = JSON.stringify(releasercTemplate, null, 2)
  .replace('"__PREPARE_PLUGIN_PATH__"', `"${join(actionPath, 'prepare-manifest.mjs')}"`);
const generatedReleaserc = join(cwd, '.releaserc.json');
writeFileSync(generatedReleaserc, releasercStr);
console.log('Generated .releaserc.json with prepare-manifest plugin.');

// 4. Run semantic-release
console.log('\nRunning semantic-release...');
try {
  const actionRoot = join(actionPath, '..');
  const srBin = join(actionRoot, 'node_modules', '.bin', 'semantic-release');
  execSync(srBin, {
    cwd,
    stdio: 'inherit',
    env: { ...process.env }
  });
} finally {
  // Clean up the generated .releaserc.json so it doesn't linger in the working tree
  try { unlinkSync(generatedReleaserc); } catch {}
}
