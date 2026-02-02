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
- Symptom Record (CRUD)  
- Medical History Timeline  
- Image Upload (Symptoms)  
- Medication Management  
- Appointment Management  
- Notifications  
- Calendar  
- Dashboard  
- Help Center & UX Validation  
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
| Version | 1.0 |
| Status | Final |
| Date | 5 January 2026 |

## **Document Control**

| Field | Details |
| :---- | :---- |
| Test Plan ID | A unique identifier for the test plan document. Example: ATP-S1-VN-001 |
| Project / Product Name | Vet Nurse |
| Sprint / Release | Sprint 1 |
| Version | v1.0 |
| Date | 5 January 2026 |
| Author(s)  | Team Full Score (660610748, 660610757, 660610758, 660610760, 660610762, 660610763, 660612156\) |
| Reviewed by | Software Testing       650612098 Software Testing       650612089 SA & Testing             660610762 Lead Frontend Dev   660610760 Lead Backend Dev   660612156 |
| Approved by | Software Testing 650612085 Project Manager 660610757 |

## 

## **Table of contents**

## **1\. Scope & Objectives**

### **1.1 Test Objectives**

Describe **why testing is performed** in this sprint.

วัตถุประสงค์ของแผนการทดสอบนี้ คือเพื่อประเมินคุณภาพของฟีเจอร์ที่พัฒนาใน Sprint 1 ของระบบ Portal Vet Nurse โดยมุ่งเน้นการตรวจสอบว่าระบบทำงานสอดคล้องกับความต้องการของผู้ใช้ตาม User Stories และ Acceptance Criteria ที่กำหนดไว้ รวมถึงมีความสอดคล้องกับการออกแบบส่วนติดต่อผู้ใช้ (UI Design) จาก Figma และสามารถรองรับการใช้งานจริงในลักษณะ end-to-end ได้อย่างเหมาะสม ก่อนนำเสนอผลลัพธ์ใน Sprint Review และ Demo

### **1.2 Test Scope**

**In Scope**

* User Stories ที่อยู่ใน Sprint 1  
* การทดสอบการทำงานของระบบในระดับระบบ (ครอบคลุมทั้ง Frontend และ Backend)  
* การทดสอบการเชื่อมต่อระหว่าง UI และ API  
* Client-side validation  
* Regression testing เบื้องต้น  
* Exploratory testing ตาม workflow การใช้งานจริง

**Out of Scope**

* Future Features (เช่น Q\&A, Real-time Workflow Tracking)  
* Performance / Load testing  
* Security / Penetration testing  
* ฟีเจอร์ของ Sprint 2

## **2\. Traceability (User Stories ↔ Tests)**

### **2.1 Traceability Approach**

ทีมใช้แนวทาง Feature-based Traceability โดย mapping ระหว่าง User Story → Acceptance Criteria → Test Cases ที่เกี่ยวข้อง เพื่อให้สามารถยืนยันได้ว่าฟีเจอร์ที่พัฒนาใน Sprint 1 ได้รับการทดสอบครบถ้วน และสามารถตรวจสอบย้อนกลับจากผลการทดสอบไปยังความต้องการเดิมได้อย่างเป็นระบบ

### **2.2 Traceability Matrix**

| PRD / Story ID | User Story | Acceptance Criteria | Test Case ID(s) |
| :---- | :---- | :---- | :---- |
| US-01 | ผู้ใช้ login ผ่าน LINE ได้ | token ถูกต้อง / session ถูกสร้าง | TC-AUTH-01,02 |
| US-02 | ผู้ใช้สามารถดูข้อมูลโปรไฟล์ตนเอง | แสดงข้อมูล owner ถูกต้อง | TC-AUTH-03 |
| US-03 | ผู้ใช้สามารถลงทะเบียน Owner | validation ผ่าน, บันทึกสำเร็จ | TC-OWN-01–03 |
| US-04 | ผู้ใช้สามารถแก้ไขข้อมูล Owner | แก้ไข field เดียว/หลาย field ได้ | TC-OWN-04 |
| US-05 | ผู้ใช้สามารถเพิ่มสัตว์เลี้ยง | ข้อมูลจำเป็นครบ | TC-PET-01–03 |
| US-06 | ผู้ใช้สามารถดู/แก้ไข/ลบสัตว์เลี้ยง | owner เท่านั้นที่จัดการได้ | TC-PET-04–06 |
| US-07 | ผู้ใช้สามารถบันทึกอาการสัตว์ | CRUD \+ upload รูป | TC-SYM-01–05 |
| US-08 | ผู้ใช้สามารถดูประวัติการรักษา | เรียงตามลำดับเวลา | TC-HIS-01 |
| US-09 | ผู้ใช้สามารถจัดการข้อมูลยา | CRUD ยาได้ | TC-MED-01–04 |
| US-10 | ผู้ใช้สามารถดูตารางยา  (รายตัว) | Today / Tomorrow / Other | TC-MED-05–06 |
| US-11 | ผู้ใช้สามารถดูตารางยา  (รวมสัตว์) | เปลี่ยน pet selector ได้ | TC-MED-07 |
| US-12 | ผู้ใช้สามารถสร้างและจัดการนัดหมาย | CRUD นัดหมายได้ | TC-APP-01–04 |
| US-13 | ผู้ใช้สามารถดูนัดหมายตามสถานะ | Upcoming / Completed / Canceled | TC-APP-05 |
| US-14 | ผู้ใช้สามารถดู Dashboard | pets / reminder / upcoming | TC-DASH-01–03 |

## 

## **3\. Test Strategy & Test Types**

### **3.1 Overall Test Strategy**

การทดสอบใน Sprint 1 ดำเนินการแบบ **Agile Continuous Testing** โดยรวมการทดสอบ Frontend และ Backend ภายใต้ฟีเจอร์เดียวกัน เน้นการตรวจสอบ **end-to-end user flow** ตั้งแต่ UI → API → UI state

---

### **3.2 Test Types Applied** 

Not limited to:

* **Functional System Testing**  
  ใช้เพื่อตรวจสอบการทำงานของระบบในภาพรวม โดยยืนยันว่าฟีเจอร์ที่พัฒนาใน Sprint 1 ทำงานสอดคล้องกับความต้องการของผู้ใช้ตาม User Stories และ Acceptance Criteria ที่กำหนดไว้  
* **Regression Testing**  
  ดำเนินการทดสอบการทำงานร่วมกันระหว่างส่วนติดต่อผู้ใช้ (Frontend) และบริการฝั่งระบบ (Backend API) เพื่อยืนยันว่าข้อมูลถูกส่งและประมวลผลอย่างถูกต้องตลอดกระบวนการทำงาน  
* **Exploratory Testing**  
  ทำการทดสอบฟังก์ชันหลักที่มีอยู่เดิม เพื่อให้มั่นใจว่าการเพิ่มหรือปรับปรุงฟีเจอร์ใหม่ใน Sprint 1 ไม่ส่งผลกระทบต่อการทำงานเดิมของระบบ  
* **Integration Testing**  
  ใช้การทดสอบเชิงสำรวจตามสถานการณ์การใช้งานจริง โดยมุ่งเน้นการประเมินประสบการณ์ผู้ใช้ ลำดับขั้นตอนการทำงาน และกรณีที่อาจเกิดข้อผิดพลาดนอกเหนือจาก test case ที่กำหนดไว้

## **4\. Test Environment**

| Item | Description |
| :---- | :---- |
| Environment | Development / Staging |
| Platform | Mobile Web Application (User), Web Application (Admin) |
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
| Backend API บางส่วนยังไม่พร้อมใช้งาน | High | ใช้ mock data เพื่อให้สามารถทดสอบ frontend และ workflow ได้ก่อน |
| การเชื่อมต่อระหว่าง Frontend และ Backend ไม่สมบูรณ์ | Medium | ดำเนินการ integration testing อย่างต่อเนื่อง และทดสอบร่วมกันระหว่างทีม |
| Test environment ไม่เสถียรหรือเปลี่ยนแปลงระหว่าง Sprint | Medium | เตรียม environment สำรอง และจำกัดการเปลี่ยนแปลง environment ระหว่างช่วงทดสอบ |
| เวลาใน Sprint จำกัด ทำให้ทดสอบไม่ครบทุกกรณี | Medium | จัดลำดับความสำคัญของ test cases โดยเน้น critical user flows |
| ข้อมูลทดสอบไม่ครอบคลุมกรณี edge cases | Low | สร้าง synthetic และ mock test data เพิ่มเติมสำหรับกรณีสำคัญ |

### 

### 

### **6.2 Dependencies**

* ความพร้อมของ Backend API สำหรับฟีเจอร์ใน Sprint 1  
* ความพร้อมของบริการ LINE Authentication  
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