#!/bin/bash

set -e

export VAULT_ADDR="http://127.0.0.1:8200"
export VAULT_TOKEN="some-root-token"


## Enable GitHub Auth Method
vault auth enable github
vault write auth/github/config organization=${VAULT_GITHUB_ORG} organization_id=${VAULT_GITHUB_ORG_ID}
vault policy write backstage vault/policy.hcl
vault write auth/github/map/users/${VAULT_GITHUB_USER} value=backstage

## Enable Terraform Cloud secrets engine
vault secrets enable terraform
vault write terraform/config token=${TERRAFORM_CLOUD_ORGANIZATION_TOKEN}
vault write terraform/role/backstage team_id=${TERRAFORM_CLOUD_TEAM_ID}
vault read terraform/creds/backstage