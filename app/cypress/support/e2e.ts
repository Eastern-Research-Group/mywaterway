// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';
import 'allure-cypress';
import '@cypress/code-coverage/support';

// Alternatively you can use CommonJS syntax:
// require('./commands')

// This is a workaround for making the tests more reliable when running
// cypress in headless mode, particularly for running code coverage.
// This also helps weed out some of the false errors from ArcGIS.
Cypress.on('uncaught:exception', (err, _runnable) => {
  // Do not suppress Cypress errors such as page-load timeouts, since doing so
  // can leave the command queue stuck instead of failing and retrying the test.
  if (err.name === 'CypressError') return;

  // returning false here prevents Cypress from failing the test for
  // application errors, including false errors from ArcGIS.
  return false;
});
