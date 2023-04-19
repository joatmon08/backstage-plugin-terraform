/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { CatalogBuilder } from '@backstage/plugin-catalog-backend';
import { ScaffolderEntitiesProcessor } from '@backstage/plugin-scaffolder-backend';
import { Router } from 'express';
import { PluginEnvironment } from '../types';

import {
  CloudFormationRegionProcessor,
  CloudFormationStackProcessor,
} from 'backstage-aws-cloudformation-plugin';

export default async function createPlugin(
  env: PluginEnvironment,
): Promise<Router> {
  const builder = await CatalogBuilder.create(env);
  builder.addProcessor(new ScaffolderEntitiesProcessor());
  builder.addProcessor(new CloudFormationStackProcessor(env.config));
  builder.addProcessor(new CloudFormationRegionProcessor(env.config));
  const { processingEngine, router } = await builder.build();
  await processingEngine.start();
  return router;
}
