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
import { TerraformRun, Workspace } from '../../api/types';
import { terraformApiRef } from '../../api';
import { Box, Chip, Link } from '@material-ui/core';

export const terraformWorkspace = (entity: Entity) => {
  const organization =
    entity.metadata.annotations?.[TERRAFORM_ORGANIZATION_ANNOTATION];
  const workspace =
    entity.metadata.annotations?.[TERRAFORM_WORKSPACE_ANNOTATION];
  return { organization, workspace };
};

type DenseTableProps = {
  organization: string;
  workspace: Workspace;
  targetUrl: string;
  runs: TerraformRun[];
};

export const DenseTable = (props: DenseTableProps) => {
  const colorMap: Record<string, string> = {
    applied: '#60DEA9',
    planned: '#63D0FF',
    planned_and_finished: '#CEFCF2',
    errored: '#F24C53',
  };

  const columns: TableColumn[] = [
    { title: 'Run ID', field: 'id' },
    {
      title: 'Status',
      field: 'status',
      render: rowData => {
        return (
          <Chip
            label={
              <Box sx={{ color: colorMap[rowData.status] }}>
                {rowData.status}
              </Box>
            }
            variant="outlined"
          />
        );
      },
    },
    { title: 'Created At', field: 'createdAt' },
  ];

  const data = props.runs.map((run: TerraformRun) => {
    return {
      id: run.id,
      status: run.attributes.status,
      createdAt: run.attributes['created-at'],
    };
  });

  const url = `${props.targetUrl}${props.workspace.data.links['self-html']}`;

  return (
    <Table
      title={
        <Link href={url}>Runs for {props.workspace.data.attributes.name}</Link>
      }
      options={{ search: true, paging: true }}
      columns={columns}
      data={data}
    />
  );
};

export const TerraformRunFetchComponent = ({ entity }: { entity: Entity }) => {
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

  const { value, loading, error } = useAsync(async (): Promise<{
    workspace: Workspace;
    runs: TerraformRun[];
    targetUrl: string;
  }> => {
    const w = await terraformApi.getWorkspace(organization, workspace);
    const r = await terraformApi.listRuns(w.data.id);
    const t = await terraformApi.getTargetUrl();
    return { workspace: w, runs: r, targetUrl: t };
  }, []);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <ResponseErrorPanel error={error} />;
  }

  const emptyWorkspace = {
    data: {
      id: '',
      relationships: {
        organization: { data: { id: '' } },
        project: { data: { id: '' } },
      },
      attributes: { name: workspace },
      links: { self: '', 'self-html': '' },
    },
  };

  return (
    <DenseTable
      organization={organization}
      workspace={value?.workspace || emptyWorkspace}
      targetUrl={value?.targetUrl || ''}
      runs={value?.runs || []}
    />
  );
};
