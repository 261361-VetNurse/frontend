import { runForMobileViewports } from "../support/mobileViewports";

runForMobileViewports("Auth flow", () => {
    describe('TC-AUTH-00: /pet-owners redirects to login', () => {
        it('redirects root pet owner route to login page', () => {
            cy.visit('/pet-owners');
            cy.location('pathname').should('eq', '/pet-owners/login-page');
        });
    });

    describe('TC-AUTH-01: LINE login creates session and redirects', () => { //Login ผ่าน LINE / สร้าง session
        it('logs in via mock LINE and redirects to home', () => {
            cy.visit('/pet-owners/login-page');
            cy.contains('button', 'Login With Line').click();
            cy.wait(1200);
            cy.location('pathname').should('eq', '/pet-owners/home-page');
            cy.window().then((win) => {
                const token = win.localStorage.getItem('auth_token');
                expect(token).to.eq('mock_token_user_1_long_live');
            });
        });
    });

    describe('TC-AUTH-02: existing session redirects from login to home', () => { //มี token อยู่แล้ว → เข้า login แล้ว redirect ไป home
        it('redirects to home when auth_token already exists', () => {
            cy.visit('/pet-owners/login-page', {
                onBeforeLoad(win) { //รันก่อนที่หน้าเว็บจะโหลด
                    win.localStorage.setItem('auth_token', 'mock_token_user_1_long_live');
                },
            });

            cy.location('pathname').should('eq', '/pet-owners/home-page');
        });
    });

    describe('TC-AUTH-03: view user profile', () => { //ดูโปรไฟล์ผู้ใช้
        it('show owner profile data from API', () => { //ต้องแสดงข้อมูลที่ได้จาก API
            cy.visit('/pet-owners/owner-info-page', {
                onBeforeLoad(win) {
                    win.localStorage.setItem('auth_token', 'mock_token_user_1_long_live');
                },
            });

            cy.contains('Owner Information').should('exist'); //ตรวจว่าหน้าโหลดแล้ว
            cy.contains('สมหญิง ใจบุญ').should('exist');
            cy.contains(/ID:\s*[A-Za-z0-9]{9}/).should('exist');

            // ตรวจค่ารายฟิลด์แบบไม่แตะ src
            cy.contains('First Name').should('exist');
            cy.contains('สมหญิง').should('exist');

            cy.contains('Last Name').should('exist');
            cy.contains('ใจบุญ').should('exist');

            cy.contains('Gender').should('exist');
            cy.contains('Female').should('exist');

            cy.contains('Phone').should('exist');
            cy.contains('081-234-5678').should('exist');

            cy.contains('Email').should('exist');
            cy.contains('somying.jaiboon@example.com').should('exist');

            cy.contains('Line ID').should('exist');
            cy.contains('somying.jaiboon').should('exist');
        });
    });
});
