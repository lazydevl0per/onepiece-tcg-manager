#!/usr/bin/env node

/**
 * Simple environment check script
 */

console.log('🔍 Environment Check')
console.log('==================')

console.log('Environment Variables:')
console.log('- NODE_ENV:', process.env.NODE_ENV)
console.log('- PORTABLE_EXECUTABLE_DIR:', process.env.PORTABLE_EXECUTABLE_DIR)
console.log('- ELECTRON_RENDERER_URL:', process.env.ELECTRON_RENDERER_URL)

console.log('\nCurrent Directory:', process.cwd())
console.log('Script Path:', import.meta.url)

console.log('\n💡 Expected Behavior:')
console.log('- In development: Auto-updater should be disabled')
console.log('- In production: Auto-updater should work if packaged')
console.log('- Squirrel error: Expected in development/unpackaged builds') 