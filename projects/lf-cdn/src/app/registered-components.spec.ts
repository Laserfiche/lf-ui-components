// Copyright (c) Laserfiche.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { ApplicationRef, provideZonelessChangeDetection, reflectComponentType } from '@angular/core';
import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { registeredComponents } from './registered-components';

// Raw library templates, inlined by Vite so the invariant can be checked in the browser.
const libraryTemplates = import.meta.glob('/projects/ui-components/**/*.component.html', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/**
 * Tags a host creates itself and that no library component ever instantiates. Their Angular
 * selector is allowed to equal their custom element tag because nothing upgrades a second
 * instance into the same host. Every other registered component declares an `lfint-` selector
 * first so Angular builds `<lfint-*>` host elements instead.
 */
const HOST_CREATED_ONLY_TAGS = [
  'lf-checklist',
  'lf-field-container',
  'lf-login',
  'lf-repository-browser',
  'lf-tags',
  'lf-toolbar',
  'lf-user-feedback',
];

/** The element name Angular gives a host it builds for this component. */
function angularHostTag(component: RegisteredComponentType): string | undefined {
  return reflectComponentType(component)?.selector.split(',')[0].trim();
}

type RegisteredComponentType = (typeof registeredComponents)[number]['component'];

/**
 * A component Angular instantiates gets a host element named after its first selector. When that
 * name is also a registered custom element tag, the browser upgrades the same host and a second
 * instance renders into it. Keeping registered tags out of anything Angular instantiates is the
 * invariant that makes the duplicate structurally impossible.
 */
describe('registered custom element tags', () => {
  const registeredTags = registeredComponents.map((c) => c.tag);

  it('are all distinct', () => {
    expect(new Set(registeredTags).size).toBe(registeredTags.length);
  });

  it('never appear as an element in a library template', () => {
    const violations: string[] = [];

    for (const tag of registeredTags) {
      const usage = new RegExp(`<${tag}(?![a-zA-Z0-9-])`);
      for (const [file, source] of Object.entries(libraryTemplates)) {
        if (usage.test(source)) {
          violations.push(`<${tag}> in ${file.replace('/projects/ui-components/', '')}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it('double as an Angular host tag only for components no library code instantiates', () => {
    // Locked to an exact set: adding a registration whose Angular host tag is also its custom
    // element tag is the shape of the defect, so it has to be a deliberate edit here too.
    const alsoAngularHostTags = registeredComponents
      .filter((c) => angularHostTag(c.component) === c.tag)
      .map((c) => c.tag)
      .sort();

    expect(alsoAngularHostTags).toEqual(HOST_CREATED_ONLY_TAGS);
  });

  it('keep the public selector available to Angular consumers', () => {
    const missing = registeredComponents
      .filter((c) => !reflectComponentType(c.component)?.isStandalone === false)
      .filter((c) => {
        const selectors = reflectComponentType(c.component)?.selector.split(',') ?? [];
        return !selectors.some((s) => s.trim() === c.tag);
      })
      .map((c) => `${c.component.name} no longer matches <${c.tag}> in an Angular template`);

    expect(missing).toEqual([]);
  });
});

/**
 * The runtime half of the same invariant: create the public composite components the way a
 * framework-agnostic host does and assert each inner view rendered once.
 */
describe('one rendered view per host tag', () => {
  let appRef: ApplicationRef;
  let container: HTMLElement;

  beforeAll(async () => {
    appRef = await createApplication({
      providers: [provideAnimations(), provideZonelessChangeDetection()],
    });

    // customElements.define is per realm and cannot be undone, so register the whole set once.
    for (const c of registeredComponents) {
      if (!customElements.get(c.tag)) {
        customElements.define(c.tag, createCustomElement(c.component, { injector: appRef.injector }));
      }
    }
  });

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  /** Appends the tag the way a host does and lets the element upgrade and render. */
  async function render(tag: string): Promise<HTMLElement> {
    const element = document.createElement(tag);
    container.appendChild(element);
    await new Promise((resolve) => setTimeout(resolve, 250));
    return element as HTMLElement;
  }

  // The duplicate renders whether or not the host ever calls initAsync, so these need no service.
  it.each([
    { tag: 'lf-field-container', view: '.lf-template-picker', name: 'template picker' },
    { tag: 'lf-field-container', view: '.adhoc-container', name: 'adhoc container' },
    { tag: 'lf-repository-browser', view: '.lf-breadcrumbs-container', name: 'breadcrumbs' },
  ])('renders exactly one $name inside $tag', async ({ tag, view }) => {
    const element = await render(tag);

    expect(element.querySelectorAll(view).length).toBe(1);
  });
});
