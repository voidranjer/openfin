# OpenFin Browser Extension

A browser extension that capture transactions from online banking sessions and categorize them based on user defined rules using an LLM.

![Preview](docs/preview.png)

## Key Features

### Export

Currently, OpenFin only exports to CSV (*which can be imported into budgeting apps like [ActualBudget](https://actualbudget.org/) or [Firefly III](https://www.firefly-iii.org/)*). In the future, OpenFin will either have [ActualBudget](https://actualbudget.org/) baked-in (frontend-based), or have auto-importers into other open-source budgeting apps.

### Natural Language Rules

Write rules in plain English.

 - **✅ E-transfers of between $950 and $1015 is "Rent".**

- ❌ `IF name.contains("E-transfer") AND (950 <= amount <= 1015) THEN category = "Rent"`.

![Natural language rules](docs/natural_lang_rules.png)

## Roadmap

- Mock 'chrome' API for `npm run dev` Vite dev server mode. Controlled with env var, injects mocks only in dev (don't pollute prod)
- API key (and/or URL) settings in UI
- gemini SDK to fetch REST API. dropdown for popular providers, and a "Custom" with user provided URL + token.
- MkDocs documentation site
- CI/CD for automating tagged builds
