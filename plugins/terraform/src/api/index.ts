/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import {
  ConfigApi,
  DiscoveryApi,
  createApiRef,
} from '@backstage/core-plugin-api';
import {
  Resource,
  StateVersion,
  TerraformApi,
  TerraformOutput,
  TerraformRun,
  Workspace,
} from './types';

const DEFAULT_PROXY_PATH = '/terraform/api';
const DEFAULT_TERRAFORM_URL = 'https://app.terraform.io';

/**
 * @public
 */
export const terraformApiRef = createApiRef<TerraformApi>({
  id: 'plugin.terraform.service',
});

type Options = {
  discoveryApi: DiscoveryApi;
  configApi: ConfigApi;
};

export class TerraformClient implements TerraformApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly proxyPath: string;
  private readonly targetUrl: string;

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;

    const proxyPath = options.configApi.getOptionalString(
      'terraform.proxyPath',
    );
    this.proxyPath = proxyPath ?? DEFAULT_PROXY_PATH;

    const targetUrl =
      options.configApi.getOptionalString('terraform.baseUrl') ||
      DEFAULT_TERRAFORM_URL;
    this.targetUrl = targetUrl;
  }

  private async getUrls() {
    const proxyUrl = await this.discoveryApi.getBaseUrl('proxy');
    return {
      apiUrl: `${proxyUrl}${this.proxyPath}/v2`,
      baseUrl: `${proxyUrl}${this.proxyPath}`,
    };
  }

  async getTargetUrl() {
    return this.targetUrl;
  }

  async getWorkspace(
    organization: string,
    workspaceName: string,
  ): Promise<Workspace> {
    const { apiUrl } = await this.getUrls();

    const response = await fetch(
      `${apiUrl}/organizations/${organization}/workspaces/${workspaceName}`,
      {
        method: 'GET',
      },
    );

    if (!response.ok) {
      throw new Error(
        `failed to fetch data, status ${response.status}: ${response.statusText}`,
      );
    }

    return await response.json();
  }

  async listRuns(workspaceID: string): Promise<TerraformRun[]> {
    const { apiUrl } = await this.getUrls();

    const response = await fetch(`${apiUrl}/workspaces/${workspaceID}/runs`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(
        `failed to fetch data, status ${response.status}: ${response.statusText}`,
      );
    }

    return response.json().then(runs => {
      return runs.data;
    });
  }

  private async getCurrentStateVersion(
    workspaceID: string,
  ): Promise<StateVersion> {
    const { apiUrl } = await this.getUrls();

    const response = await fetch(
      `${apiUrl}/workspaces/${workspaceID}/current-state-version`,
      {
        method: 'GET',
      },
    );

    if (!response.ok) {
      throw new Error(
        `failed to fetch data, status ${response.status}: ${response.statusText}`,
      );
    }

    return response.json();
  }

  private async getStateVersionOutput(
    outputID: string,
  ): Promise<TerraformOutput> {
    const { apiUrl } = await this.getUrls();

    const response = await fetch(
      `${apiUrl}/state-version-outputs/${outputID}`,
      {
        method: 'GET',
      },
    );

    if (!response.ok) {
      throw new Error(
        `failed to fetch data, status ${response.status}: ${response.statusText}`,
      );
    }

    return response.json().then(output => {
      return output.data;
    });
  }

  async getResources(workspaceID: string): Promise<Resource[]> {
    const stateVersion = this.getCurrentStateVersion(workspaceID);
    return (await stateVersion).data.attributes.resources;
  }

  async getOutputs(workspaceID: string): Promise<TerraformOutput[]> {
    const stateVersion = this.getCurrentStateVersion(workspaceID);
    const stateVersionOutputs = (await stateVersion).data.relationships.outputs
      .data;

    return Promise.all(
      stateVersionOutputs.map(async output => {
        const out = await this.getStateVersionOutput(output.id);
        return out;
      }),
    );
  }
}
