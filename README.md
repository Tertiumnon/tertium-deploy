# @tertium/deploy

Runs a project's own deploy workflow on your machine. The workflow lives in the project, in
`.tertium/workflows/deploy.yml`, and is written in GitHub Actions' syntax, so every step of a deploy is in the project to read, not inside this package.

```bash
deploy -env prod      # runs .tertium/workflows/deploy.yml with input env=prod
```

An example `.tertium/workflows/deploy.yml`: build the app, copy it to a server over SSH, and restart it.
Secrets and variables come from the `prod` environment in envlock.

```yaml
on:
  workflow_dispatch:
    inputs:
      env:
        required: true
        type: choice
        options: [dev, prod]
env:
  APP_DIR: dist
jobs:
  deploy:
    environment: ${{ inputs.env }}
    steps:
      - name: Build
        run: |
          bun install
          bun run build
      - name: Upload
        env:
          HOST: ${{ vars.DEPLOY_HOST }}
        run: |
          tar -czf app.tar.gz -C "$APP_DIR" .
          scp app.tar.gz "$HOST:/var/www/app/"
      - name: Restart
        env:
          HOST: ${{ vars.DEPLOY_HOST }}
        run: ssh "$HOST" "cd /var/www/app && tar -xzf app.tar.gz && pm2 restart app"
```

Here `environment` loads `DEPLOY_HOST` (and any other keys) from envlock for the chosen env, and `env`
passes it to each step. See [Usage](docs/USAGE.md) for the full list of supported keys.
