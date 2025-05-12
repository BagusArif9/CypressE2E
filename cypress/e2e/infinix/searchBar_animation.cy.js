describe('Infinix SearchBar Animation', () => {
    beforeEach(() => {
      cy.visit('https://id.infinixmobility.com/', {
        onBeforeLoad(win) {
          win.HTMLMediaElement.prototype.play = () => Promise.resolve();
          win.HTMLMediaElement.prototype.pause = () => {};
        }
      });
      cy.wait(2000);

  
      // Handle cookie popup
      cy.get('body', { timeout: 10000 }).then(($body) => {
        const cookieReject = $body.find('.reject, [data-testid="cookie-reject"], .cookie-reject');
        if (cookieReject.length) {
          cy.wrap(cookieReject).click({ force: true });
        }
      });
      cy.wait(2000);
    });
  
    it('Menguji fungsi search bar', () => {
      // 1. Verify header users is visible
      cy.get('.header__users', { timeout: 20000 })
        .should('exist')
        .and('be.visible');
  
      // 2. Click search icon
      cy.get('.header__users').within(() => {
        cy.get('[class*="search"] svg, .search_action svg, .search__action svg')
          .should('be.visible')
          .click({ force: true });
      });
  
      // 3. Verify search box appears
      cy.get('.header__menu__search, .header_menu_search', { timeout: 10000 })
        .should('be.visible')
        .and('have.css', 'display', 'flex')
        .and('have.css', 'opacity', '1');
  
      // 4. Type and submit search
      cy.get('.header__menu__search input[type="text"], .header_menu_search input[type="text"]', { timeout: 10000 })
        .should('be.visible')
        .then(($input) => {
          // Clear existing value if any
          if ($input.val().length > 0) {
            cy.wrap($input).type('{selectall}{backspace}'); // More reliable clear method
          }
          // Type search term and submit with Enter
          cy.wrap($input)
            .type('NOTE', { delay: 100 })
            .type('{enter}');
        });
  
      // 5. Verify search results page loads
      cy.url().should('include', '/search?searchVal=NOTE');
  
      // 6. Verify recommendations section exists
      cy.get('.lib-Recommendations', { timeout: 15000 })
        .should('exist')
        .and('be.visible');
  
      // 7. Scroll down for 2 seconds to ensure all elements are visible
      cy.scrollTo('bottom', { duration: 2000 });
      cy.wait(2000); // Additional wait after scrolling
  
      // 8. Verify specific product recommendations
      const expectedProducts = [
        'NOTE 50',
        'NOTE 40S', 
        'NOTE 40 Pro+ 5G'
      ];
  
      expectedProducts.forEach(product => {
        cy.contains('.lib-Recommendations', product) // More direct text matching
          .should('be.visible')
          .contains('View More')
      });
  
      // 9. Verify price is displayed
      cy.contains('.lib-Recommendations', 'Rp')
        .should('exist')
        .and('be.visible');
      // 10. Click search close icon and return to home page
      cy.get('.search__close', { timeout: 10000 })
        .should('be.visible')
        .click({ force: true });

      // Optional: Verify we're back at the homepage
      cy.url().should('eq', 'https://id.infinixmobility.com/'); 
    });
  });