describe('About page', () => {
  it('Back button works and browser back button works', () => {
    cy.visit('/community');
    cy.findByRole('textbox', { name: 'Search' }).type('San Antonio, TX');
    cy.findByRole('button', { name: 'Go' }).click();

    cy.waitForLoadFinish();

    cy.findByRole('button', { name: 'About' }).click();
    cy.findByText('How’s My Waterway Glossary').should('exist');
    cy.url().should('equal', `${window.location.origin}/about`);

    // verify that community search data is still there after clicking the Back button
    cy.findByRole('button', { name: 'Back' }).click();
    cy.findByTestId('overview-waterbodies-accordion-title').contains(
      'Overall condition of 8 waterbodies in the San Pedro Creek watershed.',
    );

    // test browser back button
    cy.findByRole('button', { name: 'About' }).click();
    cy.url().should('equal', `${window.location.origin}/about`);
    cy.go('back');
    cy.url().should(
      'equal',
      `${window.location.origin}/community/San%20Antonio,%20TX/overview`,
    );
  });

  it('Test navigating to about page', () => {
    const text =
      'was designed to provide the general public with information about the condition of their local waters';

    cy.visit('/about');

    // verify the app navigates to the page
    cy.findByText(text, { exact: false });

    // check the Questions and Answers tab
    cy.findByRole('tab', { name: 'Questions and Answers' }).click();
    cy.findByText(
      'is an EPA tool that helps users find information on the condition of their waters',
      { exact: false },
    );

    // go back to the About HMW page
    cy.findByRole('tab', { name: 'About How’s My Waterway' }).click();
    cy.findByText(text, { exact: false });
  });
});
