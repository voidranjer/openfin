# OpenBanker – Finance Data Importer

A local-first browser extension that captures transactions from online banking sessions and exports them to CSV or [ActualBudget](https://actualbudget.org/).

![Preview](docs/images/preview.png)

Self-host your financial data! Nobody else needs access to your banking information.

## 🔗 Supported banks

**🚨 IMPORTANT: The goal is to enable anyone to write their own modules for any bank with basic Javascript and minimal effort.**

> See [this page on making your own bank module](docs/PLUGINS.md).

These are some banks that are officially supported by the maintainers.

- **Royal Bank of Canada (RBC)**: Chequing
- **Scotiabank**: Chequing, Credit Card
- **Wealthsimple**: Chequing
- **Rogers Bank**: Credit Card

## ⭐ Key Features

### Export to CSV

OpenBanker can export to CSV files. Columns are formatted specifically to be a one-click upload to [ActualBudget](https://actualbudget.org/), no field-mapping required.

### Export to [ActualBudget](https://github.com/voidranjer/actual)

Additionally, this [fork of ActualBudget](https://github.com/voidranjer/actual) is customized to communicate directly with OpenBanker.

Using this fork, you can import transactions directly into ActualBudget without downloading and uploading CSV files, which is convenient for high-frequency import workflows.

![Import using URL params](docs/images/url_params.png)

**You can check out the deployed version of this fork, running in "Local Browser Mode" here: [🔗 demo.openbanker.org](https://demo.openbanker.org).**

> If you prefer to self-host [the OpenBanker fork of ActualBudget](https://github.com/voidranjer/actual), you can clone the fork and build it just like you would with ActualBudget. Then, follow [these special build steps](docs/ACTUAL.md) to configure the OpenBanker browser extension to use the URL where your custom ActualBudget fork is running.

![Export to ActualBudget](docs/images/import_from_openbanker.png)

### Natural Language Rules

Write rules in plain English.

- **✅ E-transfers of between $950 and $1015 is "Rent".**

- ❌ `IF name.contains("E-transfer") AND (950 <= amount <= 1015) THEN category = "Rent"`.

![Natural language rules](docs/images/natural_lang_rules.png)

## 📦 Installation

📦 <https://formulae.brew.sh/formula/rsync>

## 🗺️ Roadmap

- CI/CD for automating tagged builds
- Unit testing
- Mock transaction data for Vite dev server mode
- Mock 'chrome' API with localStorage. Using dynamic imports, inject mocks only in dev (don't pollute prod)
- All 'window.postMessage' calls in bridge should verify origin of message before replying
- Actual fork behaviour: import should skip duplicates by default
- Upstream: ImportTransactionModal --> onCheckTransaction (3-state): General "select all" mechanism - perhaps header checkmark handles (Select/Deselect - 2 states). Deselect all, manually select new transactions
- Upstream: ImportTransaction (be) --> import mapping templates (default + editable)
- "Sync" button hardcoded URL: build step to dynamically read this from JSON config?

## ⌨️ Developer

### Bundler configuration

[Notes on Vite/Rollup config here]

### Running in the Vite development server

`background.ts` contains code for a service worker that runs in the background. If your work does not involve this service worker, you can run the frontend only (with HMR) by launching the Vite dev server using `npm run dev`.

Some functionality requiring the `chrome` API that only exists within the context of a Chrome extension environment will not work. `chrome.storage` is an example of this.

Search for feature guards like `getChromeContext() !== 'extension'` across the codebase.

## 👏 Acknowledgements

- [CWZMorro](https://github.com/CWZMorro) for creating the RBC plugin
