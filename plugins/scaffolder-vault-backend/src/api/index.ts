/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { ConfigApi, DiscoveryApi } from '@backstage/core-plugin-api';
import {
  AuthResponse,
  TerraformSecretResponse,
  VaultApi
} from './types';

const DEFAULT_PROXY_PATH = '/vault';

type Options = {
  discoveryApi: DiscoveryApi;
  configApi: ConfigApi;
};

export class VaultClient implements VaultApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly proxyPath: string;

  constructor(options: Options) {
    this.discoveryApi = options.discoveryApi;

    const proxyPath = options.configApi.getOptionalString(
      'vault.proxyPath',
    );
    this.proxyPath = proxyPath ?? DEFAULT_PROXY_PATH;
  }

  private async getUrls() {
    const proxyUrl = await this.discoveryApi.getBaseUrl('proxy');
    return {
      apiUrl: `${proxyUrl}${this.proxyPath}/v1`,
      baseUrl: `${proxyUrl}${this.proxyPath}`,
    };
  }

  async authenticate(
    path: string,
    payload: string,
  ): Promise<string> {
    const { apiUrl } = await this.getUrls();

    const response = await fetch(`${apiUrl}/auth/${path}`, {
      method: 'POST',
      body: payload
    });

    if (!response.ok) {
      throw new Error(
        `failed to authenticate to Vault, status ${response.status}: ${response.statusText}`,
      );
    }

    return response.json().then((resp: AuthResponse) => {
      return resp.auth.client_token;
    });
  }

  async getTerraformToken(token: string, mount: string, role: string): Promise<TerraformSecretResponse> {
    const { apiUrl } = await this.getUrls();
    const vaultHeaders = new Headers();
    vaultHeaders.append("X-Vault-Token", token);

    const response = await fetch(`${apiUrl}/${mount}/creds/${role}`, {
      method: 'GET',
      headers: vaultHeaders,
    });

    if (!response.ok) {
      throw new Error(
        `failed to get Terraform token from Vault, status ${response.status}: ${response.statusText}`,
      );
    }

    return response.json();
  }
}
