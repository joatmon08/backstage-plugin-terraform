/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { ConfigApi, DiscoveryApi } from '@backstage/core-plugin-api';
import { TerraformClient } from '../api';
import { VariableRequest } from '../api/types';

export const createTerraformVariablesAction = (options: {
  configApi: ConfigApi;
  discoveryApi: DiscoveryApi;
}) => {
  return createTemplateAction<{
    workspaceID: string;
    variables: {
      key: string;
      value: string;
      description: string;
      category: string;
      hcl?: boolean;
      sensitive?: boolean;
    }[];
    token: string;
  }>({
    id: 'terraform:variables:create',
    schema: {
      input: {
        required: ['workspaceID', 'variables'],
        type: 'object',
        properties: {
          workspaceID: {
            type: 'string',
            title: 'Terraform Workspace ID',
            description: 'The Terraform workspace ID to create variables',
          },
          variables: {
            type: 'array',
            items: {
              type: 'object',
              required: ['key', 'value', 'description', 'category'],
              properties: {
                key: {
                  title: 'Variable Key',
                  description: 'The key for Terraform variable',
                  type: 'string',
                },
                value: {
                  title: 'Variable Value',
                  description: 'The value for Terraform variable',
                  type: 'string',
                },
                description: {
                  title: 'Description',
                  description: 'The description for Terraform variable',
                  type: 'string',
                },
                category: {
                  title: 'Category',
                  description: 'Set to "terraform" or "env"',
                  type: 'string',
                },
                isHCLObject: {
                  title: 'HCL Object',
                  description: 'Set if string should be an HCL object',
                  type: 'boolean',
                },
                sensitive: {
                  title: 'Sensitive',
                  description: 'Set if variable is sensitive',
                  type: 'boolean',
                },
              },
            },
          },
          token: {
            type: 'string',
            title: 'Terraform Token',
            description: 'Terraform token',
          },
        },
      },
    },
    async handler(ctx) {
      const { workspaceID, variables, token } = ctx.input;

      const variableIDs = [];

      const terraformApi = new TerraformClient(options, token);

      for (const v of variables) {
        const request: VariableRequest = {
          data: {
            type: 'vars',
            attributes: v,
          },
        };
        const variable = await terraformApi.createVariable(
          workspaceID,
          request,
        );

        ctx.logger.info(
          `Created variable for ${v.key} with id ${variable.data.id}`,
        );
        variableIDs.push(variable.data.id);
      }

      ctx.output('ids', variableIDs);
    },
  });
};
