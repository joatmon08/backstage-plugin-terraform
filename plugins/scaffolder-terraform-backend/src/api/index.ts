/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { ConfigApi, DiscoveryApi } from '@backstage/core-plugin-api';
import {
  OAuthClient,
  OAuthToken,
  Project,
  ProjectRequest,
  Run,
  RunRequest,
  TerraformApi,
  Variable,
  VariableRequest,
  Workspace,
  WorkspaceRequest,
} from './types';

const DEFAULT_PROXY_PATH = '/terraform/api';

type Options = {
  discoveryApi: DiscoveryApi;
  configApi: ConfigApi;
};

export class TerraformClient implements TerraformApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly proxyPath: string;
  private readonly headers: Record<string, string>;

  constructor(options: Options, token?: string) {
    this.discoveryApi = options.discoveryApi;

    const proxyPath = options.configApi.getOptionalString(
      'terraformCloud.proxyPath',
    );
    this.proxyPath = proxyPath ?? DEFAULT_PROXY_PATH;
    this.headers = this.getHeaders(token);
  }

  private async getUrls() {
    const proxyUrl = await this.discoveryApi.getBaseUrl('proxy');
    return {
      apiUrl: `${proxyUrl}${this.proxyPath}/v2`,
      baseUrl: `${proxyUrl}${this.proxyPath}`,
    };
  }

  private getHeaders(token?: string): Record<string, string> {
    const headers = {
      'Content-Type': 'application/vnd.api+json'
    };

    if (token != undefined) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  async getOAuthClients(
    organization: string,
    serviceProvider: string,
  ): Promise<OAuthClient> {
    const { apiUrl } = await this.getUrls();

    const response = await fetch(
      `${apiUrl}/organizations/${organization}/oauth-clients`,
      {
        method: 'GET',
        headers: this.headers,
      },
    );

    if (!response.ok) {
      throw new Error(
        `failed to fetch oauth clients, status ${response.status}: ${response.statusText}`,
      );
    }

    return response.json().then(clients => {
      return clients.data.filter(
        (client: OAuthClient) =>
          client.attributes['service-provider'] === serviceProvider,
      )[0];
    });
  }

  async getOAuthToken(clientID: string, user: string, token?: string): Promise<OAuthToken> {
    const { apiUrl } = await this.getUrls();

    const response = await fetch(
      `${apiUrl}/oauth-clients/${clientID}/oauth-tokens`,
      {
        method: 'GET',
        headers: this.headers,
      },
    );

    if (!response.ok) {
      throw new Error(
        `failed to fetch oauth client token, status ${response.status}: ${response.statusText}`,
      );
    }

    return response.json().then(tokens => {
      if (user !== undefined) {
        return tokens.data.filter(
          (token: OAuthToken) =>
            token.attributes['service-provider-user'] === user,
        )[0];
      }
      return tokens.data[0];
    });
  }

  async getProject(organization: string, project: string, token?: string): Promise<Project> {
    const { apiUrl } = await this.getUrls();

    const urlSearchParams = new URLSearchParams({
      'filter[names]': project,
    });

    const response = await fetch(
      `${apiUrl}/organizations/${organization}/projects?${urlSearchParams}`,
      {
        method: 'GET',
        headers: this.headers,
      },
    );

    if (!response.ok) {
      throw new Error(
        `failed to get project, status ${response.status}: ${response.statusText}`,
      );
    }

    return response.json().then(projects => {
      return projects.data[0];
    });
  }

  async createProject(
    organization: string,
    project: ProjectRequest,
  ): Promise<Project> {
    const { apiUrl } = await this.getUrls();

    const response = await fetch(
      `${apiUrl}/organizations/${organization}/projects`,
      {
        method: 'POST',
        body: JSON.stringify(project),
        headers: this.headers,
      },
    );

    if (!response.ok) {
      throw new Error(
        `failed to create project, status ${response.status}: ${response.statusText}`,
      );
    }

    const terraformProject = await response.json();
    return terraformProject.data;
  }

  async createWorkspace(
    organization: string,
    workspace: WorkspaceRequest,
  ): Promise<Workspace> {
    const { apiUrl } = await this.getUrls();

    const response = await fetch(
      `${apiUrl}/organizations/${organization}/workspaces`,
      {
        method: 'POST',
        body: JSON.stringify(workspace),
        headers: this.headers,
      },
    );

    if (!response.ok) {
      throw new Error(
        `failed to create workspace, status ${response.status}: ${response.statusText}`,
      );
    }

    return response.json();
  }

  async createVariable(
    workspace: string,
    variable: VariableRequest,
  ): Promise<Variable> {
    const { apiUrl } = await this.getUrls();

    const response = await fetch(`${apiUrl}/workspaces/${workspace}/vars`, {
      method: 'POST',
      body: JSON.stringify(variable),
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(
        `failed to create variable, status ${response.status}: ${response.statusText}`,
      );
    }

    return response.json();
  }

  async createRun(workspaceID: string, message: string, token?: string): Promise<Run> {
    const { apiUrl } = await this.getUrls();

    const runRequest: RunRequest = {
      data: {
        attributes: {
          message: message,
        },
        type: 'runs',
        relationships: {
          workspace: {
            data: {
              type: 'workspaces',
              id: workspaceID,
            },
          },
        },
      },
    };

    const response = await fetch(`${apiUrl}/runs`, {
      method: 'POST',
      body: JSON.stringify(runRequest),
      headers: this.headers,
    });

    if (!response.ok) {
      throw new Error(
        `failed to create run, status ${response.status}: ${response.statusText}`,
      );
    }

    return response.json();
  }
}
