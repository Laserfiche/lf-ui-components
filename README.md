# lf-ui-components

A collection of UI Components to be used to interact with Laserfiche.

It is a library for reusable laserfiche ui web components, as well as its documentation.
The default project is `lf-documentation`.

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
