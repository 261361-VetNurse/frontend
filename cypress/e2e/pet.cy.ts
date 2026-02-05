describe('TC-PET-01: Add new pet with required fields', () => { //กรอกข้อมูลสัตว์เลี้ยงครบ (required + optional), ปุ่มเปิดใช้งานถูกต้อง, ข้อมูลถูกส่งออกถูกต้อง, redirect ไปหน้า My Pets
    it('creates pet and redirects to my pets page', () => {
        cy.visit('/pet-owners/my-pets-page/add-new-pet', {
            onBeforeLoad(win) {
                cy.stub(win.console, 'log').as('consoleLog');
            },
        });

        // optional: ก่อนกรอก ปุ่มควร disabled
        cy.contains('button', 'Add New Pet').should('be.disabled');

        // Required fields
        cy.get('input[placeholder="Mochi"]').type('Milo');
        cy.get('input[placeholder="cat"]').type('cat');
        cy.get('input[placeholder="Scottish Fold"]').type('British Shorthair');
        cy.get('input[type="date"]').type('2023-01-01');
        cy.get('select').select('Female');
        cy.contains('label', 'Yes').click(); // infecund = true

        // Optional fields
        cy.get('input[placeholder="e.g. 4.5"]').type('4.2');
        cy.get('input[placeholder*="Chicken"]').type('Chicken, Dust');

        cy.contains('button', 'Add New Pet').should('not.be.disabled').click();

        cy.get('@consoleLog').should(
            'have.been.calledWithMatch',
            'CREATE PET:',
            {
                name: 'Milo',
                species: 'cat',
                breed: 'British Shorthair',
                birth_date: '2023-01-01',
                gender: 'Female',
                infecund: true,
                weight_kg: 4.2,
                allergies: ['Chicken', 'Dust'],
            }
        );
        cy.location('pathname').should('eq', '/pet-owners/my-pets-page');
    });

    it('creates pet and age is calculated correctly', () => { //เมื่อผู้ใช้กรอกวันเกิดสัตว์เลี้ยง → ระบบต้องคำนวณอายุ (Age) ได้ถูกต้อง
        cy.clock(new Date('2026-02-05T12:00:00Z').getTime(), ['Date']); // แช่เวลา” ไว้ให้คงที่ 2026-02-05

        cy.visit('/pet-owners/my-pets-page/add-new-pet', {
            onBeforeLoad(win) {
                cy.stub(win.console, 'log').as('consoleLog');
            },
        });

        cy.get('input[type="date"]').type('2023-01-01');

        // Age box (label "Age" -> div ถัดไป)
        cy.contains('label', 'Age') //หา label “Age”
            .next('div') // ไปยัง element ถัดไป
            .should('have.text', '3y 1m'); //ตรวจสอบข้อความ
    });
});

describe('TC-PET-02: submitting form with missing required field shows validation error', () => {
 it('submit shows validation error when form is incomplete', () => {
    cy.visit('/pet-owners/my-pets-page/add-new-pet', {
        onBeforeLoad(win) {
            cy.stub(win.console, 'log').as('consoleLog');
        },
    });

    // Fill all required fields except gender + infecund
    cy.get('input[placeholder="Mochi"]').type('Milo');
    cy.get('input[placeholder="cat"]').type('cat');
    cy.get('input[placeholder="Scottish Fold"]').type('British Shorthair');
    cy.get('input[type="date"]').type('2023-01-01');

    cy.contains('button', 'Add New Pet').should('be.disabled');

    // Add gender only -> still disabled (infecund missing)
    cy.get('select').select('Male');
    cy.contains('button', 'Add New Pet').should('be.disabled');

    // Complete final required field -> enabled
    cy.contains('label', 'No').click();
    cy.contains('button', 'Add New Pet').should('not.be.disabled').click();

    cy.get('@consoleLog').should('have.been.calledWithMatch', 'CREATE PET:');
    cy.location('pathname').should('eq', '/pet-owners/my-pets-page');
    });
});

describe('TC-PET-03: Add New Pet – Input Normalization & Edge Cases', () => {
        it('edge input is normalized correctly (trim/allergies/empty weight/future DOB)', () => {
            cy.clock(new Date('2026-02-05T12:00:00Z').getTime(), ['Date']);

            cy.visit('/pet-owners/my-pets-page/add-new-pet', {
                onBeforeLoad(win) {
                    cy.stub(win.console, 'log').as('consoleLog');
                },
            });

            //Trim input (กรอกข้อมูลที่มีช่องว่างหน้า/หลัง เพื่อเช็คว่า submit แล้วถูก trim)
            cy.get('input[placeholder="Mochi"]').type('  Luna  ');
            cy.get('input[placeholder="cat"]').type('  cat  ');
            cy.get('input[placeholder="Scottish Fold"]').type('  Persian  ');

            //future DOB (ใส่วันเกิดที่อยู่อนาคต => age ควรแสดง "0 days")
            cy.get('input[type="date"]').type('2026-12-01');
            cy.contains('label', 'Age').next('div').should('have.text', '0 days');

            // required fields ที่เหลือ
            cy.get('select').select('Unknow');
            cy.contains('label', 'No').click();

            // empty weight (ไม่กรอก weight เพื่อเช็คว่า payload เป็น null)
            cy.get('input[placeholder="e.g. 4.5"]').should('have.value', '');

            // allergies normalization (กรอก allergies มี comma ซ้อน/space เกิน => ควรถูก normalize เหลือ array สะอาด)
            cy.get('input[placeholder*="Chicken"]').type(' Chicken, , Dust  ,  ');

            // submit
            cy.contains('button', 'Add New Pet').should('not.be.disabled').click();

            // ตรวจว่า payload normalize ถูกต้องตาม edge cases
            cy.get('@consoleLog').should((stub: any) => {
                const calls = stub.getCalls();
                expect(calls.length).to.be.greaterThan(0);

                const [message, payload] = calls[calls.length - 1].args;
                expect(message).to.eq('CREATE PET:');

                // trim
                expect(payload.name).to.eq('Luna');
                expect(payload.species).to.eq('cat');
                expect(payload.breed).to.eq('Persian');

                // future DOB
                expect(payload.birth_date).to.eq('2026-12-01');

                // empty weight -> null
                expect(payload.weight_kg).to.eq(null);

                // allergies normalization
                expect(payload.allergies).to.deep.eq(['Chicken', 'Dust']);

                // required fields ที่เลือก
                expect(payload.gender).to.eq('Unknown');
                expect(payload.infecund).to.eq(false);
            });
            cy.location('pathname').should('eq', '/pet-owners/my-pets-page');
        });
});

