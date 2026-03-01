import {
  ANDROID_VIEWPORTS,
  IOS_VIEWPORTS,
  type MobileViewport,
} from '../../support/mobileViewports';

const faqItems = [
  {
    topic: 'เริ่มใช้งาน App',
    detail: 'มีสัตว์เลี้ยงหลายตัวต้อง Add เพิ่มยังไง?',
  },
  {
    topic: 'ฟังก์ชันของ App',
    detail: 'สามารถสั่งยาออนไลน์ใน App ได้ไหม?',
  },
  {
    topic: 'สัตว์เลี้ยง',
    detail: 'ลืมให้สัตว์กินยา ต้องทำอย่างไร?',
  },
  {
    topic: 'การนัดหมาย',
    detail: 'ฉันสามารถเลื่อนวันนัดหมายได้อย่างไร',
  },
  {
    topic: 'topic',
    detail: 'detail',
  },
  {
    topic: 'topic',
    detail: 'detail',
  },
  {
    topic: 'topic',
    detail: 'detail',
  },
];

const navLabels = ['Home', 'Calendar', 'My pets', 'Medication', 'Notifications'];
const helpCenterPath = '/pet-owners/help-center-page';
const specViewports: MobileViewport[] = [IOS_VIEWPORTS[0], ANDROID_VIEWPORTS[0]];

function visitHelpCenter(options: Partial<Cypress.VisitOptions> = {}) {
  cy.fiEnsureOwnerProfile();
  cy.fiVisitAuthed(helpCenterPath, options);
  cy.contains('Help Center', { timeout: 20000 }).should('be.visible');
}

specViewports.forEach((viewport) => {
  describe(
    `Help center flow [${viewport.platform.toUpperCase()} | ${viewport.name} | ${viewport.width}x${viewport.height}]`,
    () => {
      beforeEach(() => {
        cy.viewport(viewport.width, viewport.height);
      });

      it('renders the intended faq content, keeps it visible after search input, and hides the navbar', () => {
        visitHelpCenter();

        cy.contains('คำถามยอดฮิต').should('be.visible');
        cy.contains('สอบถามเพิ่มเติม').should('be.visible');
        cy.contains('053 948 031').should('be.visible');
        cy.contains('เวลาให้บริการ 09.00-20.00 น.').should('be.visible');

        cy.get('input[placeholder="Search..."]')
          .should('be.visible')
          .type('appointment')
          .should('have.value', 'appointment');

        cy.contains('คำถามยอดฮิต')
          .parent()
          .within(() => {
            cy.get('p').should('have.length', faqItems.length);
            faqItems.forEach(({ topic, detail }) => {
              cy.contains('p', `[${topic}]`).should('contain.text', detail);
            });
          });

        cy.get('footer').should('not.exist');
        navLabels.forEach((label) => {
          cy.contains(label).should('not.exist');
        });
      });

      it('calls browser history back when opened directly', () => {
        visitHelpCenter({
          onBeforeLoad(win) {
            cy.stub(win.history, 'back').as('historyBack');
          },
        });

        cy.get('button').first().click();
        cy.get('@historyBack').should('have.been.calledOnce');
        cy.location('pathname').should('eq', helpCenterPath);
      });

      it('opens help center from dashboard and returns with the back button', () => {
        cy.fiEnsureOwnerProfile();
        cy.fiVisitAuthed('/pet-owners/home-page');

        cy.contains('My Pets', { timeout: 20000 }).should('be.visible');
        cy.get('.header-box').within(() => {
          cy.get('svg').last().click({ force: true });
        });

        cy.location('pathname').should('eq', helpCenterPath);
        cy.contains('Help Center', { timeout: 20000 }).should('be.visible');
        cy.get('footer').should('not.exist');

        cy.get('button').first().click();
        cy.location('pathname').should('eq', '/pet-owners/home-page');

        cy.get('footer').should('be.visible');
        navLabels.forEach((label) => {
          cy.contains('footer', label).should('be.visible');
        });
      });
    }
  );
});
