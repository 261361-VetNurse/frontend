# Docker Setup สำหรับ Frontend (Bun)

## ข้อกำหนดเบื้องต้น
- Docker
- Docker Compose

## การใช้งาน

### 1. Build และรัน container
```bash
cd frontend
docker-compose up -d --build
```

### 2. ดู logs
```bash
docker-compose logs -f frontend
```

### 3. หยุด container
```bash
docker-compose down
```

### 4. Rebuild container
```bash
docker-compose up -d --build --force-recreate
```

## การตั้งค่า Environment Variables

หากต้องการเพิ่ม environment variables สามารถแก้ไขใน `docker-compose.yml`:

```yaml
environment:
  - NODE_ENV=production
  - NEXT_PUBLIC_API_URL=http://localhost:8000
  - NEXT_PUBLIC_LINE_LIFF_ID=your-liff-id
```

หรือสร้างไฟล์ `.env.production` และเพิ่มใน docker-compose.yml:

```yaml
env_file:
  - .env.production
```

## Port

Frontend จะรันที่ port `3000`
- เข้าถึงได้ที่: http://localhost:3000

## หมายเหตุ

- Dockerfile ใช้ Bun เป็น package manager และ runtime
- Next.js ถูก build ในโหมด standalone เพื่อลดขนาด image
- Container รันด้วย non-root user เพื่อความปลอดภัย
