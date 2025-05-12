// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })


// import 'cypress-real-events/support';

// // Custom Command: handleCaptchaIfExists
// Cypress.Commands.add('handleCaptchaIfExists', () => {
//     cy.get('body').then(($body) => {
//       if ($body.text().includes('Press & Hold')) {
//         cy.log('CAPTCHA ditemukan, proses handle...');
  
//         // Temukan elemen teks "Press & Hold"
//         cy.contains('Press & Hold')
//           .should('be.visible')
//           .trigger('mousedown', { force: true })
//           .then(($pressElement) => {
//             // Cari parent terdekat, lalu anak div yang memiliki style width
//             cy.wrap($pressElement)
//               .parentsUntil('body')
//               .find('div[style*="width"]') // hanya div yang punya properti width
//               .first()
//               .should(($el) => {
//                 const width = parseFloat($el[0].style.width);
//                 expect(width).to.be.greaterThan(250); // validasi width sekitar 253px
//               });
  
//             // Setelah validasi, lepaskan tekan
//             cy.contains('Press & Hold').trigger('mouseup', { force: true });
//           });
//       } else {
//         cy.log('CAPTCHA tidak muncul, lanjut login.');
//       }
//     });
//   });
  