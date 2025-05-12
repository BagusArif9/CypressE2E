describe('Testing Swiper Component in NOTE 50 Pro', () => {
    const foundSources = new Set();
  
    beforeEach(() => {
      cy.visit('https://id.infinixmobility.com/NOTE-50-Pro', {
        onBeforeLoad(win) {
          win.HTMLMediaElement.prototype.play = () => Promise.resolve();
          win.HTMLMediaElement.prototype.pause = () => {};
        }
      });
  
      Cypress.on('uncaught:exception', (err) => {
        if (err.message.includes('play() was interrupted') || err.message.includes('Cookies is not defined')) {
          return false;
        }
        return true;
      });
  
      // Handle cookie banner
      cy.get('body', { timeout: 5000 }).then(($body) => {
        if ($body.find('.reject').length) {
          cy.get('.reject').click();
        }
      });
  
      cy.wait(3000);
  
      // Scroll to swiper section
      cy.scrollTo(0, 9800, { duration: 3000 });
      cy.get('.swiper-sec-8', { timeout: 10000 });
      cy.wait(3000);
  
      // Stop autoplay
      cy.window().then((win) => {
        const swiperEl = win.document.querySelector('.swiper-sec-8');
        if (swiperEl?.swiper) {
          swiperEl.swiper.autoplay.stop();
        }
      });
    });
  
    const validateSrc = (src) => {
      expect(src, 'Gambar harus valid').to.be.a('string').and.not.be.empty;
      expect(src).to.include('cloudfront.net/newfileadmin/usp/');
      foundSources.add(src);
      cy.log(`Validated src: ${src}`);
    };
  
    const swipeLeft = () => {
      cy.get('.swiper-sec-8 .swiper-wrapper')
        .trigger('pointerdown', { button: 0, x: 500, y: 150, force: true })
        .trigger('pointermove', { button: 0, x: 100, y: 150, force: true })
        .trigger('pointerup', { force: true });
      cy.wait(1500);
    };
  
    const swipeRight = () => {
      cy.get('.swiper-sec-8 .swiper-wrapper')
        .trigger('pointerdown', { button: 0, x: 100, y: 150, force: true })
        .trigger('pointermove', { button: 0, x: 500, y: 150, force: true })
        .trigger('pointerup', { force: true });
      cy.wait(1500);
    };
  
    it('should test swiper slides via gesture', () => {
      // 1. Get initial slide
      cy.get('.flex-container > .swiper-slide-active > img')
        .should('be.visible')
        .invoke('attr', 'src')
        .then((originalSrc) => {
          validateSrc(originalSrc);
          cy.log(`Original slide: ${originalSrc}`);
  
          // 2. Swipe left and verify change
          swipeLeft();
          
          cy.get('.flex-container > .swiper-slide-active > img')
            .should('be.visible')
            .invoke('attr', 'src')
            .then((newSrc) => {
              validateSrc(newSrc);
              expect(newSrc, 'Slide harus berubah setelah swipe ke kiri').to.not.equal(originalSrc);
              cy.log(`After swipe left: ${newSrc}`);
  
              // 3. Swipe right and verify change
              swipeRight();
              
              cy.get('.flex-container > .swiper-slide-active > img')
                .should('be.visible')
                .invoke('attr', 'src')
                .then((returnedSrc) => {
                  validateSrc(returnedSrc);
                  cy.log(`After swipe right: ${returnedSrc}`);
  
                  // 4. Multiple swipes to collect unique images
                  for (let i = 0; i < 3; i++) {
                    swipeLeft();
                    cy.get('.flex-container > .swiper-slide-active > img')
                      .invoke('attr', 'src')
                      .then(validateSrc);
                    cy.wait(500);
                  }
  
                  // 5. Verify we found all unique images
                  cy.then(() => {
                    cy.log(`Unique images found: ${foundSources.size}`);
                    expect(foundSources.size).to.be.gte(3);
                  });
                });
            });
        });
    });
});