/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { terraformPlugin } from './plugin';

describe('terraform', () => {
  it('should export plugin', () => {
    expect(terraformPlugin).toBeDefined();
  });
});
