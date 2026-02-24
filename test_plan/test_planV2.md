# **ASSIGNMENT 3: AGILE TEST PLAN** 

## **Project: Vet Nurse** **Website URL: [https://www.notion.so/261361-Project-Portal-Vet-Nurse-2de01869745481b6b0cdea7227cb20b8?source=copy\_link](https://www.notion.so/261361-Project-Portal-Vet-Nurse-2de01869745481b6b0cdea7227cb20b8?source=copy_link)**

**Course:** Software Engineering / Software Testing  
**Semester:** 2025 / 2  
**Institution:** Chiang Mai University

**Team Name:** Full Score  
**Members:** 

Chotima Mankit – 660610748  
Natrada Nuchit – 660610757  
Natwara Chaiyasit – 660610758  
Thipwarin Seewarangkoon – 660610760  
Tanapron Tangpadungsuk – 660610762  
Thanchanok Naensin – 660610763  
Wachirawit Chaiyamat – 660612156

**Test scope** 

* **Sprint:** Sprint 1  
* **Feature(s) Under Test:**  
- LINE Authentication & Session  
- Owner Registration  
- Owner & Pet Approval Status Management  
- My Pets List (Owner View)  
- Symptom Record (CRUD)  
- Medical History Timeline  
- Image Upload (Symptoms)  
- Medication Management  
- Appointment Management  
- Notifications  
- Calendar (Appointment / Symptom Record Tab)  
- Dashboard  
* **Test Levels:** System Testing, Integration  
* **Test Approach:** Agile Continuous Testing

## 

## **CI / Environment**

* **Repository:** [261361-VetNurse](https://github.com/orgs/261361-VetNurse/repositories)  
* **CI Pipeline:** GitHub Actions  
* **Target Environment:** Local

## **Document Info**

| Item | Value |
| :---- | :---- |
| Test Plan ID | ATP-VN\-v1.0 |
| Version | 2.0 |
| Status | Updated Draft |
| Date | 23 February 2026 |

## **Document Control**

| Field | Details |
| :---- | :---- |
| Test Plan ID | A unique identifier for the test plan document. Example: ATP-S1-VN-001 |
| Project / Product Name | Vet Nurse |
| Sprint / Release | Sprint 1 |
| Version | v2.0 |
| Date | 23 February 2026 |
| Author(s)  | Team Full Score (660610748, 660610757, 660610758, 660610760, 660610762, 660610763, 660612156\) |
| Reviewed by | Software Testing       650612098 Software Testing       650612089 SA & Testing             660610762 Lead Frontend Dev   660610760 Lead Backend Dev   660612156 |
| Approved by | Software Testing 650612085 Project Manager 660610757 |

## 

## **Table of contents**

## **1\. Scope & Objectives**

### **1.1 Test Objectives**

Describe **why testing is performed** in this sprint.

วัตถุประสงค์ของแผนการทดสอบนี้ คือเพื่อประเมินคุณภาพของฟีเจอร์ฝั่ง Frontend ที่พัฒนาใน Sprint 1 ของระบบ Portal Vet Nurse โดยมุ่งเน้นการตรวจสอบว่าระบบทำงานสอดคล้องกับความต้องการของผู้ใช้ตาม User Stories และ Acceptance Criteria ที่กำหนดไว้ รวมถึงมีความสอดคล้องกับการออกแบบส่วนติดต่อผู้ใช้ (UI Design) จาก Figma และรองรับการใช้งานจริงในลักษณะ user flow ได้อย่างเหมาะสมผ่านการทดสอบแบบ frontend-mocked (UI + mocked API responses) ภายใต้นโยบาย **mock-only** (ไม่ให้ test หลุดไปเรียก backend จริง) ก่อนนำเสนอผลลัพธ์ใน Sprint Review และ Demo

### **1.2 Test Scope**

**In Scope**

* User Stories ที่อยู่ใน Sprint 1  
* การทดสอบการทำงานของ Frontend (User-facing flows) ด้วย Cypress แบบ frontend-mocked  
* การทดสอบการเชื่อมต่อระหว่าง UI และ mocked API responses / intercept contracts (mock-only)  
* Client-side validation  
* Regression testing เบื้องต้น  
* Exploratory testing ตาม workflow การใช้งานจริง

**Out of Scope**

* Future Features (เช่น Q\&A, Real-time Workflow Tracking)  
* Performance / Load testing  
* Security / Penetration testing  
* Backend API integration / database validation (ทดสอบแยกใน backend repo)  
* Admin pages และ Help Center (ไม่นับใน coverage ของเอกสารฉบับนี้ แม้อาจมี smoke tests แยกเพื่อ sanity check)  

## **2\. Traceability (User Stories ↔ Tests)**

### **2.1 Traceability Approach**

ทีมใช้แนวทาง Feature-based Traceability โดย mapping ระหว่าง User Story → Acceptance Criteria → Test Cases ที่เกี่ยวข้อง เพื่อให้สามารถยืนยันได้ว่าฟีเจอร์ที่พัฒนาใน Sprint 1 ได้รับการทดสอบครบถ้วน และสามารถตรวจสอบย้อนกลับจากผลการทดสอบไปยังความต้องการเดิมได้อย่างเป็นระบบ

### **2.2 Traceability Matrix**

| PRD / Story ID | User Story | Acceptance Criteria | Test Case ID(s) |
| :---- | :---- | :---- | :---- |
| US-01 | ผู้ใช้ login / redirect ผ่าน LINE flow ได้ | token ถูกต้อง / session ถูกสร้าง / redirect ถูกต้อง (รองรับ Developer Access และ token-based mode) | TC-AUTH-00, TC-AUTH-01-DEV, TC-AUTH-01-TOKEN (optional) |
| US-02 | ผู้ใช้สามารถดูข้อมูลโปรไฟล์ตนเอง | แสดงข้อมูล owner ถูกต้อง | TC-AUTH-02-DEV, TC-AUTH-03-TOKEN (optional) |
| US-03 | ผู้ใช้สามารถลงทะเบียน Owner | validation ผ่าน, บันทึกสำเร็จ | TC-OWN-01–03 |
| US-04 | ผู้ใช้สามารถแก้ไขข้อมูล Owner | แก้ไข field เดียว/หลาย field ได้ และเปลี่ยนรูปโปรไฟล์ได้ | TC-OWN-04–05 |
| US-05 | ผู้ใช้สามารถเพิ่มสัตว์เลี้ยง | ข้อมูลจำเป็นครบ | TC-PET-01–03 |
| US-06 | ผู้ใช้สามารถดู/แก้ไข/ลบสัตว์เลี้ยง | owner เท่านั้นที่จัดการได้ | TC-PET-04–06 |
| US-06A | ผู้ใช้สามารถดูรายการสัตว์เลี้ยงของตน | redirect เมื่อไม่ login / แสดงรายการ / แสดง error+retry ได้ | TC-MYPETS-01–03 |
| US-07 | ผู้ใช้สามารถบันทึกอาการสัตว์ | CRUD \+ upload รูป | TC-SYM-01–05 |
| US-07A | ผู้ใช้สามารถเข้าหน้า Calendar (Record tab) และเพิ่ม symptom record จาก popup ได้ | เปิด record tab / เปิด popup / create จาก calendar ได้ | TC-CALREC-01–02 |
| US-08 | ผู้ใช้สามารถดูประวัติการรักษา | เรียงตามลำดับเวลา | TC-HIS-01–02 |
| US-09 | ผู้ใช้สามารถจัดการข้อมูลยา | CRUD ยาได้ และรองรับ deep-link เข้า detail/edit | TC-MED-01–04,08 |
| US-10 | ผู้ใช้สามารถดูตารางยา  (รายตัว) | Today / Tomorrow / Other | TC-MED-05–06 |
| US-11 | ผู้ใช้สามารถดูตารางยา  (รวมสัตว์) | เปลี่ยน pet selector ได้ | TC-MED-07 |
| US-12 | ผู้ใช้สามารถสร้างและจัดการนัดหมาย | CRUD นัดหมายได้ และรองรับ deep-link edit (calendar + my-pet appointments page) | TC-APP-01–04,06–07, TC-MYPETAPT-02–04 |
| US-13 | ผู้ใช้สามารถดูนัดหมายตามสถานะ | Upcoming / Completed / Canceled | TC-APP-05, TC-MYPETAPT-05 |
| US-14 | ผู้ใช้สามารถดู Dashboard | pets / reminder / upcoming | TC-DASH-01–03 |
| US-15 | ผู้ใช้สามารถดู Notifications และ mark as read ได้ | grouped notifications / empty state / read state update / navigate to target page | TC-NOTI-01–04 |

**Traceability Notes (v2):**

* `TC-AUTH-*` แยกตาม **auth mode** ชัดเจน: `-DEV` (Developer Access) และ `-TOKEN` (optional backend-auth mode)
* `TC-APP-05` ถูก map เป็น requirement ของการกรองตามสถานะ และ implementation หลักอยู่ที่หน้า `/pet-owners/my-pets-page/[pet_id]/appointments` (ชุด `TC-MYPETAPT-*`)
* `TC-MYPETAPT-*` เป็น test IDs เสริมเพื่อครอบคลุม route จริงใน frontend repo ที่เดิมไม่มี coverage

### **2.3 Frontend-Integration Coverage Audit (Real Backend, Auth-Mode Split)**

> อัปเดตสำหรับ suite `cypress/e2e/frontend-integration` (real frontend + real backend) เพื่อเช็คความครบถ้วนของ coverage ฝั่ง frontend repo ณ ปัจจุบัน และแยก test ตาม auth mode ให้ชัดเจน

#### **2.3.1 Auth Mode Split Policy (สำหรับ `auth.cy.ts`)**

* **Developer Access mode (default in `auth.cy.ts`)**  
  ใช้ UI login จริงผ่าน Developer Access (`DEV_1`) เพื่อทดสอบผลลัพธ์ของหน้า login/redirect และการเปิดหน้า protected routes
* **Token-based mode (optional / backend-auth only)**  
  เก็บ test token-based เดิมไว้ แต่รันเฉพาะเมื่อเปิด env `fiEnableTokenAuthTests=true` เพื่อทดสอบกรณี backend auth/token bootstrap พร้อมใช้งาน

#### **2.3.2 User Story Coverage Status (Current vs Required)**

| US | Current `frontend-integration` Coverage | Status | Required / Missing Test Cases to Add |
| :---- | :---- | :---- | :---- |
| US-01 | มี redirect + Developer Access login redirect; token-mode redirect มีแบบ optional | **Partial** (ครบเมื่อเปิด token mode) | แยกเป็น `TC-AUTH-00`, `TC-AUTH-01-DEV`, `TC-AUTH-01-TOKEN(optional)` |
| US-02 | มี test owner profile render แบบ token mode (optional) และ Developer Access page-open | **Partial** | เพิ่ม/คง `TC-AUTH-02-DEV` (open owner page), `TC-AUTH-03-TOKEN(optional)` (assert backend profile fields) |
| US-03 | Owner register success + validation ครบหลัก | **Mostly Covered** | เพิ่ม edge cases (`TC-OWN-03B`: duplicate email/server validation message) หากต้องการ robustness |
| US-04 | Owner edit + upload image ครบ flow หลัก | **Covered** | เพิ่ม partial update only one field (`TC-OWN-04B`) ถ้าต้องการ regression ละเอียด |
| US-05 | Add pet success + required validation + age display | **Covered** | เพิ่ม pet image upload ในหน้า add pet (`TC-PET-03B`) ถ้าจะครอบคลุม route `/test-upload`/shared uploader behavior เพิ่ม |
| US-06 | Pet detail/edit/delete ครบ | **Covered** | เพิ่ม owner-only authorization negative test (`TC-PET-07`) ถ้ามี multi-user seed |
| US-06A | redirect unauth + list render มีแล้ว | **Partial** | ยังขาด `TC-MYPETS-03` (error state + retry) |
| US-07 | Symptom CRUD + upload รูป ครบ | **Covered** | เพิ่ม validation/limit images (`TC-SYM-06`) ถ้าต้องการ |
| US-07A | Calendar Record tab + popup create มีแล้ว | **Covered (minimum)** | เพิ่ม edit/delete from calendar (`TC-CALREC-03`) ถ้าหน้ารองรับ |
| US-08 | Medical history read + empty state มีแล้ว | **Partial** | ยังขาด `TC-HIS-02` (assert sorting/time order) |
| US-09 | Medication CRUD หลัก + filter aggregate มีแล้ว | **Partial** | ยังขาด deep-link detail/edit (`TC-MED-08`) |
| US-10 | มี per-pet medication page render แต่ยังไม่ assert Today/Tomorrow/Other grouping ชัด | **Partial** | เพิ่ม `TC-MED-05`, `TC-MED-06` (Today/Tomorrow/Other buckets) |
| US-11 | Aggregate page pet selector filter มีแล้ว | **Covered** | เพิ่ม empty filtered state (`TC-MED-07B`) ถ้าต้องการ |
| US-12 | Appointment read/edit/delete/deep-link edit (calendar page) มีแล้ว | **Partial** | ยังขาด create from UI (`TC-APP-03`) และ cancel appointment (`TC-APP-07`) |
| US-13 | ยังไม่ assert Upcoming / Completed / Canceled tabs แบบชัดเจน | **Not Covered** | เพิ่ม `TC-APP-05` (status tabs) โดยเฉพาะ `Canceled` |
| US-14 | Dashboard render + reminder/appointment dialogs + mark taken action มีแล้ว | **Covered** | เพิ่ม empty/error states (`TC-DASH-04`) ถ้าต้องการ |
| US-15 | Notification page render unified list มีแล้ว | **Partial** | ยังขาด `TC-NOTI-02` (mark as read state update), `TC-NOTI-03` (empty state), `TC-NOTI-04` (navigation to target page) |

#### **2.3.3 Frontend Repo-Level Coverage Gaps (Beyond User Stories)**

| Area | Current Status | Missing Test Case IDs (proposed) | Notes |
| :---- | :---- | :---- | :---- |
| `/pet-owners/my-pets-page/[pet_id]/appointments` page | **Not Covered** | `TC-MYPETAPT-01..05` | หน้า route จริงใน `src/app` แต่ Cypress ยังไม่แตะ |
| `/test-upload` page actual upload flow | **Shell only** | `TC-UPLOADTEST-01` | ปัจจุบัน smoke ตรวจแค่ render shell |
| Next API proxy route contracts (`src/app/api/**`) | **Partial** | `TC-API-CONTRACT-01..N` | มี unit contract test บาง route แต่ยังไม่ครบ และมี legacy/mismatch paths |
| Notification read proxy route `/api/notifications/[id]/read` | **Risk / Unverified** | `TC-API-CONTRACT-NOTI-READ` | ต้องยืนยัน path ให้ตรง backend ปัจจุบัน |
| Legacy medication proxy routes (`/api/medications/[id]/[medicineId]/*`, singular `/medicine`) | **Risk / Unverified** | `TC-API-CONTRACT-MED-LEGACY-*` | ควรตรวจว่าเลิกใช้/ลบ/redirect/แก้ path แล้ว |
| Admin pages in repo coverage | **Unclear** | `TC-ADMIN-SRC-VERIFY-01` | มี `admin.cy.ts` แต่ยังต้องยืนยัน source routes อยู่ใน repo นี้จริง |

#### **2.3.4 Definition of “ครบ” สำหรับ Frontend Repo Coverage (Recommended)**

ให้ถือว่า “ครบ” เมื่อผ่านเงื่อนไขต่อไปนี้อย่างน้อย

* ทุก `page.tsx` ที่อยู่ใน `src/app` มีอย่างน้อย 1 test (render/route smoke)
* ทุก user-facing critical flow มี CRUD / validation / empty / error / deep-link coverage ตาม AC
* หน้า protected routes มี coverage ทั้ง **Developer Access mode** และ **token-based mode (optional backend-auth)**
* `src/app/api` routes ที่ใช้งานจริง มี contract tests ครบ และ route legacy ถูกลบหรือมี test ยืนยัน behavior

## 

## **3\. Test Strategy & Test Types**

### **3.1 Overall Test Strategy**

การทดสอบใน Sprint 1 ดำเนินการแบบ **Agile Continuous Testing** โดยโฟกัสการทดสอบฝั่ง Frontend แบบ **frontend-mocked** (Cypress + `cy.intercept`) เน้นการตรวจสอบ **user flow** ตั้งแต่ UI interaction → mocked API response → UI state โดยไม่พึ่ง backend จริงใน repo นี้ และกำหนดนโยบาย **mock-only** สำหรับ suite `frontend-mocked` (ถ้ามี API request ที่ไม่ได้ mock/intercept ไว้ ต้อง fail test ทันที)

---

### **3.2 Test Types Applied** 

Not limited to:

* **Functional System Testing**  
  ใช้เพื่อตรวจสอบการทำงานของ frontend ในภาพรวม โดยยืนยันว่าฟีเจอร์ที่พัฒนาใน Sprint 1 ทำงานสอดคล้องกับความต้องการของผู้ใช้ตาม User Stories และ Acceptance Criteria ที่กำหนดไว้ ภายใต้ mocked API conditions  
* **Regression Testing**  
  ทำการทดสอบฟังก์ชันหลักที่มีอยู่เดิม เพื่อให้มั่นใจว่าการเพิ่มหรือปรับปรุงฟีเจอร์ใหม่ใน Sprint 1 ไม่ส่งผลกระทบต่อการทำงานเดิมของระบบ  
* **Exploratory Testing**  
  ใช้การทดสอบเชิงสำรวจตามสถานการณ์การใช้งานจริง โดยมุ่งเน้นการประเมินประสบการณ์ผู้ใช้ ลำดับขั้นตอนการทำงาน และกรณีที่อาจเกิดข้อผิดพลาดนอกเหนือจาก test case ที่กำหนดไว้
* **Integration Testing**  
  ใช้เพื่อตรวจสอบ integration ภายใน frontend เช่น page routing, local storage session, form validation และ network interception contracts ระหว่าง UI กับ mocked endpoints

## **4\. Test Environment**

| Item | Description |
| :---- | :---- |
| Environment | Development / Staging |
| Platform | Mobile Web Application (User) |
| Browsers | Chrome, Safari |
| OS | Android, iOS, Windows, macOS |
| Test Data | Synthetic / mock data |
| CI/CD | GitHub Actions |

## 

## **5\. Entry & Exit Criteria**

### **5.1 Entry Criteria**

* User Stories ใน Sprint 1 ผ่านการอนุมัติ  
* Test environment พร้อมสำหรับการทดสอบ  
* Acceptance Criteria ของแต่ละ User Story ถูกระบุไว้อย่างครบถ้วน  
* ระบบผ่านการ build และตรวจสอบใน CI pipeline

### **5.2 Exit Criteria**

* Test Case ทั้งหมดที่กำหนดไว้สำหรับ Sprint 1 ได้รับการดำเนินการทดสอบครบถ้วน  
* ไม่มี critical defects ค้างอยู่  
* User Stories ทุกข้อผ่านเกณฑ์ Definition of Done ของทีม  
* มีการจัดทำและสรุปรายงานผลการทดสอบเรียบร้อยแล้ว

## **6\. Risks & Dependencies**

### **6.1 Risks**

| Risk | Impact | Mitigation |
| :---- | :---- | :---- |
| ความต้องการของระบบเปลี่ยนหรือยังไม่ชัดเจนระหว่าง Sprint | High | System Analyst และ Lead Developers ประสานงานกับลูกค้าอย่างใกล้ชิดเพื่อยืนยัน requirement และ acceptance criteria |
| Backend API บางส่วนยังไม่พร้อมใช้งาน | Medium | ใช้ mock data และ `cy.intercept()` เพื่อให้สามารถทดสอบ frontend และ workflow ได้ก่อน |
| การ mock API ไม่ครบทุก endpoint ทำให้ test หลุดไปยิง backend จริง | High | กำหนดนโยบาย frontend-mocked = mock-only, ใช้ runtime guard ให้ fail ทันทีเมื่อมี unmocked API request และตรวจสอบ intercept coverage ก่อน merge |
| Test environment ไม่เสถียรหรือเปลี่ยนแปลงระหว่าง Sprint | Medium | เตรียม environment สำรอง และจำกัดการเปลี่ยนแปลง environment ระหว่างช่วงทดสอบ |
| เวลาใน Sprint จำกัด ทำให้ทดสอบไม่ครบทุกกรณี | Medium | จัดลำดับความสำคัญของ test cases โดยเน้น critical user flows |
| ข้อมูลทดสอบไม่ครอบคลุมกรณี edge cases | Low | สร้าง synthetic และ mock test data เพิ่มเติมสำหรับกรณีสำคัญ |

### 

### 

### **6.2 Dependencies**

* ความพร้อมของ mock test data และ response contracts สำหรับฟีเจอร์ใน Sprint 1  
* ความพร้อมของ Test Environment (Development / Staging)  
* ความพร้อมของ Test Data สำหรับการทดสอบแต่ละฟีเจอร์  
* ความพร้อมของทีมพัฒนาและทีมทดสอบในช่วง Sprint

## 

## **7\. Deliverables & Responsibilities**

### **7.1 Test Deliverables**

เอกสารและสิ่งส่งมอบที่เกี่ยวข้องกับการทดสอบใน Sprint 1 ประกอบด้วย

* **Agile Test Plan (Sprint 1\)**  
  เอกสารวางแผนการทดสอบ กำหนดขอบเขต กลยุทธ์ ความเสี่ยง และการตรวจสอบย้อนกลับระหว่าง user stories และการทดสอบ  
* **Test Scenarios / Test Cases**  
  รายการ test cases ที่ออกแบบจาก user stories และ acceptance criteria ครอบคลุมกรณีปกติ กรณีข้อมูลไม่ถูกต้อง และกรณี error  
* **Automated Test Scripts (Cypress)**  
  ชุดการทดสอบอัตโนมัติสำหรับ main user flows และ regression testing ใช้สนับสนุนการทดสอบในแต่ละ Sprint  
* **Test Execution Report**  
  รายงานผลการทดสอบจริงหลังจบ Sprint ระบุสถานะ Pass/Fail ปัญหาที่พบ และสรุปคุณภาพของระบบใน Sprint 1  
* **Defect Reports**  
  รายงานข้อบกพร่องที่พบระหว่างการทดสอบ พร้อมสถานะการแก้ไขและผลกระทบต่อระบบ

### **7.2 Roles & Responsibilities**

| Role | Responsibility |
| :---- | :---- |
| Tester | ออกแบบ test scenarios และ test cases ตาม user stories และ acceptance criteria, ดำเนินการทดสอบทั้งแบบ manual และ automated, บันทึกและรายงานผลการทดสอบ |
| System Analyst (SA) | รวบรวมและอธิบายความต้องการจากลูกค้า, ตรวจสอบความถูกต้องของ acceptance criteria, สนับสนุนทีมทดสอบในการทำความเข้าใจ requirement |
| Lead Developer | ให้คำปรึกษาด้านเทคนิค, สนับสนุนการ integration testing, วิเคราะห์และแก้ไข defect ที่พบ |
| Developer | แก้ไขข้อบกพร่องตาม defect report, สนับสนุนการทดสอบและ regression testing |
| Project Manager | ประสานงานและติดตามความคืบหน้าของการทดสอบใน Sprint, อนุมัติแผนการทดสอบและผลการทดสอบก่อนส่งมอบ |

### Notes

* Updates are expected as the sprint progresses  
* Focus is on value, traceability, and quality, not documentation volume

## **Appendix**

### **A1 – Responsibilities & Contribution**

| Name | Student ID | Responsibility | Contribution |
| :---- | :---- | :---- | :---- |
| Tanapron Tangpadungsuk | 660610762 | วางแผนการทดสอบ ออกแบบ Test Strategy และ Traceability ตรวจสอบความครบถ้วนและความสอดคล้องของ Test Plan และขอบเขตการทดสอบใน Sprint 1 | 17% |
| Thipwarin Seewarangkoon | 660610760 | ตรวจสอบและให้คำปรึกษาด้านเทคนิคฝั่ง Frontend สนับสนุนการเชื่อมต่อ UI กับ API ระหว่างการทดสอบ | 16% |
| Wachirawit Chaiyamat | 660612156 | ให้คำปรึกษาและสนับสนุนด้าน Backend และ Deployment ตรวจสอบความพร้อมของ API และสนับสนุนการทดสอบ Integration  | 16% |
| Chotima Mankit | 660610748 | สนับสนุนการพัฒนา Frontend ของฝั่ง user เพื่อรองรับ Test Scenarios และช่วยแก้ไขปัญหาที่พบระหว่างการทดสอบ | 14% |
| Natwara Chaiyasit | 660610758 | สนับสนุนการพัฒนา Frontend ของฝั่ง admin เพื่อรองรับ Test Scenarios และช่วยแก้ไขปัญหาที่พบระหว่างการทดสอบ | 14% |
| Thanchanok Naensin | 660610763 | สนับสนุนการพัฒนา Backend เพื่อรองรับ Test Scenarios และช่วยแก้ไขข้อบกพร่องที่พบระหว่างการทดสอบ | 14% |
| Natrada Nuchit | 660610757 | ประสานงาน ติดตามความคืบหน้า และอนุมัติแผนการทดสอบและผลการทดสอบของ Sprint 1 | 9% |

### **A2 – Team Contribution Calculation**

การคำนวณสัดส่วนการมีส่วนร่วมของสมาชิกในทีม (Team Contribution Percentage) สำหรับ Assignment นี้ พิจารณาจากบทบาทและความรับผิดชอบที่แต่ละคนได้รับในกระบวนการจัดทำ Agile Test Plan (Sprint 1\) และงานที่เกี่ยวข้อง โดยทีมใช้หลักเกณฑ์ดังต่อไปนี้ในการประเมิน

* **ขอบเขตและความสำคัญของความรับผิดชอบ**  
  พิจารณาจากบทบาทในงานทดสอบ เช่น การวางแผนการทดสอบ (Test Planning), การออกแบบ Test Strategy, การจัดทำ Traceability, การสนับสนุนด้านเทคนิค และการบริหารจัดการโครงการ  
* **ความซับซ้อนของงานที่รับผิดชอบ**  
  งานที่ต้องใช้การวิเคราะห์เชิงลึก การตัดสินใจเชิงเทคนิค หรือส่งผลต่อคุณภาพของเอกสารและผลการทดสอบโดยรวม จะมีน้ำหนักมากกว่างานสนับสนุนทั่วไป  
* **ปริมาณงานและเวลาที่ใช้จริง**  
  ประเมินจากปริมาณงานของการ Test ที่แต่ละสมาชิกมีส่วนร่วมตลอด Sprint 1 รวมถึงการมีส่วนร่วมในการทบทวน แก้ไข และปรับปรุงเอกสาร Test Plan  
* **บทบาทในการ review, consultation และ approval ซึ่งส่งผลต่อคุณภาพของเอกสารโดยรวม**
