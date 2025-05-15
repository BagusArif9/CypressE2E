describe('Infinix Mobile Slider Automation Test', () => {
    before(() => {
      cy.visit('https://id.infinixmobility.com/', {
        onBeforeLoad(win) {
          win.HTMLMediaElement.prototype.play = () => Promise.resolve();
          win.HTMLMediaElement.prototype.pause = () => {};
        }
      });
  
      cy.wait(2000); // Tunggu cookies muncul
  
      // Handle error runtime yang bisa diabaikan
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
  
      // Handle cookie popup
      cy.get('body', { timeout: 10000 }).then(($body) => {
        const rejectBtn = $body.find('.reject, [data-testid="cookie-reject"], .cookie-reject');
        if (rejectBtn.length) {
          cy.wrap(rejectBtn).first().click({ force: true });
        }
      });
    });
  
    const waitUntilSlideChanges = (prevIndex) => {
      // polling hingga index berubah dari sebelumnya
      cy.log(`Menunggu hingga cidx != ${prevIndex}`);
      cy.get('.selectors_el.act', { timeout: 15000 })
        .should('have.attr', 'cidx')
        .and((newIndex) => {
          expect(newIndex).to.not.equal(prevIndex);
        });
    };
  
    it('Should cycle through all pagination items (1-8) and return to first item', () => {
      cy.get('.swiper', { timeout: 10000 }).should('exist');
      const seenIndices = [];
  
      const checkSlide = (expectedIndex) => {
        cy.get('.selectors_el.act', { timeout: 10000 })
          .invoke('attr', 'cidx')
          .then((currentIndex) => {
            cy.log(`Slide aktif saat ini: ${currentIndex}`);
            seenIndices.push(currentIndex);
  
            expect(parseInt(currentIndex)).to.equal(expectedIndex);
  
            if (expectedIndex < 8) {
              waitUntilSlideChanges(currentIndex);
            }
          });
      };
  
      for (let i = 1; i <= 8; i++) {
        checkSlide(i);
      }
  
      // Tunggu kembali ke index 1 setelah slide ke-8
      waitUntilSlideChanges('8');
  
      cy.get('.selectors_el.act', { timeout: 10000 })
        .invoke('attr', 'cidx')
        .should('equal', '1')
        .then(() => {
          const uniqueIndices = [...new Set(seenIndices)];
          expect(uniqueIndices.sort()).to.deep.equal(['1', '2', '3', '4', '5', '6', '7', '8']);
        });
    });
  });
  