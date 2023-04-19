/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import {
  configApiRef,
  createApiFactory,
  createComponentExtension,
  createPlugin,
  discoveryApiRef,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
import { TerraformClient, terraformApiRef } from './api';

export const terraformPlugin = createPlugin({
  id: 'terraform',
  routes: {
    root: rootRouteRef,
  },
  apis: [
    createApiFactory({
      api: terraformApiRef,
      deps: {
        discoveryApi: discoveryApiRef,
        configApi: configApiRef,
      },
      factory: ({ discoveryApi, configApi }) => {
        return new TerraformClient({
          discoveryApi,
          configApi,
        });
      },
    }),
  ],
});

export const TerraformRunTable = terraformPlugin.provide(
  createComponentExtension({
    name: 'EntityTerraformRuns',
    component: {
      lazy: () =>
        import('./components/TerraformRunTable').then(m => m.TerraformRunTable),
    },
  }),
);

export const TerraformOutputTable = terraformPlugin.provide(
  createComponentExtension({
    name: 'EntityTerraformOutputs',
    component: {
      lazy: () =>
        import('./components/TerraformOutputTable').then(
          m => m.TerraformOutputTable,
        ),
    },
  }),
);

export const TerraformResourceTable = terraformPlugin.provide(
  createComponentExtension({
    name: 'EntityTerraformResources',
    component: {
      lazy: () =>
        import('./components/TerraformResourceTable').then(
          m => m.TerraformResourceTable,
        ),
    },
  }),
);
