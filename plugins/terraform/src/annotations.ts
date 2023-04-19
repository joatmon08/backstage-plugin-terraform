/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { Entity } from '@backstage/catalog-model';

export const TERRAFORM_ORGANIZATION_ANNOTATION = 'terraform.io/organization';
export const TERRAFORM_PROJECT_ANNOTATION = 'terraform.io/project';
export const TERRAFORM_WORKSPACE_ANNOTATION = 'terraform.io/workspace';

export const isTerraformAvailable = (entity: Entity) =>
  Boolean(
    entity?.metadata.annotations?.hasOwnProperty(
      TERRAFORM_ORGANIZATION_ANNOTATION,
    ) ||
      entity?.metadata.annotations?.hasOwnProperty(
        TERRAFORM_PROJECT_ANNOTATION,
      ) ||
      entity?.metadata.annotations?.hasOwnProperty(
        TERRAFORM_WORKSPACE_ANNOTATION,
      ),
  );
