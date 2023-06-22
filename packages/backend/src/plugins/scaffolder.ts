/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { CatalogClient } from '@backstage/catalog-client';
import {
  createBuiltinActions,
  createRouter,
} from '@backstage/plugin-scaffolder-backend';
import { ScmIntegrations } from '@backstage/integration';
import { Router } from 'express';
import type { PluginEnvironment } from '../types';
import {
  createTerraformProjectAction,
  createTerraformWorkspaceAction,
  createTerraformRunAction,
  createTerraformVariablesAction,
} from '@internal/plugin-scaffolder-terraform-backend';
import { authenticateToVaultWithGitHubAction, getTerraformTokenFromVaultAction } from '../../../../plugins/scaffolder-vault-backend/src';

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
    createTerraformProjectAction({
      configApi: env.config,
      discoveryApi: env.discovery,
    }),
    createTerraformWorkspaceAction({
      configApi: env.config,
      discoveryApi: env.discovery,
    }),
    createTerraformRunAction({
      configApi: env.config,
      discoveryApi: env.discovery,
    }),
    createTerraformVariablesAction({
      configApi: env.config,
      discoveryApi: env.discovery,
    }),
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
