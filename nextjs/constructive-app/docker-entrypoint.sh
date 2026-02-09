#!/bin/sh
set -e

# Runtime configuration file path (relative to WORKDIR /app/apps/admin)
CONFIG_FILE="/app/apps/admin/public/__runtime-config.js"

# Log which configuration is being applied
echo "[runtime-config] Generating runtime configuration..."

# Use Node.js for proper JSON encoding to avoid shell escaping vulnerabilities
# This prevents XSS and injection attacks from malformed environment variables
node -e "
const fs = require('fs');

// All supported runtime configuration keys
const RUNTIME_CONFIG_KEYS = [
  // GraphQL Endpoints
  // Note: Dashboard/CRM endpoint is not configured here - it's determined dynamically
  // by the selected database API or Direct Connect configuration
  'NEXT_PUBLIC_SCHEMA_BUILDER_GRAPHQL_ENDPOINT',
  'NEXT_PUBLIC_APP_PUBLIC_GRAPHQL_ENDPOINT',
  'NEXT_PUBLIC_AUTH_GRAPHQL_ENDPOINT',
  'NEXT_PUBLIC_ADMIN_GRAPHQL_ENDPOINT',

  // Database Setup - Core
  'NEXT_PUBLIC_DATABASE_SETUP_BASE_DOMAIN',
  'NEXT_PUBLIC_DATABASE_SETUP_DBNAME',
  'NEXT_PUBLIC_DATABASE_SETUP_ROLE_NAME',
  'NEXT_PUBLIC_DATABASE_SETUP_ANON_ROLE',
  'NEXT_PUBLIC_DATABASE_SETUP_IS_PUBLIC',

  // Database Setup - Site
  'NEXT_PUBLIC_DATABASE_SETUP_SITE_DESCRIPTION',
  'NEXT_PUBLIC_DATABASE_SETUP_SITE_LOGO_URL',
  'NEXT_PUBLIC_DATABASE_SETUP_SITE_LOGO_MIME',
  'NEXT_PUBLIC_DATABASE_SETUP_APPLE_TOUCH_ICON_URL',
  'NEXT_PUBLIC_DATABASE_SETUP_APPLE_TOUCH_ICON_MIME',
  'NEXT_PUBLIC_DATABASE_SETUP_SITE_OG_IMAGE_URL',
  'NEXT_PUBLIC_DATABASE_SETUP_SITE_OG_IMAGE_MIME',
  'NEXT_PUBLIC_DATABASE_SETUP_FAVICON_URL',

  // Database Setup - App
  'NEXT_PUBLIC_DATABASE_SETUP_APP_IMAGE_URL',
  'NEXT_PUBLIC_DATABASE_SETUP_APP_IMAGE_MIME',
  'NEXT_PUBLIC_DATABASE_SETUP_APP_STORE_LINK',
  'NEXT_PUBLIC_DATABASE_SETUP_PLAY_STORE_LINK',
  'NEXT_PUBLIC_DATABASE_SETUP_APP_STORE_ID',
  'NEXT_PUBLIC_DATABASE_SETUP_APP_ID_PREFIX',

  // Database Setup - Module
  'NEXT_PUBLIC_DATABASE_SETUP_SITE_MODULE_PREFIX',
];

// Collect all set environment variables
const config = {};
const appliedVars = [];

for (const key of RUNTIME_CONFIG_KEYS) {
  const value = process.env[key];
  if (value !== undefined && value !== '') {
    // Validate: reject values with newlines or null bytes (potential injection)
    if (value.includes('\\n') || value.includes('\\r') || value.includes('\\0')) {
      console.error('[runtime-config] WARNING: Skipping ' + key + ' - contains invalid characters');
      continue;
    }
    // Validate: reject extremely long values (DoS protection)
    if (value.length > 2048) {
      console.error('[runtime-config] WARNING: Skipping ' + key + ' - value too long (max 2048 chars)');
      continue;
    }
    config[key] = value;
    appliedVars.push(key);
  }
}

// Generate the JavaScript file with proper JSON encoding
const jsContent = \`// Runtime Configuration - Generated at container startup
// Priority: UI Override > Docker Runtime > Build-time Default
// Generated: \${new Date().toISOString()}
(function() {
  window.__RUNTIME_CONFIG__ = \${JSON.stringify(config, null, 2)};
})();
\`;

fs.writeFileSync('${CONFIG_FILE}', jsContent);

// Log applied configuration (without values for security)
if (appliedVars.length > 0) {
  console.log('[runtime-config] Applied environment variables:');
  appliedVars.forEach(v => console.log('  - ' + v));
} else {
  console.log('[runtime-config] No runtime environment variables set, using build-time defaults');
}
console.log('[runtime-config] Generated ${CONFIG_FILE}');
"

# Execute the main command (node server.js)
exec "$@"
