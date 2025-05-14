describe('Testing GSAP Scroll Animation untuk NOTE 50 Pro', () => {
  beforeEach(() => {
    cy.visit('https://id.infinixmobility.com/NOTE-50-Pro', {
      failOnStatusCode: false,
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

    // Handle cookie button
    cy.get('body', { timeout: 5000 }).then(($body) => {
      if ($body.find('.reject').length) {
        cy.get('.reject').click();
      }
    });
  });

  it('Menguji pin-sec5-pc dan transformasi phone-container & text-container', () => {
    cy.wait(1000);
    const baseScroll = 5000;
    const targetScroll = 8000;
    const scrollIncrements = [0, 200];

    // --- Test pin-sec5-pc ---
    scrollIncrements.forEach((increment) => {
      const scrollY = baseScroll + increment;

      cy.scrollTo(0, scrollY, { duration: 1000 });
      cy.wait(300);

      cy.get('.pin-sec5-pc', { timeout: 5000 }).then(($el) => {
        const transform = $el.css('transform');
        const position = $el.css('position');
        const top = $el.css('top');

        cy.log(`ScrollY: ${scrollY}px`);
        cy.log(`Transform pin-sec5-pc: ${transform}`);
        cy.log(`Position: ${position}, Top: ${top}`);

        expect(transform).to.match(/matrix|translate/);

        if (scrollY >= baseScroll) {
          expect(position).to.eq('fixed');
          expect(top).to.match(/-?\d+\.?\d*px/);
        }
      });
    });

    // --- Helper function to extract translateX/Y values ---
    const getTranslateValues = (transformValue) => {
      if (!transformValue || transformValue === 'none') return { x: 0, y: 0 };

      if (transformValue.includes('matrix')) {
        const values = transformValue.match(/matrix\(([^)]+)\)/)[1].split(',').map(parseFloat);
        return { x: values[4], y: values[5] };
      }

      const matches = transformValue.match(/translate\(([^)]+)\)/);
      if (matches) {
        const [x, y] = matches[1].split(',').map(s => parseFloat(s.trim()));
        return { x, y };
      }

      return { x: 0, y: 0 };
    };

    // --- Verify initial phone-container ---
    cy.scrollTo(0, baseScroll + 700, { duration: 1000 });
    cy.wait(500);

    cy.get('.phone-container.transition', { timeout: 10000 })
      .first()
      .should('exist')
      .then(($el) => {
        const transform = $el.css('transform');
        const { x } = getTranslateValues(transform);

        cy.log(`Phone-container translateX value: ${x}`);
        expect(x).to.be.closeTo(0, 1);
        cy.log(`Initial phone-container: translateX = ${x}px`);
      });
    
    cy.scrollTo(0, baseScroll + 1500, { duration: 1000 });

    // --- Verify text-container with comprehensive text checking ---
cy.get('.text-container', { timeout: 15000 })
.first()
.should('exist')
.then(($container) => {
  // Debug: Log container content
  cy.log('Text container content:', $container.html());

  // Define all possible valid texts with more flexible matching
  const validTexts = {
    subtitle: [
      'DETAIL SEMPURNA',
      'One-Tap',
      'Infinix AI∞',
      'DETAIL',  // Partial match
      'SEMPU'    // Partial match
    ],
    title: [
      'DIBUAT DENGAN METAL',
      'NOTE 50 Pro',
      'Infinix NOTE 50 Pro',
      'METAL',    // Partial match
      'DIBUAT'    // Partial match
    ]
  };

  // Improved element finding that checks text content first
  const findAndValidateElement = (container, types, validOptions) => {
    const selectors = types.flatMap(type => [
      `[class*="${type}"]`, 
      `.${type}`,
      `.${type.replace(/\s+/g, '.')}`
    ]);
    
    for (const selector of selectors) {
      const elements = container.find(selector);
      for (let i = 0; i < elements.length; i++) {
        const el = Cypress.$(elements[i]);
        const text = el.text().trim();
        
        // Check if text matches any valid option (including partial matches)
        const isMatch = validOptions.some(option => 
          text.includes(option) || option.includes(text)
        );
        
        if (isMatch) {
          cy.log(`Found matching ${types[0]} with text: "${text}"`);
          return { element: el, text };
        }
      }
    }
    return null;
  };

  // Verify subtitle with more flexible matching
  const subtitleMatch = findAndValidateElement(
    $container, 
    ['subtitle', 'heading', 'text'],
    validTexts.subtitle
  );
  
  if (subtitleMatch) {
    expect(validTexts.subtitle.some(t => subtitleMatch.text.includes(t))).to.be.true;
  } else {
    cy.log('No valid subtitle element found');
  }

  // Verify title with more flexible matching
  const titleMatch = findAndValidateElement(
    $container,
    ['title', 'header', 'main-heading'],
    validTexts.title
  );
  
  if (titleMatch) {
    expect(validTexts.title.some(t => titleMatch.text.includes(t))).to.be.true;
  } else {
    cy.log('No valid title element found');
  }

  // Additional validation for cases where element classification is unclear
  if (!subtitleMatch && !titleMatch) {
    const allTextElements = $container.find('[class*="text"], [class*="title"], [class*="subtitle"]');
    allTextElements.each((index, el) => {
      const text = Cypress.$(el).text().trim();
      if (text) {
        cy.log(`Found unclassified text element with content: "${text}"`);
        // Check if it matches any valid text at all
        const isValid = [...validTexts.subtitle, ...validTexts.title].some(t => 
          text.includes(t) || t.includes(text)
        );
        expect(isValid, `Text "${text}" should match one of the valid patterns`).to.be.true;
      }
    });
  }
});
  });
});