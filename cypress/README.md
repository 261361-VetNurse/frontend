# Cypress Run Guide

คู่มือการรัน Cypress สำหรับโปรเจกต์นี้

## 1) เตรียมโปรเจกต์

ติดตั้ง dependencies (ถ้ายังไม่ติดตั้ง):

```bash
npm install
```

เปิดแอป Next.js ก่อน (Cypress ใช้ `baseUrl=http://localhost:3000`):

```bash
npm run dev
```

## 2) คำสั่งรัน Cypress

เปิด Cypress Test Runner (interactive):

```bash
npm run cypress:open
```

รันแบบ headless ทั้งหมด:

```bash
npm run cypress:run
```

## 3) รันแยกตาม Mobile Group

โปรเจกต์นี้รองรับการรัน test ตาม viewport group ผ่านตัวแปร `deviceGroup`:

```bash
npm run cypress:open:ios
npm run cypress:open:android
npm run cypress:run:ios
npm run cypress:run:android
npm run cypress:run:all-mobile
```

## 4) รันเฉพาะไฟล์เทส

```bash
npx cypress run --spec "cypress/e2e/owner.cy.ts"
```

หรือหลายไฟล์:

```bash
npx cypress run --spec "cypress/e2e/auth.cy.ts,cypress/e2e/owner.cy.ts"
```

## 5) หมายเหตุ

- ถ้าไม่ได้เปิด `npm run dev` ก่อน อาจเจอ error เข้าเว็บไม่ได้ (`http://localhost:3000`).
- เทสส่วนใหญ่ใช้เส้นทางในฝั่ง `pet-owners/*`.
- บางเคสใช้ mock/intercept ในเทสเอง จึงรันได้โดยไม่ต้องพึ่ง backend ครบทุก endpoint.
