/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { ConfigApi, DiscoveryApi } from '@backstage/core-plugin-api';
import { VaultClient } from '../api';

export const authenticateToVaultWithGitHubAction = (options: {
  configApi: ConfigApi;
  discoveryApi: DiscoveryApi;
}) => {
  return createTemplateAction<{
    token: string;
    path: string;
  }>({
    id: 'vault:authenticate:github',
    schema: {
      input: {
        required: [
          'token',
          'path',
        ],
        type: 'object',
        properties: {
          token: {
            type: 'string',
            title: 'GitHub Token',
            description: 'The GitHub OAuth2 user token to authenticate to Vault',
          },
          path: {
            type: 'string',
            title: 'GitHub Auth Method Path',
            description: 'The auth method path for GitHub',
          },
        },
      },
    },
    async handler(ctx) {
      const {
        token,
        path,
      } = ctx.input;

      const vaultApi = new VaultClient(options);

      ctx.logger.info(`Using GitHub OAuth user token to log into Vault`);

      const payload = JSON.stringify({token: `${token}`});
      const vaultToken = await vaultApi.authenticate(`${path}/login`, payload);

      ctx.logger.info(`Got Vault token, adding to secrets.VAULT_TOKEN`);
      ctx.secrets["VAULT_TOKEN"] = vaultToken;
    },
  });
};
