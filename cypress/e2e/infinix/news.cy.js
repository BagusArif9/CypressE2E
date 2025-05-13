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
  
      // Cookie handling
      cy.get('body', { timeout: 10000 }).then(($body) => {
        const rejectBtn = $body.find('.reject, [data-testid="cookie-reject"], .cookie-reject');
        if (rejectBtn.length) {
          cy.wrap(rejectBtn).first().click({ force: true });
        }
      });
    });
  
    it('Should correctly navigate through news articles', () => {
      cy.wait(1000); // Initial load wait
  
      // Scroll down until title is visible or max scroll attempts reached
      const maxScrollAttempts = 5;
      let scrollAttempts = 0;
  
      const scrollToTitle = () => {
        cy.get('body').then(($body) => {
          if ($body.find('.title').length > 0 || scrollAttempts >= maxScrollAttempts) {
            // Title found or max attempts reached
            cy.get('.title').should('exist');
            return;
          }
          scrollAttempts++;
          cy.scrollTo('bottom', { duration: 1000 });
          cy.wait(1000);
          scrollToTitle(); // Recursive call
        });
      };
  
      scrollToTitle();
  
      // Process news articles
      cy.get('.new.new1, .new.new2').then(($newsItems) => {
        // Process each news item sequentially
        cy.scrollTo(0, 2900, { duration: 1000 });
        Cypress._.times($newsItems.length, (index) => {
          cy.get('.new.new1, .new.new2').eq(index).within(() => {
            cy.get('a').contains('Lihat Lebih Lanjut').click({ force: true });
          });
  
          // Verify and interact with detail page
          cy.url().should('include', '/learn/');
          cy.wait(2000);
          cy.scrollTo('bottom', { duration: 4000 });
          cy.wait(1000);
  
          // Go back and wait for main page to reload
          cy.go('back');
          cy.wait(2000); // Longer wait for page reconstruction
  
          // Re-scroll to bring news items back into view
          if (index < $newsItems.length - 1) {
            cy.scrollTo(0, 2900, { duration: 1000 });
            cy.wait(1000);
          }
        });
      });
    });
  
    it('Should scroll to and click "Lihat Semua" in the main news section', () => {
      cy.scrollTo(0, 2900, { duration: 1000 });
      cy.get('#mainnew .commontitle.dark .linkt_t')
        .contains('Lihat Semua')
        .should('be.visible')
        .click({ force: true });
      cy.scrollTo('bottom', { duration: 2000 });
      cy.wait(1000);
      cy.go('back');
      cy.wait(1000);
    });
  });