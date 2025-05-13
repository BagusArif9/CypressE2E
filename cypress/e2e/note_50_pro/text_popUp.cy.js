describe('Testing GSAP Scroll Animation per info-grid', () => {
  beforeEach(() => {
    cy.visit('https://id.infinixmobility.com/NOTE-50-Pro', {
      onBeforeLoad(win) {
        win.HTMLMediaElement.prototype.play = () => Promise.resolve();
        win.HTMLMediaElement.prototype.pause = () => {};
      }
    });

    Cypress.on('uncaught:exception', (err) => {
      if (
        err.message.includes('play() was interrupted') ||
        err.message.includes('Cookies is not defined')
      ) {
        return false;
      }
      return true;
    });

    // Handle cookie pop-up if exists
    cy.get('body', { timeout: 3000 }).then(($body) => {
      if ($body.find('.reject').length) {
        cy.get('.reject').click();
      }
    });

    cy.wait(2000);
  });
  
  it('Menguji perubahan detail transform text dan video berdasarkan scroll', () => {
    cy.get('body', { timeout: 20000 }).then(($body) => {
      const headlines = $body.find('.headline');

      if (headlines.length > 0) {
        testElementBased(headlines.first());
      } else {
        cy.log('⚠️ No .headline elements found');
      }

      testWithScrollPositions();
    });
  });

  const testWithScrollPositions = () => {
    cy.log('🚀 Testing with scroll positions 8800→9000');

    // Scroll to initial and trigger points
    cy.scrollTo(0, 8800, { duration: 2000 });
    cy.wait(4000);
    cy.scrollTo(0, 9000, { duration: 2000 });
    cy.wait(2000);

    // Simulate gradual scroll for animation trigger
    for (let y = 8800; y <= 9000; y += 100) {
      cy.scrollTo(0, y, { duration: 200 });
      cy.wait(100);
    }
    cy.wait(3000); // Allow GSAP animation to complete

    cy.get('.title', { timeout: 15000 })
      .should('be.visible')
      .and('have.class', 'active');
      

    // Retry logic to ensure animation completed
    cy.retry(() => {
      cy.get('.title')
        .should('have.class', 'active');
    }, {
      delay: 1000,
      tries: 5,
      log: 'Retrying active class check'
    });

    // Scroll back up and verify deactivation
    cy.scrollTo(0, 8800, { duration: 1000 });
    cy.wait(2000);

    cy.get('.title').first()
      .should('not.have.class', 'active');
  };

  const testElementBased = ($el) => {
    cy.log('🔍 Testing with element scroll');

    // Scroll to relevant region
    cy.scrollTo(0, 8800, { duration: 2000 });
    cy.wait(2000);
    cy.scrollTo(0, 9000, { duration: 2000 });
    cy.wait(2000);

    // Confirm the title has already become active
    cy.get('.title', { timeout: 15000 })
      .should('be.visible')
      .and('have.class', 'active');

    // Retry inside element
    cy.wrap($el).within(() => {
      cy.retry(() => {
        cy.get('.title').should('have.class', 'active');
      }, {
        delay: 1000,
        tries: 5,
        log: 'Retrying active class check'
      });
    });

    // Scroll up to reset
    cy.scrollTo(0, 8800, { duration: 1000 });
    cy.wait(2000);

    cy.wrap($el).within(() => {
      cy.get('.title')
        .should('not.have.class', 'active');
    });

    // Scroll again like the first test
    cy.scrollTo(0, 8800, { duration: 2000 });
    cy.wait(2000);
    cy.scrollTo(0, 9000, { duration: 2000 });
    cy.wait(2000);
  };
});
