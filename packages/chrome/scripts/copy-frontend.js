import { cpSync } from 'node:fs';
import { resolve } from 'node:path';

const source = resolve('../frontend/dist');
const destination = resolve('./dist');

try {
  cpSync(source, destination, { recursive: true });
  console.log('Successfully copied ../frontend/dist to ./dist');
} catch (err) {
  console.error(`Error copying directory: ${err}`);
}
