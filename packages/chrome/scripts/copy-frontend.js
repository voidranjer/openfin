import { cpSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Get the build target from the command line argument (e.g., "node copy-frontend.js firefox")
 * If no argument is provided, default to 'chrome'.
 */
const target = process.argv[2] || 'chrome';

const source = resolve('../frontend/dist');
const destination = resolve(`./dist/${target}`);

try {
  cpSync(source, destination, { recursive: true });
  console.log('Successfully copied ../frontend/dist to ./dist');
} catch (err) {
  console.error(`Error copying directory: ${err}`);
}
