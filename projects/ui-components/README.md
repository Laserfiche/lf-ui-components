# @laserfiche/lf-ui-components

A collection of UI Components to be used to interact with Laserfiche.

It is a library for reusable laserfiche ui web components, as well as its documentation.
The default project is `lf-documentation`.

# [Documentation](https://unpkg.com/@laserfiche/lf-ui-components@12.0/cdn/index.html#/)

# [Getting Started](https://unpkg.com/@laserfiche/lf-ui-components@12.0/cdn/index.html#/getting-started)

## Setting UI Components Language

- The default language of the UI Components is the browser language.
- To explicitly set the language of the UI Components post a message as follows:

```typescript
const langObj = {
    'lf-localization-service-set-language': language
}
window.postMessage(JSON.stringify(langObj), window.origin);
```

- [Supported Languages](https://www.jsdelivr.com/package/npm/@laserfiche/lf-resource-library?path=resources%2Flaserfiche-base)

# Contribution

We welcome contributions and feedback. Please follow our [contributing guidelines](https://github.com/Laserfiche/lf-ui-components/blob/12.x/CONTRIBUTING.md).

# Development prerequisite

See .github/workflows/main.yml for Node and NPM version used.
