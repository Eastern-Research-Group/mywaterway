describe('Eating Fish page', () => {
  it('Test fish advisory links in upper tab text', () => {
    const linkText = 'EXIT';

    function checkStateLinks(location: string, states: string) {
      cy.visit(`/community/${location}/eating-fish`);
      cy.waitForLoadFinish();

      cy.get('#eating-fish-state-links')
        .filter(`:contains("${states}")`)
        .should('be.visible');
      cy.get('#eating-fish-state-links')
        .findByText(linkText)
        .should('be.visible')
        .should(
          'have.attr',
          'href',
          'https://www.epa.gov/home/exit-epa',
        )
        .should('have.attr', 'target', '_blank')
        .should(
          'have.attr',
          'rel',
          'noopener noreferrer',
        );
    }

    checkStateLinks('farmington%20nm', 'New Mexico.');
    checkStateLinks('dc', 'District of Columbia and Maryland.');
    checkStateLinks('150100100603', 'Arizona, Nevada and Utah.');
    checkStateLinks('140802010205', 'Arizona, Colorado, New Mexico and Utah.');
  });

  it('Test fish advisory section with no data', () => {
    // intercept and return zero features for DC
    cy.intercept(
      'https://watersgeo.epa.gov/arcgis/rest/services/NLFA/FISH_GEN/MapServer/13/query?where=IS_DEFAULT%3D%27Y%27+and+STATE+in+%28%27DC%27,%27MD%27%29&outFields=*&returnGeometry=false&returnTrueCurves=false&returnIdsOnly=false&returnCountOnly=false&returnZ=false&returnM=false&returnDistinctValues=false&returnExtentsOnly=false&f=json',
      {
        statusCode: 200,
        body: {
          displayFieldName: 'NAME',
          features: [],
        },
      },
    ).as('nlfaZeroStates');

    cy.visit('/community/dc/eating-fish');
    cy.get('#eating-fish-state-links')
        .filter(`:contains("your state.")`)
        .should('be.visible');
  });

  it('Test fish advisory section when service fails', () => {
    // intercept and simulate service failure
    cy.intercept(
      'https://watersgeo.epa.gov/arcgis/rest/services/NLFA/FISH_GEN/MapServer/13/query?where=IS_DEFAULT%3D%27Y%27+and+STATE+in+%28%27DC%27,%27MD%27%29&outFields=*&returnGeometry=false&returnTrueCurves=false&returnIdsOnly=false&returnCountOnly=false&returnZ=false&returnM=false&returnDistinctValues=false&returnExtentsOnly=false&f=json',
      {
        statusCode: 500,
        body: {},
      },
    ).as('nlfaFail');

    cy.visit('/community/dc/eating-fish');
    cy.get('#eating-fish-state-links')
        .filter(`:contains("your state.")`)
        .should('be.visible');
  });
});
