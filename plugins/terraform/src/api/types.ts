/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

export interface TerraformApi {
  getTargetUrl(): Promise<string>;
  listRuns(workspaceId: string): Promise<TerraformRun[]>;
  getWorkspace(organization: string, workspace: string): Promise<Workspace>;
  getOutputs(workspaceID: string): Promise<TerraformOutput[]>;
  getResources(workspaceID: string): Promise<Resource[]>;
}

export interface Run {
  data: TerraformRun;
}

export interface Runs {
  data: TerraformRun[];
}

export interface TerraformRun {
  id: string;
  attributes: {
    status: string;
    'created-at': string;
  };
}

export interface Workspace {
  data: {
    id: string;
    attributes: {
      name: string;
    };
    relationships: {
      organization: {
        data: {
          id: string;
        };
      };
      project: {
        data: {
          id: string;
        };
      };
    };
    links: {
      self: string;
      'self-html': string;
    };
  };
}

export interface StateVersion {
  data: TerraformState;
}

export interface TerraformState {
  id: string;
  attributes: {
    resources: Resource[];
  };
  relationships: {
    outputs: {
      data: [
        {
          id: string;
        },
      ];
    };
  };
}

export interface Resource {
  name: string;
  type: string;
  count: number;
  module: string;
}

export interface Output {
  data: TerraformOutput;
}

export interface TerraformOutput {
  id: string;
  attributes: {
    name: string;
    sensitive: boolean;
    type: string;
    value: string;
  };
}
