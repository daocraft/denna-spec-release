import { describe, it, expect, beforeEach } from 'vitest';
import { prepareManifest } from '../action/prepare-manifest.mjs';
import { readFileSync, writeFileSync, copyFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

function makeTempDir() {
  const dir = join(tmpdir(), `denna-release-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

describe('prepareManifest', () => {
  let tempDir;

  beforeEach(() => {
    tempDir = makeTempDir();
    copyFileSync(
      join(import.meta.dirname, 'fixtures/denna-repo.denna-spec.json'),
      join(tempDir, 'denna-repo.denna-spec.json')
    );
  });

  it('updates metadata.version in the manifest file', () => {
    prepareManifest(tempDir, '2.3.4');

    const updated = JSON.parse(readFileSync(join(tempDir, 'denna-repo.denna-spec.json'), 'utf-8'));
    expect(updated.metadata.version).toBe('2.3.4');
  });

  it('preserves all other manifest fields', () => {
    prepareManifest(tempDir, '2.3.4');

    const updated = JSON.parse(readFileSync(join(tempDir, 'denna-repo.denna-spec.json'), 'utf-8'));
    expect(updated.metadata.id).toBe('test-repo');
    expect(updated.metadata.kind).toBe('io.denna.repository');
    expect(updated.metadata.name).toBe('Test Repo');
    expect(updated.repository.entries).toEqual(['data/test.denna-spec.json']);
    expect(updated.repository.release.strategy).toBe('semver');
  });

  it('writes formatted JSON with 2-space indent and trailing newline', () => {
    prepareManifest(tempDir, '2.3.4');

    const raw = readFileSync(join(tempDir, 'denna-repo.denna-spec.json'), 'utf-8');
    expect(raw.startsWith('{\n  ')).toBe(true);
    expect(raw.endsWith('\n')).toBe(true);
  });
});
