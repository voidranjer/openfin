## `desktop-client`

- ImportTransactionsModal.tsx: Opened right before import. Selected accountId is a dependency (must be done before opening the modal)

- accountsSlice.ts: Redux logic for importing transactions from the UI

- desktop-client/src/browser-server.js: Bootstrap for Web Worker.

await importScriptsWithRetry(                   
  `${msg.publicUrl}/kcab/kcab.worker.${hash}.js`
  { maxRetries: isDev ? 5 : 0 },                
);


- desktop-client/src/browser-preload.browser.js: Injects globals


1. accounts/Account.tsx (onImport --> window.Actual.openFileDialog AND dispatch(pushModal))

2. browser-preload.browser.js (window.__actionsForMenu --> uploadFile)

  `window.__actionsForMenu.uploadFile(filename, ev.target.result)`

3. src/index.tsx 


## `loot-core`

- loot-core/src/platform/client/fetch/index.browser.ts (Line 156)

Implementation of `send`. Suspect additional implementations.

- loot-core/vite.api.config.ts

On line 27: entryFileNames: 'bundle.api.js'. This is an injected file that the api crate uses to inject 'send' implementation in 'injectors' to avoid circular dependency problem.

- loot-core/src/server/transactions/import/parse-file.ts --> parseCSV

- loot-core/src/platform/server/fs/index.web.ts --> writeFile


## Upstream improvements

1. import_id support for import modal in the UI

2. column-wise checkbox operator in import modal

3. documentation on architecture
