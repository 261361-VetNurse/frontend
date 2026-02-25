import { runForMobileViewports } from '../../support/mobileViewports';
import { fiUnique, fiClickButton } from './helpers';

function fiReplaceInput(selector: string, value: string) {
  cy.get(selector).should('be.visible').clear();
  cy.get(selector).should('be.visible').type(value);
}

function fiBodyAsObject(body: unknown): Record<string, unknown> {
  if (body && typeof body === 'object') return body as Record<string, unknown>;
  if (typeof body === 'string') {
    try {
      return JSON.parse(body) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return {};
}

function fiProfileFromApiBody(body: unknown): Record<string, unknown> {
  const root = fiBodyAsObject(body);
  return root.data && typeof root.data === 'object' ? fiBodyAsObject(root.data) : root;
}

function fiWaitForOwnerProfileName(firstName: string, lastName: string, retries = 5): Cypress.Chainable {
  return cy.fiApi('GET', '/v1/user/profile').then((res) => {
    const profile = fiProfileFromApiBody(res.body);
    const currentFirst = String(profile.fname ?? profile.first_name ?? '');
    const currentLast = String(profile.lname ?? profile.last_name ?? '');

    if (currentFirst === String(firstName) && currentLast === String(lastName)) {
      return cy.wrap(profile, { log: false });
    }

    if (retries <= 0) {
      throw new Error(
        `Owner profile not updated yet. Expected ${firstName} ${lastName}, got ${currentFirst} ${currentLast}`
      );
    }

    cy.wait(500, { log: false });
    return fiWaitForOwnerProfileName(firstName, lastName, retries - 1);
  });
}

runForMobileViewports('Owner flow (integration)', () => {
  it('registers owner profile with valid data and redirects to home', () => { //การลงทะเบียนเจ้าของใหม่ (Registration Flow)
    const suffix = fiUnique('OWN').replace(/[^A-Za-z0-9-]/g, '');
    const firstName = 'Alice';
    const lastName = 'Smith';
    const phone = '0812345678';
    const email = `alice.${suffix}@example.com`;
    const addressLine1 = '123 Main St';
    const subdistrict = 'Suthep';
    const district = 'Mueang';
    const province = 'Chiang Mai';
    const postalCode = '50200';
    cy.intercept('POST', '**/v1/register/owner').as('fiRegisterOwner');
    cy.fiVisitAuthed('/pet-owners/register-page');

    fiReplaceInput('#firstName', firstName);
    fiReplaceInput('#lastName', lastName);
    cy.get('#gender').select('female');
    fiReplaceInput('#phone', phone);
    fiReplaceInput('#email', email);
    fiReplaceInput('#addressLine1', addressLine1);
    fiReplaceInput('#subdistrict', subdistrict);
    fiReplaceInput('#district', district);
    fiReplaceInput('#province', province);
    fiReplaceInput('#postalCode', postalCode);

    fiClickButton(/^Register$/);
    cy.wait('@fiRegisterOwner', { timeout: 30000 }).then((interception) => {
      const body = fiBodyAsObject(interception.request.body);
      expect(body).to.deep.include({
        first_name: firstName,
        last_name: lastName,
        phone,
        email,
        address_line1: addressLine1,
        subdistrict,
        district,
        province,
        postal_code: postalCode,
      });
      expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
    });
    cy.location('pathname', { timeout: 20000 }).should('eq', '/pet-owners/home-page');
    fiWaitForOwnerProfileName(firstName, lastName);
    cy.fiApi('GET', '/v1/user/profile').then((res) => {
      const profile = fiProfileFromApiBody(res.body);
      expect(String(profile.fname ?? profile.first_name ?? '')).to.eq(firstName);
      expect(String(profile.lname ?? profile.last_name ?? '')).to.eq(lastName);
      expect(String(profile.phone ?? '')).to.eq(phone);
      expect(String(profile.email ?? '')).to.eq(email);
    });
  });

  it('shows registration validation errors for missing/invalid fields', () => { //การตรวจสอบความถูกต้องของข้อมูล (Validation Errors)
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('/pet-owners/register-page');
    cy.contains('button', /^Register$/).invoke('prop', 'disabled', false).click();
    cy.contains('First name is required').should('exist');
    cy.contains('Last name is required').should('exist');
    cy.contains('Please select gender').should('exist');

    cy.get('#firstName').type('Alice');
    cy.get('#lastName').type('Smith');
    cy.get('#gender').select('female');
    cy.get('#phone').type('0812345678');
    cy.get('#email').type('invalid-email');
    cy.get('#addressLine1').type('123 Main St');
    cy.get('#subdistrict').type('Suthep');
    cy.get('#district').type('Mueang');
    cy.get('#province').type('Chiang Mai');
    cy.get('#postalCode').type('50200');
    fiClickButton(/^Register$/);
    cy.contains('Please enter a valid email').should('exist');
  });

  it('keeps register button disabled until required fields are complete', () => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('/pet-owners/register-page');

    cy.contains('button', /^Register$/).should('have.css', 'cursor', 'not-allowed');
    fiReplaceInput('#firstName', 'Alice');
    fiReplaceInput('#lastName', 'Smith');
    cy.get('#gender').select('female');
    fiReplaceInput('#phone', '0812345678');
    fiReplaceInput('#email', 'alice.complete@example.com');
    fiReplaceInput('#addressLine1', '123 Main St');
    fiReplaceInput('#subdistrict', 'Suthep');
    fiReplaceInput('#district', 'Mueang');
    fiReplaceInput('#province', 'Chiang Mai');
    cy.contains('button', /^Register$/).should('have.css', 'cursor', 'not-allowed');

    fiReplaceInput('#postalCode', '50200');
    cy.contains('button', /^Register$/).should('have.css', 'cursor', 'pointer');

    cy.get('#province').clear();
    cy.contains('button', /^Register$/).should('have.css', 'cursor', 'not-allowed');
  });

  it('prefills edit owner form with existing profile values', () => {
    const firstName = fiUnique('Prefill');
    const lastName = 'Owner';
    const phone = '0881112233';
    const email = `prefill.${Date.now()}@example.com`;
    const lineId = fiUnique('line').replace(/[^A-Za-z0-9_]/g, '');

    cy.fiEnsureOwnerProfile();
    cy.fiApi('PATCH', '/v1/user/profile', {
      fname: firstName,
      lname: lastName,
      gender: 'other',
      phone,
      email,
      line_id: lineId,
      picture_url: '',
    }).its('status').should('be.oneOf', [200, 201]);
    fiWaitForOwnerProfileName(firstName, lastName);

    cy.fiVisitAuthed('/pet-owners/owner-info-page/edit');
    cy.get('#firstName', { timeout: 20000 }).should('have.value', firstName);
    cy.get('#lastName').should('have.value', lastName);
    cy.get('#gender').should('have.value', 'other');
    cy.get('#phone').should('have.value', phone);
    cy.get('#email').should('have.value', email);
    cy.get('#line_id').should('have.value', lineId);
  });

  it('edits owner profile and persists on revisit', () => { //การแก้ไขข้อมูลส่วนตัว (Edit Profile)
    const firstName = fiUnique('Mina');
    const lastName = 'Kim';
    const phone = '0899999999';
    const email = `mina.${Date.now()}@example.com`;
    const lineId = fiUnique('line').replace(/[^A-Za-z0-9_]/g, '');
    cy.fiEnsureOwnerProfile();
    cy.fiVisitAuthed('/pet-owners/owner-info-page/edit');

    fiReplaceInput('#firstName', firstName);
    fiReplaceInput('#lastName', lastName);
    cy.get('#gender').select('female');
    fiReplaceInput('#phone', phone);
    fiReplaceInput('#email', email);
    fiReplaceInput('#line_id', lineId);
    cy.intercept('PATCH', '**/v1/user/profile').as('fiUpdateOwnerProfile');
    fiClickButton(/^Update$/);
    cy.wait('@fiUpdateOwnerProfile', { timeout: 30000 }).then((interception) => {
      const body = fiBodyAsObject(interception.request.body);
      expect(body).to.deep.include({
        fname: firstName,
        lname: lastName,
        gender: 'female',
        phone,
        email,
        line_id: lineId,
      });
      expect(body).to.have.property('picture_url');
      expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
    });
    fiWaitForOwnerProfileName(firstName, lastName);
    cy.fiApi('GET', '/v1/user/profile').then((res) => {
      const profile = fiProfileFromApiBody(res.body);
      expect(String(profile.fname ?? profile.first_name ?? '')).to.eq(firstName);
      expect(String(profile.lname ?? profile.last_name ?? '')).to.eq(lastName);
      expect(String(profile.phone ?? '')).to.eq(phone);
      expect(String(profile.email ?? '')).to.eq(email);
      expect(String(profile.line_id ?? '')).to.eq(lineId);
      expect(String(profile.gender ?? '')).to.eq('female');
    });

    cy.fiVisitAuthed('/pet-owners/owner-info-page');
    cy.contains('Owner Information', { timeout: 20000 }).should('exist');
    cy.contains(firstName, { timeout: 20000 }).should('exist');
    cy.contains(lastName, { timeout: 20000 }).should('exist');
    cy.contains(phone, { timeout: 20000 }).should('exist');
    cy.contains(email, { timeout: 20000 }).should('exist');
    cy.contains(lineId, { timeout: 20000 }).should('exist');
  });

  it('rejects unsupported owner profile image file types before presign request', () => {
    cy.fiEnsureOwnerProfile();
    cy.intercept('POST', '**/api/upload/presigned-url').as('fiOwnerPresignedUrl');
    cy.fiVisitAuthed('/pet-owners/owner-info-page/edit');

    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.from('not-an-image'),
      fileName: 'not-image.txt',
      mimeType: 'text/plain',
    }, { force: true });

    cy.contains('Invalid file type. Please upload JPEG, PNG, or WEBP.', { timeout: 20000 }).should('exist');
    cy.get('@fiOwnerPresignedUrl.all').should('have.length', 0);
  });

  it('rejects oversized owner profile image before presign request', () => {
    cy.fiEnsureOwnerProfile();
    cy.intercept('POST', '**/api/upload/presigned-url').as('fiOwnerPresignedUrl');
    cy.fiVisitAuthed('/pet-owners/owner-info-page/edit');

    cy.get('input[type="file"]').selectFile({
      contents: Cypress.Buffer.alloc(10 * 1024 * 1024 + 1, 1),
      fileName: 'too-large.jpeg',
      mimeType: 'image/jpeg',
    }, { force: true });

    cy.contains('File too large. Maximum size is 10MB.', { timeout: 20000 }).should('exist');
    cy.get('@fiOwnerPresignedUrl.all').should('have.length', 0);
  });

  it('uploads owner profile image with real presigned URL and R2 PUT', () => { //การอัปโหลดรูปภาพโปรไฟล์ (Image Upload)
    const lineId = fiUnique('line').replace(/[^A-Za-z0-9_]/g, '');
    let uploadedPublicUrl = '';
    cy.fiRequireR2UploadReady();
    cy.fiEnsureOwnerProfile();
    cy.intercept('POST', '**/api/upload/presigned-url').as('fiOwnerPresignedUrl');
    cy.intercept('PUT', /^https:\/\/.*\.r2\.cloudflarestorage\.com\/.*/).as('fiOwnerR2Put');
    cy.fiVisitAuthed('/pet-owners/owner-info-page/edit');

    cy.get('input[type="file"]').selectFile('cypress/img-test/test-1.jpeg', { force: true });
    cy.get('img[alt="Profile"]', { timeout: 60000 }).should('be.visible');
    cy.wait('@fiOwnerPresignedUrl', { timeout: 60000 }).then((interception) => {
      const requestBody = fiBodyAsObject(interception.request.body);
      const responseBody = fiBodyAsObject(interception.response?.body);
      expect(requestBody).to.deep.include({
        content_type: 'image/jpeg',
        folder: 'users',
      });
      expect(String(requestBody.filename ?? '')).to.match(/\.jpe?g$/i);
      expect(interception.response?.statusCode).to.eq(200);
      uploadedPublicUrl = String(responseBody.public_url ?? '');
      expect(uploadedPublicUrl).to.match(/^https?:\/\//);
    });
    cy.wait('@fiOwnerR2Put', { timeout: 60000 }).then((interception) => {
      expect(interception.request.headers).to.have.property('content-type');
      expect(String(interception.request.headers['content-type'])).to.include('image/jpeg');
      expect(interception.response?.statusCode).to.be.oneOf([200, 201, 204]);
    });
    fiReplaceInput('#line_id', lineId);
    cy.intercept('PATCH', '**/v1/user/profile').as('fiUpdateOwnerProfile');
    fiClickButton(/^Update$/);
    cy.wait('@fiUpdateOwnerProfile', { timeout: 30000 }).then((interception) => {
      const body = fiBodyAsObject(interception.request.body);
      expect(body).to.have.property('picture_url', uploadedPublicUrl);
      expect(body).to.have.property('line_id', lineId);
      expect(interception.response?.statusCode).to.be.oneOf([200, 201]);
    });
    cy.fiApi('GET', '/v1/user/profile').then((res) => {
      const profile = fiProfileFromApiBody(res.body);
      expect(String(profile.picture_url ?? '')).to.eq(uploadedPublicUrl);
    });
    cy.fiVisitAuthed('/pet-owners/owner-info-page');
    cy.contains('Owner Information', { timeout: 20000 }).should('exist');
  });
});
