// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { routes } from './app.config';
import { RouterLinks } from './router-links';

describe('documentation routes', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });

  it('should redirect the framework-agnostic guide URL used before 21.2.0 to its current route', async () => {
    const router = TestBed.inject(Router);

    await router.navigateByUrl('/using-ui-components-from-cdn-in-html5');

    expect(router.url).toBe(`/${RouterLinks.EXAMPLE_USAGE_HTML}`);
  });
});
