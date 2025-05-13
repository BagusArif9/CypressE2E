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

    cy.get('body', { timeout: 3000 }).then(($body) => {
      if ($body.find('.reject').length) {
        cy.get('.reject').click();
        cy.log('❌ Cookies rejected');
      } else {
        cy.log('✅ No cookie banner');
      }
    });
  });

  it('Scroll perlahan dan validasi GSAP info-grid 1-9 satu per satu', () => {
    const startScroll = 1600;
    const stepSize = 50;
    const maxScroll = 5000;
    let currentIndex = 1;
    const totalGrids = 9;

    // ✅ Scroll ke awal agar .core-img muncul
    cy.scrollTo(0, startScroll, { duration: 1000 });
    cy.wait(1000);
    cy.get('#main-part > .core-img', { timeout: 8000 })
      .should('exist')
      .and('be.visible');

    cy.log('✅ .core-img terlihat, mulai scroll perlahan untuk info-grid 1-9');

    // ✅ Scroll perlahan dari startScroll hingga maxScroll
    cy.wrap(null).then(() => {
      let scrollY = startScroll;

      function scrollStep() {
        if (currentIndex > totalGrids || scrollY > maxScroll) {
          cy.log('✅ Semua info-grid selesai divalidasi');
          return;
        }

        const className = `.info-grid.info-grid-${currentIndex}`;
        cy.scrollTo(0, scrollY, { duration: 200 });
        cy.wait(200);

        return cy.get('body').then(() => {
          cy.get(className).then(($el) => {
            const opacity = parseFloat($el.css('opacity') || '0');

            if (opacity > 0) {
              const transform = $el.css('transform');
              const position = $el.css('position');

              cy.log(`🧪 ${className} muncul | ScrollY: ${scrollY} | Opacity: ${opacity} | Transform: ${transform}`);
              expect(opacity).to.be.greaterThan(0);
              expect(transform).to.match(/matrix|translate/);
              expect(position).to.not.eq('fixed');

              currentIndex++; // lanjut ke info-grid berikutnya
            }

            scrollY += stepSize;
            return scrollStep(); // lanjut scroll
          });
        });
      }

      return scrollStep();
    });
  });
});
