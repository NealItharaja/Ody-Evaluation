import { writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createApp, openApiInfo } from '../src/app';

const app = createApp(null as never);
const document = app.getOpenAPIDocument(openApiInfo);

const out = resolve(dirname(fileURLToPath(import.meta.url)), '../openapi.json');
writeFileSync(out, `${JSON.stringify(document, null, 2)}\n`);
console.log('Wrote', out);
