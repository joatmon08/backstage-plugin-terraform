# scaffolder-vault

Welcome to the scaffolder-vault backend plugin!

_This plugin was created through the Backstage CLI_

## Getting started

Your plugin has been added to the example app in this repository, meaning you'll be able to access it by running `yarn
start` in the root directory, and then navigating to [/scaffolder-vault](http://localhost:3000/scaffolder-vault).

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
import { createvaultWorkspaceAction } from '@internal/plugin-scaffolder-vault-backend';

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
    authenticateToVaultWithGitHubAction({
      configApi: env.config,
      discoveryApi: env.discovery,
    }),
    getTerraformTokenFromVaultAction({
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

This adds the custom action for creating a vault workspace.

In your `app-config.yaml`, set up the proxy to point to Vault.

```yaml
proxy:
  '/vault':
    target: http://127.0.0.1:8200
    allowedHeaders: ['X-Vault-Token']
```

Check out an example template using the action in `examples/vault/template.yaml`.
