# VetNurse Frontend

This is the frontend application for the VetNurse project, built with [Vite](https://vitejs.dev/) and [Bun](https://bun.sh/).

---

## Prerequisites

- [Bun](https://bun.sh/) (v1.x or higher)
- [Node.js](https://nodejs.org/) (optional, for some dev scripts)
- [Docker](https://www.docker.com/) (for containerized deployment)

---

## Local Development

### 1. Install Dependencies

You should use Bun for installation:

```bash
bun install
```

### 2. Configure Environment Variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your actual values (API URL, R2 credentials, LINE keys).

> **Note:** LINE Login requires HTTPS. If you're using ngrok locally, update `REDIRECT_URI` with your current ngrok address and keep it in sync with the **LINE Developer Console**.

### 3. Start the Backend

Ensure the backend is running on `http://localhost:8000` before starting the frontend.

### 4. Run the Dev Server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000). The page hot-reloads on save.

---

## Production Deployment

### Option A — Docker Compose (Recommended)

This is the simplest way to run the frontend in production.

**1. Create your environment file**

```bash
cp .env.example .env
# Fill in all real values in .env
```

**2. Build and start the container**

```bash
docker compose up --build -d
```

The app will be available at `http://your-server-ip:3000`.

**3. Useful commands**

```bash
# View logs
docker compose logs -f frontend

# Restart
docker compose restart frontend

# Stop
docker compose down

# Rebuild after code changes
docker compose up --build -d
```

---

### Option B — Docker (Manual)

**1. Build the image**

```bash
docker build -t vetnurse-frontend .
```

**2. Run the container**

```bash
docker run -d \
  --name vetnurse-frontend \
  --restart unless-stopped \
  -p 3000:3000 \
  --env-file .env \
  -m 768m \
  -e NODE_OPTIONS="--max-old-space-size=512" \
  vetnurse-frontend
```

---

### Option C — Bun Direct (No Docker)

**1. Build**

```bash
bun run build
```

**2. Start the Production Server**

```bash
bun run start
```

The production server runs on port 3000 by default (customizable via `PORT`).

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | ✅ | Backend API base URL (e.g. `https://api.yourserver.com`) |
| `VITE_LINE_CLIENT_ID` | ✅ | LINE Login client ID — same value as `LOGIN_CLIENT_ID` on the backend |
| `VITE_WEB_URL` | ✅ | Base URL of this web app, no trailing slash (e.g. `https://bdb682332f94.ngrok-free.app`) |
| `VITE_LINE_REDIRECT_PATH` | ✅ | Path portion of your LINE `REDIRECT_URI` (e.g. `/auth/callback`) |
| `VITE_R2_PUBLIC_URL` | ✅ | Cloudflare R2 public CDN URL (browser-safe) |
| `R2_ACCOUNT_ID` | ✅ | Cloudflare account ID — **server-only** |
| `R2_ACCESS_KEY_ID` | ✅ | R2 API access key — **server-only** |
| `R2_SECRET_ACCESS_KEY` | ✅ | R2 API secret key — **server-only** |
| `R2_BUCKET_NAME` | ✅ | R2 bucket name — **server-only** |

> **How LINE redirect URI works:** The full redirect URL is assembled as `VITE_WEB_URL` + `VITE_LINE_REDIRECT_PATH`. For example if your ngrok URL is `https://bdb682332f94.ngrok-free.app` and your callback path is `/auth/callback`, set both vars accordingly.

> **Backend-only vars:** `CHANNEL_ID`, `KEY_ID`, `LOGIN_CLIENT_SECRET` are consumed by the **backend** during the token exchange step — the frontend proxies this call and never reads those values itself. Do **not** add them to this project's `.env` file.

---

## Additional Commands

| Description | Bun Command |
|---|---|
| Start development server with hot-reload | `bun run dev` |
| Build optimised production bundle | `bun run build` |
| Start production server (requires build first) | `bun run start` |
| Run ESLint | `bun run lint` |
