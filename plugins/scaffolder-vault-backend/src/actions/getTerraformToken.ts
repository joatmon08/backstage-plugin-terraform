/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { ConfigApi, DiscoveryApi } from '@backstage/core-plugin-api';
import { VaultClient } from '../api';

export const getTerraformTokenFromVaultAction = (options: {
  configApi: ConfigApi;
  discoveryApi: DiscoveryApi;
}) => {
  return createTemplateAction<{
    token: string;
    mount: string;
    role: string;
  }>({
    id: 'vault:secrets:terraform',
    schema: {
      input: {
        required: [
          'token',
          'mount',
          'role',
        ],
        type: 'object',
        properties: {
          token: {
            type: 'string',
            title: 'Vault Token',
            description: 'The Vault token to access Terraform secrets engine',
          },
          mount: {
            type: 'string',
            title: 'Vault Mount Path',
            description: 'The Vault mount path for Terraform secrets engine'
          },
          role: {
            type: 'string',
            title: 'Vault Role',
            description: 'The Vault role to access the Terraform secrets engine',
          },
        },
      },
    },
    async handler(ctx) {
      const {
        token,
        mount,
        role,
      } = ctx.input;

      const vaultApi = new VaultClient(options);

      ctx.logger.info(`Using Vault token to get Terraform token at ${mount}/creds/${role}`);

      const terraformCloudToken = await vaultApi.getTerraformToken(token, mount, role);

      ctx.logger.info(`Got Terraform Cloud token ${terraformCloudToken.data.token_id}, adding to secrets.TERRAFORM_CLOUD_TOKEN`);
      ctx.secrets["TERRAFORM_CLOUD_TOKEN"] = terraformCloudToken.data.token;
    },
  });
};
