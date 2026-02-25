# Cypress Frontend-Integration Tests (Real Backend)

โฟลเดอร์นี้ใช้สำหรับ Cypress tests ที่รันกับ frontend จริง (`http://localhost:3000`) และ backend จริง (`http://localhost:8000`) โดยไม่ mock network ของแอป/แบ็กเอนด์

## Policy

- `frontend-integration = real app + real backend network`
- ห้ามใช้ network stubs สำหรับ `/api/**`, `/v1/**`, `/auth/me` ใน spec กลุ่มนี้
- ห้ามใช้ `mock_token_*`
- ข้อมูลทดสอบสร้างผ่าน API จริง (self-seeding) ด้วย helper `cy.fi*`

## Required Services

1. Frontend (Next.js): `http://localhost:3000`
2. Backend (FastAPI): `http://localhost:8000`
3. Backend DB (MySQL) พร้อม schema/data
4. Backend source path (token bootstrap script): `/Users/icy/year3.2/Backend`

## Auth Bootstrap

integration helpers จะพยายามสร้าง/ดึง JWT จริงอัตโนมัติผ่าน backend script:

- `/Users/icy/year3.2/Backend/generate_and_store_token.py`

จากนั้น validate token ด้วย `GET /auth/me` ก่อนใช้ในหน้าเว็บ

## Upload Tests (Owner / Symptom)

เคส upload image ใช้ real `/api/upload/presigned-url` + real R2 upload

ต้องมี env ของ R2 ฝั่ง frontend ครบ เช่น

- `R2_ACCOUNT_ID`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `NEXT_PUBLIC_R2_PUBLIC_URL`

suite จะทำ preflight และ fail พร้อมข้อความชัดเจนถ้า env ไม่พร้อม

## วิธีรัน (Step-by-step)

### 1) ติดตั้ง dependency (ถ้ายังไม่ได้ติดตั้ง)

```bash
yarn install
```

### 2) เปิด Frontend

จาก root ของโปรเจกต์นี้ (`/Users/icy/year3.2/frontend`)

```bash
yarn dev
```

ต้องเข้าถึงได้ที่ `http://localhost:3000`

### 3) เปิด Backend + DB

รัน backend (FastAPI) และ database จาก repo backend ให้พร้อมก่อนเริ่ม test

- Backend ต้องเข้าถึงได้ที่ `http://localhost:8000`
- endpoint health ที่ถูกใช้เช็คคือ `http://localhost:8000/openapi.json`
- token bootstrap script ต้องมีไฟล์นี้: `/Users/icy/year3.2/Backend/generate_and_store_token.py`

### 4) (ถ้าจะรันเคส upload) ใส่ env R2 ให้ครบ

เฉพาะเคส upload เช่น `owner.cy.ts` / `symptom.cy.ts` ต้องใช้ env R2 ฝั่ง frontend ครบตามหัวข้อด้านบน

### 5) รัน Cypress

เปิด Cypress UI (pre-filter ให้แสดงเฉพาะ spec ใน `frontend-integration`):

```bash
npm run cypress:open:frontend-integration
```

รันแบบ headless ทั้งโฟลเดอร์:

```bash
npm run cypress:run:frontend-integration
```

## คำสั่งรันที่ใช้บ่อย

รันเฉพาะไฟล์เดียว:

```bash
npx cypress run --spec "cypress/e2e/frontend-integration/pet.cy.ts"
```

รันเฉพาะกลุ่ม device (viewport mobile)

- รองรับ `deviceGroup=ios`, `deviceGroup=android`, หรือ `deviceGroup=all`

```bash
npx cypress run --spec "cypress/e2e/frontend-integration/**/*.cy.ts" --env deviceGroup=ios
```

override URL กรณีไม่ได้ใช้ localhost ปกติ:

```bash
npx cypress run --spec "cypress/e2e/frontend-integration/**/*.cy.ts" --env frontendBaseUrl=http://localhost:3001,backendBaseUrl=http://localhost:8001
```

## สิ่งที่ suite จะเช็คให้อัตโนมัติ

- เช็ค frontend health (`http://localhost:3000` หรือ `frontendBaseUrl`)
- เช็ค backend health (`/openapi.json`)
- สร้าง/ดึง JWT จริง และ validate ผ่าน `GET /auth/me`
- สำหรับ upload tests: เช็ค R2 preflight ก่อนเริ่มเคส

## Troubleshooting

- `Backend health check failed`: ยังไม่ได้รัน FastAPI ที่ `http://localhost:8000` หรือ URL ไม่ตรง
- `Frontend health check failed`: ยังไม่ได้รัน Next app ที่ `http://localhost:3000` หรือ URL ไม่ตรง
- `Generated token validation failed`: backend DB/user/token bootstrap ยังไม่พร้อม (ตรวจ backend repo และ script token)
- `R2 preflight failed`: env หรือ credential สำหรับ presigned URL / R2 ไม่ครบหรือไม่ถูกต้อง
