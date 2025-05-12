describe('Testing GSAP Scroll Animation per info-grid', () => {
  beforeEach(() => {
    cy.visit('https://id.infinixmobility.com/NOTE-50-Pro', {
      onBeforeLoad(win) {
        win.HTMLMediaElement.prototype.play = () => Promise.resolve();
        win.HTMLMediaElement.prototype.pause = () => {};
      }
    });

    // Handle semua uncaught exception (termasuk Cookies not defined)
    Cypress.on('uncaught:exception', (err) => {
      if (
        err.message.includes('play() was interrupted') ||
        err.message.includes('Cookies is not defined')
      ) {
        return false; // prevent test from failing
      }
      return true;
    });

    // Tunggu body muncul, baru klik tombol cookie jika ada
    cy.get('body', { timeout: 5000 }).then(($body) => {
      if ($body.find('.reject').length) {
        cy.get('.reject').click();
        cy.log('❌ Cookies rejected');
      } else {
        cy.log('✅ No cookie banner');
      }
    });
  });

  it('Menguji perubahan detail transform dan opacity info-grid berdasarkan scroll', () => {
    const baseScroll = 1500;
    const offset = 200;

    for (let i = 1; i <= 9; i++) {
      const scrollY = baseScroll + (i - 1) * offset;
      const className = `.info-grid.info-grid-${i}`;

      cy.scrollTo(0, scrollY, { duration: 1000 });
      // cy.wait(100); // waktu animasi

      cy.get(className, { timeout: 5000 }).then(($el) => {
        const transform = $el.css('transform');
        const opacity = $el.css('opacity');
        const position = $el.css('position');

        cy.log(`🧪 ${className} | ScrollY: ${scrollY} | Transform: ${transform} | Opacity: ${opacity}`);

        expect(transform).to.match(/matrix|translate/);
        expect(opacity).to.not.eq('0');
        expect(position).to.not.eq('fixed');
      });
    }
  });
});
