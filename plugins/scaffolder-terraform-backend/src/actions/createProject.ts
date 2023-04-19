/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { ConfigApi, DiscoveryApi } from '@backstage/core-plugin-api';
import { TerraformClient } from '../api';
import { ProjectRequest } from '../api/types';

export const createTerraformProjectAction = (options: {
  configApi: ConfigApi;
  discoveryApi: DiscoveryApi;
}) => {
  return createTemplateAction<{
    organization: string;
    name: string;
  }>({
    id: 'terraform:project:create',
    schema: {
      input: {
        required: ['organization', 'name'],
        type: 'object',
        properties: {
          organization: {
            type: 'string',
            title: 'Terraform Organization',
            description: 'The Terraform organization to create project',
          },
          name: {
            type: 'string',
            title: 'Name',
            description: 'The name of the Terraform project',
          },
        },
      },
    },
    async handler(ctx) {
      const { organization, name } = ctx.input;

      const terraformApi = new TerraformClient(options);

      const projectRequest: ProjectRequest = {
        data: {
          type: 'projects',
          attributes: {
            name: name,
          },
        },
      };
      ctx.logger.info(JSON.stringify(projectRequest));

      const project = await terraformApi.createProject(
        organization,
        projectRequest,
      );

      ctx.logger.info(`Created project ${name} with id ${project.id}`);
      ctx.output('name', name);
      ctx.output('id', project.id);
    },
  });
};
