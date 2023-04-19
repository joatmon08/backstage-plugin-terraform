/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import React from 'react';
import { Entity } from '@backstage/catalog-model';
import {
  Table,
  TableColumn,
  Progress,
  ResponseErrorPanel,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import useAsync from 'react-use/lib/useAsync';
import {
  TERRAFORM_ORGANIZATION_ANNOTATION,
  TERRAFORM_WORKSPACE_ANNOTATION,
} from '../../annotations';
import { Resource } from '../../api/types';
import { terraformApiRef } from '../../api';

export const terraformWorkspace = (entity: Entity) => {
  const organization =
    entity.metadata.annotations?.[TERRAFORM_ORGANIZATION_ANNOTATION];
  const workspace =
    entity.metadata.annotations?.[TERRAFORM_WORKSPACE_ANNOTATION];
  return { organization, workspace };
};

type BasicTableProps = {
  organization: string;
  workspace: string;
  resources: Resource[];
};

export const BasicTable = (props: BasicTableProps) => {
  const columns: TableColumn[] = [
    { title: 'Name', field: 'name' },
    { title: 'Type', field: 'type' },
    { title: 'Count', field: 'count' },
  ];

  const data = props.resources.map((run: Resource) => {
    return {
      name: run.name,
      type: run.type,
      count: run.count,
    };
  });

  return (
    <Table
      title={`Resources for ${props.workspace}`}
      options={{ search: true, paging: true }}
      columns={columns}
      data={data}
    />
  );
};

export const TerraformResourceFetchComponent = ({
  entity,
}: {
  entity: Entity;
}) => {
  const terraformApi = useApi(terraformApiRef);
  const { organization, workspace } = terraformWorkspace(entity);

  if (!organization) {
    throw Error(
      `The Terraform organizaton is undefined. Please, define the annotation ${TERRAFORM_ORGANIZATION_ANNOTATION}`,
    );
  }

  if (!workspace) {
    throw Error(
      `The Terraform workspace is undefined. Please, define the annotation ${TERRAFORM_WORKSPACE_ANNOTATION}`,
    );
  }

  const { value, loading, error } = useAsync(async (): Promise<Resource[]> => {
    const tfWorkspace = await terraformApi.getWorkspace(
      organization,
      workspace,
    );
    return terraformApi.getResources(tfWorkspace.data.id);
  }, []);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  return (
    <BasicTable
      organization={organization}
      workspace={workspace}
      resources={value || []}
    />
  );
};
