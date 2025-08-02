#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');
const chalk = require('chalk');

const GIT_TEMPLATE_DIR = path.join(os.homedir(), '.git-templates');
const HOOKS_DIR = path.join(GIT_TEMPLATE_DIR, 'hooks');
const SOURCE_HOOK = path.join(__dirname, '../hooks/pre-push');
const DEST_HOOK = path.join(HOOKS_DIR, 'pre-push');

function installGlobalHook() {
  // Ensure hooks dir exists
  fs.mkdirSync(HOOKS_DIR, { recursive: true });

  // Copy pre-push hook
  fs.copyFileSync(SOURCE_HOOK, DEST_HOOK);
  fs.chmodSync(DEST_HOOK, 0o755);

  // Set global template dir
  execSync(`git config --global init.templateDir ${GIT_TEMPLATE_DIR}`);

  console.log(chalk.green('✅ NoLeak Guardian installed globally!'));
  console.log(chalk.blue('🔐 All new Git repos will now have secret protection. 💥'));
}

installGlobalHook();
