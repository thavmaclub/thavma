import '@cypress/code-coverage/support';
import '@percy/cypress';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  Cypress.env().NEXT_PUBLIC_SUPABASE_URL,
  Cypress.env().NEXT_PUBLIC_SUPABASE_KEY
);

type Overrides = { skipCode?: boolean; skipCodes?: boolean; skipUser?: boolean; skipInviter?: boolean };

Cypress.Commands.add('seed', (overrides?: Overrides) =>
  cy.task('seed', overrides)
);
Cypress.Commands.add('login', async (u: { email: string; password: string }) => { 
  await supabase.auth.signIn(u);
  return null;
});
Cypress.Commands.add('getBySel', (selector: string, ...args: any) =>
  cy.get(`[data-cy=${selector}]`, ...args)
);
Cypress.Commands.add('loading', (isLoading = true, ...args: any) => {
  if (isLoading) {
    cy.get('html', ...args).should('have.class', 'nprogress-busy');
    cy.get('#nprogress', ...args).should('exist');
  } else {
    cy.get('html', ...args).should('not.have.class', 'nprogress-busy');
    cy.get('#nprogress', ...args).should('not.exist');
  }
});

declare global {
  namespace Cypress {
    interface Chainable {
      getBySel: (selector: string, args?: any) => Chainable<JQuery<HTMLElement>>;
      loading: (isLoading?: boolean, args?: any) => Chainable<undefined>;
      login: (user: { email: string; password: string }) => Chainable<null>;
      seed: (overrides?: Overrides) => Chainable<null>;
    }
  }
}
