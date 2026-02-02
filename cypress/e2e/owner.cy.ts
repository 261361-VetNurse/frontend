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

    });
});

describe('TC-OWN-03: Owner registration validation - invalid email', () => { //Required fields (เว้นว่าง)
    it('shows validation error when email format is invalid', () => { //ถ้าผู้ใช้ไม่กรอกข้อมูลที่จำเป็น → ระบบต้องแสดง error ครบทุก field → และ ห้าม redirect
        cy.visit('/pet-owners/register-page');

    });
});