const { execSync } = require('child_process');

const testFolders = ['infinix', 'note_50_pro'];
testFolders.forEach(folder => {
  console.log(`\nRunning tests in folder: ${folder}`);
  try {
    execSync(`npx cypress run --spec "cypress/e2e/${folder}/*.cy.js"`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error occurred while running tests in ${folder}`);
    process.exit(1); 
  }
});
