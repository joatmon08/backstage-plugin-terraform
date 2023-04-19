/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import React from 'react';
import { useEntity } from '@backstage/plugin-catalog-react';
import { MissingAnnotationEmptyState } from '@backstage/core-components';
import { TerraformRunFetchComponent } from '../TerraformRunFetchComponent';
import {
  TERRAFORM_WORKSPACE_ANNOTATION,
  isTerraformAvailable,
} from '../../annotations';

export const TerraformRunTable = () => {
  const { entity } = useEntity();
  return !isTerraformAvailable(entity) ? (
    <MissingAnnotationEmptyState annotation={TERRAFORM_WORKSPACE_ANNOTATION} />
  ) : (
    <TerraformRunFetchComponent entity={entity} />
  );
};
