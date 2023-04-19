/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { ConfigApi, DiscoveryApi } from '@backstage/core-plugin-api';
import { TerraformClient } from '../api';

export const createTerraformRunAction = (options: {
  configApi: ConfigApi;
  discoveryApi: DiscoveryApi;
}) => {
  return createTemplateAction<{
    workspaceID: string;
  }>({
    id: 'terraform:run:create',
    schema: {
      input: {
        required: ['workspaceID'],
        type: 'object',
        properties: {
          workspaceID: {
            type: 'string',
            title: 'Terraform Workspace ID',
            description: 'The Terraform workspace ID to queue a run',
          },
        },
      },
    },
    async handler(ctx) {
      const { workspaceID } = ctx.input;

      const message = 'Started by Backstage scaffolder task';

      const terraformApi = new TerraformClient(options);

      const run = await terraformApi.createRun(workspaceID, message);

      ctx.logger.info(`Started run with id ${run.data.id}`);
      ctx.output('id', run.data.id);
    },
  });
};
