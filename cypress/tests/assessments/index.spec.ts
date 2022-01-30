import assessment from 'cypress/fixtures/assessment.json';
import codes from 'cypress/fixtures/codes.json';
import user from 'cypress/fixtures/user.json';

describe('Assessments PG', () => {
  it('redirects to /join when logged out', () => {
    cy.visit('/assessments');
    cy.url().should('eq', 'http://localhost:3000/join');
  });

  it('shows fallback during login', () => {
    cy.seed({ skipUser: true, skipCode: true });
    cy.visit(`/assessments#access_token=l0R3m_1psUm-d035Nt_w0rK?code=${codes[1].id}`);
    cy.get('dt.loading').should('be.visible');
    cy.get('dd.loading').should('be.visible');
    cy.percySnapshot('Assessments Fallback');
  });

  it('creates and shows assessments', () => {
    cy.intercept('POST', `${Cypress.env().NEXT_PUBLIC_SUPABASE_URL as string}/rest/v1/assessments`).as('create-assessment');
    cy.intercept('GET', `${Cypress.env().NEXT_PUBLIC_SUPABASE_URL as string}/rest/v1/assessments?select=*&order=date.desc.nullslast`).as('get-assessments');
    cy.seed();
    cy.login(user);
    cy.visit('/assessments');
    cy.get('dt.loading').should('be.visible');
    cy.get('dd.loading').should('be.visible');
    cy.wait('@get-assessments');
    cy.contains('no assessments to show').should('be.visible');
    cy.percySnapshot('Assessments Empty');
    cy.get('input[placeholder="ex: chapter 6 psych test"]')
      .as('assessment-input')
      .type(' {enter}')
      .should('have.value', ' ')
      .and('be.disabled')
      .and('have.css', 'cursor', 'wait')
      .loading();
    cy.wait('@create-assessment').its('response.statusCode').should('eq', 400);
    cy.get('@assessment-input').should('have.class', 'error');
    cy.get('@assessment-input')
      .clear()
      .type(assessment.name)
      .should('have.value', assessment.name);
    cy.contains('button', 'create')
      .click()
      .should('be.disabled')
      .and('have.css', 'cursor', 'wait')
      .loading();
    cy.wait('@create-assessment').its('response.statusCode').should('eq', 201);
    cy.contains('no assessments to show').should('not.exist');
    cy.contains('dd', assessment.name).should('be.visible');
    cy.get('select[aria-label="Theme"]')
      .as('theme-select')  
      .should('have.value', 'system')
      .select('dark');
    cy.percySnapshot('Index Dark');
    cy.get('@theme-select').select('light');
    cy.percySnapshot('Index Light');
    cy.get('@theme-select').select('system');
    cy.seed();
    cy.contains('dd').should('not.exist');
    cy.contains('no assessments to show').should('be.visible');
  });
});
