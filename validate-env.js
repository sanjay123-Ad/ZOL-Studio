import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Handle ESM __dirname
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env.local file not found!');
  process.exit(1);
}

dotenv.config({ path: envPath });

const REQUIRED_KEYS = [
  // Backend Secrets (No VITE_ prefix)
  'LEMONSQUEEZY_API_KEY',
  'LEMONSQUEEZY_STORE_ID',
  'LEMONSQUEEZY_WEBHOOK_SECRET',
  'SUPABASE_SERVICE_ROLE_KEY',
  'SUPABASE_URL',

  // Frontend Config (Must have VITE_ prefix)
  'VITE_LEMONSQUEEZY_BASIC_MONTHLY_VARIANT_ID',
  'VITE_LEMONSQUEEZY_BASIC_ANNUAL_VARIANT_ID',
  'VITE_LEMONSQUEEZY_PRO_MONTHLY_VARIANT_ID',
  'VITE_LEMONSQUEEZY_PRO_ANNUAL_VARIANT_ID',
  'VITE_LEMONSQUEEZY_AGENCY_MONTHLY_VARIANT_ID',
  'VITE_LEMONSQUEEZY_AGENCY_ANNUAL_VARIANT_ID',
];

let hasError = false;

console.log('🔍 Validating .env.local configuration...\n');

REQUIRED_KEYS.forEach((key) => {
  const value = process.env[key];
  if (!value || value.trim() === '') {
    console.error(`❌ Missing or empty: ${key}`);
    hasError = true;
  } else {
    // Basic format checks
    if (key.endsWith('_ID') && !/^\d+$/.test(value)) {
       console.warn(`⚠️  Warning: ${key} should likely be numeric (Variant/Store ID). Found: ${value}`);
    }
    console.log(`✅ ${key} is set`);
  }
});

console.log('\n---------------------------------------------------');
if (hasError) {
  console.error('❌ Validation FAILED. Please fix the missing variables above.');
  process.exit(1);
} else {
  console.log('✅ All required environment variables are present!');
  console.log('   Restart your server to apply changes.');
}
