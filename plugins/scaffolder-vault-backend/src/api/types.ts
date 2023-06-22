/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

export interface VaultApi {
  authenticate(path: string, payload: string): Promise<string>;
  getTerraformToken(token: string, mount: string, role: string): Promise<TerraformSecretResponse>;
}

export interface AuthResponse {
  auth: {
    renewable: boolean;
    lease_duration: number;
    metadata: Map<string,string>;
    policies: string[];
    accessor: string;
    client_token: string;
  };
}

export interface TerraformSecretResponse {
  request_id: string;
  lease_id: string;
  lease_duration: number;
  renewable: true;
  data: {
    token: string;
    token_id: string;
  };
}