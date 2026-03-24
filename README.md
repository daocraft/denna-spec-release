# Denna Spec Release Action

Standardized release process for Denna Spec parameter repositories. Reads the repository manifest (`denna-repo.denna-spec.json`), reconciles entries against actual files, and runs semantic-release with a baked-in configuration.

## Usage

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    branches: [main]
permissions:
  contents: write
  issues: write
  pull-requests: write
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: daocraft/denna-spec-release@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

## What It Does

1. Reads `denna-repo.denna-spec.json` to confirm the repo follows the spec
2. Reconciles entries against actual `*.denna-spec.json` files on disk
3. Runs semantic-release with conventional commits
4. Updates `metadata.version` in the manifest to match the new release
5. Maintains a rolling major version tag (e.g., `v1` always points to latest `1.x.x`)

## What It Does NOT Do

- npm publish -- these are data repos, not packages
- Schema validation -- use `daocraft/denna-spec-validator-action` for that

## Requirements

- `denna-repo.denna-spec.json` at repo root (see [Denna Spec](https://spec.denna.io))
- `package.json` with version field
- Conventional commit messages
