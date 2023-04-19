# [Backstage](https://backstage.io)

This is an example Backstage app that includes two Terraform plugins:

1. Scaffolder Action - creates Terraform Cloud/Enterprise resources using scaffolder
1. Terraform frontend plugin - retrieves information for an entity based on an organization and workspace

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
