#!/usr/bin/env node

import { execSync } from 'child_process';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { loadConfig, createDefaultConfig, getConfigPath } from '../lib/config.js';
import fs from 'fs';
import os from 'os';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function showHelp() {
  console.log(chalk.blue('🔐 Michu - NoLeak Guardian'));
  console.log('');
  console.log(chalk.white('Usage: michu <command> [options]'));
  console.log('');
  console.log(chalk.yellow('Commands:'));
  console.log('  install     Install the global pre-push hook (default)');
  console.log('  uninstall   Remove the global pre-push hook');
  console.log('  config      Show or edit configuration');
  console.log('  test        Test secret detection on current repository');
  console.log('  status      Check installation status');
  console.log('  help        Show this help message');
  console.log('');
  console.log(chalk.yellow('Examples:'));
  console.log('  michu                    # Install the hook');
  console.log('  michu install            # Same as above');
  console.log('  michu uninstall          # Remove the hook');
  console.log('  michu config             # Show current config');
  console.log('  michu test               # Test detection');
  console.log('');
  console.log(chalk.cyan('For more information: https://github.com/your-repo/michu'));
}

function installHook() {
  // Import and run the install script
  const installScript = path.join(__dirname, 'install.js');
  import(installScript);
}

function uninstallHook() {
  const GIT_TEMPLATE_DIR = path.join(os.homedir(), '.git-templates');
  const HOOKS_DIR = path.join(GIT_TEMPLATE_DIR, 'hooks');
  const DEST_HOOK = path.join(HOOKS_DIR, 'pre-push');
  
  try {
    // Remove the hook file
    if (fs.existsSync(DEST_HOOK)) {
      fs.unlinkSync(DEST_HOOK);
      console.log(chalk.green('✅ Removed pre-push hook'));
    }
    
    // Remove the template directory if empty
    if (fs.existsSync(HOOKS_DIR) && fs.readdirSync(HOOKS_DIR).length === 0) {
      fs.rmdirSync(HOOKS_DIR);
    }
    
    if (fs.existsSync(GIT_TEMPLATE_DIR) && fs.readdirSync(GIT_TEMPLATE_DIR).length === 0) {
      fs.rmdirSync(GIT_TEMPLATE_DIR);
    }
    
    // Unset the Git config
    try {
      execSync('git config --global --unset init.templateDir');
      console.log(chalk.green('✅ Removed Git template configuration'));
    } catch (e) {
      // Config might not exist, that's okay
    }
    
    console.log(chalk.green('✅ Michu uninstalled successfully!'));
  } catch (e) {
    console.error(chalk.red('❌ Failed to uninstall:', e.message));
    process.exit(1);
  }
}

function showConfig() {
  const config = loadConfig();
  console.log(chalk.blue('📋 Current Configuration:'));
  console.log(chalk.cyan('Config file:'), getConfigPath());
  console.log('');
  console.log(chalk.yellow('Secret patterns:'));
  config.secretPatterns.forEach(pattern => console.log(`  - ${pattern}`));
  console.log('');
  console.log(chalk.yellow('Safe patterns:'));
  config.safePatterns.forEach(pattern => console.log(`  - ${pattern}`));
  console.log('');
  console.log(chalk.yellow('Settings:'));
  Object.entries(config.settings).forEach(([key, value]) => {
    console.log(`  - ${key}: ${value}`);
  });
  console.log('');
  console.log(chalk.cyan('💡 To edit config, open:'), getConfigPath());
}

function testDetection() {
  console.log(chalk.blue('🧪 Testing secret detection...'));
  console.log('');
  
  // Import and run the checkSecrets script
  const checkScript = path.join(__dirname, '../lib/checkSecrets.js');
  import(checkScript);
}

function showStatus() {
  const GIT_TEMPLATE_DIR = path.join(os.homedir(), '.git-templates');
  const HOOKS_DIR = path.join(GIT_TEMPLATE_DIR, 'hooks');
  const DEST_HOOK = path.join(HOOKS_DIR, 'pre-push');
  
  console.log(chalk.blue('📊 Installation Status:'));
  console.log('');
  
  // Check if hook exists
  const hookExists = fs.existsSync(DEST_HOOK);
  console.log(chalk.yellow('Pre-push hook:'), hookExists ? chalk.green('✅ Installed') : chalk.red('❌ Not installed'));
  
  // Check Git config
  try {
    const templateDir = execSync('git config --global init.templateDir', { encoding: 'utf8' }).trim();
    console.log(chalk.yellow('Git template dir:'), chalk.green(`✅ ${templateDir}`));
  } catch (e) {
    console.log(chalk.yellow('Git template dir:'), chalk.red('❌ Not configured'));
  }
  
  // Check config file
  const configExists = fs.existsSync(getConfigPath());
  console.log(chalk.yellow('Config file:'), configExists ? chalk.green('✅ Exists') : chalk.yellow('⚠️  Using defaults'));
  
  console.log('');
  
  if (hookExists) {
    console.log(chalk.green('🎉 Michu is properly installed!'));
    console.log(chalk.cyan('New Git repositories will automatically have secret protection.'));
  } else {
    console.log(chalk.yellow('⚠️  Michu is not installed.'));
    console.log(chalk.cyan('Run "michu install" to set it up.'));
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'install';
  
  switch (command) {
    case 'install':
    case 'i':
      installHook();
      break;
      
    case 'uninstall':
    case 'u':
      await uninstallHook();
      break;
      
    case 'config':
    case 'c':
      showConfig();
      break;
      
    case 'test':
    case 't':
      testDetection();
      break;
      
    case 'status':
    case 's':
      await showStatus();
      break;
      
    case 'help':
    case 'h':
    case '--help':
    case '-h':
      showHelp();
      break;
      
    default:
      console.error(chalk.red(`❌ Unknown command: ${command}`));
      console.log('');
      showHelp();
      process.exit(1);
  }
}

// Create default config if it doesn't exist
createDefaultConfig();

// Run the main function
main().catch(e => {
  console.error(chalk.red('❌ Error:', e.message));
  process.exit(1);
}); 