describe('Infinix Indonesia - NOTE 50 Navigation Test', () => {
    beforeEach(() => {
      cy.visit('https://id.infinixmobility.com/', {
        onBeforeLoad(win) {
          win.HTMLMediaElement.prototype.play = () => Promise.resolve();
          win.HTMLMediaElement.prototype.pause = () => {};
        }
      });
      cy.wait(2000);

  
      Cypress.on('uncaught:exception', (err) => {
        const ignoredErrors = [
          'play() was interrupted',
          'Cookies is not defined',
          'reading \'style\'',
          'undefined is not iterable',
          'hasAttribute',
          'Cannot read properties of null'
        ];
        return !ignoredErrors.some(error => err.message.includes(error));
      });
  
      // Cookie handling with more robust selectors
      cy.get('body', { timeout: 10000 }).then(($body) => {
        const rejectBtn = $body.find('.reject, [data-testid="cookie-reject"], .cookie-reject');
        if (rejectBtn.length) {
          cy.wrap(rejectBtn).first().click({ force: true });
        }
      });
    });
  
    it('Should correctly navigate to NOTE 50 page', () => {
        cy.wait(2000); // Allow initial load
      
        // First verify the menu container exists
        cy.get('.header__menu__', { timeout: 20000 })
          .should('exist')
          .and('be.visible');
      
        // Alternative approach to find the Smartphones menu item
        cy.contains('.header__menu__ li, .header__menu__ a', /smartphones/i, { timeout: 20000 })
          .should('exist')
          .then(($menuItem) => {
            // Scroll into view if needed
            cy.wrap($menuItem)
              .scrollIntoView({ ensureScrollable: false })
              .should('be.visible')
              .trigger('mouseover', { force: true });
          });
      
        // Wait for dropdown animation with more flexible visibility check
        cy.get('.header__submenus', { timeout: 20000 })
          .should(($el) => {
            expect($el).to.have.css('display').not.equal('none');
            expect($el).to.have.css('visibility').not.equal('hidden');
          });
      
        // Find NOTE 50 link with error handling
        cy.get('.header__submenus')
          .find('a')
          .filter((index, el) => el.href.includes('/NOTE-50'))
          .first()
          .should('exist')
          .then(($link) => {
            cy.wrap($link)
              .scrollIntoView({ ensureScrollable: false })
              .click({ force: true });
          });
      
        // Confirm navigation
        cy.url({ timeout: 30000 })
          .should('include', '/NOTE-50')
          .and('not.include', 'HOT-50');
      
      });
  });