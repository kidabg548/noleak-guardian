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
const SOURCE_HOOK = path.join(__dirname, '../hooks/pre-push');
const DEST_HOOK = path.join(HOOKS_DIR, 'pre-push');

function installGlobalHook() {
  fs.mkdirSync(HOOKS_DIR, { recursive: true });
  fs.copyFileSync(SOURCE_HOOK, DEST_HOOK);
  fs.chmodSync(DEST_HOOK, 0o755);
  execSync(`git config --global init.templateDir ${GIT_TEMPLATE_DIR}`);

  console.log(chalk.green('✅ NoLeak Guardian installed globally!'));
  console.log(chalk.blue('🔐 All new Git repos will now have secret protection. 💥'));
}

installGlobalHook();
