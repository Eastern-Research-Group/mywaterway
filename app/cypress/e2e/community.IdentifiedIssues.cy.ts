describe('Identified Issues Tab', () => {
  beforeEach(() => {
    cy.visit('/community');
  });

  it('Toggling off the % Assessed Waters switch toggles all of the impairment category switches off', () => {
    // navigate to Identified Issues tab of Community page
    cy.findByPlaceholderText('Search by address', { exact: false }).type(
      '020700100102',
    );
    cy.findByText('Go').click();

    // wait for the web services to finish
    cy.findAllByTestId('hmw-loading-spinner', { timeout: 120000 }).should(
      'not.exist',
    );

    cy.findByRole('tab', { name: 'Identified Issues' }).click();

    cy.findByLabelText('Toggle Issues Layer').click({ force: true });
    cy.findByLabelText('Toggle Issues Layer').should(
      'have.attr',
      'aria-checked',
      'false',
    );

    // check that all switches are turned off
    cy.findByLabelText('Toggle all impairment categories').should(
      'have.attr',
      'aria-checked',
      'false',
    );
  });

  it('Clicking the Dischargers switch toggles the switch on', () => {
    // navigate to Identified Issues tab of Community page
    cy.findByPlaceholderText('Search by address', { exact: false }).type(
      '020700100102',
    );
    cy.findByText('Go').click();

    // wait for the web services to finish
    cy.findAllByTestId('hmw-loading-spinner', { timeout: 120000 }).should(
      'not.exist',
    );

    cy.findByRole('tab', { name: 'Identified Issues' }).click();

    cy.findByLabelText('Toggle Dischargers Layer').click({ force: true });
    cy.findByLabelText('Toggle Dischargers Layer').should(
      'have.attr',
      'aria-checked',
      'true',
    );
  });

  it('Clicking a Discharger accordion item expands it', () => {
    // navigate to Identified Issues tab of Community page
    cy.findByPlaceholderText('Search by address', { exact: false }).type(
      '020700100204',
    );
    cy.findByText('Go').click();

    // wait for the web services to finish
    cy.findAllByTestId('hmw-loading-spinner', { timeout: 120000 }).should(
      'not.exist',
    );

    // switch to Dischargers tab of Identified Issues tab and check that the discharger accordion item exists and expands when clicked
    cy.findByRole('tab', { name: 'Identified Issues' }).click();
    cy.findByTestId('hmw-dischargers').click();
    cy.findByText('WASHINGTON NAVY YARD').click();
    cy.findByText('Compliance Status:');
  });
});
