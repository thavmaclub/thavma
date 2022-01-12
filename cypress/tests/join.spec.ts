import codes from 'cypress/fixtures/codes.json';
import user from 'cypress/fixtures/user.json';

describe('Join PG', () => {
  beforeEach(() => {
  });
  
  it('redirects to / when logged in', () => {
    cy.task('seed', { skipUser: true });
    cy.login(user);
    cy.visit('/join');
    cy.url().should('eq', 'http://localhost:3000/');
  });

  it('reuses codes by email', () => {
    cy.task('seed');
    cy.visit('/join', {
      onBeforeLoad(win: Window) {
        cy.stub(win, 'open').as('redirect');
      },
    });
    cy.get('input[placeholder="invite code"]')
      .as('input')
      .type(`${codes[0].id}{enter}`)
      .should('have.value', codes[0].id)
      .and('be.disabled')
      .and('have.css', 'cursor', 'wait')
      .loading();
    cy.get('@redirect')
      .should('be.calledOnce')
      .and('be.calledWithExactly', `http://localhost:3000/?code=${codes[2].id}`);
  });

  it('verifies invite codes', () => {
    cy.task('seed', { skipUser: true });
    cy.visit('/join', {
      onBeforeLoad(win: Window) {
        cy.stub(win, 'open').as('redirect');
      },
    });
    cy.percySnapshot('Join');
    cy.get('input[placeholder="invite code"]')
      .as('input')  
      .type('l0R3m_1psUm-d035Nt_w0rK{enter}')
      .should('be.disabled')
      .and('have.css', 'cursor', 'wait')
      .loading();
    cy.loading(false).get('@input').should('have.class', 'error').clear();
    cy.percySnapshot('Join Empty Error');
    cy.contains('button', 'request access')
      .click()
      .should('be.disabled')
      .and('have.css', 'cursor', 'wait')
      .loading();
    cy.loading(false)
      .get('@input')
      .should('have.class', 'error')
      .type(`${codes[0].id}{enter}`)
      .should('have.value', codes[0].id)
      .and('be.disabled')
      .and('have.css', 'cursor', 'wait')
      .loading();
    cy.loading(false)
      .get('@input')
      .should('have.class', 'error');
    cy.percySnapshot('Join Error');
    cy.get('@input')
      .clear()
      .type(`${codes[2].id}{enter}`)
      .should('have.value', codes[2].id)
      .and('be.disabled')
      .and('have.css', 'cursor', 'wait')
      .loading();
    cy.percySnapshot('Join Loading');
    cy.get('@redirect')
      .should('be.calledOnce')
      .and('be.calledWithExactly', `http://localhost:3000/?code=${codes[2].id}`);
  });
});
