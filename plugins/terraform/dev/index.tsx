/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import React from 'react';
import { Entity } from '@backstage/catalog-model';
import { createDevApp } from '@backstage/dev-utils';
import {
  terraformPlugin,
  TerraformRunTable,
  TerraformOutputTable,
} from '../src/plugin';
import {
  TERRAFORM_ORGANIZATION_ANNOTATION,
  TERRAFORM_WORKSPACE_ANNOTATION,
} from '../src/annotations';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { TestApiProvider } from '@backstage/test-utils';
import { Grid } from '@material-ui/core';
import {
  Header,
  Page,
  Content,
  ContentHeader,
  HeaderLabel,
  SupportButton,
} from '@backstage/core-components';
import workspaceJson from './fixtures/workspaces.json';
import runJson from './fixtures/runs.json';
import outputJson from './fixtures/outputs.json';
import {
  TerraformApi,
  TerraformOutput,
  TerraformRun,
  Workspace,
} from '../src/api/types';
import { terraformApiRef } from '../src/api';

const entity: Entity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'backstage',
    annotations: {
      [TERRAFORM_ORGANIZATION_ANNOTATION]: 'test',
      [TERRAFORM_WORKSPACE_ANNOTATION]: 'test',
    },
  },
  spec: {
    type: 'service',
  },
};

const mockedApi: TerraformApi = {
  getWorkspace: async (): Promise<Workspace> => workspaceJson,
  listRuns: async (): Promise<TerraformRun[]> => runJson,
  getOutputs: async (): Promise<TerraformOutput[]> => outputJson,
};

createDevApp()
  .registerPlugin(terraformPlugin)
  .addPage({
    element: (
      <TestApiProvider apis={[[terraformApiRef, mockedApi]]}>
        <EntityProvider entity={entity}>
          <Page themeId="tool">
            <Header
              title="Welcome to the Terraform Plugin!"
              subtitle="Workspaces & Resources"
            >
              <HeaderLabel label="Owner" value="Platform" />
              <HeaderLabel label="Lifecycle" value="Alpha" />
            </Header>
            <Content>
              <ContentHeader title="Terraform">
                <SupportButton>
                  Go to Terraform for additional debug information.
                </SupportButton>
              </ContentHeader>
              <Grid container spacing={3} direction="column">
                <Grid item>
                  <TerraformRunTable />
                </Grid>
              </Grid>
              <Grid container spacing={10} direction="column">
                <Grid item>
                  <TerraformOutputTable />
                </Grid>
              </Grid>
            </Content>
          </Page>
        </EntityProvider>
      </TestApiProvider>
    ),
    title: 'Root Page',
    path: '/terraform',
  })
  .render();
