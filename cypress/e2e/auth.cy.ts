import { runForMobileViewports } from "../support/mobileViewports";

runForMobileViewports("Auth flow", () => {
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
            cy.intercept('GET', '**/v1/user/profile', { //ส่ง response ปลอม (mock) ไปแทน
                statusCode: 200,
                body: {
                    data: {
                        id: 'user-1234567890',
                        fname: 'Alice', 
                        lname: 'Smith',
                        line_id: 'line-001',
                        picture_url: '',
                        contact: {
                            gender: 'female',
                            phone: '0812345678',
                            email: 'alice@example.com',
                        },
                    },
                },
            }).as('getUserProfile'); //ตั้งชื่อ alias ให้ API call

            cy.visit('/pet-owners/owner-info-page', {
                onBeforeLoad(win) {
                    win.localStorage.setItem('auth_token', 'mock_token_user_1_long_live');
                },
            });

            cy.wait('@getUserProfile'); //รอให้ API ถูกเรียกจริง
            cy.contains('Owner Information').should('exist'); //ตรวจว่าหน้าโหลดแล้ว
            cy.contains('Alice Smith').should('exist');
            cy.contains('ID: 234567890').should('exist');

            // ตรวจค่ารายฟิลด์แบบไม่แตะ src
            cy.contains('First Name').should('exist');
            cy.contains('Alice').should('exist');

            cy.contains('Last Name').should('exist');
            cy.contains('Smith').should('exist');

            cy.contains('Gender').should('exist');
            cy.contains('female').should('exist');

            cy.contains('Phone').should('exist');
            cy.contains('0812345678').should('exist');

            cy.contains('Email').should('exist');
            cy.contains('alice@example.com').should('exist');

            cy.contains('Line ID').should('exist');
            cy.contains('line-001').should('exist');
        });
    });
});
