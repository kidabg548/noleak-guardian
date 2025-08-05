#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// Enhanced patterns for secret files
const SECRET_PATTERNS = [
  /(^|.*\/)\.env($|(\.|$))/,           
  /(^|.*\/)\.envrc$/,                  
  /(^|.*\/)\.secrets?$/i,             
  /(^|.*\/)secrets?\.(json|yaml|yml|toml)$/i, 
  /(^|.*\/)config\.(json|yaml|yml|toml)$/i,    
  /(^|.*\/)\.(pem|key|p12|pfx)$/,     
  /(^|.*\/)id_rsa$/,                  
  /(^|.*\/)\.aws\/credentials$/,      
  /(^|.*\/)\.dockerignore$/,          
  /(^|.*\/)\.gitignore$/,              
];

// Files that are commonly safe to ignore
const SAFE_FILES = [
  /(^|.*\/)\.env\.example$/,
  /(^|.*\/)\.env\.template$/,
  /(^|.*\/)\.env\.sample$/,
  /(^|.*\/)\.env\.local\.example$/,
  /(^|.*\/)config\.example\.(json|yaml|yml|toml)$/i,
  /(^|.*\/)secrets\.example\.(json|yaml|yml|toml)$/i,
];

function isSecretFile(filename) {
  // Check if it's a safe example file first
  if (SAFE_FILES.some(pattern => pattern.test(filename))) {
    return false;
  }
  
  // Check if it matches any secret pattern
  return SECRET_PATTERNS.some(pattern => pattern.test(filename));
}

function checkGitRepository() {
  try {
    execSync('git rev-parse --git-dir', { stdio: 'ignore' });
  } catch (e) {
    console.error("❌ Not a Git repository. Run this from a Git repository root.");
    process.exit(1);
  }
}

function getStagedFiles() {
  try {
    const changedFiles = execSync("git diff --cached --name-only").toString();
    return changedFiles.trim().split("\n").filter(f => f.length > 0);
  } catch (e) {
    console.error("❌ Failed to get staged files. Make sure you have staged changes.");
    process.exit(1);
  }
}

function getTrackedFiles() {
  try {
    const trackedFiles = execSync("git ls-files").toString();
    return trackedFiles.trim().split("\n").filter(f => f.length > 0);
  } catch (e) {
    console.error("❌ Failed to get tracked files.");
    process.exit(1);
  }
}

function checkFileContent(filename) {
  try {
    if (!fs.existsSync(filename)) return false;
    
    const content = fs.readFileSync(filename, 'utf8');
    const lines = content.split('\n');
    
    // Check for common secret patterns in file content
    const secretPatterns = [
      /password\s*=/i,
      /secret\s*=/i,
      /key\s*=/i,
      /token\s*=/i,
      /api_key\s*=/i,
      /private_key\s*=/i,
      /aws_access_key_id\s*=/i,
      /aws_secret_access_key\s*=/i,
      /database_url\s*=/i,
      /connection_string\s*=/i,
    ];
    
    return lines.some(line => 
      secretPatterns.some(pattern => pattern.test(line))
    );
  } catch (e) {
    // If we can't read the file, assume it might contain secrets
    return true;
  }
}

function main() {
  // Check if we're in a Git repository
  checkGitRepository();
  
  let hasSecrets = false;
  const foundSecrets = [];
  
  // Check staged files
  const stagedFiles = getStagedFiles();
  const stagedSecrets = stagedFiles.filter(f => isSecretFile(f));
  
  if (stagedSecrets.length > 0) {
    hasSecrets = true;
    foundSecrets.push(...stagedSecrets.map(f => ({ file: f, type: 'staged' })));
  }
  
  // Check tracked files
  const trackedFiles = getTrackedFiles();
  const trackedSecrets = trackedFiles.filter(f => isSecretFile(f));
  
  if (trackedSecrets.length > 0) {
    hasSecrets = true;
    foundSecrets.push(...trackedSecrets.map(f => ({ file: f, type: 'tracked' })));
  }
  
  // Check file contents for suspicious patterns
  const allFiles = [...stagedFiles, ...trackedFiles];
  const suspiciousFiles = allFiles.filter(f => {
    if (!isSecretFile(f)) return false;
    return checkFileContent(f);
  });
  
  if (suspiciousFiles.length > 0) {
    hasSecrets = true;
    foundSecrets.push(...suspiciousFiles.map(f => ({ file: f, type: 'suspicious_content' })));
  }
  
  if (hasSecrets) {
    console.error("\x1b[31m🚨 SECURITY WARNING: Potential secrets detected! Push blocked by Michu.\x1b[0m");
    console.error("");
    
    const staged = foundSecrets.filter(s => s.type === 'staged');
    const tracked = foundSecrets.filter(s => s.type === 'tracked');
    const suspicious = foundSecrets.filter(s => s.type === 'suspicious_content');
    
    if (staged.length > 0) {
      console.error("🔍 Staged files with potential secrets:");
      staged.forEach(s => console.error(`  - ${s.file}`));
      console.error("");
    }
    
    if (tracked.length > 0) {
      console.error("🔍 Already tracked files with potential secrets:");
      tracked.forEach(s => console.error(`  - ${s.file}`));
      console.error("");
    }
    
    if (suspicious.length > 0) {
      console.error("🔍 Files with suspicious content patterns:");
      suspicious.forEach(s => console.error(`  - ${s.file}`));
      console.error("");
    }
    
    console.error("💡 To fix this:");
    console.error("   1. Remove secrets from tracked files: git rm --cached <file>");
    console.error("   2. Add files to .gitignore");
    console.error("   3. Use environment variables instead of hardcoded secrets");
    console.error("   4. Consider using git-secrets or similar tools");
    
    process.exit(1);
  }
  
  console.log("✅ No potential secrets detected. Push allowed.");
  process.exit(0);
}

// Run the main function
main();
