# Copyright (c) HashiCorp, Inc.
# SPDX-License-Identifier: MPL-2.0


variable "second_hello" {
  type = string
  description = "Second entity to greet"
}

variable "secret_key" {
  type = string
  description = "A secret key to pass to some_key"
  sensitive = true
}

module "infrastructure" {
  source  = "joatmon08/hello/random"
  version = "6.0.0"

  hellos = {
    hello = "${{ values.name }}"
    second_hello = var.second_hello
  }

  some_key = var.secret_key
}