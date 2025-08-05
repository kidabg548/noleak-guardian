import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_FILE = path.join(os.homedir(), '.michu-config.json');

const DEFAULT_CONFIG = {
  // Secret file patterns
  secretPatterns: [
    '**/.env*',
    '**/.envrc',
    '**/.secrets*',
    '**/secrets.*',
    '**/config.*',
    '**/*.pem',
    '**/*.key',
    '**/*.p12',
    '**/*.pfx',
    '**/id_rsa',
    '**/.aws/credentials',
    '**/.dockerignore',
    '**/.gitignore'
  ],
  
  // Safe file patterns (these are ignored)
  safePatterns: [
    '**/.env.example',
    '**/.env.template',
    '**/.env.sample',
    '**/.env.local.example',
    '**/config.example.*',
    '**/secrets.example.*'
  ],
  
  // Content patterns to check for
  contentPatterns: [
    'password\\s*=',
    'secret\\s*=',
    'key\\s*=',
    'token\\s*=',
    'api_key\\s*=',
    'private_key\\s*=',
    'aws_access_key_id\\s*=',
    'aws_secret_access_key\\s*=',
    'database_url\\s*=',
    'connection_string\\s*='
  ],
  
  // Behavior settings
  settings: {
    checkContent: true,
    strictMode: false,
    verbose: false,
    ignoreComments: true
  }
};

export function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const userConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
      return { ...DEFAULT_CONFIG, ...userConfig };
    }
  } catch (e) {
    console.warn('⚠️  Invalid config file, using defaults');
  }
  
  return DEFAULT_CONFIG;
}

export function saveConfig(config) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    return true;
  } catch (e) {
    console.error('❌ Failed to save config:', e.message);
    return false;
  }
}

export function createDefaultConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    saveConfig(DEFAULT_CONFIG);
    console.log('✅ Created default config file at:', CONFIG_FILE);
  }
  return loadConfig();
}

export function getConfigPath() {
  return CONFIG_FILE;
} 