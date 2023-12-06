/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import React from 'react';
import Lock from '@material-ui/icons/Lock';
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
import { TerraformOutput } from '../../api/types';
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
  outputs: TerraformOutput[];
};

export const BasicTable = (props: BasicTableProps) => {
  const columns: TableColumn[] = [
    { title: 'Name', field: 'name' },
    {
      title: 'Value',
      field: 'value',
      render: rowData => {
        return rowData.sensitive ? (
          <Lock
            onClick={() => {
              navigator.clipboard.writeText(JSON.stringify(rowData.value));
            }}
          />
        ) : (
          String(JSON.stringify(rowData.value))
        );
      },
    },
  ];

  const data = props.outputs.map((run: TerraformOutput) => {
    return {
      name: run.attributes.name,
      value: run.attributes.value,
      type: run.attributes.type,
      sensitive: run.attributes.sensitive,
    };
  });

  return (
    <Table
      title={`Outputs for ${props.workspace}`}
      options={{ search: true, paging: true }}
      columns={columns}
      data={data}
    />
  );
};

export const TerraformOutputFetchComponent = ({
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

  const { value, loading, error } = useAsync(async (): Promise<
    TerraformOutput[]
  > => {
    const tfWorkspace = await terraformApi.getWorkspace(
      organization,
      workspace,
    );
    return terraformApi.getOutputs(tfWorkspace.data.id);
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
      outputs={value || []}
    />
  );
};
