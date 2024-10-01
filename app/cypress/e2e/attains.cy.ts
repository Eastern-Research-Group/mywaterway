describe('ATTAINS page', () => {
  it('Data page should link to ATTAINS page', () => {
    cy.visit('/');
    cy.findByRole('button', { name: 'Data' }).click();
    cy.findByText('About the Data').should('exist');
    cy.url().should('equal', `${window.location.origin}/data`);

    cy.findByText('How ATTAINS data are grouped in How’s My Waterway')
      .should('have.attr', 'href', 'attains')
      .should('have.attr', 'target', '_blank')
      .should('have.attr', 'rel', 'noopener noreferrer');
  });

  it('ATTAINS page displays a table', () => {
    cy.visit('/attains');
    cy.waitForLoadFinish({ timeout: 20000 });
    cy.findByText("How's My Waterway Impairment Category").should('exist');
  });
});
