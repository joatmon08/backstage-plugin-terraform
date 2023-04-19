/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

describe('App', () => {
  it('should render the catalog', () => {
    cy.visit('/');
    cy.contains('My Company Catalog');
  });
});
