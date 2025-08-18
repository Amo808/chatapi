#!/usr/bin/env tsx
import { writeFileSync } from 'fs';
import { join } from 'path';

// Simple prebuild script - just create necessary files
console.log('🔧 Running prebuild script...');

// Create version info
const versionInfo = {
  version: process.env.npm_package_version || '1.0.0',
  buildTime: new Date().toISOString(),
  nodeVersion: process.version,
};

writeFileSync(
  join(process.cwd(), 'public', 'version.json'),
  JSON.stringify(versionInfo, null, 2)
);

console.log('✅ Prebuild complete!');
