#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// To get __dirname in ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const GIT_TEMPLATE_DIR = path.join(os.homedir(), '.git-templates');
const HOOKS_DIR = path.join(GIT_TEMPLATE_DIR, 'hooks');
const DEST_HOOK = path.join(HOOKS_DIR, 'pre-push');

function checkGitInstallation() {
  try {
    execSync('git --version', { stdio: 'ignore' });
  } catch (e) {
    console.error(chalk.red('❌ Git is not installed or not found in PATH.'));
    console.error(chalk.yellow('Please install Git first: https://git-scm.com/downloads'));
    process.exit(1);
  }
}

function createDynamicPrePushHook() {
  // Create a simple shell script that will find and run checkSecrets.js
  const hookContent = `#!/bin/sh

# Dynamic pre-push hook for michu - works on any machine
# Try multiple possible locations for the checkSecrets.js file

# Debug mode support
if [ "$DEBUG" = "true" ]; then
  echo "🔍 Running in debug mode"
fi

# Get the directory where this hook is located
HOOK_DIR="$(dirname "$0")"

if [ "$DEBUG" = "true" ]; then
  echo "HOOK_DIR=$HOOK_DIR"
fi

# Try relative to the git template directory first
CHECKSCRIPT="$HOOK_DIR/lib/checkSecrets.js"

# If not found, try to find it using npm root (more reliable)
if [ ! -f "$CHECKSCRIPT" ]; then
  NPM_ROOT=$(npm root -g 2>/dev/null)
  if [ -n "$NPM_ROOT" ]; then
    CHECKSCRIPT="$NPM_ROOT/michu/lib/checkSecrets.js"
  fi
fi

# If still not found, try global npm location
if [ ! -f "$CHECKSCRIPT" ]; then
  NPM_GLOBAL_DIR=$(npm config get prefix 2>/dev/null)
  if [ -n "$NPM_GLOBAL_DIR" ]; then
    CHECKSCRIPT="$NPM_GLOBAL_DIR/lib/node_modules/michu/lib/checkSecrets.js"
  fi
fi

# If still not found, try local node_modules
if [ ! -f "$CHECKSCRIPT" ]; then
  CHECKSCRIPT="$(pwd)/node_modules/michu/lib/checkSecrets.js"
fi

if [ "$DEBUG" = "true" ]; then
  echo "CHECKSCRIPT=$CHECKSCRIPT"
fi

# Check if the script exists
if [ ! -f "$CHECKSCRIPT" ]; then
  echo "❌ Error: Could not find checkSecrets.js script"
  echo "Tried paths:"
  echo "  - $HOOK_DIR/lib/checkSecrets.js"
  echo "  - $NPM_ROOT/michu/lib/checkSecrets.js"
  echo "  - $NPM_GLOBAL_DIR/lib/node_modules/michu/lib/checkSecrets.js"
  echo "  - $(pwd)/node_modules/michu/lib/checkSecrets.js"
  echo ""
  echo "💡 Try running: DEBUG=true git push to see debug information"
  exit 1
fi

# Run the script
node "$CHECKSCRIPT"
`;

  return hookContent;
}

function handleExistingHook() {
  if (fs.existsSync(DEST_HOOK)) {
    const backupPath = `${DEST_HOOK}.bak.${Date.now()}`;
    try {
      fs.copyFileSync(DEST_HOOK, backupPath);
      console.log(chalk.yellow(`⚠️  Existing pre-push hook found. Backed up to ${path.basename(backupPath)}`));
    } catch (e) {
      console.log(chalk.yellow('⚠️  Existing pre-push hook found. Overwriting.'));
    }
  }
}

function installGlobalHook() {
  // Check if Git is installed
  checkGitInstallation();
  
  // Create hooks directory
  fs.mkdirSync(HOOKS_DIR, { recursive: true });
  
  // Handle existing hook
  handleExistingHook();
  
  // Create the dynamic pre-push hook
  const hookContent = createDynamicPrePushHook();
  fs.writeFileSync(DEST_HOOK, hookContent);
  fs.chmodSync(DEST_HOOK, 0o755);
  
  // Configure Git to use the template directory
  try {
    execSync(`git config --global init.templateDir ${GIT_TEMPLATE_DIR}`);
  } catch (e) {
    console.error(chalk.red('❌ Failed to configure Git template directory.'));
    console.error(chalk.yellow('You may need to run this command manually:'));
    console.error(chalk.blue(`git config --global init.templateDir ${GIT_TEMPLATE_DIR}`));
    process.exit(1);
  }

  console.log(chalk.green('✅ NoLeak Guardian installed globally!'));
  console.log(chalk.blue('🔐 All new Git repos will now have secret protection. 💥'));
  console.log(chalk.yellow('💡 Note: This only applies to new repositories.'));
  console.log(chalk.yellow('   For existing repos, you may need to manually copy the hook.'));
  console.log(chalk.cyan('🐛 To debug issues, run: DEBUG=true git push'));
}

installGlobalHook();
