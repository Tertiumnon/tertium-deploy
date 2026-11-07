# Build

The package has no build step: Bun runs the TypeScript sources in `src/` directly, and `bin.deploy`
points at `src/workflow/workflow.ts`.

## Develop

```bash
bun install
```

## Check

```bash
bun run lint        # biome check src
bun run typecheck   # runs `bun check`, Bun's type check
bun run test        # bun test
```

## Release

Releases bump the version in `package.json`, tag it, and publish through `gith`:

```bash
bun run release:patch   # or release:minor / release:major
```

Pushing a `v*` tag runs `.github/workflows/publish.yml`, which installs with `bun install --frozen-lockfile`,
runs lint, typecheck and tests, publishes to npm with trusted publishing (no npm token is stored), and
creates the GitHub release.
