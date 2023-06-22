# scaffolder-terraform

Welcome to the scaffolder-terraform backend plugin!

_This plugin was created through the Backstage CLI_

## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn
start` in the root directory, and then navigating to [/scaffolder-terraform](http://localhost:3000/scaffolder-terraform).

You can also serve the plugin in isolation by running `yarn start` in the plugin directory.
This method of serving the plugin provides quicker iteration speed and a faster startup and hot reloads.
It is only meant for local development, and the setup for it can be found inside the [/dev](/dev) directory.

## Install

Go to `packages/backend/src/plugins/scaffolder.ts` and add the following:

```typescript
import { CatalogClient } from '@backstage/catalog-client';
import {
  createBuiltinActions,
  createRouter,
} from '@backstage/plugin-scaffolder-backend';
import { ScmIntegrations } from '@backstage/integration';
import { Router } from 'express';
import type { PluginEnvironment } from '../types';
import { createTerraformWorkspaceAction } from '@internal/plugin-scaffolder-terraform-backend';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const catalogClient = new CatalogClient({
    discoveryApi: env.discovery,
  });
  const integrations = ScmIntegrations.fromConfig(env.config);

  const builtInActions = createBuiltinActions({
    integrations,
    catalogClient,
    config: env.config,
    reader: env.reader,
  });

  const actions = [
    ...builtInActions,
    createTerraformWorkspaceAction({
      configApi: env.config,
      discoveryApi: env.discovery,
    }),
  ];

  return await createRouter({
    actions,
    logger: env.logger,
    config: env.config,
    database: env.database,
    reader: env.reader,
    catalogClient,
    identity: env.identity,
    permissions: env.permissions,
  });
}
```

This adds the custom action for creating a Terraform workspace.

In your `app-config.yaml`, add the base URL for Terraform Cloud/Enterprise
and set up the proxy to point to Terraform Cloud/Enterprise.

```yaml
scaffolder:
  terraform:
    baseUrl: https://app.terraform.io

proxy:
  '/terraform':
    target: https://app.terraform.io
    headers:
      Authorization: Bearer ${TF_TOKEN}
      Accept: 'application/vnd.api+json'
```

Check out an example template using the action in `examples/terraform/template.yaml`.
