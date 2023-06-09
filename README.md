# [Backstage](https://backstage.io)

This is an example Backstage app that includes two Terraform plugins:

1. Scaffolder Action - creates Terraform Cloud/Enterprise resources using scaffolder
1. Terraform frontend plugin - retrieves information for an entity based on an organization and workspace

## Prerequisites

Install [Backstage prerequisites](https://backstage.io/docs/getting-started/#prerequisites).

## Install

In your terminal, set the Terraform Cloud token and GitHub token

```sh
export GITHUB_TOKEN=""
export TF_TOKEN=""
```

To start the app, run:

```sh
yarn install

yarn dev
```

## Using the Scaffolder Action

This repository includes an example template for the Scaffolder to use
under `examples/terraform`.

Review `template.yaml` for the series of custom actions specific
to Terraform. You can...

- Create projects
- Create workspaces
- Create runs

However, you will encounter a few caveats:

- Scaffolder is *not* intended to be idempotent. If you have an
  existing project, you must remove the "Create Project" step
  from the template.

- Variables must be passed through scaffolder. Secrets should
  not be passed directly through scaffolder, consider setting them
  separately using variable sets or using dynamic credentials
  from Vault.

- Workspaces use VCS connections. This ensures that you can
  manage your infrastructure on Day 2.
  - If you do not specific a `vcsAuthUser`, the VCS connection will
    default to the first OAuth client returned by the Terraform API.
  - If you specify a `vcsAuthUser`, the action will return
    the first VCS OAuth token associated with that user. **Note that
    `vcsAuthUser` must have sufficient permissions to access
    the `vcsRepo` you are connecting.**