# ActualBudget Filesystem Abstraction Investigation

## Overview

ActualBudget uses a sophisticated filesystem abstraction layer that allows the same codebase to run in three different modes:
1. **Web/Browser mode**: Frontend-only with SQLite in WASM and filesystem simulated in the browser
2. **Node/API backend mode**: Server-side Node.js with real filesystem access
3. **Electron/Desktop mode**: Desktop app with native filesystem access

## Platform Abstraction Architecture

### File Resolution Strategy (Vite Configuration)

The key to mode-dependent swapping is in the **Vite configuration files** which define file resolution priority:

#### Web/Browser Mode (`vite.config.ts`)
```typescript
resolve: {
  extensions: [
    '.web.js',
    '.web.ts',
    '.web.tsx',
    '.js',
    '.ts',
    '.tsx',
    '.json',
  ]
}
```

#### Desktop/Electron Mode (`vite.desktop.config.ts`)
```typescript
resolve: {
  extensions: [
    '.electron.js',
    '.electron.ts',
    '.electron.tsx',
    '.js',
    '.ts',
    '.tsx',
    '.json',
  ]
}
```

#### API/Node Backend Mode (`vite.api.config.ts`)
```typescript
resolve: {
  extensions: [
    '.api.js',
    '.api.ts',
    '.api.tsx',
    '.electron.js',
    '.electron.ts',
    '.electron.tsx',
    '.js',
    '.ts',
    '.tsx',
    '.json',
  ]
}
```

**How it works:**
- When code imports `src/platform/server/fs`, Vite resolves the import based on the extension priority
- In web mode: `index.web.ts` is selected
- In electron mode: `index.electron.ts` is selected
- In API mode: Falls back to `index.electron.ts` (since both use Node.js)
- The base `index.ts` file only contains TypeScript declarations (the interface)

### Filesystem Implementations

The codebase has three filesystem implementations in `src/platform/server/fs/`:

#### 1. `index.ts` - TypeScript Declarations
**Location:** `src/platform/server/fs/index.ts`

This file defines the interface/contract that all implementations must satisfy:
```typescript
export declare function readFile(filepath: string, encoding?: 'utf8'): Promise<string>;
export declare function writeFile(filepath: string, contents: string | ArrayBuffer): Promise<undefined>;
export declare function exists(filepath: string): Promise<boolean>;
// ... etc
```

#### 2. `index.web.ts` - Browser/Web Implementation
**Location:** `src/platform/server/fs/index.web.ts`

Uses an **in-memory filesystem** with **IndexedDB persistence**:

**Key components:**
- **absurd-sql**: Provides `SQLiteFS` and `IndexedDBBackend` for SQLite in the browser
- **sql.js FS module**: In-memory filesystem from the sql.js WASM module
- **IndexedDB**: Persistent storage for non-SQLite files

**Directory structure:**
```
/uploads/     - In-memory only (for temporary file uploads)
/documents/   - Persisted to IndexedDB
/blocked/     - Special BlockedFS for SQLite files (block-level storage)
/migrations/  - Static files fetched from server
/demo-budget/ - Static files fetched from server
```

**How file operations work:**

- **SQLite files (.sqlite)**:
  - Symlinked to `/blocked/` directory
  - Uses `SQLiteFS` with `IndexedDBBackend` for efficient block-level storage
  - Required because SQLite needs block-level access for performance

  ```typescript
  // From index.web.ts:55-59
  if (filepath.endsWith('.sqlite')) {
    if (!_exists(filepath)) {
      FS.symlink('/blocked/' + pathToId(filepath), filepath);
    }
  }
  ```

- **Regular files in /documents**:
  - Contents stored directly in IndexedDB
  - Placeholder written to in-memory FS for hierarchy

  ```typescript
  // From index.web.ts:86-101
  const { store } = idb.getStore(await idb.getDatabase(), 'files');
  const item = await idb.get(store, filepath);
  return item.contents;
  ```

- **Static files**:
  - Fetched from server on initialization via `populateDefaultFilesystem()`
  - Uses `data-file-index.txt` to know which files to fetch

  ```typescript
  // From index.web.ts:230-252
  const index = await fetch(process.env.PUBLIC_URL + 'data-file-index.txt').text();
  const files = index.split('\n');
  await Promise.all(files.map(async file => {
    const contents = await fetchFile(process.env.PUBLIC_URL + 'data/' + file);
    _writeFile('/' + file, contents);
  }));
  ```

#### 3. `index.electron.ts` - Node.js/Electron Implementation
**Location:** `src/platform/server/fs/index.electron.ts`

Uses **Node.js native `fs` module** for direct filesystem access:

```typescript
import * as fs from 'fs';
import * as path from 'path';

export const readFile = (filepath: string, encoding: 'utf8' | 'binary' | null = 'utf8') => {
  return new Promise((resolve, reject) => {
    fs.readFile(filepath, encoding, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
};
```

**Key features:**
- Direct access to host filesystem via Node.js `fs` module
- Uses `ACTUAL_DATA_DIR` environment variable for data directory location
- Includes retry logic for file locking issues (antivirus, backup software)

## How Files from Host Computer are Read in Web Mode

### The Upload Flow

In **web/browser mode**, files cannot be read directly from the host filesystem due to browser security restrictions. Instead, files are uploaded via the following flow:

#### 1. User Selects File in Browser
The user interacts with a file input element in the React UI (e.g., `ImportTransactionsModal.tsx`).

#### 2. File Content is Read via FileReader API
The browser reads the file content as an `ArrayBuffer` using the FileReader API.

#### 3. Upload to Backend via `upload-file-web`
**Client side** (`desktop-client/src/index.tsx:58-63`):
```typescript
async function uploadFile(filename: string, contents: ArrayBuffer) {
  send('upload-file-web', {
    filename,
    contents,
  });
}
```

#### 4. File Written to /uploads/ Directory
**Server side** (`loot-core/src/server/budgetfiles/app.ts:636-649`):
```typescript
async function uploadFileWeb({
  filename,
  contents,
}: {
  filename: string;
  contents: ArrayBuffer;
}) {
  if (!Platform.isBrowser) {
    return null;
  }

  await fs.writeFile('/uploads/' + filename, contents);
  return {};
}
```

#### 5. Backend Processes File from Virtual Filesystem
The backend code (running in a Web Worker in the browser) can now access the file via the fs abstraction:

**Example** (`loot-core/src/server/transactions/import/parse-file.ts:113`):
```typescript
async function parseCSV(filepath: string, options: ParseFileOptions) {
  let contents = await fs.readFile(filepath);  // Reads from /uploads/filename
  // ... parse contents
}
```

### Complete Example: CSV Import

1. **User clicks "Import transactions" button**
2. **Browser file picker opens** (via HTML5 file input)
3. **User selects a CSV file** from their computer
4. **Frontend reads file content**:
   ```javascript
   const file = event.target.files[0];
   const arrayBuffer = await file.arrayBuffer();
   ```
5. **Frontend sends to backend**:
   ```javascript
   await uploadFile(file.name, arrayBuffer);
   ```
6. **Backend writes to virtual filesystem**:
   ```javascript
   await fs.writeFile('/uploads/myfile.csv', arrayBuffer);
   ```
7. **Backend parses file**:
   ```javascript
   const result = await parseFile('/uploads/myfile.csv', options);
   ```
8. **File is read from in-memory FS** and parsed

### Key Insight: /uploads/ is Ephemeral

The `/uploads/` directory (created at `index.web.ts:275`) is **in-memory only** and **not persisted** to IndexedDB. This means:
- Uploaded files exist only for the duration of the browser session
- Perfect for temporary imports that don't need to be stored
- Reduces storage usage in IndexedDB

## Usage Example: parse-file.ts

The `parse-file.ts` module demonstrates how the abstraction works in practice:

```typescript
// src/server/transactions/import/parse-file.ts:4
import * as fs from '../../../platform/server/fs';

// This import resolves to:
// - index.web.ts in browser mode
// - index.electron.ts in desktop/API mode

export async function parseFile(filepath: string, options: ParseFileOptions) {
  const errors = Array<ParseError>();
  const ext = filepath.match(/\.[^.]*$/)?.[0];

  switch (ext?.toLowerCase()) {
    case '.csv':
    case '.tsv':
      return parseCSV(filepath, options);
    case '.ofx':
    case '.qfx':
      return parseOFX(filepath, options);
    // ...
  }
}

async function parseCSV(filepath: string, options: ParseFileOptions) {
  let contents = await fs.readFile(filepath);  // Works in all modes!
  // ... parse CSV contents
}
```

The same `fs.readFile()` call works across all platforms:
- **Web mode**: Reads from in-memory FS (likely `/uploads/filename`)
- **Electron mode**: Reads from real filesystem at `filepath`
- **API mode**: Reads from real filesystem at `filepath`

## Summary

### Mode-Dependent Swapping Logic
- **Location**: Vite configuration files (`vite.config.ts`, `vite.desktop.config.ts`, `vite.api.config.ts`)
- **Mechanism**: File extension priority in `resolve.extensions` array
- **Strategy**: Vite resolves imports by checking for files with platform-specific extensions first

### Host Filesystem Access in Web Mode
- **Not possible directly** due to browser security
- **Solution**: File upload flow
  1. User selects file via browser file picker
  2. Frontend reads file content as ArrayBuffer
  3. Content sent to backend via `upload-file-web` message
  4. Backend writes to virtual `/uploads/` directory
  5. Backend processes file using standard fs abstraction

### Architecture Benefits
- **Single codebase**: Business logic (like `parse-file.ts`) works identically across all platforms
- **Type safety**: TypeScript declarations in `index.ts` ensure all implementations match
- **Performance**: Each platform uses the most efficient approach (native fs for Node, IndexedDB for browser)
- **Flexibility**: Easy to add new platforms by creating new `index.{platform}.ts` files

### Key Files to Reference
- **Vite configs**: `vite.config.ts:65-74`, `vite.desktop.config.ts:33-43`, `vite.api.config.ts:33-45`
- **Web FS implementation**: `src/platform/server/fs/index.web.ts`
- **Electron FS implementation**: `src/platform/server/fs/index.electron.ts`
- **FS interface**: `src/platform/server/fs/index.ts`
- **File upload handler**: `src/server/budgetfiles/app.ts:636-649`
- **Parse file example**: `src/server/transactions/import/parse-file.ts`
