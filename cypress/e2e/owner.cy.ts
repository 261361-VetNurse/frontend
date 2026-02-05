import { runForMobileViewports } from "../support/mobileViewports";

runForMobileViewports("Owner flow", () => {
    describe('TC-OWN-01: Owner registration with valid data', () => { //สมัครสมาชิก Owner ด้วยข้อมูลที่ถูกต้อง
        it('submits registration form and redirects to home', () => { //กรอกฟอร์มสมัคร → submit → ต้องไปหน้า home
            cy.visit('/pet-owners/register-page');

            cy.get('#firstName').type('Alice');
            cy.get('#lastName').type('Smith');
            cy.get('#gender').select('female');
            cy.get('#phone').type('0812345678');
            cy.get('#email').type('alice@example.com');

            cy.contains('button', 'Register').click();
            cy.location('pathname').should('eq', '/pet-owners/home-page');
        });
    });

    describe('TC-OWN-02: Owner registration validation - required fields', () => { //Required fields (เว้นว่าง)
        it('shows validation errors when required fields are missing', () => { //ถ้าผู้ใช้ไม่กรอกข้อมูลที่จำเป็น → ระบบต้องแสดง error ครบทุก field → และ ห้าม redirect
            cy.visit('/pet-owners/register-page');

            // บังคับ submit ผ่าน form เพื่อให้ validateForm ทำงานแม้ปุ่ม disabled
            cy.get('form').submit();

            cy.contains('First name is required').should('exist');
            cy.contains('Last name is required').should('exist');
            cy.contains('Please select gender').should('exist');
            cy.contains('Phone number is required').should('exist');
            cy.contains('Email is required').should('exist');

            // ยังไม่ redirect
            cy.contains('pathname').should('eq', '/pet-owners/register-page');
        });
    });

    describe('TC-OWN-03: Owner registration validation - invalid email', () => { //อีเมล รูปแบบไม่ถูกต้อง
        it('shows validation error when email format is invalid', () => { //ควรจะแสดง error เมื่อ format email ไม่ถูกต้อง
            cy.visit('/pet-owners/register-page');

            cy.get('#firstName').type('Alice');
            cy.get('#lastName').type('Smith');
            cy.get('#gender').select('female');
            cy.get('#phone').type('0812345678');
            cy.get('#email').type('invalid-email');

            cy.contains('button', 'Register').click();
            cy.contains('Please enter a valid email').should('exist');
            cy.location('pathname').should('eq', '/pet-owners/register-page');
        });
    });

    describe('TC-OWN-04: Edit owner profile (single/multiple fields)', () => { //แก้ไข field เดียว และ หลาย field ผ่านค่า submit (console.log) ของฟอร์ม
        it('edits a single field and submits updated data', () => {
            cy.visit('/pet-owners/owner-info-page/edit', {
                onBeforeLoad(win) {
                    cy.stub(win.console, 'log').as('consoleLog'); //แทนที่ console.log ของจริง เพื่อดักจับและตรวจสอบข้อมูลที่ form ส่งออกมา โดยไม่ต้องพึ่ง backend
                },
            });

            cy.get('#firstName').clear().type('Alice');
            cy.contains('button', 'Update').click();

            cy.get('@consoleLog').should(
                'have.been.calledWithMatch',
                'Form submitted:',
                {
                    firstName: 'Alice',
                    lastName: 'JH',
                    gender: 'male',
                    phone: '9786534246',
                    email: 'spdiu9ughe@msodgiur',
                }
            );
        });

        it('edits multiple fields and submits updated data', () => { //แก้ไขหลาย field พร้อมกัน
            cy.visit('/pet-owners/owner-info-page/edit', {
                onBeforeLoad(win) {
                    cy.stub(win.console, 'log').as('consoleLog');
                },
            });

            cy.get('#firstName').clear().type('Mina');
            cy.get('#lastName').clear().type('Kim');
            cy.get('#gender').select('female');
            cy.get('#phone').clear().type('0899999999');
            cy.get('#email').clear().type('mina.kim@example.com');

            cy.contains('button', 'Update').click();

            cy.get('consoleLog').should(
                'have.been.calledWithMatch',
                'From submitted:',
                {
                    firstName: 'Mina',
                    lastName: 'Kim',
                    gender: 'female',
                    phone: '0899999999',
                    email: 'mina.kim@example.com',
                }
            );
        });
    });
});
