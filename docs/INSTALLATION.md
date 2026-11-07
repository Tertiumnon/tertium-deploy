# Installation

## Prerequisites

- [Bun](https://bun.sh) - the package runs its TypeScript directly on Bun.
- [Git for Windows](https://git-scm.com) on Windows - steps run in Git Bash, found next to `git`, and it
  brings `ssh`, `scp` and `tar` with it.
- [envlock](#envlock) on the PATH, for projects whose jobs name an `environment`.

## envlock

[envlock](https://www.npmjs.com/package/@tiii-dev/envlock) keeps each environment's secrets and variables
(such as `dev` and `prod`) encrypted, and gives them to a deploy on request. The package does not import
envlock: it runs `envlock` as a command.

Install it on the PATH:

```bash
bun add -g @tiii-dev/envlock
```

When a job names an `environment`, the deploy runs:

```bash
envlock export <app> <environment>
```

- `<app>` is the project's `package.json` `name` without its scope: `@acme/dungeons-api` is looked up as
  `dungeons-api`. A project without a `name` fails the run.
- envlock asks for your passphrase in the terminal. The values stay in memory for the run and are not
  written to disk.
- Every key is available as both `secrets.KEY` and `vars.KEY` in the workflow.
- If envlock is not on the PATH, the run stops with an install hint.

## Install the package

```bash
bun add -g @tertium/deploy
```

This puts the `deploy` command on the PATH. The command must be run from the project folder, the one
that contains `.tertium/workflows/deploy.yml`.

## Use it from a project

Add a script to the project's `package.json`:

```json
"scripts": {
  "deploy:prod": "deploy -env prod"
}
```

Then run `bun run deploy:prod`. See [Usage](USAGE.md) for the flags and the workflow syntax.
