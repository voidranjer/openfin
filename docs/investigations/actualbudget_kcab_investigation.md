# Investigation: How the `kcab` Backend Works

## Starting Point: The Mystery Variable

In `src/browser-server.js:84`, there's a call to `backend.initApp()`:

```javascript
backend.initApp(isDev, self).catch(err => {
```

But `backend` isn't imported or defined anywhere in this file. The only clue is a linter comment at the top:

```javascript
/* globals importScripts, backend */
```

This comment tells us that `backend` is expected to be a **global variable**, not a module import.

## Step 1: Following the Dynamic Import

Looking at `src/browser-server.js:79-82`, I found where this global comes from:

```javascript
await importScriptsWithRetry(
  `${msg.publicUrl}/kcab/kcab.worker.${hash}.js`,
  { maxRetries: isDev ? 5 : 0 },
);
```

The `importScripts()` function (a Web Worker API) loads external JavaScript files into the global scope. After this import completes, the `backend` global variable becomes available.

**Key insight**: "kcab" is "back" spelled backwards, suggesting this is the backend code.

## Step 2: Finding the Build Script

Following the user's suggestion, I examined `../loot-core/bin/build-browser` to understand how this `kcab.worker.js` file is created.

### From `packages/loot-core/bin/build-browser`:

```bash
# Line 18: Clean out previous build files
rm -rf ../../desktop-client/public/kcab

# Line 34: Run vite to build the backend
yarn vite build --config ../vite.config.ts --mode $NODE_ENV $VITE_ARGS

# Lines 36-40: In production, copy the built files
if [ $NODE_ENV == 'production' ]; then
  mkdir ../../desktop-client/public/kcab
  cp -r ../lib-dist/browser/* ../../desktop-client/public/kcab
fi

# Lines 20-29: In development, symlink instead of copy
if [ $NODE_ENV == 'development' ]; then
  VITE_ARGS="$VITE_ARGS --watch"
  ln -snf "$ROOT"/../lib-dist/browser ../../desktop-client/public/kcab
fi
```

**What this tells us**:
1. Vite is used to build the backend code
2. Build output goes to `packages/loot-core/lib-dist/browser/`
3. The output is copied (production) or symlinked (dev) to `packages/desktop-client/public/kcab/`
4. In dev mode, Vite runs in watch mode for live reloading

## Step 3: Reading the Vite Config

Now I needed to find what Vite is building. I examined `packages/loot-core/vite.config.ts`.

### Entry Point Discovery

**Line 24 of vite.config.ts**:
```javascript
entry: path.resolve(__dirname, 'src/server/main.ts'),
```

This is how I knew `src/server/main.ts` is the entry point - it's explicitly declared in the Vite library build configuration.

### Output Configuration

**Lines 25-28**:
```javascript
name: 'backend',
formats: ['iife'],
fileName: () =>
  isDev ? 'kcab.worker.dev.js' : `kcab.worker.[hash].js`,
```

- `name: 'backend'` - **This creates the global `backend` variable**
- `formats: ['iife']` - Immediately Invoked Function Expression format
- The filename matches what we saw in `browser-server.js`

### How IIFE Creates the Global

**Lines 43-48**:
```javascript
output: {
  chunkFileNames: isDev
    ? '[name].kcab.worker.dev.js'
    : '[id].[name].kcab.worker.[hash].js',
  format: 'iife',
  name: 'backend',
  globals: {
    buffer: 'Buffer',
    'process/browser': 'process',
  },
},
```

When Vite/Rollup creates an IIFE with `name: 'backend'`, it generates code like:

```javascript
var backend = (function() {
  // ... all the compiled code ...
  return { initApp, init, lib, handlers };
})();
```

This assigns the module's exports to `self.backend` in the Web Worker's global scope.

### Base URL

**Line 18**:
```javascript
base: '/kcab/',
```

This sets the base URL for assets, explaining why the path is `/kcab/kcab.worker.js`.

## Step 4: Understanding the Source

I examined `packages/loot-core/src/server/main.ts` to see what actually gets exposed as `backend`.

### Key Exports

**Line 188 - The `initApp` function**:
```typescript
export async function initApp(isDev, socketName) {
  await sqlite.init();
  await Promise.all([asyncStorage.init(), fs.init()]);
  await setupDocumentsDir();
  // ... initialization code ...
  connection.init(socketName, app.handlers);
}
```

This is the function called from `browser-server.js:84`.

**Lines 281-296 - The `lib` object**:
```typescript
export const lib = {
  getDataDir: fs.getDataDir,
  sendMessage: (msg, args) => connection.send(msg, args),
  send: async (name, args) => { /* ... */ },
  on: (name, func) => app.events.on(name, func),
  q,
  db,
  amountToInteger,
  integerToAmount,
};
```

**Line 51 - The `handlers` object**:
```typescript
export let handlers = {} as unknown as Handlers;
```

This object is populated throughout the file with various API handlers like `'undo'`, `'redo'`, `'query'`, etc.

### What Gets Exported

When Vite builds this module as an IIFE, all the `export` statements become properties of the `backend` global object:

```javascript
self.backend = {
  initApp: function(...) { ... },
  init: function(...) { ... },
  lib: { ... },
  handlers: { ... }
}
```

## The Complete Flow

1. **Frontend starts** (`src/browser-server.js`)
2. **Receives init message** with `publicUrl` and `hash`
3. **Dynamically loads** `/kcab/kcab.worker.[hash].js` via `importScripts()`
4. **The IIFE executes** and creates `self.backend` global
5. **Frontend calls** `backend.initApp(isDev, self)`
6. **Backend initializes**: SQLite, file system, connection handler, etc.
7. **Communication established** between frontend and backend via message passing

## Why "kcab"?

"kcab" is "back" spelled backwards - a playful way to name the backend. The pattern continues:
- `/kcab/kcab.worker.js` = "back/back.worker.js" reversed
- The entire backend runs in a Web Worker to avoid blocking the UI thread

## Build Artifacts Location

| Environment | Source | Build Output | Served From |
|------------|--------|--------------|-------------|
| All | `packages/loot-core/src/server/main.ts` | `packages/loot-core/lib-dist/browser/` | `packages/desktop-client/public/kcab/` |
| Development | (same) | (same) | Symlinked + watch mode |
| Production | (same) | (same) | Copied with hash |

## Key Technologies

- **Vite**: Modern build tool, configured to create an IIFE library
- **Web Workers**: The backend runs in a separate thread
- **IIFE**: Creates a global variable without polluting the namespace
- **Dynamic imports**: `importScripts()` loads the backend at runtime

