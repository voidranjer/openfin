# 🗺️ Roadmap

- CI/CD for automating tagged builds
- Unit testing
- Mock transaction data for Vite dev server mode
- Mock 'chrome' API with localStorage. Using dynamic imports, inject mocks only in dev (don't pollute prod)
- All 'window.postMessage' calls in bridge should verify origin of message before replying
- Actual fork behaviour: import should skip duplicates by default
- Upstream: ImportTransactionModal --> onCheckTransaction (3-state): General "select all" mechanism - perhaps header checkmark handles (Select/Deselect - 2 states). Deselect all, manually select new transactions
- Upstream: ImportTransaction (be) --> import mapping templates (default + editable)
- "Sync" button hardcoded URL: build step to dynamically read this from JSON config?

### Natural Language Rules

Write rules in plain English.

- **✅ E-transfers of between $950 and $1015 is "Rent".**

- ❌ `IF name.contains("E-transfer") AND (950 <= amount <= 1015) THEN category = "Rent"`.

![Natural language rules](images/natural_lang_rules.png)
