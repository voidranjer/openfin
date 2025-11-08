# OpenFin – Finance Data Importer

A local-first browser extension that captures transactions from online banking sessions and categorize them based on user defined rules using an LLM.

![Preview](docs/preview.png)

Self-host your financial data! Nobody else needs access to your banking information to anybody else.

## 🔗 Supported banks

[List of supported financial institutions here]

## ⭐ Key Features

### Export

Currently, OpenFin only exports to CSV (*which can be imported into budgeting apps like [ActualBudget](https://actualbudget.org/) or [Firefly III](https://www.firefly-iii.org/)*). In the future, OpenFin will either have [ActualBudget](https://actualbudget.org/) baked-in (frontend-based), or have auto-importers into other open-source budgeting apps.

### Natural Language Rules

Write rules in plain English.

 - **✅ E-transfers of between $950 and $1015 is "Rent".**

- ❌ `IF name.contains("E-transfer") AND (950 <= amount <= 1015) THEN category = "Rent"`.

![Natural language rules](docs/natural_lang_rules.png)

## 🗺️ Roadmap

- Contributors
- API key (and/or URL) settings in UI
- gemini SDK to fetch REST API. dropdown for popular providers, and a "Custom" with user provided URL + token.
- dropdown by default includes (Free Demo, before Dec deadline)
- Add a "?" for what's being included/sent.
- Backend: Rate limiting, prompt and response size limiting, etc. Security.
- CI/CD for automating tagged builds
- Unit testing
- Mock transaction data for Vite dev server mode
- Mock 'chrome' API with localStorage. Using dynamic imports, inject mocks only in dev (don't pollute prod)
- MkDocs documentation site (or just docs on gh)
- Financial Institution support request form.

## ⌨️ Developer

### Bundler configuration

[Notes on Vite/Rollup config here]

### Running in the Vite development server

`background.ts` contains code for a service worker that runs in the background. If your work does not involve this service worker, you can run the frontend only (with HMR) by launching the Vite dev server using `npm run dev`.

Some functionality requiring the `chrome` API that only exists within the context of a Chrome extension environment will not work. `chrome.storage` is an example of this.

Search for feature guards like `getChromeContext() !== 'extension'` across the codebase.

## 👏 Acknowledgements

- [CWZMorro](https://github.com/CWZMorro) for creating the RBC plugin

- [AdityaSriramTeja](https://github.com/AdityaSriramTeja) for the valuable feedback on MVP
