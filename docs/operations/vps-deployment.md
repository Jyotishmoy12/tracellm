# Deploy TraceLLM To `tracellm.in`

This guide deploys the first production TraceLLM stack:

- `tracellm.in` and `www.tracellm.in`: Vercel frontend
- `api.tracellm.in`: TraceLLM backend on a Hostinger VPS
- `signoz.tracellm.in`: private SigNoz UI on the same VPS
- Caddy handles HTTPS
- Docker Compose runs the backend and reverse proxy
- SQLite persists in a Docker volume

## DNS

Create these records before starting Caddy:

```text
A      api       <VPS_PUBLIC_IP>
A      signoz    <VPS_PUBLIC_IP>
```

For the frontend, add the Vercel records for:

```text
tracellm.in
www.tracellm.in
```

## VPS Base Setup

Assume Ubuntu on Hostinger VPS.

```bash
sudo apt update
sudo apt upgrade -y
sudo apt install -y ca-certificates curl gnupg git ufw
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
```

Log out and back in, then verify:

```bash
docker --version
docker compose version
```

Use a current Docker Compose v2 release. The SigNoz production override uses Compose's `!override` merge tag so public ports are replaced with localhost-only bindings.

Firewall:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
sudo ufw status
```

Do not publicly open ports `4319`, `4318`, or `8080`.

## Clone The Repo

```bash
mkdir -p ~/tracellm
cd ~/tracellm
git clone <your-github-repo-url> .
```

## Prepare Production Env Files

Copy examples:

```bash
cp infra/production/server.env.example infra/production/server.env
cp infra/production/caddy.env.example infra/production/caddy.env
```

Edit `infra/production/server.env`:

```text
NODE_ENV=production
TRACELLM_PUBLIC_API_URL=https://api.tracellm.in
TRACELLM_DB_PATH=/app/data/tracellm.sqlite
TRACELLM_AUTH_REQUIRED=true
TRACELLM_AUTH_COOKIE_SECURE=true
TRACELLM_OTEL_EXPORTER_OTLP_ENDPOINT=http://signoz-ingester:4318
TRACELLM_EXPORT_SECRET_KEY=<strong-stable-secret>
```

Generate a stable export secret:

```bash
openssl rand -hex 32
```

Keep `TRACELLM_EXPORT_SECRET_KEY` stable. If it changes, saved external export headers must be re-entered.

Generate the Caddy basic-auth hash:

```bash
docker run --rm caddy:2-alpine caddy hash-password --plaintext '<strong-password>'
```

Put the result in `infra/production/caddy.env`:

```text
SIGNOZ_BASIC_AUTH_USER=admin
SIGNOZ_BASIC_AUTH_HASH=<hashed-password>
```

Do not commit `server.env` or `caddy.env`.

## Start SigNoz

The generated SigNoz compose stack is committed under:

```text
infra/signoz/pours/deployment/compose.yaml
```

Start SigNoz with the production override. The override binds SigNoz host ports to `127.0.0.1` so Caddy is the only public entry point.

```bash
docker compose \
  -f infra/signoz/pours/deployment/compose.yaml \
  -f infra/production/signoz-production.override.yml \
  up -d
```

Confirm the shared Docker network exists:

```bash
docker network inspect signoz-network
```

## Start TraceLLM Backend And Caddy

Build and run:

```bash
docker compose -f infra/production/docker-compose.yml up -d --build
```

If you install Node and pnpm on the VPS, the equivalent helper commands are:

```bash
pnpm signoz:prod:up
pnpm prod:up
```

Check containers:

```bash
docker compose -f infra/production/docker-compose.yml ps
docker compose -f infra/production/docker-compose.yml logs -f tracellm-server
```

Verify public endpoints:

```bash
curl https://api.tracellm.in/health
curl https://api.tracellm.in/openapi.json
```

Open:

```text
https://api.tracellm.in/api-docs
https://signoz.tracellm.in
```

SigNoz should ask for the Caddy basic-auth credentials.

## Vercel Frontend

Vercel project settings:

```text
Framework: Vite
Install command: pnpm install --frozen-lockfile
Build command: pnpm --filter @tracellm/web build
Output directory: apps/web/dist
```

Set Vercel env:

```text
VITE_API_BASE_URL=https://api.tracellm.in
VITE_DOCS_BASE_URL=https://docs.tracellm.in
VITE_OPENAPI_URL=https://api.tracellm.in/api-docs
VITE_DEFAULT_OTLP_ENDPOINT=
```

If docs are not deployed yet:

```text
VITE_DOCS_BASE_URL=https://tracellm.in
```

## Smoke Test

1. Open `https://tracellm.in`.
2. Create an account.
3. Create a project API key.
4. Run a real app locally:

```bash
TRACELLM_ENDPOINT=https://api.tracellm.in
TRACELLM_API_KEY=<project-api-key>
```

5. Confirm traces appear in TraceLLM UI.
6. Confirm backend platform telemetry appears in private SigNoz.
7. Create an external OTLP destination from the `Exports` page and use `Test trace`.

## Backup And Restore

The backend SQLite database lives in the `tracellm-data` Docker volume at:

```text
/app/data/tracellm.sqlite
```

Create a backup:

```bash
mkdir -p ~/tracellm-backups
docker run --rm \
  -v tracellm-production_tracellm-data:/data:ro \
  -v ~/tracellm-backups:/backup \
  alpine sh -c 'cp /data/tracellm.sqlite /backup/tracellm-$(date +%Y%m%d-%H%M%S).sqlite'
```

Restore from a backup:

```bash
docker compose -f infra/production/docker-compose.yml down
docker run --rm \
  -v tracellm-production_tracellm-data:/data \
  -v ~/tracellm-backups:/backup \
  alpine sh -c 'cp /backup/<backup-file>.sqlite /data/tracellm.sqlite'
docker compose -f infra/production/docker-compose.yml up -d
```

Back up before changing production env, rotating secrets, or upgrading the backend.

## Useful Commands

```bash
docker compose -f infra/production/docker-compose.yml logs -f
docker compose -f infra/production/docker-compose.yml restart tracellm-server
docker compose -f infra/production/docker-compose.yml pull
docker compose -f infra/production/docker-compose.yml up -d --build
docker compose -f infra/production/docker-compose.yml down
```
