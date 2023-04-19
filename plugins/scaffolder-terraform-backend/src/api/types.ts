/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

export interface TerraformApi {
  getProject(organization: string, project: string): Promise<Project>;
  createProject(
    organization: string,
    project: ProjectRequest,
  ): Promise<Project>;
  getOAuthClients(
    organization: string,
    serviceProvider: string,
  ): Promise<OAuthClient>;
  getOAuthToken(clientID: string): Promise<OAuthToken>;
  createWorkspace(
    organization: string,
    workspace: WorkspaceRequest,
  ): Promise<Workspace>;
  createRun(workspaceID: string, message: string): Promise<Run>;
}

export interface Run {
  data: {
    id: string;
  };
}

export interface RunRequest {
  data: {
    attributes: {
      message: string;
    };
    type: string;
    relationships: {
      workspace: {
        data: {
          type: string;
          id: string;
        };
      };
    };
  };
}

export interface OAuthClient {
  id: string;
  attributes: {
    'service-provider'?: string;
    'http-url'?: string;
  };
}

export interface OAuthToken {
  id: string;
  attributes: {
    'service-provider-user'?: string;
  };
}

export interface Project {
  id: string;
}

export interface ProjectRequest {
  data: {
    type: 'projects';
    attributes: {
      name: string;
    };
  };
}

export interface Workspace {
  data: {
    id: string;
  };
  links: {
    'self-html': string;
  };
}

export interface VCS {
  branch?: string;
  identifier?: string;
  'ingress-submodules'?: boolean;
  'oauth-token-id'?: string;
  'tags-regex'?: string;
}

export interface WorkspaceRequest {
  data: {
    type: string;
    attributes: {
      name: string;
      'agent-pool-id'?: string;
      'allow-destroy-plan'?: boolean;
      'assessments-enabled'?: boolean;
      'auto-apply'?: boolean;
      description?: string;
      'execution-mode'?: string;
      'file-triggers-enabled'?: boolean;
      'global-remote-state'?: boolean;
      'queue-all-runs'?: boolean;
      'source-name'?: string;
      'source-url'?: string;
      'speculative-enabled'?: boolean;
      'terraform-version'?: string;
      'trigger-patterns'?: string[];
      'trigger-prefixes'?: string[];
      'vcs-repo'?: VCS;
      'working-directory'?: string;
    };
    relationships?: {
      project: {
        data: {
          type: string;
          id: string;
        };
      };
    };
  };
}

export interface VariableRequest {
  data: {
    readonly type: 'vars';
    attributes: {
      key: string;
      value: string;
      description: string;
      category: string;
      hcl?: boolean;
      sensitive?: boolean;
    };
  };
}

export interface Variable {
  data: {
    id: string;
  };
}
